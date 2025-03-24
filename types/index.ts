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
  | 'COMPLETED'
  | 'READY_TO_PLAY';

export interface Audio {
  id: string;
  userId: string;
  url: string;
  createdAt: string;
  playCount: number;
  nextPlayTime: number | null;
  status: AudioStatus;
  playIndex?: number; // Position in the sequence (1-6)
}

export interface Admin {
  username: string;
  password: string;
}