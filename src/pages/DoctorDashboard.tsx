import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Search, 
  UserCircle, 
  QrCode, 
  ArrowRight,
  ClipboardCheck,
  Camera,
  X
} from 'lucide-react';

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const [patientId, setPatientId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = patientId.trim();
    if (id) {
      navigate(`/doctor/patient/${id}`);
    }
  };

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render((decodedText: string) => {
        // Try to extract ID from URL if it's a full URL
        let finalId = decodedText;
        if (decodedText.includes('/doctor/patient/')) {
          finalId = decodedText.split('/doctor/patient/')[1];
        }
        
        scanner.clear();
        setIsScanning(false);
        navigate(`/doctor/patient/${finalId}`);
      }, (error: any) => {
        // console.warn(error);
      });

      return () => {
        scanner.clear().catch(e => console.error(e));
      };
    }
  }, [isScanning]);

  if (!profile) return null;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Medical Portal</h1>
        <p className="text-sm text-gray-500">Search patient records securely</p>
      </header>

      {/* Doctor Info Card */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="bg-blue-600 p-6 text-white text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md mb-3">
            <UserCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-xl font-bold">Dr. {profile.name}</h2>
          <p className="text-sm opacity-80">{profile.degree}</p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center gap-8 text-center">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-green-600">
                <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                Verified
              </div>
            </div>
            <div className="h-8 w-px bg-gray-100" />
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Clinic</p>
              <p className="text-sm font-bold text-gray-900">MedVault Network</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Search className="h-6 w-6" />
          </div>
          <button 
            onClick={() => setIsScanning(!isScanning)}
            className={`flex h-12 gap-2 items-center px-6 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 ${
              isScanning ? 'bg-red-50 text-red-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'
            }`}
          >
            {isScanning ? <><X className="h-4 w-4" /> Stop Scan</> : <><Camera className="h-4 w-4" /> Scan QR</>}
          </button>
        </div>

        {isScanning && (
          <div className="mb-8 overflow-hidden rounded-3xl border-2 border-slate-100 bg-slate-50 p-4">
            <div id="reader" className="overflow-hidden rounded-2xl shadow-inner"></div>
            <p className="mt-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Point camera at patient's Medic ID QR Code
            </p>
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-900">Access Patient Data</h2>
        <p className="text-sm text-gray-500 mt-1">Enter the patient ID manually if QR scanning is unavailable.</p>

        <form onSubmit={handleSearch} className="mt-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Patient ID (e.g. 1a2b3c...)"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full rounded-2xl bg-gray-50 py-4 pl-12 pr-4 text-sm font-medium ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            disabled={!patientId.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            Retrieve Patient Records
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Quick Tips */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-start gap-4 rounded-3xl bg-gray-50 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">QR Scanning</h4>
            <p className="text-xs text-gray-600 mt-1">Scan the QR code on the patient's phone to instantly open their profile.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-3xl bg-gray-50 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-purple-600 shadow-sm">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Privacy First</h4>
            <p className="text-xs text-gray-600 mt-1">Patients must enable sharing in their settings for you to access their records.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
