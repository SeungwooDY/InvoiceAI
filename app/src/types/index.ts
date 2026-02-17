// User & Auth Types
export type UserRole = 'finance_manager' | 'approver' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  organizationId: string | null;
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  baseCurrency: string;
  logo?: string;
}

// Invoice Types
export type InvoiceStatus = 'draft' | 'pending' | 'approved' | 'paid' | 'reconciled' | 'rejected';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  currency: string;
  baseAmount: number;
  baseCurrency: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  approvers: string[];
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  paidAt?: string;
  paymentReference?: string;
  reconciledAt?: string;
  attachmentUrl?: string;
  source: 'email' | 'whatsapp' | 'upload';
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus[];
  supplierId?: string;
  currency?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  overdue?: boolean;
}

// Vendor Types
export interface Vendor {
  id: string;
  name: string;
  email?: string;
  address?: string;
  defaultCurrency: string;
  bankName?: string;
  bankAccount?: string;
  bankRouting?: string;
  invoiceCount: number;
  totalSpend: number;
  createdAt: string;
}

// Reconciliation Types
export type MatchConfidence = 'confident' | 'possible' | 'unmatched';

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  reference?: string;
  matchedInvoiceId?: string;
  matchConfidence?: MatchConfidence;
  isReconciled: boolean;
}

// Approval Types
export interface ApprovalRequest {
  id: string;
  invoiceId: string;
  invoice: Invoice;
  requestedAt: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
}

// Dashboard Types
export interface DashboardStats {
  awaitingApproval: number;
  overdueInvoices: number;
  dueNext7Days: number;
  dueNext30Days: number;
  totalPayables: number;
  baseCurrency: string;
}

export interface CurrencyExposure {
  currency: string;
  amount: number;
  baseAmount: number;
  percentage: number;
}

// Activity/Audit Types
export interface ActivityLog {
  id: string;
  action: string;
  entityType: 'invoice' | 'vendor' | 'payment' | 'reconciliation';
  entityId: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

// Payment Run Types
export type PaymentRunStatus = 'draft' | 'submitted';

export interface PaymentRun {
  id: string;
  date: string;
  currency: string;
  totalAmount: number;
  invoiceCount: number;
  invoiceIds: string[];
  status: PaymentRunStatus;
  bankFormat?: string;
  exportedFileName?: string;
  createdAt: string;
  submittedAt?: string;
}

// Cash Flow Projection Types
export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

export interface ProjectionDataPoint {
  date: string;
  balance: number;
  scenarioBalance?: number;
}

export interface ProjectionScenario {
  excludedInvoiceIds: string[];
  delayedInvoices: { invoiceId: string; newDueDate: string }[];
}
