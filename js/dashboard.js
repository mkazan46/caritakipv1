/**
 * Dashboard JavaScript Dosyası
 */

/**
 * Anasayfadaki son işlemler tablosunu günceller
 */
function updateDashboardRecentTransactions() {
    const sonIslemlerTablosu = document.getElementById('sonIslemlerTablosu');
    if (!sonIslemlerTablosu) return;
    
    // LocalStorage'dan işlem verilerini al
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    
    // Listeyi temizle
    sonIslemlerTablosu.innerHTML = '';
    
    // Veri yoksa mesaj göster
    if (islemler.length === 0) {
        sonIslemlerTablosu.innerHTML = '<tr><td colspan="6" class="text-center">Kayıtlı işlem bulunamadı.</td></tr>';
        return;
    }
    
    // İşlemleri tarihe göre sırala (en yeniden eskiye)
    const sortedIslemler = islemler
        .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
        .slice(0, 5); // Sadece son 5 işlemi göster
    
    // Son işlemleri listele
    sortedIslemler.forEach(islem => {
        const row = document.createElement('tr');
        const formattedDate = new Date(islem.tarih).toLocaleDateString('tr-TR');
        
        row.innerHTML = `
            <td>${islem.id}</td>
            <td>${islem.cariAdi}</td>
            <td>${formattedDate}</td>
            <td><span class="${islem.tur === 'tahakkuk' ? 'status pending' : 'status paid'}">${islem.tur === 'tahakkuk' ? 'Tahakkuk' : 'Tahsilat'}</span></td>
            <td>${formatCurrency(islem.tutar)}</td>
            <td>${islem.aciklama || '-'}</td>
        `;
        sonIslemlerTablosu.appendChild(row);
    });
}

/**
 * Dashboard kart bilgilerini günceller
 */
function updateDashboardCards() {
    // Cari sayısı
    const cariler = JSON.parse(localStorage.getItem('cariler')) || [];
    const totalCariElement = document.getElementById('totalCariSayisi');
    if (totalCariElement) {
        totalCariElement.textContent = cariler.length;
    }
    
    // İşlem verileri
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    let totalTahakkuk = 0;
    let totalTahsilat = 0;
    
    // Toplam tahakkuk ve tahsilat hesapla
    islemler.forEach(islem => {
        if (islem.tur === 'tahakkuk') {
            totalTahakkuk += parseFloat(islem.tutar);
        } else if (islem.tur === 'tahsilat') {
            totalTahsilat += parseFloat(islem.tutar);
        }
    });
    
    // Tahakkuk toplamını güncelle
    const tahakkukElement = document.getElementById('totalTahakkuk');
    if (tahakkukElement) {
        tahakkukElement.textContent = formatCurrency(totalTahakkuk);
    }
    
    // Tahsilat toplamını güncelle
    const tahsilatElement = document.getElementById('totalTahsilat');
    if (tahsilatElement) {
        tahsilatElement.textContent = formatCurrency(totalTahsilat);
    }
}

/**
 * Aylık işlem grafiğini oluşturur
 */
function createMonthlyTransactionChart() {
    const ctx = document.getElementById('monthlyTransactionChart');
    if (!ctx) return;
    
    // Varolan bir grafik varsa temizle
    if (window.monthlyChart instanceof Chart) {
        window.monthlyChart.destroy();
    }
    
    // Son 6 ayın tarihlerini hazırla
    const months = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
        const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = month.toLocaleString('tr-TR', { month: 'short' });
        months.push(monthName);
    }
    
    // LocalStorage'dan işlem verilerini al
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    
    // Aylara göre tahakkuk ve tahsilat verilerini hazırla
    const tahakkukData = new Array(6).fill(0);
    const tahsilatData = new Array(6).fill(0);
    
    islemler.forEach(islem => {
        const islemDate = new Date(islem.tarih);
        const monthDiff = (currentDate.getFullYear() - islemDate.getFullYear()) * 12 + 
                          (currentDate.getMonth() - islemDate.getMonth());
        
        if (monthDiff >= 0 && monthDiff < 6) {
            const index = 5 - monthDiff;
            if (islem.tur === 'tahakkuk') {
                tahakkukData[index] += parseFloat(islem.tutar);
            } else if (islem.tur === 'tahsilat') {
                tahsilatData[index] += parseFloat(islem.tutar);
            }
        }
    });
    
    // Grafik oluştur
    window.monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Tahakkuk',
                    data: tahakkukData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Tahsilat',
                    data: tahsilatData,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('tr-TR') + ' ₺';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + 
                                   formatCurrency(context.raw);
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

/**
 * Tahakkuk/Tahsilat pasta grafiğini oluşturur
 */
function createTahakkukTahsilatPieChart() {
    const ctx = document.getElementById('tahakkukTahsilatPieChart');
    if (!ctx) return;
    
    // Varolan bir grafik varsa temizle
    if (window.pieChart instanceof Chart) {
        window.pieChart.destroy();
    }
    
    // LocalStorage'dan işlem verilerini al
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    
    // Toplam tahakkuk ve tahsilat hesapla
    let totalTahakkuk = 0;
    let totalTahsilat = 0;
    
    islemler.forEach(islem => {
        if (islem.tur === 'tahakkuk') {
            totalTahakkuk += parseFloat(islem.tutar);
        } else if (islem.tur === 'tahsilat') {
            totalTahsilat += parseFloat(islem.tutar);
        }
    });
    
    // Kalan tahakkuk (tahsil edilmemiş)
    const kalanTahakkuk = Math.max(0, totalTahakkuk - totalTahsilat);
    
    // Grafik oluştur
    window.pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Kalan Tahakkuk', 'Tahsil Edilen'],
            datasets: [{
                data: [kalanTahakkuk, totalTahsilat],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + 
                                  formatCurrency(context.raw) + 
                                  ' (' + Math.round(context.raw / (kalanTahakkuk + totalTahsilat) * 100) + '%)';
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Sayfa yüklendiğinde dashboard bilgilerini güncelle
document.addEventListener('DOMContentLoaded', function() {
    // Dashboard kart bilgilerini güncelle
    updateDashboardCards();
    
    // Son işlemleri göster
    updateDashboardRecentTransactions();
    
    // Grafikleri oluştur
    createMonthlyTransactionChart();
    createTahakkukTahsilatPieChart();
});
