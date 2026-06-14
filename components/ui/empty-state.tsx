import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in-up">
      <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
        {icon || <Inbox size={28} className="text-surface-400" />}
      </div>
      <h3 className="text-surface-700 font-semibold text-sm mb-1">{title}</h3>
      {description && (
        <p className="text-surface-400 text-xs text-center max-w-xs mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
