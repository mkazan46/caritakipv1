<button id="yeniIslemEkle" class="btn btn-success">Yeni İşlem Ekle</button>

<script>
$(document).ready(function() {
    $("#yeniIslemEkle").click(function() {
        var cariId = $("#cariListesi").val();
        if (!cariId) {
            alert("Lütfen önce bir cari hesap seçin!");
            return;
        }
        
        $("#yeniIslemModal").modal("show");
    });
    
    $("#yeniIslemForm").submit(function(e) {
        e.preventDefault();
        
        $.ajax({
            type: "POST",
            url: "yeniIslemEkle.php",
            data: $(this).serialize(),
            success: function(response) {
                var data = JSON.parse(response);
                if (data.status == "success") {
                    alert("İşlem başarıyla kaydedildi!");
                    $("#yeniIslemModal").modal("hide");
                    var cariId = $("#cariListesi").val();
                    getIslemler(cariId);
                    getCariDetay(cariId);
                } else {
                    alert("Hata: " + data.message);
                }
            }
        });
    });
});
</script>

<div class="modal fade" id="yeniIslemModal" tabindex="-1" role="dialog" aria-labelledby="yeniIslemModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="yeniIslemModalLabel">Yeni Alacak ve Tahsilat Ekle</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <form id="yeniIslemForm">
          <input type="hidden" name="cariId" id="islemCariId">
          
          <div class="form-group">
            <label for="islemTarihi">İşlem Tarihi</label>
            <input type="date" class="form-control" id="islemTarihi" name="islemTarihi" required value="<?php echo date('Y-m-d'); ?>">
          </div>
          
          <div class="form-group">
            <label for="islemTuru">İşlem Türü</label>
            <select class="form-control" id="islemTuru" name="islemTuru" required>
              <option value="Alacak">Alacak</option>
              <option value="Tahsilat">Tahsilat</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="islemTutari">Tutar</label>
            <input type="number" step="0.01" class="form-control" id="islemTutari" name="islemTutari" required>
          </div>
          
          <div class="form-group">
            <label for="islemAciklama">Açıklama</label>
            <textarea class="form-control" id="islemAciklama" name="islemAciklama" rows="3"></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary">Kaydet</button>
        </form>
      </div>
    </div>
  </div>
</div>