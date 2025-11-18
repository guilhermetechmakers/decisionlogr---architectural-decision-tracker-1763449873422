import { supabase } from "./supabase";

export interface SignupData {
  email: string;
  password: string;
  name: string;
  company?: string;
  companySize?: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Sign up a new user
 */
export async function signUp(data: SignupData) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          company: data.company || "",
          company_size: data.companySize || "",
          role: data.role || "",
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (authError) throw authError;

    return {
      user: authData.user,
      session: authData.session,
      needsEmailVerification: !authData.session,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to create account");
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(data: LoginData) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;

    return {
      user: authData.user,
      session: authData.session,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign in");
  }
}

/**
 * Sign in with magic link (passwordless)
 */
export async function signInWithMagicLink(email: string) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;

    return true;
  } catch (error: any) {
    throw new Error(error.message || "Failed to send magic link");
  }
}

/**
 * Sign in with OAuth provider (Google, Microsoft, etc.)
 */
export async function signInWithOAuth(provider: "google" | "microsoft") {
  try {
    // Map "microsoft" to "azure" for Supabase
    const supabaseProvider = provider === "microsoft" ? "azure" : "google";
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProvider as "google" | "azure",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;
  } catch (error: any) {
    throw new Error(error.message || `Failed to sign in with ${provider}`);
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign out");
  }
}

/**
 * Get the current user session
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error: any) {
    throw new Error(error.message || "Failed to get session");
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error: any) {
    throw new Error(error.message || "Failed to get user");
  }
}
