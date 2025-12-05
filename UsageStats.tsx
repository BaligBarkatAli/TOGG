import React, { useMemo } from 'react';
import { useHome } from './HomeContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const UsageStats: React.FC = () => {
  const { logs, devices, theme } = useHome();

  const data = useMemo(() => {
    // Aggregate data: Count "TURNED_ON" events per device
    const counts: Record<string, number> = {};
    
    // Initialize
    devices.forEach(d => counts[d.name] = 0);

    logs.forEach(log => {
      if (log.action === 'TURNED_ON' && counts[log.deviceName] !== undefined) {
        counts[log.deviceName] += 1;
      }
    });

    return Object.keys(counts).map(name => ({
      name,
      activations: counts[name]
    }));
  }, [logs, devices]);

  if (logs.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 backdrop-blur-sm shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Device Usage Frequency</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
               dataKey="name" 
               stroke={theme === 'dark' ? "#94a3b8" : "#64748b"}
               fontSize={12} 
               tickLine={false} 
               axisLine={false} 
            />
            <YAxis 
               stroke={theme === 'dark' ? "#94a3b8" : "#64748b"}
               fontSize={12} 
               tickLine={false} 
               axisLine={false} 
               allowDecimals={false}
            />
            <Tooltip 
               cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}}
               contentStyle={{ 
                 backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                 borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', 
                 color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
               }}
               itemStyle={{ color: '#60a5fa' }}
            />
            <Bar dataKey="activations" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UsageStats;