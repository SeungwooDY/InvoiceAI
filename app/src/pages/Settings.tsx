import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { StatusBadge } from '../components/ui/status-badge';
import {
  Users,
  Settings2,
  DollarSign,
  Shield,
  Bell,
  Plus,
} from 'lucide-react';

const mockUsers = [
  { id: '1', name: 'Sarah Chen', email: 'fm@acme.com', role: 'finance_manager' },
  { id: '2', name: 'Michael Ross', email: 'approver@acme.com', role: 'approver' },
  { id: '3', name: 'Emily Zhang', email: 'viewer@acme.com', role: 'viewer' },
];

const currencies = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'AUD', label: 'Australian Dollar (AUD)' },
];

export default function Settings() {
  const { hasPermission } = useAuth();
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [autoApproveThreshold, setAutoApproveThreshold] = useState('1000');

  const canManageUsers = hasPermission('users.manage');
  const canEditSettings = hasPermission('settings.edit');

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Settings2 className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Users & Roles
          </TabsTrigger>
          <TabsTrigger value="approvals" className="gap-2">
            <Shield className="w-4 h-4" />
            Approval Rules
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Currency Settings
                </CardTitle>
                <CardDescription>
                  Configure your base currency and display preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-xs">
                  <Label>Base Currency</Label>
                  <Select
                    value={baseCurrency}
                    onValueChange={setBaseCurrency}
                    disabled={!canEditSettings}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    All amounts will be converted to this currency for reporting
                  </p>
                </div>
                {canEditSettings && (
                  <Button className="mt-4">Save Changes</Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>
                  Update your company information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 max-w-md">
                  <div>
                    <Label>Company Name</Label>
                    <Input
                      value="Acme Corporation"
                      className="mt-1.5"
                      disabled={!canEditSettings}
                    />
                  </div>
                  <div>
                    <Label>Business Email</Label>
                    <Input
                      value="finance@acme.com"
                      className="mt-1.5"
                      disabled={!canEditSettings}
                    />
                  </div>
                </div>
                {canEditSettings && (
                  <Button className="mt-4">Save Changes</Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users & Roles */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage user access and permissions
                  </CardDescription>
                </div>
                {canManageUsers && (
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-secondary rounded-full text-sm capitalize">
                        {user.role.replace('_', ' ')}
                      </span>
                      {canManageUsers && (
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approval Rules */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Approval Thresholds</CardTitle>
              <CardDescription>
                Set automatic approval rules based on invoice amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Auto-approve under threshold</p>
                  <p className="text-sm text-muted-foreground">
                    Invoices below this amount will be auto-approved
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={autoApproveThreshold}
                      onChange={(e) => setAutoApproveThreshold(e.target.value)}
                      className="w-24"
                      disabled={!canEditSettings}
                    />
                  </div>
                  <Switch disabled={!canEditSettings} />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Approval Workflow</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span>$0 - $5,000</span>
                    <span className="text-muted-foreground">Department Head</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span>$5,001 - $25,000</span>
                    <span className="text-muted-foreground">Finance Manager</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span>$25,001+</span>
                    <span className="text-muted-foreground">CFO / Owner</span>
                  </div>
                </div>
              </div>

              {canEditSettings && (
                <Button>Save Changes</Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure when to receive email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">New invoice received</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a new invoice is added
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Invoice approved</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when an invoice is approved
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Invoice rejected</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when an invoice is rejected
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Overdue reminder</p>
                  <p className="text-sm text-muted-foreground">
                    Daily digest of overdue invoices
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Weekly summary</p>
                  <p className="text-sm text-muted-foreground">
                    Weekly summary of payables and activity
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
