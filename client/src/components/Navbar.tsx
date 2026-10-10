'use client';

import Link from 'next/link';
import { HeartPulse, Radio, PlusCircle, Building2, ShieldAlert, UserCheck, LogIn, ShieldCheck, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-900 flex items-center justify-center text-white shadow-lg shadow-rose-950/30 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-lg text-foreground flex items-center gap-2">
              <span>Rokto Britto</span>
              <Badge variant="emergency" className="text-[10px] py-0 px-1.5 font-normal">
                রক্ত বৃত্ত
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">Location Based Live Blood Info</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
          >
            <Radio className="w-4 h-4 text-emerald-500" />
            Live Network
          </Link>
          <Link
            href="/requests/new"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
          >
            <PlusCircle className="w-4 h-4 text-rose-500" />
            Find Blood
          </Link>
          <Link
            href="/agency"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
          >
            <Building2 className="w-4 h-4 text-amber-500" />
            Agencies
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            Admin Panel
          </Link>
          <Link
            href="/safety"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
          >
            <ShieldAlert className="w-4 h-4 text-sky-500" />
            Safety & Ban
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Badge variant="success" className="hidden xl:flex items-center gap-1.5 py-1 px-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            20km Proximity Active
          </Badge>

          {/* Theme switcher (System, Light, Dark) */}
          <ThemeToggle />

          <Link href="/auth">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <LogIn className="w-3.5 h-3.5 text-rose-500" />
              Sign In
            </Button>
          </Link>

          <Link href="/auth">
            <Button variant="emergency" size="sm" className="gap-2 text-xs shadow-sm">
              <HeartPulse className="w-3.5 h-3.5" />
              Join Network
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
