import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, MapPin, BookOpen, LogOut, CheckSquare, ScanLine, FileBarChart, QrCode } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLinks = () => {
    const baseLinks = (() => {
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
    })();

    return baseLinks;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo" style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '14px', padding: '0 8px' }}>
        <div style={{ 
          width: '42px', 
          height: '42px', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 8px 16px -4px hsla(var(--primary), 0.5)'
        }}>
          <CheckSquare size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em' }}>SmartEntry</h2>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ 
          fontSize: '11px', 
          color: 'hsl(var(--text-dim))', 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em', 
          marginBottom: '12px', 
          paddingLeft: '16px',
          fontWeight: '700'
        }}>
          {user.role} workspace
        </div>
        
        {getLinks().map(link => (
          <NavLink 
            key={link.to} 
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            end={link.to.split('/').length === 2}
            style={{ textDecoration: 'none' }}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            <span className="sidebar-link-label">{link.label}</span>
          </NavLink>
        ))}

        {/* Mobile-only Logout Link */}
        <div className="mobile-only" style={{ display: 'none' }}>
           <button 
             onClick={handleLogout} 
             className="sidebar-link" 
             style={{ 
               width: '100%', 
               background: 'transparent', 
               border: 'none', 
               cursor: 'pointer',
               padding: '10px'
             }}
           >
             <span className="sidebar-link-icon"><LogOut size={20} /></span>
             <span className="sidebar-link-label">Logout</span>
           </button>
        </div>
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '12px',
          background: 'hsla(0, 0%, 100%, 0.03)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          border: '1px solid var(--glass-border)'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, hsla(var(--primary), 0.2), hsla(var(--primary), 0.1))', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            border: '1px solid hsla(var(--primary), 0.2)',
            fontSize: '16px',
            fontWeight: '700',
            color: 'hsl(var(--primary))'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</div>
            <div style={{ fontSize: '11px', color: 'hsl(var(--text-dim))', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn" style={{ width: '100%', background: 'hsla(0, 0%, 100%, 0.05)', color: 'hsl(var(--text-muted))', border: '1px solid var(--glass-border)' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
