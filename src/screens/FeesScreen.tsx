import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextStyle,
} from "react-native";
import { Card, Title, Paragraph, DataTable } from "react-native-paper";

interface CollectedFee {
  id: string;
  description: string;
  transactionDate: string;
  debit: number;
  credit: number;
  calculatedBalance: number;
}

interface PayableFee {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
}

export default function FeesScreen() {
  // Mock payable fees
  const payableFees: PayableFee[] = [
    {
      id: "1",
      description: "Course Materials Fee",
      amount: 500,
      dueDate: "2025-11-01",
    },
    {
      id: "2",
      description: "Uniform Deposit",
      amount: 200,
      dueDate: "2025-10-15",
    },
  ];

  // Mock collected fees (transactions)
  const collectedFees: CollectedFee[] = [
    {
      id: "1",
      description: "Initial Payment",
      transactionDate: "2025-09-01",
      debit: 0,
      credit: 300,
      calculatedBalance: 300,
    },
    {
      id: "2",
      description: "Uniform Deposit",
      transactionDate: "2025-09-15",
      debit: 0,
      credit: 200,
      calculatedBalance: 500,
    },
    {
      id: "3",
      description: "Course Materials Partial",
      transactionDate: "2025-10-01",
      debit: 0,
      credit: 200,
      calculatedBalance: 700,
    },
  ];

  // Calculate total payable
  const totalPayable = useMemo(() => {
    return payableFees.reduce((sum, fee) => sum + fee.amount, 0);
  }, [payableFees]);

  // Calculate total collected
  const totalCollected = useMemo(() => {
    return collectedFees.reduce((sum, fee) => sum + fee.credit - fee.debit, 0);
  }, [collectedFees]);

  // Net balance
  const netBalance = totalCollected - totalPayable;

  // Earliest due date
  const earliestDueDate = useMemo(() => {
    if (payableFees.length === 0) return null;
    return payableFees.reduce((earliest, fee) => {
      const feeDate = new Date(fee.dueDate);
      return !earliest || feeDate < earliest ? feeDate : earliest;
    }, null as Date | null);
  }, [payableFees]);

  const renderTransaction = ({ item }: { item: CollectedFee }) => (
    <DataTable.Row>
      <DataTable.Cell>
        {new Date(item.transactionDate).toLocaleDateString()}
      </DataTable.Cell>
      <DataTable.Cell>{item.description}</DataTable.Cell>
      <DataTable.Cell numeric style={item.debit > 0 ? styles.debit : undefined}>
        {item.debit > 0 ? `R${item.debit.toFixed(2)}` : "-"}
      </DataTable.Cell>
      <DataTable.Cell
        numeric
        style={item.credit > 0 ? styles.credit : undefined}
      >
        {item.credit > 0 ? `R${item.credit.toFixed(2)}` : "-"}
      </DataTable.Cell>
      <DataTable.Cell
        numeric
        style={item.calculatedBalance < 0 ? styles.negative : styles.positive}
      >
        R{item.calculatedBalance.toFixed(2)}
      </DataTable.Cell>
    </DataTable.Row>
  );

  return (
    <ScrollView style={styles.container}>
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

      {/* Statement of Account */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Statement of Account</Title>
          <Paragraph>Transaction History</Paragraph>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Date</DataTable.Title>
              <DataTable.Title>Description</DataTable.Title>
              <DataTable.Title numeric>Debit</DataTable.Title>
              <DataTable.Title numeric>Credit</DataTable.Title>
              <DataTable.Title numeric>Balance</DataTable.Title>
            </DataTable.Header>
            {collectedFees.map((fee) => (
              <DataTable.Row key={fee.id}>
                <DataTable.Cell>
                  {new Date(fee.transactionDate).toLocaleDateString()}
                </DataTable.Cell>
                <DataTable.Cell>{fee.description}</DataTable.Cell>
                <DataTable.Cell
                  numeric
                  style={fee.debit > 0 ? styles.debit : undefined}
                >
                  {fee.debit > 0 ? `R${fee.debit.toFixed(2)}` : "-"}
                </DataTable.Cell>
                <DataTable.Cell
                  numeric
                  style={fee.credit > 0 ? styles.credit : undefined}
                >
                  {fee.credit > 0 ? `R${fee.credit.toFixed(2)}` : "-"}
                </DataTable.Cell>
                <DataTable.Cell
                  numeric
                  style={
                    fee.calculatedBalance < 0
                      ? styles.negative
                      : styles.positive
                  }
                >
                  R{fee.calculatedBalance.toFixed(2)}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
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
