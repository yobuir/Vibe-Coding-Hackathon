import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req) {
  // Create a Supabase client specific to this middleware
  const res = NextResponse.next();
  
  // Create a Supabase client with cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove: (name, options) => {
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/quiz',
    '/simulations',
    '/leaderboard',
    '/profile',
    '/subscription',
    '/notifications',
  ];

  // Teacher-specific routes (requiring teacher role)
  const teacherPaths = [
    '/teacher/dashboard',
  ];

  // Check if the path matches any protected path
  const isProtectedPath = protectedPaths.some((path) => 
    req.nextUrl.pathname.startsWith(path)
  );

  // Check if the path matches any teacher path
  const isTeacherPath = teacherPaths.some((path) => 
    req.nextUrl.pathname.startsWith(path)
  );

  // If accessing a protected route without a session, redirect to login
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/auth?redirect=' + req.nextUrl.pathname, req.url));
  }

  // If accessing a teacher route, check for teacher role
  // We'll need to fetch the profile and check the role
  if (isTeacherPath && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // If not a teacher, redirect to dashboard
    if (!profile || profile.role !== 'teacher') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/quiz/:path*',
    '/simulations/:path*',
    '/leaderboard/:path*',
    '/profile/:path*',
    '/subscription/:path*',
    '/notifications/:path*',
    '/teacher/:path*',
    '/auth',
  ],
};
