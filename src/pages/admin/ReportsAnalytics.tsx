import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format, startOfYear } from 'date-fns';
import LoadingScreen from '../../components/LoadingScreen';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8B5CF6', '#F43F5E'];

const ReportsAnalytics: React.FC = () => {
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [gigCategoryData, setGigCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      // 1. Fetch YTD users
      const yearStart = startOfYear(new Date());
      const { data: users } = await supabase
        .from('users')
        .select('created_at, role')
        .gte('created_at', yearStart.toISOString());

      const monthlyData: Record<string, { month: string, volunteers: number, organizations: number }> = {};
      
      // Initialize months for YTD
      for (let i = 0; i < 12; i++) {
        const date = new Date(yearStart.getFullYear(), i, 1);
        const monthStr = format(date, 'MMM');
        monthlyData[monthStr] = { month: monthStr, volunteers: 0, organizations: 0 };
        if (date > new Date()) break; // Only show up to current month
      }

      if (users) {
        users.forEach(u => {
          const monthStr = format(new Date(u.created_at), 'MMM');
          if (monthlyData[monthStr]) {
            if (u.role === 'volunteer') monthlyData[monthStr].volunteers += 1;
            if (u.role === 'organization') monthlyData[monthStr].organizations += 1;
          }
        });
      }
      setUserGrowthData(Object.values(monthlyData));

      // 2. Fetch Gigs by Category
      const { data: gigs } = await supabase.from('gigs').select('category');
      if (gigs) {
        const catCounts: Record<string, number> = {};
        gigs.forEach(g => {
          const cat = g.category || 'Uncategorized';
          catCounts[cat] = (catCounts[cat] || 0) + 1;
        });
        const formattedCats = Object.keys(catCounts).map(name => ({
          name,
          value: catCounts[name]
        }));
        setGigCategoryData(formattedCats);
      }

      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading) return <LoadingScreen message="Loading analytics..." />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>Reports & Analytics</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Platform-wide reporting for the internal team.</p>
        </div>
        <button style={{ padding: '8px 16px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Generate PDF Report</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="admin-card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>User Growth (YTD)</h3>
          <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="volunteers" stroke="#3B82F6" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="organizations" stroke="#F59E0B" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Gigs by Category</h3>
          <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              {gigCategoryData.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>No gig data available</div>
              ) : (
                <PieChart>
                  <Pie
                    data={gigCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {gigCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;