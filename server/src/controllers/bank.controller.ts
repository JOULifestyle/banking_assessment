import { Request, Response } from "express";
import * as transactionService from "../services/bank.service";

export async function createTransaction(req: Request, res: Response) {
    console.log("createTransaction called with params:", req.params, "body:", req.body);
    try {
        const accountId = req.params.id;
        const {type, amount, description} = req.body;
        console.log("Extracted:", {accountId, type, amount, description});

        // Validation
        if (!accountId || typeof accountId !== 'string') {
            return res.status(400).json({message: "Valid account ID is required"});
        }
        if (!type || !['DEPOSIT', 'WITHDRAWAL', 'TRANSFER'].includes(type)) {
            return res.status(400).json({message: "Valid type (DEPOSIT, WITHDRAWAL, TRANSFER) is required"});
        }
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({message: "Valid positive amount is required"});
        }
        if (!description || typeof description !== 'string' || description.trim().length === 0) {
            return res.status(400).json({message: "Description is required"});
        }

        const tx = await transactionService.createTransaction(accountId, type, amount, description.trim());
        console.log("Transaction created:", tx);
        res.status(201).json(tx);
    } catch (e: any) {
        console.log("Error in createTransaction:", e.message);
        res.status(400).json({error: e.message});
    }
}

export async function getTransactions(req: Request, res: Response) {
    console.log("getTransactions called with params:", req.params, "query:", req.query);
    try {
        const accountId = req.params.id;
        console.log("accountId from params:", accountId);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({message: "Invalid page or limit"});
        }

        const txs = await transactionService.getTransactions(accountId, page, limit);
        console.log("Transactions retrieved:", txs);
        res.status(200).json(txs);
    } catch (e: any) {
        console.log("Error in getTransactions:", e.message);
        res.status(400).json({error: e.message});
    }
}

export async function getAccounts(req: Request, res: Response) {
    console.log("getAccounts called");
    try {
        const accounts = await transactionService.getAccounts();
        console.log("Accounts retrieved:", accounts);
        res.status(200).json(accounts);
    } catch (e: any) {
        console.log("Error in getAccounts:", e.message);
        res.status(500).json({error: e.message});
    }
}

export async function getAccount(req: Request, res: Response) {
    console.log("getAccount called with params:", req.params);
    try {
        const accountId = req.params.id;
        const account = await transactionService.getAccount(accountId);
        console.log("Account retrieved:", account);
        res.status(200).json(account);
    } catch (e: any) {
        console.log("Error in getAccount:", e.message);
        res.status(400).json({error: e.message});
    }
}
