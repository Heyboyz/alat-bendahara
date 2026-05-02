import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { WEB_APP_URL } from '../api';
import { TrendingDown, List, AlertCircle, CheckCircle, Edit2, Trash2, X, Save, RefreshCw } from 'lucide-react';

export default function Transaksi() {
  const { profiles, transactions, isSyncing, addTransactionOpt, editTransactionOpt, deleteTransactionOpt } = useAppContext();
  
  // Transaksi form (Debit)
  const [selectedProfile, setSelectedProfile] = useState('');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('Makan Siang');
  const [saving, setSaving] = useState(false);
  
  const [message, setMessage] = useState({ type: '', text: '' });

  // State untuk Edit/Delete
  const [editingId, setEditingId] = useState(null);
  const [editNominal, setEditNominal] = useState('');
  const [editKeterangan, setEditKeterangan] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProfile || !nominal) return;
    setSaving(true);
    try {
      await addTransactionOpt(selectedProfile, 'Debit', nominal, keterangan);
      setMessage({ type: 'success', text: 'Pengeluaran makan berhasil dicatat!' });
      setSelectedProfile('');
      setNominal('');
      setKeterangan('Makan Siang');
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({type: '', text: ''}), 3000);
    }
  };

  const handleEditClick = (t) => {
    setEditingId(t.id);
    setEditNominal(t.nominal);
    setEditKeterangan(t.keterangan);
  };

  const handleSaveEdit = async (id) => {
    setProcessingId(id);
    try {
      await editTransactionOpt(id, editNominal, editKeterangan);
      setMessage({ type: 'success', text: 'Transaksi berhasil diubah!' });
      setEditingId(null);
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setProcessingId(null);
      setTimeout(() => setMessage({type: '', text: ''}), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus transaksi ini? Saldo anggota akan dikembalikan otomatis.')) return;
    setProcessingId(id);
    try {
      await deleteTransactionOpt(id);
      setMessage({ type: 'success', text: 'Transaksi berhasil dihapus!' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setProcessingId(null);
      setTimeout(() => setMessage({type: '', text: ''}), 3000);
    }
  };

  if (!WEB_APP_URL) return <div className="text-center mt-10 text-muted">Web App URL belum diatur di Setup.</div>;

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Form Catat Makan */}
      <div className="lg:col-span-1">
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
      <div className="lg:col-span-2">
        <div className="glass-panel overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="m-0 flex items-center gap-2"><List size={20} className="text-primary"/> Riwayat Transaksi</h3>
            {isSyncing && <span className="text-xs text-muted flex items-center gap-1"><RefreshCw size={12} className="animate-spin" /></span>}
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Nama & Tipe</th>
                  <th>Keterangan</th>
                  <th className="text-right">Nominal</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => {
                  const prof = profiles.find(p => p.id === t.id_profil);
                  const isKredit = t.jenis === 'Kredit';
                  const isEditing = editingId === t.id;
                  const isProcessing = processingId === t.id;
                  const isTemp = String(t.id).startsWith('temp-');

                  return (
                    <tr key={t.id} style={{ opacity: isTemp ? 0.6 : 1 }}>
                      <td className="text-sm">
                        {new Date(t.tanggal).toLocaleString('id-ID', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})}
                      </td>
                      <td>
                        <div className="font-medium">{prof ? prof.nama : t.id_profil}</div>
                        <span className={`badge mt-1 ${isKredit ? 'badge-success' : 'badge-danger'}`} style={{fontSize: '0.65rem'}}>
                          {t.jenis}
                        </span>
                      </td>
                      
                      {/* Keterangan Column */}
                      <td>
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="form-control" 
                            style={{padding: '0.25rem 0.5rem', fontSize: '0.875rem'}}
                            value={editKeterangan} 
                            onChange={e => setEditKeterangan(e.target.value)} 
                          />
                        ) : (
                          t.keterangan
                        )}
                      </td>
                      
                      {/* Nominal Column */}
                      <td className={`text-right font-bold ${isKredit ? 'text-success' : 'text-danger'}`}>
                        {isEditing ? (
                          <input 
                            type="number" 
                            className="form-control" 
                            style={{padding: '0.25rem 0.5rem', fontSize: '0.875rem', width: '100px', marginLeft: 'auto', display: 'inline-block'}}
                            value={editNominal} 
                            onChange={e => setEditNominal(e.target.value)} 
                          />
                        ) : (
                          <>{isKredit ? '+' : '-'} Rp {parseFloat(t.nominal).toLocaleString('id-ID')}</>
                        )}
                      </td>

                      {/* Aksi Column */}
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button className="btn btn-success" style={{padding: '0.25rem 0.5rem'}} onClick={() => handleSaveEdit(t.id)} disabled={isProcessing}>
                                <Save size={14} />
                              </button>
                              <button className="btn btn-outline" style={{padding: '0.25rem 0.5rem'}} onClick={() => setEditingId(null)} disabled={isProcessing}>
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-outline" style={{padding: '0.25rem 0.5rem'}} onClick={() => handleEditClick(t)} disabled={processingId !== null || isTemp}>
                                <Edit2 size={14} />
                              </button>
                              <button className="btn btn-outline" style={{padding: '0.25rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger-bg)'}} onClick={() => handleDelete(t.id)} disabled={processingId !== null || isTemp}>
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
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
        </div>
      </div>
    </div>
  );
}
