import { Router } from "express";
import { createGroup } from "../controllers/groupController";
import { addExpense } from "../controllers/expenseController";

const router = Router();

router.post("/", createGroup);
router.post("/:groupId/expenses", addExpense);

export default router;
