'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Password update failed');
      }

      setSuccessMsg(data.message || 'Password set successfully! You can now sign in.');
      setTimeout(() => {
        router.push('/auth?tab=agency-login');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error establishing password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <Link
        href="/auth"
        className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Authentication
      </Link>

      <Card className="border-border bg-card shadow-xl">
        <CardHeader className="space-y-1">
          <Badge variant="outline" className="w-fit text-xs border-emerald-500/30 text-emerald-500">
            Official Agency Activation
          </Badge>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" /> Establish Account Password
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your secure password to complete agency activation and unlock subagent management.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="token">Security Activation Token</Label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="token"
                  required
                  placeholder="Paste security token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="pl-9 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-pw">New Password</Label>
              <Input
                id="new-pw"
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw">Confirm Password</Label>
              <Input
                id="confirm-pw"
                type="password"
                required
                placeholder="Re-type your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="default" className="w-full gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                {loading ? 'Establishing Credentials...' : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Set Password & Proceed to Login
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-16 text-center text-muted-foreground text-xs">Loading Password Setup...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
