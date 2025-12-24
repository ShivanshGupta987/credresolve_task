import { Request, Response } from "express";
import { users } from "../models/db";
import { randomUUID } from "crypto";

export function createUser(req: Request, res: Response) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const id = randomUUID();
  users[id] = { id, name };
  res.status(201).json(users[id]);
}

export function getUserBalances(req: Request, res: Response) {
  const { userId } = req.params;
  if (!users[userId]) return res.status(404).json({ error: "User not found" });
  // Balance calculation will be handled in expenseController for clarity
  res.status(501).json({ error: "Not implemented here" });
}
