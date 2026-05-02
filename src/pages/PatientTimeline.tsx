import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { 
  FileText, 
  ClipboardList, 
  ExternalLink, 
  Search,
  Calendar,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { MedicalRecord } from '../types';

export default function PatientTimeline() {
  const { profile } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'records'),
      where('patientId', '==', profile.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recordsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MedicalRecord[];
      setRecords(recordsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm ring-1 ring-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Timeline</h1>
          <p className="text-sm text-gray-500">{records.length} Records Found</p>
        </div>
      </header>

      {loading ? (
        <div className="flex py-20 justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 mb-4">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No records yet</h3>
          <p className="text-sm text-gray-500 mt-1">Start by uploading your first prescription or report.</p>
          <button 
            onClick={() => navigate('/patient/upload')}
            className="mt-6 font-bold text-blue-600"
          >
            Upload Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div 
              key={record.id}
              className="group relative flex items-start gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:ring-blue-100 active:scale-[0.98]"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
              }`}>
                {record.type === 'prescription' ? <FileText className="h-6 w-6" /> : <ClipboardList className="h-6 w-6" />}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    record.type === 'prescription' ? 'text-blue-600' : 'text-purple-600'
                  }`}>
                    {record.type}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {record.createdAt?.toDate ? format(record.createdAt.toDate(), 'dd MMM yyyy') : 'Recently'}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 line-clamp-1">{record.fileName}</h3>
                <div className="flex items-center justify-between pt-2">
                  <a 
                    href={record.fileURL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600"
                  >
                    View Document
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <ChevronRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
