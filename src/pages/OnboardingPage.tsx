import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { User, ClipboardList, MapPin, Activity, Award } from 'lucide-react';

export default function OnboardingPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Common
  const [address, setAddress] = useState('');
  
  // Patient specific
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('A+');
  
  // Doctor specific
  const [degree, setDegree] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const data: any = {
        address,
        onboarded: true,
      };

      if (profile.role === 'patient') {
        data.age = parseInt(age);
        data.gender = gender;
        data.bloodGroup = bloodGroup;
      } else {
        data.degree = degree;
      }

      await updateDoc(doc(db, 'users', profile.id), data);
      navigate(profile.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="mt-2 text-gray-600">Tell us a bit more about you to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-8 shadow-xl shadow-gray-200">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{profile.name}</p>
              <p className="text-xs text-gray-500">{profile.email} • {profile.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full residential address"
                className="w-full rounded-2xl bg-gray-50 py-3 pl-10 pr-4 text-sm ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[100px]"
              />
            </div>

            {profile.role === 'patient' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">Age</label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full rounded-2xl bg-gray-50 py-3 px-4 text-sm ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded-2xl bg-gray-50 py-3 px-4 text-sm ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full rounded-2xl bg-gray-50 py-3 px-4 text-sm ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">Degree / Specialization</label>
                <div className="relative">
                  <Award className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. MBBS, MD Cardiology"
                    className="w-full rounded-2xl bg-gray-50 py-3 pl-10 pr-4 text-sm ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Start Using MedVault"}
          </button>
        </form>
      </div>
    </div>
  );
}
