import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';
import { formatDistanceToNow, subDays, format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminOnboarding from '../../components/AdminOnboarding';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ users: 0, gigs: 0, certs: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
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
      const [recentUsersRes, profilesRes, orgsRes] = await Promise.all([
        supabase.from('users').select('id, email, role, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('volunteer_profiles').select('user_id, full_name'),
        supabase.from('organizations').select('user_id, name, verification_status')
      ]);

      if (recentUsersRes.data) {
        const mergedData = recentUsersRes.data.map(u => ({
          ...u,
          volunteer_profiles: (profilesRes.data || []).filter(p => p.user_id === u.id),
          organizations: (orgsRes.data || []).filter(o => o.user_id === u.id)
        }));
        setRecentUsers(mergedData);
      }

      // Generate Last 7 Days Chart Data
      const sevenDaysAgo = subDays(new Date(), 6); // 6 days ago + today = 7 days
      
      const { data: recentUsersForChart } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());
        
      const { data: recentGigsForChart } = await supabase
        .from('gigs')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Initialize empty array for the last 7 days
      const daysData: Record<string, { name: string, users: number, gigs: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dayStr = format(d, 'MMM dd');
        daysData[dayStr] = { name: dayStr, users: 0, gigs: 0 };
      }

      // Group users
      if (recentUsersForChart) {
        recentUsersForChart.forEach(u => {
          const dayStr = format(new Date(u.created_at), 'MMM dd');
          if (daysData[dayStr]) daysData[dayStr].users += 1;
        });
      }

      // Group gigs
      if (recentGigsForChart) {
        recentGigsForChart.forEach(g => {
          const dayStr = format(new Date(g.created_at), 'MMM dd');
          if (daysData[dayStr]) daysData[dayStr].gigs += 1;
        });
      }

      setChartData(Object.values(daysData));
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
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
          <div className="text-right" style={{ fontSize: '36px', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--display)', lineHeight: 1 }}>{stats.users.toLocaleString()}</div>
        </div>

        <div className="admin-card" style={{ padding: '24px', borderTop: '4px solid #F59E0B' }}>
          <div className="custom-tooltip-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Active Gigs
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span className="custom-tooltip">Gigs currently published or in progress</span>
          </div>
          <div className="text-right" style={{ fontSize: '36px', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--display)', lineHeight: 1 }}>{stats.gigs.toLocaleString()}</div>
        </div>

        <div className="admin-card" style={{ padding: '24px', borderTop: '4px solid #10B981' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Certs Issued</div>
          <div className="text-right" style={{ fontSize: '36px', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--display)', lineHeight: 1 }}>{stats.certs.toLocaleString()}</div>
        </div>

        <div className="admin-card" style={{ padding: '24px', borderTop: '4px solid #8B5CF6' }}>
          <div className="custom-tooltip-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            MRR
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span className="custom-tooltip">Monthly Recurring Revenue</span>
          </div>
          <div className="text-right" style={{ fontSize: '36px', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--display)', lineHeight: 1 }}>₦0</div>
          <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 600, marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
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
                        <div style={{ fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748B' }}>
                            {name ? name.charAt(0).toUpperCase() : '?'}
                          </div>
                          {name || 'Unknown User'}
                        </div>
                        <div className="truncate" style={{ fontSize: '13px', color: '#64748B', maxWidth: '200px' }} title={u.email}>{u.email}</div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        <span className={`chip chip-role-${u.role}`}>{u.role}</span>
                      </td>
                      <td>
                        <span className={`chip chip-status-${status || 'active'}`}>
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
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Activity & Action Items</h3>
          <div className="timeline">
            
            <div className="timeline-item timeline-item-urgent">
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px', marginBottom: '4px' }}>Org Verifications</div>
              <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>Pending document reviews for 3 new organizations.</div>
              <button onClick={() => window.location.href = '/admin/users'} style={{ background: '#F1F5F9', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>Review Queue</button>
            </div>
            
            <div className="timeline-item">
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px', marginBottom: '4px' }}>System Update</div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>Payments integration is still pending configuration.</div>
            </div>

            <div className="timeline-item">
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px', marginBottom: '4px' }}>New Gigs Published</div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>5 new gigs were published today and are awaiting applications.</div>
            </div>

          </div>
        </div>

      </div>
      <AdminOnboarding />
    </div>
  );
};

export default AdminDashboard;

