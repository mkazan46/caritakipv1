// Cari listesindeki değişiklikleri dinle
$("#cariListesi").change(function() {
    var cariId = $(this).val();
    if (cariId) {
        getCariDetay(cariId);
        getIslemler(cariId);
        
        // Cari ID'yi işlem formuna ekle
        $("#islemCariId").val(cariId);
    }
});

// Alacak ve tahsilatların listesini güncelle
function getIslemler(cariId) {
    $.ajax({
        type: "POST",
        url: "getIslemler.php",
        data: { cariId: cariId },
        success: function(response) {
            $("#islemlerTablosu").html(response);
        }
    });
}

// Cari detayını güncelle
function getCariDetay(cariId) {
    $.ajax({
        type: "POST",
        url: "getCariDetay.php",
        data: { cariId: cariId },
        success: function(response) {
            var data = JSON.parse(response);
            $("#cariAdi").text(data.adi);
            $("#cariBakiye").text(data.bakiye + " TL");
        }
    });
}