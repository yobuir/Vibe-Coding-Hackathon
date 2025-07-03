'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { signIn, signUp, supabase } from '@/lib/supabase';
import { createUserProfile } from '@/lib/migrations';
import { Eye, EyeOff, AtSign, Lock, UserPlus, LogIn } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password);
        
        // If signup successful and we have user data, create a profile
        if (result.data && result.data.user) {
          try {
            console.log("Attempting to create profile for user:", result.data.user.id);
            
            // Create user profile using our migration helper function
            const profileResult = await createUserProfile(result.data.user.id, {
              full_name: name,
              email: email,
              points: 0,
              level: 1,
              streak: 0,
              completed_lessons: 0
            });
              
            if (!profileResult.success) {
              console.error("Error creating profile:", profileResult.error);
              setError(`Profile creation failed: ${profileResult.error?.message || "Unknown error"}`);
            } else {
              setSuccess("Profile created successfully, check email for verification.");
              console.log("Profile created successfully:", profileResult.data);
            }
          } catch (profileErr) {
            console.error("Profile creation exception:", profileErr);
            setError(`Profile creation exception: ${profileErr.message || "Unknown error"}`);
          }
        }
      }

      if (result.error) {
        console.log(result);
        setError(result.error.message);
      } else if (!error) {  // Only redirect if no profile error was set
        // Pass the user data to parent component
        onAuthSuccess(result.data.user);
      }
    } catch (err) {
      console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          {isLogin ? (
            <LogIn className="w-8 h-8 text-white" />
          ) : (
            <UserPlus className="w-8 h-8 text-white" />
          )}
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isLogin ? 'Welcome Back' : 'Join CivicSpark AI'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          {isLogin 
            ? 'Sign in to continue your civic education journey' 
            : 'Create an account to start learning about civics'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg mb-6 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleAuth}>
        {!isLogin && (
          <div className="mb-4">
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Full Name
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 pl-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
                placeholder="Enter your full name"
                required={!isLogin}
              />
              <div className="absolute left-3 top-3 text-slate-400">
                <UserPlus className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
              placeholder="Enter your email"
              required
            />
            <div className="absolute left-3 top-3 text-slate-400">
              <AtSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pl-10 pr-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
              placeholder="Enter your password"
              required
            />
            <div className="absolute left-3 top-3 text-slate-400">
              <Lock className="w-5 h-5" />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading 
            ? 'Processing...' 
            : isLogin ? 'Sign In' : 'Create Account'
          }
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={toggleAuthMode}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isLogin 
            ? "Don't have an account? Sign Up" 
            : "Already have an account? Sign In"}
        </button>
      </div>
    </motion.div>
  );
}
