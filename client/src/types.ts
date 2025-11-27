export interface Account {
  id: string;
  accountNumber: string;
  accountType: "CHECKING" | "SAVINGS";
  balance: number;
  accountHolder: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  amount: number;
  description: string;
  createdAt: string;
}

export interface TransactionResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}
