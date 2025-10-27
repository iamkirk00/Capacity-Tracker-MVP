
import React from 'react';
import { CheckIn, LogType } from '../types';

interface JournalListProps {
  checkIns: CheckIn[];
}

const LOG_TYPE_STYLES: Record<LogType, { color: string, label: string }> = {
  [LogType.Initial]: { color: 'bg-brand-accent-gray', label: 'Initial' },
  [LogType.Normal]: { color: 'bg-brand-accent-gray', label: 'Normal' },
  [LogType.SuddenDrop]: { color: 'bg-brand-accent-blue', label: 'Sudden Drop' },
  [LogType.Increase]: { color: 'bg-brand-accent-green', label: 'Increase' },
};

const JournalEntry: React.FC<{ checkIn: CheckIn }> = ({ checkIn }) => {
  const { color, label } = LOG_TYPE_STYLES[checkIn.logType] || LOG_TYPE_STYLES.NORMAL;
  
  return (
    <div className="bg-brand-surface p-4 rounded-lg flex gap-4 items-start">
      <div className="flex-shrink-0 pt-1.5">
        <span className={`block w-3 h-3 rounded-full ${color}`}></span>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-baseline text-sm">
          <p className="font-bold text-brand-text">
            {new Date(checkIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-xs font-medium text-brand-subtle">{label}</p>
        </div>
        <p className="mt-2 text-brand-text">{checkIn.journal || <span className="italic text-brand-subtle">No journal entry.</span>}</p>
        <div className="text-xs text-brand-subtle mt-3 flex gap-4">
            <span>E: {checkIn.energy}</span>
            <span>A: {checkIn.attention}</span>
            <span>R: {checkIn.readiness}</span>
        </div>
      </div>
    </div>
  );
};

const JournalList: React.FC<JournalListProps> = ({ checkIns }) => {
  const reversedCheckIns = [...checkIns].reverse();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Today's Journal</h2>
      {reversedCheckIns.length > 0 ? (
        <div className="space-y-3">
          {reversedCheckIns.map((checkIn) => (
            <JournalEntry key={checkIn.id} checkIn={checkIn} />
          ))}
        </div>
      ) : (
        <div className="text-center text-brand-subtle py-10 bg-brand-surface rounded-lg">
          No journal entries for today.
        </div>
      )}
    </div>
  );
};

export default JournalList;
