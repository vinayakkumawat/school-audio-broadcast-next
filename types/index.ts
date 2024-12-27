export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface Audio {
  id: string;
  userId: string;
  url: string;
  createdAt: string;
  queue: 1 | 2 | 3;
  played: boolean;
}

export interface Admin {
  username: string;
  password: string;
}