<?php
// Hata raporlamasını aktif et
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS başlıkları - Cross-Origin isteklere izin ver
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// OPTIONS isteği ise burada sonlandır (preflight istekleri için)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Sadece POST isteklerini kabul et
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Sadece POST istekleri kabul edilir']);
    exit;
}

// Rate limiting kontrolü
session_start();
$current_time = time();
$rate_limit_window = 60; // 60 saniye içinde
$rate_limit_max = 10;    // en fazla 10 istek

// Session'da rate limit bilgisi yoksa oluştur
if (!isset($_SESSION['rate_limit'])) {
    $_SESSION['rate_limit'] = [
        'requests' => 0,
        'window_start' => $current_time
    ];
}

// Rate limit penceresi yeniden başlatılmalı mı kontrol et
if ($current_time - $_SESSION['rate_limit']['window_start'] > $rate_limit_window) {
    $_SESSION['rate_limit'] = [
        'requests' => 0,
        'window_start' => $current_time
    ];
}

// İstek sayısını artır
$_SESSION['rate_limit']['requests']++;

// Rate limit aşıldı mı kontrol et
if ($_SESSION['rate_limit']['requests'] > $rate_limit_max) {
    http_response_code(429); // Too Many Requests
    echo json_encode([
        'error' => 'Rate limit exceeded',
        'message' => 'Çok fazla istek gönderildi. Lütfen ' . $rate_limit_window . ' saniye sonra tekrar deneyin.',
        'code' => 'rate_limited',
        'retry_after' => $_SESSION['rate_limit']['window_start'] + $rate_limit_window - $current_time
    ]);
    exit;
}

// JSON formatında gönderilen veriyi al
$data = json_decode(file_get_contents("php://input"), true);

// Veritabanı bağlantısı
$dbFile = __DIR__ . '/cariTakip.db';
$isNewDb = !file_exists($dbFile);

try {
    // SQLite bağlantısı oluşturmak için tekrar denemeler
    $max_retries = 3;
    $retry_delay = 1; // saniye
    $connected = false;
    
    for ($i = 0; $i < $max_retries; $i++) {
        try {
            $db = new SQLite3($dbFile);
            $db->busyTimeout(5000); // SQLite meşgulse 5 saniye bekle
            $connected = true;
            break;
        } catch (Exception $e) {
            if ($i < $max_retries - 1) {
                sleep($retry_delay);
                $retry_delay *= 2; // Exponential backoff
            } else {
                throw $e;
            }
        }
    }
    
    if (!$connected) {
        throw new Exception("Veritabanına bağlanılamadı");
    }
    
    // Yeni veritabanı oluşturuluyorsa tabloları oluştur
    if ($isNewDb) {
        // Müşteriler tablosu
        $db->exec('
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ');
        
        // İşlemler tablosu
        $db->exec('
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,
                amount REAL NOT NULL,
                type TEXT NOT NULL,
                description TEXT,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                payment_method TEXT,
                document_no TEXT,
                FOREIGN KEY (customer_id) REFERENCES customers (id)
            )
        ');
    } else {
        // Var olan veritabanında payment_method ve document_no sütunları yoksa ekle
        // (SQLite ALTER TABLE sınırlıdır, bu nedenle kontrol gerekir)
        $tableInfo = $db->query("PRAGMA table_info(transactions)");
        $hasPaymentMethod = false;
        $hasDocumentNo = false;
        
        while ($column = $tableInfo->fetchArray(SQLITE3_ASSOC)) {
            if ($column['name'] === 'payment_method') $hasPaymentMethod = true;
            if ($column['name'] === 'document_no') $hasDocumentNo = true;
        }
        
        if (!$hasPaymentMethod) {
            $db->exec('ALTER TABLE transactions ADD COLUMN payment_method TEXT');
        }
        
        if (!$hasDocumentNo) {
            $db->exec('ALTER TABLE transactions ADD COLUMN document_no TEXT');
        }
    }
    
    // Veri doğrulama
    if (!isset($data['customer_id']) || !isset($data['amount']) || !isset($data['type'])) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Gerekli alanlar eksik: customer_id, amount ve type zorunludur']);
        exit;
    }

    // Ek alanları kontrol et (yeni eklenecek isteğe bağlı alanlar)
    $payment_method = $data['payment_method'] ?? null;
    $document_no = $data['document_no'] ?? null;
    
    // Müşteri ID'si kontrol et
    $stmt = $db->prepare('SELECT id FROM customers WHERE id = :id');
    $stmt->bindValue(':id', $data['customer_id'], SQLITE3_INTEGER);
    $result = $stmt->execute();
    
    if (!$result->fetchArray()) {
        http_response_code(404); // Not Found
        echo json_encode(['error' => 'Belirtilen müşteri bulunamadı']);
        exit;
    }
    
    // İşlem türünü kontrol et
    if ($data['type'] !== 'debit' && $data['type'] !== 'credit') {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'İşlem türü sadece "debit" veya "credit" olabilir']);
        exit;
    }
    
    // İşlem tutarı kontrol et
    if (!is_numeric($data['amount']) || $data['amount'] <= 0) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'İşlem tutarı pozitif bir sayı olmalıdır']);
        exit;
    }
    
    // Tarih belirleme
    $date = isset($data['date']) ? $data['date'] : date('Y-m-d H:i:s');
    
    // İşlem eklemeden önce veritabanı bütünlüğünü kontrol et
    $db->exec('PRAGMA foreign_keys = ON;');
    
    // Transaction başlat
    $db->exec('BEGIN TRANSACTION;');
    
    try {
        // İşlem ekle
        $stmt = $db->prepare('
            INSERT INTO transactions (customer_id, amount, type, description, date, payment_method, document_no) 
            VALUES (:customer_id, :amount, :type, :description, :date, :payment_method, :document_no)
        ');
        
        $stmt->bindValue(':customer_id', $data['customer_id'], SQLITE3_INTEGER);
        $stmt->bindValue(':amount', $data['amount'], SQLITE3_FLOAT);
        $stmt->bindValue(':type', $data['type'], SQLITE3_TEXT);
        $stmt->bindValue(':description', $data['description'] ?? '', SQLITE3_TEXT);
        $stmt->bindValue(':date', $date, SQLITE3_TEXT);
        $stmt->bindValue(':payment_method', $payment_method, SQLITE3_TEXT);
        $stmt->bindValue(':document_no', $document_no, SQLITE3_TEXT);
        
        $result = $stmt->execute();
        
        if ($result) {
            $newId = $db->lastInsertRowID();
            
            // Eklenen işlemin detaylarını al
            $stmt = $db->prepare('
                SELECT t.*, c.name as customer_name 
                FROM transactions t 
                LEFT JOIN customers c ON t.customer_id = c.id 
                WHERE t.id = :id
            ');
            
            $stmt->bindValue(':id', $newId, SQLITE3_INTEGER);
            $result = $stmt->execute();
            $transaction = $result->fetchArray(SQLITE3_ASSOC);
            
            // Transaction'ı commit et
            $db->exec('COMMIT;');
            
            http_response_code(201); // Created
            echo json_encode([
                'success' => true,
                'message' => 'İşlem başarıyla eklendi',
                'transaction' => $transaction
            ]);
        } else {
            throw new Exception('İşlem eklenirken bir hata oluştu');
        }
    } catch (Exception $e) {
        // Hata durumunda rollback yap
        $db->exec('ROLLBACK;');
        throw $e;
    }
    
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    
    // Özel hata kodları kontrolü
    if (strpos($e->getMessage(), 'rate limit') !== false) {
        http_response_code(429); // Too Many Requests
        echo json_encode([
            'error' => 'Rate limit exceeded',
            'message' => 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
            'code' => 'rate_limited'
        ]);
    } else {
        echo json_encode([
            'error' => 'Sunucu hatası: ' . $e->getMessage(),
            'code' => 'server_error'
        ]);
    }
} finally {
    if (isset($db)) {
        $db->close();
    }
}
?>