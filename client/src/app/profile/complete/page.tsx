'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  HeartPulse,
  User,
  Calendar,
  Activity,
  Briefcase,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

const BLOOD_GROUPS = [
  { value: 'A_POSITIVE', label: 'A+ (Positive)' },
  { value: 'A_NEGATIVE', label: 'A- (Negative)' },
  { value: 'B_POSITIVE', label: 'B+ (Positive)' },
  { value: 'B_NEGATIVE', label: 'B- (Negative)' },
  { value: 'AB_POSITIVE', label: 'AB+ (Positive)' },
  { value: 'AB_NEGATIVE', label: 'AB- (Negative)' },
  { value: 'O_POSITIVE', label: 'O+ (Positive)' },
  { value: 'O_NEGATIVE', label: 'O- (Negative)' },
];

const PROFESSIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'EMPLOYEE', label: 'Private / Govt Employee' },
  { value: 'TEACHER', label: 'Teacher / Academic' },
  { value: 'DOCTOR', label: 'Doctor / Medical Professional' },
  { value: 'ENGINEER', label: 'Engineer / IT Professional' },
  { value: 'BUSINESS', label: 'Business / Entrepreneur' },
  { value: 'LABOR', label: 'Worker / Labor' },
  { value: 'OTHER', label: 'Other' },
];

export default function CompleteProfilePage() {
  const router = useRouter();

  // Basic info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');

  // Medical info
  const [bloodGroup, setBloodGroup] = useState('A_POSITIVE');
  const [hemoglobin, setHemoglobin] = useState(''); // Optional, e.g. 13.5 g/dL
  const [profession, setProfession] = useState('STUDENT');

  // Location info (Automatic vs Manual)
  const [locationMode, setLocationMode] = useState<'AUTOMATIC' | 'MANUAL'>('AUTOMATIC');
  const [latitude, setLatitude] = useState<number>(23.8103);
  const [longitude, setLongitude] = useState<number>(90.4125);
  const [address, setAddress] = useState('Dhaka Central, Bangladesh');
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);

  // Donor mode toggle
  const [isDonorAvailable, setIsDonorAvailable] = useState(true);

  // Status state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Trigger auto-location on initial mount if available
  useEffect(() => {
    detectLiveLocation();
  }, []);

  const detectLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationMode('MANUAL');
      return;
    }

    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(Number(position.coords.latitude.toFixed(6)));
        setLongitude(Number(position.coords.longitude.toFixed(6)));
        setAddress(`Live GPS Pick: ${position.coords.latitude.toFixed(4)}°N, ${position.coords.longitude.toFixed(4)}°E`);
        setGpsDetecting(false);
        setGpsDetected(true);
      },
      (err) => {
        setGpsDetecting(false);
        // Fallback to Dhaka coordinates
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const storedUser = localStorage.getItem('rokto_user');
      const storedToken = localStorage.getItem('rokto_token');

      let userId = '';
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          userId = parsed.id;
        } catch (e) {
          // ignore
        }
      }

      const res = await fetch('http://localhost:5000/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
        },
        body: JSON.stringify({
          userId,
          firstName,
          lastName,
          phone,
          dateOfBirth,
          gender,
          bloodGroup,
          hemoglobin: hemoglobin ? parseFloat(hemoglobin) : undefined,
          profession,
          locationType: locationMode,
          address,
          latitude,
          longitude,
          isDonorAvailable,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Profile completion failed.');
      }

      // Update cached user object
      if (data.data) {
        localStorage.setItem('rokto_user', JSON.stringify(data.data));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error completing profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="emergency" className="py-1 px-3">
          Step 2 of 2: Citizen Onboarding
        </Badge>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Complete Your Citizen Profile
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          In Rokto Britto, a Finder and a Donor are simply a User. Provide your medical details and emergency dispatch radius to activate your lifeline.
        </p>
      </div>

      <Card className="border-border bg-card shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-rose-500" /> Personal & Medical Information
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Confidential & Protected
            </Badge>
          </div>
          <CardDescription>
            Required to calculate the strict 20km proximity boundary and match blood groups instantly.
          </CardDescription>
        </CardHeader>

        {success ? (
          <CardContent className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">Profile Completed!</h2>
              <p className="text-sm text-muted-foreground">
                Your account is now fully active in the Rokto Britto live network. Redirecting to live feed...
              </p>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Section 1: Name (First, Last) & Phone */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  1. Identification Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="first-name">First Name *</Label>
                    <Input
                      id="first-name"
                      required
                      placeholder="e.g. Naimur"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="last-name">Last Name *</Label>
                    <Input
                      id="last-name"
                      required
                      placeholder="e.g. Rahman"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+880 1700-000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="gender">Gender *</Label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e: any) => setGender(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Medical, Hemoglobin & Profession */}
              <div className="space-y-4 pt-2 border-t border-border">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  2. Medical & Profession Profiling
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="blood-group">Blood Group *</Label>
                    <select
                      id="blood-group"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg.value} value={bg.value}>
                          {bg.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hemoglobin: Optional value */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hemoglobin">Hemoglobin (Hb)</Label>
                      <span className="text-[10px] text-muted-foreground">Optional</span>
                    </div>
                    <div className="relative">
                      <Input
                        id="hemoglobin"
                        type="number"
                        step="0.1"
                        min="5.0"
                        max="22.0"
                        placeholder="e.g. 13.5"
                        value={hemoglobin}
                        onChange={(e) => setHemoglobin(e.target.value)}
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                        g/dL
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="profession">Profession *</Label>
                    <select
                      id="profession"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {PROFESSIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {hemoglobin && (
                  <div className="p-3 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground flex items-center justify-between">
                    <span>
                      Standard Healthy Range: <strong>13.0 - 17.5 g/dL</strong> (Male) / <strong>12.0 - 15.5 g/dL</strong> (Female).
                    </span>
                    <Badge variant={parseFloat(hemoglobin) >= 12.5 ? 'success' : 'warning'}>
                      {parseFloat(hemoglobin) >= 12.5 ? 'Eligible for Donation' : 'Check with Physician'}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Section 3: Location Mode (Automatic or Manual from Map) */}
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    3. Dispatch Coordinates (Strict 20km Radius)
                  </h3>
                  <div className="flex items-center gap-1 p-1 bg-muted rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => { setLocationMode('AUTOMATIC'); detectLiveLocation(); }}
                      className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                        locationMode === 'AUTOMATIC' ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'text-muted-foreground'
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5" /> Automatic (Map/GPS)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationMode('MANUAL')}
                      className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                        locationMode === 'MANUAL' ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'text-muted-foreground'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" /> Manual Entry
                    </button>
                  </div>
                </div>

                {locationMode === 'AUTOMATIC' ? (
                  <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <Navigation className="w-4 h-4 animate-spin" />
                        <span>Live Coordinates Locked from Device Geolocation:</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={detectLiveLocation}
                        disabled={gpsDetecting}
                        className="text-xs h-7 gap-1"
                      >
                        {gpsDetecting ? 'Detecting...' : 'Refresh GPS'}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-background border border-border">
                        <span className="text-muted-foreground block text-[10px]">LATITUDE:</span>
                        <span className="text-foreground font-bold">{latitude}°</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-background border border-border">
                        <span className="text-muted-foreground block text-[10px]">LONGITUDE:</span>
                        <span className="text-foreground font-bold">{longitude}°</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                      {address} (Used to match nearby patients within exactly 20km).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="manual-address">Street / Area Address</Label>
                      <Input
                        id="manual-address"
                        required
                        placeholder="House 24, Road 7, Dhanmondi, Dhaka"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="lat">Latitude (Approx)</Label>
                        <Input
                          id="lat"
                          type="number"
                          step="0.0001"
                          value={latitude}
                          onChange={(e) => setLatitude(parseFloat(e.target.value) || 23.8103)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lng">Longitude (Approx)</Label>
                        <Input
                          id="lng"
                          type="number"
                          step="0.0001"
                          value={longitude}
                          onChange={(e) => setLongitude(parseFloat(e.target.value) || 90.4125)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Donor Readiness Toggle */}
              <div className="pt-2 border-t border-border">
                <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-foreground flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-rose-500" />
                      <span>Ready to Donate Blood when an Emergency Arrives?</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      If enabled, you will receive real-time notifications when a patient within 20km requests your blood group.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDonorAvailable(!isDonorAvailable)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                      isDonorAvailable ? 'bg-rose-600' : 'bg-muted'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        isDonorAvailable ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" variant="emergency" className="w-full gap-2 font-semibold text-sm" disabled={loading}>
                  {loading ? (
                    'Saving Profile & Connecting Lifeline...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Save Profile & Start Browsing
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        )}
      </Card>
    </div>
  );
}
