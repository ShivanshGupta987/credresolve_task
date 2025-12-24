
import { useState } from "react";
import { createUser, createGroup, addExpense, getBalances, settleUp } from "./api";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  MenuItem,
  Alert
} from '@mui/material';
  

function App() {

  // Settle up state
  const [settleFrom, setSettleFrom] = useState("");
  const [settleTo, setSettleTo] = useState("");
  const [settleAmount, setSettleAmount] = useState("");

  const handleSettleUp = async () => {
    try {
      await settleUp(settleFrom, settleTo, Number(settleAmount));
      setMessage(`Settled up: ${settleFrom} paid ${settleTo} ₹${settleAmount}`);
    } catch (e) {
      setMessage("Failed to settle up");
    }
  };
  
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState<string>("");
  const [groupId, setGroupId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // Add expense state
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expensePaidBy, setExpensePaidBy] = useState("");
  const [expenseType, setExpenseType] = useState("equal");
  const [expenseUsers, setExpenseUsers] = useState("");
  const [expenseValues, setExpenseValues] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");

  // Balances state
  const [balanceUserId, setBalanceUserId] = useState("");
  const [balances, setBalances] = useState<{ userId: string; amount: number }[] | null>(null);
  const handleAddExpense = async () => {
    try {
      let splits: any = { type: expenseType, users: expenseUsers.split(",").map(u => u.trim()).filter(Boolean) };
      if (expenseType === "exact") {
        splits.amounts = expenseValues.split(",").map(Number);
      } else if (expenseType === "percent") {
        splits.percents = expenseValues.split(",").map(Number);
      }
      const exp = await addExpense(
        groupId!,
        expensePaidBy,
        Number(expenseAmount),
        splits,
        expenseDesc
      );
      setMessage(`Expense added: ${exp.description}`);
    } catch (e) {
      setMessage("Failed to add expense");
    }
  };

  const handleGetBalances = async () => {
    try {
      const res = await getBalances(balanceUserId);
      setBalances(res.balances);
      setMessage("");
    } catch (e) {
      setMessage("Failed to get balances");
      setBalances(null);
    }
  };

  const handleCreateUser = async () => {
    try {
      const user = await createUser(userName);
      setUserId(user.id);
      setMessage(`User created: ${user.name} (${user.id})`);
    } catch (e) {
      setMessage("Failed to create user");
    }
  };

  const handleCreateGroup = async () => {
    try {
      const members = groupMembers.split(",").map((m) => m.trim()).filter(Boolean);
      const group = await createGroup(groupName, members);
      setGroupId(group.id);
      setMessage(`Group created: ${group.name} (${group.id})`);
    } catch (e) {
      setMessage("Failed to create group");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" color="primary" gutterBottom>Expense Sharing App</Typography>
        <Stack spacing={3}>
          {/* Create User */}
          <Box>
            <Typography variant="h6">Create User</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField label="User name" value={userName} onChange={e => setUserName(e.target.value)} size="small" />
              <Button variant="contained" onClick={handleCreateUser} disabled={!userName}>Create User</Button>
            </Stack>
            {userId && <Typography variant="body2" color="text.secondary">User ID: {userId}</Typography>}
          </Box>

          {/* Create Group */}
          <Box>
            <Typography variant="h6">Create Group</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField label="Group name" value={groupName} onChange={e => setGroupName(e.target.value)} size="small" />
              <TextField label="Member user IDs (comma)" value={groupMembers} onChange={e => setGroupMembers(e.target.value)} size="small" />
              <Button variant="contained" onClick={handleCreateGroup} disabled={!groupName || !groupMembers}>Create Group</Button>
            </Stack>
            {groupId && <Typography variant="body2" color="text.secondary">Group ID: {groupId}</Typography>}
          </Box>

          {/* Add Expense */}
          <Box>
            <Typography variant="h6">Add Expense</Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField label="Amount" type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} size="small" />
                <TextField label="Paid by (user ID)" value={expensePaidBy} onChange={e => setExpensePaidBy(e.target.value)} size="small" />
                <TextField
                  select
                  label="Split type"
                  value={expenseType}
                  onChange={e => setExpenseType(e.target.value)}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="equal">Equal</MenuItem>
                  <MenuItem value="exact">Exact</MenuItem>
                  <MenuItem value="percent">Percent</MenuItem>
                </TextField>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField label="Users (comma IDs)" value={expenseUsers} onChange={e => setExpenseUsers(e.target.value)} size="small" />
                {(expenseType === "exact" || expenseType === "percent") && (
                  <TextField
                    label={expenseType === "exact" ? "Amounts (comma)" : "Percents (comma)"}
                    value={expenseValues}
                    onChange={e => setExpenseValues(e.target.value)}
                    size="small"
                  />
                )}
                <TextField label="Description" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} size="small" />
                <Button
                  variant="contained"
                  onClick={handleAddExpense}
                  disabled={!groupId || !expenseAmount || !expensePaidBy || !expenseUsers}
                >
                  Add Expense
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* View Balances */}
          <Box>
            <Typography variant="h6">View Balances</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField label="User ID" value={balanceUserId} onChange={e => setBalanceUserId(e.target.value)} size="small" />
              <Button variant="contained" onClick={handleGetBalances} disabled={!balanceUserId}>Get Balances</Button>
            </Stack>
            {balances && (
              <Paper variant="outlined" sx={{ mt: 1, p: 2 }}>
                {balances.length === 0 && <Typography>No balances</Typography>}
                <Stack spacing={1}>
                  {balances.map(b => (
                    <Typography key={b.userId} color={b.amount > 0 ? 'success.main' : 'error.main'}>
                      {b.userId}: {b.amount > 0 ? `is owed ₹${b.amount}` : `owes ₹${-b.amount}`}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            )}
          </Box>

          {/* Settle Up */}
          <Box>
            <Typography variant="h6">Settle Up</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField label="From (user ID)" value={settleFrom} onChange={e => setSettleFrom(e.target.value)} size="small" />
              <TextField label="To (user ID)" value={settleTo} onChange={e => setSettleTo(e.target.value)} size="small" />
              <TextField label="Amount" type="number" value={settleAmount} onChange={e => setSettleAmount(e.target.value)} size="small" />
              <Button variant="contained" onClick={handleSettleUp} disabled={!settleFrom || !settleTo || !settleAmount}>Settle Up</Button>
            </Stack>
          </Box>

          {message && <Alert severity="info">{message}</Alert>}
        </Stack>
      </Paper>
    </Container>
  );
}

export default App;
