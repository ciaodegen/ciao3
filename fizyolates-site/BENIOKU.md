# Fizyolates Studio — yeni site

4 sayfalık, hareketli, mobil uyumlu statik site. Herhangi bir hostinge
(veya WordPress yerine doğrudan sunucuya) klasör olarak yüklenebilir.

```
index.html        Ana sayfa
hakkimizda.html   Hakkımızda
hizmetler.html    Hizmetler (her ders için ayrı bölüm: #klinik-pilates, #mat-yogasi, #zumba, #fizyoterapi, #hamile)
iletisim.html     İletişim, form, çalışma saatleri, S.S.S. (#form, #sss)
assets/site.css   Tüm renkler, yazı tipleri ve animasyonlar
assets/site.js    Kaydırma animasyonları, menü, akordeon, form
assets/img/       Logo (kırmızı / beyaz) ve fotoğraflar
```

## Doldurulması gerekenler

Köşeli parantezli her şey sizin bilginizle değişmeli. Dosyalarda `[` ile arayın:

- `[TELEFON]`, `[ADRES]`, `[E-POSTA]`, `[SAAT]`, `@[kullanıcı adı]`
- `[X]` (ders süresi, grup kişi sayısı)
- S.S.S. cevapları ve Hakkımızda'daki kuruluş hikâyesi
- Ekip isimleri ve unvanları
- WhatsApp bağlantısı: `https://wa.me/90XXXXXXXXXX` → kendi numaranız (başında 90, boşluksuz)
- Instagram ve Google Haritalar bağlantıları

## Fotoğraflar

"Fotoğraf: …" yazan her alan bir yer tutucu. Kendi fotoğrafınızı
`assets/img/` içine koyup ilgili `<div class="ph" …>…</div>` satırını
şununla değiştirin:

```html
<img src="assets/img/dosya-adi.jpg" alt="Fotoğrafı anlatan kısa cümle" style="width:100%;height:100%;object-fit:cover">
```

Öneri: doğal ışıkta, sıcak tonlarda, dikey (portre) çekimler en iyi sonucu verir.
Kemer çerçeveli alanlar dikey fotoğraflarla daha şık durur.

## Form

İletişim formu şu an taslak modunda (gönderince teşekkür mesajı gösterir).
Gerçek kullanım için Formspree, Getform veya hostinginizin form hizmetine
bağlanmalı: `<form class="form-card" data-demo>` satırına `action="..."` ve
`method="post"` eklenir, `data-demo` kaldırılır.

## Renkleri değiştirmek

`assets/site.css` dosyasının en üstündeki `:root` bölümünde tüm renkler tek
yerde: `--brick` (kiremit kırmızı), `--mint` (nane), `--blush` (pudra) vb.

Telefonunda "Hareketi azalt" ayarı açık olan ziyaretçilerde animasyonlar
otomatik olarak kapanır.
