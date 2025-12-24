// API utility for backend communication
const BASE_URL = "http://localhost:3000";

export async function createUser(name: string) {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function createGroup(name: string, members: string[]) {
  const res = await fetch(`${BASE_URL}/groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, members })
  });
  if (!res.ok) throw new Error("Failed to create group");
  return res.json();
}

export async function addExpense(groupId: string, paidBy: string, amount: number, splits: any, description?: string) {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paidBy, amount, splits, description })
  });
  if (!res.ok) throw new Error("Failed to add expense");
  return res.json();
}

export async function getBalances(userId: string) {
  const res = await fetch(`${BASE_URL}/users/${userId}/balances`);
  if (!res.ok) throw new Error("Failed to get balances");
  return res.json();
}

export async function settleUp(userId: string, to: string, amount: number) {
  const res = await fetch(`${BASE_URL}/users/${userId}/settle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, amount })
  });
  if (!res.ok) throw new Error("Failed to settle up");
  return res.json();
}
