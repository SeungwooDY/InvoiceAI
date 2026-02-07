import { cn } from '../../lib/utils';
import { InvoiceStatus } from '@/types';

interface StatusBadgeProps {
  status: InvoiceStatus | 'overdue';
  className?: string;
}

const statusConfig: Record<InvoiceStatus | 'overdue', { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'status-draft' },
  pending: { label: 'Pending', className: 'status-pending' },
  approved: { label: 'Approved', className: 'status-approved' },
  paid: { label: 'Paid', className: 'status-paid' },
  reconciled: { label: 'Reconciled', className: 'status-reconciled' },
  rejected: { label: 'Rejected', className: 'status-rejected' },
  overdue: { label: 'Overdue', className: 'status-overdue' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
