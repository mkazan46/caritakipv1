import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { database } from '@/lib/database';
import { formatCurrency } from '@/lib/utils';

interface Customer {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface Transaction {
  id?: number;
  customer_id: number;
  amount: number;
  type: 'debit' | 'credit';
  description?: string;
  date?: string;
  customer_name?: string;
}

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  onSuccess: () => void;
}

export default function TransactionModal({ visible, onClose, transaction = null, onSuccess }: TransactionModalProps) {
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    // Tüm müşterileri getir
    const loadCustomers = async () => {
      try {
        const data = await database.customers.getAll();
        setCustomers(data);
      } catch (error) {
        console.error('Müşterileri yükleme hatası:', error);
      }
    };

    loadCustomers();
  }, []);

  useEffect(() => {
    if (transaction) {
      setCustomerId(transaction.customer_id);
      // İlgili müşteri adını bul
      const customer = customers.find(c => c.id === transaction.customer_id);
      setSelectedCustomerName(customer?.name || 'Müşteri bulunamadı');
      setAmount(transaction.amount.toString());
      setType(transaction.type);
      setDescription(transaction.description || '');
    } else {
      setCustomerId(undefined);
      setSelectedCustomerName('');
      setAmount('');
      setType('debit');
      setDescription('');
    }
  }, [transaction, customers]);

  const handleSubmit = async () => {
    if (!customerId) {
      setError('Lütfen bir müşteri seçin');
      return;
    }

    if (!amount || amount.trim() === '') {
      setError('Geçerli bir tutar giriniz');
      return;
    }

    // Türkçe formatında sayıyı parseFloat için hazırla (1.000,50 -> 1000.50)
    const numericAmount = parseFloat(
      amount.replace(/\./g, '').replace(',', '.')
    );

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Geçerli bir tutar giriniz');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const transactionData: Transaction = {
        customer_id: customerId,
        amount: numericAmount,
        type,
        description
      };

      if (transaction && transaction.id) {
        // Var olan işlemi güncelle
        // Not: Şu anda database API'miz işlem güncelleme desteklemiyor
        // Bu işlevi ekleyebilirsiniz veya mevcut işlemi silip yenisini ekleyebilirsiniz
        Alert.alert('Bilgi', 'İşlem güncelleme şu anda desteklenmiyor.');
      } else {
        // Yeni işlem ekle
        const result = await database.transactions.add(transactionData);
        console.log("İşlem ekleme sonucu:", result);
      }

      // Önce modalı kapat
      onClose();
      // Kısa bir gecikme ile listenin yeniden yüklenmesini sağla
      setTimeout(() => {
        onSuccess();
      }, 300);
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('İşlem kaydetme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setCustomerId(customer.id);
    setSelectedCustomerName(customer.name);
    setShowCustomerSelect(false);
  };

  const handleSelectType = (selectedType: 'debit' | 'credit') => {
    setType(selectedType);
    setShowTypeSelect(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {transaction ? 'İşlemi Düzenle' : 'Yeni İşlem'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Müşteri Seçimi */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Müşteri</Text>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setShowCustomerSelect(!showCustomerSelect)}
              >
                <Text style={styles.selectButtonText}>
                  {selectedCustomerName || 'Müşteri seçin...'}
                </Text>
              </TouchableOpacity>
              
              {showCustomerSelect && (
                <View style={styles.selectOptions}>
                  {customers.map(customer => (
                    <TouchableOpacity
                      key={customer.id}
                      style={styles.selectOption}
                      onPress={() => handleSelectCustomer(customer)}
                    >
                      <Text style={styles.optionText}>{customer.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* İşlem Tipi Seçimi */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>İşlem Tipi</Text>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setShowTypeSelect(!showTypeSelect)}
              >
                <Text style={styles.selectButtonText}>
                  {type === 'debit' ? 'Borç (Alacak Ekle)' : 'Tahsilat (Alacak Azalt)'}
                </Text>
              </TouchableOpacity>
              
              {showTypeSelect && (
                <View style={styles.selectOptions}>
                  <TouchableOpacity
                    style={styles.selectOption}
                    onPress={() => handleSelectType('debit')}
                  >
                    <Text style={styles.optionText}>Borç (Alacak Ekle)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.selectOption}
                    onPress={() => handleSelectType('credit')}
                  >
                    <Text style={styles.optionText}>Tahsilat (Alacak Azalt)</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tutar (₺)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={(text) => {
                  // Sadece sayılar ve virgül kabul edilecek
                  const cleanedText = text.replace(/[^0-9,.]/g, '');
                  // Virgülü noktaya çevirme (parseFloat için)
                  setAmount(cleanedText);
                }}
                placeholder="0,00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="İşlemle ilgili not"
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Kaydediliyor...' : transaction ? 'Güncelle' : 'Kaydet'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#374151',
    marginBottom: 4,
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  selectButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#111827',
  },
  selectOptions: {
    borderWidth: 1,
    borderColor: '#d1d5db', 
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#ffffff',
    maxHeight: 200,
  },
  selectOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
}); 