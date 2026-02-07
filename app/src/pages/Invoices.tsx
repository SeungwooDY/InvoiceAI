import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DataTable } from '../components/ui/data-table';
import { StatusBadge } from '../components/ui/status-badge';
import { CurrencyDisplay } from '../components/ui/currency-display';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { mockInvoices, mockVendors } from '../data/mockData';
import { Invoice, InvoiceStatus } from '../types';
import { Plus, Search, Filter, X } from 'lucide-react';
import { format, parseISO, isBefore } from 'date-fns';

const statusOptions: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'reconciled', label: 'Reconciled' },
  { value: 'rejected', label: 'Rejected' },
];

const currencyOptions = [
  { value: 'all', label: 'All Currencies' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

export default function Invoices() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredInvoices = useMemo(() => {
    let result = [...mockInvoices];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.supplierName.toLowerCase().includes(query) ||
          inv.invoiceNumber.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((inv) => inv.status === statusFilter);
    }

    // Currency filter
    if (currencyFilter !== 'all') {
      result = result.filter((inv) => inv.currency === currencyFilter);
    }

    // Supplier filter
    if (supplierFilter !== 'all') {
      result = result.filter((inv) => inv.supplierId === supplierFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = a[sortColumn as keyof Invoice] as string | number;
      let bVal: string | number = b[sortColumn as keyof Invoice] as string | number;

      if (sortColumn === 'amount') {
        aVal = a.baseAmount;
        bVal = b.baseAmount;
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }

      return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [searchQuery, statusFilter, currencyFilter, supplierFilter, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrencyFilter('all');
    setSupplierFilter('all');
  };

  const hasActiveFilters = statusFilter !== 'all' || currencyFilter !== 'all' || supplierFilter !== 'all';

  const isOverdue = (invoice: Invoice) => {
    if (invoice.status === 'paid' || invoice.status === 'reconciled' || invoice.status === 'rejected') {
      return false;
    }
    return isBefore(parseISO(invoice.dueDate), new Date());
  };

  const columns = [
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
      render: (invoice: Invoice) => (
        <div className="flex items-center gap-2">
          <span>{format(parseISO(invoice.dueDate), 'MMM d, yyyy')}</span>
          {isOverdue(invoice) && <StatusBadge status="overdue" />}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (invoice: Invoice) => <StatusBadge status={invoice.status} />,
    },
    {
      key: 'approvers',
      header: 'Approver(s)',
      render: (invoice: Invoice) => (
        <span className="text-muted-foreground">
          {invoice.approvers.length > 0 ? invoice.approvers.join(', ') : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Invoices</h1>
        {hasPermission('invoices.create') && (
          <Button onClick={() => navigate('/app/invoices/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as InvoiceStatus | 'all')}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Currency Filter */}
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Supplier Filter */}
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {mockVendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredInvoices.length} of {mockInvoices.length} invoices
        </p>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredInvoices}
        columns={columns}
        onRowClick={(invoice) => navigate(`/app/invoices/${invoice.id}`)}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No invoices found"
      />
    </div>
  );
}
