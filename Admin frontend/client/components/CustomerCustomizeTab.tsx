import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { enhancedApiService } from '@/pages/api-service';
import { useAuth } from '@/contexts/AuthContext';

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
    <div className="max-w-3xl mx-auto">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Customize Your Package</CardTitle>
          <CardDescription className="text-gray-600">Select options and submit a request. It will appear in Product Configuration for admin review.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Connection Type</Label>
              <Select value={data.connectionType} onValueChange={(v: any) => setData(d => ({ ...d, connectionType: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select connection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LTE">LTE</SelectItem>
                  <SelectItem value="ADSL">ADSL</SelectItem>
                  <SelectItem value="Fiber">Fiber</SelectItem>
                </SelectContent>
              </Select>
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
            <Button disabled={!canSubmit || submitting} onClick={handleSubmit} className="w-full">
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


