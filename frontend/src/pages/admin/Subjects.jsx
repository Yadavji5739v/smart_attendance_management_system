import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, BookOpen } from 'lucide-react';
import FilterBar from '../../components/analytics/FilterBar';

const AdminSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({ branch_id: 'all', semester: 'all' });
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    subject_name: '', subject_code: '', uid: '', branch_id: '', total_classes: 40, semester: 1 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [{ data: subData }, { data: branchData }] = await Promise.all([
        api.get('/admin/subjects'),
        api.get('/admin/branches')
      ]);
      setSubjects(subData);
      setBranches(branchData);
      if (branchData.length > 0) {
        setFormData(prev => ({ ...prev, branch_id: branchData[0].branch_id }));
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
      await api.post('/admin/subjects', {
        ...formData,
        total_classes: parseInt(formData.total_classes),
        semester: parseInt(formData.semester)
      });
      setShowModal(false);
      setFormData({ subject_name: '', subject_code: '', uid: '', branch_id: branches[0]?.branch_id || '', total_classes: 40, semester: 1 });
      fetchData();
    } catch (error) {
      alert('Error adding subject');
    }
  };

  const filteredSubjects = subjects.filter(sub => {
    const branchMatch = filters.branch_id === 'all' || String(sub.branch_id) === String(filters.branch_id);
    const semMatch = filters.semester === 'all' || String(sub.semester) === String(filters.semester);
    return branchMatch && semMatch;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Subjects</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage course subjects and semester allotments.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Subject
        </button>
      </div>

      <FilterBar onFilterChange={setFilters} />

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Subject Name</th>
              <th>Sem</th>
              <th>Branch</th>
              <th>Classes</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.map(s => (
              <tr key={s.subject_id}>
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{s.subject_code}</td>
                <td>{s.subject_name}</td>
                <td>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', fontWeight: '600' }}>
                    S{s.semester || '?'}
                  </span>
                </td>
                <td>{branches.find(b => b.branch_id === s.branch_id)?.branch_name || '...'}</td>
                <td>{s.total_classes}</td>
              </tr>
            ))}
            {filteredSubjects.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No subjects found for current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ marginBottom: '24px' }}>Add Subject</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Subject Name</label>
                <input className="input-field" required value={formData.subject_name} onChange={e => setFormData({...formData, subject_name: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Subject Code</label>
                <input className="input-field" required value={formData.subject_code} onChange={e => setFormData({...formData, subject_code: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Unique ID (UID)</label>
                <input className="input-field" required value={formData.uid} onChange={e => setFormData({...formData, uid: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Branch</label>
                  <select className="input-field" style={{ background: 'var(--bg-secondary)' }} value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})}>
                    {branches.map(b => (
                      <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Semester</label>
                  <select className="input-field" style={{ background: 'var(--bg-secondary)' }} value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})}>
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Total Classes</label>
                <input type="number" min="1" className="input-field" required value={formData.total_classes} onChange={e => setFormData({...formData, total_classes: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjects;
