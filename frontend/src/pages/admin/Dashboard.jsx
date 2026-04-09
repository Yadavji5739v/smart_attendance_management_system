import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Users, MapPin, BookOpen, Clock, FileCheck } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const StatCard = ({ title, value, icon, color }) => (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ 
        width: '56px', height: '56px', borderRadius: '16px', 
        background: `linear-gradient(135deg, ${color}40, ${color}80)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${color}`
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '28px', fontWeight: '700' }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Overview of system statistics and metrics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={<Users size={28} color="#6366F1" />} color="#6366F1" />
        <StatCard title="Total Faculty" value={stats?.totalFaculty || 0} icon={<Users size={28} color="#EC4899" />} color="#EC4899" />
        <StatCard title="Total Branches" value={stats?.totalBranches || 0} icon={<MapPin size={28} color="#10B981" />} color="#10B981" />
        <StatCard title="Total Subjects" value={stats?.totalSubjects || 0} icon={<BookOpen size={28} color="#F59E0B" />} color="#F59E0B" />
        <StatCard title="Total Sessions" value={stats?.totalSessions || 0} icon={<Clock size={28} color="#8B5CF6" />} color="#8B5CF6" />
        <StatCard title="Attendance Records" value={stats?.totalAttendance || 0} icon={<FileCheck size={28} color="#14B8A6" />} color="#14B8A6" />
      </div>
    </div>
  );
};

export default AdminDashboard;
