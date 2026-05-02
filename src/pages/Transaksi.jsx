import React, { useState, useEffect } from 'react';
import { getProfiles, getTransactions, addTransaction, WEB_APP_URL } from '../api';
import { TrendingDown, List, AlertCircle, CheckCircle } from 'lucide-react';

export default function Transaksi() {
  const [profiles, setProfiles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Transaksi form (Debit)
  const [selectedProfile, setSelectedProfile] = useState('');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('Makan Siang');
  const [saving, setSaving] = useState(false);
  
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profData, transData] = await Promise.all([
        getProfiles(),
        getTransactions()
      ]);
      setProfiles(profData || []);
      setTransactions(transData || []);
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (WEB_APP_URL) fetchData();
    else setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProfile || !nominal) return;
    setSaving(true);
    try {
      await addTransaction(selectedProfile, 'Debit', nominal, keterangan);
      setMessage({ type: 'success', text: 'Pengeluaran makan berhasil dicatat!' });
      setSelectedProfile('');
      setNominal('');
      setKeterangan('Makan Siang');
      fetchData(); // Refresh data
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setSaving(false);
      // Auto clear message
      setTimeout(() => setMessage({type: '', text: ''}), 3000);
    }
  };

  if (!WEB_APP_URL) return <div className="text-center mt-10 text-muted">Web App URL belum diatur di Setup.</div>;

  return (
    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Form Catat Makan */}
      <div className="md:col-span-1">
        <div className="glass-panel sticky top-24" style={{ borderLeft: '4px solid var(--danger)' }}>
          <h3 className="mb-4 flex items-center gap-2"><TrendingDown size={20} className="text-danger" /> Catat Pengeluaran</h3>
          
          {message.text && (
            <div className={`mb-4 p-3 rounded-md text-sm flex items-start gap-2 ${message.type === 'success' ? 'text-success' : 'text-danger'}`} style={{ backgroundColor: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)' }}>
              {message.type === 'success' ? <CheckCircle size={16} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Anggota (Yang Makan)</label>
              <select 
                className="form-control" 
                value={selectedProfile} 
                onChange={e => setSelectedProfile(e.target.value)}
                required
              >
                <option value="" disabled>-- Pilih Anggota --</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nama} (Sisa: Rp {parseFloat(p.saldo).toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Nominal (Rp)</label>
              <input 
                type="number" 
                className="form-control" 
                value={nominal} 
                onChange={e => setNominal(e.target.value)}
                min="0"
                step="500"
                placeholder="Contoh: 15000"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Keterangan</label>
              <input 
                type="text" 
                className="form-control" 
                value={keterangan} 
                onChange={e => setKeterangan(e.target.value)}
                placeholder="Makan Siang / Malam"
                required
              />
            </div>

            <button type="submit" className="btn btn-danger w-full justify-center mt-2" disabled={saving || profiles.length === 0}>
              {saving ? 'Menyimpan...' : 'Potong Saldo (Debit)'}
            </button>
          </form>
        </div>
      </div>

      {/* Riwayat Transaksi */}
      <div className="md:col-span-2">
        <div className="glass-panel">
          <h3 className="mb-4 flex items-center gap-2"><List size={20} className="text-primary"/> Riwayat Transaksi</h3>
          
          {loading ? <div className="spinner"></div> : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Nama</th>
                    <th>Tipe</th>
                    <th>Keterangan</th>
                    <th className="text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => {
                    const prof = profiles.find(p => p.id === t.id_profil);
                    const isKredit = t.jenis === 'Kredit';
                    return (
                      <tr key={t.id}>
                        <td className="text-sm">{new Date(t.tanggal).toLocaleString('id-ID', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})}</td>
                        <td className="font-medium">{prof ? prof.nama : t.id_profil}</td>
                        <td>
                          <span className={`badge ${isKredit ? 'badge-success' : 'badge-danger'}`}>
                            {t.jenis}
                          </span>
                        </td>
                        <td>{t.keterangan}</td>
                        <td className={`text-right font-bold ${isKredit ? 'text-success' : 'text-danger'}`}>
                          {isKredit ? '+' : '-'} Rp {parseFloat(t.nominal).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })}
                  {transactions.length === 0 && (
                    <tr><td colSpan="5" className="text-center text-muted py-6">Belum ada transaksi</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
