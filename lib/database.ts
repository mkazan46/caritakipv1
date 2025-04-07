import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

interface Customer {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at?: string;
}

interface Transaction {
  id?: number;
  customer_id: number;
  amount: number;
  type: 'debit' | 'credit'; // borç veya alacak
  description?: string;
  date?: string;
  customer_name?: string;
}

// Platform kontrolü yapalım
const isWeb = Platform.OS === 'web';

// Web mock veritabanı
const mockDb = {
  transaction: (callback: Function) => {
    callback({
      executeSql: (query: string, params: any[], success: Function) => {
        success(null, { rows: { _array: [] }, insertId: Math.floor(Math.random() * 1000), rowsAffected: 1 });
      }
    });
  }
};

// SQLite veritabanı oluştur
const db = isWeb ? mockDb : SQLite.openDatabase('cariTakip.db');

// Veritabanı tabloları oluştur
const initDatabase = () => {
  if (isWeb) {
    console.log('Web platformunda SQLite kullanılamaz, mock veritabanı kullanılıyor.');
    return;
  }
  
  // Müşteriler tablosu
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );
  });

  // Borçlar/Alacaklar tablosu
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id)
      );`
    );
  });

  console.log('Veritabanı tabloları başarıyla oluşturuldu');
};

// Web için mock veri
const mockCustomers: Customer[] = [
  { id: 1, name: 'Demo Müşteri 1', phone: '555-123-4567', email: 'demo1@example.com', address: 'İstanbul' },
  { id: 2, name: 'Demo Müşteri 2', phone: '555-987-6543', email: 'demo2@example.com', address: 'Ankara' }
];

const mockTransactions: Transaction[] = [
  { id: 1, customer_id: 1, amount: 100, type: 'debit', description: 'Demo borç kaydı', customer_name: 'Demo Müşteri 1' },
  { id: 2, customer_id: 1, amount: 50, type: 'credit', description: 'Demo alacak kaydı', customer_name: 'Demo Müşteri 1' }
];

// Veritabanını başlat
initDatabase();

// SQLite ile etkileşim için yardımcı fonksiyonlar
export const database = {
  // Müşteriler
  customers: {
    // Tüm müşterileri getir
    getAll: (): Promise<Customer[]> => {
      if (isWeb) {
        return Promise.resolve(mockCustomers);
      }
      
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM customers ORDER BY name',
            [],
            (_, { rows }) => {
              resolve(rows._array as Customer[]);
            },
            (_, error) => {
              console.error('Müşterileri getirme hatası:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    },
    
    // Müşteri ekle
    add: (customer: Customer): Promise<Customer> => {
      if (isWeb) {
        const newCustomer = { ...customer, id: Math.floor(Math.random() * 1000) };
        mockCustomers.push(newCustomer);
        return Promise.resolve(newCustomer);
      }
      
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)',
            [customer.name, customer.phone || '', customer.email || '', customer.address || ''],
            (_, { insertId }) => {
              resolve({ ...customer, id: insertId });
            },
            (_, error) => {
              console.error('Müşteri ekleme hatası:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    },
    
    // Müşteri detaylarını getir
    getById: (id: number): Promise<Customer | null> => {
      if (isWeb) {
        const customer = mockCustomers.find(c => c.id === id);
        return Promise.resolve(customer || null);
      }
      
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM customers WHERE id = ?',
            [id],
            (_, { rows }) => {
              if (rows.length > 0) {
                resolve(rows._array[0] as Customer);
              } else {
                resolve(null);
              }
            },
            (_, error) => {
              console.error('Müşteri detayı getirme hatası:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    },
    
    // Müşteri güncelle
    update: (id: number, updates: Partial<Customer>): Promise<boolean> => {
      if (isWeb) {
        const index = mockCustomers.findIndex(c => c.id === id);
        if (index !== -1) {
          mockCustomers[index] = { ...mockCustomers[index], ...updates };
          return Promise.resolve(true);
        }
        return Promise.resolve(false);
      }
      
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
            [
              updates.name || '', 
              updates.phone || '', 
              updates.email || '', 
              updates.address || '', 
              id
            ],
            (_, { rowsAffected }) => {
              resolve(rowsAffected > 0);
            },
            (_, error) => {
              console.error('Müşteri güncelleme hatası:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    },
    
    // Müşteri sil
    remove: (id: number): Promise<boolean> => {
      if (isWeb) {
        const index = mockCustomers.findIndex(c => c.id === id);
        if (index !== -1) {
          mockCustomers.splice(index, 1);
          return Promise.resolve(true);
        }
        return Promise.resolve(false);
      }
      
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'DELETE FROM customers WHERE id = ?',
            [id],
            (_, { rowsAffected }) => {
              resolve(rowsAffected > 0);
            },
            (_, error) => {
              console.error('Müşteri silme hatası:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    }
  },
  
  // İşlemler
  transactions: {
    getAll: async () => {
      if (isWeb) {
        return Promise.resolve(mockTransactions);
      }
      
      return new Promise<Transaction[]>((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT t.*, c.name as customer_name FROM transactions t LEFT JOIN customers c ON t.customer_id = c.id ORDER BY t.id DESC',
            [],
            (_, { rows }) => {
              const items: Transaction[] = [];
              for (let i = 0; i < rows.length; i++) {
                items.push(rows.item(i));
              }
              resolve(items);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      });
    },
    
    // Müşteriye ait işlemleri getir
    getByCustomerId: (customerId: number): Promise<Transaction[]> => {
      if (isWeb) {
        const transactions = mockTransactions.filter(t => t.customer_id === customerId);
        return Promise.resolve(transactions);
      }
      
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM transactions WHERE customer_id = ? ORDER BY date DESC',
            [customerId],
            (_, { rows }) => {
              resolve(rows._array as Transaction[]);
            },
            (_, error) => {
              console.error('Müşteri işlemlerini getirme hatası:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    },
    
    // İşlem ekle
    add: async (transaction: Transaction) => {
      if (isWeb) {
        // Web için mock transaction ekle
        const customerName = mockCustomers.find(c => c.id === transaction.customer_id)?.name || 'Unknown';
        const newTransaction = { 
          ...transaction, 
          id: Math.floor(Math.random() * 1000),
          date: new Date().toISOString(),
          customer_name: customerName
        };
        mockTransactions.push(newTransaction);
        console.log('Web - İşlem eklendi:', newTransaction);
        return Promise.resolve(newTransaction.id);
      }
      
      return new Promise<number>((resolve, reject) => {
        const now = new Date().toISOString();
        db.transaction(tx => {
          tx.executeSql(
            'INSERT INTO transactions (customer_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?)',
            [transaction.customer_id, transaction.amount, transaction.type, transaction.description || '', now],
            (_, { insertId }) => {
              console.log('Mobile - İşlem eklendi, ID:', insertId);
              resolve(insertId);
            },
            (_, error) => {
              console.error('İşlem ekleme hatası:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    },
    
    // İşlem sil
    remove: (id: number): Promise<boolean> => {
      if (isWeb) {
        const index = mockTransactions.findIndex(t => t.id === id);
        if (index !== -1) {
          mockTransactions.splice(index, 1);
          return Promise.resolve(true);
        }
        return Promise.resolve(false);
      }
      
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'DELETE FROM transactions WHERE id = ?',
            [id],
            (_, { rowsAffected }) => {
              resolve(rowsAffected > 0);
            },
            (_, error) => {
              console.error('İşlem silme hatası:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    },
    
    // Müşteriye ait tüm işlemleri sil
    removeByCustomerId: (customerId: number): Promise<boolean> => {
      if (isWeb) {
        const initialLength = mockTransactions.length;
        mockTransactions = mockTransactions.filter(t => t.customer_id !== customerId);
        return Promise.resolve(mockTransactions.length < initialLength);
      }
      
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'DELETE FROM transactions WHERE customer_id = ?',
            [customerId],
            (_, { rowsAffected }) => {
              resolve(rowsAffected > 0);
            },
            (_, error) => {
              console.error('Müşteriye ait işlemleri silme hatası:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    }
  }
}; 