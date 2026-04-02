import { useNavigate } from 'react-router-dom';
import '../index.css';

export default function SystemSelect() {
  const navigate = useNavigate();

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Select Vertical
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>Choose the lending module you want to manage</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1000px' }}>
        
        {/* GOLD MODULE (The duplicate app) */}
        <div 
          className="glass-panel" 
          style={{ cursor: 'pointer', textAlign: 'center', padding: '3rem 2rem', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '4px solid #f59e0b' }}
          onClick={() => {
            localStorage.setItem('systemType', 'gold');
            navigate('/dashboard');
          }}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, { transform: 'translateY(-5px)', boxShadow: 'var(--neon-glow)' })}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: 'none' })}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Gold Loan</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage gold-backed lending, interest, and collateral.</p>
        </div>

        {/* MONTHLY MODULE (The current app) */}
        <div 
          className="glass-panel" 
          style={{ cursor: 'pointer', textAlign: 'center', padding: '3rem 2rem', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '4px solid var(--accent-1)' }}
          onClick={() => {
            localStorage.setItem('systemType', 'monthly');
            navigate('/dashboard');
          }}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, { transform: 'translateY(-5px)', boxShadow: 'var(--neon-glow)' })}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: 'none' })}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Monthly Interest</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage standard monthly simple/compound interest loans.</p>
        </div>

        <div 
          className="glass-panel" 
          style={{ cursor: 'pointer', textAlign: 'center', padding: '3rem 2rem', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '4px solid #8b5cf6' }}
          onClick={() => {
            localStorage.setItem('systemType', 'emi');
            navigate('/dashboard');
          }}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, { transform: 'translateY(-5px)', boxShadow: 'var(--neon-glow)' })}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: 'none' })}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏱️</div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>EMI System</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage fixed installment loans and scheduled collections.</p>
        </div>

      </div>
    
      <button 
        className="btn-secondary" 
        style={{ marginTop: '4rem', padding: '0.75rem 2rem' }}
        onClick={() => navigate('/')}
      >
        Logout
      </button>

    </div>
  );
}
