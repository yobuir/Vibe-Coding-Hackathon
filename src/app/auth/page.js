'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Auth from '@/components/Auth';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const [redirecting, setRedirecting] = useState(false);

  const handleAuthSuccess = () => {
    setRedirecting(true);
  };

  useEffect(() => { 
    if (user && !redirecting) {
      router.push(redirect);
    }
  }, [user, router, redirect, redirecting]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-purple-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 mt-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M12 2v1"></path>
            <path d="M12 21v1"></path>
            <path d="m4.93 4.93-.7-.7"></path>
            <path d="m19.07 19.07 .7 .7"></path>
            <path d="M2 12h1"></path>
            <path d="M21 12h1"></path>
            <path d="m4.93 19.07 -.7 .7"></path>
            <path d="m19.07 4.93 .7 -.7"></path>
            <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
            <path d="M12 16v-2"></path>
            <path d="M12 8v2"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">CivicSpark AI</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
          Your gamified civic education journey
        </p>
      </motion.div>
      
      <div className="max-w-md w-full mx-auto my-auto">
        <Auth onAuthSuccess={handleAuthSuccess} />
      </div>
      
      <footer className="mt-auto text-center py-4 text-sm text-slate-500 dark:text-slate-500">
        &copy; {new Date().getFullYear()} CivicSpark AI. All rights reserved.
      </footer>
    </div>
  );
}
