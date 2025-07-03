'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import withErrorBoundary from '@/components/withErrorBoundary';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Award, 
  Settings, 
  Plus,
  Download,
  Eye,
  Edit3,
  Trash2,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';

function TeacherDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for teacher dashboard
  const mockClassData = {
    totalStudents: 45,
    activeStudents: 38,
    lessonsCompleted: 127,
    averageProgress: 76,
    classes: [
      {
        id: 1,
        name: "Civic Education 2025A",
        students: 23,
        progress: 82,
        lastActivity: "2 hours ago"
      },
      {
        id: 2,
        name: "Democracy Fundamentals B",
        students: 22,
        progress: 69,
        lastActivity: "1 day ago"
      }
    ],
    recentActivity: [
      {
        student: "Jean Mukamana",
        action: "Completed lesson",
        lesson: "Understanding Local Government",
        time: "30 minutes ago"
      },
      {
        student: "Emmanuel Nkurunziza",
        action: "Achieved badge",
        lesson: "Civic Champion",
        time: "1 hour ago"
      },
      {
        student: "Grace Uwimana",
        action: "Started quiz",
        lesson: "Constitutional Rights",
        time: "2 hours ago"
      }
    ],
    performance: {
      weeklyEngagement: 87,
      completionRate: 74,
      averageScore: 85,
      improvement: 12
    }
  };

  useEffect(() => {
    // Simulate loading teacher data
    const timer = setTimeout(() => {
      setClassData(mockClassData);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{classData?.totalStudents || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{classData?.activeStudents || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
              <p className="text-2xl font-bold text-gray-900">{classData?.lessonsCompleted || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Progress</p>
              <p className="text-2xl font-bold text-gray-900">{classData?.averageProgress || 0}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Classes and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Classes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Classes</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {classData?.classes?.map((classItem) => (
              <div key={classItem.id} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{classItem.name}</h4>
                  <span className="text-sm text-gray-500">{classItem.lastActivity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{classItem.students} students</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-600 rounded-full" 
                        style={{ width: `${classItem.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{classItem.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {classData?.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.student}</span> {activity.action}
                  </p>
                  <p className="text-sm text-gray-600">{activity.lesson}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Student Management</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </button>
      </div>
      
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">Student Management</h4>
        <p className="text-gray-600">Detailed student management features coming soon.</p>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Class Analytics</h3>
        <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>
      
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">Detailed Analytics</h4>
        <p className="text-gray-600">Advanced analytics and reporting features coming soon.</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
          <p className="text-gray-600">Manage your classes and track student progress</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'students' && renderStudents()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Teacher Settings</h3>
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Settings Panel</h4>
                <p className="text-gray-600">Teacher preferences and settings coming soon.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default withErrorBoundary(TeacherDashboard);
