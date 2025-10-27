
import React, { useState } from 'react';
import { useUserData } from '../hooks/useUserData';
import CheckInForm from './CheckInForm';
import TimelineChart from './TimelineChart';
import JournalList from './JournalList';
import CapacityDisplay from './CapacityDisplay';
import { CheckIn } from '../types';

interface DashboardProps {
  userKey: string;
  onLogout: () => void;
}

const PlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
    </svg>
);

const LogOutIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

const Dashboard: React.FC<DashboardProps> = ({ userKey, onLogout }) => {
  const { todaysCheckIns, isLoading, addCheckIn } = useUserData(userKey);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const latestCheckIn: CheckIn | undefined = todaysCheckIns[todaysCheckIns.length - 1];

  if (isLoading) {
    return <div className="text-center p-8">Loading data...</div>;
  }

  return (
    <div className="relative min-h-screen p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-text">Daily Capacity</h1>
        <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-brand-subtle hover:text-brand-secondary transition-colors">
            <LogOutIcon className="w-5 h-5" />
            Logout
        </button>
      </header>

      {todaysCheckIns.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-200px)]">
          <h2 className="text-2xl font-semibold">Welcome!</h2>
          <p className="mt-2 text-brand-subtle max-w-md">
            It looks like you haven't made any check-ins today. Tap the button below to log your current capacity and start your day.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-8 flex items-center gap-2 px-6 py-3 font-bold text-white bg-brand-secondary rounded-full shadow-lg hover:bg-opacity-90 transition-transform transform hover:scale-105"
          >
            <PlusIcon className="w-6 h-6" />
            Add First Check-in
          </button>
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 space-y-6">
             <CapacityDisplay latestCheckIn={latestCheckIn} />
          </div>
          <div className="lg:col-span-3 p-4 sm:p-6 bg-brand-surface rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Today's Timeline</h2>
            <TimelineChart data={todaysCheckIns} />
          </div>
          <div className="lg:col-span-3">
            <JournalList checkIns={todaysCheckIns} />
          </div>
        </main>
      )}

      {/* Persistent CTA */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-brand-secondary text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-secondary"
        aria-label="Add new check-in"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      {isModalOpen && (
        <CheckInForm
          onClose={() => setIsModalOpen(false)}
          onSubmit={addCheckIn}
          latestCheckIn={latestCheckIn}
        />
      )}
    </div>
  );
};

export default Dashboard;
