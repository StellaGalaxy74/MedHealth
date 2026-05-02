import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Upload, 
  Clock, 
  ShieldCheck, 
  ShieldAlert,
  Bot,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import RemindersWidget from '../components/RemindersWidget';
import HealthuChat from '../components/HealthuChat';
import { motion } from 'motion/react';

export default function PatientDashboard() {
  const { profile } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleSharing = async () => {
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'users', profile.id), {
        sharingEnabled: !profile.sharingEnabled
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update privacy settings.");
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 pb-24">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Medical Management System</p>
      </header>

      {/* Profile Bento Card */}
      <div className="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp className="w-40 h-40" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-blue-100 text-[10px] uppercase tracking-[0.2em] font-black mb-2">Member Profile</p>
              <h2 className="text-3xl font-bold tracking-tight">{profile.name}</h2>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30">
              <p className="text-[10px] font-black text-white/80 uppercase">Blood</p>
              <p className="font-black text-white">{profile.bloodGroup || 'N/A'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 border-t border-white/20 pt-6">
            <div>
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-wider mb-1">Age</p>
              <p className="font-bold text-xl">{profile.age || '--'} <span className="text-sm font-medium opacity-60">Yrs</span></p>
            </div>
            <div>
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-wider mb-1">Gender</p>
              <p className="font-bold text-xl capitalize">{profile.gender || '--'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reminders Bento */}
        <RemindersWidget />

        {/* QR Access Bento */}
        <div className="bg-white border-2 border-slate-100 rounded-[32px] p-8 flex flex-col items-center shadow-sm relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
               <ChevronRight className="w-4 h-4" />
             </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Patient ID Passport</p>
          <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-6 flex items-center justify-center shadow-inner relative">
            <QRCodeCanvas 
              value={`${window.location.origin}/doctor/patient/${profile.id}`} 
              size={120}
              level="H"
              includeMargin={false}
              bgColor="transparent"
              fgColor="#0f172a"
            />
          </div>
          <p className="mt-6 font-mono text-[10px] text-slate-400 font-bold tracking-[0.2em]">MV-{profile.id.substring(0, 4)}-{profile.id.substring(profile.id.length-4)}</p>
        </div>
      </div>

      {/* Actions Row */}
      <div className="grid grid-cols-2 gap-4">
        <Link 
          to="/patient/upload"
          className="flex flex-col items-start bg-emerald-50 rounded-[28px] p-6 transition-all active:scale-95 group border border-emerald-100"
        >
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center mb-4">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-emerald-900 uppercase tracking-widest">New File</span>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">Upload records</p>
        </Link>
        <Link 
          to="/patient/timeline"
          className="flex flex-col items-start bg-purple-50 rounded-[28px] p-6 transition-all active:scale-95 group border border-purple-100"
        >
          <div className="w-10 h-10 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-200 flex items-center justify-center mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-purple-900 uppercase tracking-widest">Archive</span>
          <p className="text-[10px] text-purple-600 font-bold mt-1">Medical history</p>
        </Link>
      </div>

      {/* Sharing Status Widget */}
      <div className={`flex items-center justify-between rounded-[28px] p-6 shadow-sm border transition-all ${
        profile.sharingEnabled ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:rotate-12 ${
            profile.sharingEnabled ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-slate-300 text-slate-500 shadow-slate-100'
          }`}>
            {profile.sharingEnabled ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">
              Sharing {profile.sharingEnabled ? 'Online' : 'Offline'}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {profile.sharingEnabled ? 'Doctors Can view files' : 'Local Sandbox Mode'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleSharing}
          className={`w-14 h-8 rounded-full relative transition-all duration-300 focus:outline-none ${
            profile.sharingEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-300 shadow-sm'
          }`}
        >
          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 ease-spring ${
            profile.sharingEnabled ? 'translate-x-[26px]' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-300 flex items-center justify-center z-[50]"
      >
        <Bot className="w-7 h-7" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
          <Sparkles className="w-3 h-3 text-white fill-white" />
        </div>
      </motion.button>

      {/* Healthu AI Chatbot Modal */}
      <HealthuChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
