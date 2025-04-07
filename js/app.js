/**
 * Cari Takip Sistemi Ana JavaScript Dosyası
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Cari Takip Sistemi başlatılıyor...');
    
    // İlk olarak manifest sorununu çözmeye çalış
    fixManifestIcons();
    
    // Eksik resim hatalarını kontrol et
    preloadRequiredImages();
    
    // Eksik resim dosyalarını kontrol et ve hata yönetimi ekle
    handleMissingResources();
    
    // PWA manifest kontrolü
    checkManifestIcons();
    
    // Ana uygulama başlangıç noktası
    initApp();
    
    // Sayfa geçişlerini ayarla
    setupNavigation();
    
    // Modal pencereler için event listener'lar
    setupModals();
    
    // Tab sistemini ayarla
    setupTabs();
    
    // Eksik ikonlar için uyarı
    checkMissingIcons();
    
    // Aylık işlem grafiğini oluştur
    createMonthlyTransactionChart();
});

/**
 * Manifest ikonlarını düzeltmeye çalışır
 */
function fixManifestIcons() {
    // Manifest dosyasının linkini kontrol et
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
        console.log('Manifest linki bulunamadı, ekleniyor...');
        manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = './manifest.json';
        document.head.appendChild(manifestLink);
    }
    
    // İkonları doğrudan HTML'e ekleyerek yedekleme yap
    const iconLinks = [
        { rel: 'icon', href: './favicon.ico', sizes: '16x16', type: 'image/x-icon' },
        { rel: 'apple-touch-icon', href: './img/icon-192x192.png' },
        { rel: 'icon', href: './img/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { rel: 'icon', href: './img/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ];
    
    iconLinks.forEach(icon => {
        if (!document.querySelector(`link[rel="${icon.rel}"][href="${icon.href}"]`)) {
            const link = document.createElement('link');
            link.rel = icon.rel;
            link.href = icon.href;
            if (icon.sizes) link.sizes = icon.sizes;
            if (icon.type) link.type = icon.type;
            document.head.appendChild(link);
        }
    });
    
    // Base64 formatında yedek ikonlar oluştur
    createFallbackIcons();
}

/**
 * Yedek ikonlar oluşturur
 */
function createFallbackIcons() {
    // Base64 formatında basit SVG ikon
    const svgIcon192 = `
        <svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
            <rect width="192" height="192" fill="#2c3e50"/>
            <circle cx="96" cy="96" r="64" fill="#3498db"/>
            <text x="96" y="96" font-family="Arial" font-size="64" 
                font-weight="bold" fill="white" text-anchor="middle" dy="22">CT</text>
        </svg>
    `;
    
    const svgIcon512 = `
        <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
            <rect width="512" height="512" fill="#2c3e50"/>
            <circle cx="256" cy="256" r="170" fill="#3498db"/>
            <text x="256" y="256" font-family="Arial" font-size="170" 
                font-weight="bold" fill="white" text-anchor="middle" dy="60">CT</text>
        </svg>
    `;
    
    // Base64'e çevirip tarayıcı ön belleğine kaydet
    const base64Icon192 = btoa(svgIcon192);
    const base64Icon512 = btoa(svgIcon512);
    
    // Yedek ikonları ön belleğe al
    localStorage.setItem('fallbackIcon192', `data:image/svg+xml;base64,${base64Icon192}`);
    localStorage.setItem('fallbackIcon512', `data:image/svg+xml;base64,${base64Icon512}`);
}

/**
 * Gerekli resimlerin yüklenmesini kontrol eder
 */
function preloadRequiredImages() {
    const requiredImages = [
        './img/user.png',
        './img/icon-192x192.png',
        './img/icon-512x512.png'
    ];

    requiredImages.forEach(src => {
        const img = new Image();
        img.onerror = function() {
            console.warn(`Resim dosyası yüklenemedi: ${src}, yedek kullanılıyor...`);
            if (src.includes('user.png')) {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM5NWE1YTYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIyNSIgZmlsbD0iI2VjZjBmMSIvPjxwYXRoIGQ9Ik01MCA1MGMtMjAgMC0zNSAxNS0zNSA1MHMxNSAzNSA1MCAzNSA1MC0xNSAzNS01MC0zNXoiIGZpbGw9IiNlY2YwZjEiLz48L3N2Zz4=';
            }
        };
        img.src = src;
    });
}

/**
 * Manifest içindeki ikonu değiştirir
 */
function replaceManifestIcon(iconName, base64Data) {
    // İlgili link elementini bul ve src'sini değiştir
    const links = document.querySelectorAll(`link[href*="${iconName}"]`);
    links.forEach(link => {
        if (base64Data) {
            link.href = base64Data;
            console.log(`İkon değiştirildi: ${iconName}`);
        }
    });
}

/**
 * Resim hatasını gösterir
 */
function showImageError(src) {
    // Eğer bu resim için daha önce hata gösterilmişse tekrar gösterme
    if (sessionStorage.getItem(`error-shown-${src}`)) return;
    
    const warningDiv = document.createElement('div');
    warningDiv.style.cssText = 'position:fixed;bottom:70px;right:10px;background:#fff3cd;color:#856404;padding:12px;border-radius:5px;z-index:9999;box-shadow:0 2px 5px rgba(0,0,0,0.1);max-width:300px;font-size:13px;';
    
    let dosyaYolu = src;
    if (src.startsWith('./')) {
        dosyaYolu = src.substring(2); // Başındaki ./ işaretini kaldır
    } else if (src.startsWith('/')) {
        dosyaYolu = src.substring(1); // Başındaki / işaretini kaldır
    }
    
    warningDiv.innerHTML = `
        <strong>Resim dosyası bulunamadı!</strong>
        <p>${dosyaYolu}</p>
        <code style="display:block;background:#f8f8f8;padding:5px;margin:5px 0;border-radius:3px;word-break:break-all;">
            ${window.location.origin}/${dosyaYolu}
        </code>
        <p style="margin-top:5px;margin-bottom:0">Bu dosyayı oluşturmalısınız.</p>
        <div style="text-align:right;margin-top:8px;">
            <button onclick="this.parentNode.parentNode.style.display='none';sessionStorage.setItem('error-shown-${src}', '1');" 
                style="background:none;border:none;text-decoration:underline;cursor:pointer;color:#0366d6;">
                Kapat
            </button>
        </div>
    `;
    
    document.body.appendChild(warningDiv);
}

/**
 * Eksik kaynakları yönetir
 */
function handleMissingResources() {
    // Eksik resim dosyalarını işle
    const imgElements = document.querySelectorAll('img');
    imgElements.forEach(img => {
        img.onerror = function() {
            // Eksik resimler için yedek görüntü
            this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItaW1hZ2UiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcG9seWxpbmU+PC9zdmc+';
            console.log('Resim dosyası yüklenemedi:', this.getAttribute('src'));
        };
    });
    
    // Favicon hatalarını önle
    const faviconLink = document.querySelector('link[rel="icon"]');
    if (faviconLink) {
        faviconLink.onerror = function() {
            // Base64 formatında varsayılan favicon
            this.href = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJkzMwWZMzMymTMzZpkzM5SZMzOrmTMzt5kzM7eZMzOrmTMzlJkzM2aZMzMymTMzBQAAAAAAAAAAAAAAAAAAAAAAAAAAmTMzKZkzM56ZMzP0mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz9JkzM56ZMzMpAAAAAAAAAAAAAAAAmTMzBpkzM5+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMzn5kzMwYAAAAAAAAAAJkzM0CZMzP0mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/SZMzNAAAAAAJkzMwiZMzOimTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMzopkzMwiZMzMymTMz9JkzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/SZMzMymTMza5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMza5kzM5OZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzM5OZMzOsmTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzOsmTMzt5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMzt5kzM7eZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM7eZMzOsmTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzOsmTMzlJkzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMzlJkzM2eZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM/+ZMzP/mTMz/5kzM2c=';
            console.log('Favicon yüklenemedi.');
        };
    }
}

/**
 * Manifest ikonlarını kontrol eder
 */
function checkManifestIcons() {
    // PWA için manifest ikonlarını yükleme durumunu kontrol et
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Manifest.json'daki ikonların varlığını test et
            const iconTest = new Image();
            
            iconTest.onload = function() {
                console.log('PWA ikonu başarıyla yüklendi.');
            };
            
            iconTest.onerror = function() {
                console.warn('PWA ikonu bulunamadı: icon-192x192.png. Manifest özelliklerinde sorun olabilir.');
                showManifestWarning();
                
                // Yedek ikonu kullan
                const fallbackIcon = localStorage.getItem('fallbackIcon192');
                if (fallbackIcon) {
                    replaceManifestIcon('icon-192x192.png', fallbackIcon);
                }
            };
            
            iconTest.src = './img/icon-192x192.png'; // Göreceli yolu düzelttim
        });
    }
}

/**
 * Manifest ikonu eksikse kullanıcıya bilgi gösterir
 */
function showManifestWarning() {
    // Sadece geliştirme ortamında göster
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const warning = document.createElement('div');
        warning.style.cssText = 'position:fixed; bottom:10px; right:10px; background:#fff3cd; color:#856404; padding:10px; border-radius:5px; font-size:12px; z-index:9999; box-shadow:0 2px 10px rgba(0,0,0,0.1);';
        warning.innerHTML = `
            <strong>Manifest İkonu Eksik!</strong>
            <p>İkonlar oluşturmak için <a href="create-icons.html" target="_blank">İkon Oluşturucu</a>'yu kullanabilirsiniz.</p>
            <button onclick="this.parentNode.style.display='none'" style="background:none; border:none; text-decoration:underline; cursor:pointer; float:right;">Kapat</button>
        `;
        document.body.appendChild(warning);
    }
}

/**
 * Sidebar açma/kapama işlevselliğini ayarlar
 */
function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const container = document.querySelector('.container');
    const swipeArea = document.getElementById('sidebar-swipe-area');
    const contentMain = document.querySelector('main.content'); // Ana içerik alanını seç
    
    // Mobil genişlik tespiti için medya sorgusu
    const mobileMediaQuery = window.matchMedia('(max-width: 991px)');
    
    // Toggle sidebar butonu
    toggleSidebarBtn.addEventListener('click', function() {
        toggleSidebar();
    });
    
    // Sidebar'ı kapatan overlayi dinle
    sidebarOverlay.addEventListener('click', function() {
        closeSidebar();
    });
    
    // Sidebar içindeki kapat butonunu dinle (mobil)
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', function() {
            closeSidebar();
        });
    }
    
    // Kaydırma hareketleri (swipe) ile açma-kapama desteği
    setupSwipeGestures(swipeArea, sidebar);
    
    // Sidebar içindeki menü öğelerine tıklayınca mobilde otomatik kapama
    const menuItems = sidebar.querySelectorAll('nav ul li');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            if (mobileMediaQuery.matches) {
                closeSidebar();
            }
        });
    });
    
    // Ekran boyutu değişikliklerini dinle
    mobileMediaQuery.addEventListener('change', function(e) {
        if (!e.matches) {
            // Masaüstü boyutuna geçildiğinde overlay'i kaldır
            sidebarOverlay.classList.remove('active');
            document.body.classList.remove('sidebar-open'); // Body scroll kilidini kaldır
        }
    });
    
    /**
     * Sidebar'ı aç veya kapat
     */
    function toggleSidebar() {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
        toggleSidebarBtn.classList.toggle('active');
        
        // Body scroll kilidini kontrol et
        if (sidebar.classList.contains('active') && mobileMediaQuery.matches) {
            document.body.classList.add('sidebar-open');
            
            // Scroll pozisyonunu kaydet
            document.body.dataset.scrollY = window.scrollY;
        } else {
            document.body.classList.remove('sidebar-open');
            
            // Eski scroll pozisyonunu geri yükle
            if (document.body.dataset.scrollY) {
                window.scrollTo(0, parseInt(document.body.dataset.scrollY || '0'));
            }
        }
        
        // Masaüstü modunda content margin'ini ayarla
        if (!mobileMediaQuery.matches) {
            // Container sınıfını togglela
            container.classList.toggle('sidebar-collapsed');
            
            // Ana içerik alanını da güncelle (işte burada body > div.container.sidebar-collapsed > main kısmını dinamik hale getiriyoruz)
            if (contentMain) {
                if (container.classList.contains('sidebar-collapsed')) {
                    contentMain.classList.add('sidebar-collapsed-content');
                } else {
                    contentMain.classList.remove('sidebar-collapsed-content');
                }
            }
        }
    }
    
    /**
     * Sidebar'ı kapat
     */
    function closeSidebar() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        toggleSidebarBtn.classList.remove('active');
        
        // Body scroll kilidini kaldır
        document.body.classList.remove('sidebar-open');
        
        // Eski scroll pozisyonunu geri yükle
        if (document.body.dataset.scrollY) {
            window.scrollTo(0, parseInt(document.body.dataset.scrollY || '0'));
        }
    }
}

/**
 * Dokunmatik kaydırma hareketlerini ayarlar
 * @param {HTMLElement} swipeArea - Kaydırma algılama alanı
 * @param {HTMLElement} sidebar - Sidebar elementi
 */
function setupSwipeGestures(swipeArea, sidebar) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Kaydırma alanında dokunma başlangıcını algılama
    swipeArea.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    // Kaydırma alanında dokunma bitişini algılama
    swipeArea.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    // Ana ekranda sağdan sola kaydırma ile menü kapatma
    document.addEventListener('touchstart', function(e) {
        if (sidebar.classList.contains('active')) {
            touchStartX = e.changedTouches[0].screenX;
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        if (sidebar.classList.contains('active')) {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 70) {
                // Sağdan sola kaydırma - menüyü kapat
                sidebar.classList.remove('active');
                document.getElementById('sidebar-overlay').classList.remove('active');
                document.getElementById('toggle-sidebar').classList.remove('active');
            }
        }
    }, { passive: true });
    
    // Kaydırma hareketini işle
    function handleSwipe() {
        const swipeThreshold = 70;
        
        if (touchEndX - touchStartX > swipeThreshold) {
            // Soldan sağa kaydırma - menüyü aç
            sidebar.classList.add('active');
            document.getElementById('sidebar-overlay').classList.add('active');
            document.getElementById('toggle-sidebar').classList.add('active');
        }
    }
}

/**
 * Uygulama başlatma fonksiyonu
 */
function initApp() {
    // Örnek verileri yükle
    loadSampleData();
    
    // Kullanıcı tercihlerini uygula
    applyUserPreferences();
    
    // Sidebar ayarlarını yap
    setupSidebar();
    
    // Diğer mobil arayüz bileşenlerini ayarla
    setupMobileUI();
    
    // Ekran boyutu değişikliklerini dinle
    handleScreenSizeChanges();
    
    // Anasayfa işlemlerini güncelle
    updateDashboardRecentTransactions();
}

/**
 * Mobil arayüz bileşenlerini ayarlar
 */
function setupMobileUI() {
    // Mobil arama toggle butonu
    const searchToggle = document.querySelector('.search-toggle');
    if (searchToggle) {
        searchToggle.addEventListener('click', function() {
            document.querySelector('.search-box').classList.toggle('active');
        });
    }
    
    // Dropdown menüler için tıkla-göster davranışı
    const dropdownButtons = document.querySelectorAll('.dropdown .btn');
    dropdownButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const dropdown = this.closest('.dropdown');
            dropdown.classList.toggle('active');
        });
    });
    
    // Dropdown dışına tıklanınca kapat
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown.active').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        // Arama kutusunu da kapat (eğer aktifse)
        const searchBox = document.querySelector('.search-box.active');
        if (searchBox) searchBox.classList.remove('active');
    });
}

/**
 * Ekran boyutu değişikliklerini yönetir
 */
function handleScreenSizeChanges() {
    const mediaQuery = window.matchMedia('(min-width: 992px)');
    
    // Ekran boyutu değişince kontrol et
    mediaQuery.addEventListener('change', function(e) {
        adjustForScreenSize(e.matches);
    });
    
    // Sayfa yüklendiğinde kontrol et
    adjustForScreenSize(mediaQuery.matches);
}

/**
 * Ekran boyutuna göre UI'ı ayarlar
 * @param {boolean} isDesktop - Ekran boyutu masaüstü mü?
 */
function adjustForScreenSize(isDesktop) {
    const container = document.querySelector('.container');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const contentMain = document.querySelector('main.content'); // Ana içerik alanını seç
    
    if (isDesktop) {
        // Masaüstü görünümde
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        container.classList.remove('sidebar-collapsed');
        
        // Ana içerik alanını da güncelle
        if (contentMain) {
            contentMain.classList.remove('sidebar-collapsed-content');
        }
    } else {
        // Mobil görünümde
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        container.classList.add('sidebar-collapsed');
        
        // Ana içerik alanını da güncelle
        if (contentMain) {
            contentMain.classList.add('sidebar-collapsed-content');
        }
    }
}

/**
 * Menü navigasyonu için gerekli event listener'ları ayarlar
 */
function setupNavigation() {
    const menuItems = document.querySelectorAll('nav ul li');
    const pages = document.querySelectorAll('.page');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Aktif menü öğesini değiştir
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Sayfa başlığını güncelle
            const pageId = this.getAttribute('data-page');
            document.querySelector('.page-title').textContent = this.textContent.trim();
            
            // İlgili sayfayı göster
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === pageId) {
                    page.classList.add('active');
                }
            });
        });
    });
}

/**
 * Modal pencereleri için event listener'ları ayarlar
 */
function setupModals() {
    // Yeni Cari Ekle modal
    const yeniCariModal = document.getElementById('yeniCariModal');
    const yeniCariEkleBtn = document.getElementById('yeniCariEkle');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const iptalCariBtn = document.getElementById('iptalCari');
    
    // Yeni cari ekleme formunu aç
    if (yeniCariEkleBtn) {
        yeniCariEkleBtn.addEventListener('click', function() {
            yeniCariModal.style.display = 'block';
        });
    }
    
    // Modal kapatma butonları
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // İptal butonu
    if (iptalCariBtn) {
        iptalCariBtn.addEventListener('click', function() {
            yeniCariModal.style.display = 'none';
        });
    }
    
    // Modal dışına tıklayınca kapat
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

/**
 * Tab sistemini ayarlar
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Tab butonlarının aktiflik durumunu değiştir
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // İlgili içeriği göster
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

/**
 * Veritabanından verileri yükler
 */
function loadSampleData() {
    // Cari listesi için localStorage'dan verileri al
    const cariListesi = document.getElementById('cariListesi');
    if (cariListesi) {
        // LocalStorage'dan kayıtlı carileri al
        const cariler = JSON.parse(localStorage.getItem('cariler')) || [];
        
        cariListesi.innerHTML = '';
        
        // Eğer hiç cari yoksa bilgi mesajı göster
        if (cariler.length === 0) {
            cariListesi.innerHTML = '<tr><td colspan="7" class="text-center">Kayıtlı cari bulunamadı. Yeni bir cari eklemek için "Yeni Cari Ekle" butonunu kullanabilirsiniz.</td></tr>';
            return;
        }
        
        // Carileri listede göster
        cariler.forEach(cari => {
            const bakiye = typeof cari.bakiye === 'string' ? cari.bakiye : formatCurrency(cari.bakiye || 0);
            const sonIslem = cari.sonIslemTarihi || cari.kayitTarihi || '-';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cari.id}</td>
                <td>${cari.adi}</td>
                <td>${cari.telefon || '-'}</td>
                <td>${cari.eposta || '-'}</td>
                <td class="${bakiye.includes('-') ? 'text-danger' : 'text-success'}">${bakiye}</td>
                <td>${sonIslem}</td>
                <td>
                    <button class="btn btn-sm btn-info" title="Detay" onclick="showCariDetail('${cari.id}')"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-sm btn-primary" title="Düzenle" onclick="editCari('${cari.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" title="Sil" onclick="deleteCari('${cari.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            cariListesi.appendChild(row);
        });
    }
    
    // İşlem listesi için localStorage'dan verileri al
    const islemListesi = document.getElementById('islemListesi');
    if (islemListesi) {
        // LocalStorage'dan kayıtlı işlemleri al (eğer uygulanabilirse)
        const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
        
        islemListesi.innerHTML = '';
        
        // Eğer hiç işlem yoksa bilgi mesajı göster
        if (islemler.length === 0) {
            islemListesi.innerHTML = '<tr><td colspan="7" class="text-center">Kayıtlı işlem bulunamadı. Yeni bir işlem kaydetmek için "Yeni İşlem" butonunu kullanabilirsiniz.</td></tr>';
            return;
        }
        
        // İşlemleri listele
        islemler.forEach(islem => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${islem.id}</td>
                <td>${islem.cariAdi || islem.cari}</td>
                <td>${islem.tarih}</td>
                <td><span class="${islem.tur === 'Tahsilat' ? 'status paid' : 'status pending'}">${islem.tur}</span></td>
                <td>${islem.tutar}</td>
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
 * Kullanıcı tercihlerini uygular
 */
function applyUserPreferences() {
    // Tema tercihini localStorage'den al
    const theme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', theme);
    
    // Diğer tercihler için gerekli kodlar buraya eklenebilir
}

/**
 * Eksik ikonları kontrol eder ve kullanıcıya bilgi verir
 */
function checkMissingIcons() {
    const requiredIcons = [
        './img/icon-192x192.png',
        './img/icon-512x512.png'
    ];

    requiredIcons.forEach(icon => {
        const img = new Image();
        img.onerror = function() {
            console.warn(`Eksik ikon tespit edildi: ${icon}`);
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                const warningDiv = document.createElement('div');
                warningDiv.style.cssText = 'position:fixed;bottom:10px;right:10px;background:#fff3cd;color:#856404;padding:10px;border-radius:5px;z-index:9999;box-shadow:0 2px 5px rgba(0,0,0,0.1);max-width:300px;font-size:12px;';
                warningDiv.innerHTML = `
                    <strong>Eksik İkon Tespit Edildi!</strong>
                    <p>${icon} dosyası bulunamadı.</p>
                    <p>Eksik ikonları oluşturmak için:</p>
                    <pre style="background:#f8f9fa;padding:5px;">node create-icons.js</pre>
                    <button onclick="this.parentNode.style.display='none'" style="background:none;border:none;text-decoration:underline;cursor:pointer;float:right;">Kapat</button>
                `;
                document.body.appendChild(warningDiv);
            }
        };
        img.src = icon;
    });
}

/**
 * Anasayfadaki son işlemler tablosunu günceller
 */
function updateDashboardRecentTransactions() {
    // LocalStorage'dan işlem verilerini al
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    const tableBody = document.querySelector('#anasayfa .dashboard-charts div:nth-child(1) .data-table tbody');
    
    if (!tableBody) return;
    
    // Tabloyu temizle
    tableBody.innerHTML = '';
    
    // Veri yoksa bilgi mesajı göster
    if (islemler.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="4" class="text-center">Henüz işlem kaydı bulunmamaktadır.</td>';
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Son 5 işlemi göster (en yeni tarihten başlayarak)
    islemler
        .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
        .slice(0, 5)
        .forEach(islem => {
            const row = document.createElement('tr');
            
            // Tarih formatını düzenle
            let tarih = islem.tarih;
            if (tarih && tarih.includes('-')) {
                const dateParts = islem.tarih.split('-');
                tarih = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
            }
            
            // İşlem türüne göre durum sınıfını belirle
            const statusClass = islem.tur === 'tahsilat' ? 'paid' : 'pending';
            const statusText = islem.tur === 'tahsilat' ? 'Tahsilat' : 'Ödeme';
            
            row.innerHTML = `
                <td>${islem.cariAdi}</td>
                <td>${tarih}</td>
                <td>${formatCurrency(islem.tutar)}</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
            `;
            
            tableBody.appendChild(row);
        });
}

/**
 * Anasayfadaki aylık işlem grafiğini oluşturur
 */
function createMonthlyTransactionChart() {
    // Chart.js kütüphanesinin yüklü olup olmadığını kontrol et
    if (typeof Chart === 'undefined') {
        // Chart.js yüklü değilse, dinamik olarak yükle
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = initializeChart;
        document.head.appendChild(script);
    } else {
        // Chart.js zaten yüklü ise, doğrudan grafik oluştur
        initializeChart();
    }
    
    // Grafik oluşturma işlemi
    function initializeChart() {
        // LocalStorage'dan işlem verilerini al
        const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
        
        // Eğer veri yoksa, bilgi mesajı göster
        const chartContainer = document.querySelector('#anasayfa .dashboard-charts div:nth-child(2) .chart-placeholder');
        if (!chartContainer) return;
        
        if (islemler.length === 0) {
            chartContainer.innerHTML = `
                <i class="fas fa-chart-bar"></i>
                <p>Henüz işlem kaydı bulunmamaktadır.</p>
            `;
            return;
        }
        
        // Son 6 ay için veri hazırla
        const today = new Date();
        const months = [];
        const tahsilatData = [];
        const odemeData = [];
        
        // Son 6 ayın isimlerini ve tarih aralıklarını hazırla
        for (let i = 5; i >= 0; i--) {
            const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = month.toLocaleString('tr-TR', { month: 'short' });
            months.push(monthName);
            
            const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
            const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
            
            // Bu ay içindeki tahsilat ve ödemeleri topla
            let tahsilatTotal = 0;
            let odemeTotal = 0;
            
            islemler.forEach(islem => {
                const islemDate = new Date(islem.tarih);
                
                if (islemDate >= firstDay && islemDate <= lastDay) {
                    const tutar = parseFloat(islem.tutar) || 0;
                    
                    if (islem.tur.toLowerCase() === 'tahsilat') {
                        tahsilatTotal += tutar;
                    } else {
                        odemeTotal += tutar;
                    }
                }
            });
            
            tahsilatData.push(tahsilatTotal);
            odemeData.push(odemeTotal);
        }
        
        // Grafik oluşturmak için canvas hazırla
        chartContainer.innerHTML = '<canvas id="monthlyTransactionChart"></canvas>';
        const ctx = document.getElementById('monthlyTransactionChart').getContext('2d');
        
        // Grafik oluştur
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Tahsilat',
                        data: tahsilatData,
                        backgroundColor: 'rgba(46, 204, 113, 0.5)',
                        borderColor: 'rgba(46, 204, 113, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Ödeme',
                        data: odemeData,
                        backgroundColor: 'rgba(231, 76, 60, 0.5)',
                        borderColor: 'rgba(231, 76, 60, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('tr-TR', { 
                                    style: 'currency', 
                                    currency: 'TRY',
                                    maximumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + new Intl.NumberFormat('tr-TR', { 
                                    style: 'currency', 
                                    currency: 'TRY',
                                    minimumFractionDigits: 2
                                }).format(context.raw);
                            }
                        }
                    }
                }
            }
        });
    }
}
