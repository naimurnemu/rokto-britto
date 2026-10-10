'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  HeartPulse,
  Search,
  Building2,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User,
  MapPin,
  Coins,
  ShieldCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'user';

  // Active Top-level Tab: "user" | "agency-register" | "agency-login"
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // User auth state (Unified for Finder & Donor)
  const [userMode, setUserMode] = useState<'signin' | 'signup'>('signup');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userConfirmPassword, setUserConfirmPassword] = useState('');

  // Agency Registration state (Application only)
  const [agencyName, setAgencyName] = useState('');
  const [agencyLicense, setAgencyLicense] = useState('');
  const [agencyEmail, setAgencyEmail] = useState('');
  const [agencyPhone, setAgencyPhone] = useState('');
  const [agencyContactPerson, setAgencyContactPerson] = useState('');
  const [agencyAddress, setAgencyAddress] = useState('');
  const [agencyDeposit, setAgencyDeposit] = useState('500');

  // Agency / Subagent Login state
  const [agencyLoginEmail, setAgencyLoginEmail] = useState('');
  const [agencyLoginPassword, setAgencyLoginPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [agencySuccessData, setAgencySuccessData] = useState<any | null>(null);

  // Unified User Register / Login
  const handleUserAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (userMode === 'signup') {
        if (userPassword !== userConfirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (userPassword.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        // Call user registration endpoint
        const res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, password: userPassword }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || 'Registration failed');
        }

        // Auto-authenticate immediately: by registration no need to sign in again!
        localStorage.setItem('rokto_token', data.data.token);
        localStorage.setItem('rokto_user', JSON.stringify(data.data.user));

        // Immediately direct to complete profile flow
        router.push('/profile/complete');
      } else {
        // Sign In
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, password: userPassword }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || 'Login failed');
        }

        localStorage.setItem('rokto_token', data.data.token);
        localStorage.setItem('rokto_user', JSON.stringify(data.data.user));

        if (!data.data.user.isProfileComplete) {
          router.push('/profile/complete');
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  // Quick Google Sign-In Simulation
  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const mockEmail = `google.user.${Date.now()}@example.com`;
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mockEmail,
          name: 'Verified Google Citizen',
          googleId: `gid_${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Google authentication failed');

      localStorage.setItem('rokto_token', data.data.token);
      localStorage.setItem('rokto_user', JSON.stringify(data.data.user));

      router.push('/profile/complete');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Agency Registration Application (Only way for agency onboarding)
  const handleAgencyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/blood-banks/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agencyName,
          licenseNumber: agencyLicense,
          email: agencyEmail,
          phone: agencyPhone,
          contactPerson: agencyContactPerson,
          address: agencyAddress || 'Dhaka Central, Bangladesh',
          initialDepositAmount: Number(agencyDeposit),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Agency application submission failed');
      }

      setAgencySuccessData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Agency registration error');
    } finally {
      setLoading(false);
    }
  };

  // Agency & Subagent Sign-In
  const handleAgencyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/blood-banks/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: agencyLoginEmail,
          password: agencyLoginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Agency login failed');
      }

      localStorage.setItem('rokto_agency_token', data.data.token);
      localStorage.setItem('rokto_agency', JSON.stringify(data.data.entity));

      router.push('/agency');
    } catch (err: any) {
      setErrorMsg(err.message || 'Agency login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* Header breadcrumb & info */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Live Dispatch Feed
        </Link>
        <Badge variant="outline" className="text-xs">
          Role-Gated Security Pipeline
        </Badge>
      </div>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-500/20 text-rose-500 mb-2">
          <HeartPulse className="w-6 h-6 animate-pulse" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Welcome to Rokto Britto
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Life-saving blood emergency portal. Finders and Donors share a single unified account space.
        </p>
      </div>

      {/* Main Tab Controller */}
      <Tabs value={activeTab} onValueChange={(tab) => { setActiveTab(tab); setErrorMsg(null); setAgencySuccessData(null); }}>
        <TabsList className="grid grid-cols-3 w-full h-auto p-1.5 gap-1.5">
          <TabsTrigger value="user" className="py-2.5 text-xs font-semibold gap-1.5">
            <User className="w-4 h-4 text-rose-500" />
            <span>User (Finder / Donor)</span>
          </TabsTrigger>

          <TabsTrigger value="agency-register" className="py-2.5 text-xs font-semibold gap-1.5">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>Agency Application</span>
          </TabsTrigger>

          <TabsTrigger value="agency-login" className="py-2.5 text-xs font-semibold gap-1.5">
            <KeyRound className="w-4 h-4 text-purple-500" />
            <span>Agency & Subagent Sign-In</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: UNIFIED USER SPACE (FINDER & DONOR ARE ONE USER) */}
        <TabsContent value="user">
          <Card className="border-border bg-card shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="emergency">Unified Citizen Space</Badge>
                <div className="flex items-center gap-1 p-1 bg-muted rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setUserMode('signin')}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      userMode === 'signin' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserMode('signup')}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      userMode === 'signup' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>
              <CardTitle className="text-xl text-foreground">
                {userMode === 'signup' ? 'Create Your Account' : 'Sign In to Rokto Britto'}
              </CardTitle>
              <CardDescription>
                {userMode === 'signup'
                  ? 'Sign up with email and password. No need to sign in again after registration!'
                  : 'Enter your email and password to access your blood requests and donor lifeline.'}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleUserAuth}>
              <CardContent className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="user-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="user-email"
                      type="email"
                      required
                      placeholder="citizen@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="user-password">Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="user-password"
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {userMode === 'signup' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="user-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        id="user-confirm-password"
                        type="password"
                        required
                        placeholder="Re-type your password"
                        value={userConfirmPassword}
                        onChange={(e) => setUserConfirmPassword(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                )}

                {userMode === 'signup' && (
                  <div className="p-3 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      After creating your account, you will proceed directly to complete your medical & location profile without re-login.
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <Button type="submit" variant="emergency" className="w-full gap-2 font-semibold" disabled={loading}>
                    {loading ? (
                      'Authenticating...'
                    ) : userMode === 'signup' ? (
                      <>
                        <UserPlus className="w-4 h-4" /> Create Account & Continue to Profile
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" /> Sign In
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground font-mono">Or Continue With</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full gap-2 text-xs font-semibold hover:bg-muted"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9c-.3-.8-.5-1.6-.5-2.4z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        {/* TAB 2: AGENCY REGISTRATION ONLY */}
        <TabsContent value="agency-register">
          <Card className="border-border bg-card shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="warning">Application Portal</Badge>
                <Badge variant="outline">Admin Verification Required</Badge>
              </div>
              <CardTitle className="text-xl text-foreground">Agency & Blood Bank Accreditation</CardTitle>
              <CardDescription>
                Agencies must register an official application. Once approved by the Administrator, you will receive an activation email with a password setup link.
              </CardDescription>
            </CardHeader>

            {agencySuccessData ? (
              <CardContent className="space-y-4 py-6 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">Application Submitted for Review!</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Your agency application for <strong>{agencyName}</strong> (License: {agencyLicense}) has been placed in the Admin Verification Queue.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground text-left space-y-1.5">
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Next Steps:
                  </div>
                  <p>1. The Platform Administrator inspects official credentials and approves your center.</p>
                  <p>2. A password creation link is dispatched to: <span className="font-mono text-foreground font-semibold">{agencyEmail}</span>.</p>
                  <p>3. After setting your password, sign in via the Agency Sign-In tab to add Subagents.</p>
                </div>
                <div className="pt-2">
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> View in Admin Approval Queue
                    </Button>
                  </Link>
                </div>
              </CardContent>
            ) : (
              <form onSubmit={handleAgencyRegister}>
                <CardContent className="space-y-4">
                  {errorMsg && (
                    <div className="p-3.5 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="agency-name">Organization / Blood Bank Name</Label>
                      <Input
                        id="agency-name"
                        required
                        placeholder="e.g. Red Crescent Blood Center"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="agency-license">Official License / Govt Reg Number</Label>
                      <Input
                        id="agency-license"
                        required
                        placeholder="e.g. DGHS-BB-2026-904"
                        value={agencyLicense}
                        onChange={(e) => setAgencyLicense(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="agency-email">Accredited Email Address</Label>
                      <Input
                        id="agency-email"
                        type="email"
                        required
                        placeholder="contact@bloodcenter.org"
                        value={agencyEmail}
                        onChange={(e) => setAgencyEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="agency-phone">Helpline / Emergency Phone</Label>
                      <Input
                        id="agency-phone"
                        type="tel"
                        required
                        placeholder="+880 1700-000000"
                        value={agencyPhone}
                        onChange={(e) => setAgencyPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="agency-contact">Authorized Contact Person</Label>
                      <Input
                        id="agency-contact"
                        placeholder="Dr. Rahman (Director of Operations)"
                        value={agencyContactPerson}
                        onChange={(e) => setAgencyContactPerson(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="agency-deposit">Initial Deposit Pledge (BDT)</Label>
                      <Input
                        id="agency-deposit"
                        type="number"
                        min="500"
                        required
                        placeholder="500"
                        value={agencyDeposit}
                        onChange={(e) => setAgencyDeposit(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="agency-address">Physical Facility Address</Label>
                    <Input
                      id="agency-address"
                      required
                      placeholder="Road 12, Dhanmondi, Dhaka - 1205"
                      value={agencyAddress}
                      onChange={(e) => setAgencyAddress(e.target.value)}
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                    <p className="font-semibold mb-1">State Blood Bank Security Policy:</p>
                    <p>
                      Agencies cannot log in until verified by the platform Admin. Once approved, you will receive an activation email to establish your credentials.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="default" className="w-full gap-2 font-semibold bg-amber-600 hover:bg-amber-700 text-white" disabled={loading}>
                      {loading ? 'Submitting Application...' : (
                        <>
                          <Send className="w-4 h-4" /> Submit Agency Registration for Admin Approval
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </form>
            )}
          </Card>
        </TabsContent>

        {/* TAB 3: AGENCY & SUBAGENT SIGN-IN */}
        <TabsContent value="agency-login">
          <Card className="border-border bg-card shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="info">Organization Sign-In</Badge>
                <Badge variant="outline">Agency & Subagents</Badge>
              </div>
              <CardTitle className="text-xl text-foreground">Sign In to Agency Portal</CardTitle>
              <CardDescription>
                For verified agencies with activated passwords and subagents created directly by their agency.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleAgencyLogin}>
              <CardContent className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="agency-login-email">Registered Email Address</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="agency-login-email"
                      type="email"
                      required
                      placeholder="agency@domain.com or subagent@agency.org"
                      value={agencyLoginEmail}
                      onChange={(e) => setAgencyLoginEmail(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="agency-login-password">Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="agency-login-password"
                      type="password"
                      required
                      placeholder="Your established password"
                      value={agencyLoginPassword}
                      onChange={(e) => setAgencyLoginPassword(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300">
                  <p>
                    <strong>Subagent Note:</strong> Subagents are created and permissioned exclusively from the parent Agency dashboard. Contact your supervising Agency administrator for credentials.
                  </p>
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="default" className="w-full gap-2 font-semibold bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
                    {loading ? 'Authenticating...' : (
                      <>
                        <LogIn className="w-4 h-4" /> Sign In to Agency Portal
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto py-16 text-center text-muted-foreground">Loading Authentication...</div>}>
      <AuthContent />
    </Suspense>
  );
}
