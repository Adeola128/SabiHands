import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';

const userGrowthData = [
  { month: 'Jan', volunteers: 400, organizations: 24 },
  { month: 'Feb', volunteers: 800, organizations: 45 },
  { month: 'Mar', volunteers: 1200, organizations: 80 },
  { month: 'Apr', volunteers: 1800, organizations: 120 },
  { month: 'May', volunteers: 2500, organizations: 180 },
  { month: 'Jun', volunteers: 3400, organizations: 250 },
];

const gigCategoryData = [
  { name: 'Education', value: 400 },
  { name: 'Health', value: 300 },
  { name: 'Environment', value: 300 },
  { name: 'Tech', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const revenueData = [
  { month: 'Jan', revenue: 4000, tickets: 24 },
  { month: 'Feb', revenue: 3000, tickets: 13 },
  { month: 'Mar', revenue: 2000, tickets: 98 },
  { month: 'Apr', revenue: 2780, tickets: 39 },
  { month: 'May', revenue: 1890, tickets: 48 },
  { month: 'Jun', revenue: 2390, tickets: 38 },
];

const ReportsAnalytics: React.FC = () => {
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
                  {gigCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card" style={{ height: '350px', display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Revenue vs Support Tickets</h3>
          <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" orientation="left" stroke="#10B981" axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#EF4444" axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#10B981" name="MRR (₦)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="tickets" fill="#EF4444" name="Support Tickets" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;