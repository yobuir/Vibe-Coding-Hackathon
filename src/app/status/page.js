'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity,
  Database,
  Server,
  Users,
  BookOpen,
  Trophy,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function SystemStatusPage() {
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const checkSystemHealth = async () => {
    setLoading(true);
    const checks = {};

    try {
      // Test Database Connection
      const dbResponse = await fetch('/api/debug-db');
      checks.database = {
        status: dbResponse.ok ? 'healthy' : 'error',
        response_time: 0,
        message: dbResponse.ok ? 'Database connected' : 'Database connection failed'
      };

      // Test Lessons API
      const lessonsResponse = await fetch('/api/lessons');
      checks.lessons_api = {
        status: lessonsResponse.ok ? 'healthy' : 'error',
        response_time: 0,
        message: lessonsResponse.ok ? 'Lessons API operational' : 'Lessons API unavailable'
      };

      // Test Progress API
      const progressResponse = await fetch('/api/lessons/progress?userId=test-health-check');
      checks.progress_api = {
        status: progressResponse.ok ? 'healthy' : 'error',
        response_time: 0,
        message: progressResponse.ok ? 'Progress API operational' : 'Progress API unavailable'
      };

      // Test Migration API
      const migrationResponse = await fetch('/api/migrate-and-seed');
      checks.migrations = {
        status: migrationResponse.ok ? 'healthy' : 'warning',
        response_time: 0,
        message: migrationResponse.ok ? 'Database schema up to date' : 'Migration issues detected'
      };

      // Calculate overall health
      const healthyServices = Object.values(checks).filter(check => check.status === 'healthy').length;
      const totalServices = Object.keys(checks).length;
      
      checks.overall = {
        status: healthyServices === totalServices ? 'healthy' : 
                healthyServices > totalServices / 2 ? 'warning' : 'error',
        healthy_services: healthyServices,
        total_services: totalServices,
        uptime_percentage: Math.round((healthyServices / totalServices) * 100)
      };

    } catch (error) {
      checks.overall = {
        status: 'error',
        message: 'System health check failed',
        error: error.message
      };
    }

    setStatus(checks);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Navigation />
      
      <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">System Status</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Real-time monitoring of CivicSpark AI platform health
              </p>
            </div>
            
            <button
              onClick={checkSystemHealth}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh Status
            </button>
          </div>

          {/* Overall Status */}
          {status.overall && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Overall System Health</h2>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(status.overall.status)}`}>
                  {status.overall.status.toUpperCase()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {status.overall.uptime_percentage || 0}%
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">System Uptime</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {status.overall.healthy_services || 0}/{status.overall.total_services || 0}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Services Online</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {lastUpdate ? lastUpdate.toLocaleTimeString() : '--'}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Last Updated</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Service Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(status).filter(([key]) => key !== 'overall').map(([service, data], index) => (
              <motion.div
                key={service}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {service === 'database' && <Database className="w-6 h-6 mr-3 text-blue-500" />}
                    {service === 'lessons_api' && <BookOpen className="w-6 h-6 mr-3 text-green-500" />}
                    {service === 'progress_api' && <TrendingUp className="w-6 h-6 mr-3 text-purple-500" />}
                    {service === 'migrations' && <Server className="w-6 h-6 mr-3 text-orange-500" />}
                    
                    <h3 className="text-lg font-semibold capitalize">
                      {service.replace(/_/g, ' ')}
                    </h3>
                  </div>
                  
                  {getStatusIcon(data.status)}
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block mb-3 ${getStatusColor(data.status)}`}>
                  {data.status.toUpperCase()}
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {data.message}
                </p>
                
                {data.response_time !== undefined && (
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    Response time: {data.response_time}ms
                  </div>
                )}
                
                {data.error && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
                    {data.error}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* System Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mt-8"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              System Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Platform</p>
                <p className="font-medium">CivicSpark AI</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Version</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Environment</p>
                <p className="font-medium">{process.env.NODE_ENV || 'development'}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Last Deployment</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mt-8"
          >
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <a 
                href="/test-lessons"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Test Lessons Feature
              </a>
              <a 
                href="/api/debug-db"
                target="_blank"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Database Debug
              </a>
              <a 
                href="/lessons"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                View Lessons
              </a>
              <a 
                href="/dashboard"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                User Dashboard
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
