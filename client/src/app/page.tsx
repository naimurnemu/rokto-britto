'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  Radio,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  Users,
  Search,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  Send,
  Sparkles,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { getSocket } from '../lib/socket';

export default function LandingPage() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState('finder');
  const [proximityKm, setProximityKm] = useState(19.9);

  useEffect(() => {
    const socket = getSocket();
    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join_emergency_feed');
    });
    socket.on('disconnect', () => setSocketConnected(false));
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card via-card/80 to-background p-8 md:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={socketConnected ? 'success' : 'warning'} className="py-1 px-3 gap-2">
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></span>
              {socketConnected ? 'Live Real-Time Socket Connected' : 'Socket Server Standby'}
            </Badge>
            <Badge variant="emergency" className="py-1 px-3">
              Strict 20-Kilometer Emergency Dispatch
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Targeted Community Lifeline for <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-red-500 to-rose-600">Urgent Blood Emergencies</span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl font-normal leading-relaxed">
            Rokto Britto (রক্ত বৃত্ত) replaces chaotic social media searches with an instant,
            location-aware emergency network. Connecting <strong>Finders</strong>, <strong>Donors</strong>, <strong>Agencies</strong>, and authorized <strong>Subagents</strong> with strict anti-spam protection.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link href="/auth?role=FINDER">
              <Button variant="emergency" size="lg" className="gap-2">
                <Search className="w-5 h-5" />
                Find Blood Urgently (Finder)
              </Button>
            </Link>
            <Link href="/auth?role=DONOR">
              <Button variant="secondary" size="lg" className="gap-2">
                <HeartPulse className="w-5 h-5 text-rose-500" />
                Become a Donor
              </Button>
            </Link>
            <Link href="/auth?role=AGENCY">
              <Button variant="outline" size="lg" className="gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                Agency & Blood Bank Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Role Ecosystem Section (3 Roles + 1 Dependent Subagent Role) */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Badge variant="info" className="mb-2">4-Tier System Roles</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Ecosystem Architecture & Role Permissions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Engineered with 3 primary independent roles and 1 agency-dependent role
            </p>
          </div>
          <Link href="/auth">
            <Button variant="ghost" size="sm" className="gap-2 text-xs text-rose-400">
              Register for any role <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Shadcn Tabs Role Matrix */}
        <Tabs value={activeRoleTab} onValueChange={setActiveRoleTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1.5 gap-1.5">
            <TabsTrigger value="finder" className="gap-2 py-2.5">
              <Search className="w-4 h-4 text-rose-400" />
              <span>1. Finder (Requester)</span>
            </TabsTrigger>
            <TabsTrigger value="donor" className="gap-2 py-2.5">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              <span>2. Donor</span>
            </TabsTrigger>
            <TabsTrigger value="agency" className="gap-2 py-2.5">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>3. Agency (Blood Bank)</span>
            </TabsTrigger>
            <TabsTrigger value="subagent" className="gap-2 py-2.5">
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>4. Subagent (Dependent)</span>
            </TabsTrigger>
          </TabsList>

          {/* Finder Tab Content */}
          <TabsContent value="finder">
            <Card className="border-rose-900/40 bg-gradient-to-br from-card to-rose-950/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="emergency">Primary Role</Badge>
                    <Badge variant="outline">Patient / Family</Badge>
                  </div>
                  <Link href="/auth?role=FINDER">
                    <Button size="sm" variant="default" className="gap-1.5 text-xs">
                      Sign In as Finder <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
                <CardTitle className="text-xl text-rose-300">Finder (Blood Requester)</CardTitle>
                <CardDescription>
                  Urgent requesters seeking blood during health crises with anti-spam shields
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-background/60 border border-border/80 space-y-1.5">
                  <div className="font-semibold text-rose-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> 20km Radius Broadcasting
                  </div>
                  <p className="text-muted-foreground">
                    Posts emergency blood requests that instantly dispatch alerts strictly within 20km.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background/60 border border-border/80 space-y-1.5">
                  <div className="font-semibold text-rose-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Anti-Spam Protection
                  </div>
                  <p className="text-muted-foreground">
                    Protected from spam: Donors must agree on a schedule first and can send only 1 initial message.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background/60 border border-border/80 space-y-1.5">
                  <div className="font-semibold text-rose-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Request Lifecycle Control
                  </div>
                  <p className="text-muted-foreground">
                    Marks requests as &apos;COMPLETED&apos; once blood is secured, immediately terminating live dispatches.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donor Tab Content */}
          <TabsContent value="donor">
            <Card className="border-emerald-900/40 bg-gradient-to-br from-card to-emerald-950/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Primary Role</Badge>
                    <Badge variant="outline">Verified Volunteer</Badge>
                  </div>
                  <Link href="/auth?role=DONOR">
                    <Button size="sm" variant="default" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500">
                      Sign In as Donor <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
                <CardTitle className="text-xl text-emerald-300">Blood Donor</CardTitle>
                <CardDescription>
                  Volunteers mobilized instantly within 20km when matching blood types are requested
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-background/60 border border-border/80 space-y-1.5">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Smart 20km Pushes
                  </div>
                  <p className="text-muted-foreground">
                    Receives real-time push alerts only when eligible and strictly within 20km of the hospital.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background/60 border border-border/80 space-y-1.5">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Schedule Commitment
                  </div>
                  <p className="text-muted-foreground">
                    Selects a donation appointment time before initiating contact with the requester.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background/60 border border-border/80 space-y-1.5">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Two-Strike Abuse Protection
                  </div>
                  <p className="text-muted-foreground">
                    Can file reports against fake requesters; accounts receiving 2 strikes are permanently banned.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agency Tab Content */}
          <TabsContent value="agency">
            <Card className="border-amber-900/40 bg-gradient-to-br from-card to-amber-950/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">Primary Role</Badge>
                    <Badge variant="outline">Blood Banks & Hospitals</Badge>
                  </div>
                  <Link href="/auth?role=AGENCY">
                    <Button size="sm" variant="default" className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-500">
                      Sign In as Agency <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
                <CardTitle className="text-xl text-amber-300">Agency (Blood Bank & Hospital)</CardTitle>
                <CardDescription>
                  Certified healthcare organizations managing reserves and delegating subagents
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-background/60 border border-border/80 space-y-1.5">
                  <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> 500 BDT Onboarding & Wallet
                  </div>
                  <p className="text-muted-foreground">
                    Deposits minimum 500 BDT to activate. Ledger balances are protected by atomic DB transactions.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background/60 border border-border/80 space-y-1.5">
                  <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> 5 BDT Outreach Messaging
                  </div>
                  <p className="text-muted-foreground">
                    Reaches out to verified blood requesters for an atomic 5 BDT per message deduction.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background/60 border border-border/80 space-y-1.5">
                  <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Subagent Permission Delegation
                  </div>
                  <p className="text-muted-foreground">
                    Issues authorization credentials and assigns granular permissions to field staff subagents.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subagent (Dependent Role) Tab Content */}
          <TabsContent value="subagent">
            <Card className="border-purple-900/40 bg-gradient-to-br from-card to-purple-950/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="subagent">Dependent Role</Badge>
                    <Badge variant="outline">Permission-Bound to Agency</Badge>
                  </div>
                  <Link href="/auth?role=SUBAGENT">
                    <Button size="sm" variant="default" className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-500">
                      Sign In as Subagent <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
                <CardTitle className="text-xl text-purple-300">Subagent (Agency Delegated Agent)</CardTitle>
                <CardDescription>
                  Dependent staff, lab technicians, and dispatch volunteers authorized and permissioned by an Agency
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-background/60 border border-border/80 space-y-1.5">
                  <div className="font-semibold text-purple-400">DISPATCH_OUTREACH</div>
                  <p className="text-muted-foreground">
                    Permission to send outreach messages to requesters on behalf of parent agency.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-background/60 border border-border/80 space-y-1.5">
                  <div className="font-semibold text-purple-400">MANAGE_INVENTORY</div>
                  <p className="text-muted-foreground">
                    Permission to update blood bag stock, units available, and hospital reservations.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-background/60 border border-border/80 space-y-1.5">
                  <div className="font-semibold text-purple-400">COORDINATE_CHATS</div>
                  <p className="text-muted-foreground">
                    Permission to handle 1-message coordination chats for patient pickups.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-background/60 border border-border/80 space-y-1.5">
                  <div className="font-semibold text-purple-400">VERIFY_DONORS</div>
                  <p className="text-muted-foreground">
                    Permission to review donor screening logs and confirm hospital check-ins.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Interactive 20km Proximity & Business Boundary Demonstrator */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Live Boundary Specification Demonstration</h2>
            <p className="text-xs text-muted-foreground">
              Test how the backend service layer enforces the 20km boundary condition (Haversine formula)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Simulate Donor Distance:</span>
              <span className="font-mono text-foreground font-bold">{proximityKm} km</span>
            </div>

            <input
              type="range"
              min="19.0"
              max="21.0"
              step="0.1"
              value={proximityKm}
              onChange={(e) => setProximityKm(parseFloat(e.target.value))}
              className="w-full accent-rose-500 h-2 rounded-lg bg-muted cursor-pointer"
            />

            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>19.0 km</span>
              <span className="text-amber-400 font-bold">20.0 km (Boundary Threshold)</span>
              <span>21.0 km</span>
            </div>
          </div>

          <div
            className={`p-6 rounded-2xl border text-sm font-mono space-y-2 transition-all ${
              proximityKm <= 20.0
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
            }`}
          >
            <div className="font-bold flex items-center gap-2">
              {proximityKm <= 20.0 ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>BOUNDARY ACCEPTED (&le; 20.0 km)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span>BOUNDARY BLOCKED (&gt; 20.0 km)</span>
                </>
              )}
            </div>
            <p className="text-xs opacity-90">
              {proximityKm <= 20.0
                ? `Emergency push notification dispatched to eligible donors at ${proximityKm} km.`
                : `Donor is ${proximityKm} km away. Outside strict 20km radius to prevent notification spam.`}
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="text-center rounded-3xl border border-rose-950/40 bg-gradient-to-r from-rose-950/30 via-card to-rose-950/30 p-10 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          Join the Rokto Britto Emergency Network
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Every second counts in medical emergencies. Select your role to get started immediately.
        </p>
        <div className="pt-2">
          <Link href="/auth">
            <Button variant="emergency" size="lg" className="gap-2">
              <UserCheck className="w-5 h-5" />
              Get Started with Your Role
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
