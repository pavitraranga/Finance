import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../api';
import '../index.css';

export default function ProfitList() {
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState('date'); // 'date' or 'month'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [month, setMonth] = useState('');

  const [data, setData] = useState({
    summary: { total_principal: 0, total_interest: 0, total_adjustment: 0 },
    transactions: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const systemType = localStorage.getItem('systemType') || 'monthly';
  const isEmi = systemType === 'emi';
  const isGold = systemType === 'gold';

  const fetchProfitData = async () => {
    setIsLoading(true);
    try {
      let url = '/profit?';
      if (filterType === 'date' && startDate && endDate) {
        url += `startDate=${startDate}&endDate=${endDate}`;
      } else if (filterType === 'month' && month) {
        url += `month=${month}`;
      }
      
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch profit data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch for everything (no filters defaults to all)
    fetchProfitData();
  }, []);

  const handleExport = () => {
    const { summary, transactions } = data;
    if (transactions.length === 0) return alert('No records to export');

    const wb = XLSX.utils.book_new();
    
    const wsData = [
      ['Global Profit Statement', `Filter: ${filterType === 'date' ? `${startDate || 'Start'} to ${endDate || 'End'}` : month || 'All Time'}`],
      [],
      ['Summary'],
      [isEmi ? 'Total EMI Collected' : 'Total Principal Received', summary.total_principal],
      [!isEmi ? 'Total Interest Received' : '', !isEmi ? summary.total_interest : ''],
      [isEmi ? 'Total Penalties' : 'Total Adjustment', summary.total_adjustment],
      [],
      ['Transaction Details'],
      isEmi 
        ? ['Date', 'Client Name', 'EMI Amount Paid', 'Penalty', 'Payment Method']
        : (isGold 
            ? ['Date', 'Client Name', 'Agent Name', 'Paid Principal', 'Paid Interest', 'Adjustment', 'Payment Method']
            : ['Date', 'Client Name', 'Paid Principal', 'Paid Interest', 'Adjustment', 'Payment Method'])
    ];

    transactions.forEach(t => {
      if (isEmi) {
        wsData.push([
          new Date(t.entry_date).toLocaleDateString(),
          t.client_name,
          Number(t.paid_principal) || 0,
          Number(t.adjustment) || 0,
          t.payment_method
        ]);
      } else if (isGold) {
        wsData.push([
          new Date(t.entry_date).toLocaleDateString(),
          t.client_name,
          t.agent_name,
          Number(t.paid_principal) || 0,
          Number(t.paid_interest) || 0,
          Number(t.adjustment) || 0,
          t.payment_method
        ]);
      } else {
        wsData.push([
          new Date(t.entry_date).toLocaleDateString(),
          t.client_name,
          Number(t.paid_principal) || 0,
          Number(t.paid_interest) || 0,
          Number(t.adjustment) || 0,
          t.payment_method
        ]);
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Profit List');
    XLSX.writeFile(wb, `Profit_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', borderBottom: '1px solid var(--panel-border)', marginBottom: '2rem' }}>
        <div>
          <button className="btn-secondary" style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }} onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Profit List</h1>
          <p style={{ color: 'var(--text-muted)' }}>Unified transaction reporting and filtered summaries</p>
        </div>
        <button className="btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📊</span> Export to Excel
        </button>
      </header>

      {/* Filter Section */}
      <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Filter Controls</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px' }}>
            <button 
              type="button" 
              className={filterType === 'date' ? 'btn-primary' : ''} 
              style={{ padding: '0.5rem 1rem', border: 'none', background: filterType === 'date' ? 'var(--accent-gradient)' : 'transparent', color: 'var(--text-main)', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => { setFilterType('date'); setMonth(''); }}
            >
              Date Range
            </button>
            <button 
              type="button" 
              className={filterType === 'month' ? 'btn-primary' : ''} 
              style={{ padding: '0.5rem 1rem', border: 'none', background: filterType === 'month' ? 'var(--accent-gradient)' : 'transparent', color: 'var(--text-main)', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => { setFilterType('month'); setStartDate(''); setEndDate(''); }}
            >
              Month Wise
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', gap: '1rem' }}>
            {filterType === 'date' && (
              <>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>End Date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </>
            )}

            {filterType === 'month' && (
              <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Select Month</label>
                  <select 
                    value={month ? month.split('-')[1] : ''} 
                    onChange={e => {
                      const y = month ? month.split('-')[0] : new Date().getFullYear();
                      setMonth(`${y}-${e.target.value}`);
                    }}
                    style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '0.875rem 1rem', color: 'var(--text-main)', width: '100%', fontFamily: 'var(--font-body)' }}
                  >
                    <option value="" disabled style={{ color: '#000' }}>Month</option>
                    <option value="01" style={{ color: '#000' }}>January</option>
                    <option value="02" style={{ color: '#000' }}>February</option>
                    <option value="03" style={{ color: '#000' }}>March</option>
                    <option value="04" style={{ color: '#000' }}>April</option>
                    <option value="05" style={{ color: '#000' }}>May</option>
                    <option value="06" style={{ color: '#000' }}>June</option>
                    <option value="07" style={{ color: '#000' }}>July</option>
                    <option value="08" style={{ color: '#000' }}>August</option>
                    <option value="09" style={{ color: '#000' }}>September</option>
                    <option value="10" style={{ color: '#000' }}>October</option>
                    <option value="11" style={{ color: '#000' }}>November</option>
                    <option value="12" style={{ color: '#000' }}>December</option>
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Select Year</label>
                  <select 
                    value={month ? month.split('-')[0] : ''} 
                    onChange={e => {
                      const m = month ? month.split('-')[1] : String(new Date().getMonth() + 1).padStart(2, '0');
                      setMonth(`${e.target.value}-${m}`);
                    }}
                    style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '0.875rem 1rem', color: 'var(--text-main)', width: '100%', fontFamily: 'var(--font-body)' }}
                  >
                    <option value="" disabled style={{ color: '#000' }}>Year</option>
                    {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                      <option key={year} value={year} style={{ color: '#000' }}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <button className="btn-primary" onClick={fetchProfitData} disabled={isLoading} style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
              {isLoading ? 'Filtering...' : 'Apply Filter'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-1)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{isEmi ? 'Total EMI Collected' : 'Total Principal Received'}</p>
          <h2 style={{ fontSize: '2rem' }}>₹{data.summary.total_principal.toFixed(2)}</h2>
        </div>
        {!isEmi && (
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Interest Received</p>
            <h2 style={{ fontSize: '2rem', color: '#10b981' }}>₹{data.summary.total_interest.toFixed(2)}</h2>
          </div>
        )}
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{isEmi ? 'Total Penalties' : 'Total Adjustments'}</p>
          <h2 style={{ fontSize: '2rem', color: '#f59e0b' }}>₹{data.summary.total_adjustment.toFixed(2)}</h2>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Filtered Transactions</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Client Name</th>
                {isGold && <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Agent Name</th>}
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>{isEmi ? 'Amount Paid' : 'Received Principal'}</th>
                {!isEmi && <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Received Interest</th>}
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>{isEmi ? 'Penalty' : 'Adjustment'}</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Method</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.length === 0 ? (
                <tr>
                  <td colSpan={isEmi ? "5" : (isGold ? "7" : "6")} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found for the given filter.</td>
                </tr>
              ) : (
                data.transactions.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>{new Date(entry.entry_date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>{entry.client_name}</td>
                    {isGold && <td style={{ padding: '1rem 1.5rem' }}>{entry.agent_name}</td>}
                    <td style={{ padding: '1rem 1.5rem', color: entry.paid_principal > 0 ? '#10b981' : 'inherit' }}>
                      {entry.paid_principal > 0 ? `+ ₹${entry.paid_principal}` : '-'}
                    </td>
                    {!isEmi && <td style={{ padding: '1rem 1.5rem', color: entry.paid_interest > 0 ? 'var(--accent-1)' : 'inherit' }}>
                      {entry.paid_interest > 0 ? `+ ₹${entry.paid_interest}` : '-'}
                    </td>}
                    <td style={{ padding: '1rem 1.5rem', color: entry.adjustment != 0 ? '#f59e0b' : 'inherit' }}>
                      {entry.adjustment != 0 ? `₹${entry.adjustment}` : '-'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ background: entry.payment_method === 'UPI' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: entry.payment_method === 'UPI' ? 'var(--accent-1)' : '#10b981', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500', textTransform: 'uppercase' }}>
                        {entry.payment_method}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
