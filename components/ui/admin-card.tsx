import { cn } from '@/lib/utils/helper';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'highlight' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'section' | 'article';
}

const variants = {
  default: 'bg-white border border-surface-200 shadow-sm',
  primary: 'bg-white border border-tosca-100 shadow-md shadow-tosca-50',
  highlight: 'bg-tosca-50 border border-tosca-100',
  flat: 'bg-surface-50 border border-surface-100',
};

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-6 sm:p-8',
};

export function AdminCard({ children, className, variant = 'default', padding = 'md', as: Tag = 'div' }: AdminCardProps) {
  return (
    <Tag className={cn(variants[variant], paddings[padding], 'rounded-3xl transition-all', className)}>
      {children}
    </Tag>
  );
}

export function CardHeader({ icon, title, description, action }: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="p-3 bg-tosca-100 rounded-2xl shrink-0">
            {icon}
          </div>
        )}
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-bold text-tosca-900">{title}</h1>
          {description && <p className="text-sm text-surface-500">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
