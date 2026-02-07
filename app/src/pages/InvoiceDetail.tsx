import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge } from '../components/ui/status-badge';
import { CurrencyDisplay } from '../components/ui/currency-display';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { mockInvoices, mockVendors } from '../data/mockData';
import {
  ArrowLeft,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Mail,
  MessageSquare,
  Upload,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const invoice = mockInvoices.find((inv) => inv.id === id);
  const vendor = invoice ? mockVendors.find((v) => v.id === invoice.supplierId) : null;

  if (!invoice) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Invoice not found</h2>
          <p className="text-muted-foreground mb-4">The invoice you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/app/invoices')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  const sourceIcon = {
    email: Mail,
    whatsapp: MessageSquare,
    upload: Upload,
  }[invoice.source];

  const SourceIcon = sourceIcon;

  const timelineEvents = [
    {
      date: invoice.createdAt,
      title: 'Invoice Created',
      description: `Received via ${invoice.source}`,
      icon: FileText,
    },
    ...(invoice.approvedAt
      ? [{
          date: invoice.approvedAt,
          title: 'Approved',
          description: `By ${invoice.approvedBy}`,
          icon: CheckCircle2,
        }]
      : []),
    ...(invoice.rejectedAt
      ? [{
          date: invoice.rejectedAt,
          title: 'Rejected',
          description: `By ${invoice.rejectedBy}: ${invoice.rejectionReason}`,
          icon: XCircle,
        }]
      : []),
    ...(invoice.paidAt
      ? [{
          date: invoice.paidAt,
          title: 'Payment Recorded',
          description: `Ref: ${invoice.paymentReference}`,
          icon: CreditCard,
        }]
      : []),
    ...(invoice.reconciledAt
      ? [{
          date: invoice.reconciledAt,
          title: 'Reconciled',
          description: 'Matched with bank transaction',
          icon: CheckCircle2,
        }]
      : []),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const canApprove = hasPermission('invoices.approve') && invoice.status === 'pending';
  const canMarkPaid = hasPermission('payables.mark_paid') && invoice.status === 'approved';
  const canEdit = hasPermission('invoices.edit') && invoice.status === 'draft';

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/invoices')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1" />
        <StatusBadge status={invoice.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoice Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[8.5/11] bg-secondary/50 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>PDF Preview</p>
                  <p className="text-sm">{invoice.invoiceNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extracted Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Invoice Number</Label>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Source</Label>
                  <div className="flex items-center gap-2">
                    <SourceIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="capitalize">{invoice.source}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Issue Date</Label>
                  <p>{format(parseISO(invoice.issueDate), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Due Date</Label>
                  <p>{format(parseISO(invoice.dueDate), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <CurrencyDisplay amount={invoice.amount} currency={invoice.currency} size="lg" />
                </div>
                {invoice.currency !== invoice.baseCurrency && (
                  <div>
                    <Label className="text-muted-foreground">Base Amount</Label>
                    <CurrencyDisplay amount={invoice.baseAmount} currency={invoice.baseCurrency} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canApprove && (
                <>
                  <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full border-success/50 text-success bg-success/10 hover:bg-success/20 hover:border-success" variant="outline">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve Invoice
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Invoice</DialogTitle>
                        <DialogDescription>
                          Approve this invoice for payment.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Note (optional)</Label>
                          <Textarea
                            placeholder="Add a note..."
                            value={approvalNote}
                            onChange={(e) => setApprovalNote(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setShowApprovalDialog(false)} variant="outline" className="border-success/50 text-success bg-success/10 hover:bg-success/20 hover:border-success">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="destructive">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Invoice
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Invoice</DialogTitle>
                        <DialogDescription>
                          Please provide a reason for rejection.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Reason (required)</Label>
                          <Textarea
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button variant="destructive" disabled={!rejectionReason}>
                          Reject
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {canMarkPaid && (
                <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Mark as Paid
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Payment</DialogTitle>
                      <DialogDescription>
                        Enter payment details to mark this invoice as paid.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Payment Date</Label>
                        <Input
                          type="date"
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Payment Reference</Label>
                        <Input
                          placeholder="e.g., WIRE-20241220-001"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setShowPaymentDialog(false)}>
                        Record Payment
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {canEdit && (
                <Button className="w-full" variant="outline">
                  Edit Invoice
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Supplier Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Supplier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">{vendor?.name}</p>
                  <p className="text-sm text-muted-foreground">{vendor?.email}</p>
                </div>
                {vendor?.address && (
                  <p className="text-sm text-muted-foreground">{vendor.address}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/app/vendors/${vendor?.id}`)}
                >
                  View Supplier Details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <event.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(parseISO(event.date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
