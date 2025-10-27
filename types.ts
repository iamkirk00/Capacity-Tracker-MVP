
export interface CapacityState {
  energy: number;
  attention: number;
  readiness: number;
}

export enum LogType {
  Normal = 'NORMAL',
  SuddenDrop = 'SUDDEN_DROP',
  Increase = 'INCREASE',
  Initial = 'INITIAL',
}

export interface CheckIn extends CapacityState {
  id: string;
  timestamp: string;
  journal: string;
  logType: LogType;
}

export interface UserData {
  checkIns: CheckIn[];
}
