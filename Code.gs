const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === "addProfile") {
      return addProfile(data);
    } else if (action === "addTransaction") {
      return addTransaction(data);
    }

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

    if (action === "getProfiles") {
      return getProfiles();
    } else if (action === "getTransactions") {
      return getTransactions();
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Action not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// OPTIONS handle for CORS preflight
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}

// Function to add a profile
function addProfile(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Profil");
  if (!sheet) throw new Error("Sheet 'Profil' not found");

  const id = "P" + new Date().getTime();
  const nama = data.nama;
  const saldo = data.saldo || 0;

  sheet.appendRow([id, nama, saldo]);

  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Profile added", id: id }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Function to add a transaction (Debit for meals, Kredit for topup)
function addTransaction(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const transSheet = ss.getSheetByName("Transaksi");
  const profilSheet = ss.getSheetByName("Profil");

  if (!transSheet || !profilSheet) throw new Error("Sheet 'Transaksi' or 'Profil' not found");

  const id = "T" + new Date().getTime();
  const tanggal = new Date().toISOString();
  const id_profil = data.id_profil;
  const jenis = data.jenis; // "Debit" atau "Kredit"
  const nominal = parseFloat(data.nominal);
  const keterangan = data.keterangan;

  // Append transaction
  transSheet.appendRow([id, tanggal, id_profil, jenis, nominal, keterangan]);

  // Update profile balance
  const dataRange = profilSheet.getDataRange();
  const values = dataRange.getValues();
  let found = false;

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === id_profil) {
      let currentSaldo = parseFloat(values[i][2]) || 0;
      if (jenis === "Debit") {
        currentSaldo -= nominal;
      } else if (jenis === "Kredit") {
        currentSaldo += nominal;
      }
      profilSheet.getRange(i + 1, 3).setValue(currentSaldo);
      found = true;
      break;
    }
  }

  if (!found) throw new Error("Profile not found");

  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Transaction added" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Function to get profiles
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

  return ContentService.createTextOutput(JSON.stringify({ success: true, data: profiles }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Function to get transactions
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

  // Sort by date descending
  transactions.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  return ContentService.createTextOutput(JSON.stringify({ success: true, data: transactions }))
    .setMimeType(ContentService.MimeType.JSON);
}
