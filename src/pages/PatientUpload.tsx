import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileUp, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X,
  ClipboardList
} from 'lucide-react';
import { RecordType } from '../types';

export default function PatientUpload() {
  const { profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<RecordType>('prescription');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !profile) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Upload to Storage
      const storageRef = ref(storage, `records/${profile.id}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Save metadata to Firestore
      await addDoc(collection(db, 'records'), {
        patientId: profile.id,
        fileURL: downloadURL,
        fileName: file.name,
        type,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => navigate('/patient/timeline'), 2000);
    } catch (err: any) {
      console.error(err);
      setError("Failed to upload record. Please check your storage settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm ring-1 ring-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Upload Record</h1>
      </header>

      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Input Area */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Medical Document</label>
            <div className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 transition-colors ${
              file ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="absolute inset-0 z-10 cursor-pointer opacity-0"
              />
              <div className="flex flex-col items-center gap-3">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                  file ? 'bg-green-600 text-white' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                }`}>
                  <FileUp className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">
                    {file ? file.name : "Tap to upload file"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF or Image (Max 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Record Type */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700">Record Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('prescription')}
                className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-sm font-semibold transition-all ${
                  type === 'prescription' ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-600' : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                   type === 'prescription' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <FileText className="h-5 w-5" />
                </div>
                Prescription
              </button>
              <button
                type="button"
                onClick={() => setType('report')}
                className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-sm font-semibold transition-all ${
                  type === 'report' ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-600' : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                   type === 'report' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <ClipboardList className="h-5 w-5" />
                </div>
                Report
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-2xl bg-green-50 p-4 text-xs font-semibold text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Record uploaded successfully! Redirecting...
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file || success}
            className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Save Record"}
          </button>
        </form>
      </div>
    </div>
  );
}
