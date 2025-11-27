export interface Account {
  id: string;
  accountNumber: string;
  accountHolder: string;
  accountType: "CHECKING" | "SAVINGS";
  balance: number;
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

