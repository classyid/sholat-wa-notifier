# 🕌 Jadwal Sholat WhatsApp Notifier

Aplikasi Google Apps Script untuk mengirimkan jadwal sholat harian otomatis melalui WhatsApp. Alat yang sempurna untuk institusi keagamaan, komunitas muslim, atau siapa saja yang ingin mengingatkan jamaah/keluarga/teman tentang waktu sholat.

## ✨ Fitur

- 📅 Pengiriman jadwal sholat harian secara otomatis
- 🌍 Dukungan untuk berbagai kota di Indonesia
- 📱 Integrasi dengan WhatsApp API untuk pengiriman pesan
- ⏰ Pengaturan waktu pengiriman yang fleksibel
- 📊 Manajemen penerima yang mudah menggunakan Google Sheets
- 🔔 Pesan yang informatif dengan format yang menarik

## 🛠️ Teknologi

- Google Apps Script
- Google Sheets sebagai database
- API Jadwal Sholat
- Mpedia API untuk pengiriman WhatsApp

## 📋 Cara Penggunaan

### Persiapan

1. Buat spreadsheet baru 
2. Buka Google Apps Script Editor dari menu Extensions > Apps Script
3. Salin kode dari repository ini ke editor
4. Simpan project dan otorisasi script

### Konfigurasi

1. Jalankan fungsi `initializeSheets()` untuk mengatur sheet yang diperlukan:
   - `configWA`: Berisi konfigurasi API WhatsApp
   - `kirimSholat`: Berisi daftar penerima dan kota mereka
   - `waktuKirim`: Berisi pengaturan waktu pengiriman

2. Isi data penerima di sheet "kirimSholat":
   - `number`: Nomor WhatsApp penerima (format: 628xxx)
   - `keterangan`: Nama atau keterangan penerima
   - `kota`: Nama kota untuk jadwal sholat (default: Kediri)

3. Atur waktu pengiriman di sheet "waktuKirim":
   - `jam`: Jam pengiriman (0-23)
   - `menit`: Menit pengiriman (0-59)
   - `status`: "aktif" untuk mengaktifkan pengiriman

### Menjalankan

1. Jalankan fungsi `setupTrigger()` untuk mengatur trigger otomatis
2. Untuk pengujian manual, jalankan fungsi `testSend()`
3. Setelah setup, script akan memeriksa setiap menit apakah sudah waktunya mengirim pesan

## 📄 API dan Endpoint

### API Jadwal Sholat
```
GET https://script.google.com/macros/s/AKfycbx8CtuEFQrYxM5sF2pZYvjrcIQa4Mj25lO6BUVqFHrhURw05bg06dBtpeYtvax5NIi1/exec?kota={nama_kota}
```

### API WhatsApp
```
POST https://mpedia-wa-gateway/send-message
```

## 🤲 Berkontribusi

Kontribusi selalu diterima! Jika Anda memiliki ide untuk peningkatan atau menemukan bug, silakan buat issue atau pull request.

## 📜 Lisensi

MIT License - Silakan gunakan, modifikasi, dan distribusikan dengan bebas untuk kebaikan umat.

## 🙏 Doa

Semoga aplikasi ini bermanfaat dan menjadi amal jariyah bagi semua yang berkontribusi dan menggunakannya. Aamiin Ya Rabbal Alamin.
