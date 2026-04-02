import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../index.css';

export default function GlobalClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  
  const systemType = localStorage.getItem('systemType') || 'monthly';
  const isEmi = systemType === 'emi';

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentClientId, setCurrentClientId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    page_no: '',
    principal_amount: '',
    interest_rate: '',
    tenure_months: '1'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await api.get('/all-clients');
      setClients(res.data);
    } catch (err) {
      console.error('Failed to fetch clients', err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setCurrentClientId(null);
    setFormData({ name: '', phone: '', page_no: '', principal_amount: '', interest_rate: '', tenure_months: '1' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    setIsEditMode(true);
    setCurrentClientId(client.id);
    setFormData({
      name: client.name || '',
      phone: client.phone || '',
      page_no: client.page_no || '',
      principal_amount: client.principal_amount || '',
      interest_rate: client.interest_rate || '',
      tenure_months: client.tenure_months || '1'
    });
    setIsModalOpen(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await api.delete(`/clients/${clientId}`);
      fetchClients();
    } catch (err) {
      console.error('Failed to delete client', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);

    try {
      // Create Payload without agent_id
      const payload = new FormData();
      payload.append('name', formData.name);
      if (formData.phone) payload.append('phone', formData.phone);
      if (formData.page_no) payload.append('page_no', formData.page_no);
      if (formData.principal_amount) payload.append('principal_amount', formData.principal_amount);
      if (formData.interest_rate) payload.append('interest_rate', formData.interest_rate);
      if (formData.tenure_months) payload.append('tenure_months', formData.tenure_months);

      if (isEditMode) {
        await api.put(`/clients/${currentClientId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/clients', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      console.error('Failed to save client', err);
      alert('Failed to save client.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search))
  );

  const calculateLiveEmi = () => {
    const p = Number(formData.principal_amount);
    const r = Number(formData.interest_rate);
    const m = Number(formData.tenure_months);
    if (!p || !r || !m) return 0;
    const totalInt = (p * r) / 100 * m;
    return ((p + totalInt) / m).toFixed(2);
  };

  return (
    <div className="container animate-fade-in relative container-wrapper" style={{ paddingBottom: '5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', borderBottom: '1px solid var(--panel-border)', marginBottom: '2rem' }}>
        <div>
          <button className="btn-secondary" style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }} onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Clients Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage all direct clients globally</p>
        </div>
        <button className="btn-primary" onClick={handleOpenCreate}>
          + Create Client
        </button>
      </header>

      {/* Search Bar */}
      <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div className="input-group" style={{ marginBottom: '0' }}>
          <input 
            type="text" 
            placeholder="Search clients by name or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '1rem', fontSize: '1.1rem' }}
          />
        </div>
      </div>

      {/* Client List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filteredClients.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No clients found. Click "Create Client" to add one.
          </div>
        ) : (
          filteredClients.map(client => (
            <div key={client.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', flexShrink: 0 }}>
                  👤
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{client.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>📞 {client.phone || 'N/A'}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>📄 Page: {client.page_no || 'N/A'}</p>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: isEmi ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Loan Amt</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-main)' }}>₹{client.principal_amount || '0'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rate/Mo</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--accent-1)' }}>{client.interest_rate || '0'}%</p>
                </div>
                {isEmi && (
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tenure</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#f59e0b' }}>{client.tenure_months || 1} Mo</p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => navigate(`/client/${client.id}`)}>Open</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleOpenEdit(client)}>Edit</button>
                <button className="btn-danger" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleDeleteClient(client.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.75rem' }}>{isEditMode ? 'Edit Client' : 'Add New Client'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
              >×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Client Name *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="John Doe" />
              </div>
              
              <div className="input-group">
                <label>Phone Number</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 890" />
              </div>
              
              <div className="input-group">
                <label>Page Number</label>
                <input type="text" value={formData.page_no} onChange={e => setFormData({...formData, page_no: e.target.value})} placeholder="P-142A" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Principal Amount (₹)</label>
                  <input type="number" step="0.01" value={formData.principal_amount} onChange={e => setFormData({...formData, principal_amount: e.target.value})} placeholder="10000" />
                </div>
                
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Interest Rate (%)</label>
                  <input type="number" step="0.01" value={formData.interest_rate} onChange={e => setFormData({...formData, interest_rate: e.target.value})} placeholder="3" />
                </div>

                {isEmi && (
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Tenure (Months)</label>
                    <input type="number" step="1" value={formData.tenure_months} onChange={e => setFormData({...formData, tenure_months: e.target.value})} placeholder="10" />
                  </div>
                )}
              </div>
              
              {isEmi && (
                <div style={{ padding: '1rem', background: 'rgba(37, 99, 235, 0.1)', border: '1px solid var(--accent-1)', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Calculated Monthly EMI</p>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-1)' }}>₹{calculateLiveEmi()}</h3>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Client' : 'Create Client')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
