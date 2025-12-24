import { Request, Response } from "express";
import { users, groups, expenses } from "../models/db";
import { randomUUID } from "crypto";
import { Expense, Split } from "../models/types";

// Add expense
export function addExpense(req: Request, res: Response) {
  const { groupId } = req.params;
  const { paidBy, amount, splits, description } = req.body;
  if (!groups[groupId]) return res.status(404).json({ error: "Group not found" });
  if (!users[paidBy]) return res.status(400).json({ error: "Payer not found" });
  if (typeof amount !== "number" || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
  if (!splits || typeof splits !== "object") return res.status(400).json({ error: "Splits required" });

  // Validate splits
  let total = 0;
  let involved: string[] = [];
  if (splits.type === "equal") {
    involved = splits.users;
    if (!Array.isArray(involved) || involved.length === 0) return res.status(400).json({ error: "Users required for split" });
    total = amount;
  } else if (splits.type === "exact") {
    involved = splits.users;
    if (!Array.isArray(involved) || involved.length === 0 || !Array.isArray(splits.amounts)) return res.status(400).json({ error: "Invalid exact split" });
    if (involved.length !== splits.amounts.length) return res.status(400).json({ error: "Mismatch in users and amounts" });
    total = splits.amounts.reduce((a: number, b: number) => a + b, 0);
    if (Math.abs(total - amount) > 0.01) return res.status(400).json({ error: "Amounts do not sum to total" });
  } else if (splits.type === "percent") {
    involved = splits.users;
    if (!Array.isArray(involved) || involved.length === 0 || !Array.isArray(splits.percents)) return res.status(400).json({ error: "Invalid percent split" });
    if (involved.length !== splits.percents.length) return res.status(400).json({ error: "Mismatch in users and percents" });
    const percentSum = splits.percents.reduce((a: number, b: number) => a + b, 0);
    if (Math.abs(percentSum - 100) > 0.01) return res.status(400).json({ error: "Percents must sum to 100" });
    total = amount;
  } else {
    return res.status(400).json({ error: "Invalid split type" });
  }
  // Validate users
  for (const uid of involved) if (!users[uid]) return res.status(400).json({ error: `User ${uid} not found` });

  const id = randomUUID();
  expenses[id] = {
    id,
    groupId,
    paidBy,
    amount,
    splits,
    description: description || "",
    createdAt: new Date(),
  };
  res.status(201).json(expenses[id]);
}

// Get balances for a user (simplified)
export function getUserBalances(req: Request, res: Response) {
  const { userId } = req.params;
  if (!users[userId]) return res.status(404).json({ error: "User not found" });
  // Calculate balances
  const balanceMap: Record<string, number> = {};
  for (const eid in expenses) {
    const exp = expenses[eid];
    let involved: string[] = [];
    let shares: number[] = [];
    if (exp.splits.type === "equal") {
      involved = exp.splits.users;
      shares = Array(involved.length).fill(exp.amount / involved.length);
    } else if (exp.splits.type === "exact") {
      involved = exp.splits.users;
      shares = exp.splits.amounts;
    } else if (exp.splits.type === "percent") {
      involved = exp.splits.users;
      shares = exp.splits.percents.map((p: number) => (exp.amount * p) / 100);
    }
    for (let i = 0; i < involved.length; i++) {
      const uid = involved[i];
      if (uid === exp.paidBy) continue; // payer doesn't owe themselves
      if (uid === userId) {
        // user owes payer
        balanceMap[exp.paidBy] = (balanceMap[exp.paidBy] || 0) - shares[i];
      } else if (exp.paidBy === userId) {
        // others owe user
        balanceMap[uid] = (balanceMap[uid] || 0) + shares[i];
      }
    }
  }
  // Simplify: only show non-zero balances
  const balances = Object.entries(balanceMap)
    .filter(([_, v]) => Math.abs(v) > 0.01)
    .map(([uid, amount]) => ({ userId: uid, amount: Math.round(amount * 100) / 100 }));
  res.json({ userId, balances });
}

// Settle up (user pays another user)
export function settleUp(req: Request, res: Response) {
  const { userId } = req.params;
  const { to, amount } = req.body;
  if (!users[userId] || !users[to]) return res.status(404).json({ error: "User not found" });
  if (typeof amount !== "number" || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
  // Add a negative expense to represent settlement
  const id = randomUUID();
  expenses[id] = {
    id,
    groupId: "settlement",
    paidBy: userId,
    amount,
    splits: { type: "exact", users: [userId, to], amounts: [0, amount] },
    description: `Settlement: ${userId} paid ${to}`,
    createdAt: new Date(),
  };
  res.status(201).json({ message: "Settled", expense: expenses[id] });
}
