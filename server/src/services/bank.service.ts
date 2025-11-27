import { db } from "../db";
import { Transaction, Account } from "../types";

export async function createTransaction(accountId: string, type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER", amount: number, description: string): Promise<Transaction> {
  console.log("createTransaction service called with:", { accountId, type, amount, description });

  return new Promise((resolve, reject) => {
    // First, get the account to check balance
    db.get("SELECT * FROM accounts WHERE id = ?", [accountId], (err, account: Account) => {
      if (err) {
        console.log("Error getting account:", err);
        reject(new Error("Database error"));
        return;
      }
      if (!account) {
        console.log("Account not found");
        reject(new Error("Account not found"));
        return;
      }

      // Validate transaction
      if (type === "WITHDRAWAL" || type === "TRANSFER") {
        if (account.balance < amount) {
          console.log("Insufficient funds");
          reject(new Error("Insufficient funds"));
          return;
        }
      }

      // Calculate new balance
      let newBalance = account.balance;
      if (type === "DEPOSIT") {
        newBalance += amount;
      } else if (type === "WITHDRAWAL" || type === "TRANSFER") {
        newBalance -= amount;
      }

      // Update account balance
      db.run("UPDATE accounts SET balance = ? WHERE id = ?", [newBalance, accountId], (err) => {
        if (err) {
          console.log("Error updating balance:", err);
          reject(new Error("Database error"));
          return;
        }

        // Create transaction
        const transactionId = Date.now().toString();
        const createdAt = new Date().toISOString();
        const transaction: Transaction = {
          id: transactionId,
          accountId,
          type,
          amount,
          description,
          createdAt,
        };

        const insertQuery = `
          INSERT INTO transactions (id, accountId, type, amount, description, createdAt)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(insertQuery, [transactionId, accountId, type, amount, description, createdAt], (err) => {
          if (err) {
            console.log("Error inserting transaction:", err);
            reject(new Error("Database error"));
          } else {
            console.log("Transaction created:", transaction);
            resolve(transaction);
          }
        });
      });
    });
  });
}

export async function getTransactions(accountId: string, page: number = 1, limit: number = 10): Promise<{ transactions: Transaction[], total: number, page: number, limit: number }> {
  console.log("getTransactions service called with:", { accountId, page, limit });

  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    const countQuery = "SELECT COUNT(*) as total FROM transactions WHERE accountId = ?";
    const dataQuery = "SELECT * FROM transactions WHERE accountId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?";

    db.get(countQuery, [accountId], (err, countRow: { total: number }) => {
      if (err) {
        console.log("Error getting transaction count:", err);
        reject(new Error("Database error"));
        return;
      }

      db.all(dataQuery, [accountId, limit, offset], (err, rows: Transaction[]) => {
        if (err) {
          console.log("Error getting transactions:", err);
          reject(new Error("Database error"));
        } else {
          console.log("Transactions retrieved:", rows.length, "total:", countRow.total);
          resolve({
            transactions: rows,
            total: countRow.total,
            page,
            limit
          });
        }
      });
    });
  });
}

export async function getAccounts(): Promise<Account[]> {
  console.log("getAccounts service called");

  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM accounts", (err, rows: Account[]) => {
      if (err) {
        console.log("Error getting accounts:", err);
        reject(new Error("Database error"));
      } else {
        console.log("Accounts retrieved:", rows);
        resolve(rows);
      }
    });
  });
}

export async function getAccount(accountId: string): Promise<Account> {
  console.log("getAccount service called with:", accountId);

  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM accounts WHERE id = ?", [accountId], (err, row: Account) => {
      if (err) {
        console.log("Error getting account:", err);
        reject(new Error("Database error"));
      } else if (!row) {
        console.log("Account not found");
        reject(new Error("Account not found"));
      } else {
        console.log("Account retrieved:", row);
        resolve(row);
      }
    });
  });
}