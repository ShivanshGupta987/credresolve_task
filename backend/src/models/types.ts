// Shared type definitions
export type User = { id: string; name: string };
export type Group = { id: string; name: string; members: string[] };
export type Expense = {
  id: string;
  groupId: string;
  paidBy: string;
  amount: number;
  splits: Split;
  description: string;
  createdAt: Date;
};
export type Split =
  | { type: "equal"; users: string[] }
  | { type: "exact"; users: string[]; amounts: number[] }
  | { type: "percent"; users: string[]; percents: number[] };
