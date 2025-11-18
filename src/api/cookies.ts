import { supabase, getGuestSessionId } from '@/lib/supabase';
import type {
  Cookie,
  CookieCategory,
  UserPreference,
  CookiePreferences,
  ConsentLogInsert,
  ConsentActionType,
} from '@/types/cookies';

// Get all cookies (public)
export async function getCookies(): Promise<Cookie[]> {
  const { data, error } = await supabase
    .from('cookies')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch cookies: ${error.message}`);
  }

  return data || [];
}

// Get cookies by category
export async function getCookiesByCategory(category: CookieCategory): Promise<Cookie[]> {
  const { data, error } = await supabase
    .from('cookies')
    .select('*')
    .eq('category', category)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch cookies: ${error.message}`);
  }

  return data || [];
}

// Get user preferences (authenticated or guest)
export async function getUserPreferences(): Promise<UserPreference[]> {
  const { data: { user } } = await supabase.auth.getUser();
  const guestSessionId = getGuestSessionId();

  let query = supabase
    .from('user_preferences')
    .select('*');

  if (user) {
    query = query.eq('user_id', user.id);
  } else {
    query = query.eq('guest_session_id', guestSessionId);
  }

  const { data, error } = await query.order('cookie_category', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch preferences: ${error.message}`);
  }

  return data || [];
}

// Get user preferences as grouped object
export async function getCookiePreferences(): Promise<CookiePreferences> {
  const preferences = await getUserPreferences();
  
  const defaultPreferences: CookiePreferences = {
    essential: 'accepted', // Essential cookies are always accepted
    analytics: 'pending',
    advertising: 'pending',
    functional: 'pending',
    performance: 'pending',
  };

  preferences.forEach((pref) => {
    defaultPreferences[pref.cookie_category] = pref.preference_status;
  });

  return defaultPreferences;
}

// Save user preferences
export async function savePreferences(
  preferences: Partial<CookiePreferences>
): Promise<UserPreference[]> {
  const { data: { user } } = await supabase.auth.getUser();
  const guestSessionId = getGuestSessionId();

  const categories: CookieCategory[] = ['essential', 'analytics', 'advertising', 'functional', 'performance'];
  const results: UserPreference[] = [];

  for (const category of categories) {
    const status = preferences[category];
    if (status === undefined) continue;

    // Essential cookies are always accepted
    if (category === 'essential' && status !== 'accepted') {
      continue;
    }

    const preferenceData = {
      user_id: user?.id || null,
      guest_session_id: user ? null : guestSessionId,
      cookie_category: category,
      preference_status: status,
    };

    // Upsert preference
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(preferenceData, {
        onConflict: user
          ? 'user_id,cookie_category'
          : 'guest_session_id,cookie_category',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save preference for ${category}: ${error.message}`);
    }

    if (data) {
      results.push(data);
    }
  }

  return results;
}

// Accept all cookies
export async function acceptAllCookies(): Promise<void> {
  const preferences: CookiePreferences = {
    essential: 'accepted',
    analytics: 'accepted',
    advertising: 'accepted',
    functional: 'accepted',
    performance: 'accepted',
  };

  await savePreferences(preferences);
  await logConsentAction('accept_all');
}

// Reject all non-essential cookies
export async function rejectAllCookies(): Promise<void> {
  const preferences: CookiePreferences = {
    essential: 'accepted', // Essential cookies cannot be rejected
    analytics: 'rejected',
    advertising: 'rejected',
    functional: 'rejected',
    performance: 'rejected',
  };

  await savePreferences(preferences);
  await logConsentAction('reject_all');
}

// Log consent action (for compliance)
export async function logConsentAction(
  actionType: ConsentActionType,
  cookieCategory?: CookieCategory
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  const guestSessionId = getGuestSessionId();

  // Get IP address (simplified - in production, get from request headers)
  const ipAddress = null; // Will be set by backend/edge function
  const userAgent = navigator.userAgent;

  const logData: ConsentLogInsert = {
    user_id: user?.id || null,
    guest_session_id: user ? null : guestSessionId,
    action_type: actionType,
    cookie_category: cookieCategory || null,
    ip_address: ipAddress,
    user_agent: userAgent,
  };

  const { error } = await supabase
    .from('consent_logs')
    .insert(logData);

  if (error) {
    // Don't throw - logging failures shouldn't break the flow
    console.error('Failed to log consent action:', error);
  }
}

// Check if user has consented (for banner visibility)
export async function hasUserConsented(): Promise<boolean> {
  const preferences = await getUserPreferences();
  return preferences.length > 0;
}

// Get consent banner state
export async function getConsentBannerState(): Promise<{
  isVisible: boolean;
  hasConsented: boolean;
  preferences: CookiePreferences | null;
}> {
  const hasConsented = await hasUserConsented();
  const preferences = hasConsented ? await getCookiePreferences() : null;

  // Check localStorage for dismissed state
  const dismissed = localStorage.getItem('cookie_banner_dismissed') === 'true';

  return {
    isVisible: !dismissed && !hasConsented,
    hasConsented,
    preferences,
  };
}

// Dismiss consent banner (without consenting)
export function dismissConsentBanner(): void {
  localStorage.setItem('cookie_banner_dismissed', 'true');
}
