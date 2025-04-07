import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Users, Wallet } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { database } from '@/lib/database';
import { formatCurrency } from '@/lib/utils';

export default function ReportsScreen() {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [netBalance, setNetBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Toplam müşteri sayısını getir
      const customers = await database.customers.getAll();
      setTotalCustomers(customers.length);
      
      // Tüm işlemleri getir ve net bakiyeyi hesapla
      const transactions = await database.transactions.getAll();
      
      // Net bakiye = borç işlemleri (debit) toplamı - tahsilat işlemleri (credit) toplamı
      const balance = transactions.reduce((total, transaction) => {
        return transaction.type === 'debit' 
          ? total + transaction.amount 
          : total - transaction.amount;
      }, 0);
      
      setNetBalance(balance);
    } catch (error) {
      console.error('Rapor verilerini yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Raporlar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
              <Users size={24} color="#3b82f6" />
            </View>
            <Text style={styles.statLabel}>Toplam Müşteri</Text>
            <Text style={styles.statValue}>
              {loading ? 'Yükleniyor...' : totalCustomers}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#f3f4f6' }]}>
              <Wallet size={24} color="#111827" />
            </View>
            <Text style={styles.statLabel}>Net Bakiye</Text>
            <Text style={[
              styles.statValue,
              netBalance >= 0 ? styles.positiveBalance : styles.negativeBalance
            ]}>
              {loading ? 'Yükleniyor...' : formatCurrency(netBalance)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
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
  content: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#111827',
  },
  positiveBalance: {
    color: '#059669', // Yeşil
  },
  negativeBalance: {
    color: '#dc2626', // Kırmızı
  }
});