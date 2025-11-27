import { Router, RequestHandler } from "express";
import { createTransaction, getTransactions, getAccount, getAccounts } from "../controllers/bank.controller";

const router = Router();

// Account routes
router.get("/accounts", getAccounts as RequestHandler);
router.get("/accounts/:id", getAccount as RequestHandler);

// Transaction routes
router.post("/accounts/:id/transactions", createTransaction as RequestHandler);
router.get("/accounts/:id/transactions", getTransactions as RequestHandler);

export default router;