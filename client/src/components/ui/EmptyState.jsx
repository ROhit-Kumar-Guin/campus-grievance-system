const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-slate-400 mb-5 max-w-xs">{description}</p>
    {action && action}
  </div>
);

export default EmptyState;