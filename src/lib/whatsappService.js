/**
 * WhatsApp Business API Service
 * 
 * This service handles WhatsApp message sending using the official WhatsApp Business API.
 * You'll need to set up a WhatsApp Business Account and get API credentials.
 * 
 * Setup Instructions:
 * 1. Go to https://developers.facebook.com/
 * 2. Create a new app and add WhatsApp product
 * 3. Get your access token, phone number ID, and verify token
 * 4. Add these to your .env.local file
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    
    if (!this.accessToken || !this.phoneNumberId) {
      console.warn('WhatsApp credentials not configured. Check your environment variables.');
    }
  }

  /**
   * Send a text message via WhatsApp
   */
  async sendTextMessage(to, message) {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        throw new Error('WhatsApp credentials not configured');
      }

      const response = await fetch(`${WHATSAPP_API_URL}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: {
            body: message
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.messages[0].id,
        data: result
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send a template message via WhatsApp
   */
  async sendTemplateMessage(to, templateName, languageCode = 'en', parameters = []) {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        throw new Error('WhatsApp credentials not configured');
      }

      const templateData = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          }
        }
      };

      // Add parameters if provided
      if (parameters.length > 0) {
        templateData.template.components = [{
          type: 'body',
          parameters: parameters.map(param => ({
            type: 'text',
            text: param
          }))
        }];
      }

      const response = await fetch(`${WHATSAPP_API_URL}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.messages[0].id,
        data: result
      };
    } catch (error) {
      console.error('Error sending WhatsApp template:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send quiz result notification
   */
  async sendQuizResultNotification(to, userName, quizTitle, score, totalQuestions) {
    const message = `🎉 Quiz Results for ${userName}!\n\n` +
                   `Quiz: ${quizTitle}\n` +
                   `Score: ${score}/${totalQuestions} (${Math.round((score/totalQuestions)*100)}%)\n\n` +
                   `Great job on completing your civic education quiz! Keep learning about Rwanda's governance and democracy. 🇷🇼`;

    return await this.sendTextMessage(to, message);
  }

  /**
   * Send lesson completion notification
   */
  async sendLessonCompletionNotification(to, userName, lessonTitle) {
    const message = `📚 Lesson Completed!\n\n` +
                   `Congratulations ${userName}! You've successfully completed:\n` +
                   `"${lessonTitle}"\n\n` +
                   `Continue your civic education journey and explore more lessons about Rwanda! 🇷🇼`;

    return await this.sendTextMessage(to, message);
  }

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(to, userName, achievementName, achievementDescription) {
    const message = `🏆 New Achievement Unlocked!\n\n` +
                   `Congratulations ${userName}!\n` +
                   `You've earned: ${achievementName}\n\n` +
                   `${achievementDescription}\n\n` +
                   `Keep up the excellent work in your civic education journey! 🇷🇼`;

    return await this.sendTextMessage(to, message);
  }

  /**
   * Send daily reminder
   */
  async sendDailyReminder(to, userName) {
    const message = `🌅 Good morning ${userName}!\n\n` +
                   `Don't forget to continue your civic education journey today.\n` +
                   `Take a quiz, complete a lesson, or explore Rwanda's governance system.\n\n` +
                   `Every step makes you a more informed citizen! 🇷🇼`;

    return await this.sendTextMessage(to, message);
  }

  /**
   * Verify webhook (for WhatsApp webhook setup)
   */
  verifyWebhook(mode, token, challenge) {
    if (mode === 'subscribe' && token === this.verifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Process incoming webhook message
   */
  processIncomingMessage(body) {
    try {
      if (body.object === 'whatsapp_business_account') {
        const changes = body.entry?.[0]?.changes?.[0];
        if (changes?.field === 'messages') {
          const messages = changes.value?.messages;
          if (messages && messages.length > 0) {
            return {
              success: true,
              messages: messages.map(msg => ({
                id: msg.id,
                from: msg.from,
                text: msg.text?.body,
                type: msg.type,
                timestamp: msg.timestamp
              }))
            };
          }
        }
      }
      return { success: false, error: 'No valid messages found' };
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();

// Export class for testing
export { WhatsAppService };

// Helper function to validate phone number format
export const validatePhoneNumber = (phoneNumber) => {
  // WhatsApp requires phone numbers in international format without + sign
  const phoneRegex = /^\d{10,15}$/;
  const cleanNumber = phoneNumber.replace(/[\s\-\+\(\)]/g, '');
  
  return {
    isValid: phoneRegex.test(cleanNumber),
    formatted: cleanNumber,
    original: phoneNumber
  };
};

// Export notification types for easy reference
export const NOTIFICATION_TYPES = {
  QUIZ_RESULT: 'quiz_result',
  LESSON_COMPLETION: 'lesson_completion',
  ACHIEVEMENT: 'achievement',
  DAILY_REMINDER: 'daily_reminder',
  CUSTOM: 'custom'
};
