import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Plus } from 'lucide-react';

const AdminBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ branch_name: '', department: '' });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/admin/branches');
      setBranches(data);
    } catch (error) {
      console.error("Failed to load branches", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/branches', formData);
      setShowModal(false);
      setFormData({ branch_name: '', department: '' });
      fetchBranches();
    } catch (error) {
      alert('Error adding branch');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Branches</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage academic branches and departments.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Branch
        </button>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Branch Name</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {branches.map(b => (
              <tr key={b.branch_id}>
                <td>#{b.branch_id}</td>
                <td style={{ fontWeight: 600 }}>{b.branch_name}</td>
                <td>{b.department}</td>
              </tr>
            ))}
            {branches.length === 0 && (
              <tr><td colSpan="3" style={{ textAlign: 'center' }}>No branches found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
            <h2 style={{ marginBottom: '24px' }}>Add Branch</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Branch Name</label>
                <input className="input-field" required placeholder="e.g. Computer Science" value={formData.branch_name} onChange={e => setFormData({...formData, branch_name: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Department</label>
                <input className="input-field" required placeholder="e.g. Engineering" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBranches;
