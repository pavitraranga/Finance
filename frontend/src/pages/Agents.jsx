import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../index.css';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [newAgentName, setNewAgentName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const fetchAgents = async (searchQuery = '') => {
    try {
      const res = await api.get(`/agents${searchQuery ? `?search=${searchQuery}` : ''}`);
      setAgents(res.data);
    } catch (err) {
      console.error('Failed to fetch agents', err);
    }
  };

  useEffect(() => {
    // Implement debounce for search
    const delayDebounceFn = setTimeout(() => {
      fetchAgents(search);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    if (!newAgentName) return;

    try {
      setIsCreating(true);
      await api.post('/agents', { name: newAgentName });
      setNewAgentName('');
      fetchAgents(search);
    } catch (err) {
      console.error('Failed to create agent', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAgent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      await api.delete(`/agents/${id}`);
      fetchAgents(search);
    } catch (err) {
      console.error('Failed to delete agent', err);
    }
  };

  return (
    <div className="container animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', borderBottom: '1px solid var(--panel-border)', marginBottom: '2rem' }}>
        <div>
          <button className="btn-secondary" style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }} onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Agents</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and monitor your agents</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Main Content: Search and List */}
        <div>
          <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <div className="input-group" style={{ marginBottom: '0' }}>
              <input 
                type="text" 
                placeholder="Search agents by name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '1rem', fontSize: '1.1rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {agents.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No agents found. Try creating one!
              </div>
            ) : (
              agents.map(agent => (
                <div key={agent.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', fontSize: '1.5rem' }}>
                      🤖
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{agent.name}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>ID: {agent.id} • Created {new Date(agent.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary">Open</button>
                    <button className="btn-danger" onClick={() => handleDeleteAgent(agent.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Create Agent */}
        <div className="glass-panel" style={{ position: 'sticky', top: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--panel-border)' }}>Add New Agent</h3>
          <form onSubmit={handleCreateAgent}>
            <div className="input-group">
              <label>Agent Name</label>
              <input 
                type="text" 
                placeholder="Ex. Trading Bot Alpha" 
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Agent'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
