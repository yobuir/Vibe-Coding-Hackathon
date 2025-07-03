import { NextResponse } from 'next/server';
import { runMigrationsAndSeed } from '@/lib/migrationAndSeed';

export async function POST(request) {
  try {
    console.log('🚀 Starting database migration and seeding process...');
    
    // Run the complete migration and seeding process
    const result = await runMigrationsAndSeed();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Database migration and seeding completed successfully',
        results: result.results
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Migration and seeding failed'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Error in migration and seeding API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to run migration and seeding'
    }, { status: 500 });
  }
}

export async function GET(request) {
  return NextResponse.json({
    message: 'Database Migration and Seeding API',
    description: 'Use POST method to run migrations and seed the database',
    endpoints: {
      'POST /api/migrate-and-seed': 'Run complete database migration and seeding'
    }
  });
}
