import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, MapPin, BookOpen, LogOut, CheckSquare, ScanLine, FileBarChart } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { to: '/admin/users', icon: <Users size={20} />, label: 'Users' },
          { to: '/admin/branches', icon: <MapPin size={20} />, label: 'Branches' },
          { to: '/admin/subjects', icon: <BookOpen size={20} />, label: 'Subjects' },
        ];
      case 'faculty':
        return [
          { to: '/faculty', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { to: '/faculty/reports', icon: <FileBarChart size={20} />, label: 'Reports' },
        ];
      case 'student':
        return [
          { to: '/student', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { to: '/student/scan', icon: <ScanLine size={20} />, label: 'Scan QR' },
        ];
      default:
        return [];
    }
  };

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: '260px',
      background: 'rgba(19, 26, 42, 0.4)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border-glass)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      zIndex: 100
    }}>
      <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckSquare size={20} color="white" />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SmartEntry</h2>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>
          {user.role} Panel
        </div>
        
        {getLinks().map(link => (
          <NavLink 
            key={link.to} 
            to={link.to}
            end={link.to.split('/').length === 2} // Exact match for base role route
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: isActive ? 'white' : 'var(--text-muted)',
              background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.15), transparent)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
              transition: 'all 0.2s',
              fontWeight: isActive ? 500 : 400
            })}
          >
            <span style={{ color: 'inherit' }}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 8px', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-glass)' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
