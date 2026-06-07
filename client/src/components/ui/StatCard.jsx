const StatCard = ({ label, value, icon, color = 'indigo', delta }) => {
  const colors = {
    indigo: { text: 'text-indigo-600 dark:text-indigo-400', icon: 'bg-indigo-100 dark:bg-indigo-950' },
    green:  { text: 'text-emerald-600 dark:text-emerald-400', icon: 'bg-emerald-100 dark:bg-emerald-950' },
    amber:  { text: 'text-amber-600 dark:text-amber-400', icon: 'bg-amber-100 dark:bg-amber-950' },
    red:    { text: 'text-red-600 dark:text-red-400', icon: 'bg-red-100 dark:bg-red-950' },
    violet: { text: 'text-violet-600 dark:text-violet-400', icon: 'bg-violet-100 dark:bg-violet-950' },
  };

  const c = colors[color];

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`${c.icon} p-2 rounded-lg`}>
          {icon}
        </div>
        {delta && (
          <span className={`text-xs font-medium ${delta > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className={`text-2xl font-semibold ${c.text} mb-0.5`}>{value}</div>
      <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
    </div>
  );
};

export default StatCard;