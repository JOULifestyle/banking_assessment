/**
 * AccountList Component
 *
 * TECHNICAL ASSESSMENT NOTES:
 * This is a basic implementation with intentional areas for improvement:
 * - Basic error handling
 * - Simple loading state
 * - No skeleton loading
 * - No retry mechanism
 * - No pagination
 * - No sorting/filtering
 * - No animations
 * - No accessibility features
 * - No tests
 *
 * Candidates should consider:
 * - Component structure
 * - Error boundary implementation
 * - Loading states and animations
 * - User feedback
 * - Performance optimization
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Testing strategy
 */

import { useState, useEffect } from "react";
import { Account, TransactionResponse } from "../types";
import { getAccounts, getAccount, createTransaction, getTransactions } from "../api";
import styles from "./AccountList.module.css";

export function AccountList() {
  // Basic state management - Consider using more robust state management for larger applications
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse | null>(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "DEPOSIT" as "DEPOSIT" | "WITHDRAWAL" | "TRANSFER",
    amount: "",
    description: ""
  });
  const [formErrors, setFormErrors] = useState({
    amount: "",
    description: ""
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Data fetching - Consider implementing retry logic, caching, and better error handling
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAccounts();
        setAccounts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleViewTransactions = async (account: Account, page: number = 1) => {
    setSelectedAccount(account);
    setTransactionLoading(true);
    setTransactionError(null);
    try {
      const txData = await getTransactions(account.id, page);
      setTransactions(txData);
    } catch (err) {
      setTransactionError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setTransactionLoading(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (selectedAccount) {
      await handleViewTransactions(selectedAccount, newPage);
    }
  };

  const getFilteredAndSortedTransactions = () => {
    if (!transactions) return [];

    let filtered = transactions.transactions;

    // Apply type filter
    if (typeFilter !== "ALL") {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "date") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "amount") {
        comparison = a.amount - b.amount;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  };

  const handleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const validateAmount = (value: string): string => {
    if (!value.trim()) return "Amount is required";
    const num = parseFloat(value);
    if (isNaN(num)) return "Please enter a valid number";
    if (num <= 0) return "Amount must be greater than 0";
    if (num > 1000000) return "Amount cannot exceed $1,000,000";
    return "";
  };

  const validateDescription = (value: string): string => {
    if (!value.trim()) return "Description is required";
    if (value.trim().length < 3) return "Description must be at least 3 characters";
    if (value.trim().length > 100) return "Description cannot exceed 100 characters";
    return "";
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Real-time validation
    if (field === "amount") {
      setFormErrors(prev => ({ ...prev, amount: validateAmount(value) }));
    } else if (field === "description") {
      setFormErrors(prev => ({ ...prev, description: validateDescription(value) }));
    }
  };

  const isFormValid = (): boolean => {
    return !formErrors.amount && !formErrors.description &&
           formData.amount.trim() !== "" &&
           formData.description.trim() !== "";
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    setFormError(null);
    setSubmitting(true);

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid positive amount");
      }

      await createTransaction(selectedAccount.id, formData.type, amount, formData.description);

      // Refresh account and transactions
      const updatedAccount = await getAccount(selectedAccount.id);
      setAccounts(prev => prev.map(acc => acc.id === selectedAccount.id ? updatedAccount : acc));
      setSelectedAccount(updatedAccount);

      // Refresh transactions (will show page 1 by default)
      const txData = await getTransactions(selectedAccount.id, 1);
      setTransactions(txData);

      // Show success message
      setSuccessMessage(`Successfully created ${formData.type.toLowerCase()} transaction of $${amount.toFixed(2)}`);

      // Reset form
      setFormData({ type: "DEPOSIT", amount: "", description: "" });
      setFormErrors({ amount: "", description: "" });
      setFormError(null);
      setShowTransactionForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create transaction");
    } finally {
      setSubmitting(false);
    }
  };

  // Basic loading and error states - Consider implementing skeleton loading and error boundaries
  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner}></div>
      <span className={styles.loadingText}>Loading accounts...</span>
    </div>
  );
  if (error) return <div>Error: {error}</div>;

  // Basic render logic - Consider implementing:
  // - Sorting and filtering
  // - Pagination
  // - Search functionality
  // - More interactive features
  // - Accessibility improvements
  return (
    <div className={styles.container}>
      <h2>Accounts</h2>
      <div className={styles.grid}>
        {accounts.map((account) => (
          <div key={account.id} className={styles.card}>
            <h3>{account.accountHolder}</h3>
            <p>Account Number: {account.accountNumber}</p>
            <p>Type: {account.accountType}</p>
            <p>Balance: ${account.balance.toFixed(2)}</p>
            <button onClick={() => handleViewTransactions(account)}>View Transactions</button>
          </div>
        ))}
      </div>

      {selectedAccount && (
        <div className={styles.transactionSection}>
          <h3>Transactions for {selectedAccount.accountHolder}</h3>

          {successMessage && (
            <div className={styles.successMessage}>
              ✅ {successMessage}
            </div>
          )}

          <button onClick={() => setShowTransactionForm(!showTransactionForm)}>
            {showTransactionForm ? "Cancel" : "New Transaction"}
          </button>

          {showTransactionForm && (
            <form onSubmit={handleCreateTransaction} className={styles.transactionForm}>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                required
              >
                <option value="DEPOSIT">Deposit</option>
                <option value="WITHDRAWAL">Withdrawal</option>
                <option value="TRANSFER">Transfer</option>
              </select>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) => handleFormChange("amount", e.target.value)}
                  step="0.01"
                  min="0.01"
                  className={formErrors.amount ? styles.inputError : ""}
                  required
                />
                {formErrors.amount && <span className={styles.fieldError}>{formErrors.amount}</span>}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  className={formErrors.description ? styles.inputError : ""}
                  required
                />
                {formErrors.description && <span className={styles.fieldError}>{formErrors.description}</span>}
              </div>

              <button type="submit" disabled={submitting || !isFormValid()}>
                {submitting ? "Creating..." : "Create Transaction"}
              </button>
              {formError && <p className={styles.error}>{formError}</p>}
            </form>
          )}

          {transactionLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <span className={styles.loadingText}>Loading transactions...</span>
            </div>
          ) : transactionError ? (
            <div>Error: {transactionError}</div>
          ) : transactions ? (
            <div className={styles.transactionTable}>
              <div className={styles.filters}>
                <div className={styles.filterGroup}>
                  <label>Filter by Type:</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="ALL">All Types</option>
                    <option value="DEPOSIT">Deposits</option>
                    <option value="WITHDRAWAL">Withdrawals</option>
                    <option value="TRANSFER">Transfers</option>
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <label>Sort by:</label>
                  <button
                    className={`${styles.sortButton} ${sortBy === 'date' ? styles.active : ''}`}
                    onClick={() => handleSort('date')}
                  >
                    Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </button>
                  <button
                    className={`${styles.sortButton} ${sortBy === 'amount' ? styles.active : ''}`}
                    onClick={() => handleSort('amount')}
                  >
                    Amount {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </button>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredAndSortedTransactions().map((tx) => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td>{tx.type}</td>
                      <td>{tx.description}</td>
                      <td>${tx.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.pagination}>
                <button
                  disabled={transactions.page <= 1}
                  onClick={() => handlePageChange(transactions.page - 1)}
                >
                  Previous
                </button>
                <span>Page {transactions.page} of {Math.ceil(transactions.total / transactions.limit)}</span>
                <button
                  disabled={transactions.page >= Math.ceil(transactions.total / transactions.limit)}
                  onClick={() => handlePageChange(transactions.page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
