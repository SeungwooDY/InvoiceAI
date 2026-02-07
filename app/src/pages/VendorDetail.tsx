import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DataTable } from '../components/ui/data-table';
import { StatusBadge } from '../components/ui/status-badge';
import { CurrencyDisplay } from '../components/ui/currency-display';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { mockVendors, mockInvoices } from '../data/mockData';
import { Invoice } from '../types';
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Landmark,
  FileText,
  Edit,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const vendor = mockVendors.find((v) => v.id === id);
  const vendorInvoices = mockInvoices.filter((inv) => inv.supplierId === id);

  if (!vendor) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Vendor not found</h2>
          <p className="text-muted-foreground mb-4">The vendor you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/app/vendors')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vendors
          </Button>
        </div>
      </div>
    );
  }

  const invoiceColumns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (invoice: Invoice) => (
        <span className="font-medium">{invoice.invoiceNumber}</span>
      ),
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      render: (invoice: Invoice) => format(parseISO(invoice.issueDate), 'MMM d, yyyy'),
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (invoice: Invoice) => (
        <CurrencyDisplay amount={invoice.amount} currency={invoice.currency} />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (invoice: Invoice) => <StatusBadge status={invoice.status} />,
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/vendors')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1" />
        {hasPermission('vendors.edit') && (
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Vendor
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-muted-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">{vendor.name}</h1>
                  <p className="text-muted-foreground">
                    Default Currency: {vendor.defaultCurrency}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Invoice History
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {vendorInvoices.length} invoices
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                data={vendorInvoices}
                columns={invoiceColumns}
                onRowClick={(invoice) => navigate(`/app/invoices/${invoice.id}`)}
                emptyMessage="No invoices from this vendor"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendor.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${vendor.email}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {vendor.email}
                    </a>
                  </div>
                </div>
              )}
              {vendor.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="text-sm">{vendor.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bank Details */}
          {vendor.bankName && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Landmark className="w-5 h-5" />
                  Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Bank Name</p>
                  <p className="font-medium">{vendor.bankName}</p>
                </div>
                {vendor.bankAccount && (
                  <div>
                    <p className="text-sm text-muted-foreground">Account</p>
                    <p className="font-mono">{vendor.bankAccount}</p>
                  </div>
                )}
                {vendor.bankRouting && (
                  <div>
                    <p className="text-sm text-muted-foreground">Routing</p>
                    <p className="font-mono">{vendor.bankRouting}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Invoices</span>
                <span className="font-medium">{vendor.invoiceCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Spend</span>
                <CurrencyDisplay amount={vendor.totalSpend} currency="USD" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Since</span>
                <span>{format(parseISO(vendor.createdAt), 'MMM yyyy')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
