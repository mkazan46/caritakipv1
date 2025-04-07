import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import TransactionModal from '@/components/TransactionModal';
import { database } from '@/lib/database';
import { formatCurrency } from '@/lib/utils';

interface Transaction {
  id?: number;
  customer_id: number;
  amount: number;
  type: 'debit' | 'credit';
  description?: string;
  date?: string;
  customer_name?: string;
}

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    calculateTotalAmount();
  }, [transactions]);

  const calculateTotalAmount = () => {
    const total = transactions.reduce((sum, transaction) => {
      // Eğer borç (debit) ise toplama ekle, alacak (credit) ise toplamdan çıkar
      return transaction.type === 'debit'
        ? sum + transaction.amount
        : sum - transaction.amount;
    }, 0);
    
    setTotalAmount(total);
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await database.transactions.getAll();
      setTransactions(data);
    } catch (error) {
      console.error('İşlemleri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setModalVisible(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const handleTransactionSuccess = async () => {
    console.log("İşlem başarılı, yeniden yükleniyor...");
    await loadTransactions();
    console.log("Yeniden yükleme tamamlandı, işlem sayısı:", transactions.length);
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity 
      style={styles.transactionCard} 
      onPress={() => handleEditTransaction(item)}
    >
      <View style={styles.transactionIcon}>
        {item.type === 'credit' ? (
          <ArrowDownLeft size={24} color="#059669" />
        ) : (
          <ArrowUpRight size={24} color="#dc2626" />
        )}
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.customerName}>{item.customer_name}</Text>
        <Text style={styles.transactionDate}>
          {item.date ? format(new Date(item.date), 'd MMMM yyyy', { locale: tr }) : 'Tarih yok'}
        </Text>
        {item.description && (
          <Text style={styles.description} numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>
      <Text
        style={[
          styles.amount,
          item.type === 'debit' ? styles.positiveAmount : styles.negativeAmount,
        ]}
      >
        {item.type === 'debit' ? '+' : '-'}{formatCurrency(item.amount).replace(' ₺', '')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>İşlemler</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTransaction}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryLabel}>Toplam Alacak:</Text>
        <Text style={[
          styles.summaryAmount,
          totalAmount >= 0 ? styles.positiveAmount : styles.negativeAmount
        ]}>
          {formatCurrency(totalAmount)}
        </Text>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Yükleniyor...' : 'Henüz işlem bulunmuyor'}
            </Text>
          </View>
        }
      />

      <TransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        transaction={selectedTransaction}
        onSuccess={handleTransactionSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 12,
  },
  listContainer: {
    padding: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  transactionIcon: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 8,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#111827',
  },
  transactionDate: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  paymentAmount: {
    color: '#059669',
  },
  debtAmount: {
    color: '#dc2626',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#111827',
  },
  summaryAmount: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  positiveAmount: {
    color: '#059669',
  },
  negativeAmount: {
    color: '#dc2626',
  },
});