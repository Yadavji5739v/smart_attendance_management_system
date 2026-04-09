import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogIn, UserCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // If it doesn't contain '@', it's a student login name, so we append '@college.edu'
    const loginIdentifier = email.includes('@') ? email : `${email.toLowerCase()}@college.edu`;

    const result = await login(loginIdentifier, password);
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background glow effect for the card */}
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.5, borderRadius: '50%', zIndex: -1 }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--secondary)', filter: 'blur(80px)', opacity: 0.5, borderRadius: '50%', zIndex: -1 }}></div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', marginBottom: '16px', boxShadow: 'var(--shadow-glow)' }}>
            <UserCircle size={36} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sign in to continue to SmartEntry</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', padding: '12px', borderRadius: '4px', marginBottom: '20px', color: 'var(--text-main)', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">UID or Email Address</label>
            <input
              id="email"
              type="text"
              className="input-field"
              placeholder="UID (e.g. 23131001) or Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '16px', padding: '14px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Secure access managed by SmartEntry
        </div>
      </div>
    </div>
  );
};

export default Login;
