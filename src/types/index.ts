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
  courseFee: number;
  funds: Funds;
  surplus: number;
  notes: string;
  deletedAt?: string | null;
}

export interface Funds {
  bankTransfer: number;
  cash: number;
  card: number;
}

export interface DashboardData {
  players: Player[];
  currentEvent: Event | null;
  funds: Funds;
  surplus: number;
  notes: string;
  lastUpdated: string;
}

export interface User {
  id: string;
  username: string;
  isAuthenticated: boolean;
}
