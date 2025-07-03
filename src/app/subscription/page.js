'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import SubscriptionPlans from '@/components/SubscriptionPlans';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Navigation />
      
      <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Upgrade Your Civic Education
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Choose the perfect plan to enhance your learning journey and gain access to premium features
              </p>
            </div>
            
            <SubscriptionPlans />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
