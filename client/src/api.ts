import { Account, Transaction, TransactionResponse } from "./types";

const API_URL = "http://localhost:3001/api";

export const getAccounts = async (): Promise<Account[]> => {
  const response = await fetch(`${API_URL}/accounts`);
  if (!response.ok) {
    throw new Error("Failed to fetch accounts");
  }
  return response.json();
};

export const getAccount = async (id: string): Promise<Account> => {
  const response = await fetch(`${API_URL}/accounts/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch account");
  }
  return response.json();
};

export const createTransaction = async (accountId: string, type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER", amount: number, description: string): Promise<Transaction> => {
  const response = await fetch(`${API_URL}/accounts/${accountId}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, amount, description }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || "Failed to create transaction");
  }
  return response.json();
};

export const getTransactions = async (accountId: string, page: number = 1, limit: number = 10): Promise<TransactionResponse> => {
  const response = await fetch(`${API_URL}/accounts/${accountId}/transactions?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }
  return response.json();
};
