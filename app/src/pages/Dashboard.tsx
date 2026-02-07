import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { WidgetCard } from '../components/ui/widget-card';
import { CurrencyDisplay } from '../components/ui/currency-display';
import { StatusBadge } from '../components/ui/status-badge';
import { DataTable } from '../components/ui/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { mockDashboardStats, mockCurrencyExposure, mockInvoices } from '../data/mockData';
import {
  Clock,
  AlertTriangle,
  Calendar,
  CalendarDays,
  DollarSign,
  Globe,
  TrendingUp,
} from 'lucide-react';
import { format, parseISO, isAfter, addDays } from 'date-fns';

export default function Dashboard() {
  const { user, company } = useAuth();
  const navigate = useNavigate();

  const stats = mockDashboardStats;
  const currencyExposure = mockCurrencyExposure;

  // Get recent invoices needing attention
  const pendingInvoices = mockInvoices
    .filter((inv) => inv.status === 'pending')
    .slice(0, 5);

  const upcomingDueInvoices = mockInvoices
    .filter((inv) => {
      if (inv.status !== 'approved') return false;
      const dueDate = parseISO(inv.dueDate);
      const today = new Date();
      return isAfter(dueDate, today) && isAfter(addDays(today, 7), dueDate);
    })
    .slice(0, 5);

  const invoiceColumns = [
    {
      key: 'supplierName',
      header: 'Supplier',
      render: (invoice: typeof mockInvoices[0]) => (
        <span className="font-medium">{invoice.supplierName}</span>
      ),
    },
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (invoice: typeof mockInvoices[0]) => (
        <CurrencyDisplay amount={invoice.amount} currency={invoice.currency} />
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (invoice: typeof mockInvoices[0]) => format(parseISO(invoice.dueDate), 'MMM d, yyyy'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (invoice: typeof mockInvoices[0]) => <StatusBadge status={invoice.status} />,
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{company?.name}</p>
          <p className="text-sm font-medium">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <WidgetCard
          title="Awaiting Approval"
          value={stats.awaitingApproval}
          icon={Clock}
          variant="warning"
          onClick={() => navigate('/app/approvals')}
        />
        <WidgetCard
          title="Overdue Invoices"
          value={stats.overdueInvoices}
          icon={AlertTriangle}
          variant={stats.overdueInvoices > 0 ? 'danger' : 'default'}
          onClick={() => navigate('/app/invoices?status=overdue')}
        />
        <WidgetCard
          title="Due in 7 Days"
          value={stats.dueNext7Days}
          icon={Calendar}
          onClick={() => navigate('/app/payables')}
        />
        <WidgetCard
          title="Due in 30 Days"
          value={stats.dueNext30Days}
          icon={CalendarDays}
          onClick={() => navigate('/app/payables')}
        />
      </div>

      {/* Second Row - Payables & FX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <WidgetCard
          title="Total Upcoming Payables"
          value={<CurrencyDisplay amount={stats.totalPayables} currency={stats.baseCurrency} size="lg" />}
          subtitle="Approved, unpaid invoices"
          icon={DollarSign}
          className="lg:col-span-1"
        />

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4" />
              FX Exposure Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currencyExposure.map((exposure) => (
                <div key={exposure.currency} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium">{exposure.currency}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${exposure.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-32 text-right">
                    <CurrencyDisplay amount={exposure.amount} currency={exposure.currency} size="sm" />
                  </div>
                  <div className="w-16 text-right text-sm text-muted-foreground">
                    {exposure.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Pending Approvals</CardTitle>
              <button
                onClick={() => navigate('/app/approvals')}
                className="text-sm text-primary hover:underline"
              >
                View all
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={pendingInvoices}
              columns={invoiceColumns}
              onRowClick={(invoice) => navigate(`/app/invoices/${invoice.id}`)}
              emptyMessage="No invoices pending approval"
            />
          </CardContent>
        </Card>

        {/* Upcoming Due */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Due This Week
              </CardTitle>
              <button
                onClick={() => navigate('/app/payables')}
                className="text-sm text-primary hover:underline"
              >
                View all
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={upcomingDueInvoices}
              columns={invoiceColumns}
              onRowClick={(invoice) => navigate(`/app/invoices/${invoice.id}`)}
              emptyMessage="No invoices due this week"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
