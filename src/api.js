// Ganti URL ini dengan URL Web App dari Google Apps Script yang sudah di-deploy
export const WEB_APP_URL = localStorage.getItem('GAS_WEB_APP_URL') || '';

export const setWebAppUrl = (url) => {
  localStorage.setItem('GAS_WEB_APP_URL', url);
  window.location.reload();
}

// Helper untuk fetch data dari GAS
const fetchFromGas = async (action, data = {}) => {
  if (!WEB_APP_URL) {
    throw new Error('Web App URL belum diatur');
  }

  // Google Apps Script Web App (doPost) menerima stringified JSON
  const payload = { action, ...data };
  
  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      // Mencegah preflight CORS issue dengan no-cors atau content-type text/plain
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      }
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Terjadi kesalahan pada server');
    }
    return result;
  } catch (error) {
    console.error(`Error in fetchFromGas (${action}):`, error);
    // Fallback jika json parsing gagal (terkadang GAS redirect dengan text HTML)
    throw new Error('Gagal menghubungi database. Pastikan URL Web App benar dan di-deploy sebagai "Anyone".');
  }
};

const fetchGetFromGas = async (action) => {
    if (!WEB_APP_URL) {
        throw new Error('Web App URL belum diatur');
    }
    try {
        const response = await fetch(`${WEB_APP_URL}?action=${action}`);
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Terjadi kesalahan pada server');
        }
        return result.data;
    } catch (error) {
        console.error(`Error in fetchGetFromGas (${action}):`, error);
        throw new Error('Gagal menghubungi database.');
    }
}

export const getProfiles = () => fetchGetFromGas('getProfiles');
export const getTransactions = () => fetchGetFromGas('getTransactions');

export const addProfile = (nama, saldo = 0) => 
  fetchFromGas('addProfile', { nama, saldo });

export const addTransaction = (id_profil, jenis, nominal, keterangan) => 
  fetchFromGas('addTransaction', { id_profil, jenis, nominal, keterangan });
