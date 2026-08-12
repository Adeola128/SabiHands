import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';
import { formatDistanceToNow } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the chart - in a real app, this would be fetched from Supabase grouping by date
const mockChartData = [
  { name: 'Mon', users: 4, gigs: 1 },
  { name: 'Tue', users: 7, gigs: 2 },
  { name: 'Wed', users: 5, gigs: 4 },
  { name: 'Thu', users: 12, gigs: 3 },
  { name: 'Fri', users: 18, gigs: 7 },
  { name: 'Sat', users: 24, gigs: 5 },
  { name: 'Sun', users: 31, gigs: 8 },
];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ users: 0, gigs: 0, certs: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      // Fetch exact counts
      const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: gigsCount } = await supabase.from('gigs').select('*', { count: 'exact', head: true }).in('status', ['active', 'published']);
      const { count: certsCount } = await supabase.from('certificates').select('*', { count: 'exact', head: true });

      setStats({
        users: usersCount || 0,
        gigs: gigsCount || 0,
        certs: certsCount || 0
      });

      // Fetch recent signups
      const { data: recent } = await supabase
        .from('users')
        .select(`
          id, email, role, created_at,
          volunteer_profiles(full_name),
          organizations(name, verification_status)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (recent) setRecentUsers(recent);

      setLoading(false);
    };

    fetchAdminData();
  }, []);

  if (loading) return <LoadingScreen message="Loading platform data..." />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>Platform Overview</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Key metrics and activity across Ralvo.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', fontWeight: 600, color: '#334155' }}>
            <option>All Time</option>
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Chart Section */}
      <div className="admin-card" style={{ marginBottom: '32px', padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Growth Overview</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={mockChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 6 }} name="New Users" />
              <Line type="monotone" dataKey="gigs" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }} activeDot={{ r: 6 }} name="New Gigs" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        <div className="admin-card" style={{ padding: '24px', borderTop: '4px solid #3B82F6' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Total Users</div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--display)', lineHeight: 1 }}>{stats.users.toLocaleString()}</div>
        </div>

        <div className="admin-card" style={{ padding: '24px', borderTop: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Active Gigs</div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--display)', lineHeight: 1 }}>{stats.gigs.toLocaleString()}</div>
        </div>

        <div className="admin-card" style={{ padding: '24px', borderTop: '4px solid #10B981' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Certs Issued</div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--display)', lineHeight: 1 }}>{stats.certs.toLocaleString()}</div>
        </div>

        <div className="admin-card" style={{ padding: '24px', borderTop: '4px solid #8B5CF6' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>MRR</div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--display)', lineHeight: 1 }}>â‚¦0</div>
          <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 600, marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Payments not configured
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Recent Activity Table */}
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Recent Sign-ups</h3>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User / Org Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}>No users found.</td></tr>
                ) : recentUsers.map(u => {
                  const isOrg = u.role === 'organization';
                  const name = isOrg ? u.organizations?.[0]?.name : u.volunteer_profiles?.[0]?.full_name;
                  const status = isOrg ? u.organizations?.[0]?.verification_status : 'verified';
                  
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{name || 'Unknown User'}</div>
                        <div style={{ fontSize: '13px', color: '#64748B' }}>{u.email}</div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                      <td>
                        <span className={`admin-status-badge ${status === 'pending' ? 'admin-status-pending' : status === 'rejected' ? 'admin-status-rejected' : 'admin-status-approved'}`}>
                          {status || 'Active'}
                        </span>
                      </td>
                      <td>{formatDistanceToNow(new Date(u.created_at))} ago</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Items */}
        <div className="admin-card">
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Requires Attention</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px', marginBottom: '4px' }}>Org Verifications</div>
                <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>Pending document reviews</div>
                <button style={{ background: '#F1F5F9', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>Review Queue</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;

