import React, { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../api';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [profiles, setProfiles] = useState(() => {
    const cached = localStorage.getItem('cache_profiles');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [transactions, setTransactions] = useState(() => {
    const cached = localStorage.getItem('cache_transactions');
    return cached ? JSON.parse(cached) : [];
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const syncData = async () => {
    if (!api.WEB_APP_URL) return;
    setIsSyncing(true);
    try {
      const [profData, transData] = await Promise.all([
        api.getProfiles(),
        api.getTransactions()
      ]);
      const p = profData || [];
      const t = transData || [];
      
      setProfiles(p);
      setTransactions(t);
      
      localStorage.setItem('cache_profiles', JSON.stringify(p));
      localStorage.setItem('cache_transactions', JSON.stringify(t));
      setGlobalError('');
    } catch (err) {
      console.error("Sync Error:", err);
      // Jangan timpa cache jika error (bisa karena offline/delay)
      setGlobalError('Gagal menyinkronkan data dengan server.');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncData();
  }, []);

  // --- Optimistic Functions ---

  const addProfileOpt = async (nama) => {
    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    const newProfile = { id: tempId, nama, saldo: 0 };
    setProfiles(prev => [...prev, newProfile]);
    
    try {
      await api.addProfile(nama, 0);
      await syncData(); // re-sync untuk dapat ID asli
    } catch (err) {
      setProfiles(prev => prev.filter(p => p.id !== tempId)); // Revert
      throw err;
    }
  };

  const editProfileOpt = async (id, newNama) => {
    const originalProfiles = [...profiles];
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, nama: newNama } : p));
    
    try {
      await api.editProfile(id, newNama);
      await syncData();
    } catch (err) {
      setProfiles(originalProfiles); // Revert
      throw err;
    }
  };

  const addTransactionOpt = async (id_profil, jenis, nominal, keterangan) => {
    const originalProfiles = [...profiles];
    const originalTransactions = [...transactions];
    
    const tempId = `temp-${Date.now()}`;
    const numNominal = parseFloat(nominal);
    const newTrans = {
      id: tempId,
      tanggal: new Date().toISOString(),
      id_profil, jenis, nominal: numNominal, keterangan
    };

    // Update Transaction State
    setTransactions(prev => [newTrans, ...prev]);

    // Update Profile Balance State
    setProfiles(prev => prev.map(p => {
      if (p.id === id_profil) {
        let s = parseFloat(p.saldo) || 0;
        if (jenis === 'Debit') s -= numNominal;
        else if (jenis === 'Kredit') s += numNominal;
        return { ...p, saldo: s };
      }
      return p;
    }));

    try {
      await api.addTransaction(id_profil, jenis, numNominal, keterangan);
      await syncData();
    } catch (err) {
      setProfiles(originalProfiles);
      setTransactions(originalTransactions);
      throw err;
    }
  };

  const editTransactionOpt = async (id_transaksi, newNominal, newKeterangan) => {
    const originalProfiles = [...profiles];
    const originalTransactions = [...transactions];
    const numNominal = parseFloat(newNominal);

    let tJenis = '', tIdProfil = '', tOldNominal = 0;

    setTransactions(prev => prev.map(t => {
      if (t.id === id_transaksi) {
        tJenis = t.jenis; tIdProfil = t.id_profil; tOldNominal = parseFloat(t.nominal);
        return { ...t, nominal: numNominal, keterangan: newKeterangan };
      }
      return t;
    }));

    setProfiles(prev => prev.map(p => {
      if (p.id === tIdProfil) {
        let s = parseFloat(p.saldo) || 0;
        // Revert old
        if (tJenis === 'Debit') s += tOldNominal;
        else if (tJenis === 'Kredit') s -= tOldNominal;
        // Apply new
        if (tJenis === 'Debit') s -= numNominal;
        else if (tJenis === 'Kredit') s += numNominal;
        return { ...p, saldo: s };
      }
      return p;
    }));

    try {
      await api.editTransaction(id_transaksi, numNominal, newKeterangan);
      await syncData();
    } catch (err) {
      setProfiles(originalProfiles);
      setTransactions(originalTransactions);
      throw err;
    }
  };

  const deleteTransactionOpt = async (id_transaksi) => {
    const originalProfiles = [...profiles];
    const originalTransactions = [...transactions];
    
    let tJenis = '', tIdProfil = '', tOldNominal = 0;
    
    setTransactions(prev => prev.filter(t => {
      if (t.id === id_transaksi) {
        tJenis = t.jenis; tIdProfil = t.id_profil; tOldNominal = parseFloat(t.nominal);
        return false;
      }
      return true;
    }));

    setProfiles(prev => prev.map(p => {
      if (p.id === tIdProfil) {
        let s = parseFloat(p.saldo) || 0;
        if (tJenis === 'Debit') s += tOldNominal;
        else if (tJenis === 'Kredit') s -= tOldNominal;
        return { ...p, saldo: s };
      }
      return p;
    }));

    try {
      await api.deleteTransaction(id_transaksi);
      await syncData();
    } catch (err) {
      setProfiles(originalProfiles);
      setTransactions(originalTransactions);
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      profiles, transactions, isSyncing, globalError,
      syncData, addProfileOpt, editProfileOpt,
      addTransactionOpt, editTransactionOpt, deleteTransactionOpt
    }}>
      {children}
    </AppContext.Provider>
  );
};
