import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Building2, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'fm@acme.com', role: 'Finance Manager', description: 'Full access' },
    { email: 'approver@acme.com', role: 'Approver', description: 'View & approve' },
    { email: 'viewer@acme.com', role: 'Viewer', description: 'Read-only' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      
      {/* Additional decorative elements */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, hsl(200 100% 50% / 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 15s ease-in-out infinite'
        }}
      />
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo & Brand */}
        <Link to="/" className="text-center space-y-3 block cursor-pointer group">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl relative transition-transform group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, hsl(200 100% 60%) 0%, hsl(260 100% 70%) 100%)',
              boxShadow: '0 0 40px hsl(200 100% 60% / 0.4), 0 0 80px hsl(260 100% 70% / 0.2)'
            }}
          >
            <Building2 className="w-8 h-8 text-white" />
            <Sparkles className="w-4 h-4 text-white/80 absolute -top-1 -right-1" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">PayFlow</h1>
          <p className="text-muted-foreground">Invoice & Payables Management</p>
        </Link>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div 
                  className="flex items-center gap-2 p-3 rounded-xl text-sm"
                  style={{
                    background: 'hsl(350 100% 55% / 0.1)',
                    border: '1px solid hsl(350 100% 60% / 0.3)',
                    color: 'hsl(350 100% 70%)'
                  }}
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Demo Accounts
            </CardTitle>
            <CardDescription className="text-xs">Use password: demo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => {
                  setEmail(account.email);
                  setPassword('demo');
                }}
                className="w-full text-left p-3 rounded-xl transition-all duration-300 relative overflow-hidden group"
                style={{
                  background: 'hsl(220 25% 12% / 0.5)',
                  border: '1px solid hsl(220 20% 20% / 0.5)'
                }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, hsl(200 100% 60% / 0.1) 0%, hsl(260 100% 70% / 0.05) 100%)',
                    borderRadius: 'inherit'
                  }}
                />
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-sm font-medium text-foreground">{account.role}</span>
                  <span className="text-xs text-muted-foreground">{account.description}</span>
                </div>
                <span className="text-xs text-muted-foreground relative z-10">{account.email}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
