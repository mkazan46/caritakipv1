import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { UserPlus, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { database } from '@/lib/database';
import CustomerSwipeableRow from '@/components/CustomerSwipeableRow';
import CustomerModal from '@/components/CustomerModal';

// Customer tipini tanımlayalım
interface Customer {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  address?: string;
}

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    try {
      // SQLite ile müşterileri getir
      const data = await database.customers.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      Alert.alert('Hata', 'Müşteriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalVisible(true);
  };

  const handleDelete = (customer: Customer) => {
    if (!customer.id) {
      Alert.alert('Hata', 'Geçersiz müşteri ID');
      return;
    }

    const customerId = customer.id;

    console.log("Silme işlemi başlatılıyor: Müşteri ID:", customerId);

    // Birinci onay iletişim kutusu
    Alert.alert(
      'Müşteriyi Sil',
      `${customer.name} isimli müşteriyi silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => ikinciBildirim(customer, customerId)
        }
      ],
      { cancelable: false }
    );
  };

  // İkinci bildirim ve silme işlemi için ayrı fonksiyon
  const ikinciBildirim = (customer: Customer, customerId: number) => {
    console.log("İkinci bildirim gösteriliyor");
    
    Alert.alert(
      'DİKKAT!',
      `${customer.name} isimli müşteriye ait TÜM İŞLEMLER de silinecektir. Devam etmek istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => musteriSil(customer, customerId)
        }
      ],
      { cancelable: false }
    );
  };

  // Asıl silme işlemini yapan fonksiyon
  const musteriSil = async (customer: Customer, customerId: number) => {
    console.log("Müşteri silme işlemi başlatılıyor");
    
    try {
      setLoading(true);
      
      // Önce müşteriye ait tüm işlemleri sil
      console.log("İşlemler siliniyor");
      await database.transactions.removeByCustomerId(customerId);
      
      // Sonra müşteriyi sil
      console.log("Müşteri siliniyor");
      const success = await database.customers.remove(customerId);
      
      if (!success) {
        throw new Error('Müşteri silinirken hata oluştu');
      }
      
      console.log("Silme işlemi başarılı");
      
      // Başarılı silme mesajı göster
      Alert.alert(
        'Başarılı',
        `${customer.name} ve ilişkili tüm işlemler başarıyla silindi.`
      );
      
      // Müşteri listesini yenile
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer and transactions:', error);
      Alert.alert('Hata', 'Müşteri ve işlemler silinirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setModalVisible(true);
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => {
    // Müşteri detaylarını hazırla ve en az bir tane boş değilse göster
    const hasDetails = item.phone || item.email || item.address;
    
    const customerDetails = hasDetails ? (
      <View style={styles.detailsContainer}>
        {item.phone ? <Text style={styles.customerDetail}>{item.phone}</Text> : null}
        {item.email ? <Text style={styles.customerDetail}>{item.email}</Text> : null}
        {item.address ? <Text style={styles.customerDetail}>{item.address}</Text> : null}
      </View>
    ) : (
      // Detay yoksa sabit yükseklik sağlamak için bir boş alan ekle
      <View style={styles.detailsContainer}>
        <Text style={[styles.customerDetail, styles.emptyDetail]}>Detay bulunmuyor</Text>
      </View>
    );

    return (
      <View style={styles.customerItemContainer}>
        <View style={styles.customerNameHeader}>
          <Text style={styles.customerName}>{item.name}</Text>
        </View>
        <CustomerSwipeableRow
          onEdit={() => handleEdit(item)}
          onDelete={() => handleDelete(item)}
        >
          <View style={styles.customerCard}>
            {customerDetails}
          </View>
        </CustomerSwipeableRow>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Müşteriler</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddCustomer}>
          <UserPlus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6b7280" />
        <TouchableOpacity style={styles.searchInput}>
          <Text style={styles.searchPlaceholder}>Müşteri ara...</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={customers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.id?.toString() || ''}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchCustomers}
      />

      <CustomerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        customer={selectedCustomer}
        onSuccess={fetchCustomers}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },
  searchPlaceholder: {
    color: '#6b7280',
    fontFamily: 'Inter_400Regular',
  },
  listContainer: {
    padding: 16,
  },
  customerItemContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  customerNameHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  customerCard: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  detailsContainer: {
    minHeight: 60, // Tüm kartlar için sabit minimum yükseklik
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#111827',
    fontWeight: '600',
  },
  customerDetail: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  emptyDetail: {
    fontStyle: 'italic',
    color: '#9ca3af',
    paddingVertical: 8,
  },
});