import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex flex-col">
          <h1 className="text-xl font-black text-blue-600 tracking-tight leading-none">MedVault</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secure Health Record</p>
        </Link>
        
        {profile && (
          <div className="flex items-center gap-3">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-xs font-bold text-slate-900">{profile.name}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">{profile.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 border-2 border-white shadow-sm hover:bg-slate-200 transition-all active:scale-95"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
