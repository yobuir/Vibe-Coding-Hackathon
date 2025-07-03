import { NextResponse } from 'next/server';
import { whatsappService } from '@/lib/whatsappService';

/**
 * WhatsApp Webhook Handler
 * 
 * This endpoint handles WhatsApp webhook events including:
 * - Webhook verification (GET)
 * - Incoming messages (POST)
 * 
 * Setup Instructions:
 * 1. Set up your WhatsApp Business API webhook URL to point to: /api/whatsapp/webhook
 * 2. Configure your verify token in environment variables
 * 3. Subscribe to message events in your WhatsApp Business account
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('WhatsApp webhook verification:', { mode, token, challenge });

    const verificationResult = whatsappService.verifyWebhook(mode, token, challenge);
    
    if (verificationResult) {
      console.log('WhatsApp webhook verification successful');
      return new Response(verificationResult, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    } else {
      console.log('WhatsApp webhook verification failed');
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('Error in WhatsApp webhook verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received WhatsApp webhook:', JSON.stringify(body, null, 2));

    const result = whatsappService.processIncomingMessage(body);
    
    if (result.success && result.messages) {
      // Process each incoming message
      for (const message of result.messages) {
        await handleIncomingMessage(message);
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ status: 'received' });
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    // Still return 200 to avoid webhook retries
    return NextResponse.json({ status: 'error', error: error.message });
  }
}

/**
 * Handle incoming WhatsApp messages
 */
async function handleIncomingMessage(message) {
  try {
    console.log('Processing incoming message:', message);

    if (message.type === 'text') {
      const text = message.text?.toLowerCase();
      const from = message.from;

      // Simple command handling
      if (text.includes('quiz')) {
        await whatsappService.sendTextMessage(
          from, 
          "🧠 Ready for a quiz? Visit our civic education app to take quizzes about Rwanda's governance, democracy, and history!\n\nLearn more at: [Your App URL]"
        );
      } else if (text.includes('lesson')) {
        await whatsappService.sendTextMessage(
          from,
          "📚 Explore our civic education lessons! Learn about Rwanda's constitution, government institutions, and democratic processes.\n\nVisit: [Your App URL]"
        );
      } else if (text.includes('help') || text.includes('start')) {
        await whatsappService.sendTextMessage(
          from,
          "🇷🇼 Welcome to Rwanda Civic Education!\n\n" +
          "I can help you with:\n" +
          "• 🧠 Quizzes - Type 'quiz' to learn about available quizzes\n" +
          "• 📚 Lessons - Type 'lesson' for educational content\n" +
          "• 🏆 Achievements - Track your learning progress\n\n" +
          "Start your civic education journey today!"
        );
      } else {
        // Default response
        await whatsappService.sendTextMessage(
          from,
          "Thank you for your message! 🇷🇼\n\n" +
          "I'm here to help with your civic education journey. Type 'help' to see what I can do, or visit our app to start learning about Rwanda's governance and democracy!"
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling incoming message:', error);
    return { success: false, error: error.message };
  }
}
