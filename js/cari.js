/**
 * Cari Hesap İşlemleri JavaScript Dosyası
 */

document.addEventListener('DOMContentLoaded', function() {
    // Cari formu submit olayını yakala
    const yeniCariForm = document.getElementById('yeniCariForm');
    const kaydetCariBtn = document.getElementById('kaydetCari');
    
    if (kaydetCariBtn) {
        kaydetCariBtn.addEventListener('click', function() {
            saveCariData();
        });
    }
    
    // Cari türü değiştiğinde gerekli alanları güncelle
    const cariTuruSelect = document.getElementById('cariTuru');
    if (cariTuruSelect) {
        cariTuruSelect.addEventListener('change', function() {
            updateCariFormFields(this.value);
        });
        
        // Sayfa yüklenirken varsayılan seçime göre güncelle
        updateCariFormFields(cariTuruSelect.value);
    }
    
    // Düzenleme formunda cari türü değiştiğinde alanları güncelle
    const duzenleCariTuruSelect = document.getElementById('duzenleCariTuru');
    if (duzenleCariTuruSelect) {
        duzenleCariTuruSelect.addEventListener('change', function() {
            updateCariDuzenleFormFields(this.value);
        });
    }
    
    // Düzenleme formunda kaydet butonuna tıklandığında
    const kaydetDuzenleBtn = document.getElementById('kaydetDuzenle');
    if (kaydetDuzenleBtn) {
        kaydetDuzenleBtn.addEventListener('click', function() {
            saveCariEditData();
        });
    }
    
    // Düzenleme formunda iptal butonuna tıklandığında
    const iptalDuzenleBtn = document.getElementById('iptalDuzenle');
    if (iptalDuzenleBtn) {
        iptalDuzenleBtn.addEventListener('click', function() {
            document.getElementById('duzenleModal').style.display = 'none';
        });
    }
    
    // Düzenleme modalını kapatma butonuna tıklandığında
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Otomatik kod oluştur
    const cariKoduInput = document.getElementById('cariKodu');
    if (cariKoduInput) {
        cariKoduInput.addEventListener('focus', function() {
            if (!this.value) {
                this.value = generateCariCode();
            }
        });
    }
    
    // Dashboard'daki cari sayısını güncelle
    updateCariCountOnDashboard();
    
    // Dashboard'daki toplam alacak bakiyesini güncelle
    updateTotalReceivables();
    
    // Dashboard'daki sıfır bakiye olmayan cari sayısını güncelle
    updateNonZeroBalanceCount();
});

/**
 * Cari türüne göre form alanlarını günceller
 * @param {string} cariTuru - Seçilen cari türü (bireysel/kurumsal)
 */
function updateCariFormFields(cariTuru) {
    const vergiDairesiLabel = document.querySelector('label[for="cariVergiDairesi"]');
    const vergiNoLabel = document.querySelector('label[for="cariVergiNo"]');
    const cariVergiDairesiElement = document.getElementById('cariVergiDairesi');
    
    // Eğer elementler bulunamazsa (henüz DOM'da yoksa) işlemi atla
    if (!vergiDairesiLabel || !vergiNoLabel || !cariVergiDairesiElement) {
        console.log('Cari form alanları henüz yüklenmemiş');
        return;
    }
    
    if (cariTuru === 'bireysel') {
        vergiDairesiLabel.style.display = 'none';
        cariVergiDairesiElement.parentElement.style.display = 'none';
        vergiNoLabel.textContent = 'T.C. Kimlik No:';
    } else {
        vergiDairesiLabel.style.display = 'block';
        cariVergiDairesiElement.parentElement.style.display = 'block';
        vergiNoLabel.textContent = 'Vergi No:';
    }
}

/**
 * Cari kodu otomatik oluşturur
 * @returns {string} Oluşturulan cari kodu
 */
function generateCariCode() {
    const prefix = document.getElementById('cariTuru').value === 'bireysel' ? 'CB' : 'CK';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomNum}`;
}

/**
 * Cari bilgilerini kaydeder
 */
function saveCariData() {
    // Form alanlarından değerleri al
    const cariTuru = document.getElementById('cariTuru').value;
    const cariKodu = document.getElementById('cariKodu').value || generateCariCode();
    const cariAdi = document.getElementById('cariAdi').value;
    const cariTelefon = document.getElementById('cariTelefon').value;
    const cariEposta = document.getElementById('cariEposta').value;
    const cariAdres = document.getElementById('cariAdres').value;
    const cariVergiDairesi = document.getElementById('cariVergiDairesi').value;
    const cariVergiNo = document.getElementById('cariVergiNo').value;
    
    // Form validasyonu
    if (!cariAdi) {
        alert('Lütfen cari adını giriniz!');
        return;
    }
    
    // Cari verilerini oluştur
    const cariData = {
        id: cariKodu,
        turu: cariTuru,
        adi: cariAdi,
        telefon: cariTelefon,
        eposta: cariEposta,
        adres: cariAdres,
        vergiDairesi: cariVergiDairesi,
        vergiNo: cariVergiNo,
        bakiye: 0,
        kayitTarihi: new Date().toLocaleDateString('tr-TR'),
        sonIslemTarihi: null
    };
    
    // Verileri localStorage'a kaydet (veritabanı entegre edilene kadar)
    saveCariToStorage(cariData);
    
    // Başarılı mesajı göster ve formu kapat
    alert('Cari başarıyla kaydedildi!');
    document.getElementById('yeniCariModal').style.display = 'none';
    
    // Cari listesini güncelle
    loadCariler();
    
    // Dashboard'daki cari sayısını güncelle
    updateCariCountOnDashboard();
    
    // Dashboard'daki toplam alacak bakiyesini güncelle
    updateTotalReceivables();
    
    // Dashboard'daki sıfır bakiye olmayan cari sayısını güncelle
    updateNonZeroBalanceCount();
    
    // Formu temizle
    document.getElementById('yeniCariForm').reset();
}

/**
 * Cari verilerini localStorage'a kaydeder
 * @param {Object} cariData - Kaydedilecek cari verileri
 */
function saveCariToStorage(cariData) {
    // Mevcut verileri al
    let cariler = JSON.parse(localStorage.getItem('cariler')) || [];
    
    // Yeni cariyi ekle
    cariler.push(cariData);
    
    // Güncellenmiş veriyi kaydet
    localStorage.setItem('cariler', JSON.stringify(cariler));
}

/**
 * Cari listesini yükler ve gösterir
 */
function loadCariler() {
    const cariListesi = document.getElementById('cariListesi');
    if (!cariListesi) return;
    
    // LocalStorage'dan verileri al
    const cariler = JSON.parse(localStorage.getItem('cariler')) || [];
    
    // Listeleme için DOM'u temizle
    cariListesi.innerHTML = '';
    
    // Veri yoksa mesaj göster
    if (cariler.length === 0) {
        cariListesi.innerHTML = '<tr><td colspan="7" class="text-center">Kayıtlı cari bulunamadı.</td></tr>';
        return;
    }
    
    // Carileri listele
    cariler.forEach(cari => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cari.id}</td>
            <td>${cari.adi}</td>
            <td>${cari.telefon || '-'}</td>
            <td>${cari.eposta || '-'}</td>
            <td class="${Number(cari.bakiye) < 0 ? 'text-danger' : 'text-success'}">${formatCurrency(cari.bakiye)}</td>
            <td>${cari.sonIslemTarihi || cari.kayitTarihi}</td>
            <td>
                <button class="btn btn-sm btn-info" title="Detay" onclick="showCariDetail('${cari.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-primary" title="Düzenle" onclick="editCari('${cari.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" title="Sil" onclick="deleteCari('${cari.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        cariListesi.appendChild(row);
    });
}

/**
 * Para birimini formatlı gösterir
 * @param {number} value - Formatlanacak değer
 * @returns {string} Formatlanmış para birimi
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY',
        minimumFractionDigits: 2
    }).format(value);
}

/**
 * Dashboard'daki toplam cari sayısını günceller
 */
function updateCariCountOnDashboard() {
    // LocalStorage'dan verileri al
    const cariler = JSON.parse(localStorage.getItem('cariler')) || [];
    
    // Toplam cari sayısını al
    const cariCount = cariler.length;
    
    // Dashboard'daki cari sayısı elemanını bul
    const cariCountElement = document.querySelector('#anasayfa .dashboard-cards div:first-child .card-content .number');
    
    // Eğer eleman bulunduysa içeriğini güncelle
    if (cariCountElement) {
        cariCountElement.textContent = cariCount;
    }
}

/**
 * Dashboard'daki toplam alacak bakiyesini hesaplar ve günceller
 */
function updateTotalReceivables() {
    // LocalStorage'dan verileri al
    const cariler = JSON.parse(localStorage.getItem('cariler')) || [];
    
    // Toplam alacak bakiyesini hesapla (pozitif bakiyeler)
    let totalReceivables = 0;
    
    cariler.forEach(cari => {
        // Bakiye değerini sayıya çevir (string olabilir)
        let bakiye = cari.bakiye;
        
        // Eğer bakiye string ise ve para birimi sembolü içeriyorsa temizle
        if (typeof bakiye === 'string') {
            bakiye = bakiye.replace(/[^\d.-]/g, '');
        }
        
        // Sayıya çevir
        bakiye = parseFloat(bakiye) || 0;
        
        // Sadece pozitif bakiyeleri topla (alacaklar)
        if (bakiye > 0) {
            totalReceivables += bakiye;
        }
    });
    
    // Dashboard'daki toplam alacak elemanını bul (ikinci kart)
    const totalReceivablesElement = document.querySelector('#anasayfa .dashboard-cards div:nth-child(2) .card-content .number');
    
    // Eğer eleman bulunduysa içeriğini güncelle
    if (totalReceivablesElement) {
        totalReceivablesElement.textContent = formatCurrency(totalReceivables);
    }
}

/**
 * Dashboard'daki sıfır bakiye olmayan cari sayısını hesaplar ve günceller
 */
function updateNonZeroBalanceCount() {
    // LocalStorage'dan verileri al
    const cariler = JSON.parse(localStorage.getItem('cariler')) || [];
    
    // Bakiyesi 0 olmayan carileri say
    let nonZeroCount = 0;
    
    cariler.forEach(cari => {
        // Bakiye değerini sayıya çevir (string olabilir)
        let bakiye = cari.bakiye;
        
        // Eğer bakiye string ise ve para birimi sembolü içeriyorsa temizle
        if (typeof bakiye === 'string') {
            bakiye = bakiye.replace(/[^\d.-]/g, '');
        }
        
        // Sayıya çevir
        bakiye = parseFloat(bakiye) || 0;
        
        // Bakiyesi 0 olmayan carileri say
        if (bakiye !== 0) {
            nonZeroCount++;
        }
    });
    
    // Dashboard'daki ilgili elemanı bul (üçüncü kart)
    const nonZeroCountElement = document.querySelector('#anasayfa .dashboard-cards div:nth-child(3) .card-content .number');
    
    // Eğer eleman bulunduysa içeriğini güncelle
    if (nonZeroCountElement) {
        nonZeroCountElement.textContent = nonZeroCount;
    }
}

/**
 * Cari hesap verilerini düzenlemeye hazırlar
 * @param {string} cariId - Düzenlenecek cari ID
 */
function editCari(cariId) {
    // LocalStorage'dan verileri al
    const cariler = JSON.parse(localStorage.getItem('cariler')) || [];
    
    // İlgili cari hesabı bul
    const cari = cariler.find(c => c.id === cariId);
    
    if (!cari) {
        alert('Cari hesap bulunamadı!');
        return;
    }
    
    // Düzenleme formundaki alanları doldur
    document.getElementById('duzenleId').value = cari.id;
    document.getElementById('duzenleCariKodu').value = cari.id;
    document.getElementById('duzenleCariTuru').value = cari.turu || 'bireysel';
    document.getElementById('duzenleCariAdi').value = cari.adi || '';
    document.getElementById('duzenleCariTelefon').value = cari.telefon || '';
    document.getElementById('duzenleCariEposta').value = cari.eposta || '';
    document.getElementById('duzenleCariAdres').value = cari.adres || '';
    document.getElementById('duzenleCariVergiDairesi').value = cari.vergiDairesi || '';
    document.getElementById('duzenleCariVergiNo').value = cari.vergiNo || '';
    document.getElementById('duzenleBakiye').value = formatCurrency(cari.bakiye || 0);
    
    // Cari türüne göre form alanlarını güncelle
    updateCariDuzenleFormFields(cari.turu || 'bireysel');
    
    // Modalı göster
    document.getElementById('duzenleModal').style.display = 'block';
}

/**
 * Cari türüne göre düzenleme form alanlarını günceller
 * @param {string} cariTuru - Seçilen cari türü (bireysel/kurumsal)
 */
function updateCariDuzenleFormFields(cariTuru) {
    const vergiDairesiLabel = document.querySelector('label[for="duzenleCariVergiDairesi"]');
    const vergiNoLabel = document.getElementById('duzenleCariVergiNoLabel');
    const cariVergiDairesiElement = document.getElementById('duzenleCariVergiDairesi');
    
    // Elementlerin varlığını kontrol et
    if (!vergiDairesiLabel || !vergiNoLabel || !cariVergiDairesiElement) {
        console.log('Düzenleme form alanları henüz yüklenmemiş');
        return;
    }
    
    const vergiDairesiParent = cariVergiDairesiElement.closest('.form-group');
    
    if (cariTuru === 'bireysel') {
        if (vergiDairesiParent) vergiDairesiParent.style.display = 'none';
        vergiNoLabel.textContent = 'T.C. Kimlik No:';
    } else {
        if (vergiDairesiParent) vergiDairesiParent.style.display = 'block';
        vergiNoLabel.textContent = 'Vergi No:';
    }
}

/**
 * Güncellenen cari verilerini kaydeder
 */
function saveCariEditData() {
    // Form alanlarından düzenlenen değerleri al
    const cariId = document.getElementById('duzenleId').value;
    const cariTuru = document.getElementById('duzenleCariTuru').value;
    const cariAdi = document.getElementById('duzenleCariAdi').value;
    const cariTelefon = document.getElementById('duzenleCariTelefon').value;
    const cariEposta = document.getElementById('duzenleCariEposta').value;
    const cariAdres = document.getElementById('duzenleCariAdres').value;
    const cariVergiDairesi = document.getElementById('duzenleCariVergiDairesi').value;
    const cariVergiNo = document.getElementById('duzenleCariVergiNo').value;
    
    // Form validasyonu
    if (!cariAdi) {
        alert('Lütfen cari adını giriniz!');
        return;
    }
    
    // LocalStorage'dan mevcut cari verileri al
    let cariler = JSON.parse(localStorage.getItem('cariler')) || [];
    
    // Cari indeksini bul
    const cariIndex = cariler.findIndex(c => c.id === cariId);
    
    if (cariIndex === -1) {
        alert('Cari hesap bulunamadı!');
        return;
    }
    
    // Mevcut bakiyeyi koru
    const mevcutBakiye = cariler[cariIndex].bakiye;
    const mevcutKayitTarihi = cariler[cariIndex].kayitTarihi;
    const mevcutSonIslemTarihi = cariler[cariIndex].sonIslemTarihi;
    
    // Güncellenmiş cari verileri
    cariler[cariIndex] = {
        ...cariler[cariIndex], // Mevcut özellikleri koru
        turu: cariTuru,
        adi: cariAdi,
        telefon: cariTelefon,
        eposta: cariEposta,
        adres: cariAdres,
        vergiDairesi: cariVergiDairesi,
        vergiNo: cariVergiNo,
        bakiye: mevcutBakiye,
        kayitTarihi: mevcutKayitTarihi,
        sonIslemTarihi: mevcutSonIslemTarihi,
        guncellenmeTarihi: new Date().toLocaleDateString('tr-TR')
    };
    
    // Güncel veriyi localStorage'a kaydet
    localStorage.setItem('cariler', JSON.stringify(cariler));
    
    // Başarılı mesajı göster ve formun kapanması
    alert('Cari hesap başarıyla güncellendi!');
    document.getElementById('duzenleModal').style.display = 'none';
    
    // Cari listesini güncelle
    loadCariler();
}

// Bu fonksiyonlar daha sonra gerçeklenecek
function showCariDetail(cariId) {
    alert(`Cari detay gösteriliyor: ${cariId}`);
}

function deleteCari(cariId) {
    if (confirm(`${cariId} kodlu cariyi silmek istediğinize emin misiniz?`)) {
        // LocalStorage'dan verileri al
        let cariler = JSON.parse(localStorage.getItem('cariler')) || [];
        
        // Cariyi listeden çıkar
        cariler = cariler.filter(cari => cari.id !== cariId);
        
        // Güncellenmiş listeyi kaydet
        localStorage.setItem('cariler', JSON.stringify(cariler));
        
        // Listeyi güncelle
        loadCariler();
        
        // Dashboard'daki cari sayısını güncelle
        updateCariCountOnDashboard();
        
        // Dashboard'daki toplam alacak bakiyesini güncelle
        updateTotalReceivables();
        
        // Dashboard'daki sıfır bakiye olmayan cari sayısını güncelle
        updateNonZeroBalanceCount();
        
        alert('Cari başarıyla silindi!');
    }
}
