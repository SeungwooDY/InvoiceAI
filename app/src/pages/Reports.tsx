import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DataTable } from '../components/ui/data-table';
import { CurrencyDisplay } from '../components/ui/currency-display';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { mockInvoices, mockVendors } from '../data/mockData';
import {
  Download,
  FileText,
  Users,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, subMonths } from 'date-fns';

export default function Reports() {
  const { hasPermission } = useAuth();
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState('all');

  const canExport = hasPermission('reports.export');

  // Filter invoices by date range
  const filteredInvoices = mockInvoices.filter((inv) => {
    const issueDate = parseISO(inv.issueDate);
    const from = parseISO(dateFrom);
    const to = parseISO(dateTo);
    
    if (isBefore(issueDate, from) || isAfter(issueDate, to)) return false;
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    
    return true;
  });

  // Calculate top suppliers
  const supplierSpend = mockVendors.map((vendor) => {
    const vendorInvoices = mockInvoices.filter((inv) => inv.supplierId === vendor.id);
    const totalSpend = vendorInvoices.reduce((sum, inv) => sum + inv.baseAmount, 0);
    const invoiceCount = vendorInvoices.length;
    return { ...vendor, totalSpend, invoiceCount };
  }).sort((a, b) => b.totalSpend - a.totalSpend);

  // Calculate overdue history
  const overdueInvoices = mockInvoices.filter((inv) => {
    if (inv.status === 'paid' || inv.status === 'reconciled' || inv.status === 'rejected') {
      return false;
    }
    return isBefore(parseISO(inv.dueDate), new Date());
  });

  const invoiceColumns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (inv: typeof mockInvoices[0]) => (
        <span className="font-medium">{inv.invoiceNumber}</span>
      ),
    },
    {
      key: 'supplierName',
      header: 'Supplier',
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      render: (inv: typeof mockInvoices[0]) => format(parseISO(inv.issueDate), 'MMM d, yyyy'),
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (inv: typeof mockInvoices[0]) => (
        <CurrencyDisplay amount={inv.amount} currency={inv.currency} />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (inv: typeof mockInvoices[0]) => (
        <span className="capitalize">{inv.status}</span>
      ),
    },
  ];

  const supplierColumns = [
    {
      key: 'name',
      header: 'Supplier',
      render: (vendor: typeof supplierSpend[0]) => (
        <span className="font-medium">{vendor.name}</span>
      ),
    },
    {
      key: 'invoiceCount',
      header: 'Invoices',
      className: 'text-center',
    },
    {
      key: 'totalSpend',
      header: 'Total Spend',
      className: 'text-right',
      render: (vendor: typeof supplierSpend[0]) => (
        <CurrencyDisplay amount={vendor.totalSpend} currency="USD" />
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
      </div>

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="w-4 h-4" />
            Invoice Report
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Users className="w-4 h-4" />
            Top Suppliers
          </TabsTrigger>
          <TabsTrigger value="overdue" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Overdue History
          </TabsTrigger>
        </TabsList>

        {/* Invoice Report */}
        <TabsContent value="invoices">
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="reconciled">Reconciled</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1" />
                {canExport && (
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredInvoices.length} invoices found
            </p>
          </div>

          <DataTable
            data={filteredInvoices}
            columns={invoiceColumns}
            emptyMessage="No invoices found for the selected criteria"
          />
        </TabsContent>

        {/* Top Suppliers */}
        <TabsContent value="suppliers">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              Ranked by total spend
            </p>
            {canExport && (
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>

          <DataTable
            data={supplierSpend}
            columns={supplierColumns}
            emptyMessage="No supplier data available"
          />
        </TabsContent>

        {/* Overdue History */}
        <TabsContent value="overdue">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {overdueInvoices.length} currently overdue
              </p>
            </div>
            {canExport && (
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>

          {overdueInvoices.length > 0 ? (
            <DataTable
              data={overdueInvoices}
              columns={[
                ...invoiceColumns.filter((c) => c.key !== 'status'),
                {
                  key: 'dueDate',
                  header: 'Due Date',
                  render: (inv: typeof mockInvoices[0]) => (
                    <span className="text-rose-600">
                      {format(parseISO(inv.dueDate), 'MMM d, yyyy')}
                    </span>
                  ),
                },
              ]}
              emptyMessage="No overdue invoices"
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="font-medium mb-1">No overdue invoices</p>
                <p className="text-sm text-muted-foreground">All invoices are up to date</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
