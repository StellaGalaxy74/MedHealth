import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { Shield, Mail, Lock, User, UserCheck, Chrome } from 'lucide-react';
import { UserRole } from '../types';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        if (userDoc.exists()) {
          const profile = userDoc.data();
          navigate(profile.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
        } else {
          // Profile doesn't exist, which shouldn't happen with correct flow
          signOutAndError("Profile not found. Please sign up.");
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Initial profile creation
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          id: userCredential.user.uid,
          name,
          email,
          role,
          onboarded: false,
          createdAt: serverTimestamp(),
          sharingEnabled: true // Default to true
        });
        
        navigate('/onboarding');
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (userDoc.exists()) {
        const profile = userDoc.data();
        navigate(profile.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
      } else {
        // First time Google sign-in: needs role selection before proceeding
        // For simplicity in this flow, we'll assume patient unless they signed up manually
        // Alternatively, redirect to a role selection page. Let's do that.
        await setDoc(doc(db, 'users', result.user.uid), {
          id: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
          role, // Use currently selected role in toggle
          onboarded: false,
          createdAt: serverTimestamp(),
          sharingEnabled: true
        });
        navigate('/onboarding');
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (err: any) => {
    console.error(err);
    if (err.code === 'auth/operation-not-allowed') {
      setError("Email/Password auth is not enabled in Firebase Console. Please enable it under Auth -> Sign-in method.");
    } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      setError("Invalid email or password.");
    } else if (err.code === 'auth/email-already-in-use') {
      setError("Email already in use.");
    } else {
      setError(err.message || "An authentication error occurred.");
    }
  };

  const signOutAndError = async (msg: string) => {
    await auth.signOut();
    setError(msg);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-blue-600 tracking-tight">MedVault</h1>
          <p className="mt-2 text-xs text-slate-400 font-bold uppercase tracking-widest">Global Health Repository</p>
        </div>

        <div className="rounded-[40px] bg-white p-10 shadow-2xl shadow-slate-200 border border-slate-100">
          {/* Role Toggle */}
          <div className="mb-8 flex rounded-[20px] bg-slate-100 p-1.5">
            <button
              onClick={() => setRole('patient')}
              className={`flex-1 rounded-[14px] py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                role === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => setRole('doctor')}
              className={`flex-1 rounded-[14px] py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                role === 'doctor' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Doctor
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <input
                   type="text"
                   placeholder="FULL NAME"
                   required
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="w-full rounded-2xl bg-slate-50 py-4 px-6 text-xs font-bold tracking-wider placeholder:text-slate-300 ring-1 ring-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all uppercase"
                />
              </div>
            )}
            <div className="relative">
              <input
                 type="email"
                 placeholder="EMAIL ADDRESS"
                 required
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full rounded-2xl bg-slate-50 py-4 px-6 text-xs font-bold tracking-wider placeholder:text-slate-300 ring-1 ring-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all uppercase"
              />
            </div>
            <div className="relative">
              <input
                 type="password"
                 placeholder="PASSWORD"
                 required
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full rounded-2xl bg-slate-50 py-4 px-6 text-xs font-bold tracking-wider placeholder:text-slate-300 ring-1 ring-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all uppercase"
              />
            </div>

            {error && (
              <p className="text-[10px] font-bold text-red-500 bg-red-50 p-4 rounded-2xl border border-red-100 uppercase tracking-widest text-center">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 py-4 text-xs font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 mt-4"
            >
              {loading ? "PROCESSING..." : isLogin ? "LOGIN" : "REGISTER"}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">or continue with</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-4 text-xs font-bold text-slate-600 uppercase tracking-widest shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            <Chrome className="h-4 w-4 text-blue-500" />
            Google Access
          </button>

          <p className="mt-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            {isLogin ? "New to MedVault?" : "Already Registered?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline inline-block ml-1"
            >
              {isLogin ? "SIGN UP" : "LOG IN"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
