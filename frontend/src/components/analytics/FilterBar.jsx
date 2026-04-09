import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Filter, Calendar, MapPin } from 'lucide-react';

const FilterBar = ({ onFilterChange }) => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data } = await api.get('/admin/branches');
        setBranches(data);
      } catch (error) {
        console.error("Error fetching branches for filter", error);
      }
    };
    fetchBranches();
  }, []);

  const semesters = ['all', '1', '2', '3', '4', '5', '6', '7', '8'];

  const handleBranchChange = (e) => {
    const val = e.target.value;
    setSelectedBranch(val);
    onFilterChange({ branch_id: val, semester: selectedSemester });
  };

  const handleSemesterChange = (e) => {
    const val = e.target.value;
    setSelectedSemester(val);
    onFilterChange({ branch_id: selectedBranch, semester: val });
  };

  return (
    <div className="glass-panel" style={{ 
      padding: '12px 20px', 
      marginBottom: '24px', 
      display: 'flex', 
      flexWrap: 'wrap',
      alignItems: 'center', 
      gap: '24px',
      border: '1px solid var(--border-glass)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '600' }}>
        <Filter size={18} />
        <span>Filters</span>
      </div>

      <div style={{ height: '24px', width: '1px', background: 'var(--border-glass)' }}></div>

      {/* Branch Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={16} />
          <span style={{ fontSize: '14px' }}>Branch:</span>
        </div>
        <select 
          value={selectedBranch} 
          onChange={handleBranchChange}
          style={{ 
            background: 'rgba(0,0,0,0.3)', 
            color: '#fff', 
            border: '1px solid var(--border-glass)',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '14px',
            outline: 'none'
          }}
        >
          <option value="all">All Branches</option>
          {branches.map(b => (
            <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
          ))}
        </select>
      </div>

      {/* Semester Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={16} />
          <span style={{ fontSize: '14px' }}>Semester:</span>
        </div>
        <select 
          value={selectedSemester} 
          onChange={handleSemesterChange}
          style={{ 
            background: 'rgba(0,0,0,0.3)', 
            color: '#fff', 
            border: '1px solid var(--border-glass)',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '14px',
            outline: 'none'
          }}
        >
          {semesters.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All Semesters' : `Semester ${s}`}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
