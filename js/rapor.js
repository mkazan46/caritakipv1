/**
 * Raporlama İşlemleri JavaScript Dosyası
 */

document.addEventListener('DOMContentLoaded', function() {
    // Rapor oluşturma butonunu dinle
    const raporOlusturBtn = document.getElementById('raporOlustur');
    if (raporOlusturBtn) {
        raporOlusturBtn.addEventListener('click', function() {
            generateReport();
        });
    }
    
    // Filtreleri uygulama butonunu dinle
    const filtreUygulaBtn = document.getElementById('filtreUygula');
    if (filtreUygulaBtn) {
        filtreUygulaBtn.addEventListener('click', function() {
            applyReportFilters();
        });
    }
    
    // Rapor türü değiştiğinde ilgili filtreleri göster
    const raporTuruSelect = document.getElementById('raporTuru');
    if (raporTuruSelect) {
        raporTuruSelect.addEventListener('change', function() {
            updateReportFilters(this.value);
        });
    }
    
    // Tarih alanlarına varsayılan değer ata
    setupDefaultDates();
});

/**
 * Varsayılan tarih alanlarını ayarlar
 */
function setupDefaultDates() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (!startDateInput || !endDateInput) return;
    
    // Ayın ilk günü
    const firstDay = new Date();
    firstDay.setDate(1);
    
    // Bugün
    const today = new Date();
    
    startDateInput.valueAsDate = firstDay;
    endDateInput.valueAsDate = today;
}

/**
 * Seçilen rapor türüne göre filtreleri günceller
 * @param {string} raporTuru - Seçilen rapor türü
 */
function updateReportFilters(raporTuru) {
    // Burada rapor türüne göre ek filtreler eklenebilir
    // Örnek: Cari raporları için cari seçimi, işlem raporları için işlem türü seçimi vs.
    
    const raporSonuclari = document.getElementById('raporSonuclari');
    
    // Rapor sonuç alanını temizle
    raporSonuclari.innerHTML = `
        <div class="report-placeholder">
            <i class="fas fa-chart-pie"></i>
            <p>${raporTuru} raporu için filtreleri ayarlayın ve uygulayın</p>
        </div>
    `;
}

/**
 * Rapor filtrelerini uygular ve sonuçları gösterir
 */
function applyReportFilters() {
    const raporTuru = document.getElementById('raporTuru').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        alert('Lütfen tarih aralığı seçin!');
        return;
    }
    
    // Tarih kontrolü
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
        alert('Başlangıç tarihi, bitiş tarihinden sonra olamaz!');
        return;
    }
    
    // Rapor türüne göre veri hazırla
    prepareReportData(raporTuru, startDate, endDate);
}

/**
 * Rapor verilerini hazırlar ve gösterir
 * @param {string} raporTuru - Rapor türü
 * @param {string} startDate - Başlangıç tarihi
 * @param {string} endDate - Bitiş tarihi
 */
function prepareReportData(raporTuru, startDate, endDate) {
    const raporSonuclari = document.getElementById('raporSonuclari');
    
    // Rapor sonuç alanını temizle
    raporSonuclari.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Rapor hazırlanıyor...</p>
        </div>
    `;
    
    // Veri kaynağı hazırla (gerçek uygulamada API isteği olabilir)
    setTimeout(() => {
        switch(raporTuru) {
            case 'cari':
                showCariReport(startDate, endDate);
                break;
            case 'islem':
                showIslemReport(startDate, endDate);
                break;
            case 'borc':
                showBorcAlacakReport(startDate, endDate);
                break;
            case 'vade':
                showVadeReport(startDate, endDate);
                break;
            default:
                raporSonuclari.innerHTML = '<p>Geçersiz rapor türü!</p>';
        }
    }, 1000); // Simülasyon için 1 saniye bekletme
}

/**
 * Cari durum raporu gösterir
 */
function showCariReport(startDate, endDate) {
    // LocalStorage'dan verileri al
    const cariler = JSON.parse(localStorage.getItem('cariler')) || [];
    
    if (cariler.length === 0) {
        document.getElementById('raporSonuclari').innerHTML = '<p>Kayıtlı cari bulunamadı!</p>';
        return;
    }
    
    // Toplam bakiye hesapla
    let toplamBakiye = 0;
    let borcluCariSayisi = 0;
    let alacakliCariSayisi = 0;
    
    cariler.forEach(cari => {
        const bakiye = parseFloat(cari.bakiye) || 0;
        toplamBakiye += bakiye;
        
        if (bakiye < 0) borcluCariSayisi++;
        if (bakiye > 0) alacakliCariSayisi++;
    });
    
    // Rapor HTML'ini oluştur
    const raporHTML = `
        <div class="report-header">
            <h3>Cari Durum Raporu</h3>
            <p>Tarih Aralığı: ${formatDate(startDate)} - ${formatDate(endDate)}</p>
        </div>
        
        <div class="report-summary">
            <div class="summary-card">
                <h4>Toplam Cari</h4>
                <div class="number">${cariler.length}</div>
            </div>
            <div class="summary-card ${toplamBakiye >= 0 ? 'positive' : 'negative'}">
                <h4>Toplam Bakiye</h4>
                <div class="number">${formatCurrency(toplamBakiye)}</div>
            </div>
            <div class="summary-card positive">
                <h4>Alacaklı Cari Sayısı</h4>
                <div class="number">${alacakliCariSayisi}</div>
            </div>
            <div class="summary-card negative">
                <h4>Borçlu Cari Sayısı</h4>
                <div class="number">${borcluCariSayisi}</div>
            </div>
        </div>
        
        <div class="table-container">
            <h4>Cari Listesi</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Cari Kodu</th>
                        <th>Ad Soyad / Firma</th>
                        <th>Bakiye</th>
                        <th>Son İşlem</th>
                    </tr>
                </thead>
                <tbody>
                    ${cariler.map(cari => `
                        <tr class="${parseFloat(cari.bakiye) < 0 ? 'negative-row' : parseFloat(cari.bakiye) > 0 ? 'positive-row' : ''}">
                            <td>${cari.id}</td>
                            <td>${cari.adi}</td>
                            <td>${formatCurrency(cari.bakiye)}</td>
                            <td>${cari.sonIslemTarihi || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="report-actions">
            <button class="btn btn-secondary" onclick="printReport()"><i class="fas fa-print"></i> Yazdır</button>
            <button class="btn btn-primary" onclick="exportReportToExcel()"><i class="fas fa-file-excel"></i> Excel</button>
            <button class="btn btn-info" onclick="exportReportToPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
    `;
    
    document.getElementById('raporSonuclari').innerHTML = raporHTML;
}

/**
 * İşlem raporu gösterir
 */
function showIslemReport(startDate, endDate) {
    // LocalStorage'dan verileri al
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    
    if (islemler.length === 0) {
        document.getElementById('raporSonuclari').innerHTML = '<p>Kayıtlı işlem bulunamadı!</p>';
        return;
    }
    
    // Tarih aralığındaki işlemleri filtrele
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Günün sonuna ayarla
    
    const filtrelenmisIslemler = islemler.filter(islem => {
        const islemTarih = new Date(islem.tarih);
        return islemTarih >= start && islemTarih <= end;
    });
    
    // İşlem istatistiklerini hesapla
    let toplamTahsilat = 0;
    let toplamOdeme = 0;
    
    filtrelenmisIslemler.forEach(islem => {
        if (islem.tur === 'tahsilat') {
            toplamTahsilat += parseFloat(islem.tutar);
        } else {
            toplamOdeme += parseFloat(islem.tutar);
        }
    });
    
    // Rapor HTML'ini oluştur
    const raporHTML = `
        <div class="report-header">
            <h3>İşlem Raporu</h3>
            <p>Tarih Aralığı: ${formatDate(startDate)} - ${formatDate(endDate)}</p>
        </div>
        
        <div class="report-summary">
            <div class="summary-card">
                <h4>Toplam İşlem</h4>
                <div class="number">${filtrelenmisIslemler.length}</div>
            </div>
            <div class="summary-card positive">
                <h4>Toplam Tahsilat</h4>
                <div class="number">${formatCurrency(toplamTahsilat)}</div>
            </div>
            <div class="summary-card negative">
                <h4>Toplam Ödeme</h4>
                <div class="number">${formatCurrency(toplamOdeme)}</div>
            </div>
            <div class="summary-card ${(toplamTahsilat - toplamOdeme) >= 0 ? 'positive' : 'negative'}">
                <h4>Bakiye</h4>
                <div class="number">${formatCurrency(toplamTahsilat - toplamOdeme)}</div>
            </div>
        </div>
        
        <div class="table-container">
            <h4>İşlem Listesi</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>İşlem No</th>
                        <th>Cari</th>
                        <th>Tarih</th>
                        <th>Tür</th>
                        <th>Tutar</th>
                        <th>Açıklama</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtrelenmisIslemler.map(islem => `
                        <tr class="${islem.tur === 'tahsilat' ? 'positive-row' : 'negative-row'}">
                            <td>${islem.id}</td>
                            <td>${islem.cariAdi}</td>
                            <td>${formatDate(islem.tarih)}</td>
                            <td><span class="${islem.tur === 'tahsilat' ? 'status paid' : 'status pending'}">${islem.tur === 'tahsilat' ? 'Tahsilat' : 'Ödeme'}</span></td>
                            <td>${formatCurrency(islem.tutar)}</td>
                            <td>${islem.aciklama || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="report-actions">
            <button class="btn btn-secondary" onclick="printReport()"><i class="fas fa-print"></i> Yazdır</button>
            <button class="btn btn-primary" onclick="exportReportToExcel()"><i class="fas fa-file-excel"></i> Excel</button>
            <button class="btn btn-info" onclick="exportReportToPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
    `;
    
    document.getElementById('raporSonuclari').innerHTML = raporHTML;
}

/**
 * Borç/Alacak raporu gösterir
 */
function showBorcAlacakReport(startDate, endDate) {
    // Bu örnek için basitleştirilmiş rapor
    document.getElementById('raporSonuclari').innerHTML = `
        <div class="report-header">
            <h3>Borç/Alacak Raporu</h3>
            <p>Tarih Aralığı: ${formatDate(startDate)} - ${formatDate(endDate)}</p>
            <p>Bu rapor geliştirme aşamasındadır.</p>
        </div>
    `;
}

/**
 * Vade analizi raporu gösterir
 */
function showVadeReport(startDate, endDate) {
    // Bu örnek için basitleştirilmiş rapor
    document.getElementById('raporSonuclari').innerHTML = `
        <div class="report-header">
            <h3>Vade Analizi Raporu</h3>
            <p>Tarih Aralığı: ${formatDate(startDate)} - ${formatDate(endDate)}</p>
            <p>Bu rapor geliştirme aşamasındadır.</p>
        </div>
    `;
}

/**
 * Raporu oluşturur ve yazdırır
 */
function generateReport() {
    applyReportFilters();
}

/**
 * Raporu yazdırır
 */
function printReport() {
    window.print();
}

/**
 * Raporu Excel formatında dışa aktarır
 */
function exportReportToExcel() {
    alert('Excel dışa aktarma özelliği geliştirme aşamasındadır.');
}

/**
 * Raporu PDF formatında dışa aktarır
 */
function exportReportToPDF() {
    alert('PDF dışa aktarma özelliği geliştirme aşamasındadır.');
}

/**
 * Tarihi formatlar
 * @param {string} dateString - Tarih string'i
 * @returns {string} Formatlanmış tarih
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
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
