import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextStyle,
  RefreshControl,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  DataTable,
  ActivityIndicator,
} from "react-native-paper";
import { useAuth } from "../contexts/AuthContext";
import StudentAPI from "../services/api";

interface FeeTransaction {
  id: string;
  description: string;
  transactionDate: string;
  debit: number | null;
  credit: number | null;
  balance: string;
  calculatedBalance: string;
  runningBalance: number;
  formattedCredit?: string;
  formattedDebit?: string;
}

interface PayableFee {
  id: string;
  amount: number;
  formattedAmount: string;
  arrears: number;
  formattedArrears: string;
  isOverdue: boolean;
  description?: string;
  dueDate?: string;
}

interface FeeBalance {
  currentBalance: number;
  totalPayable: number;
  totalCollected: number;
  outstandingAmount: number;
  netOverallBalance: number;
  earliestDueDate: string | null;
  formattedOutstandingAmount: string;
  formattedNetBalance: string;
  formattedTotalCollected: string;
  formattedTotalPayable: string;
}

export default function FeesScreen() {
  const { user } = useAuth();
  const [payableFees, setPayableFees] = useState<PayableFee[]>([]);
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>([]);
  const [feeBalance, setFeeBalance] = useState<FeeBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeesData();
  }, [user?.id]);

  const loadFeesData = async (isRefresh = false) => {
    if (!user?.id) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      console.log("📊 Fees: Loading fee data for student:", user.id);

      // Load all fee data in parallel
      const [payableFeesResponse, transactionsResponse, balanceResponse] =
        await Promise.all([
          StudentAPI.getPayableFees(user.id).catch((err) => {
            console.warn("⚠️ Failed to load payable fees:", err);
            return [];
          }),
          StudentAPI.getFeeTransactions(user.id).catch((err) => {
            console.warn("⚠️ Failed to load transactions:", err);
            return [];
          }),
          StudentAPI.getFeeBalance(user.id).catch((err) => {
            console.warn("⚠️ Failed to load balance:", err);
            return null;
          }),
        ]);

      console.log("📊 Fees: Raw API responses:");
      console.log(
        "  - Payable fees response:",
        JSON.stringify(payableFeesResponse, null, 2)
      );
      console.log(
        "  - Transactions response:",
        JSON.stringify(transactionsResponse, null, 2)
      );
      console.log(
        "  - Balance response:",
        JSON.stringify(balanceResponse, null, 2)
      );

      // Handle the new response format with success wrapper
      const processedPayableFees = (payableFeesResponse as any)?.success
        ? (payableFeesResponse as any)?.data?.payableFees || []
        : Array.isArray(payableFeesResponse)
        ? payableFeesResponse
        : [];

      const processedTransactions = (transactionsResponse as any)?.success
        ? (transactionsResponse as any)?.data?.transactions || []
        : Array.isArray(transactionsResponse)
        ? transactionsResponse
        : [];

      const processedBalance = (balanceResponse as any)?.success
        ? (balanceResponse as any)?.data || null
        : balanceResponse;

      console.log("📊 Fees: Processed data:");
      console.log("  - Payable fees count:", processedPayableFees.length);
      console.log("  - Transactions count:", processedTransactions.length);
      console.log("  - Balance data:", processedBalance);

      setPayableFees(processedPayableFees);
      setFeeTransactions(processedTransactions);
      setFeeBalance(processedBalance);
    } catch (err) {
      console.error("❌ Fees: Failed to load fee data:", err);
      setError(
        "Failed to load fee information. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadFeesData(true);
  };

  // Calculate total payable from actual API data
  const totalPayable = useMemo(() => {
    if (feeBalance?.totalPayable !== undefined) {
      return feeBalance.totalPayable;
    }
    return payableFees.reduce((sum, fee) => sum + fee.amount, 0);
  }, [payableFees, feeBalance]);

  // Calculate total collected from actual API data
  const totalCollected = useMemo(() => {
    if (feeBalance?.totalCollected !== undefined) {
      return feeBalance.totalCollected;
    }
    return feeTransactions.reduce((sum, transaction) => {
      const credit = transaction.credit || 0;
      const debit = transaction.debit || 0;
      return sum + credit - debit;
    }, 0);
  }, [feeTransactions, feeBalance]);

  // Net balance
  const netBalance = useMemo(() => {
    if (feeBalance?.netOverallBalance !== undefined) {
      return feeBalance.netOverallBalance;
    }
    return totalCollected - totalPayable;
  }, [totalCollected, totalPayable, feeBalance]);

  // Earliest due date from actual API data
  const earliestDueDate = useMemo(() => {
    if (feeBalance?.earliestDueDate) {
      return new Date(feeBalance.earliestDueDate);
    }
    // Since payable fees don't seem to have due dates in your current data, return null
    return null;
  }, [feeBalance]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading fee information...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Pull down to refresh</Text>
      </View>
    );
  }

  const renderTransaction = ({ item }: { item: FeeTransaction }) => (
    <DataTable.Row>
      <DataTable.Cell>
        {new Date(item.transactionDate).toLocaleDateString()}
      </DataTable.Cell>
      <DataTable.Cell>{item.description}</DataTable.Cell>
      <DataTable.Cell
        numeric
        style={item.debit && item.debit > 0 ? styles.debit : undefined}
      >
        {item.debit && item.debit > 0 ? `R${item.debit.toFixed(2)}` : "-"}
      </DataTable.Cell>
      <DataTable.Cell
        numeric
        style={item.credit && item.credit > 0 ? styles.credit : undefined}
      >
        {item.credit && item.credit > 0 ? `R${item.credit.toFixed(2)}` : "-"}
      </DataTable.Cell>
      <DataTable.Cell
        numeric
        style={item.runningBalance < 0 ? styles.negative : styles.positive}
      >
        R{item.runningBalance.toFixed(2)}
      </DataTable.Cell>
    </DataTable.Row>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Outstanding Amount */}
      <Card
        style={[
          styles.card,
          totalPayable > 0 ? styles.outstandingCard : styles.paidCard,
        ]}
      >
        <Card.Content>
          <Title>Outstanding Amount</Title>
          <Text
            style={[
              styles.amount,
              totalPayable > 0 ? styles.outstandingAmount : styles.paidAmount,
            ]}
          >
            R{totalPayable.toFixed(2)}
          </Text>
          {earliestDueDate && (
            <Paragraph style={styles.dueDate}>
              Due by: {earliestDueDate.toLocaleDateString()}
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Summary</Title>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Collected:</Text>
            <Text style={styles.summaryValue}>
              R{totalCollected.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Payable:</Text>
            <Text style={styles.summaryValue}>R{totalPayable.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Net Balance:</Text>
            <Text
              style={[
                styles.summaryValue,
                netBalance < 0 ? styles.negative : styles.positive,
              ]}
            >
              R{netBalance.toFixed(2)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Outstanding Payable Fees */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Outstanding Fees</Title>
          <Paragraph>
            {payableFees.length > 0 && payableFees.some((fee) => fee.amount > 0)
              ? "Fees that still need to be paid"
              : "No outstanding fees"}
          </Paragraph>
          {payableFees.length > 0 &&
          payableFees.some((fee) => fee.amount > 0) ? (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Fee ID</DataTable.Title>
                <DataTable.Title numeric>Amount</DataTable.Title>
                <DataTable.Title numeric>Arrears</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
              </DataTable.Header>
              {payableFees
                .filter((fee) => fee.amount > 0)
                .map((fee) => (
                  <DataTable.Row key={fee.id}>
                    <DataTable.Cell>{fee.id.slice(-8)}</DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={styles.outstandingAmount}>
                        R{fee.amount.toFixed(2)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text
                        style={
                          fee.arrears > 0 ? styles.negative : styles.positive
                        }
                      >
                        R{fee.arrears.toFixed(2)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text
                        style={
                          fee.isOverdue ? styles.negative : styles.positive
                        }
                      >
                        {fee.isOverdue ? "Overdue" : "Current"}
                      </Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
            </DataTable>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>All fees are up to date! 🎉</Text>
              <Text style={styles.emptySubtext}>
                You have no outstanding fee payments
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Statement of Account */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Statement of Account</Title>
          <Paragraph>Transaction History</Paragraph>
          {feeTransactions.length > 0 ? (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Date</DataTable.Title>
                <DataTable.Title>Description</DataTable.Title>
                <DataTable.Title numeric>Debit</DataTable.Title>
                <DataTable.Title numeric>Credit</DataTable.Title>
                <DataTable.Title numeric>Balance</DataTable.Title>
              </DataTable.Header>
              {feeTransactions.map((transaction) => (
                <DataTable.Row key={transaction.id}>
                  <DataTable.Cell>
                    {new Date(transaction.transactionDate).toLocaleDateString()}
                  </DataTable.Cell>
                  <DataTable.Cell>{transaction.description}</DataTable.Cell>
                  <DataTable.Cell
                    numeric
                    style={
                      transaction.debit && transaction.debit > 0
                        ? styles.debit
                        : undefined
                    }
                  >
                    {transaction.debit && transaction.debit > 0
                      ? `R${transaction.debit.toFixed(2)}`
                      : "-"}
                  </DataTable.Cell>
                  <DataTable.Cell
                    numeric
                    style={
                      transaction.credit && transaction.credit > 0
                        ? styles.credit
                        : undefined
                    }
                  >
                    {transaction.credit && transaction.credit > 0
                      ? `R${transaction.credit.toFixed(2)}`
                      : "-"}
                  </DataTable.Cell>
                  <DataTable.Cell
                    numeric
                    style={
                      transaction.runningBalance < 0
                        ? styles.negative
                        : styles.positive
                    }
                  >
                    R{transaction.runningBalance.toFixed(2)}
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions found</Text>
              <Text style={styles.emptySubtext}>
                Transactions will appear here once payments are processed
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "#ff4444",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  outstandingCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#ff4444",
  },
  paidCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#44ff44",
  },
  amount: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 8,
  },
  outstandingAmount: {
    color: "#ff4444",
  },
  paidAmount: {
    color: "#44ff44",
  },
  dueDate: {
    textAlign: "center",
    color: "#666",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  debit: {
    color: "#ff4444",
  } as TextStyle,
  credit: {
    color: "#44ff44",
  } as TextStyle,
  negative: {
    color: "#ff4444",
  } as TextStyle,
  positive: {
    color: "#44ff44",
  } as TextStyle,
});
