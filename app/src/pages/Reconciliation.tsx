import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CurrencyDisplay } from '../components/ui/currency-display';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { mockBankTransactions, mockInvoices } from '../data/mockData';
import { BankTransaction, MatchConfidence } from '../types';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Link2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '../lib/utils';

const confidenceConfig: Record<MatchConfidence, { label: string; icon: typeof CheckCircle2; className: string }> = {
  confident: {
    label: 'Confident Match',
    icon: CheckCircle2,
    className: 'match-confident border',
  },
  possible: {
    label: 'Possible Match',
    icon: AlertCircle,
    className: 'match-possible border',
  },
  unmatched: {
    label: 'No Match',
    icon: XCircle,
    className: 'match-unmatched border',
  },
};

export default function Reconciliation() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'matched' | 'unmatched'>('all');

  const canMatch = hasPermission('reconciliation.match');

  const filteredTransactions = mockBankTransactions.filter((tx) => {
    if (filter === 'matched') return tx.matchConfidence && tx.matchConfidence !== 'unmatched';
    if (filter === 'unmatched') return !tx.matchConfidence || tx.matchConfidence === 'unmatched';
    return true;
  });

  const stats = {
    total: mockBankTransactions.length,
    reconciled: mockBankTransactions.filter((tx) => tx.isReconciled).length,
    confident: mockBankTransactions.filter((tx) => tx.matchConfidence === 'confident' && !tx.isReconciled).length,
    possible: mockBankTransactions.filter((tx) => tx.matchConfidence === 'possible').length,
    unmatched: mockBankTransactions.filter((tx) => tx.matchConfidence === 'unmatched').length,
  };

  const getMatchedInvoice = (invoiceId?: string) => {
    if (!invoiceId) return null;
    return mockInvoices.find((inv) => inv.id === invoiceId);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Bank Reconciliation</h1>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Statement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-semibold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-semibold text-emerald-600">{stats.reconciled}</p>
            <p className="text-sm text-muted-foreground">Reconciled</p>
          </CardContent>
        </Card>
        <Card className="match-confident border">
          <CardContent className="pt-4">
            <p className="text-2xl font-semibold">{stats.confident}</p>
            <p className="text-sm text-muted-foreground">Confident</p>
          </CardContent>
        </Card>
        <Card className="match-possible border">
          <CardContent className="pt-4">
            <p className="text-2xl font-semibold">{stats.possible}</p>
            <p className="text-sm text-muted-foreground">Possible</p>
          </CardContent>
        </Card>
        <Card className="match-unmatched border">
          <CardContent className="pt-4">
            <p className="text-2xl font-semibold">{stats.unmatched}</p>
            <p className="text-sm text-muted-foreground">Unmatched</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="matched">Matched</SelectItem>
            <SelectItem value="unmatched">Unmatched</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTransactions.map((transaction) => {
          const config = transaction.matchConfidence
            ? confidenceConfig[transaction.matchConfidence]
            : confidenceConfig.unmatched;
          const ConfidenceIcon = config.icon;
          const matchedInvoice = getMatchedInvoice(transaction.matchedInvoiceId);

          return (
            <Card
              key={transaction.id}
              className={cn(
                'transition-all',
                transaction.isReconciled && 'opacity-60',
                !transaction.isReconciled && config.className
              )}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  {/* Transaction Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ConfidenceIcon className={cn(
                        'w-4 h-4',
                        transaction.matchConfidence === 'confident' && 'text-emerald-600',
                        transaction.matchConfidence === 'possible' && 'text-amber-600',
                        transaction.matchConfidence === 'unmatched' && 'text-rose-600'
                      )} />
                      <span className="text-sm text-muted-foreground">{config.label}</span>
                      {transaction.isReconciled && (
                        <span className="status-badge status-reconciled">Reconciled</span>
                      )}
                    </div>
                    <p className="font-medium truncate">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(transaction.date), 'MMM d, yyyy')}
                      {transaction.reference && ` • Ref: ${transaction.reference}`}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <CurrencyDisplay
                      amount={transaction.amount}
                      currency={transaction.currency}
                      showSign
                      size="lg"
                    />
                  </div>

                  {/* Match Arrow */}
                  {matchedInvoice && (
                    <>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      {/* Matched Invoice */}
                      <div className="w-48">
                        <p className="text-sm font-medium">{matchedInvoice.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">{matchedInvoice.supplierName}</p>
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  {canMatch && !transaction.isReconciled && (
                    <div className="flex gap-2">
                      {matchedInvoice ? (
                        <>
                          <Button size="sm">Confirm Match</Button>
                          <Button size="sm" variant="outline">Change</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline">
                            <Link2 className="w-4 h-4 mr-1" />
                            Match
                          </Button>
                          <Button size="sm" variant="ghost">Other Expense</Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No transactions found</p>
        </div>
      )}
    </div>
  );
}
