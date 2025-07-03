import { NextResponse } from 'next/server';
import { whatsappService, validatePhoneNumber, NOTIFICATION_TYPES } from '@/lib/whatsappService';

/**
 * WhatsApp Notifications API
 * 
 * This endpoint allows sending various types of WhatsApp notifications:
 * - Quiz results
 * - Lesson completions
 * - Achievements
 * - Custom messages
 * 
 * POST /api/whatsapp/send
 * Body: {
 *   type: 'quiz_result' | 'lesson_completion' | 'achievement' | 'custom',
 *   to: 'phone_number',
 *   data: { ... notification specific data }
 * }
 */

export async function POST(request) {
  try {
    const { type, to, data } = await request.json();

    // Validate required fields
    if (!type || !to) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: type and to'
      }, { status: 400 });
    }

    // Validate phone number
    const phoneValidation = validatePhoneNumber(to);
    if (!phoneValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number format. Use international format without + sign.'
      }, { status: 400 });
    }

    let result;

    // Handle different notification types
    switch (type) {
      case NOTIFICATION_TYPES.QUIZ_RESULT:
        if (!data.userName || !data.quizTitle || data.score === undefined || !data.totalQuestions) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields for quiz result: userName, quizTitle, score, totalQuestions'
          }, { status: 400 });
        }
        result = await whatsappService.sendQuizResultNotification(
          phoneValidation.formatted,
          data.userName,
          data.quizTitle,
          data.score,
          data.totalQuestions
        );
        break;

      case NOTIFICATION_TYPES.LESSON_COMPLETION:
        if (!data.userName || !data.lessonTitle) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields for lesson completion: userName, lessonTitle'
          }, { status: 400 });
        }
        result = await whatsappService.sendLessonCompletionNotification(
          phoneValidation.formatted,
          data.userName,
          data.lessonTitle
        );
        break;

      case NOTIFICATION_TYPES.ACHIEVEMENT:
        if (!data.userName || !data.achievementName || !data.achievementDescription) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields for achievement: userName, achievementName, achievementDescription'
          }, { status: 400 });
        }
        result = await whatsappService.sendAchievementNotification(
          phoneValidation.formatted,
          data.userName,
          data.achievementName,
          data.achievementDescription
        );
        break;

      case NOTIFICATION_TYPES.DAILY_REMINDER:
        if (!data.userName) {
          return NextResponse.json({
            success: false,
            error: 'Missing required field for daily reminder: userName'
          }, { status: 400 });
        }
        result = await whatsappService.sendDailyReminder(
          phoneValidation.formatted,
          data.userName
        );
        break;

      case NOTIFICATION_TYPES.CUSTOM:
        if (!data.message) {
          return NextResponse.json({
            success: false,
            error: 'Missing required field for custom message: message'
          }, { status: 400 });
        }
        result = await whatsappService.sendTextMessage(
          phoneValidation.formatted,
          data.message
        );
        break;

      default:
        return NextResponse.json({
          success: false,
          error: `Unsupported notification type: ${type}`
        }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in WhatsApp send API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send WhatsApp message'
    }, { status: 500 });
  }
}

export async function GET(request) {
  // Return API documentation and status
  return NextResponse.json({
    service: 'WhatsApp Notifications API',
    status: 'active',
    endpoints: {
      send: {
        method: 'POST',
        url: '/api/whatsapp/send',
        description: 'Send WhatsApp notifications',
        types: Object.values(NOTIFICATION_TYPES)
      },
      webhook: {
        method: 'GET/POST',
        url: '/api/whatsapp/webhook',
        description: 'WhatsApp webhook for incoming messages'
      }
    },
    examples: {
      quiz_result: {
        type: 'quiz_result',
        to: '250781234567',
        data: {
          userName: 'John Doe',
          quizTitle: 'Rwanda Governance Quiz',
          score: 8,
          totalQuestions: 10
        }
      },
      lesson_completion: {
        type: 'lesson_completion',
        to: '250781234567',
        data: {
          userName: 'John Doe',
          lessonTitle: 'Understanding Rwanda\'s Constitution'
        }
      },
      achievement: {
        type: 'achievement',
        to: '250781234567',
        data: {
          userName: 'John Doe',
          achievementName: 'Quiz Master',
          achievementDescription: 'Completed 10 quizzes with 80%+ score'
        }
      },
      custom: {
        type: 'custom',
        to: '250781234567',
        data: {
          message: 'Welcome to Rwanda Civic Education!'
        }
      }
    }
  });
}
