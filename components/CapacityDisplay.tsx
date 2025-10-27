
import React from 'react';
import { CheckIn } from '../types';

interface CapacityDisplayProps {
  latestCheckIn: CheckIn | undefined;
}

const CapacityBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  const percentage = (value / 12) * 100;
  return (
    <div className="flex-1">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm font-medium text-brand-subtle">{label}</span>
        <span className="text-lg font-bold text-brand-text">{value}<span className="text-xs text-brand-subtle">/12</span></span>
      </div>
      <div className="w-full bg-brand-primary rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const CapacityDisplay: React.FC<CapacityDisplayProps> = ({ latestCheckIn }) => {
  if (!latestCheckIn) {
    return null;
  }
  
  return (
    <div className="p-4 sm:p-6 bg-brand-surface rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Current Status</h2>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <CapacityBar label="Energy" value={latestCheckIn.energy} color="bg-blue-500" />
        <CapacityBar label="Attention" value={latestCheckIn.attention} color="bg-green-500" />
        <CapacityBar label="Readiness" value={latestCheckIn.readiness} color="bg-purple-500" />
      </div>
    </div>
  );
};

export default CapacityDisplay;
