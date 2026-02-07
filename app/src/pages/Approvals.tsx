import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge } from '../components/ui/status-badge';
import { CurrencyDisplay } from '../components/ui/currency-display';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { mockApprovalRequests } from '../data/mockData';
import { ApprovalRequest } from '../types';
import {
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Building2,
  Calendar,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Approvals() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingRequests = mockApprovalRequests.filter((req) => req.status === 'pending');

  const handleApprove = () => {
    // In real app, this would call an API
    console.log('Approving:', selectedRequest?.id, approvalNote);
    setShowApproveDialog(false);
    setApprovalNote('');
    setSelectedRequest(null);
  };

  const handleReject = () => {
    // In real app, this would call an API
    console.log('Rejecting:', selectedRequest?.id, rejectionReason);
    setShowRejectDialog(false);
    setRejectionReason('');
    setSelectedRequest(null);
  };

  if (pendingRequests.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Approvals</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
          <p className="text-muted-foreground">No invoices pending your approval.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Approvals</h1>
          <p className="text-muted-foreground mt-1">
            {pendingRequests.length} invoice{pendingRequests.length !== 1 ? 's' : ''} awaiting your approval
          </p>
        </div>
      </div>

      {/* Approval Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pendingRequests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <CardHeader className="bg-secondary/30 pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {request.invoice.invoiceNumber}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submitted {format(parseISO(request.requestedAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <StatusBadge status="pending" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Invoice Summary */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{request.invoice.supplierName}</p>
                    <p className="text-sm text-muted-foreground">Supplier</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{format(parseISO(request.invoice.dueDate), 'MMM d, yyyy')}</p>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay
                      amount={request.invoice.amount}
                      currency={request.invoice.currency}
                      size="lg"
                    />
                    {request.invoice.currency !== request.invoice.baseCurrency && (
                      <p className="text-xs text-muted-foreground">
                        ≈ <CurrencyDisplay
                          amount={request.invoice.baseAmount}
                          currency={request.invoice.baseCurrency}
                          size="sm"
                        />
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/app/invoices/${request.invoice.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowRejectDialog(true);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-success/50 text-success bg-success/10 hover:bg-success/20 hover:border-success"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowApproveDialog(true);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Invoice</DialogTitle>
            <DialogDescription>
              Approve {selectedRequest?.invoice.invoiceNumber} from {selectedRequest?.invoice.supplierName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4 p-3 bg-secondary rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount</span>
                <CurrencyDisplay
                  amount={selectedRequest?.invoice.amount || 0}
                  currency={selectedRequest?.invoice.currency || 'USD'}
                  size="lg"
                />
              </div>
            </div>
            <div>
              <Label>Note (optional)</Label>
              <Textarea
                placeholder="Add a note for the finance team..."
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} variant="outline" className="border-success/50 text-success bg-success/10 hover:bg-success/20 hover:border-success">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Invoice</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4 p-3 bg-secondary rounded-lg">
              <p className="font-medium">{selectedRequest?.invoice.invoiceNumber}</p>
              <p className="text-sm text-muted-foreground">{selectedRequest?.invoice.supplierName}</p>
            </div>
            <div>
              <Label>Reason (required)</Label>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason}>
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
