import { useState, useEffect, useCallback } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Users,
  Settings2,
  DollarSign,
  Shield,
  Bell,
  Plus,
  Copy,
  Trash2,
  Loader2,
  Check,
} from 'lucide-react';

interface OrgMember {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
}

interface Invite {
  id: string;
  role: string;
  email: string | null;
  token: string;
  expires_at: string;
  created_at: string;
  used_by: string | null;
}

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

  // Real data state
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);

  // Invite form state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<string>('approver');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteExpiry, setInviteExpiry] = useState('7');
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const canManageUsers = hasPermission('users.manage');
  const canEditSettings = hasPermission('settings.edit');

  const fetchMembers = useCallback(async () => {
    setIsLoadingMembers(true);
    try {
      const res = await fetch('/api/org/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoadingMembers(false);
    }
  }, []);

  const fetchInvites = useCallback(async () => {
    if (!canManageUsers) return;
    setIsLoadingInvites(true);
    try {
      const res = await fetch('/api/invites');
      if (res.ok) {
        const data = await res.json();
        setInvites(data.invites || []);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoadingInvites(false);
    }
  }, [canManageUsers]);

  useEffect(() => {
    fetchMembers();
    fetchInvites();
  }, [fetchMembers, fetchInvites]);

  const handleCreateInvite = async () => {
    setIsCreatingInvite(true);
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: inviteRole,
          email: inviteEmail.trim() || null,
          expiresInDays: parseInt(inviteExpiry),
        }),
      });

      if (res.ok) {
        setInviteEmail('');
        setInviteDialogOpen(false);
        fetchInvites();
      }
    } catch {
      // silently fail
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      await fetch(`/api/invites?id=${inviteId}`, { method: 'DELETE' });
      fetchInvites();
    } catch {
      // silently fail
    }
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const pendingInvites = invites.filter((i) => !i.used_by && new Date(i.expires_at) > new Date());

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
          <div className="space-y-6">
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
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Invite User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Invite</DialogTitle>
                          <DialogDescription>
                            Generate an invite link to add a user to your organization.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label>Role</Label>
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                              <SelectTrigger className="mt-1.5">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="approver">Approver</SelectItem>
                                <SelectItem value="finance_manager">Finance Manager</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Email (optional)</Label>
                            <Input
                              placeholder="user@example.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              className="mt-1.5"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              If specified, only this email can use the invite.
                            </p>
                          </div>
                          <div>
                            <Label>Expires in (days)</Label>
                            <Select value={inviteExpiry} onValueChange={setInviteExpiry}>
                              <SelectTrigger className="mt-1.5">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 day</SelectItem>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="14">14 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            className="w-full"
                            onClick={handleCreateInvite}
                            disabled={isCreatingInvite}
                          >
                            {isCreatingInvite && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Invite
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-medium">
                            {(member.name || member.email || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{member.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.email || member.phone || 'No contact info'}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-secondary rounded-full text-sm capitalize">
                          {member.role.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                    {members.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No team members found.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Invites */}
            {canManageUsers && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Invites</CardTitle>
                  <CardDescription>
                    Active invite tokens that haven&apos;t been used yet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingInvites ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingInvites.map((invite) => (
                        <div
                          key={invite.id}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-secondary rounded text-xs capitalize">
                                {invite.role.replace('_', ' ')}
                              </span>
                              {invite.email && (
                                <span className="text-sm text-muted-foreground">
                                  for {invite.email}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">
                              {invite.token.slice(0, 16)}...
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Expires {new Date(invite.expires_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyToken(invite.token)}
                            >
                              {copiedToken === invite.token ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInvite(invite.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {pendingInvites.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          No pending invites.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
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
