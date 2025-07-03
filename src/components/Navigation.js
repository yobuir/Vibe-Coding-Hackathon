'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  Trophy, 
  Target, 
  Book, 
  BookOpen,
  User, 
  Settings, 
  Menu, 
  X,
  Sparkles,
  LogOut,
  Bell,
  Users,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logout, loading } = useAuth();

  const isActive = (href) => pathname === href;
  
  // Define navigation based on user role
  const generateNavigation = () => {
    // Base navigation for all authenticated users
    const baseNav = [
      { name: 'Home', href: '/', icon: Home },
      { name: 'Dashboard', href: '/dashboard', icon: Book },
      { name: 'Lessons', href: '/lessons', icon: BookOpen },
      { name: 'Quiz', href: '/quiz', icon: Trophy },
      { name: 'Simulations', href: '/simulations', icon: Target },
      { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
      { name: 'Subscription', href: '/subscription', icon: Sparkles },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Profile', href: '/profile', icon: User },
    ];
    
    // Add teacher dashboard if user has teacher role
    if (profile?.role === 'teacher') {
      baseNav.push({ name: 'Teacher Dashboard', href: '/teacher', icon: Users });
    }
    
    // Add admin navigation if user has admin role
    if (profile?.role === 'admin' || profile?.role === 'teacher') {
      baseNav.push({ name: 'Admin', href: '/admin', icon: Settings });
    }
    
    return baseNav;
  };

  const navigation = generateNavigation();

  const handleLogout = async () => {
    const { error } = await logout();
    if (!error) {
      router.push('/');
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="md:hidden fixed inset-0 z-40 bg-white dark:bg-slate-800 p-4"
        >
          <div className="mt-16">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CivicSpark AI
              </h1>
            </div>
            
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </motion.div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 shadow-lg z-30">
        <div className="flex flex-col w-full">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CivicSpark AI
              </h1>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            {loading ? (
              <div className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Loading...</span>
              </div>
            ) : profile ? (
              <div className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400">
                <User className="w-5 h-5" />
                <span className="font-medium">{profile.full_name || 'User'}</span>
              </div>
            ) : null}
            
            <Link href="/profile" className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors w-full">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
