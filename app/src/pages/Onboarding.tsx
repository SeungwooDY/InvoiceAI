import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Building2, UserCheck, Eye, Loader2, LogOut } from 'lucide-react';

export default function Onboarding() {
  const { refreshSession, logout, user } = useAuth();
  const navigate = useNavigate();

  const [currentRole, setCurrentRole] = useState(
    () => localStorage.getItem('payflow_selected_role') || 'finance_manager'
  );
  const isFinanceManager = currentRole === 'finance_manager';

  const [orgName, setOrgName] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateOrg = async () => {
    if (!orgName.trim()) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/org/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Show detailed error for debugging
        const detail = data.details ? ` (${data.details})` : '';
        setError((data.error || 'Failed to create organization') + detail);
        return;
      }

      localStorage.removeItem('payflow_selected_role');
      // Server-side redirect: rewrites the JWT cookie with fresh Supabase data
      window.location.href = '/api/auth/refresh-session?redirectTo=/app/dashboard';
      return;
    } catch (err) {
      setError('Network error: ' + String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!inviteToken.trim()) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const token = inviteToken.trim();
      const res = await fetch(`/api/invites/${encodeURIComponent(token)}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) {
        const detail = data.details ? ` (${data.details})` : '';
        setError((data.error || 'Failed to accept invite') + detail);
        return;
      }

      localStorage.removeItem('payflow_selected_role');
      // Server-side redirect: rewrites the JWT cookie with fresh Supabase data
      window.location.href = '/api/auth/refresh-session?redirectTo=/app/dashboard';
      return;
    } catch (err) {
      setError('Network error: ' + String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchRole = (role: string) => {
    localStorage.setItem('payflow_selected_role', role);
    setCurrentRole(role);
    setError(null);
  };

  const roleLabel = currentRole === 'approver' ? 'Approver' : 'Viewer';
  const RoleIcon = isFinanceManager ? Building2 : currentRole === 'approver' ? UserCheck : Eye;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Sign out option */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            Signed in as <span className="text-foreground font-medium">{user?.email || user?.name || 'User'}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to PayFlow</h1>
          <p className="text-muted-foreground mt-2">
            {isFinanceManager
              ? 'Create your organization to get started'
              : `Join an organization as ${roleLabel}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm break-all">
            {error}
          </div>
        )}

        {isFinanceManager ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RoleIcon className="w-5 h-5" />
                Create Your Organization
              </CardTitle>
              <CardDescription>
                You&apos;ll be the finance manager with full access to manage invoices, payables, and team members.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="e.g. Acme Corporation"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="mt-1.5"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateOrg()}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreateOrg}
                disabled={!orgName.trim() || isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Organization
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RoleIcon className="w-5 h-5" />
                Join Organization as {roleLabel}
              </CardTitle>
              <CardDescription>
                Enter the invite token you received from your finance manager to join their organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="inviteToken">Invite Token</Label>
                <Input
                  id="inviteToken"
                  placeholder="Paste your invite token"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  className="mt-1.5"
                  onKeyDown={(e) => e.key === 'Enter' && handleAcceptInvite()}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleAcceptInvite}
                disabled={!inviteToken.trim() || isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Join Organization
              </Button>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isFinanceManager ? (
            <>
              Have an invite?{' '}
              <button
                className="text-primary hover:underline"
                onClick={() => switchRole('approver')}
              >
                Join an existing organization
              </button>
            </>
          ) : (
            <>
              Want to create an organization?{' '}
              <button
                className="text-primary hover:underline"
                onClick={() => switchRole('finance_manager')}
              >
                Create one instead
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
