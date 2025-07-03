'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className = '',
  fullScreen = false 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800'
    : 'flex items-center justify-center p-8';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          <Loader2 className={`${sizeClasses[size]} text-blue-600 dark:text-blue-400`} />
        </motion.div>
        
        {text && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-sm text-gray-600 dark:text-gray-400"
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
}

// Skeleton loader for content
export function SkeletonLoader({ lines = 3, className = '' }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 dark:bg-slate-700 rounded-md h-4 mb-3 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

// Card skeleton
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="w-3/4">
            <div className="bg-gray-200 dark:bg-slate-700 rounded-md h-6 mb-2" />
            <div className="bg-gray-200 dark:bg-slate-700 rounded-md h-4 w-1/2" />
          </div>
          <div className="bg-gray-200 dark:bg-slate-700 rounded-full w-12 h-12" />
        </div>
        <div className="space-y-2">
          <div className="bg-gray-200 dark:bg-slate-700 rounded-md h-4" />
          <div className="bg-gray-200 dark:bg-slate-700 rounded-md h-4 w-5/6" />
          <div className="bg-gray-200 dark:bg-slate-700 rounded-md h-4 w-3/4" />
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="bg-gray-200 dark:bg-slate-700 rounded-md h-8 w-20" />
          <div className="bg-gray-200 dark:bg-slate-700 rounded-md h-8 w-24" />
        </div>
      </div>
    </div>
  );
}
