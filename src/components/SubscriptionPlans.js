'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Star, Crown, Zap, Download, Users, FileCheck } from 'lucide-react';

export default function SubscriptionPlans() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'free',
      name: 'Basic',
      icon: Star,
      iconColor: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      description: 'Start your civic education journey',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        { name: 'Access to basic quizzes', included: true },
        { name: 'Limited simulations', included: true },
        { name: 'Leaderboard participation', included: true },
        { name: 'Basic achievements', included: true },
        { name: 'Ad-supported experience', included: true },
        { name: 'Premium content access', included: false },
        { name: 'Downloadable certificates', included: false },
        { name: 'SMS & WhatsApp reminders', included: false },
        { name: 'Parental progress reports', included: false },
        { name: 'Offline mode', included: false },
      ],
      buttonText: 'Current Plan',
      buttonColor: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: Crown,
      iconColor: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      description: 'For dedicated civic learners',
      mostPopular: true,
      monthlyPrice: 2.99,
      yearlyPrice: 29.99,
      features: [
        { name: 'Access to basic quizzes', included: true },
        { name: 'All simulations', included: true },
        { name: 'Leaderboard participation', included: true },
        { name: 'Advanced achievements', included: true },
        { name: 'Ad-free experience', included: true },
        { name: 'Premium content access', included: true },
        { name: 'Downloadable certificates', included: true },
        { name: 'SMS & WhatsApp reminders', included: true },
        { name: 'Parental progress reports', included: false },
        { name: 'Offline mode', included: false },
      ],
      buttonText: 'Upgrade to Premium',
      buttonColor: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
    },
    {
      id: 'family',
      name: 'Family',
      icon: Users,
      iconColor: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      description: 'Perfect for parents & children',
      monthlyPrice: 4.99,
      yearlyPrice: 49.99,
      features: [
        { name: 'Access to basic quizzes', included: true },
        { name: 'All simulations', included: true },
        { name: 'Leaderboard participation', included: true },
        { name: 'Advanced achievements', included: true },
        { name: 'Ad-free experience', included: true },
        { name: 'Premium content access', included: true },
        { name: 'Downloadable certificates', included: true },
        { name: 'SMS & WhatsApp reminders', included: true },
        { name: 'Parental progress reports', included: true },
        { name: 'Offline mode', included: true },
      ],
      buttonText: 'Upgrade to Family',
      buttonColor: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
    }
  ];

  const handleSelectPlan = (planId) => {
    if (planId === 'free') return; // Free plan is not selectable
    setSelectedPlan(planId);
    // Here you would typically redirect to a payment page or open a payment modal
    // For now we'll just show an alert
    alert(`Selected plan: ${planId} with ${billingCycle} billing. In a real app, this would open payment processing.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-8"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Choose Your CivicSpark Plan</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Invest in your civic education journey with our flexible subscription options.
          All plans help support our mission to improve civic education in Rwanda.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly' 
                ? 'bg-white dark:bg-slate-700 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly' 
                ? 'bg-white dark:bg-slate-700 shadow-sm flex items-center' 
                : 'text-slate-600 dark:text-slate-400 flex items-center'
            }`}
          >
            Yearly
            <span className="ml-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm ${
              plan.mostPopular ? 'ring-2 ring-blue-500 dark:ring-blue-400' : 'border border-slate-200 dark:border-slate-700'
            }`}
          >
            {plan.mostPopular && (
              <div className="bg-blue-500 text-white text-sm font-medium text-center py-1 rounded-t-2xl">
                Most Popular
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${plan.iconColor} flex items-center justify-center`}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <p className="text-4xl font-bold">
                  {billingCycle === 'monthly' 
                    ? `${plan.monthlyPrice === 0 ? 'Free' : `RWF ${plan.monthlyPrice * 1200}`}` 
                    : `RWF ${plan.yearlyPrice * 1200}`
                  }
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {plan.monthlyPrice === 0 ? 'Forever' : billingCycle === 'monthly' ? 'per month' : 'per year'}
                </p>
              </div>
              
              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3 rounded-lg mb-6 font-medium transition-all ${plan.buttonColor} ${
                  plan.id === 'free' ? 'cursor-default' : 'hover:shadow-md'
                }`}
              >
                {plan.buttonText}
              </button>
              
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    {feature.included ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Packs Section */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-3">Additional Content Packs</h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Enhance your learning with specialized curriculum-aligned content packs
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Rwandan Democracy Pack</h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">In-depth lessons on Rwanda's democratic processes</p>
            <p className="font-medium mb-3">RWF 5,000</p>
            <button className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm">
              Add to Subscription
            </button>
          </div>
          
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Civic Rights Bundle</h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">Complete guide to citizen rights and responsibilities</p>
            <p className="font-medium mb-3">RWF 6,500</p>
            <button className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm">
              Add to Subscription
            </button>
          </div>
          
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Local Government Pack</h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">Understand community governance and participation</p>
            <p className="font-medium mb-3">RWF 4,000</p>
            <button className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm">
              Add to Subscription
            </button>
          </div>
          
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Advanced Simulation Pack</h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">Complex civic scenarios for advanced learners</p>
            <p className="font-medium mb-3">RWF 7,500</p>
            <button className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm">
              Add to Subscription
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
