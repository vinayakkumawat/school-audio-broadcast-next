export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export type AudioStatus = 
  | 'FIRST_BURST'
  | 'WAITING_FIRST'
  | 'SECOND_BURST'
  | 'WAITING_SECOND'
  | 'FINAL_PLAY'
  | 'COMPLETED';

export interface Audio {
  id: string;
  userId: string;
  url: string;
  createdAt: string;
  playCount: number;
  nextPlayTime: number | null;
  status: AudioStatus;
}

export interface Admin {
  username: string;
  password: string;
}