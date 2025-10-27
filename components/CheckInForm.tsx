
import React, { useState } from 'react';
import { CapacityState, CheckIn } from '../types';

interface CheckInFormProps {
  onClose: () => void;
  onSubmit: (capacity: CapacityState, journal: string) => void;
  latestCheckIn: CheckIn | undefined;
}

const Slider: React.FC<{label: string, value: number, onChange: (val: number) => void}> = ({label, value, onChange}) => (
    <div>
        <label className="block mb-2 text-sm font-medium text-brand-subtle flex justify-between">
            <span>{label}</span>
            <span className="font-bold text-brand-text">{value}</span>
        </label>
        <input
            type="range"
            min="0"
            max="12"
            step="1"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-2 bg-brand-primary rounded-lg appearance-none cursor-pointer"
        />
    </div>
);

const CheckInForm: React.FC<CheckInFormProps> = ({ onClose, onSubmit, latestCheckIn }) => {
  const [capacity, setCapacity] = useState<CapacityState>(
    latestCheckIn ? { 
      energy: latestCheckIn.energy, 
      attention: latestCheckIn.attention, 
      readiness: latestCheckIn.readiness 
    } : { energy: 6, attention: 6, readiness: 6 }
  );
  const [journal, setJournal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(capacity, journal);
    onClose();
  };
  
  const updateCapacity = (field: keyof CapacityState, value: number) => {
      setCapacity(prev => ({...prev, [field]: value}));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-brand-surface rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-brand-text">How are you feeling?</h2>
            <button onClick={onClose} className="text-brand-subtle hover:text-brand-text">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Slider label="Energy" value={capacity.energy} onChange={val => updateCapacity('energy', val)} />
            <Slider label="Attention" value={capacity.attention} onChange={val => updateCapacity('attention', val)} />
            <Slider label="Physical Readiness" value={capacity.readiness} onChange={val => updateCapacity('readiness', val)} />

            <div>
              <label htmlFor="journal" className="block mb-2 text-sm font-medium text-brand-subtle">
                Journal Entry (optional)
              </label>
              <textarea
                id="journal"
                rows={4}
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="What drained or recharged you?"
                className="w-full p-2 bg-brand-primary text-brand-text border border-brand-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary"
              ></textarea>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm font-semibold text-brand-subtle bg-brand-primary rounded-md hover:bg-opacity-80 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-semibold text-white bg-brand-secondary rounded-md hover:bg-opacity-90 transition"
              >
                Log Check-in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckInForm;
