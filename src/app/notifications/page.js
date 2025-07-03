'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import NotificationSettings from '@/components/NotificationSettings';
import { getCurrentUser } from '@/lib/supabase';

export default function NotificationsPage() {
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setUserId(user?.id || 'demo-user-id');
      } catch (error) {
        console.error('Error fetching user:', error);
        // Set demo user ID for testing purposes
        setUserId('demo-user-id');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Navigation />
      
      <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">
                Notification Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Configure how and when you receive learning reminders to boost your learning consistency
              </p>
            </div>
            
            {isLoading ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-12 shadow-sm flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <NotificationSettings userId={userId} />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
