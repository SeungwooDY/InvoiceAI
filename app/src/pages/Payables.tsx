import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/ui/data-table';
import { StatusBadge } from '../components/ui/status-badge';
import { CurrencyDisplay } from '../components/ui/currency-display';
import { WidgetCard } from '../components/ui/widget-card';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { mockInvoices } from '../data/mockData';
import { Invoice } from '../types';
import { differenceInDays, parseISO, isBefore, isAfter, addDays } from 'date-fns';
import { format } from 'date-fns';
import { AlertTriangle, Calendar, CalendarDays, DollarSign, FileStack, TrendingUp } from 'lucide-react';

export default function Payables() {
  const navigate = useNavigate();
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set());

  // Filter only approved, unpaid invoices
  const payables = useMemo(() => {
    return mockInvoices.filter((inv) => inv.status === 'approved');
  }, []);

  const today = new Date();

  const stats = useMemo(() => {
    const overdue = payables.filter((inv) => isBefore(parseISO(inv.dueDate), today));
    const dueIn7Days = payables.filter((inv) => {
      const dueDate = parseISO(inv.dueDate);
      return isAfter(dueDate, today) && isBefore(dueDate, addDays(today, 7));
    });
    const totalAmount = payables.reduce((sum, inv) => sum + inv.baseAmount, 0);

    return {
      overdueCount: overdue.length,
      overdueAmount: overdue.reduce((sum, inv) => sum + inv.baseAmount, 0),
      dueIn7DaysCount: dueIn7Days.length,
      dueIn7DaysAmount: dueIn7Days.reduce((sum, inv) => sum + inv.baseAmount, 0),
      totalCount: payables.length,
      totalAmount,
    };
  }, [payables]);

  const getDaysStatus = (invoice: Invoice) => {
    const dueDate = parseISO(invoice.dueDate);
    const days = differenceInDays(dueDate, today);
    
    if (days < 0) {
      return { text: `${Math.abs(days)} days overdue`, isOverdue: true };
    } else if (days === 0) {
      return { text: 'Due today', isOverdue: false };
    } else {
      return { text: `${days} days remaining`, isOverdue: false };
    }
  };

  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    setSelectedInvoiceIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(invoiceId);
      } else {
        newSet.delete(invoiceId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoiceIds(new Set(payables.map((inv) => inv.id)));
    } else {
      setSelectedInvoiceIds(new Set());
    }
  };

  const isAllSelected = payables.length > 0 && selectedInvoiceIds.size === payables.length;
  const isSomeSelected = selectedInvoiceIds.size > 0 && selectedInvoiceIds.size < payables.length;

  const handleCreatePaymentRun = () => {
    navigate('/app/payables/create-payment-run', {
      state: { selectedInvoiceIds: Array.from(selectedInvoiceIds) },
    });
  };

  const columns = [
    {
      key: 'select',
      header: () => (
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={handleSelectAll}
          aria-label="Select all"
          className={isSomeSelected ? 'opacity-50' : ''}
        />
      ),
      render: (invoice: Invoice) => (
        <Checkbox
          checked={selectedInvoiceIds.has(invoice.id)}
          onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked as boolean)}
          aria-label={`Select ${invoice.invoiceNumber}`}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      sortable: true,
      render: (invoice: Invoice) => (
        <span className="font-medium">{invoice.supplierName}</span>
      ),
    },
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      className: 'text-right',
      render: (invoice: Invoice) => (
        <CurrencyDisplay amount={invoice.amount} currency={invoice.currency} />
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (invoice: Invoice) => format(parseISO(invoice.dueDate), 'MMM d, yyyy'),
    },
    {
      key: 'daysRemaining',
      header: 'Status',
      render: (invoice: Invoice) => {
        const status = getDaysStatus(invoice);
        return (
          <span className={status.isOverdue ? 'text-rose-600 font-medium' : 'text-muted-foreground'}>
            {status.text}
          </span>
        );
      },
    },
  ];

  // Sort by due date, overdue first
  const sortedPayables = [...payables].sort((a, b) => {
    return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Payables</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/app/payment-projection')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Cash Flow Projection
          </Button>
          <Button variant="outline" onClick={() => navigate('/app/payment-runs')}>
            <FileStack className="w-4 h-4 mr-2" />
            Payment Runs
          </Button>
          <Button 
            onClick={handleCreatePaymentRun}
            disabled={selectedInvoiceIds.size === 0}
          >
            Create Payment Run
            {selectedInvoiceIds.size > 0 && ` (${selectedInvoiceIds.size})`}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <WidgetCard
          title="Total Payables"
          value={<CurrencyDisplay amount={stats.totalAmount} currency="USD" size="lg" />}
          subtitle={`${stats.totalCount} invoices`}
          icon={DollarSign}
        />
        <WidgetCard
          title="Overdue"
          value={<CurrencyDisplay amount={stats.overdueAmount} currency="USD" size="lg" />}
          subtitle={`${stats.overdueCount} invoices`}
          icon={AlertTriangle}
          variant={stats.overdueCount > 0 ? 'danger' : 'default'}
        />
        <WidgetCard
          title="Due in 7 Days"
          value={<CurrencyDisplay amount={stats.dueIn7DaysAmount} currency="USD" size="lg" />}
          subtitle={`${stats.dueIn7DaysCount} invoices`}
          icon={Calendar}
          variant={stats.dueIn7DaysCount > 0 ? 'warning' : 'default'}
        />
        <WidgetCard
          title="Approved & Pending"
          value={stats.totalCount}
          subtitle="Awaiting payment"
          icon={CalendarDays}
        />
      </div>

      {/* Selection Banner */}
      {selectedInvoiceIds.size > 0 && (
        <div className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
          <p className="text-sm">
            <span className="font-semibold">{selectedInvoiceIds.size}</span> invoice(s) selected
            <span className="text-muted-foreground ml-2">
              Total: <CurrencyDisplay 
                amount={payables
                  .filter((inv) => selectedInvoiceIds.has(inv.id))
                  .reduce((sum, inv) => sum + inv.baseAmount, 0)} 
                currency="USD" 
              />
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedInvoiceIds(new Set())}>
              Clear Selection
            </Button>
            <Button size="sm" onClick={handleCreatePaymentRun}>
              Create Payment Run
            </Button>
          </div>
        </div>
      )}

      {/* Payables Table */}
      <DataTable
        data={sortedPayables}
        columns={columns}
        onRowClick={(invoice) => navigate(`/app/invoices/${invoice.id}`)}
        emptyMessage="No approved invoices awaiting payment"
      />
    </div>
  );
}
