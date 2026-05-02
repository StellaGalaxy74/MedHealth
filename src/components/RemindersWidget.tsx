import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Reminder } from '../types';
import { Bell, Plus, CheckCircle, Circle, Trash2, Clock, Pill, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function RemindersWidget() {
  const { profile } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState<'medication' | 'appointment' | 'general'>('medication');

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, 'reminders'),
      where('userId', '==', profile.id),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      setReminders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reminder)));
    });
  }, [profile]);

  const addReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newTitle || !newTime) return;
    await addDoc(collection(db, 'reminders'), {
      userId: profile.id,
      title: newTitle,
      time: newTime,
      type: newType,
      completed: false,
      createdAt: serverTimestamp()
    });
    setNewTitle('');
    setNewTime('');
    setShowAdd(false);
  };

  const toggleComplete = async (reminder: Reminder) => {
    await updateDoc(doc(db, 'reminders', reminder.id), {
      completed: !reminder.completed
    });
  };

  const deleteReminder = async (id: string) => {
    await deleteDoc(doc(db, 'reminders', id));
  };

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm ring-1 ring-slate-100 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900">Health Reminders</h3>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={addReminder}
            className="mb-6 space-y-3 overflow-hidden"
          >
            <input 
              placeholder="Medication or Task Name"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider placeholder:text-slate-300 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600"
            />
            <div className="flex gap-2">
              <input 
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="flex-1 bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-bold ring-1 ring-slate-200"
              />
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as any)}
                className="bg-slate-50 border-none rounded-xl py-3 px-4 text-[10px] font-bold uppercase tracking-wider ring-1 ring-slate-200"
              >
                <option value="medication">Pills</option>
                <option value="appointment">Visit</option>
                <option value="general">Note</option>
              </select>
            </div>
            <button className="w-full bg-indigo-600 text-white rounded-xl py-3 text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100">
              Save Reminder
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
        {reminders.length === 0 && !showAdd && (
          <p className="text-sm text-slate-400 italic text-center py-4">No active reminders.</p>
        )}
        {reminders.map(r => (
          <div key={r.id} className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all ${
            r.completed ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 shadow-sm'
          }`}>
            <button onClick={() => toggleComplete(r)} className="shrink-0">
              {r.completed ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-200" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${r.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {r.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                  r.type === 'medication' ? 'bg-blue-100 text-blue-600' : 
                  r.type === 'appointment' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {r.type}
                </span>
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {r.time}
                </span>
              </div>
            </div>
            <button onClick={() => deleteReminder(r.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-300 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
