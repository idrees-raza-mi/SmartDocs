'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AnalyticsTab() {
  const lineData = [
    { name: 'Mon', messages: 120 }, { name: 'Tue', messages: 150 },
    { name: 'Wed', messages: 180 }, { name: 'Thu', messages: 140 },
    { name: 'Fri', messages: 210 }, { name: 'Sat', messages: 80 },
    { name: 'Sun', messages: 95 },
  ];

  const barData = [
    { name: 'Pricing', count: 45 }, { name: 'Refunds', count: 32 },
    { name: 'Shipping', count: 28 }, { name: 'Setup', count: 20 },
    { name: 'API', count: 15 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Total Messages (30d)</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">1,240</div>
        </div>
        <div className="bg-white dark:bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Escalation Rate</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">4.2%</div>
        </div>
        <div className="bg-white dark:bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Avg. Response Time</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">1.2s</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
          <h3 className="font-bold text-[var(--text-primary)] mb-6">Messages per day</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="messages" stroke="var(--brand)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
          <h3 className="font-bold text-[var(--text-primary)] mb-6">Top Topics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{ fill: 'var(--brand-light)' }} />
                <Bar dataKey="count" fill="var(--brand)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-[var(--text-primary)] mb-4">Questions your bot couldn't answer</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-sm font-medium text-[var(--text-primary)]">Do you offer on-premise hosting?</span>
            <span className="text-xs text-[var(--text-secondary)] bg-white dark:bg-gray-700 px-2 py-1 rounded">Asked 12 times</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-sm font-medium text-[var(--text-primary)]">Can I pay via wire transfer?</span>
            <span className="text-xs text-[var(--text-secondary)] bg-white dark:bg-gray-700 px-2 py-1 rounded">Asked 8 times</span>
          </div>
        </div>
      </div>
    </div>
  );
}
