import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="pt-24 pb-12 px-6 max-w-lg mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
