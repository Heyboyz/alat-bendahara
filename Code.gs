const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === "addProfile") return addProfile(data);
    if (action === "editProfile") return editProfile(data);
    if (action === "addTransaction") return addTransaction(data);
    if (action === "editTransaction") return editTransaction(data);
    if (action === "deleteTransaction") return deleteTransaction(data);

    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Action not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === "getProfiles") return getProfiles();
    if (action === "getTransactions") return getTransactions();

    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Action not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.JSON).setHeaders(headers);
}

// ======================== PROFIL ========================

function addProfile(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Profil");
  if (!sheet) throw new Error("Sheet 'Profil' not found");

  const id = "P" + new Date().getTime();
  const nama = data.nama;
  const saldo = data.saldo || 0;

  sheet.appendRow([id, nama, saldo]);
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Profile added", id: id })).setMimeType(ContentService.MimeType.JSON);
}

function editProfile(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Profil");
  if (!sheet) throw new Error("Sheet 'Profil' not found");

  const id_profil = data.id_profil;
  const new_nama = data.new_nama;

  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  let found = false;

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === id_profil) {
      sheet.getRange(i + 1, 2).setValue(new_nama);
      found = true;
      break;
    }
  }

  if (!found) throw new Error("Profile not found");
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Profile updated" })).setMimeType(ContentService.MimeType.JSON);
}

function getProfiles() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Profil");
  if (!sheet) throw new Error("Sheet 'Profil' not found");

  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const profiles = [];

  for (let i = 1; i < values.length; i++) {
    if (values[i][0]) {
      profiles.push({
        id: values[i][0],
        nama: values[i][1],
        saldo: values[i][2]
      });
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, data: profiles })).setMimeType(ContentService.MimeType.JSON);
}

// ======================== TRANSAKSI ========================

function addTransaction(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const transSheet = ss.getSheetByName("Transaksi");
  const profilSheet = ss.getSheetByName("Profil");
  if (!transSheet || !profilSheet) throw new Error("Sheet not found");

  const id = "T" + new Date().getTime();
  const tanggal = new Date().toISOString();
  const id_profil = data.id_profil;
  const jenis = data.jenis; 
  const nominal = parseFloat(data.nominal);
  const keterangan = data.keterangan;

  transSheet.appendRow([id, tanggal, id_profil, jenis, nominal, keterangan]);

  // Update profile balance
  updateProfileBalance(profilSheet, id_profil, jenis, nominal, "add");

  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Transaction added" })).setMimeType(ContentService.MimeType.JSON);
}

function editTransaction(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const transSheet = ss.getSheetByName("Transaksi");
  const profilSheet = ss.getSheetByName("Profil");
  if (!transSheet || !profilSheet) throw new Error("Sheet not found");

  const id_transaksi = data.id_transaksi;
  const new_nominal = parseFloat(data.new_nominal);
  const new_keterangan = data.new_keterangan;

  const dataRange = transSheet.getDataRange();
  const values = dataRange.getValues();
  let found = false;

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === id_transaksi) {
      const id_profil = values[i][2];
      const jenis = values[i][3];
      const old_nominal = parseFloat(values[i][4]);

      // Update row
      transSheet.getRange(i + 1, 5).setValue(new_nominal);
      transSheet.getRange(i + 1, 6).setValue(new_keterangan);

      // Revert old nominal, apply new nominal
      updateProfileBalance(profilSheet, id_profil, jenis, old_nominal, "revert");
      updateProfileBalance(profilSheet, id_profil, jenis, new_nominal, "add");

      found = true;
      break;
    }
  }

  if (!found) throw new Error("Transaction not found");
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Transaction updated" })).setMimeType(ContentService.MimeType.JSON);
}

function deleteTransaction(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const transSheet = ss.getSheetByName("Transaksi");
  const profilSheet = ss.getSheetByName("Profil");
  if (!transSheet || !profilSheet) throw new Error("Sheet not found");

  const id_transaksi = data.id_transaksi;

  const dataRange = transSheet.getDataRange();
  const values = dataRange.getValues();
  let found = false;

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === id_transaksi) {
      const id_profil = values[i][2];
      const jenis = values[i][3];
      const old_nominal = parseFloat(values[i][4]);

      // Revert balance
      updateProfileBalance(profilSheet, id_profil, jenis, old_nominal, "revert");

      // Delete row
      transSheet.deleteRow(i + 1);

      found = true;
      break;
    }
  }

  if (!found) throw new Error("Transaction not found");
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Transaction deleted" })).setMimeType(ContentService.MimeType.JSON);
}

function getTransactions() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Transaksi");
  if (!sheet) throw new Error("Sheet 'Transaksi' not found");

  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const transactions = [];

  for (let i = 1; i < values.length; i++) {
    if (values[i][0]) {
      transactions.push({
        id: values[i][0],
        tanggal: values[i][1],
        id_profil: values[i][2],
        jenis: values[i][3],
        nominal: values[i][4],
        keterangan: values[i][5]
      });
    }
  }

  transactions.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  return ContentService.createTextOutput(JSON.stringify({ success: true, data: transactions })).setMimeType(ContentService.MimeType.JSON);
}

// ======================== HELPERS ========================

function updateProfileBalance(profilSheet, id_profil, jenis, nominal, action) {
  const dataRange = profilSheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === id_profil) {
      let currentSaldo = parseFloat(values[i][2]) || 0;
      
      if (action === "add") {
        if (jenis === "Debit") currentSaldo -= nominal; // Pengeluaran (Makan)
        else if (jenis === "Kredit") currentSaldo += nominal; // Pemasukan (Topup)
      } else if (action === "revert") {
        if (jenis === "Debit") currentSaldo += nominal; // Batal Pengeluaran
        else if (jenis === "Kredit") currentSaldo -= nominal; // Batal Topup
      }
      
      profilSheet.getRange(i + 1, 3).setValue(currentSaldo);
      return;
    }
  }
  throw new Error("Profile not found when updating balance");
}
