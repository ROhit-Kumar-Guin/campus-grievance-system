const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-slate-700 rounded-lg ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-4">
    <Skeleton className="h-8 w-8 rounded-lg mb-3" />
    <Skeleton className="h-5 w-16 mb-1" />
    <Skeleton className="h-3 w-24" />
  </div>
);

export default Skeleton;