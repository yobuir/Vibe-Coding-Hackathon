'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Download, 
  Share2, 
  Lock, 
  Edit3, 
  CheckCircle, 
  XCircle,
  Globe,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // User data - would come from Supabase in a real implementation
  const [userData, setUserData] = useState({
    name: 'Jean Mutoni',
    email: 'jean.mutoni@example.com',
    phone: '+250781234567',
    location: 'Kigali, Rwanda',
    birthDate: '1998-05-12',
    joinDate: '2023-11-10',
    bio: 'Student at University of Rwanda, passionate about civic education and local politics.',
    language: 'Kinyarwanda, English',
    profileImage: null,
  });
  
  // Stats data
  const stats = [
    { label: 'Completed Lessons', value: '47', icon: BookOpen, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'Learning Hours', value: '32', icon: Clock, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { label: 'Achievements', value: '8', icon: Award, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    { label: 'Points Earned', value: '2,750', icon: Award, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  ];
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Simulating API call
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Navigation />
      
      <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                My Profile
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your account information and learning preferences
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {isEditing ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2 text-slate-500" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2 text-slate-500" />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-4 rounded-lg mb-6 flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>Your profile has been updated successfully!</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6 flex items-start">
              <XCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-6"
              >
                <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                
                {isEditing ? (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="name">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={userData.name}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="email">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="phone">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={userData.phone}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="location">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={userData.location}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="bio">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={userData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="language">
                        Languages
                      </label>
                      <input
                        type="text"
                        id="language"
                        name="language"
                        value={userData.language}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-md transition-all"
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Full Name</p>
                        <p className="font-medium">{userData.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
                        <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Email Address</p>
                        <p className="font-medium">{userData.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                        <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Phone Number</p>
                        <p className="font-medium">{userData.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mr-4">
                        <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                        <p className="font-medium">{userData.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-4">
                        <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Joined</p>
                        <p className="font-medium">{new Date(userData.joinDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mr-4">
                        <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Bio</p>
                        <p className="font-medium">{userData.bio}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mr-4">
                        <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Languages</p>
                        <p className="font-medium">{userData.language}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
              
              {!isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-semibold mb-6">Learning Statistics</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                      <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center">
                        <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-2xl font-bold mb-1">{stat.value}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Sidebar */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-6"
              >
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-1">{userData.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">Civic Learner</p>
                  
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mb-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-3/4"></div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Level 4 • 75% to Level 5</p>
                  
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <button className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </button>
                    <button className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center mb-6">
                  <Lock className="w-5 h-5 text-slate-500 dark:text-slate-400 mr-2" />
                  <h3 className="text-lg font-semibold">Account Security</h3>
                </div>
                
                <button className="w-full py-2 mb-3 px-4 bg-slate-100 dark:bg-slate-700 rounded-lg text-left hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-between">
                  <span className="text-sm">Change Password</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
                
                <button className="w-full py-2 mb-3 px-4 bg-slate-100 dark:bg-slate-700 rounded-lg text-left hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-between">
                  <span className="text-sm">Two-Factor Authentication</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
                
                <button className="w-full py-2 px-4 bg-slate-100 dark:bg-slate-700 rounded-lg text-left hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-between">
                  <span className="text-sm">Login History</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
