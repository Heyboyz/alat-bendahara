import React, { useState } from 'react';
import { WEB_APP_URL, setWebAppUrl } from '../api';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function Setup() {
  const [url, setUrl] = useState(WEB_APP_URL);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setWebAppUrl(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="glass-panel">
        <h2 className="flex items-center gap-2 mb-6">
          <Settings size={24} className="text-primary" />
          Konfigurasi Sistem
        </h2>

        {!WEB_APP_URL && (
          <div className="mb-6 p-4 rounded-md" style={{ backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger)' }}>
            <div className="flex items-start gap-3">
              <AlertCircle className="text-danger flex-shrink-0" />
              <div>
                <h4 className="text-danger m-0 font-bold">Aplikasi Belum Terhubung!</h4>
                <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
                  Anda harus memasukkan URL Web App dari Google Apps Script untuk mulai menggunakan aplikasi ini.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Google Apps Script Web App URL</label>
            <input 
              type="url" 
              className="form-control" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="https://script.google.com/macros/s/..." 
              required
            />
            <p className="text-muted mt-2">
              Pastikan Anda mendeploy script sebagai "Web app" dan mengatur "Who has access" ke "Anyone".
            </p>
          </div>
          
          <div className="mt-6">
            <button type="submit" className="btn btn-primary w-full justify-center">
              Simpan Konfigurasi
            </button>
          </div>

          {saved && (
            <div className="mt-4 flex items-center justify-center gap-2 text-success">
              <CheckCircle size={18} /> Berhasil disimpan!
            </div>
          )}
        </form>
      </div>

      <div className="glass-panel mt-6">
        <h3 className="mb-4">Cara Instalasi Backend</h3>
        <ol className="text-sm text-muted pl-5" style={{ listStyleType: 'decimal', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>Buat Google Spreadsheet baru.</li>
          <li>Buat 2 Sheet dengan nama: <strong>Profil</strong> dan <strong>Transaksi</strong>.</li>
          <li>Pilih menu <strong>Extensions &gt; Apps Script</strong>.</li>
          <li>Copy kode dari file <code>Code.gs</code> di project ini, lalu paste ke editor.</li>
          <li>Klik <strong>Deploy &gt; New deployment</strong>.</li>
          <li>Pilih type: <strong>Web app</strong>.</li>
          <li>Execute as: <strong>Me</strong>.</li>
          <li>Who has access: <strong>Anyone</strong>.</li>
          <li>Klik <strong>Deploy</strong>, authorize akses, lalu copy <strong>Web app URL</strong> yang diberikan.</li>
          <li>Paste URL tersebut pada form di atas.</li>
        </ol>
      </div>
    </div>
  );
}

// Tambahkan import Settings untuk icon di h2
import { Settings } from 'lucide-react';
