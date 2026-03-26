import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

export default function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login
    if (loginId && password) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)' }}>Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Login ID</label>
            <input
              type="text"
              placeholder="Enter your ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
            />
          </div>
          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
