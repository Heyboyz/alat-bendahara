import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { WEB_APP_URL } from '../api';
import { Wallet, TrendingUp, TrendingDown, Users, AlertCircle, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { profiles, transactions, isSyncing, globalError } = useAppContext();

  if (!WEB_APP_URL) {
    return (
      <div className="glass-panel text-center py-10">
        <AlertCircle size={48} className="text-danger mx-auto mb-4" />
        <h2>Sistem Belum Siap</h2>
        <p className="text-muted mb-6">Silakan lakukan setup URL Web App terlebih dahulu.</p>
        <Link to="/setup" className="btn btn-primary">Ke Halaman Setup</Link>
      </div>
    );
  }

  const totalSaldo = profiles.reduce((sum, p) => sum + parseFloat(p.saldo || 0), 0);

  return (
    <div className="animate-fade-in">
      {globalError && (
        <div className="mb-4 p-3 rounded-md text-sm text-danger" style={{ backgroundColor: 'var(--danger-bg)' }}>
          <AlertCircle size={16} className="inline mr-2" /> {globalError}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="m-0">Ringkasan</h2>
        {isSyncing && <span className="text-xs text-muted flex items-center gap-1"><RefreshCw size={12} className="animate-spin" /> Menyinkronkan...</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-panel text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <Wallet size={24} />
          </div>
          <h3 className="text-muted text-sm uppercase tracking-wider">Total Kas Keseluruhan</h3>
          <div className="text-3xl font-bold mt-2">Rp {totalSaldo.toLocaleString('id-ID')}</div>
        </div>

        <div className="glass-panel text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: 'var(--primary)', color: 'white', opacity: 0.8 }}>
            <Users size={24} />
          </div>
          <h3 className="text-muted text-sm uppercase tracking-wider">Total Anggota</h3>
          <div className="text-3xl font-bold mt-2">{profiles.length}</div>
        </div>

        <div className="glass-panel text-center flex flex-col justify-center gap-2">
           <Link to="/transaksi" className="btn btn-danger w-full justify-center py-3">
             <TrendingDown size={18} /> Catat Makan (Debit)
           </Link>
           <Link to="/profil" className="btn btn-success w-full justify-center py-3 mt-2">
             <TrendingUp size={18} /> Top Up (Kredit)
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="m-0 flex items-center gap-2"><Users size={20} className="text-primary"/> Saldo Anggota</h3>
            <Link to="/profil" className="text-sm text-primary" style={{ textDecoration: 'none' }}>Lihat Semua</Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th className="text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {profiles.slice(0, 5).map(p => (
                  <tr key={p.id}>
                    <td>{p.nama}</td>
                    <td className="text-right font-bold text-success">
                      Rp {parseFloat(p.saldo).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
                {profiles.length === 0 && (
                  <tr><td colSpan="2" className="text-center text-muted">Belum ada anggota</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="m-0 flex items-center gap-2">Riwayat Transaksi</h3>
            <Link to="/transaksi" className="text-sm text-primary" style={{ textDecoration: 'none' }}>Lihat Semua</Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tipe</th>
                  <th>Keterangan</th>
                  <th className="text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map(t => (
                  <tr key={t.id}>
                    <td>
                      <span className={`badge ${t.jenis === 'Kredit' ? 'badge-success' : 'badge-danger'}`}>
                        {t.jenis}
                      </span>
                    </td>
                    <td>{t.keterangan}</td>
                    <td className="text-right font-bold">
                      Rp {parseFloat(t.nominal).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan="3" className="text-center text-muted">Belum ada transaksi</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
