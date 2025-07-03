'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, CheckCircle, XCircle, Loader2, Phone, User, Trophy, BookOpen } from 'lucide-react';

export default function WhatsAppTestPage() {
  const [sendStatus, setSendStatus] = useState(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'custom',
    to: '',
    userName: 'Test User',
    message: 'Hello from Rwanda Civic Education! 🇷🇼',
    quizTitle: 'Rwanda Governance Quiz',
    score: 8,
    totalQuestions: 10,
    lessonTitle: 'Understanding Rwanda\'s Constitution',
    achievementName: 'Quiz Master',
    achievementDescription: 'Completed 10 quizzes with 80%+ score'
  });

  const notificationTypes = [
    { value: 'custom', label: 'Custom Message', icon: MessageCircle },
    { value: 'quiz_result', label: 'Quiz Result', icon: Trophy },
    { value: 'lesson_completion', label: 'Lesson Completion', icon: BookOpen },
    { value: 'achievement', label: 'Achievement', icon: Trophy },
    { value: 'daily_reminder', label: 'Daily Reminder', icon: User }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const sendTestMessage = async () => {
    setSendLoading(true);
    setSendStatus(null);

    try {
      // Prepare data based on notification type
      let data = {};
      
      switch (formData.type) {
        case 'custom':
          data = { message: formData.message };
          break;
        case 'quiz_result':
          data = {
            userName: formData.userName,
            quizTitle: formData.quizTitle,
            score: parseInt(formData.score),
            totalQuestions: parseInt(formData.totalQuestions)
          };
          break;
        case 'lesson_completion':
          data = {
            userName: formData.userName,
            lessonTitle: formData.lessonTitle
          };
          break;
        case 'achievement':
          data = {
            userName: formData.userName,
            achievementName: formData.achievementName,
            achievementDescription: formData.achievementDescription
          };
          break;
        case 'daily_reminder':
          data = { userName: formData.userName };
          break;
      }

      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          to: formData.to,
          data: data
        })
      });

      const result = await response.json();
      setSendStatus(result);
    } catch (error) {
      setSendStatus({
        success: false,
        error: error.message
      });
    } finally {
      setSendLoading(false);
    }
  };

  const StatusIcon = ({ success, loading }) => {
    if (loading) return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    if (success === true) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (success === false) return <XCircle className="w-5 h-5 text-red-500" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <MessageCircle className="w-8 h-8 mr-3 text-green-600" />
            WhatsApp Notifications Test
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Test WhatsApp notification functionality for the Rwanda Civic Education app
          </p>
        </div>

        <div className="space-y-6">
          {/* Configuration Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-4">WhatsApp Configuration</h2>
            
            <div className="space-y-4">
              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Notification Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  {notificationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number (International format, no +)
                </label>
                <input
                  type="text"
                  value={formData.to}
                  onChange={(e) => handleInputChange('to', e.target.value)}
                  placeholder="250781234567"
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Example: 250781234567 (Rwanda number without + sign)
                </p>
              </div>

              {/* User Name */}
              {formData.type !== 'custom' && (
                <div>
                  <label className="block text-sm font-medium mb-2">User Name</label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => handleInputChange('userName', e.target.value)}
                    placeholder="Enter user name"
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              {/* Custom Message */}
              {formData.type === 'custom' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Enter your custom message..."
                    rows={4}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              {/* Quiz Result Fields */}
              {formData.type === 'quiz_result' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quiz Title</label>
                    <input
                      type="text"
                      value={formData.quizTitle}
                      onChange={(e) => handleInputChange('quizTitle', e.target.value)}
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Score</label>
                    <input
                      type="number"
                      value={formData.score}
                      onChange={(e) => handleInputChange('score', e.target.value)}
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Questions</label>
                    <input
                      type="number"
                      value={formData.totalQuestions}
                      onChange={(e) => handleInputChange('totalQuestions', e.target.value)}
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* Lesson Completion Fields */}
              {formData.type === 'lesson_completion' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Lesson Title</label>
                  <input
                    type="text"
                    value={formData.lessonTitle}
                    onChange={(e) => handleInputChange('lessonTitle', e.target.value)}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              {/* Achievement Fields */}
              {formData.type === 'achievement' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Achievement Name</label>
                    <input
                      type="text"
                      value={formData.achievementName}
                      onChange={(e) => handleInputChange('achievementName', e.target.value)}
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Achievement Description</label>
                    <textarea
                      value={formData.achievementDescription}
                      onChange={(e) => handleInputChange('achievementDescription', e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Send Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Send Test Message</h2>
              <StatusIcon success={sendStatus?.success} loading={sendLoading} />
            </div>

            <button
              onClick={sendTestMessage}
              disabled={sendLoading || !formData.to}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg font-medium"
            >
              {sendLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send WhatsApp Message
                </>
              )}
            </button>

            {sendStatus && (
              <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
                <h3 className="font-medium mb-2">Send Results:</h3>
                {sendStatus.success ? (
                  <div className="space-y-2 text-sm">
                    <div className="text-green-600 dark:text-green-400">
                      ✅ Message sent successfully!
                    </div>
                    {sendStatus.messageId && (
                      <div className="bg-white dark:bg-slate-800 p-3 rounded border">
                        <div><strong>Message ID:</strong> {sendStatus.messageId}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600 dark:text-red-400 text-sm">
                    ❌ Error: {sendStatus.error || 'Failed to send message'}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Setup Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4">WhatsApp Business API Setup</h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium mb-2">1. Get WhatsApp Business API Access</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Developers</a></li>
                  <li>Create a new app and add WhatsApp product</li>
                  <li>Complete business verification process</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">2. Configure Environment Variables</h3>
                <div className="bg-white dark:bg-slate-800 p-3 rounded border font-mono text-xs">
                  <div>WHATSAPP_ACCESS_TOKEN=your_access_token_here</div>
                  <div>WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here</div>
                  <div>WHATSAPP_VERIFY_TOKEN=your_verify_token_here</div>
                  <div>WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here</div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">3. Set Up Webhook</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>Webhook URL: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">https://yourdomain.com/api/whatsapp/webhook</code></li>
                  <li>Subscribe to messages events</li>
                  <li>Use your verify token for webhook verification</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
