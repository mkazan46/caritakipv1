/**
 * Ana JavaScript Dosyası
 */

// Sekme değiştirme fonksiyonu
function showTab(tabId) {
    // Tüm sekmeleri gizle
    const tabs = document.querySelectorAll('.tab-pane');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Sidebar menüdeki aktif sınıfını kaldır
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // İlgili sekmeyi göster
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Sidebar menüdeki ilgili öğeyi aktif yap
    const menuItem = document.querySelector(`.sidebar-menu li a[href="#${tabId}"]`);
    if (menuItem) {
        menuItem.parentElement.classList.add('active');
    }
}

// Geçerli tarihi göster
function showCurrentDate() {
    const currentDateEl = document.getElementById('currentDate');
    if (currentDateEl) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        currentDateEl.textContent = now.toLocaleDateString('tr-TR', options);
    }
}

// Para birimini formatlı gösterir
function formatCurrency(value) {
    return new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY',
        minimumFractionDigits: 2
    }).format(value);
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // URL hash varsa ilgili sekmeyi göster
    const hash = window.location.hash.substring(1);
    if (hash) {
        showTab(hash);
    }
    
    // Hash değişirse sekme değiştir
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            showTab(hash);
        }
    });
    
    // Geçerli tarihi göster
    showCurrentDate();
    
    // Test verisi oluştur (sadece geliştirme amaçlı)
    createTestData();
});

// Test verisi oluştur (geliştirme aşamasında)
function createTestData() {
    // Cari test verisi
    if (!localStorage.getItem('cariler')) {
        const testCariler = [
            {
                id: 'CR001',
                adi: 'Ahmet Yılmaz',
                telefon: '0555 123 4567',
                email: 'ahmet@example.com',
                adres: 'Atatürk Cad. No:123 İstanbul',
                vergiDairesi: 'Kadıköy',
                vkn: '1234567890',
                aciklama: 'Test müşterisi',
                bakiye: 3500,
                durum: 'aktif',
                kayitTarihi: '2023-01-15',
                sonIslemTarihi: '2023-06-10'
            },
            {
                id: 'CR002',
                adi: 'Mehmet Öz',
                telefon: '0533 456 7890',
                email: 'mehmet@example.com',
                adres: 'Cumhuriyet Mah. No:45 Ankara',
                vergiDairesi: 'Çankaya',
                vkn: '9876543210',
                aciklama: '',
                bakiye: 1250,
                durum: 'aktif',
                kayitTarihi: '2023-02-20',
                sonIslemTarihi: '2023-06-08'
            },
            {
                id: 'CR003',
                adi: 'Ayşe Demir',
                telefon: '0544 789 1234',
                email: 'ayse@example.com',
                adres: 'İnönü Cad. No:78 İzmir',
                vergiDairesi: 'Konak',
                vkn: '5678901234',
                aciklama: 'Düzenli ödemeler',
                bakiye: 0,
                durum: 'pasif',
                kayitTarihi: '2023-03-10',
                sonIslemTarihi: '2023-05-15'
            }
        ];
        
        localStorage.setItem('cariler', JSON.stringify(testCariler));
    }
    
    // İşlem test verisi
    if (!localStorage.getItem('islemler')) {
        const today = new Date();
        const testIslemler = [
            {
                id: 'ISL23060501',
                cariId: 'CR001',
                cariAdi: 'Ahmet Yılmaz',
                tarih: '2023-06-05',
                tur: 'tahakkuk',
                tutar: 2500,
                odemeTuru: 'belirtilmedi',
                aciklama: 'Haziran ayı fatura',
                evrakNo: '',
                kaydeden: 'Admin',
                kayitZamani: new Date(2023, 5, 5, 10, 30).toISOString()
            },
            {
                id: 'ISL23060502',
                cariId: 'CR001',
                cariAdi: 'Ahmet Yılmaz',
                tarih: '2023-06-10',
                tur: 'tahsilat',
                tutar: 1000,
                odemeTuru: 'havale',
                aciklama: 'Kısmi ödeme',
                evrakNo: '',
                kaydeden: 'Admin',
                kayitZamani: new Date(2023, 5, 10, 14, 15).toISOString()
            },
            {
                id: 'ISL23060601',
                cariId: 'CR002',
                cariAdi: 'Mehmet Öz',
                tarih: '2023-06-08',
                tur: 'tahakkuk',
                tutar: 1250,
                odemeTuru: 'belirtilmedi',
                aciklama: 'Malzeme bedeli',
                evrakNo: '',
                kaydeden: 'Admin',
                kayitZamani: new Date(2023, 5, 8, 9, 0).toISOString()
            }
        ];
        
        localStorage.setItem('islemler', JSON.stringify(testIslemler));
    }
}
