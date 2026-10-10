'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, AlertTriangle, UserX, CheckCircle, Flame } from 'lucide-react';

export default function SafetyPage() {
  const [targetUser, setTargetUser] = useState('demo-fake-requester');
  const [reason, setReason] = useState('Demanding money for blood donation');
  const [strikeLog, setStrikeLog] = useState<string[]>([]);
  const [strikes, setStrikes] = useState<number>(0);

  const handleReport = () => {
    if (strikes === 0) {
      setStrikes(1);
      setStrikeLog((prev) => [
        ...prev,
        `[Report #1] User flagged internally. Penalty strikes: 1. Account remains active with internal warning flag.`,
      ]);
    } else if (strikes === 1) {
      setStrikes(2);
      setStrikeLog((prev) => [
        ...prev,
        `[Report #2] AUTOMATED PERMANENT BAN TRIGGERED! Account disabled, active requests purged.`,
      ]);
    } else {
      setStrikeLog((prev) => [
        ...prev,
        `[Report #3] User already banned. Handled gracefully to prevent duplicate database mutations.`,
      ]);
    }
  };

  const handleReset = () => {
    setStrikes(0);
    setStrikeLog([]);
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
          <div className="flex items-center gap-2 text-rose-500 mb-1">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Community Protection</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Two-Strike Automated Ban System</h1>
          <p className="text-xs text-slate-400 mt-1">
            To protect patients and donors during vulnerabilities, Rokto Britto enforces an automated
            two-strike permanent ban policy against fake requests and abusive actors.
          </p>
        </div>

        {/* State progression cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            className={`p-4 rounded-2xl border text-xs space-y-1 ${
              strikes === 0
                ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Clean (0 Strikes)
            </div>
            <p className="text-[11px]">Normal active donor / requester account.</p>
          </div>

          <div
            className={`p-4 rounded-2xl border text-xs space-y-1 ${
              strikes === 1
                ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <Flame className="w-4 h-4" /> 1st Strike (Warning)
            </div>
            <p className="text-[11px]">Flagged internally, account kept active.</p>
          </div>

          <div
            className={`p-4 rounded-2xl border text-xs space-y-1 ${
              strikes >= 2
                ? 'bg-rose-950/50 border-rose-700/60 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <UserX className="w-4 h-4" /> 2nd Strike (Permanent Ban)
            </div>
            <p className="text-[11px]">Automated permanent ban triggered.</p>
          </div>
        </div>

        {/* Action simulator */}
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Target User Phone / ID to Report
            </label>
            <input
              type="text"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Reason for Report
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-rose-500 focus:outline-none"
            >
              <option value="Demanding money for blood donation">Demanding money for blood donation</option>
              <option value="Fake blood emergency request">Fake blood emergency request</option>
              <option value="Abusive or inappropriate messages in chat">Abusive or inappropriate messages in chat</option>
              <option value="Promised donation but did not attend">Promised donation but did not attend</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReport}
              className="flex-1 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-950 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              File Abuse Report Against User
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
            >
              Reset Strikes
            </button>
          </div>
        </div>

        {/* Live strike log */}
        {strikeLog.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-semibold text-slate-400">
              Automated Policy Execution Log:
            </div>
            <div className="space-y-1">
              {strikeLog.map((log, idx) => (
                <div key={idx} className="text-xs font-mono text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
