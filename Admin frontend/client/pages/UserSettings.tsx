import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Monitor, Palette, RotateCcw, Save } from 'lucide-react';

interface AppearanceSettings {
  colorScheme: 'default' | 'green' | 'purple' | 'orange';
  compactMode: boolean;
  fontSize: number;
}

export default function UserSettings() {
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    colorScheme: 'default',
    compactMode: false,
    fontSize: 14
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.appearance) {
          setAppearance((prev) => ({
            ...prev,
            ...parsed.appearance,
          }));
        }
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
  }, []);

  // Apply appearance to document (no theme switching here)
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${appearance.fontSize}px`;
    if (appearance.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
    root.setAttribute('data-color-scheme', appearance.colorScheme);
  }, [appearance]);

  const updateAppearance = (key: keyof AppearanceSettings, value: any) => {
    setAppearance((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    const existing = localStorage.getItem('userSettings');
    let base: any = {};
    try { base = existing ? JSON.parse(existing) : {}; } catch { base = {}; }
    localStorage.setItem('userSettings', JSON.stringify({
      ...base,
      appearance,
    }));
    setHasChanges(false);
    toast({ title: 'Settings saved', description: 'Your appearance preferences were updated.' });
  };

  const handleReset = () => {
    const defaults: AppearanceSettings = {
      colorScheme: 'default',
      compactMode: false,
      fontSize: 14,
    };
    setAppearance(defaults);
    setHasChanges(true);
    toast({ title: 'Settings reset', description: 'Appearance reset to defaults.' });
  };

  return (
    <div 
      id="page-background"
      className="min-h-screen py-8 transition-colors duration-500"
      style={{ 
        background: 'linear-gradient(135deg, var(--dynamic-bg-color, #3b82f6) 0%, rgba(0,0,0,0.8) 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white drop-shadow">Settings</h1>
          <p className="text-white/80 mt-2">Customize your dashboard appearance</p>
        </div>

        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Only user-visible appearance settings. Theme switching is disabled.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Color Scheme</Label>
              <Select
                value={appearance.colorScheme}
                onValueChange={(value) => updateAppearance('colorScheme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size: {appearance.fontSize}px</Label>
              <Slider
                value={[appearance.fontSize]}
                onValueChange={(v) => updateAppearance('fontSize', v[0])}
                max={18}
                min={12}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Small</span>
                <span>Medium</span>
                <span>Large</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Compact Mode</Label>
              <p className="text-sm text-gray-600">Use smaller spacing and denser layouts</p>
            </div>
            {/* Inline switch to avoid importing extra UI when not needed */}
            <button
              type="button"
              onClick={() => updateAppearance('compactMode', !appearance.compactMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${appearance.compactMode ? 'bg-green-600' : 'bg-gray-300'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${appearance.compactMode ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          <div className="rounded-md bg-muted/30 p-3 text-xs text-gray-600 flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Changes apply immediately and are saved on Save Changes.
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">Unsaved changes</Badge>
            )}
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}


