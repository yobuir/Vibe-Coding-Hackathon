'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Check for active session and fetch user data
    const fetchUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          // Fetch user profile data from user_profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
          
          if (profileData && !profileError) {
            setProfile(profileData);
          }

          // Fetch subscription data if available
          try {
            const { data: subData, error: subError } = await supabase
              .from('subscriptions')
              .select('*, subscription_plans(*)')
              .eq('user_id', currentUser.id)
              .eq('status', 'active')
              .single();
            
            if (subData && !subError) {
              setSubscription(subData);
            }
          } catch (subscriptionError) {
            console.warn('Subscription table not available:', subscriptionError);
            // This is fine - subscription feature may not be set up yet
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          
          // Fetch profile on sign-in
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (data && !error) {
            setProfile(data);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setSubscription(null);
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Check if user has premium features based on subscription
  const hasPremiumAccess = () => {
    if (!subscription) return false;
    return subscription.status === 'active';
  };

  // Update user profile
  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'Not authenticated' } };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error) {
        setProfile(prev => ({ ...prev, ...updates }));
      }

      return { data, error };
    } catch (error) {
      return { error };
    }
  };

  // Sign out
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile, 
        loading, 
        subscription,
        hasPremiumAccess,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
