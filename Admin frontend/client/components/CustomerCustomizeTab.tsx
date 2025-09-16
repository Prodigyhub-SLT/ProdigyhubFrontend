import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { enhancedApiService } from '@/pages/api-service';
import { useAuth } from '@/contexts/AuthContext';
import { Wifi, Signal, Cable } from 'lucide-react';

interface CustomizeFormData {
  connectionType: 'LTE' | 'ADSL' | 'Fiber' | '';
  packageType: 'Unlimited' | 'Any Time' | 'Time Based' | '';
  speedTier: '1Mbps' | '10Mbps' | '100Mbps' | '300Mbps' | '1000Mbps' | '';
  staticIp: boolean;
}

const initialData: CustomizeFormData = {
  connectionType: '',
  packageType: '',
  speedTier: '',
  staticIp: false,
};

export default function CustomerCustomizeTab() {
  const { user } = useAuth();
  const [data, setData] = useState<CustomizeFormData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const canSubmit = data.connectionType && data.packageType && data.speedTier;

  // Highlighted guidance for Fiber based on provided terms/speeds image
  const fiberKeyPoints: string[] = [
    'Connection speeds are best-effort and depend on network conditions.',
    'No Extra GB or Data Add‑ons for unlimited packages.',
    'Static IP option is not available on unlimited packages.',
    'Speed-based unlimited plans available (1, 10, 100, 300, 1000 Mbps).',
    'Ultra/Flash packs: speed may reduce after reaching daily quota.',
    'P2P/VPN prioritization not available with Unlimited Blast plans.',
  ];

  const speedBadges = [
    { label: 'Up to 1000 Mbps Download', tone: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm' },
    { label: 'Up to 500 Mbps Upload', tone: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm' },
  ];

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const payload: any = {
        category: 'Broadband',
        customerEmail: user?.email || 'anonymous',
        connectionType: data.connectionType,
        packageType: data.packageType,
        speedTier: data.speedTier,
        staticIp: data.staticIp ? 'With Static IP Address' : 'Without Static IP Address',
        requestSource: 'CustomerCustomizeTab',
      };

      const result = await enhancedApiService.checkProductConfiguration(payload);
      setSubmittedId(result?.id || null);
    } catch (e) {
      console.error('Failed to submit customization', e);
      alert('Failed to submit customization request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-10 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.12),transparent_35%)]"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200 drop-shadow-sm">Customize Your Package</span>
          </h2>
          <p className="mt-3 max-w-3xl text-white/90 text-sm md:text-base leading-relaxed">
            <span className="font-semibold text-white">We can create our own packages — let’s try it out.</span> Choose your connection, package type, speed and whether you need a static IP.
          </p>
        </div>
      </div>
      <Card className="bg-white/90 backdrop-blur shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Build your plan</CardTitle>
          <CardDescription className="text-gray-600">Pick a connection and tailor the rest to match your needs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Fiber guidance */}
          {data.connectionType === 'Fiber' && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 md:p-5 shadow-sm">
              {/* Speed highlight row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {speedBadges.map((b, i) => (
                  <span key={i} className={`text-xs md:text-sm px-3 py-1.5 rounded-full ${b.tone}`}>{b.label}</span>
                ))}
                <span className="text-[11px] md:text-xs text-blue-900/80 bg-white/60 px-2 py-1 rounded-lg border border-blue-100">Best-effort, depends on line condition</span>
              </div>

              <div className="text-sm text-blue-900 font-semibold mb-2">Important notes before choosing Fiber</div>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-blue-900">
                {fiberKeyPoints.map((p, i) => (
                  <li key={i}>
                    {i === 0 ? (
                      <span className="font-semibold bg-blue-100/70 px-1.5 py-0.5 rounded">{p}</span>
                    ) : (
                      p
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label className="mb-2 block">Connection Type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[{id:'LTE', name:'LTE', Icon: Signal, desc:'Mobile broadband'}, {id:'ADSL', name:'ADSL', Icon: Cable, desc:'Copper line'}, {id:'Fiber', name:'Fiber', Icon: Wifi, desc:'Fastest & stable'}].map(({id, name, Icon, desc}) => {
                  const active = data.connectionType === (id as any);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setData(d => ({ ...d, connectionType: id as any }))}
                      className={`text-left rounded-2xl p-4 border transition-all shadow-sm hover:shadow-md focus:outline-none ${active ? 'border-purple-500 ring-2 ring-purple-200 bg-purple-50' : 'border-gray-200 bg-white'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className={`font-semibold ${active ? 'text-purple-700' : 'text-gray-900'}`}>{name}</div>
                          <div className="text-xs text-gray-500">{desc}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Package Type</Label>
              <Select value={data.packageType} onValueChange={(v: any) => setData(d => ({ ...d, packageType: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select package type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unlimited">Unlimited</SelectItem>
                  <SelectItem value="Any Time">Any Time</SelectItem>
                  <SelectItem value="Time Based">Time Based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Speed Tier</Label>
              <Select value={data.speedTier} onValueChange={(v: any) => setData(d => ({ ...d, speedTier: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1Mbps">1 Mbps</SelectItem>
                  <SelectItem value="10Mbps">10 Mbps</SelectItem>
                  <SelectItem value="100Mbps">100 Mbps</SelectItem>
                  <SelectItem value="300Mbps">300 Mbps</SelectItem>
                  <SelectItem value="1000Mbps">1000 Mbps</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">Static IP Address
                <span className="text-xs text-gray-500">Optional</span>
              </Label>
              <div className="flex items-center gap-3">
                <Switch checked={data.staticIp} onCheckedChange={(v: boolean) => setData(d => ({ ...d, staticIp: v }))} />
                <span className="text-sm text-gray-600">{data.staticIp ? 'With Static IP Address' : 'Without Static IP Address'}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button disabled={!canSubmit || submitting} onClick={handleSubmit} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
              {submitting ? 'Submitting...' : 'Submit Customization Request'}
            </Button>
          </div>

          {submittedId && (
            <div className="text-sm text-green-700">Request submitted. Reference ID: {submittedId}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


