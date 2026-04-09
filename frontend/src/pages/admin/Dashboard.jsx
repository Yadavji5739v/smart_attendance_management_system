import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Users, MapPin, BookOpen, Clock, FileCheck, TrendingUp, BarChart as BarChartIcon } from 'lucide-react';
import FilterBar from '../../components/analytics/FilterBar';
import { AttendanceTrendChart, BranchPerformanceChart } from '../../components/analytics/AnalyticsCharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState({ branchStats: [], dailyTrend: [] });
  const [filters, setFilters] = useState({ branch_id: 'all', semester: 'all' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/dashboard');
      setStats(statsRes.data);

      const params = new URLSearchParams();
      if (filters.branch_id !== 'all') params.append('branch_id', filters.branch_id);
      if (filters.semester !== 'all') params.append('semester', filters.semester);

      const analyticsRes = await api.get(`/analytics/admin/overall?${params.toString()}`);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

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
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time overview of system performance and attendance.</p>
        </div>
      </div>

      <FilterBar onFilterChange={setFilters} />

      {/* Primary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={<Users size={28} color="#6366F1" />} color="#6366F1" />
        <StatCard title="Total Faculty" value={stats?.totalFaculty || 0} icon={<Users size={28} color="#EC4899" />} color="#EC4899" />
        <StatCard title="Total Branches" value={stats?.totalBranches || 0} icon={<MapPin size={28} color="#10B981" />} color="#10B981" />
        <StatCard title="Attendance Records" value={stats?.totalAttendance || 0} icon={<FileCheck size={28} color="#14B8A6" />} color="#14B8A6" />
      </div>

      {/* Visualizations Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        
        {/* Attendance Trend Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <TrendingUp size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Attendance Trends (Last 30 Days)</h3>
          </div>
          <AttendanceTrendChart data={analytics.dailyTrend} />
        </div>

        {/* Branch Performance Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <BarChartIcon size={20} color="var(--secondary)" />
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Attendance by Branch</h3>
          </div>
          <BranchPerformanceChart data={analytics.branchStats} />
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
