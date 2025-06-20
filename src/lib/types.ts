export type BetCategory =
  | "Fútbol"
  | "Tenis"
  | "Baloncesto"
  | "eSports"
  | "Deportes de Motor"
  | "Béisbol"
  | "Ping Pong"
  | "Otro"
  | (string & {}); // Permitir categorías personalizadas
export const BET_CATEGORIES: BetCategory[] = [
  "Fútbol",
  "Tenis",
  "Baloncesto",
  "eSports",
  "Deportes de Motor",
  "Béisbol",
  "Ping Pong",
  "Otro",
];

// BetStatus remains in English for data consistency, translation happens at display layer.
export type BetStatus = "Pending" | "Won" | "Lost" | "Void" | "CashedOut";

export interface Bet {
  id: string;
  title: string;
  category: BetCategory; // Will store Spanish values like "Fútbol"
  stake: number;
  odds: number;
  potentialWinnings: number;
  status: BetStatus; // Stores "Pending", "Won", "Lost", "Void", "CashedOut"
  createdAt: string; // ISO Date string
  resolvedAt?: string; // ISO Date string
  actualWinnings?: number;
  retorno?: number | null;
  beneficio?: number | null;
}

export type TransactionType = "Depósito" | "Retiro" | "Compra de Picks";

export interface Transaction {
  id: string;
  type: TransactionType; // Will store "Depósito", "Retiro", or "Compra de Picks"
  amount: number;
  description: string;
  date: string; // ISO Date string
}

export interface BetFormData {
  title: string;
  category: BetCategory;
  stake: string;
  odds: string;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: string;
  description: string;
  date: string;
}

export interface CashOutFormData {
  cashOutAmount: string;
}

export interface OverallStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalPicksPurchases: number; // Added for new transaction type
  financialBalance: number;
  totalBets: number;
  betsWon: number;
  betsLost: number;
  betsVoided: number;
  betsCashedOut: number;
  totalWagered: number;
  totalNetWinnings: number;
  profitPercentage: number;
  yieldPerBet: number; // NUEVO
}
