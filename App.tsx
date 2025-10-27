
import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- From types.ts ---
interface CapacityState {
  energy: number;
  attention: number;
  readiness: number;
}

enum LogType {
  Normal = 'NORMAL',
  SuddenDrop = 'SUDDEN_DROP',
  Increase = 'INCREASE',
  Initial = 'INITIAL',
}

interface CheckIn extends CapacityState {
  id: string;
  timestamp: string;
  journal: string;
  logType: LogType;
}

interface UserData {
  checkIns: CheckIn[];
}

// --- From hooks/useUserData.ts ---
const getTodaysCheckIns = (allCheckIns: CheckIn[]): CheckIn[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return allCheckIns
    .filter(c => new Date(c.timestamp) >= today)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

const determineLogType = (newCheckIn: CapacityState, previousCheckIn: CheckIn | undefined): LogType => {
  if (!previousCheckIn) {
    return LogType.Initial;
  }
  const getAverage = (state: CapacityState) => (state.energy + state.attention + state.readiness) / 3;
  
  const oldAvg = getAverage(previousCheckIn);
  const newAvg = getAverage(newCheckIn);
  const diff = newAvg - oldAvg;

  if (diff > 0.5) return LogType.Increase;
  if (diff < -2.5) return LogType.SuddenDrop;
  return LogType.Normal;
};

const useUserData = (userKey: string) => {
  const [userData, setUserData] = useState<UserData>({ checkIns: [] });
  const [todaysCheckIns, setTodaysCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = `capacity-tracker-data-${userKey}`;

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  useEffect(() => {
    setTodaysCheckIns(getTodaysCheckIns(userData.checkIns));
  }, [userData.checkIns]);

  const saveData = useCallback((data: UserData) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setUserData(data);
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  }, [storageKey]);

  const addCheckIn = useCallback((capacity: CapacityState, journal: string) => {
    const lastCheckIn = getTodaysCheckIns(userData.checkIns).slice(-1)[0];
    const newCheckIn: CheckIn = {
      id: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      journal,
      ...capacity,
      logType: determineLogType(capacity, lastCheckIn),
    };
    const updatedCheckIns = [...userData.checkIns, newCheckIn];
    saveData({ checkIns: updatedCheckIns });
  }, [userData.checkIns, saveData]);
  
  const clearTodaysData = useCallback(() => {
     const today = new Date();
     today.setHours(0, 0, 0, 0);
     const remainingCheckIns = userData.checkIns.filter(c => new Date(c.timestamp) < today);
     saveData({ checkIns: remainingCheckIns });
  }, [userData.checkIns, saveData]);

  return { userData, todaysCheckIns, isLoading, addCheckIn, clearTodaysData };
};

// --- From components/CapacityDisplay.tsx ---
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

const CapacityDisplay: React.FC<{ latestCheckIn: CheckIn | undefined; }> = ({ latestCheckIn }) => {
  if (!latestCheckIn) {
    return null;
  }
  
  return (
    <div className="p-4 sm:p-6 bg-brand-surface rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Current Status</h2>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <CapacityBar label="Energy" value={latestCheckIn.energy} color="bg-brand-accent-blue" />
        <CapacityBar label="Attention" value={latestCheckIn.attention} color="bg-brand-accent-green" />
        <CapacityBar label="Readiness" value={latestCheckIn.readiness} color="bg-brand-secondary" />
      </div>
    </div>
  );
};


// --- From components/CheckInForm.tsx ---
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

const CheckInForm: React.FC<{
  onClose: () => void;
  onSubmit: (capacity: CapacityState, journal: string) => void;
  latestCheckIn: CheckIn | undefined;
}> = ({ onClose, onSubmit, latestCheckIn }) => {
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
            <button onClick={onClose} aria-label="Close" className="text-brand-subtle hover:text-brand-text text-2xl leading-none">&times;</button>
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


// --- From components/TimelineChart.tsx ---
const LOG_TYPE_COLORS: Record<LogType, string> = {
  [LogType.Initial]: '#9ca3af',
  [LogType.Normal]: '#9ca3af',
  [LogType.SuddenDrop]: '#60a5fa',
  [LogType.Increase]: '#34d399',
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data: CheckIn = payload[0].payload;
    return (
      <div className="p-3 bg-brand-primary bg-opacity-90 border border-brand-surface rounded-lg shadow-lg text-sm">
        <p className="font-bold text-brand-text mb-1">{label}</p>
        {payload.map((pld: any) => (
          <p key={pld.dataKey} style={{ color: pld.stroke }}>
            {`${pld.name}: ${pld.value}`}
          </p>
        ))}
        {data.journal && <p className="mt-2 text-brand-subtle italic">"{data.journal}"</p>}
      </div>
    );
  }
  return null;
};

const CustomizedDot: React.FC<any> = (props) => {
    const { cx, cy, payload } = props;
    const color = LOG_TYPE_COLORS[payload.logType as LogType] || LOG_TYPE_COLORS.NORMAL;

    return (
        <svg x={cx - 6} y={cy - 6} width={12} height={12} fill={color} viewBox="0 0 1024 1024">
            <circle cx="512" cy="512" r="512" />
        </svg>
    );
};

const TimelineChart: React.FC<{ data: CheckIn[]; }> = ({ data }) => {
  if (!data || data.length < 1) {
    return <div className="text-center text-brand-subtle py-10">No data to display for today.</div>;
  }

  const chartData = data.map(item => {
    const checkInDate = new Date(item.timestamp);
    const hoursSince8AM = (checkInDate.getHours() + checkInDate.getMinutes() / 60) - 8;
    const baselineValue = hoursSince8AM > 0 ? Math.max(0, 12 - hoursSince8AM) : 12;

    return {
      ...item,
      time: checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      avg: parseFloat(((item.energy + item.attention + item.readiness) / 3).toFixed(2)),
      baseline: parseFloat(baselineValue.toFixed(2)),
    };
  });

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#16213e" />
          <XAxis dataKey="time" stroke="#a0a0a0" fontSize={12} />
          <YAxis domain={[0, 12]} stroke="#a0a0a0" fontSize={12} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{fontSize: "14px"}}/>
          <Line type="monotone" dataKey="energy" stroke="#60a5fa" strokeWidth={2} dot={false} name="Energy"/>
          <Line type="monotone" dataKey="attention" stroke="#34d399" strokeWidth={2} dot={false} name="Attention" />
          <Line type="monotone" dataKey="readiness" stroke="#e94560" strokeWidth={2} dot={false} name="Readiness" />
          <Line type="monotone" dataKey="baseline" stroke="#9ca3af" strokeDasharray="5 5" name="Baseline" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="avg" stroke="#e94560" strokeWidth={3} activeDot={{ r: 6 }} dot={<CustomizedDot/>} name="Average Capacity" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- From components/JournalList.tsx ---
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

const JournalList: React.FC<{ checkIns: CheckIn[]; }> = ({ checkIns }) => {
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


// --- From components/Dashboard.tsx ---
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

const Dashboard: React.FC<{ userKey: string; onLogout: () => void; }> = ({ userKey, onLogout }) => {
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


// --- From components/Login.tsx ---
const Login: React.FC<{ onSetUserKey: (key: string) => void; }> = ({ onSetUserKey }) => {
  const [keyInput, setKeyInput] = useState('');

  const generateNewKey = () => {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    const newKey = '0x' + Array.from(array).map(n => n.toString(16).padStart(8, '0')).join('');
    onSetUserKey(newKey);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.match(/^0x[a-fA-F0-9]{32}$/)) {
      onSetUserKey(keyInput);
    } else {
      alert('Invalid key format. Please enter a valid key or generate a new one.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-brand-bg">
      <div className="w-full max-w-md p-8 space-y-8 bg-brand-surface rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-brand-text">Capacity Tracker</h1>
          <p className="mt-2 text-brand-subtle">Your personal energy dashboard</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="user-key" className="text-sm font-medium text-brand-subtle">
              Enter Your User Key
            </label>
            <input
              id="user-key"
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="e.g., 0x1a2b3c..."
              className="w-full px-4 py-2 mt-2 text-brand-text bg-brand-primary border border-brand-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 font-semibold text-white bg-brand-secondary rounded-md hover:bg-opacity-90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-secondary"
          >
            Unlock Dashboard
          </button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-primary"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-brand-surface text-brand-subtle">Or</span>
          </div>
        </div>
        <button
          onClick={generateNewKey}
          className="w-full py-3 font-semibold text-brand-text bg-brand-primary rounded-md hover:bg-opacity-80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-secondary"
        >
          Create New User Key
        </button>
        <p className="text-xs text-center text-brand-subtle">
          Your key is your private access. Save it in a safe place, like a password manager, or bookmark the page after logging in.
        </p>
      </div>
    </div>
  );
};


// --- Original App.tsx ---
const App: React.FC = () => {
  const [userKey, setUserKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleSetUserKey = useCallback((key: string) => {
    setUserKey(key);
    window.location.hash = `#/user/${key}`;
  }, []);

  const handleLogout = useCallback(() => {
    setUserKey(null);
    window.location.hash = '';
  }, []);
  
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#\/user\/(0x[a-fA-F0-9]+)$/);
      if (match && match[1]) {
        if (match[1] !== userKey) {
            setUserKey(match[1]);
        }
      } else if (userKey) {
        setUserKey(null);
      }
      setIsLoading(false);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [userKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <div className="text-brand-text text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      {userKey ? (
        <Dashboard userKey={userKey} onLogout={handleLogout} />
      ) : (
        <Login onSetUserKey={handleSetUserKey} />
      )}
    </div>
  );
};

export default App;
