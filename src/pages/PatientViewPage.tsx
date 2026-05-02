import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  User, 
  ShieldX, 
  FileText, 
  ClipboardList, 
  ExternalLink,
  MapPin,
  Activity,
  Droplets
} from 'lucide-react';
import { UserProfile, MedicalRecord } from '../types';

export default function PatientViewPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const fetchPatientData = async () => {
      try {
        const patientDoc = await getDoc(doc(db, 'users', id));
        if (!patientDoc.exists()) {
          setError("Patient not found.");
          setLoading(false);
          return;
        }

        const patientData = patientDoc.data() as UserProfile;
        
        if (!patientData.sharingEnabled) {
          setError("PRIVACY_RESTRICTED");
          setPatient(patientData);
          setLoading(false);
          return;
        }

        setPatient(patientData);

        // Fetch records if enabled
        const q = query(
          collection(db, 'records'),
          where('patientId', '==', id),
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
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching patient data.");
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error === 'PRIVACY_RESTRICTED') {
    return (
      <div className="space-y-6">
        <header className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm ring-1 ring-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 line-clamp-1">Patient: {patient?.name}</h1>
        </header>
        
        <div className="flex flex-col items-center justify-center rounded-3xl bg-orange-50 p-12 text-center ring-1 ring-orange-100 italic">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-6 group-hover:scale-110 transition-transform">
            <ShieldX className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-orange-800">Access Denied</h2>
          <p className="mt-2 text-orange-700 max-w-sm">
            This patient has disabled medical record sharing. Please ask the patient to enable "Sharing" on their dashboard.
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-8 rounded-2xl bg-orange-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all active:scale-95"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-gray-500">{error || "Patient not found."}</p>
        <button onClick={() => navigate(-1)} className="mt-4 font-bold text-blue-600">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm ring-1 ring-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Patient Detail</h1>
      </header>

      {/* Patient Bio Card */}
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <User className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 uppercase font-semibold">
              <span className="px-2 py-0.5 bg-gray-100 rounded-md">ID: {patient.id.substring(0, 8)}</span>
              <span>•</span>
              <span className="text-blue-600">Patient</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl bg-gray-50 p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Age</p>
            <p className="text-sm font-bold text-gray-900">{patient.age || 'N/A'}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Blood</p>
            <p className="text-sm font-bold text-gray-900">{patient.bloodGroup || 'N/A'}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Gender</p>
            <p className="text-sm font-bold text-gray-900 text-capitalize">{patient.gender || 'N/A'}</p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-50">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
            <p className="text-sm text-gray-600">{patient.address || 'No address provided'}</p>
          </div>
        </div>
      </div>

      {/* Records Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Medical Records</h3>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {records.length} Found
          </span>
        </div>

        {records.length === 0 ? (
          <div className="rounded-3xl bg-gray-50 p-12 text-center border-2 border-dashed border-gray-200">
             <p className="text-sm text-gray-500 italic">No medical records uploaded by this patient.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div 
                key={record.id}
                className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
              >
                <div className={`p-3 rounded-2xl ${
                  record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                }`}>
                  {record.type === 'prescription' ? <FileText className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">{record.type}</p>
                  <h4 className="font-bold text-gray-900 text-sm truncate">{record.fileName}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {record.createdAt?.toDate ? format(record.createdAt.toDate(), 'dd MMM yyyy') : 'Recently'}
                  </p>
                </div>
                <a 
                  href={record.fileURL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-blue-600 transition-colors hover:bg-blue-50"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
