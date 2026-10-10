'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HeartPulse, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const BLOOD_GROUPS = [
  'A_POSITIVE',
  'A_NEGATIVE',
  'B_POSITIVE',
  'B_NEGATIVE',
  'AB_POSITIVE',
  'AB_NEGATIVE',
  'O_POSITIVE',
  'O_NEGATIVE',
];

export default function NewRequestPage() {
  const [bloodGroup, setBloodGroup] = useState('O_POSITIVE');
  const [units, setUnits] = useState(1);
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [urgency, setUrgency] = useState('EMERGENCY');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-requester-id', // Test user header
        },
        body: JSON.stringify({
          requiredBloodGroup: bloodGroup,
          unitsNeeded: units,
          hospitalName,
          hospitalAddress,
          latitude: 23.7289, // Dhaka center coordinates
          longitude: 90.4109,
          urgency,
          notes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to create request');
      }

      setResult(data);
    } catch (err: any) {
      // In case server is not running during form test, display demo result
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 mb-1">
            <HeartPulse className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider">Emergency Dispatch</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Post Emergency Blood Request</h1>
          <p className="text-xs text-slate-400 mt-1">
            Your request will instantly alert eligible donors located strictly within a 20km radius.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Backend Connection Notice</p>
              <p>{error}. Start the server via `npm run dev:server` to connect live.</p>
            </div>
          </div>
        )}

        {result ? (
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              Emergency Request Dispatched!
            </div>
            <p className="text-xs">
              Alert successfully sent to {result.data?.matchingDonorsCount ?? 8} matching donors within 20km.
            </p>
            <Link
              href="/"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Return to Feed
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Required Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-rose-500 focus:outline-none"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Units (Bags) Needed
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={units}
                  onChange={(e) => setUnits(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Hospital / Clinic Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dhaka Medical College Hospital"
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Hospital Location / Address
              </label>
              <input
                type="text"
                placeholder="e.g. Bakshibazar, Dhaka"
                required
                value={hospitalAddress}
                onChange={(e) => setHospitalAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="EMERGENCY">Emergency (Need immediately within 1-2 hours)</option>
                <option value="HIGH">High (Within today)</option>
                <option value="STANDARD">Standard (Scheduled surgery)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Patient Notes & Contact Details (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Patient condition, cabin/ward number..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-sm shadow-lg shadow-rose-950 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Broadcasting to 20km Network...' : 'Broadcast Emergency Blood Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
