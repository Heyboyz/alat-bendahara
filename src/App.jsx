import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Profil from './pages/Profil';
import Transaksi from './pages/Transaksi';
import Setup from './pages/Setup';

function App() {
  return (
    <HashRouter>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/transaksi" element={<Transaksi />} />
            <Route path="/setup" element={<Setup />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
