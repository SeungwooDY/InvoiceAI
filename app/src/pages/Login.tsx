import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Building2, AlertCircle, Sparkles, Phone, Mail, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type AuthMode = 'main' | 'phone-enter' | 'phone-verify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle, loginWithMicrosoft, loginWithPhone } = useAuth();
  const navigate = useNavigate();

  // Phone OTP state
  const [authMode, setAuthMode] = useState<AuthMode>('main');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch {
      setError('Failed to sign in with Google');
    }
  };

  const handleMicrosoftLogin = async () => {
    setError('');
    try {
      await loginWithMicrosoft();
    } catch {
      setError('Failed to sign in with Microsoft');
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }
    setError('');
    setOtpSending(true);

    try {
      const res = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      if (!res.ok) {
        throw new Error('Failed to send OTP');
      }

      setAuthMode('phone-verify');
    } catch {
      setError('Failed to send verification code');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await loginWithPhone(phoneNumber, otpCode);
      navigate('/app/dashboard');
    } catch {
      setError('Invalid verification code');
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
            <CardDescription>Choose your preferred sign-in method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{
                  background: 'hsl(350 100% 55% / 0.1)',
                  border: '1px solid hsl(350 100% 60% / 0.3)',
                  color: 'hsl(350 100% 70%)'
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {authMode === 'main' && (
              <>
                {/* OAuth Buttons */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 gap-3"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 gap-3"
                    onClick={handleMicrosoftLogin}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    Continue with Microsoft
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 gap-3"
                    onClick={() => setAuthMode('phone-enter')}
                  >
                    <Phone className="w-5 h-5" />
                    Continue with Phone
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or sign in with email</span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Sign in
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}

            {/* Phone: Enter number */}
            {authMode === 'phone-enter' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll send a verification code to this number.
                  </p>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={handleSendOtp}
                  disabled={otpSending}
                >
                  {otpSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    'Send verification code'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setAuthMode('main');
                    setError('');
                  }}
                >
                  Back to sign in
                </Button>
              </div>
            )}

            {/* Phone: Enter OTP code */}
            {authMode === 'phone-verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code sent to {phoneNumber}
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & sign in'
                  )}
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setAuthMode('phone-enter');
                      setOtpCode('');
                      setError('');
                    }}
                  >
                    Change number
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={handleSendOtp}
                    disabled={otpSending}
                  >
                    Resend code
                  </Button>
                </div>
              </form>
            )}
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
                  setAuthMode('main');
                  setEmail(account.email);
                  setPassword('demo');
                  setError('');
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
