import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CurrencyDisplay } from '../components/ui/currency-display';
import { StatusBadge } from '../components/ui/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { mockPaymentRuns, mockInvoices } from '../data/mockData';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Download, FileText, Calendar, Banknote, Hash } from 'lucide-react';

export default function PaymentRunDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const paymentRun = mockPaymentRuns.find((pr) => pr.id === id);

  if (!paymentRun) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Payment Run Not Found</h2>
          <Button variant="outline" onClick={() => navigate('/app/payment-runs')}>
            Back to Payment Runs
          </Button>
        </div>
      </div>
    );
  }

  const invoices = mockInvoices.filter((inv) => paymentRun.invoiceIds.includes(inv.id));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/payment-runs')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="page-title">Payment Run {paymentRun.id.toUpperCase()}</h1>
            <p className="text-muted-foreground">
              Created on {format(parseISO(paymentRun.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <StatusBadge 
          status={paymentRun.status === 'submitted' ? 'paid' : 'draft'} 
          className="text-base px-4 py-1.5"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Summary Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <CurrencyDisplay amount={paymentRun.totalAmount} currency={paymentRun.currency} size="lg" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Currency</p>
                <p className="text-lg font-semibold">{paymentRun.currency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Invoices</p>
                <p className="text-lg font-semibold">{paymentRun.invoiceCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bank Format</p>
                <p className="text-lg font-semibold">{paymentRun.bankFormat || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentRun.status === 'submitted' && paymentRun.exportedFileName && (
              <Button className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download {paymentRun.exportedFileName}
              </Button>
            )}
            {paymentRun.submittedAt && (
              <div className="text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 inline mr-1" />
                Submitted on {format(parseISO(paymentRun.submittedAt), 'MMM d, yyyy HH:mm')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Included Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Payment Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/app/invoices/${invoice.id}`)}
                >
                  <TableCell className="font-medium">{invoice.supplierName}</TableCell>
                  <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay amount={invoice.amount} currency={invoice.currency} />
                  </TableCell>
                  <TableCell>{invoice.currency}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {invoice.paymentReference || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
