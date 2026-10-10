'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Lock,
  Radio,
  RefreshCw,
  Ban,
  UserCheck,
  Phone,
  MapPin,
  HeartPulse,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'approvals' | 'entities' | 'requests'>('approvals');
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalDonors: 0,
    totalAgencies: 0,
    pendingAgencies: 0,
    totalSubagents: 0,
    activeRequests: 0,
    totalSuspended: 0,
  });

  const [pendingAgencies, setPendingAgencies] = useState<any[]>([]);
  const [entities, setEntities] = useState<{ users: any[]; agencies: any[] }>({ users: [], agencies: [] });
  const [requests, setRequests] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [approvalEmailAlert, setApprovalEmailAlert] = useState<any | null>(null);

  // Entity filter state
  const [entityFilter, setEntityFilter] = useState<'ALL' | 'USER' | 'AGENCY' | 'SUBAGENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, entitiesRes, requestsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/stats').catch(() => null),
        fetch('http://localhost:5000/api/admin/agencies/pending').catch(() => null),
        fetch('http://localhost:5000/api/admin/entities').catch(() => null),
        fetch('http://localhost:5000/api/admin/requests').catch(() => null),
      ]);

      if (statsRes && statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.data);
      }
      if (pendingRes && pendingRes.ok) {
        const d = await pendingRes.json();
        setPendingAgencies(d.data || []);
      }
      if (entitiesRes && entitiesRes.ok) {
        const d = await entitiesRes.json();
        setEntities(d.data || { users: [], agencies: [] });
      }
      if (requestsRes && requestsRes.ok) {
        const d = await requestsRes.json();
        setRequests(d.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Approve Agency -> Triggers activation email with reset token
  const handleApproveAgency = async (agencyId: string) => {
    setActionMessage(null);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/agencies/${agencyId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Approval failed');

      setApprovalEmailAlert(data.data);
      setActionMessage(data.message);
      fetchAdminData();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  // Reject Agency
  const handleRejectAgency = async (agencyId: string) => {
    setActionMessage(null);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/agencies/${agencyId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Documentation requirements not met' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Rejection failed');

      setActionMessage(data.message);
      fetchAdminData();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  // Suspend or Reactivate any entity across the platform
  const handleToggleSuspension = async (
    entityType: 'USER' | 'AGENCY' | 'SUBAGENT',
    entityId: string,
    currentSuspended: boolean
  ) => {
    setActionMessage(null);
    try {
      const res = await fetch('http://localhost:5000/api/admin/entities/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          isSuspended: !currentSuspended,
          reason: !currentSuspended ? 'Suspended by system administration' : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Suspension toggle failed');

      setActionMessage(data.message);
      fetchAdminData();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  // Update blood request status
  const handleUpdateRequestStatus = async (requestId: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Status update failed');

      setActionMessage(data.message);
      fetchAdminData();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  // Combine and filter entities
  const filteredUsers = entities.users.filter((u) => {
    if (entityFilter === 'AGENCY') return false;
    if (entityFilter === 'SUBAGENT' && u.role !== 'SUBAGENT') return false;
    if (entityFilter === 'USER' && (u.role === 'SUBAGENT' || u.role === 'ADMIN')) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (u.fullName || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    }
    return true;
  });

  const filteredAgencies = entities.agencies.filter((a) => {
    if (entityFilter === 'USER' || entityFilter === 'SUBAGENT') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.licenseNumber.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-500">
              Platform Administration Flow
            </Badge>
            <Badge variant="emergency" className="text-xs">
              Root Authority
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-500" /> State Emergency Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Universal authority: Control agency approvals, monitor blood requests, and suspend any entity across the platform.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchAdminData} disabled={loading} className="gap-2 text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
        </Button>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-2xl border border-border bg-card">
          <div className="text-[11px] text-muted-foreground font-semibold">Total Citizens</div>
          <div className="text-2xl font-extrabold text-foreground mt-0.5">{stats.totalUsers}</div>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card">
          <div className="text-[11px] text-muted-foreground font-semibold">Active Donors</div>
          <div className="text-2xl font-extrabold text-rose-500 mt-0.5">{stats.totalDonors}</div>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card">
          <div className="text-[11px] text-muted-foreground font-semibold">Pending Agencies</div>
          <div className="text-2xl font-extrabold text-amber-500 mt-0.5">{stats.pendingAgencies}</div>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card">
          <div className="text-[11px] text-muted-foreground font-semibold">Total Agencies</div>
          <div className="text-2xl font-extrabold text-foreground mt-0.5">{stats.totalAgencies}</div>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card">
          <div className="text-[11px] text-muted-foreground font-semibold">Subagents</div>
          <div className="text-2xl font-extrabold text-purple-500 mt-0.5">{stats.totalSubagents}</div>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card">
          <div className="text-[11px] text-muted-foreground font-semibold">Live Requests</div>
          <div className="text-2xl font-extrabold text-emerald-500 mt-0.5">{stats.activeRequests}</div>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card">
          <div className="text-[11px] text-muted-foreground font-semibold">Suspended</div>
          <div className="text-2xl font-extrabold text-destructive mt-0.5">{stats.totalSuspended}</div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          {actionMessage}
        </div>
      )}

      {/* Simulated Email Notification on Approval */}
      {approvalEmailAlert && (
        <Card className="border-emerald-500/40 bg-emerald-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="success" className="gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Activation Email Dispatched
              </Badge>
              <Button size="sm" variant="ghost" onClick={() => setApprovalEmailAlert(null)} className="h-6 text-xs">
                Dismiss
              </Button>
            </div>
            <CardTitle className="text-base text-foreground mt-1">
              Email Delivered to: <span className="font-mono text-emerald-600 dark:text-emerald-400">{approvalEmailAlert.email}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              The Agency &quot;{approvalEmailAlert.name}&quot; has been approved. The system automatically generated a secure password setup link.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="p-3 rounded-xl bg-background border border-border font-mono text-xs space-y-1">
              <div className="text-muted-foreground">Subject: Rokto Britto - Official Agency Accreditation & Password Setup</div>
              <div className="text-muted-foreground">Activation URL:</div>
              <div className="text-foreground font-bold break-all">
                http://localhost:3000{approvalEmailAlert.activationUrl}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={approvalEmailAlert.activationUrl}>
                <Button size="sm" variant="default" className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Lock className="w-3.5 h-3.5" /> Test Password Setup Flow as Agency
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(t: any) => setActiveTab(t)}>
        <TabsList className="grid grid-cols-3 w-full h-auto p-1.5 gap-1.5">
          <TabsTrigger value="approvals" className="py-2.5 text-xs font-semibold gap-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>1. Agency Creation Approvals ({pendingAgencies.length})</span>
          </TabsTrigger>

          <TabsTrigger value="entities" className="py-2.5 text-xs font-semibold gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>2. User Base & Universal Suspension</span>
          </TabsTrigger>

          <TabsTrigger value="requests" className="py-2.5 text-xs font-semibold gap-2">
            <Radio className="w-4 h-4 text-rose-500" />
            <span>3. Emergency Requests Control ({requests.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: AGENCY APPROVAL QUEUE */}
        <TabsContent value="approvals" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              Pending Blood Bank & Agency Applications
            </h2>
            <Badge variant="outline" className="text-xs">
              {pendingAgencies.length} Awaiting Verification
            </Badge>
          </div>

          {pendingAgencies.length === 0 ? (
            <Card className="border-border bg-card p-8 text-center text-muted-foreground text-xs">
              No pending agency applications at this time. All centers are verified or processed.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingAgencies.map((agency) => (
                <Card key={agency.id} className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="warning">Verification Pending</Badge>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        Deposit Pledge: {agency.walletBalance} BDT
                      </span>
                    </div>
                    <CardTitle className="text-base text-foreground mt-1">{agency.name}</CardTitle>
                    <CardDescription className="text-xs font-mono">
                      License: {agency.licenseNumber}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-foreground" />
                        <span>{agency.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-foreground" />
                        <span>{agency.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-foreground" />
                        <span>{agency.address}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2 border-t border-border">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApproveAgency(agency.id)}
                        className="flex-1 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Dispatch Reset Email
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectAgency(agency.id)}
                        className="text-xs text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: UNIVERSAL ENTITY BASE & SUSPENSION CONTROL */}
        <TabsContent value="entities" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setEntityFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition ${entityFilter === 'ALL' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-muted-foreground'}`}
              >
                All Entities
              </button>
              <button
                type="button"
                onClick={() => setEntityFilter('USER')}
                className={`px-3 py-1 rounded-lg transition ${entityFilter === 'USER' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-muted-foreground'}`}
              >
                Citizens (Finders / Donors)
              </button>
              <button
                type="button"
                onClick={() => setEntityFilter('AGENCY')}
                className={`px-3 py-1 rounded-lg transition ${entityFilter === 'AGENCY' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-muted-foreground'}`}
              >
                Agencies
              </button>
              <button
                type="button"
                onClick={() => setEntityFilter('SUBAGENT')}
                className={`px-3 py-1 rounded-lg transition ${entityFilter === 'SUBAGENT' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-muted-foreground'}`}
              >
                Subagents
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, license..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-3">
            {/* Render Users and Subagents */}
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{user.fullName || 'Citizen User'}</span>
                    <Badge variant={user.role === 'SUBAGENT' ? 'info' : user.role === 'DONOR' ? 'success' : 'default'} className="text-[10px]">
                      {user.role}
                    </Badge>
                    {user.isSuspended && (
                      <Badge variant="destructive" className="text-[10px]">
                        SUSPENDED
                      </Badge>
                    )}
                    {user.isBanned && (
                      <Badge variant="destructive" className="text-[10px]">
                        BANNED (2 STRIKES)
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
                    <span>{user.email || user.phone || 'No direct contact'}</span>
                    <span>•</span>
                    <span>Blood: {user.bloodGroup}</span>
                    {user.hemoglobin && (
                      <>
                        <span>•</span>
                        <span>Hb: {user.hemoglobin} g/dL</span>
                      </>
                    )}
                    {user.profession && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{user.profession}</span>
                      </>
                    )}
                    {user.role === 'SUBAGENT' && user.agency && (
                      <>
                        <span>•</span>
                        <span className="text-purple-500">Agency: {user.agency.name}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={user.isSuspended ? 'outline' : 'destructive'}
                    onClick={() =>
                      handleToggleSuspension(
                        user.role === 'SUBAGENT' ? 'SUBAGENT' : 'USER',
                        user.id,
                        user.isSuspended
                      )
                    }
                    className="text-xs h-8 gap-1.5"
                  >
                    {user.isSuspended ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Reactivate Account
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5" /> Suspend Account
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}

            {/* Render Agencies */}
            {filteredAgencies.map((agency) => (
              <div
                key={agency.id}
                className="p-4 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{agency.name}</span>
                    <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                      AGENCY
                    </Badge>
                    <Badge variant={agency.isApproved ? 'success' : 'warning'} className="text-[10px]">
                      {agency.status}
                    </Badge>
                    {agency.isSuspended && (
                      <Badge variant="destructive" className="text-[10px]">
                        SUSPENDED
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
                    <span>License: {agency.licenseNumber}</span>
                    <span>•</span>
                    <span>{agency.email}</span>
                    <span>•</span>
                    <span>Subagents: {agency.subagents?.length || 0}</span>
                    <span>•</span>
                    <span>Wallet: {agency.walletBalance} BDT</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={agency.isSuspended ? 'outline' : 'destructive'}
                    onClick={() => handleToggleSuspension('AGENCY', agency.id, agency.isSuspended)}
                    className="text-xs h-8 gap-1.5"
                  >
                    {agency.isSuspended ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Reactivate Agency
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5" /> Suspend Agency
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: EMERGENCY REQUESTS CONTROL */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Live Emergency Requests</h2>
            <Badge variant="outline" className="text-xs">
              {requests.length} Requests Total
            </Badge>
          </div>

          {requests.length === 0 ? (
            <Card className="border-border bg-card p-8 text-center text-muted-foreground text-xs">
              No active blood requests in the system.
            </Card>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="emergency">{req.requiredBloodGroup}</Badge>
                      <span className="font-bold text-sm text-foreground">{req.hospitalName}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {req.urgency}
                      </Badge>
                      <Badge variant={req.status === 'ACTIVE' ? 'success' : 'default'} className="text-[10px]">
                        {req.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Hospital Address: {req.hospitalAddress}</span>
                      <span>•</span>
                      <span>Units Needed: {req.unitsNeeded}</span>
                      <span>•</span>
                      <span>Requester: {req.requester?.fullName || 'Anonymous'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'ACTIVE' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRequestStatus(req.id, 'CANCELLED')}
                        className="text-xs text-destructive hover:bg-destructive/10"
                      >
                        Cancel Request
                      </Button>
                    )}
                    {req.status !== 'COMPLETED' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleUpdateRequestStatus(req.id, 'COMPLETED')}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Mark Completed
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
