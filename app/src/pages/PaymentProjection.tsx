import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { CurrencyDisplay } from '../components/ui/currency-display';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { mockInvoices, mockBankAccounts } from '../data/mockData';
import { BankAccount, Invoice } from '../types';
import { format } from 'date-fns';
import {
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Banknote,
  ArrowRight,
  Edit2,
  Save,
  X,
  RefreshCw,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

// FX rates (simulated live rates with timestamp)
interface FXRates {
  USD: number;
  EUR: number;
  GBP: number;
  [key: string]: number;
}

const fetchFXRates = (): { rates: FXRates; timestamp: Date } => {
  // Simulated live FX rates (in production, this would fetch from an API)
  return {
    rates: {
      USD: 1,
      EUR: 1.08,
      GBP: 1.27,
    },
    timestamp: new Date(),
  };
};

export default function PaymentProjection() {
  const navigate = useNavigate();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState<string>('');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set());
  const [fxRates, setFxRates] = useState<FXRates>({ USD: 1, EUR: 1.08, GBP: 1.27 });
  const [fxLastUpdated, setFxLastUpdated] = useState<Date>(new Date());
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

  // Fetch FX rates on mount
  useEffect(() => {
    const { rates, timestamp } = fetchFXRates();
    setFxRates(rates);
    setFxLastUpdated(timestamp);
  }, []);

  const refreshFXRates = () => {
    const { rates, timestamp } = fetchFXRates();
    setFxRates(rates);
    setFxLastUpdated(timestamp);
  };

  // Get eligible invoices (approved or pending - exclude paid/rejected)
  const eligibleInvoices = useMemo(() => {
    return mockInvoices.filter(
      (inv) => inv.status === 'approved' || inv.status === 'pending'
    );
  }, []);

  // Get unique suppliers for filtering
  const uniqueSuppliers = useMemo(() => {
    const suppliers = [...new Set(eligibleInvoices.map((inv) => inv.supplierName))];
    return suppliers.sort();
  }, [eligibleInvoices]);

  // Filter invoices by supplier
  const filteredInvoices = useMemo(() => {
    if (supplierFilter === 'all') return eligibleInvoices;
    return eligibleInvoices.filter((inv) => inv.supplierName === supplierFilter);
  }, [eligibleInvoices, supplierFilter]);

  // Convert amount to USD using FX rates
  const convertToUSD = (amount: number, currency: string): number => {
    const rate = fxRates[currency] || 1;
    return amount * rate;
  };

  // Calculate total starting balance (converted to USD)
  const totalStartingBalance = useMemo(() => {
    return bankAccounts.reduce((sum, acc) => {
      return sum + convertToUSD(acc.balance, acc.currency);
    }, 0);
  }, [bankAccounts, fxRates]);

  // Calculate selected invoices total (converted to USD)
  const selectedInvoicesData = useMemo(() => {
    const selected = eligibleInvoices.filter((inv) => selectedInvoiceIds.has(inv.id));
    const totalOutflows = selected.reduce((sum, inv) => {
      return sum + convertToUSD(inv.amount, inv.currency);
    }, 0);
    return {
      invoices: selected,
      count: selected.length,
      totalOutflows,
    };
  }, [eligibleInvoices, selectedInvoiceIds, fxRates]);

  // Calculate projected remaining balance
  const projectedRemainingBalance = totalStartingBalance - selectedInvoicesData.totalOutflows;

  // Chart data for before/after visualization
  const chartData = useMemo(() => {
    return [
      {
        name: 'Starting Balance',
        value: Math.round(totalStartingBalance),
        fill: 'hsl(var(--primary))',
      },
      {
        name: 'After Payment',
        value: Math.round(projectedRemainingBalance),
        fill: projectedRemainingBalance < 100000 ? 'hsl(var(--destructive))' : 'hsl(var(--success))',
      },
    ];
  }, [totalStartingBalance, projectedRemainingBalance]);

  // Risk alerts based on selected invoices
  const riskAlerts = useMemo(() => {
    const alerts: { type: 'warning' | 'danger'; message: string }[] = [];

    if (selectedInvoicesData.count === 0) return alerts;

    // Low balance warning
    if (projectedRemainingBalance < 100000) {
      alerts.push({
        type: 'danger',
        message: `Remaining balance would drop below $100,000 threshold`,
      });
    }

    if (projectedRemainingBalance < 0) {
      alerts.push({
        type: 'danger',
        message: `Insufficient funds: would result in negative balance of $${Math.abs(projectedRemainingBalance).toLocaleString()}`,
      });
    }

    // High FX exposure
    const nonUsdSelected = selectedInvoicesData.invoices.filter((inv) => inv.currency !== 'USD');
    if (nonUsdSelected.length > 0) {
      const fxTotal = nonUsdSelected.reduce((sum, inv) => sum + convertToUSD(inv.amount, inv.currency), 0);
      const fxPercentage = (fxTotal / selectedInvoicesData.totalOutflows) * 100;
      if (fxPercentage > 30) {
        alerts.push({
          type: 'warning',
          message: `High FX exposure: ${fxPercentage.toFixed(0)}% of payments in non-USD currencies`,
        });
      }
    }

    // Large payment cluster
    if (selectedInvoicesData.count >= 5) {
      alerts.push({
        type: 'warning',
        message: `Large batch: ${selectedInvoicesData.count} invoices selected for immediate payment`,
      });
    }

    return alerts;
  }, [selectedInvoicesData, projectedRemainingBalance, fxRates]);

  const handleEditBalance = (account: BankAccount) => {
    setEditingAccountId(account.id);
    setEditBalance(account.balance.toString());
  };

  const handleSaveBalance = (accountId: string) => {
    setBankAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId ? { ...acc, balance: parseFloat(editBalance) || 0 } : acc
      )
    );
    setEditingAccountId(null);
  };

  const handleToggleInvoice = (invoiceId: string) => {
    setSelectedInvoiceIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(invoiceId)) {
        newSet.delete(invoiceId);
      } else {
        newSet.add(invoiceId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedInvoiceIds.size === filteredInvoices.length) {
      // Deselect all filtered
      setSelectedInvoiceIds((prev) => {
        const newSet = new Set(prev);
        filteredInvoices.forEach((inv) => newSet.delete(inv.id));
        return newSet;
      });
    } else {
      // Select all filtered
      setSelectedInvoiceIds((prev) => {
        const newSet = new Set(prev);
        filteredInvoices.forEach((inv) => newSet.add(inv.id));
        return newSet;
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedInvoiceIds(new Set());
  };

  const allFilteredSelected = filteredInvoices.length > 0 && 
    filteredInvoices.every((inv) => selectedInvoiceIds.has(inv.id));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Projection</h1>
          <p className="text-muted-foreground">
            Simulate the impact of paying selected invoices immediately
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            FX rates updated {format(fxLastUpdated, 'HH:mm')}
          </div>
          <Button variant="outline" size="sm" onClick={refreshFXRates}>
            Refresh FX
          </Button>
          <Button onClick={() => navigate('/app/payables')}>
            <ArrowRight className="w-4 h-4 mr-2" />
            Go to Payables
          </Button>
        </div>
      </div>

      {/* Risk Alerts */}
      {riskAlerts.length > 0 && (
        <div className="space-y-3 mb-6">
          {riskAlerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'danger' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.type === 'danger' ? 'Critical Alert' : 'Warning'}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Starting Balance</p>
                <CurrencyDisplay amount={totalStartingBalance} currency="USD" size="lg" />
              </div>
              <Banknote className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Outflows</p>
                <div className="text-destructive">
                  <CurrencyDisplay amount={selectedInvoicesData.totalOutflows} currency="USD" size="lg" />
                </div>
              </div>
              <TrendingDown className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className={projectedRemainingBalance < 100000 ? 'border-destructive' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remaining Balance</p>
                <div className={projectedRemainingBalance < 100000 ? 'text-destructive' : 'text-success'}>
                  <CurrencyDisplay amount={projectedRemainingBalance} currency="USD" size="lg" />
                </div>
              </div>
              <DollarSign className={`w-8 h-8 ${projectedRemainingBalance < 100000 ? 'text-destructive' : 'text-success'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invoices Selected</p>
                <p className="text-2xl font-bold">{selectedInvoicesData.count}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bank Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              Bank Accounts
            </CardTitle>
            <CardDescription>Current balances (edit to simulate)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bankAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{account.currency}</p>
                  </div>
                  {editingAccountId === account.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editBalance}
                        onChange={(e) => setEditBalance(e.target.value)}
                        className="w-28 h-8"
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSaveBalance(account.id)}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingAccountId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CurrencyDisplay amount={account.balance} currency={account.currency} />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditBalance(account)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total (USD)</span>
                  <CurrencyDisplay amount={totalStartingBalance} currency="USD" size="lg" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Payment Impact
            </CardTitle>
            <CardDescription>
              {selectedInvoicesData.count > 0 
                ? `If you pay ${selectedInvoicesData.count} invoice${selectedInvoicesData.count > 1 ? 's' : ''} now, your balance drops from $${totalStartingBalance.toLocaleString()} to $${projectedRemainingBalance.toLocaleString()}`
                : 'Select invoices below to see the impact on your cash balance'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    className="text-muted-foreground"
                    domain={[0, 'auto']}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    width={120}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--popover-foreground))',
                    }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    cursor={{ fill: 'transparent' }}
                  />
                  <ReferenceLine 
                    x={100000} 
                    stroke="hsl(var(--destructive))" 
                    strokeDasharray="5 5"
                    label={{ value: '$100K Threshold', fill: 'hsl(var(--destructive))', fontSize: 10, position: 'top' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Select Invoices to Pay
              </CardTitle>
              <CardDescription>
                Choose which invoices to include in the stress-test simulation
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Supplier Filter */}
              <select 
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
              >
                <option value="all">All Suppliers</option>
                {uniqueSuppliers.map((supplier) => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
              {selectedInvoiceIds.size > 0 && (
                <Button variant="outline" size="sm" onClick={handleClearSelection}>
                  Clear Selection ({selectedInvoiceIds.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Original Amount</TableHead>
                <TableHead className="text-right">USD Equivalent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const isSelected = selectedInvoiceIds.has(invoice.id);
                const usdAmount = convertToUSD(invoice.amount, invoice.currency);
                return (
                  <TableRow 
                    key={invoice.id}
                    className={isSelected ? 'bg-primary/5' : ''}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleInvoice(invoice.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{invoice.supplierName}</TableCell>
                    <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === 'approved' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <CurrencyDisplay amount={invoice.amount} currency={invoice.currency} />
                      {invoice.currency !== 'USD' && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({invoice.currency})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <CurrencyDisplay amount={usdAmount} currency="USD" />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No eligible invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {selectedInvoiceIds.size > 0 && (
            <div className="mt-4 flex gap-3">
              <Button 
                onClick={() => {
                  navigate('/app/payables/create-payment-run', {
                    state: { selectedInvoiceIds: Array.from(selectedInvoiceIds) },
                  });
                }}
              >
                Create Payment Run ({selectedInvoiceIds.size} invoices)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
