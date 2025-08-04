export interface Player {
  id: string;
  name: string;
  email?: string;
  joinedDate: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  players: string[];
  playerCount: number;
  playerFee: number;
  playerGroup1Name?: string;
  playerCount2: number;
  playerFee2: number;
  playerGroup2Name?: string;
  levy1Name?: string;
  levy1Value: number;
  levy2Name?: string;
  levy2Value: number;
  courseFee: number;
  cashInBank: number;
  funds: Funds;
  surplus: number;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface Funds {
  bankTransfer: number;
  cash: number;
  card: number;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'viewer';
  isAuthenticated: boolean;
}
