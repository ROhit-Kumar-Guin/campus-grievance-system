const variants = {
  pending:  'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
  review:   'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300',
  progress: 'bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300',
  resolved: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
  closed:   'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400',
  high:     'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300',
  medium:   'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
  low:      'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
  student:  'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300',
  admin:    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
};

const Badge = ({ variant = 'pending', children, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;