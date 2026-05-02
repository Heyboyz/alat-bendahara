import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, Users, ArrowRightLeft, Settings } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-brand">
        <Wallet className="text-primary" />
        <span>Kas Klinik</span>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" className={({isActive}) => isActive ? "nav-link active flex items-center gap-2" : "nav-link flex items-center gap-2"}>
          <Wallet size={18} /> Beranda
        </NavLink>
        <NavLink to="/profil" className={({isActive}) => isActive ? "nav-link active flex items-center gap-2" : "nav-link flex items-center gap-2"}>
          <Users size={18} /> Profil
        </NavLink>
        <NavLink to="/transaksi" className={({isActive}) => isActive ? "nav-link active flex items-center gap-2" : "nav-link flex items-center gap-2"}>
          <ArrowRightLeft size={18} /> Transaksi
        </NavLink>
        <NavLink to="/setup" className={({isActive}) => isActive ? "nav-link active flex items-center gap-2" : "nav-link flex items-center gap-2"}>
          <Settings size={18} /> Setup
        </NavLink>
      </div>
    </nav>
  );
}
