export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-surface-200 p-6 space-y-4 animate-fade-in-up">
      <div className="flex justify-between items-start">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <Skeleton className="h-5 w-16 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-24 rounded-lg" />
      <Skeleton className="h-8 w-20 rounded-lg" />
      <Skeleton className="h-3 w-32 rounded-lg" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-3xl border border-surface-200 overflow-hidden animate-fade-in-up">
      <div className="p-4 border-b border-surface-100">
        <div className="flex gap-6">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1 rounded-lg" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="p-4 border-b border-surface-50">
          <div className="flex gap-6">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className={`h-4 flex-1 rounded-lg ${c === 0 ? 'w-8' : ''}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
