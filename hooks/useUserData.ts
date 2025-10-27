
import { useState, useEffect, useCallback } from 'react';
import { UserData, CheckIn, CapacityState, LogType } from '../types';

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

export const useUserData = (userKey: string) => {
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
