// In-memory DB
import { User, Group, Expense } from "./types";

export const users: Record<string, User> = {};
export const groups: Record<string, Group> = {};
export const expenses: Record<string, Expense> = {};
