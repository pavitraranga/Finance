import { useNavigate } from 'react-router-dom';
import '../index.css';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const navCards = [
    { title: 'Agents Management', description: 'Manage system agents, view stats, and config.', path: '/agents', icon: '🤖' },
    { title: 'Profit List', description: 'View latest incoming profit streams and history.', path: '/profit', icon: '📈' },
    { title: 'Monthly Report', description: 'Analyze your monthly personal finance metrics.', path: '/dashboard', icon: '📅' }
  ];

  return (
    <div className="container animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', borderBottom: '1px solid var(--panel-border)', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome to your finance overview</p>
        </div>
        
        {/* Notification Icon */}
        <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <span style={{ fontSize: '1.2rem' }}>🔔</span>
          <span style={{ position: 'absolute', top: '12px', right: '14px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%', boxShadow: '0 0 10px var(--danger)' }}></span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {navCards.map((card, idx) => (
          <div key={idx} className="glass-panel" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => handleNavigation(card.path)}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', display: 'inline-flex', padding: '1rem', borderRadius: '12px' }}>
              {card.icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.title}</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{card.description}</p>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', color: 'var(--accent-1)', fontWeight: '500' }}>
              Open Module <span style={{ marginLeft: '0.5rem' }}>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
