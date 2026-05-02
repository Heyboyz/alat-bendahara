import React, { useState, useEffect } from 'react';
import { getProfiles, addProfile, addTransaction, WEB_APP_URL } from '../api';
import { Plus, UserPlus, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function Profil() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add Profile form
  const [newNama, setNewNama] = useState('');
  const [addingProfile, setAddingProfile] = useState(false);
  
  // Top Up form
  const [selectedProfile, setSelectedProfile] = useState('');
  const [topupNominal, setTopupNominal] = useState('');
  const [doingTopup, setDoingTopup] = useState(false);
  
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getProfiles();
      setProfiles(data || []);
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

  const handleAddProfile = async (e) => {
    e.preventDefault();
    if (!newNama) return;
    setAddingProfile(true);
    try {
      await addProfile(newNama, 0);
      setMessage({ type: 'success', text: `Anggota ${newNama} berhasil ditambahkan!` });
      setNewNama('');
      fetchData();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setAddingProfile(false);
    }
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    if (!selectedProfile || !topupNominal) return;
    setDoingTopup(true);
    try {
      await addTransaction(selectedProfile, 'Kredit', topupNominal, 'Top Up Saldo');
      setMessage({ type: 'success', text: 'Top Up berhasil dicatat!' });
      setSelectedProfile('');
      setTopupNominal('');
      fetchData();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setDoingTopup(false);
    }
  };

  if (!WEB_APP_URL) return <div className="text-center mt-10 text-muted">Web App URL belum diatur di Setup.</div>;

  return (
    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col gap-6">
        
        {/* Formulir Top Up */}
        <div className="glass-panel" style={{ borderLeft: '4px solid var(--success)' }}>
          <h3 className="mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-success" /> Top Up Saldo (Kredit)</h3>
          <form onSubmit={handleTopup}>
            <div className="form-group">
              <label className="form-label">Pilih Anggota</label>
              <select 
                className="form-control" 
                value={selectedProfile} 
                onChange={e => setSelectedProfile(e.target.value)}
                required
              >
                <option value="" disabled>-- Pilih --</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.nama} (Saldo: Rp {parseFloat(p.saldo).toLocaleString('id-ID')})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nominal (Rp)</label>
              <input 
                type="number" 
                className="form-control" 
                value={topupNominal} 
                onChange={e => setTopupNominal(e.target.value)}
                min="0"
                step="1000"
                placeholder="Contoh: 50000"
                required
              />
            </div>
            <button type="submit" className="btn btn-success w-full justify-center mt-2" disabled={doingTopup || profiles.length === 0}>
              {doingTopup ? 'Memproses...' : 'Proses Top Up'}
            </button>
          </form>
        </div>

        {/* Formulir Tambah Anggota */}
        <div className="glass-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3 className="mb-4 flex items-center gap-2"><UserPlus size={20} className="text-primary" /> Tambah Anggota Baru</h3>
          <form onSubmit={handleAddProfile}>
            <div className="form-group">
              <label className="form-label">Nama Anggota</label>
              <input 
                type="text" 
                className="form-control" 
                value={newNama} 
                onChange={e => setNewNama(e.target.value)}
                placeholder="Masukkan nama"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full justify-center mt-2" disabled={addingProfile}>
              {addingProfile ? 'Menyimpan...' : 'Tambah Anggota'}
            </button>
          </form>
        </div>

        {message.text && (
          <div className={`p-4 rounded-md flex items-start gap-2 ${message.type === 'success' ? 'text-success' : 'text-danger'}`} style={{ backgroundColor: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)' }}>
            {message.type === 'success' ? <CheckCircle size={20} className="flex-shrink-0" /> : <AlertCircle size={20} className="flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Daftar Anggota */}
      <div className="glass-panel">
        <h3 className="mb-4">Daftar Anggota ({profiles.length})</h3>
        {loading ? <div className="spinner"></div> : (
          <div className="flex flex-col gap-3">
            {profiles.map(p => (
              <div key={p.id} className="p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
                <div className="font-bold text-lg">{p.nama}</div>
                <div className="text-right">
                  <div className="text-xs text-muted uppercase">Saldo Saat Ini</div>
                  <div className={`font-bold ${parseFloat(p.saldo) >= 0 ? 'text-success' : 'text-danger'}`}>
                    Rp {parseFloat(p.saldo).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            ))}
            {profiles.length === 0 && (
              <div className="text-center text-muted py-8">Belum ada data anggota</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
