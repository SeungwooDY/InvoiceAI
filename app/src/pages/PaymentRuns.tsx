import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/ui/data-table';
import { CurrencyDisplay } from '../components/ui/currency-display';
import { StatusBadge } from '../components/ui/status-badge';
import { WidgetCard } from '../components/ui/widget-card';
import { mockPaymentRuns } from '../data/mockData';
import { PaymentRun } from '../types';
import { format, parseISO } from 'date-fns';
import { FileStack, FileCheck, DollarSign, Calendar } from 'lucide-react';

export default function PaymentRuns() {
  const navigate = useNavigate();

  const stats = {
    totalRuns: mockPaymentRuns.length,
    submittedRuns: mockPaymentRuns.filter((pr) => pr.status === 'submitted').length,
    draftRuns: mockPaymentRuns.filter((pr) => pr.status === 'draft').length,
    totalAmount: mockPaymentRuns.reduce((sum, pr) => sum + pr.totalAmount, 0),
  };

  const columns = [
    {
      key: 'id',
      header: 'Payment Run ID',
      sortable: true,
      render: (run: PaymentRun) => (
        <span className="font-medium font-mono">{run.id.toUpperCase()}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (run: PaymentRun) => format(parseISO(run.date), 'MMM d, yyyy'),
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      sortable: true,
      className: 'text-right',
      render: (run: PaymentRun) => (
        <CurrencyDisplay amount={run.totalAmount} currency={run.currency} />
      ),
    },
    {
      key: 'currency',
      header: 'Currency',
      sortable: true,
    },
    {
      key: 'invoiceCount',
      header: 'Invoices',
      sortable: true,
      render: (run: PaymentRun) => (
        <span className="text-muted-foreground">{run.invoiceCount} invoices</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (run: PaymentRun) => (
        <StatusBadge status={run.status === 'submitted' ? 'paid' : 'draft'} />
      ),
    },
  ];

  const sortedRuns = [...mockPaymentRuns].sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Payment Runs</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <WidgetCard
          title="Total Runs"
          value={stats.totalRuns}
          subtitle="All payment runs"
          icon={FileStack}
        />
        <WidgetCard
          title="Submitted"
          value={stats.submittedRuns}
          subtitle="Exported to bank"
          icon={FileCheck}
          variant="success"
        />
        <WidgetCard
          title="Drafts"
          value={stats.draftRuns}
          subtitle="Pending export"
          icon={Calendar}
        />
        <WidgetCard
          title="Total Processed"
          value={<CurrencyDisplay amount={stats.totalAmount} currency="USD" size="lg" />}
          subtitle="All-time amount"
          icon={DollarSign}
        />
      </div>

      {/* Payment Runs Table */}
      <DataTable
        data={sortedRuns}
        columns={columns}
        onRowClick={(run) => navigate(`/app/payment-runs/${run.id}`)}
        emptyMessage="No payment runs created yet"
      />
    </div>
  );
}
