import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { CurrencyDisplay } from '../components/ui/currency-display';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { mockInvoices, mockVendors } from '../data/mockData';
import { Invoice } from '../types';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Download, AlertTriangle, CheckCircle2, FileText, Banknote, X } from 'lucide-react';
import { toast } from '../components/ui/use-toast';

const BANK_FORMATS = [
  { id: 'hsbc-fps', name: 'HSBC FPS CSV' },
  { id: 'hsbc-chats', name: 'HSBC CHATS CSV' },
  { id: 'boa-ach', name: 'Bank of America ACH' },
  { id: 'barclays-bacs', name: 'Barclays BACS' },
];

export default function CreatePaymentRun() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get selected invoice IDs from navigation state
  const initialInvoiceIds = (location.state?.selectedInvoiceIds as string[]) || [];
  
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>(initialInvoiceIds);
  const [bankFormat, setBankFormat] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get only approved invoices
  const approvedInvoices = useMemo(() => {
    return mockInvoices.filter((inv) => inv.status === 'approved');
  }, []);

  const selectedInvoices = approvedInvoices.filter((inv) => selectedInvoiceIds.includes(inv.id));

  // Calculate totals and validations
  const { totalAmount, currencies, hasMultipleCurrencies, hasMissingBankDetails } = useMemo(() => {
    const total = selectedInvoices.reduce((sum, inv) => sum + inv.baseAmount, 0);
    const uniqueCurrencies = [...new Set(selectedInvoices.map((inv) => inv.currency))];
    
    const missingBankDetails = selectedInvoices.some((inv) => {
      const vendor = mockVendors.find((v) => v.id === inv.supplierId);
      return !vendor?.bankAccount || !vendor?.bankName;
    });

    return {
      totalAmount: total,
      currencies: uniqueCurrencies,
      hasMultipleCurrencies: uniqueCurrencies.length > 1,
      hasMissingBankDetails: missingBankDetails,
    };
  }, [selectedInvoices]);

  const canExport = selectedInvoices.length > 0 && bankFormat && !hasMissingBankDetails;

  const handleRemoveInvoice = (invoiceId: string) => {
    setSelectedInvoiceIds((prev) => prev.filter((id) => id !== invoiceId));
  };

  const handleGenerateBankFile = () => {
    const selectedFormat = BANK_FORMATS.find((f) => f.id === bankFormat);
    const fileName = `${selectedFormat?.name.replace(/\s+/g, '_')}_Payment_Run_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
    // Generate CSV content
    const headers = ['Supplier', 'Invoice Number', 'Amount', 'Currency', 'Bank Name', 'Account Number'];
    const rows = selectedInvoices.map((inv) => {
      const vendor = mockVendors.find((v) => v.id === inv.supplierId);
      return [
        inv.supplierName,
        inv.invoiceNumber,
        inv.amount.toString(),
        inv.currency,
        vendor?.bankName || '',
        vendor?.bankAccount || '',
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    setIsSubmitted(true);
    toast({
      title: 'Payment Run Generated',
      description: `${fileName} has been downloaded. ${selectedInvoices.length} invoices marked as paid.`,
    });
  };

  if (isSubmitted) {
    return (
      <div className="page-container">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Run Submitted</h1>
          <p className="text-muted-foreground mb-6">
            Your bank file has been generated and downloaded. {selectedInvoices.length} invoices have been marked as paid.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/app/payment-runs')}>
              View Payment Runs
            </Button>
            <Button onClick={() => navigate('/app/payables')}>
              Back to Payables
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/payables')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="page-title">Payment Run (Draft)</h1>
            <p className="text-muted-foreground">
              {format(new Date(), 'MMMM d, yyyy')} • {currencies.length > 0 ? currencies.join(', ') : 'No currency'}
            </p>
          </div>
        </div>
      </div>

      {/* Validation Alerts */}
      <div className="space-y-4 mb-6">
        {hasMultipleCurrencies && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Mixed Currencies Detected</AlertTitle>
            <AlertDescription>
              This payment run contains invoices in multiple currencies ({currencies.join(', ')}). 
              Consider creating separate runs for each currency.
            </AlertDescription>
          </Alert>
        )}
        {hasMissingBankDetails && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Missing Bank Details</AlertTitle>
            <AlertDescription>
              Some suppliers are missing bank account information. Please update vendor details before exporting.
            </AlertDescription>
          </Alert>
        )}
        {selectedInvoices.length === 0 && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertTitle>No Invoices Selected</AlertTitle>
            <AlertDescription>
              Go back to Payables and select approved invoices to include in this payment run.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Selected Invoices ({selectedInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedInvoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.supplierName}</TableCell>
                      <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="text-right">
                        <CurrencyDisplay amount={invoice.amount} currency={invoice.currency} />
                      </TableCell>
                      <TableCell>{invoice.currency}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveInvoice(invoice.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No invoices selected. Return to Payables to select invoices.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              Export Settings
            </CardTitle>
            <CardDescription>
              Configure bank file format and generate payment batch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Bank Format</label>
              <Select value={bankFormat} onValueChange={setBankFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank format" />
                </SelectTrigger>
                <SelectContent>
                  {BANK_FORMATS.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      {format.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <CurrencyDisplay amount={totalAmount} currency="USD" size="lg" />
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">Invoice Count</span>
                <span className="font-semibold">{selectedInvoices.length}</span>
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!canExport}
              onClick={handleGenerateBankFile}
            >
              <Download className="w-4 h-4 mr-2" />
              Generate Bank File
            </Button>

            {!canExport && selectedInvoices.length > 0 && !bankFormat && (
              <p className="text-sm text-muted-foreground text-center">
                Select a bank format to continue
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
