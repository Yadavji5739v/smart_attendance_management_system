import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Mail, EyeOff, GraduationCap } from 'lucide-react';

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
      flexDirection: 'column',
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      position: 'relative',
      fontFamily: '"Inter", sans-serif',
      padding: '40px 20px',
      // Subtle background pattern to mimic the network background
      backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
      backgroundSize: '40px 40px'
    }}>
      {/* Top Header */}
      <h1 style={{ 
        fontSize: '28px', 
        fontWeight: '700', 
        color: '#000', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        Smart Attendance Management System
      </h1>
      
      {/* Logo */}
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <img 
          src="/logo.png" 
          alt="College Logo" 
          style={{
            height: '90px',
            objectFit: 'contain',
            borderRadius: '8px'
          }} 
        />
      </div>

      {/* Login Card */}
      <div style={{ 
        width: '100%', 
        maxWidth: '380px', 
        backgroundColor: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        padding: '32px 28px',
        zIndex: 1
      }}>
        {error && (
          <div style={{ 
            color: '#d32f2f', 
            backgroundColor: '#ffebee', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '16px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Email Field */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '-8px',
              left: '12px',
              background: '#fff',
              padding: '0 4px',
              fontSize: '12px',
              color: '#64748b'
            }}>Email Address</div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              style={{
                width: '100%',
                padding: '14px 40px 14px 16px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#334155'
              }}
              required
            />
            <Mail size={20} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Password Field */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '-8px',
              left: '12px',
              background: '#fff',
              padding: '0 4px',
              fontSize: '12px',
              color: '#64748b'
            }}>Password</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '14px 40px 14px 16px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#334155'
              }}
              required
            />
            <EyeOff size={20} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} />
          </div>

          {/* Login Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#1d4ed8', // Matches the blue button
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              fontSize: '15px', 
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '4px',
              boxShadow: '0 2px 4px rgba(29, 78, 216, 0.3)',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
