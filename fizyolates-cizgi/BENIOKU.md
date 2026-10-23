# Fizyolates Studio — "Çizgi" sitesi

4 sayfalık, kaydırmayla canlanan statik site. Herhangi bir hostinge klasör
olarak yüklenebilir; ek bir sistem gerektirmez.

```
index.html        Ana sayfa (hareket çizgisi, 6 ilke yatay sergisi, dersler, stüdyo)
hakkimizda.html   Fizyo + Lates, hikâye, değerler, ekip, bir seansın 5 anı
hizmetler.html    5 ders: #klinik-pilates #mat-yogasi #zumba #fizyoterapi #hamile
iletisim.html     Bilgiler, rezervasyon seçici (#rezervasyon), harita, S.S.S. (#sss)
assets/site.css   Renkler (:root), yazı tipleri ve tüm animasyonlar
assets/site.js    Kaydırma, çizgi, yatay sergi, imleç, menü, rezervasyon, akordeon
assets/img/       Logo (kırmızı / beyaz)
```

## Doldurulacaklar
Dosyalarda `[` ile arayın: `[TELEFON]`, `[ADRES]`, `[E-POSTA]`, `[SAAT]`,
`[SÜRE]`, `[X]`, ekip isimleri, kuruluş hikâyesi ve S.S.S. cevapları.

- WhatsApp: `90XXXXXXXXXX` geçen her yere kendi numaranızı yazın
  (başında 90, boşluksuz). Rezervasyon seçicisi mesajı bu numaraya hazırlar.
  `assets/site.js` içinde de bir kez geçer.
- Instagram ve Google Haritalar bağlantıları.

## Fotoğraflar
Görsel alanlar şimdilik soyut kompozisyonlar (`<div class="art">` içindeki
`<svg>`). Fotoğraf çekildiğinde svg yerine şunu koyun:

```html
<img src="assets/img/dosya.jpg" alt="Kısa açıklama" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

Bu tasarımda dikey, sade arka planlı, doğal ışıklı ve az renkli
(bej, beyaz, siyah) fotoğraflar en iyi sonucu verir.

## Hareket
Telefonunda "Hareketi azalt" ayarı açık olan ziyaretçilerde animasyonlar
otomatik kapanır; içerik her zaman okunur kalır.
