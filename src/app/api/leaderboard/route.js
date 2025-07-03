import { NextResponse } from 'next/server';
import { 
  fetchLeaderboard, 
  fetchWeeklyLeaderboard, 
  fetchMonthlyLeaderboard 
} from '@/lib/dataAccess';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');

    let result;
    switch (type) {
      case 'weekly':
        result = await fetchWeeklyLeaderboard(limit);
        break;
      case 'monthly':
        result = await fetchMonthlyLeaderboard(limit);
        break;
      default:
        result = await fetchLeaderboard(limit);
        break;
    }

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error?.message || 'Failed to fetch leaderboard',
        type: type,
        fallback: 'Using fallback data due to function unavailability'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      type: type,
      count: result.data?.length || 0,
      data: result.data,
      message: `Successfully fetched ${type} leaderboard`
    });

  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      fallback: 'API error - check server logs'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, type = 'all', limit = 10 } = body;

    if (action === 'refresh') {
      // Refresh leaderboard data
      let result;
      switch (type) {
        case 'weekly':
          result = await fetchWeeklyLeaderboard(limit);
          break;
        case 'monthly':
          result = await fetchMonthlyLeaderboard(limit);
          break;
        default:
          result = await fetchLeaderboard(limit);
          break;
      }

      return NextResponse.json({
        success: true,
        action: 'refresh',
        type: type,
        data: result.data,
        message: `Leaderboard refreshed successfully`
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use action: "refresh"'
    }, { status: 400 });

  } catch (error) {
    console.error('Error in leaderboard POST API:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
