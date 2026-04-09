import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Plus } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student', branch_id: '', semester: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: usersData }, { data: branchesData }] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/branches')
      ]);
      setUsers(usersData);
      setBranches(branchesData);
      if (branchesData.length > 0) {
        setFormData(prev => ({ ...prev, branch_id: branchesData[0].branch_id }));
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', {
        ...formData,
        semester: formData.role === 'student' ? parseInt(formData.semester) : null,
      });
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'student', branch_id: branches[0]?.branch_id || '', semester: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding user');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage students, faculty, and administrators.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Branch</th>
              <th>Sem</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.user_id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                    background: u.role === 'admin' ? 'rgba(236,72,153,0.1)' : u.role === 'faculty' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)',
                    color: u.role === 'admin' ? '#EC4899' : u.role === 'faculty' ? '#6366F1' : '#10B981'
                  }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td>{u.branch_name || '-'}</td>
                <td>{u.semester || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ marginBottom: '24px' }}>Add New User</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input type="email" className="input-field" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input type="password" className="input-field" required minLength="6" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Role</label>
                <select className="input-field" style={{ background: 'var(--bg-secondary)' }} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Branch</label>
                <select className="input-field" style={{ background: 'var(--bg-secondary)' }} value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})}>
                  {branches.map(b => (
                    <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                  ))}
                </select>
              </div>
              {formData.role === 'student' && (
                <div className="input-group">
                  <label className="input-label">Semester</label>
                  <input type="number" min="1" max="8" className="input-field" required value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} />
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
