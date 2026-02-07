import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DataTable } from '../components/ui/data-table';
import { CurrencyDisplay } from '../components/ui/currency-display';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { mockVendors } from '../data/mockData';
import { Vendor } from '../types';
import { Plus, Search, Building2 } from 'lucide-react';

export default function Vendors() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVendors = mockVendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      header: 'Vendor Name',
      sortable: true,
      render: (vendor: Vendor) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{vendor.name}</p>
            <p className="text-sm text-muted-foreground">{vendor.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'defaultCurrency',
      header: 'Currency',
      render: (vendor: Vendor) => (
        <span className="px-2 py-1 bg-secondary rounded text-sm font-medium">
          {vendor.defaultCurrency}
        </span>
      ),
    },
    {
      key: 'invoiceCount',
      header: 'Invoices',
      className: 'text-center',
      render: (vendor: Vendor) => vendor.invoiceCount,
    },
    {
      key: 'totalSpend',
      header: 'Total Spend',
      className: 'text-right',
      render: (vendor: Vendor) => (
        <CurrencyDisplay amount={vendor.totalSpend} currency="USD" />
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Vendors</h1>
        {hasPermission('vendors.create') && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        )}
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Vendors Table */}
      <DataTable
        data={filteredVendors}
        columns={columns}
        onRowClick={(vendor) => navigate(`/app/vendors/${vendor.id}`)}
        emptyMessage="No vendors found"
      />
    </div>
  );
}
