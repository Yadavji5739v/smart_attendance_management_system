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
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      padding: '24px',
      position: 'relative',
      background: 'hsl(var(--bg-main))'
    }}>
      {/* Dynamic Background Elements */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'hsla(var(--primary), 0.15)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '400px', height: '400px', background: 'hsla(var(--secondary), 0.1)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }}></div>

      <div className="glass-panel animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '440px', 
        padding: '48px', 
        position: 'relative', 
        overflow: 'hidden',
        zIndex: 1
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '72px', 
            height: '72px', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))', 
            marginBottom: '24px', 
            boxShadow: '0 12px 24px -6px hsla(var(--primary), 0.5)',
            color: 'white'
          }}>
            <UserCircle size={40} strokeWidth={1.5} />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.025em' }}>Welcome Back</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '15px', fontWeight: '500' }}>Access your SmartEntry workspace</p>
        </div>

        {error && (
          <div style={{ 
            background: 'hsla(var(--danger), 0.1)', 
            borderLeft: '4px solid hsl(var(--danger))', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '24px', 
            color: 'hsl(var(--text-main))', 
            fontSize: '14px',
            fontWeight: '500',
            animation: 'fadeIn 0.3s ease'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="input-label" style={{ marginBottom: '8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-dim))' }} htmlFor="email">UID or Email Address</label>
            <input
              id="email"
              type="text"
              className="input-field"
              placeholder="e.g. 23131001 or name@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label" style={{ marginBottom: '8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-dim))' }} htmlFor="password">Security Password</label>
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
            style={{ width: '100%', marginTop: '8px', padding: '16px', fontSize: '16px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : <><LogIn size={20} /> Sign In</>}
          </button>
        </form>

        <div style={{ 
          marginTop: '32px', 
          textAlign: 'center', 
          fontSize: '12px', 
          color: 'hsl(var(--text-dim))',
          fontWeight: '500',
          letterSpacing: '0.02em'
        }}>
          Secure multi-factor access powered by <span style={{ color: 'hsl(var(--primary))', fontWeight: '700' }}>SmartEntry</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
