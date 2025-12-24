import { Request, Response } from "express";
import { users, groups } from "../models/db";
import { randomUUID } from "crypto";

export function createGroup(req: Request, res: Response) {
  const { name, members } = req.body;
  if (!name || !Array.isArray(members) || members.length === 0)
    return res.status(400).json({ error: "Name and members required" });
  for (const uid of members) if (!users[uid]) return res.status(400).json({ error: `User ${uid} not found` });
  const id = randomUUID();
  groups[id] = { id, name, members };
  res.status(201).json(groups[id]);
}
