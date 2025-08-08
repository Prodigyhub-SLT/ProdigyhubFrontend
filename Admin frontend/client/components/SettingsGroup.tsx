import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface SettingItem {
  id: string;
  type: 'switch' | 'select' | 'slider' | 'input' | 'textarea' | 'button' | 'custom';
  label: string;
  description?: string;
  value?: any;
  onChange?: (value: any) => void;
  onClick?: () => void;
  options?: { value: string; label: string; }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  children?: ReactNode;
}

interface SettingsGroupProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  items: SettingItem[];
  className?: string;
}

export default function SettingsGroup({ 
  title, 
  description, 
  icon: Icon, 
  items, 
  className 
}: SettingsGroupProps) {
  const renderSettingItem = (item: SettingItem) => {
    const baseClasses = "flex items-center justify-between py-3";
    
    switch (item.type) {
      case 'switch':
        return (
          <div key={item.id} className={baseClasses}>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Label htmlFor={item.id}>{item.label}</Label>
                {item.badge && (
                  <Badge variant={item.badgeVariant || 'outline'} className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
              )}
            </div>
            <Switch
              id={item.id}
              checked={item.value}
              onCheckedChange={item.onChange}
              disabled={item.disabled}
            />
          </div>
        );

      case 'select':
        return (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor={item.id}>{item.label}</Label>
              {item.badge && (
                <Badge variant={item.badgeVariant || 'outline'} className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-gray-600">{item.description}</p>
            )}
            <Select 
              value={item.value} 
              onValueChange={item.onChange}
              disabled={item.disabled}
            >
              <SelectTrigger id={item.id}>
                <SelectValue placeholder={item.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {item.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'slider':
        return (
          <div key={item.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor={item.id}>{item.label}</Label>
                {item.badge && (
                  <Badge variant={item.badgeVariant || 'outline'} className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {item.value}
                {item.label.includes('seconds') && 's'}
                {item.label.includes('MB') && ' MB'}
                {item.label.includes('px') && 'px'}
              </span>
            </div>
            {item.description && (
              <p className="text-sm text-gray-600">{item.description}</p>
            )}
            <Slider
              id={item.id}
              value={[item.value]}
              onValueChange={(value) => item.onChange?.(value[0])}
              max={item.max || 100}
              min={item.min || 0}
              step={item.step || 1}
              disabled={item.disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{item.min || 0}</span>
              <span>{Math.floor((item.max || 100) / 2)}</span>
              <span>{item.max || 100}</span>
            </div>
          </div>
        );

      case 'input':
        return (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor={item.id}>{item.label}</Label>
              {item.badge && (
                <Badge variant={item.badgeVariant || 'outline'} className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-gray-600">{item.description}</p>
            )}
            <Input
              id={item.id}
              value={item.value}
              onChange={(e) => item.onChange?.(e.target.value)}
              placeholder={item.placeholder}
              disabled={item.disabled}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor={item.id}>{item.label}</Label>
              {item.badge && (
                <Badge variant={item.badgeVariant || 'outline'} className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-gray-600">{item.description}</p>
            )}
            <Textarea
              id={item.id}
              value={item.value}
              onChange={(e) => item.onChange?.(e.target.value)}
              placeholder={item.placeholder}
              disabled={item.disabled}
              rows={3}
            />
          </div>
        );

      case 'button':
        return (
          <div key={item.id} className={baseClasses}>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Label>{item.label}</Label>
                {item.badge && (
                  <Badge variant={item.badgeVariant || 'outline'} className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
              )}
            </div>
            <Button
              variant={item.buttonVariant || 'outline'}
              onClick={item.onClick}
              disabled={item.disabled}
            >
              {item.value || item.label}
            </Button>
          </div>
        );

      case 'custom':
        return (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label>{item.label}</Label>
              {item.badge && (
                <Badge variant={item.badgeVariant || 'outline'} className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-gray-600">{item.description}</p>
            )}
            {item.children}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id}>
            {renderSettingItem(item)}
            {index < items.length - 1 && <Separator className="my-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Helper function to create setting items
export const createSettingItem = (
  id: string,
  type: SettingItem['type'],
  label: string,
  options: Partial<Omit<SettingItem, 'id' | 'type' | 'label'>> = {}
): SettingItem => ({
  id,
  type,
  label,
  ...options
});

// Predefined setting item creators for common use cases
export const createSwitchSetting = (
  id: string,
  label: string,
  value: boolean,
  onChange: (value: boolean) => void,
  options: Partial<SettingItem> = {}
) => createSettingItem(id, 'switch', label, { value, onChange, ...options });

export const createSelectSetting = (
  id: string,
  label: string,
  value: string,
  onChange: (value: string) => void,
  selectOptions: { value: string; label: string; }[],
  options: Partial<SettingItem> = {}
) => createSettingItem(id, 'select', label, { value, onChange, options: selectOptions, ...options });

export const createSliderSetting = (
  id: string,
  label: string,
  value: number,
  onChange: (value: number) => void,
  min: number,
  max: number,
  options: Partial<SettingItem> = {}
) => createSettingItem(id, 'slider', label, { value, onChange, min, max, ...options });

export const createInputSetting = (
  id: string,
  label: string,
  value: string,
  onChange: (value: string) => void,
  options: Partial<SettingItem> = {}
) => createSettingItem(id, 'input', label, { value, onChange, ...options });

export const createButtonSetting = (
  id: string,
  label: string,
  onClick: () => void,
  options: Partial<SettingItem> = {}
) => createSettingItem(id, 'button', label, { onClick, ...options });
