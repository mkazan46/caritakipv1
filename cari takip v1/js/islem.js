/**
 * İşlem Yönetimi JavaScript Dosyası
 */

/**
 * İşlem türüne göre form etiketlerini günceller ve ilgili alanları gösterir/gizler
 * @param {string} islemTuru - İşlem türü (tahakkuk/tahsilat)
 */
function updateIslemFormLabels(islemTuru) {
    const tutar = document.querySelector('label[for="islemTutar"]');
    const odemeTuruRow = document.querySelector('#islemOdemeTuru').closest('.form-row');
    const evrakNoRow = document.querySelector('#evrakNo').closest('.form-row');
    
    if (islemTuru === 'tahakkuk') {
        tutar.textContent = 'Tahakkuk Tutarı (₺):';
        
        // Tahakkuk işlemlerinde ödeme türü ve evrak no kısımlarını gizle
        if (odemeTuruRow) odemeTuruRow.style.display = 'none';
        if (evrakNoRow) evrakNoRow.style.display = 'none';
    } else {
        tutar.textContent = 'Tahsilat Tutarı (₺):';
        
        // Tahsilat işlemlerinde ödeme türünü göster, evrak no hala gizli kalsın
        if (odemeTuruRow) odemeTuruRow.style.display = '';
        if (evrakNoRow) evrakNoRow.style.display = 'none'; // Evrak no alanı her iki işlem türünde de gizli kalacak
    }
}

/**
 * İşlem numarası otomatik oluşturur
 * @returns {string} Oluşturulan işlem numarası
 */
function generateIslemNo() {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    
    return `ISL${year}${month}${day}-${random}`;
}

/**
 * Cari seçim listesini doldurur
 */
function populateCariSelect() {
    const cariSelect = document.getElementById('cariSelect');
    if (!cariSelect) return;
    
    // LocalStorage'dan cari verilerini al
    const cariler = JSON.parse(localStorage.getItem('cariler')) || [];
    
    // Seçim listesini temizle
    cariSelect.innerHTML = '<option value="">Seçiniz...</option>';
    
    // Carileri seçim listesine ekle
    cariler.forEach(cari => {
        const option = document.createElement('option');
        option.value = cari.id;
        option.textContent = `${cari.adi} (${cari.id})`;
        cariSelect.appendChild(option);
    });
}

/**
 * İşlem türünü değiştirdiğinde kontroller yapar
 * @param {string} islemTuru - İşlem türü
 * @param {string} cariId - Cari hesap ID
 */
function checkIslemTuruAndValidate(islemTuru, cariId) {
    if (islemTuru === 'tahsilat') {
        // Seçili bir cari yoksa işlem yapılmasın
        if (!cariId || cariId === '') {
            document.getElementById('islemTuru').value = 'tahakkuk';
            alert('Önce bir cari hesap seçmelisiniz!');
            return false;
        }
        
        // Carinin mevcut bakiyesini kontrol et
        const cariler = JSON.parse(localStorage.getItem('cariler')) || [];
        const cari = cariler.find(c => c.id === cariId);
        
        if (!cari) {
            document.getElementById('islemTuru').value = 'tahakkuk';
            alert('Seçilen cari hesap bulunamadı!');
            return false;
        }
        
        // Tahsilat yapmadan önce cari bakiyesi olmalı
        const bakiye = parseFloat(cari.bakiye) || 0;
        if (bakiye <= 0) {
            document.getElementById('islemTuru').value = 'tahakkuk';
            alert('Bu cari hesaba ait tahakkuk kaydı bulunmamaktadır. Önce tahakkuk kaydı yapmalısınız!');
            return false;
        }
        
        // Mevcut bakiyeyi göster
        document.getElementById('islemTutar').setAttribute('max', bakiye);
        document.getElementById('islemTutar').setAttribute('placeholder', `Maks: ${formatCurrency(bakiye)}`);
    } else {
        // Tahakkuk seçildiğinde max ve placeholder temizle
        document.getElementById('islemTutar').removeAttribute('max');
        document.getElementById('islemTutar').setAttribute('placeholder', '');
    }
    
    return true;
}

/**
 * İşlem verilerini kaydeder
 */
function saveIslemData() {
    // Form alanlarından değerleri al
    const islemTuru = document.getElementById('islemTuru').value;
    const islemNo = document.getElementById('islemNo').value;
    const cariId = document.getElementById('cariSelect').value;
    const islemTarih = document.getElementById('islemTarih').value;
    const islemTutar = parseFloat(document.getElementById('islemTutar').value);
    const islemAciklama = document.getElementById('islemAciklama').value;
    
    // Tahsilat işlemleri için ödeme türü alanını al, evrak no artık kullanılmıyor
    let islemOdemeTuru = 'belirtilmedi';
    let evrakNo = '';
    
    if (islemTuru === 'tahsilat') {
        islemOdemeTuru = document.getElementById('islemOdemeTuru').value;
    }
    
    // Form validasyonu
    if (!cariId) {
        alert('Lütfen bir cari seçin!');
        return;
    }
    
    if (isNaN(islemTutar) || islemTutar <= 0) {
        alert('Geçerli bir tutar girin!');
        return;
    }
    
    // Seçilen cariyi bul
    const cariler = JSON.parse(localStorage.getItem('cariler')) || [];
    const cari = cariler.find(c => c.id === cariId);
    
    if (!cari) {
        alert('Seçilen cari bulunamadı!');
        return;
    }
    
    // Tahsilat için ek kontroller
    if (islemTuru === 'tahsilat') {
        const bakiye = parseFloat(cari.bakiye) || 0;
        
        // Bakiye kontrolü
        if (bakiye <= 0) {
            alert('Bu cari hesaba ait tahakkuk kaydı bulunmamaktadır. Önce tahakkuk kaydı yapmalısınız!');
            return;
        }
        
        // Tutar kontrolü
        if (islemTutar > bakiye) {
            alert(`Tahsilat tutarı, cari hesabın mevcut bakiyesini (${formatCurrency(bakiye)}) aşamaz!`);
            return;
        }
    }
    
    // İşlem verilerini oluştur
    const islemData = {
        id: islemNo,
        cariId: cariId,
        cariAdi: cari.adi,
        tarih: islemTarih,
        tur: islemTuru,
        tutar: islemTutar,
        odemeTuru: islemOdemeTuru,
        aciklama: islemAciklama,
        evrakNo: evrakNo,
        kaydeden: 'Admin',
        kayitZamani: new Date().toISOString()
    };
    
    // Verileri localStorage'a kaydet
    saveIslemToStorage(islemData);
    
    // Cari bakiyesini güncelle
    updateCariBakiye(cariId, islemTuru, islemTutar);
    
    // Başarılı mesajı göster ve formu kapat
    alert('İşlem başarıyla kaydedildi!');
    document.getElementById('yeniIslemModal').style.display = 'none';
    
    // İşlem listesini güncelle
    loadIslemler();
    
    // Dashboard'daki aylık işlem toplamını güncelle
    updateMonthlyTransactionTotal();
    
    // Anasayfadaki son işlemler tablosunu güncelle
    updateDashboardRecentTransactions();
    
    // Aylık işlem grafiğini güncelle
    createMonthlyTransactionChart();
}

/**
 * İşlem verilerini localStorage'a kaydeder
 * @param {Object} islemData - Kaydedilecek işlem verileri
 */
function saveIslemToStorage(islemData) {
    // Mevcut verileri al
    let islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    
    // Yeni işlemi ekle
    islemler.push(islemData);
    
    // Güncellenmiş veriyi kaydet
    localStorage.setItem('islemler', JSON.stringify(islemler));
}

/**
 * Cari bakiyesini günceller
 * @param {string} cariId - Cari ID
 * @param {string} islemTuru - İşlem türü (tahakkuk/tahsilat)
 * @param {number} tutar - İşlem tutarı
 */
function updateCariBakiye(cariId, islemTuru, tutar) {
    // Mevcut cari verilerini al
    let cariler = JSON.parse(localStorage.getItem('cariler')) || [];
    
    // İlgili cariyi bul
    const cariIndex = cariler.findIndex(c => c.id === cariId);
    
    if (cariIndex !== -1) {
        // Bakiyeyi güncelle (Tahakkuk +, Tahsilat -)
        if (islemTuru === 'tahakkuk') {
            cariler[cariIndex].bakiye = (parseFloat(cariler[cariIndex].bakiye) || 0) + tutar;
        } else {
            // Tahsilat işleminde, bakiyeden düşme yap
            cariler[cariIndex].bakiye = (parseFloat(cariler[cariIndex].bakiye) || 0) - tutar;
            
            // Tahsilat tutarı mevcut bakiyeden fazla olamaz - kontrol ekle
            if (parseFloat(cariler[cariIndex].bakiye) < 0) {
                alert("Uyarı: Tahsilat tutarı, mevcut tahakkuk bakiyesinden fazla!");
                // Negative bakiyeyi önlemek için 0'a çek (tercihe bağlı)
                // cariler[cariIndex].bakiye = 0;
            }
        }
        
        // Son işlem tarihini güncelle
        cariler[cariIndex].sonIslemTarihi = new Date().toLocaleDateString('tr-TR');
        
        // Güncellenmiş veriyi kaydet
        localStorage.setItem('cariler', JSON.stringify(cariler));
    }
}

/**
 * İşlem listesini yükler ve gösterir
 */
function loadIslemler() {
    const islemListesi = document.getElementById('islemListesi');
    if (!islemListesi) return;
    
    // Aktif sekmeyi kontrol et
    const activeTab = document.querySelector('#islemler .tabs button.active');
    const filterType = activeTab ? activeTab.getAttribute('data-type') : null;
    
    // LocalStorage'dan verileri al
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    
    // Listeleme için DOM'u temizle
    islemListesi.innerHTML = '';
    
    // Filtrelenmiş işlemleri hazırla
    let filteredIslemler = islemler;
    
    // Filtre tipine göre işlemleri filtrele
    if (filterType === 'tahakkuk') {
        filteredIslemler = islemler.filter(islem => islem.tur === 'tahakkuk');
    } else if (filterType === 'tahsilat') {
        filteredIslemler = islemler.filter(islem => islem.tur === 'tahsilat');
    }
    
    // Veri yoksa mesaj göster
    if (filteredIslemler.length === 0) {
        islemListesi.innerHTML = '<tr><td colspan="7" class="text-center">Kayıtlı işlem bulunamadı.</td></tr>';
        return;
    }
    
    // İşlemleri listele (en yeniden eskiye)
    filteredIslemler
        .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
        .forEach(islem => {
            const row = document.createElement('tr');
            const formattedDate = new Date(islem.tarih).toLocaleDateString('tr-TR');
            
            row.innerHTML = `
                <td>${islem.id}</td>
                <td>${islem.cariAdi}</td>
                <td>${formattedDate}</td>
                <td><span class="${islem.tur === 'tahakkuk' ? 'status pending' : 'status paid'}">${islem.tur === 'tahakkuk' ? 'Tahakkuk' : 'Tahsilat'}</span></td>
                <td>${formatCurrency(islem.tutar)}</td>
                <td>${islem.aciklama || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-info" title="Detay" onclick="showIslemDetail('${islem.id}')"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-sm btn-primary" title="Düzenle" onclick="editIslem('${islem.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" title="Sil" onclick="deleteIslem('${islem.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            islemListesi.appendChild(row);
        });
}

/**
 * Tab butonlarını ayarlar
 */
function setupIslemTabs() {
    const tabsContainer = document.querySelector('#islemler .tabs');
    if (!tabsContainer) return;
    
    // Tab butonlarını güncelleyelim
    const tabs = tabsContainer.querySelectorAll('button');
    
    // İlk tab "Tüm İşlemler" olsun
    if (tabs[0]) {
        tabs[0].textContent = 'Tüm İşlemler';
        tabs[0].setAttribute('data-type', 'all');
    }
    
    // İkinci tab "Tahakkuklar" olsun
    if (tabs[1]) {
        tabs[1].textContent = 'Tahakkuklar';
        tabs[1].setAttribute('data-type', 'tahakkuk');
    }
    
    // Üçüncü tab "Tahsilatlar" olsun
    if (tabs[2]) {
        tabs[2].textContent = 'Tahsilatlar';
        tabs[2].setAttribute('data-type', 'tahsilat');
    }
    
    // Tab tıklama olayları
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Aktif tab sınıfını güncelle
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // İşlem listesini güncelle
            loadIslemler();
        });
    });
    
    // Varsayılan olarak ilk tab aktif olsun
    if (tabs[0] && !tabsContainer.querySelector('button.active')) {
        tabs[0].classList.add('active');
    }
}

// İşlem detay, düzenleme ve silme fonksiyonları
function showIslemDetail(islemId) {
    alert(`İşlem detayı gösteriliyor: ${islemId}`);
    // Detay modalı buraya eklenecek
}

/**
 * Bir işlemi siler
 * @param {string} islemId - Silinecek işlem ID'si
 */
function deleteIslem(islemId) {
    // Silme işlemi onayı
    if (!confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    // LocalStorage'dan işlem verilerini al
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    
    // Silinecek işlemi bul
    const islemIndex = islemler.findIndex(i => i.id === islemId);
    
    if (islemIndex === -1) {
        alert('Silinecek işlem bulunamadı!');
        return;
    }
    
    // Silinen işlemin bilgilerini al (bakiye etkisini geri almak için)
    const silinenIslem = islemler[islemIndex];
    
    // Bakiye etkisini geri al
    if (silinenIslem.tur === 'tahakkuk') {
        // Tahakkuk işleminin etkisini geri al
        updateCariBakiye(silinenIslem.cariId, 'tahsilat', silinenIslem.tutar);
    } else {
        // Tahsilat işleminin etkisini geri al
        updateCariBakiye(silinenIslem.cariId, 'tahakkuk', silinenIslem.tutar);
    }
    
    // İşlemi listeden kaldır
    islemler.splice(islemIndex, 1);
    
    // Güncellenmiş listeyi kaydet
    localStorage.setItem('islemler', JSON.stringify(islemler));
    
    // Başarılı mesajı göster
    alert('İşlem başarıyla silindi!');
    
    // İşlem listesini güncelle
    loadIslemler();
    
    // Dashboard'daki aylık işlem toplamını güncelle
    updateMonthlyTransactionTotal();
    
    // Anasayfadaki son işlemler tablosunu güncelle
    updateDashboardRecentTransactions();
    
    // Aylık işlem grafiğini güncelle
    createMonthlyTransactionChart();
}

/**
 * Mevcut bir işlemi düzenler
 * @param {string} islemId - Düzenlenecek işlem ID'si
 */
function editIslem(islemId) {
    // LocalStorage'dan işlem verilerini al
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    
    // Düzenlenecek işlemi bul
    const islem = islemler.find(i => i.id === islemId);
    
    if (!islem) {
        alert('İşlem bulunamadı!');
        return;
    }
    
    // Modal elementi kontrol et veya oluştur
    let yeniIslemModal = document.getElementById('yeniIslemModal');
    if (!yeniIslemModal) {
        yeniIslemModal = createIslemModal();
        if (!yeniIslemModal) {
            alert("İşlem modalı oluşturulamadı!");
            return;
        }
    }
    
    // Modal başlığını güncelle
    const modalHeader = yeniIslemModal.querySelector('.modal-header h2');
    if (modalHeader) {
        modalHeader.textContent = 'İşlem Düzenle';
    }
    
    // Cari seçim listesini doldur
    populateCariSelect();
    
    try {
        // Form alanlarını mevcut işlem verileriyle doldur
        document.getElementById('islemNo').value = islem.id;
        document.getElementById('islemTuru').value = islem.tur;
        document.getElementById('cariSelect').value = islem.cariId;
        document.getElementById('islemTarih').value = islem.tarih;
        document.getElementById('islemTutar').value = islem.tutar;
        document.getElementById('islemAciklama').value = islem.aciklama || '';
        
        // İşlem türüne göre ek alanları ayarla
        if (islem.tur === 'tahsilat') {
            document.getElementById('islemOdemeTuru').value = islem.odemeTuru || 'nakit';
            // İşlem türü etiketlerini güncelle
            updateIslemFormLabels(islem.tur);
            
            // Tahsilat işlemi düzenlenirken, orijinal tutarı akılda tut
            yeniIslemModal.setAttribute('data-original-tutar', islem.tutar);
            yeniIslemModal.setAttribute('data-original-tur', islem.tur);
        } else {
            // İşlem türü etiketlerini güncelle
            updateIslemFormLabels(islem.tur);
        }
        
        // İşlem kaydetme fonksiyonunu düzenleme moduna ayarla
        document.getElementById('kaydetIslem').onclick = function() {
            saveEditedIslem(islemId);
        };
        
        // Modal'ı göster
        yeniIslemModal.style.display = 'block';
        
        // İşlem tutarına odaklan
        document.getElementById('islemTutar')?.focus();
    } catch (error) {
        console.error("İşlem düzenleme formunu hazırlarken hata oluştu:", error);
        alert("İşlem düzenleme formu yüklenirken bir hata oluştu: " + error.message);
    }
}

/**
 * Düzenlenen işlem verilerini kaydeder
 * @param {string} originalIslemId - Orijinal işlem ID'si
 */
function saveEditedIslem(originalIslemId) {
    // Form alanlarından değerleri al
    const islemTuru = document.getElementById('islemTuru').value;
    const islemNo = document.getElementById('islemNo').value;
    const cariId = document.getElementById('cariSelect').value;
    const islemTarih = document.getElementById('islemTarih').value;
    const islemTutar = parseFloat(document.getElementById('islemTutar').value);
    const islemAciklama = document.getElementById('islemAciklama').value;
    
    // Tahsilat işlemleri için ödeme türü alanını al
    let islemOdemeTuru = 'belirtilmedi';
    let evrakNo = '';
    
    if (islemTuru === 'tahsilat') {
        islemOdemeTuru = document.getElementById('islemOdemeTuru').value;
    }
    
    // Form validasyonu
    if (!cariId) {
        alert('Lütfen bir cari seçin!');
        return;
    }
    
    if (isNaN(islemTutar) || islemTutar <= 0) {
        alert('Geçerli bir tutar girin!');
        return;
    }
    
    // Seçilen cariyi bul
    const cariler = JSON.parse(localStorage.getItem('cariler')) || [];
    const cari = cariler.find(c => c.id === cariId);
    
    if (!cari) {
        alert('Seçilen cari bulunamadı!');
        return;
    }
    
    // Mevcut işlemleri al
    let islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    
    // Düzenlenen işlemi bul
    const islemIndex = islemler.findIndex(i => i.id === originalIslemId);
    
    if (islemIndex === -1) {
        alert('Düzenlenecek işlem bulunamadı!');
        return;
    }
    
    // Düzenlenen işlemin orijinal değerlerini al
    const originalIslem = islemler[islemIndex];
    const yeniIslemModal = document.getElementById('yeniIslemModal');
    const originalTutar = parseFloat(yeniIslemModal.getAttribute('data-original-tutar') || originalIslem.tutar);
    const originalTur = yeniIslemModal.getAttribute('data-original-tur') || originalIslem.tur;
    
    // Önce orijinal işlemin bakiye etkisini geri al
    if (originalTur === 'tahakkuk') {
        // Tahakkuk işleminin etkisini geri al
        updateCariBakiye(originalIslem.cariId, 'tahsilat', originalTutar);
    } else {
        // Tahsilat işleminin etkisini geri al
        updateCariBakiye(originalIslem.cariId, 'tahakkuk', originalTutar);
    }
    
    // Tahsilat için ek kontroller
    if (islemTuru === 'tahsilat') {
        const bakiye = parseFloat(cari.bakiye) || 0;
        
        // Bakiye kontrolü
        if (bakiye <= 0) {
            alert('Bu cari hesaba ait tahakkuk kaydı bulunmamaktadır. Önce tahakkuk kaydı yapmalısınız!');
            return;
        }
        
        // Tutar kontrolü
        if (islemTutar > bakiye) {
            alert(`Tahsilat tutarı, cari hesabın mevcut bakiyesini (${formatCurrency(bakiye)}) aşamaz!`);
            return;
        }
    }
    
    // Güncellenmiş işlem verisini oluştur
    const updatedIslemData = {
        id: islemNo,
        cariId: cariId,
        cariAdi: cari.adi,
        tarih: islemTarih,
        tur: islemTuru,
        tutar: islemTutar,
        odemeTuru: islemOdemeTuru,
        aciklama: islemAciklama,
        evrakNo: evrakNo,
        kaydeden: originalIslem.kaydeden || 'Admin',
        kayitZamani: originalIslem.kayitZamani,
        guncellemeTarihi: new Date().toISOString()
    };
    
    // İşlemi güncelle
    islemler[islemIndex] = updatedIslemData;
    
    // Güncellenmiş listeyi kaydet
    localStorage.setItem('islemler', JSON.stringify(islemler));
    
    // Yeni işlemin bakiye etkisini uygula
    updateCariBakiye(cariId, islemTuru, islemTutar);
    
    // Modal'ın başlığını sıfırla ve kaydetme işlemini normal moda döndür
    const modalHeader = yeniIslemModal.querySelector('.modal-header h2');
    if (modalHeader) {
        modalHeader.textContent = 'Yeni İşlem Ekle';
    }
    
    // Kaydet butonunu normal işleve döndür
    document.getElementById('kaydetIslem').onclick = saveIslemData;
    
    // Başarılı mesajı göster ve formu kapat
    alert('İşlem başarıyla güncellendi!');
    yeniIslemModal.style.display = 'none';
    
    // İşlem listesini güncelle
    loadIslemler();
    
    // Dashboard'daki aylık işlem toplamını güncelle
    updateMonthlyTransactionTotal();
    
    // Anasayfadaki son işlemler tablosunu güncelle
    updateDashboardRecentTransactions();
    
    // Aylık işlem grafiğini güncelle
    createMonthlyTransactionChart();
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
 * Dashboard'daki aylık işlem toplamını hesaplar ve günceller
 */
function updateMonthlyTransactionTotal() {
    // LocalStorage'dan işlem verilerini al
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    
    // İçinde bulunduğumuz ayın ilk ve son gününü belirle
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Aylık toplam işlem tutarını hesapla
    let monthlyTotal = 0;
    
    islemler.forEach(islem => {
        // İşlem tarihini kontrol et
        const islemTarihi = new Date(islem.tarih);
        
        // Sadece bu ay içindeki işlemleri topla
        if (islemTarihi >= firstDayOfMonth && islemTarihi <= lastDayOfMonth) {
            // İşlem tutarını hesapla (tür fark etmeksizin, toplam işlem hacmi)
            monthlyTotal += Math.abs(parseFloat(islem.tutar) || 0);
        }
    });
    
    // Dashboard'daki aylık işlem elemanını bul (dördüncü kart)
    const monthlyTotalElement = document.querySelector('#anasayfa .dashboard-cards div:nth-child(4) .card-content .number');
    
    // Eğer eleman bulunduysa içeriğini güncelle
    if (monthlyTotalElement) {
        monthlyTotalElement.textContent = formatCurrency(monthlyTotal);
    }
}

/**
 * İşlem formunu temizler ve varsayılan değerlerle doldurur
 */
function resetIslemForm() {
    // Form element kontrolü ve temizleme işlemi için yardımcı fonksiyon
    function setElementValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        } else {
            console.warn(`Element with id '${id}' not found in the DOM.`);
        }
    }
    
    // Form alanlarını temizle - null kontrolü ile
    setElementValue('islemNo', generateIslemNo());
    setElementValue('cariSelect', '');
    setElementValue('islemTutar', '');
    setElementValue('islemAciklama', '');
    setElementValue('evrakNo', '');
    
    // Bugünün tarihini ayarla
    const today = new Date().toISOString().split('T')[0];
    setElementValue('islemTarih', today);
    
    // İşlem türünü tahakkuk olarak başlat ve form alanlarını güncelle
    setElementValue('islemTuru', 'tahakkuk');
    
    // Ödeme türünü nakit olarak başlat
    setElementValue('islemOdemeTuru', 'nakit');
    
    // Etiketleri ve görünürlüğü güncelle - eleman bulunursa
    const islemTuruElement = document.getElementById('islemTuru');
    if (islemTuruElement) {
        updateIslemFormLabels(islemTuruElement.value);
    }
    
    // Tutar alanındaki max ve placeholder bilgilerini temizle
    const islemTutarElement = document.getElementById('islemTutar');
    if (islemTutarElement) {
        islemTutarElement.removeAttribute('max');
        islemTutarElement.setAttribute('placeholder', '');
    }
    
    // Modaldan data-original-tutar ve data-original-tur özelliklerini temizle
    const yeniIslemModal = document.getElementById('yeniIslemModal');
    if (yeniIslemModal) {
        yeniIslemModal.removeAttribute('data-original-tutar');
        yeniIslemModal.removeAttribute('data-original-tur');
    }
}

/**
 * Yeni işlem ekleme modalını açar ve gerekli hazırlıkları yapar
 */
function yeniIslemEkle() {
    // Modal elementi kontrol et
    let yeniIslemModal = document.getElementById('yeniIslemModal');
    
    // Modal yoksa oluştur
    if (!yeniIslemModal) {
        console.info("İşlem modalı dinamik olarak oluşturuluyor...");
        yeniIslemModal = createIslemModal();
        
        if (!yeniIslemModal) {
            alert("İşlem modalı oluşturulamadı!");
            return;
        }
    }
    
    // Cari seçim listesini doldur
    populateCariSelect();
    
    try {
        // Form alanlarını sıfırla ve varsayılan değerlerle doldur
        resetIslemForm();
        
        // Modalın başlığını kontrol et ve Yeni İşlem Ekle olarak ayarla
        const modalHeader = yeniIslemModal.querySelector('.modal-header h2');
        if (modalHeader) {
            modalHeader.textContent = 'Yeni İşlem Ekle';
        }
        
        // Kaydet butonunu normal işleve ayarla
        document.getElementById('kaydetIslem').onclick = saveIslemData;
        
        // URL'den cariId parametresi varsa otomatik olarak seç
        const urlParams = new URLSearchParams(window.location.search);
        const cariIdFromUrl = urlParams.get('cariId');
        
        if (cariIdFromUrl) {
            const cariSelect = document.getElementById('cariSelect');
            if (cariSelect) {
                cariSelect.value = cariIdFromUrl;
            }
        }
        
        // Modal'ı göster
        yeniIslemModal.style.display = 'block';
        
        // İlk form alanına odaklan
        if (cariIdFromUrl) {
            document.getElementById('islemTutar')?.focus();
        } else {
            document.getElementById('cariSelect')?.focus();
        }
    } catch (error) {
        console.error("İşlem formunu hazırlarken hata oluştu:", error);
        alert("İşlem formu yüklenirken bir hata oluştu: " + error.message);
    }
}

/**
 * İşlem modalını oluşturur
 * @returns {HTMLElement} Oluşturulan modal elementi
 */
function createIslemModal() {
    // Eğer islemModal zaten varsa, onu döndür
    const existingModal = document.getElementById('yeniIslemModal');
    if (existingModal) return existingModal;
    
    // Modal için container oluştur
    const modal = document.createElement('div');
    modal.id = 'yeniIslemModal';
    modal.className = 'modal';
    
    // Modal içeriği oluştur
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Yeni İşlem Ekle</h2>
                <span class="close" id="closeIslemModal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="islemForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="islemNo">İşlem No:</label>
                            <input type="text" id="islemNo" readonly>
                        </div>
                        <div class="form-group">
                            <label for="islemTuru">İşlem Türü:</label>
                            <select id="islemTuru">
                                <option value="tahakkuk">Tahakkuk</option>
                                <option value="tahsilat">Tahsilat</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="cariSelect">Cari Seçimi:</label>
                            <select id="cariSelect">
                                <option value="">Seçiniz...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="islemTarih">İşlem Tarihi:</label>
                            <input type="date" id="islemTarih">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="islemTutar">Tutar (₺):</label>
                            <input type="number" id="islemTutar" step="0.01" min="0">
                        </div>
                    </div>
                    <div class="form-row odemeTuruRow">
                        <div class="form-group">
                            <label for="islemOdemeTuru">Ödeme Türü:</label>
                            <select id="islemOdemeTuru">
                                <option value="nakit">Nakit</option>
                                <option value="havale">Havale/EFT</option>
                                <option value="krediKarti">Kredi Kartı</option>
                                <option value="cek">Çek</option>
                                <option value="senet">Senet</option>
                                <option value="diger">Diğer</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row evrakNoRow" style="display:none;">
                        <div class="form-group">
                            <label for="evrakNo">Evrak No:</label>
                            <input type="text" id="evrakNo">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label for="islemAciklama">Açıklama:</label>
                            <textarea id="islemAciklama" rows="3"></textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" id="iptalIslem" class="btn btn-default">İptal</button>
                <button type="button" id="kaydetIslem" class="btn btn-primary">Kaydet</button>
            </div>
        </div>
    `;
    
    // Modalı body'ye ekle
    document.body.appendChild(modal);
    
    // Modal kapatma butonuna event listener ekle
    const closeBtn = document.getElementById('closeIslemModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // İptal butonuna event listener ekle
    const iptalBtn = document.getElementById('iptalIslem');
    if (iptalBtn) {
        iptalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // NOT: Kaydet butonu için event listener eklemeyi DOM yüklendikten sonra yapıyoruz,
    // burada eklemiyoruz çünkü DOMContentLoaded içinde de ekleniyor ve çift kaydetme sorununa neden oluyor.
    
    // Enter tuşu ile formu gönderme
    const islemForm = document.getElementById('islemForm');
    if (islemForm) {
        islemForm.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                // Düzenleme modunda mı yoksa yeni kayıt mı kontrol et
                const modalHeader = modal.querySelector('.modal-header h2');
                if (modalHeader && modalHeader.textContent === 'İşlem Düzenle') {
                    // İşlem ID'sini al (düzenleme işlemi için)
                    const islemId = document.getElementById('islemNo').value;
                    saveEditedIslem(islemId);
                } else {
                    saveIslemData();
                }
            }
        });
    }
    
    // İşlem türü değişince etiketleri güncelle
    const islemTuruSelect = document.getElementById('islemTuru');
    if (islemTuruSelect) {
        islemTuruSelect.addEventListener('change', function() {
            const cariId = document.getElementById('cariSelect').value;
            // Tür değiştiğinde doğrulama ve kontrol yap
            if (checkIslemTuruAndValidate(this.value, cariId)) {
                updateIslemFormLabels(this.value);
            }
        });
        
        // Başlangıçta form alanlarını güncelle (varsayılan değer için)
        updateIslemFormLabels(islemTuruSelect.value);
    }
    
    // Cari değiştiğinde işlem türü kontrollerini güncelle
    const cariSelect = document.getElementById('cariSelect');
    if (cariSelect) {
        cariSelect.addEventListener('change', function() {
            const islemTuru = document.getElementById('islemTuru').value;
            checkIslemTuruAndValidate(islemTuru, this.value);
        });
    }
    
    return modal;
}

// Sayfa yüklendiğinde çalışacak event listener
document.addEventListener('DOMContentLoaded', function() {
    // İşlem formu için gerekli eventleri ayarla
    const yeniIslemModal = document.getElementById('yeniIslemModal');
    const yeniIslemEkleBtn = document.getElementById('yeniIslemEkle');
    const kaydetIslemBtn = document.getElementById('kaydetIslem');
    const iptalIslemBtn = document.getElementById('iptalIslem');
    const islemTuruSelect = document.getElementById('islemTuru');
    
    // Yeni işlem butonuna tıklandığında
    if (yeniIslemEkleBtn) {
        yeniIslemEkleBtn.addEventListener('click', function() {
            yeniIslemEkle();
        });
    }
    
    // Modal dışına tıklandığında kapatma
    window.addEventListener('click', function(event) {
        if (event.target == yeniIslemModal) {
            yeniIslemModal.style.display = 'none';
        }
    });
    
    // Escape tuşuna basıldığında modalı kapat
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && yeniIslemModal.style.display === 'block') {
            yeniIslemModal.style.display = 'none';
        }
    });
    
    // İşlem türü değiştiğinde etiketleri güncelle
    if (islemTuruSelect) {
        islemTuruSelect.addEventListener('change', function() {
            updateIslemFormLabels(this.value);
        });
    }
    
    // Kaydet butonuna tıklandığında
    if (kaydetIslemBtn) {
        kaydetIslemBtn.addEventListener('click', function() {
            saveIslemData();
        });
    }
    
    // İptal butonuna tıklandığında
    if (iptalIslemBtn) {
        iptalIslemBtn.addEventListener('click', function() {
            if (yeniIslemModal) {
                yeniIslemModal.style.display = 'none';
            }
        });
    }
    
    // Enter tuşu ile formu gönderme
    document.getElementById('islemForm')?.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            saveIslemData();
        }
    });
    
    // İşlem sekme butonlarını ayarla
    setupIslemTabs();
    
    // İşlem listesini yükle
    loadIslemler();
    
    // Dashboard'daki aylık işlem toplamını göster
    updateMonthlyTransactionTotal();
});