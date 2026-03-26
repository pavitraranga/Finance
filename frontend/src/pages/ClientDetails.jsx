import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../api';
import '../index.css';

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [summary, setSummary] = useState(null);
  const [entries, setEntries] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    paid_principal: '',
    paid_interest: '',
    adjustment: '',
    payment_method: 'Cash',
    entry_date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      const sumRes = await api.get(`/entries/summary/${id}`);
      setSummary(sumRes.data);
      const entRes = await api.get(`/entries/${id}`);
      setEntries(entRes.data);
    } catch (err) {
      console.error('Failed to fetch client data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/entries', {
        client_id: id,
        ...formData
      });
      setFormData({
        paid_principal: '',
        paid_interest: '',
        adjustment: '',
        payment_method: 'Cash',
        entry_date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (err) {
      console.error('Failed to add entry', err);
      alert('Failed to add entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    if (!summary) return alert('No data to export');

    const wb = XLSX.utils.book_new();
    
    // Header Info
    const wsData = [
      ['Client Data Export', `Client ID: ${id}`],
      [],
      ['Principal Settings'],
      ['Total Principal', summary.principal],
      ['Interest Rate', `${summary.interestRate}%`],
      ['Total Interest Calculated', summary.calcInterestAmount],
      [],
      ['Remaining Balances'],
      ['Remaining Principal', summary.remainingPrincipal],
      ['Remaining Interest', summary.remainingInterest],
      [],
      ['Transaction History'],
      ['Date', 'Paid Principal', 'Paid Interest', 'Adjustment', 'Payment Method']
    ];

    entries.forEach(e => {
      wsData.push([
        new Date(e.entry_date).toLocaleDateString(),
        Number(e.paid_principal) || 0,
        Number(e.paid_interest) || 0,
        Number(e.adjustment) || 0,
        e.payment_method
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Client Statement');
    XLSX.writeFile(wb, `Client_${id}_Financial_Statement.xlsx`);
  };

  if (!summary) return <div className="container" style={{ textAlign: 'center', marginTop: '3rem' }}>Loading Financial Data...</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', borderBottom: '1px solid var(--panel-border)', marginBottom: '2rem' }}>
        <div>
          <button className="btn-secondary" style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Client Finance</h1>
          <p style={{ color: 'var(--text-muted)' }}>Financial summary and transactions for Client #{id}</p>
        </div>
        <button className="btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📊</span> Export to Excel
        </button>
      </header>

      {/* Top Summary Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-1)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Principal</p>
          <h2 style={{ fontSize: '2rem' }}>₹{summary.principal}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-2)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Interest Rate & Amount</p>
          <h2 style={{ fontSize: '1.5rem' }}>{summary.interestRate}% <span style={{ color: 'var(--text-muted)', fontSize: '1.25rem', fontWeight: '400' }}>(₹{summary.calcInterestAmount})</span></h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${summary.remainingPrincipal <= 0 ? '#10b981' : '#ef4444'}` }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Remaining Principal</p>
          <h2 style={{ fontSize: '2rem', color: summary.remainingPrincipal <= 0 ? '#10b981' : 'inherit' }}>₹{summary.remainingPrincipal}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${summary.remainingInterest <= 0 ? '#10b981' : '#f59e0b'}` }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Remaining Interest</p>
          <h2 style={{ fontSize: '2rem', color: summary.remainingInterest <= 0 ? '#10b981' : 'inherit' }}>₹{summary.remainingInterest}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
        {/* Entry Form */}
        <div className="glass-panel" style={{ position: 'sticky', top: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--panel-border)' }}>Add New Entry</h3>
          <form onSubmit={handleAddEntry}>
            <div className="input-group">
              <label>Entry Date *</label>
              <input 
                type="date" 
                value={formData.entry_date}
                onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
                required
              />
            </div>
            
            <div className="input-group">
              <label>Paid Principal (₹)</label>
              <input 
                type="number" 
                step="0.01" 
                value={formData.paid_principal}
                onChange={(e) => setFormData({...formData, paid_principal: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div className="input-group">
              <label>Paid Interest (₹)</label>
              <input 
                type="number" 
                step="0.01" 
                value={formData.paid_interest}
                onChange={(e) => setFormData({...formData, paid_interest: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div className="input-group">
              <label>Adjustment (₹)</label>
              <input 
                type="number" 
                step="0.01" 
                value={formData.adjustment}
                onChange={(e) => setFormData({...formData, adjustment: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div className="input-group">
              <label>Payment Method *</label>
              <select 
                value={formData.payment_method}
                onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                style={{ 
                  background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--panel-border)', borderRadius: '8px', 
                  padding: '0.875rem 1rem', color: 'var(--text-main)', fontFamily: 'var(--font-body)', fontSize: '1rem' 
                }}
                required
              >
                <option value="Cash" style={{ color: '#000' }}>Cash</option>
                <option value="UPI" style={{ color: '#000' }}>UPI</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Add Entry'}
            </button>
          </form>
        </div>

        {/* Transactions Table */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Transaction History</h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Principal</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Interest</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Adjustment</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Method</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found for this client.</td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>{new Date(entry.entry_date).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem 1.5rem', color: entry.paid_principal > 0 ? '#10b981' : 'inherit' }}>
                        {entry.paid_principal > 0 ? `+ ₹${entry.paid_principal}` : '-'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: entry.paid_interest > 0 ? 'var(--accent-1)' : 'inherit' }}>
                        {entry.paid_interest > 0 ? `+ ₹${entry.paid_interest}` : '-'}
                      </td>
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
    </div>
  );
}
