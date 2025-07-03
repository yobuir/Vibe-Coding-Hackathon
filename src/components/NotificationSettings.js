'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { updateUserProfile } from '@/lib/supabase';
import { BellRing, MessageCircle, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function NotificationSettings({ userId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [phone, setPhone] = useState('');
  const [settings, setSettings] = useState({
    enableWhatsapp: false,
    enableSms: false,
    dailyReminder: false,
    weeklyProgress: true,
    quizReminder: true,
    newContent: true
  });

  // Fetch user's notification settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // In a real implementation, you would fetch this from Supabase
        // For now, we'll simulate a successful fetch with dummy data
        setTimeout(() => {
          setPhone('+250781234567'); // Example Rwandan number
          setSettings({
            enableWhatsapp: true,
            enableSms: false,
            dailyReminder: true,
            weeklyProgress: true,
            quizReminder: true,
            newContent: false
          });
          setIsLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to load notification settings');
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [userId]);

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
  };

  const handleToggleSetting = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate phone number (basic validation)
      if ((settings.enableWhatsapp || settings.enableSms) && !phone.match(/^\+[0-9]{10,15}$/)) {
        throw new Error('Please enter a valid phone number with country code (e.g., +250...)');
      }

      // In a real implementation, you would update this in Supabase
      // const { error } = await updateUserProfile(userId, {
      //   phone,
      //   notification_settings: settings
      // });
      
      // if (error) throw error;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <BellRing className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Notification Settings</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Configure your WhatsApp and SMS learning reminders
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6 flex items-start">
          <XCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-4 rounded-lg mb-6 flex items-start">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>Your notification settings have been updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
          <h3 className="font-semibold mb-4">Notification Channels</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mobile Number (with country code)
            </label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+250781234567"
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Enter your phone number with country code (e.g., +250 for Rwanda)
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">WhatsApp Notifications</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive learning reminders via WhatsApp
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableWhatsapp}
                  onChange={() => handleToggleSetting('enableWhatsapp')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive learning reminders via SMS
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableSms}
                  onChange={() => handleToggleSetting('enableSms')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Reminder Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="font-medium">Daily Learning Reminder</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dailyReminder}
                  onChange={() => handleToggleSetting('dailyReminder')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="font-medium">Weekly Progress Summary</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.weeklyProgress}
                  onChange={() => handleToggleSetting('weeklyProgress')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <p className="font-medium">Incomplete Quiz Reminders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.quizReminder}
                  onChange={() => handleToggleSetting('quizReminder')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <BellRing className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="font-medium">New Content Alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.newContent}
                  onChange={() => handleToggleSetting('newContent')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Saving...' : 'Save Notification Settings'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
