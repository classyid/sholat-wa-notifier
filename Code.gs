/**
 * Google Apps Script untuk mengirim jadwal sholat via WhatsApp
 * 
 * Script ini akan mengambil jadwal sholat dari API dan mengirimkannya
 * ke nomor-nomor yang terdaftar di spreadsheet menggunakan WhatsApp API
 */

// ID spreadsheet yang berisi konfigurasi
const SPREADSHEET_ID = '<ID-SPREADSHEET>';

// URL API jadwal sholat
const PRAYER_SCHEDULE_API = 'https://script.google.com/macros/s/AKfycbx8CtuEFQrYxM5sF2pZYvjrcIQa4Mj25lO6BUVqFHrhURw05bg06dBtpeYtvax5NIi1/exec';

// URL API WhatsApp
const WHATSAPP_API = 'https://MPEDIA-WA-GATEWAY';

/**
 * Fungsi untuk membuat sheet jika belum ada
 */
function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Buat sheet configWA jika belum ada
  let configSheet = ss.getSheetByName('configWA');
  if (!configSheet) {
    configSheet = ss.insertSheet('configWA');
    configSheet.appendRow(['key', 'value']);
    configSheet.appendRow(['api_key', '<api-key>']);
    configSheet.appendRow(['sender', '<sender>']);
  }
  
  // Buat sheet kirimSholat jika belum ada
  let recipientSheet = ss.getSheetByName('kirimSholat');
  if (!recipientSheet) {
    recipientSheet = ss.insertSheet('kirimSholat');
    recipientSheet.appendRow(['number', 'keterangan', 'kota']);
    // Contoh nomor (hapus atau ganti sesuai kebutuhan)
    recipientSheet.appendRow(['6281234567890', 'Admin', 'Kediri']);
  }
  
  // Buat sheet waktuKirim jika belum ada
  let scheduleSheet = ss.getSheetByName('waktuKirim');
  if (!scheduleSheet) {
    scheduleSheet = ss.insertSheet('waktuKirim');
    scheduleSheet.appendRow(['jam', 'menit', 'status']);
    scheduleSheet.appendRow(['5', '0', 'aktif']); // Default: kirim jam 5 pagi
  }
}

/**
 * Mendapatkan konfigurasi WhatsApp dari spreadsheet
 */
function getWhatsAppConfig() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const configSheet = ss.getSheetByName('configWA');
  
  if (!configSheet) {
    throw new Error('Sheet configWA tidak ditemukan');
  }
  
  const data = configSheet.getDataRange().getValues();
  const config = {};
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    config[data[i][0]] = data[i][1];
  }
  
  return config;
}

/**
 * Mendapatkan daftar penerima dari spreadsheet
 */
function getRecipients() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const recipientSheet = ss.getSheetByName('kirimSholat');
  
  if (!recipientSheet) {
    throw new Error('Sheet kirimSholat tidak ditemukan');
  }
  
  const data = recipientSheet.getDataRange().getValues();
  const recipients = [];
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    recipients.push({
      number: data[i][0],
      keterangan: data[i][1],
      kota: data[i][2] || 'Kediri' // Default kota: Kediri
    });
  }
  
  return recipients;
}

/**
 * Mendapatkan jadwal sholat dari API
 */
function getPrayerSchedule(kota) {
  const url = `${PRAYER_SCHEDULE_API}?kota=${encodeURIComponent(kota)}`;
  
  try {
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());
    
    if (data.status !== 'success') {
      throw new Error(`Gagal mendapatkan jadwal sholat untuk ${kota}`);
    }
    
    return data.data;
  } catch (error) {
    Logger.log(`Error saat mengambil jadwal sholat: ${error.message}`);
    return null;
  }
}

/**
 * Membuat pesan jadwal sholat yang informatif
 */
function createMessage(scheduleData) {
  if (!scheduleData) return null;
  
  const { kota, tanggal, jadwal } = scheduleData;
  
  return `*JADWAL SHOLAT HARI INI*
📍 *${kota}*
📅 *${tanggal}*

🕒 *Imsyak*: ${jadwal.imsyak} WIB
🕒 *Subuh*: ${jadwal.shubuh} WIB
🌅 *Terbit*: ${jadwal.terbit} WIB
🌞 *Dhuha*: ${jadwal.dhuha} WIB
☀️ *Dzuhur*: ${jadwal.dzuhur} WIB
🌤️ *Ashar*: ${jadwal.ashr} WIB
🌆 *Maghrib*: ${jadwal.magrib} WIB
🌙 *Isya*: ${jadwal.isya} WIB

✨ *Semoga hari ini penuh keberkahan* ✨
💫 Manfaatkan waktu dengan sebaik-baiknya
🤲 Jangan lupa berdoa untuk kebaikan dunia & akhirat

_"Sesungguhnya shalat itu mencegah dari (perbuatan) keji dan mungkar" (QS. Al-Ankabut: 45)_

📲 Pesan otomatis jadwal sholat harian`;
}

/**
 * Mengirim pesan melalui WhatsApp API
 */
function sendWhatsAppMessage(number, message) {
  const config = getWhatsAppConfig();
  
  if (!config.api_key || !config.sender) {
    throw new Error('Konfigurasi WhatsApp tidak lengkap');
  }
  
  const payload = {
    api_key: config.api_key,
    sender: config.sender,
    number: number,
    message: message
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };
  
  try {
    const response = UrlFetchApp.fetch(WHATSAPP_API, options);
    const responseData = JSON.parse(response.getContentText());
    Logger.log(`Respon API WhatsApp: ${JSON.stringify(responseData)}`);
    return responseData;
  } catch (error) {
    Logger.log(`Error saat mengirim pesan WhatsApp: ${error.message}`);
    return null;
  }
}

/**
 * Fungsi utama untuk mengirim jadwal sholat ke semua penerima
 */
function sendPrayerSchedules() {
  try {
    // Pastikan semua sheet sudah ada
    initializeSheets();
    
    // Dapatkan daftar penerima
    const recipients = getRecipients();
    
    if (recipients.length === 0) {
      Logger.log('Tidak ada penerima yang terdaftar');
      return;
    }
    
    // Kirim pesan ke setiap penerima
    for (const recipient of recipients) {
      // Dapatkan jadwal sholat untuk kota penerima
      const scheduleData = getPrayerSchedule(recipient.kota);
      
      if (!scheduleData) {
        Logger.log(`Gagal mendapatkan jadwal sholat untuk ${recipient.kota}`);
        continue;
      }
      
      // Buat pesan
      const message = createMessage(scheduleData);
      
      if (!message) {
        Logger.log('Gagal membuat pesan');
        continue;
      }
      
      // Kirim pesan
      const result = sendWhatsAppMessage(recipient.number, message);
      
      // Catat hasil pengiriman
      Logger.log(`Pesan terkirim ke ${recipient.number} (${recipient.keterangan}): ${result ? 'Berhasil' : 'Gagal'}`);
    }
    
    Logger.log('Selesai mengirim jadwal sholat');
  } catch (error) {
    Logger.log(`Error: ${error.message}`);
  }
}

/**
 * Fungsi untuk menjalankan pengiriman jadwal sholat berdasarkan jadwal
 */
function scheduledSend() {
  // Ambil konfigurasi waktu pengiriman dari spreadsheet
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const scheduleSheet = ss.getSheetByName('waktuKirim');
  
  if (!scheduleSheet) {
    Logger.log('Sheet waktuKirim tidak ditemukan');
    return;
  }
  
  const data = scheduleSheet.getDataRange().getValues();
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const jam = data[i][0];
    const menit = data[i][1];
    const status = data[i][2];
    
    if (status.toLowerCase() !== 'aktif') {
      continue;
    }
    
    // Bandingkan dengan waktu sekarang
    const now = new Date();
    if (now.getHours() == jam && now.getMinutes() == menit) {
      Logger.log(`Menjalankan pengiriman terjadwal: ${jam}:${menit}`);
      sendPrayerSchedules();
    }
  }
}

/**
 * Fungsi untuk setup trigger otomatis setiap menit
 */
function setupTrigger() {
  // Hapus semua trigger yang ada untuk menghindari duplikasi
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'scheduledSend') {
      ScriptApp.deleteTrigger(trigger);
    }
  }
  
  // Buat trigger baru yang berjalan setiap menit
  ScriptApp.newTrigger('scheduledSend')
    .timeBased()
    .everyMinutes(1)
    .create();
    
  Logger.log('Trigger berhasil dibuat. Script akan berjalan setiap menit untuk memeriksa jadwal.');
}

/**
 * Fungsi untuk testing pengiriman
 */
function testSend() {
  try {
    initializeSheets();
    sendPrayerSchedules();
    return "Pesan berhasil dikirim. Silakan periksa log untuk detail.";
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

/**
 * Menu tambahan di Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Jadwal Sholat')
    .addItem('Inisialisasi Sheets', 'initializeSheets')
    .addItem('Setup Trigger Otomatis', 'setupTrigger')
    .addItem('Test Kirim Jadwal Sholat', 'testSend')
    .addToUi();
}
