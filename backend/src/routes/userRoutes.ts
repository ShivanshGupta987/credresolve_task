import { Router } from "express";
import { createUser } from "../controllers/userController";
import { getUserBalances, settleUp } from "../controllers/expenseController";

const router = Router();

// Create a new user
router.post("/", createUser);

// Get balances for a user
router.get("/:userId/balances", getUserBalances);

// Settle up between users
router.post("/:userId/settle", settleUp);

export default router;
