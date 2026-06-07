import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell.jsx';
import {
  fetchSummary,
  fetchMonthlyTrends,
  fetchCategoryBreakdown,
  fetchStatusDistribution,
} from '../api/analytics.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend, LineChart, Line,
} from 'recharts';

// Colors for charts
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const statusColors = {
  'Pending':      '#F59E0B',
  'Under Review': '#0EA5E9',
  'In Progress':  '#8B5CF6',
  'Resolved':     '#10B981',
  'Closed':       '#64748B',
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsPage = () => {
  const { isAdmin } = useAuth();
  const [summary, setSummary]           = useState(null);
  const [trends, setTrends]             = useState([]);
  const [categories, setCategories]     = useState([]);
  const [statusDist, setStatusDist]     = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sumData, trendData, catData, statData] = await Promise.all([
          fetchSummary(),
          isAdmin ? fetchMonthlyTrends() : Promise.resolve({ trends: [] }),
          isAdmin ? fetchCategoryBreakdown() : Promise.resolve({ breakdown: [] }),
          isAdmin ? fetchStatusDistribution() : Promise.resolve({ distribution: [] }),
        ]);

        setSummary(sumData.summary);
        setTrends(trendData.trends || []);
        setCategories(catData.breakdown || []);
        setStatusDist(statData.distribution || []);
      } catch (error) {
        console.error('Analytics load error:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  if (loading) {
    return (
      <AppShell title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  // Format status distribution for pie chart
  const statusPieData = statusDist.map((s) => ({
    name:  s._id,
    value: s.count,
  }));

  return (
    <AppShell title="Analytics">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
          Analytics Dashboard
        </h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
          {isAdmin ? 'Platform-wide grievance statistics' : 'Your grievance statistics'}
        </p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Issues',      value: summary.total,          color: 'indigo' },
            { label: 'Pending',           value: summary.pending,        color: 'amber' },
            { label: 'Resolved',          value: summary.resolved,       color: 'green' },
            { label: 'Resolution Rate',   value: `${summary.resolutionRate}%`, color: 'violet' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-4 shadow-sm"
            >
              <div className={`text-2xl font-semibold mb-1 ${
                stat.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
                stat.color === 'amber'  ? 'text-amber-600 dark:text-amber-400' :
                stat.color === 'green'  ? 'text-emerald-600 dark:text-emerald-400' :
                                          'text-violet-600 dark:text-violet-400'
              }`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Admin-only charts */}
      {isAdmin && (
        <>
          {/* Monthly trends bar chart */}
          {trends.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-5 mb-5">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Monthly Trends — Submitted vs Resolved
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={trends} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                  />
                  <Bar dataKey="submitted" name="Submitted" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved"  name="Resolved"  fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Two charts side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Category breakdown pie chart */}
            {categories.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Issues by Category
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ category, percentage }) => `${category} ${percentage}%`}
                      labelLine={false}
                    >
                      {categories.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} issues (${props.payload.percentage}%)`,
                        props.payload.category,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  {categories.map((c, i) => (
                    <div key={c.category} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-xs text-gray-600 dark:text-slate-400">
                        {c.category} ({c.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status distribution */}
            {statusPieData.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                    >
                      {statusPieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={statusColors[entry.name] || '#94a3b8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  {statusPieData.map((s) => (
                    <div key={s.name} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: statusColors[s.name] || '#94a3b8' }}
                      />
                      <span className="text-xs text-gray-600 dark:text-slate-400">
                        {s.name} ({s.value})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional stats row */}
          {summary && (
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Platform Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Students', value: summary.totalStudents, icon: '👥' },
                  { label: 'Under Review',   value: summary.underReview,   icon: '👀' },
                  { label: 'In Progress',    value: summary.inProgress,    icon: '⚙️' },
                  { label: 'Closed',         value: summary.closed,        icon: '🔒' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center"
                  >
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                      {s.value}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Student view — simple summary */}
      {!isAdmin && summary && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Platform Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-950 rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                {summary.resolutionRate}%
              </div>
              <div className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">
                Resolution Rate
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950 rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {summary.resolved + summary.closed}
              </div>
              <div className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">
                Issues Resolved
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default AnalyticsPage;