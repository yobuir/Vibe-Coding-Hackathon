/**
 * Complete Database Setup Script
 * 
 * Run this script to set up AI quiz functionality and seed sample data.
 * 
 * Usage:
 * 1. Make sure your Supabase connection is configured in src/lib/supabase.js
 * 2. Run: node scripts/setup-ai-quiz.js
 * 3. Or call runCompleteSetup() from your application
 */

import { runMigrationsAndSeed } from '../src/lib/migrationAndSeed.js';

async function runCompleteSetup() {
  console.log('🚀 CivicSpark AI - Complete Database Setup\n');
  
  try {
    const result = await runMigrationsAndSeed();
    
    if (result.success) {
      console.log('\n🎉 Setup completed successfully!');
      console.log('\nWhat you can do now:');
      console.log('✅ Generate AI quizzes in the app');
      console.log('✅ Take sample Rwanda civic education quizzes');
      console.log('✅ Read Rwanda civic education lessons');
      console.log('✅ Earn points and achievements');
      console.log('\n📱 Visit /quiz to start generating AI quizzes!');
      console.log('🧪 Visit /test-ai-quiz to test the functionality');
    } else {
      console.log('\n❌ Setup failed');
      console.error('Error:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Setup failed with error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteSetup();
}

export { runCompleteSetup };
