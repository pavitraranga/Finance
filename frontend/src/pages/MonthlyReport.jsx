import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../api';
import '../index.css';

export default function MonthlyReport() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [clientData, setClientData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all agents for the dropdown
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await api.get('/agents');
        setAgents(res.data);
      } catch (err) {
        console.error('Failed to fetch agents', err);
      }
    };
    fetchAgents();
  }, []);

  // Fetch client analytics when agent is selected
  useEffect(() => {
    if (!selectedAgentId) {
      setClientData([]);
      return;
    }
    
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/monthly-profit/${selectedAgentId}`);
        
        // Compute additional client-side models
        const computedData = res.data.map(client => {
          const principal = Number(client.principal_amount) || 0;
          const interestRate = Number(client.interest_rate) || 0;
          
          // Total Months
          const issue = new Date(client.issue_date);
          const now = new Date();
          let months = (now.getFullYear() - issue.getFullYear()) * 12;
          months -= issue.getMonth();
          months += now.getMonth();
          // Minimum threshold is 1 month
          const totalMonths = months <= 0 ? 1 : months;

          const monthlyInterest = (principal * interestRate) / 100;
          const totalInterest = monthlyInterest * totalMonths;
          const totalPaid = Number(client.total_paid) || 0;
          const remainingBalance = totalInterest - totalPaid;

          return {
            ...client,
            total_months: totalMonths,
            monthly_interest: monthlyInterest,
            total_interest: totalInterest,
            total_paid: totalPaid,
            remaining_balance: remainingBalance
          };
        });

        setClientData(computedData);
      } catch (err) {
        console.error('Failed to fetch monthly report', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [selectedAgentId]);

  const globalTotalMonthlyInterest = clientData.reduce((acc, curr) => acc + curr.monthly_interest, 0);
  const selectedAgentName = agents.find(a => a.id.toString() === selectedAgentId.toString())?.name || 'Selected Agent';

  const handleExport = () => {
    if (clientData.length === 0) return alert('No records to export');

    const wb = XLSX.utils.book_new();
    
    // Header Info
    const wsData = [
      ['Monthly Financial Report', `Agent: ${selectedAgentName}`],
      [],
      ['Total Cumulative Monthly Profit (Interest)', globalTotalMonthlyInterest],
      [],
      [
        'Client Name', 'Page', 'Issue Date', 'Last Active', 
        'Principal', 'Interest Rate (%)', 'Monthly Interest', 
        'Total Months', 'Total Interest', 'Total Paid', 'Pending Balance'
      ]
    ];

    clientData.forEach(c => {
      wsData.push([
        c.client_name,
        c.page_no || 'N/A',
        new Date(c.issue_date).toLocaleDateString(),
        c.last_entry_date ? new Date(c.last_entry_date).toLocaleDateString() : 'No Entry',
        c.principal_amount,
        c.interest_rate,
        c.monthly_interest,
        c.total_months,
        c.total_interest,
        c.total_paid,
        c.remaining_balance
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Profit');
    XLSX.writeFile(wb, `Agent_${selectedAgentName}_Analytics.xlsx`);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '5rem', maxWidth: '1400px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', borderBottom: '1px solid var(--panel-border)', marginBottom: '2rem' }}>
        <div>
          <button className="btn-secondary" style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }} onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Monthly Analytics</h1>
          <p style={{ color: 'var(--text-muted)' }}>Financial breakdowns mapped per client mapped by Agent</p>
        </div>
        <button className="btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📊</span> Export to Excel
        </button>
      </header>

      {/* Controller Area */}
      <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>Select Agent Framework</label>
          <select 
            value={selectedAgentId} 
            onChange={(e) => setSelectedAgentId(e.target.value)}
            style={{ 
              width: '100%', maxWidth: '400px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', 
              color: 'var(--text-main)', padding: '0.875rem', borderRadius: '8px', fontSize: '1rem', outline: 'none'
            }}
          >
            <option value="" style={{ color: '#000' }}>-- Choose an Agent --</option>
            {agents.map(a => (
              <option key={a.id} value={a.id} style={{ color: '#000' }}>{a.name}</option>
            ))}
          </select>
        </div>

        {selectedAgentId && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Generated Monthly Profit</p>
            <h2 style={{ fontSize: '2rem', color: 'var(--accent-1)' }}>₹{globalTotalMonthlyInterest.toFixed(2)}</h2>
          </div>
        )}
      </div>

      {/* Analytics Matrix */}
      {selectedAgentId && (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Rendering analytics...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <tr>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', borderBottom: '1px solid var(--panel-border)' }}>Client / Page</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', borderBottom: '1px solid var(--panel-border)' }}>Issue Date</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', borderBottom: '1px solid var(--panel-border)' }}>Last Active</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', borderBottom: '1px solid var(--panel-border)' }}>Principal / Rate</th>
                    <th style={{ padding: '1rem', color: 'var(--accent-1)', fontSize: '0.875rem', borderBottom: '1px solid var(--panel-border)' }}>Monthly Interest</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', borderBottom: '1px solid var(--panel-border)' }}>Total Interest<br/><span style={{ fontSize: '10px', fontWeight: '400' }}>(Monthly Rate × Months)</span></th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', borderBottom: '1px solid var(--panel-border)' }}>Total Paid</th>
                    <th style={{ padding: '1rem', color: 'var(--text-main)', fontSize: '0.875rem', borderBottom: '1px solid var(--panel-border)' }}>Pending Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No clients mapped to this agent.</td>
                    </tr>
                  ) : (
                    clientData.map(c => (
                      <tr key={c.client_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{c.client_name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.page_no || 'No Page'}</div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{new Date(c.issue_date).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{c.last_entry_date ? new Date(c.last_entry_date).toLocaleDateString() : 'N/A'}</td>
                        <td style={{ padding: '1rem' }}>
                          <div>₹{Number(c.principal_amount).toFixed(2) || '0.00'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--accent-2)' }}>{c.interest_rate}% per month</div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--accent-1)' }}>₹{c.monthly_interest.toFixed(2)}</td>
                        <td style={{ padding: '1rem' }}>
                          <div>₹{c.total_interest.toFixed(2)}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.total_months} Months passed</div>
                        </td>
                        <td style={{ padding: '1rem', color: c.total_paid > 0 ? '#10b981' : 'inherit' }}>₹{c.total_paid.toFixed(2)}</td>
                        {/* Highlighting high pending balances explicitly */}
                        <td style={{ padding: '1rem', fontWeight: '600', color: c.remaining_balance > (Number(c.principal_amount) * 2) ? '#ef4444' : '#f59e0b' }}>
                          ₹{c.remaining_balance.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
