'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  KeyRound,
  UserPlus,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  Plus,
  Lock,
  Mail,
  Phone,
  Send,
  Radio,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const PERMISSION_OPTIONS = [
  { id: 'DISPATCH_OUTREACH', label: 'Dispatch Outreach Messages', desc: 'Can send direct outreach to patient families (5 BDT wallet fee)' },
  { id: 'COORDINATE_CHATS', label: 'Coordinate Donor Chats', desc: 'Can handle 1-message pickup scheduling communications' },
  { id: 'MANAGE_INVENTORY', label: 'Manage Blood Inventory', desc: 'Can update blood bank stock levels and reservations' },
  { id: 'VERIFY_DONORS', label: 'Verify Blood Donors', desc: 'Can review donor screening forms and confirm physical check-ins' },
];

export default function AgencyPortalPage() {
  const [agency, setAgency] = useState<any | null>(null);
  const [subagents, setSubagents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New subagent form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subagentName, setSubagentName] = useState('');
  const [subagentEmail, setSubagentEmail] = useState('');
  const [subagentPhone, setSubagentPhone] = useState('');
  const [subagentPassword, setSubagentPassword] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'COORDINATE_CHATS',
  ]);

  useEffect(() => {
    loadAgencyData();
  }, []);

  const loadAgencyData = async () => {
    const storedAgency = localStorage.getItem('rokto_agency');
    if (storedAgency) {
      try {
        const parsed = JSON.parse(storedAgency);
        setAgency(parsed);
        fetchSubagents(parsed.id);
      } catch (e) {
        // ignore
      }
    }
  };

  const fetchSubagents = async (agencyId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/blood-banks/${agencyId}/subagents`);
      if (res.ok) {
        const d = await res.json();
        setSubagents(d.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePermission = (permId: string) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleCreateSubagent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency?.id) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/blood-banks/${agency.id}/subagents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: subagentName,
          email: subagentEmail,
          phone: subagentPhone,
          password: subagentPassword || 'Subagent@123',
          permissions: selectedPermissions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to create subagent');

      setSuccessMsg(`Subagent "${subagentName}" successfully created and delegated.`);
      setSubagentName('');
      setSubagentEmail('');
      setSubagentPhone('');
      setSubagentPassword('');
      setShowCreateModal(false);
      fetchSubagents(agency.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating subagent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
              Agency Operations Portal
            </Badge>
            <Badge variant="success">Verified Medical Center</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-amber-500" />
            {agency?.name || 'Accredited Blood Center'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            License: {agency?.licenseNumber || 'DGHS-VERIFIED'} • {agency?.address || 'Dhaka Central Facility'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => setShowCreateModal(true)}
            className="gap-2 text-xs bg-purple-600 hover:bg-purple-700 text-white"
          >
            <UserPlus className="w-4 h-4" /> Delegate New Subagent
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-semibold">Ledger Wallet Balance</span>
              <Coins className="w-4 h-4 text-amber-500" />
            </div>
            <CardTitle className="text-2xl text-foreground font-mono">
              {agency?.walletBalance ?? 500.0} BDT
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Sufficient for outreach messages (5 BDT per message).
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-semibold">Authorized Subagents</span>
              <KeyRound className="w-4 h-4 text-purple-500" />
            </div>
            <CardTitle className="text-2xl text-foreground">
              {subagents.length} Active Staff
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Subagents can only be created from this agency portal.
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-semibold">Accreditation Status</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Verified by State Platform Administrator.
          </CardContent>
        </Card>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          {successMsg}
        </div>
      )}

      {/* Subagent Management Panel */}
      <Card className="border-border bg-card shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" /> Subagent Roster & Delegated Roles
              </CardTitle>
              <CardDescription className="text-xs">
                Staff, lab coordinators, and field volunteers operating on behalf of this Agency.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Exclusive Agency Privilege
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subagents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-2xl space-y-2">
              <p>No subagents created yet for this agency.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCreateModal(true)}
                className="gap-1.5 text-xs text-purple-500"
              >
                <Plus className="w-3.5 h-3.5" /> Create First Subagent
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {subagents.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl border border-border bg-background flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{sub.fullName}</span>
                      <Badge variant="info" className="text-[10px]">
                        SUBAGENT
                      </Badge>
                      {sub.isSuspended && (
                        <Badge variant="destructive" className="text-[10px]">
                          SUSPENDED
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground flex items-center gap-3">
                      <span>{sub.email}</span>
                      {sub.phone && (
                        <>
                          <span>•</span>
                          <span>{sub.phone}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {sub.permissions && sub.permissions.map((perm: string) => (
                      <Badge key={perm} variant="outline" className="text-[10px] bg-purple-500/5 text-purple-600 dark:text-purple-300 border-purple-500/20">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Create Subagent */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-border bg-card shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-purple-500" /> Create Subagent
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setShowCreateModal(false)} className="h-6 text-xs">
                  ✕
                </Button>
              </div>
              <CardDescription className="text-xs">
                Subagents operate under this agency&apos;s license and can sign in with their assigned email and password.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleCreateSubagent}>
              <CardContent className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="sub-name">Subagent Full Name *</Label>
                  <Input
                    id="sub-name"
                    required
                    placeholder="e.g. Asif Mahmud"
                    value={subagentName}
                    onChange={(e) => setSubagentName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="sub-email">Email Address *</Label>
                    <Input
                      id="sub-email"
                      type="email"
                      required
                      placeholder="asif@bloodcenter.org"
                      value={subagentEmail}
                      onChange={(e) => setSubagentEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sub-phone">Phone Number</Label>
                    <Input
                      id="sub-phone"
                      type="tel"
                      placeholder="+880 1700-000000"
                      value={subagentPhone}
                      onChange={(e) => setSubagentPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sub-password">Initial Password *</Label>
                  <Input
                    id="sub-password"
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={subagentPassword}
                    onChange={(e) => setSubagentPassword(e.target.value)}
                  />
                </div>

                {/* Granular Permissions */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <Label className="text-xs font-semibold">Delegated Permissions</Label>
                  <div className="space-y-2">
                    {PERMISSION_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-border bg-background hover:bg-muted/40 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(opt.id)}
                          onChange={() => togglePermission(opt.id)}
                          className="mt-0.5 accent-purple-600 rounded"
                        />
                        <div>
                          <div className="font-semibold text-foreground">{opt.label}</div>
                          <div className="text-[11px] text-muted-foreground">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" variant="default" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                    {loading ? 'Creating...' : 'Create & Delegate Subagent'}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
