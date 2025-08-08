// client/components/charts/ProgressChart.tsx
import React from 'react';

interface ProgressData {
  label: string;
  value: number;
  total: number;
  description?: string;
}

interface ProgressChartProps {
  data: ProgressData[];
  showPercentage?: boolean;
  showValues?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  showPercentage = false,
  showValues = false
}) => {
  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = item.total > 0 ? (item.value / item.total) * 100 : 0;
        return (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{item.label}</span>
              <div className="text-sm text-gray-600">
                {showValues && `${item.value}/${item.total}`}
                {showPercentage && ` (${percentage.toFixed(1)}%)`}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ProgressSummary: React.FC<{ data: ProgressData[] }> = ({ data }) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const totalMax = data.reduce((sum, item) => sum + item.total, 0);
  const overallPercentage = totalMax > 0 ? (totalValue / totalMax) * 100 : 0;

  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className="text-2xl font-bold text-blue-600">
        {overallPercentage.toFixed(1)}%
      </div>
      <div className="text-sm text-gray-600">
        Overall Success Rate ({totalValue}/{totalMax})
      </div>
    </div>
  );
};

export default ProgressChart;