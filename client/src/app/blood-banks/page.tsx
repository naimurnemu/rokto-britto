'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft, Coins, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function BloodBanksPage() {
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Demonstration of the 500 BDT boundary condition
    if (depositAmount < 500) {
      setError(`❌ Registration Rejected: Insufficient funds. Required minimum deposit is 500 BDT, received ${depositAmount} BDT.`);
      return;
    }

    setMessage(`✅ Registration Approved! Account active with ${depositAmount} BDT in ledger wallet.`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Building2 className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Organization Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Blood Bank Operations & Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">
            Organizations deposit an initial 500 BDT to join. Outreach messages to requesters cost 5 BDT per message, backed by atomic database transactions.
          </p>
        </div>

        {/* Boundary Rules Explainer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4" /> 500 BDT Onboarding Deposit
            </div>
            <p className="text-[11px] text-slate-400">
              Tested boundary cases: 499 BDT is rejected. 500 BDT and above approved immediately.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 5 BDT / Outreach Deduction
            </div>
            <p className="text-[11px] text-slate-400">
              Each direct outreach to a blood requester atomically debits 5 BDT from the wallet.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Blood Bank / Organization Name
              </label>
              <input
                type="text"
                placeholder="e.g. Bangladesh Red Crescent Blood Center"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Official License / Reg Number
              </label>
              <input
                type="text"
                placeholder="e.g. DGHS-BB-2026-081"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Official Email
              </label>
              <input
                type="email"
                placeholder="contact@redcrescent.bd"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Official Phone Number
              </label>
              <input
                type="text"
                placeholder="+8801700000000"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Initial Deposit Amount (BDT) — Minimum: 500 BDT
            </label>
            <input
              type="number"
              step="1"
              value={depositAmount}
              onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Try entering 499 to test the rejection boundary, or 500 to test approval.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-sm shadow-lg shadow-amber-950 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Coins className="w-4 h-4" />
            Complete Registration with Initial Deposit
          </button>
        </form>
      </div>
    </div>
  );
}
