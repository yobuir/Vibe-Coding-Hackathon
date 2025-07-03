'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Trophy, 
  Users, 
  BookOpen, 
  Award, 
  ChevronRight, 
  Sparkles,
  Target,
  Globe,
  Heart
} from 'lucide-react'; 

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "Gamified Learning",
      description: "Turn civic education into an engaging game with points, badges, and leaderboards",
      icon: Trophy,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "AI-Powered Quizzes",
      description: "Smart quizzes that adapt to your learning pace and provide instant feedback",
      icon: Zap,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Real-World Simulations",
      description: "Practice local elections, budget planning, and citizen rights scenarios",
      icon: Users,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Microlearning Modules",
      description: "Bite-sized lessons that fit into any schedule with WhatsApp/SMS reminders",
      icon: BookOpen,
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Students Learning", icon: Users },
    { number: "500+", label: "Civic Lessons", icon: BookOpen },
    { number: "15+", label: "Countries", icon: Globe },
    { number: "95%", label: "Engagement Rate", icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CivicSpark AI
          </h1>
        </div>
        <nav className="hidden md:flex space-x-6">
          <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
          <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 transition-colors">How It Works</a>
          <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
        </nav>
        <div className="flex space-x-2">
          <a href="/auth" className="px-4 py-2 text-slate-600 hover:text-blue-600 transition-colors">
            Login
          </a>
          <a href="/dashboard" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
            Get Started
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Revolutionize Civic Education with AI
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Transform boring civics lessons into engaging, gamified experiences. 
            Learn about your rights, duties, and democratic processes through interactive AI-powered microlearning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/dashboard" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl transition-all duration-200 flex items-center justify-center">
              Start Learning Now
              <ChevronRight className="w-5 h-5 ml-2" />
            </a> 
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-2">{stat.number}</div>
              <div className="text-slate-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4 text-slate-800">
            Why Choose CivicSpark AI?
          </h3>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with proven educational methods to make civic learning engaging and effective.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-slate-800">
                {feature.title}
              </h4>
              <p className="text-slate-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-12 text-white"
        >
          <h3 className="text-4xl font-bold mb-4">
            Ready to Spark Civic Engagement?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students already learning with CivicSpark AI. Start your journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth" className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-200">
              Get Started Free
            </a>
            <a href="/subscription" className="px-8 py-4 border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200">
              View Plans
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-slate-200">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-800">CivicSpark AI</span>
            </div>
            <p className="text-slate-600">
              Making civic education accessible, engaging, and effective for everyone.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-slate-800">Product</h4>
            <ul className="space-y-2 text-slate-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-slate-800">Company</h4>
            <ul className="space-y-2 text-slate-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-slate-800">Support</h4>
            <ul className="space-y-2 text-slate-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-200 text-center text-slate-600">
          <p>&copy; 2025 CivicSpark AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
