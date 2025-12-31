"use client";

/**
 * Client-side Supabase client
 * 
 * Uses conditional dynamic import to prevent SSR evaluation.
 * The createBrowserClient is only imported and executed in the browser.
 */
type SupabaseClient = ReturnType<typeof import('@supabase/ssr').createBrowserClient>;
let supabaseInstance: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient> | null = null;

// Initialize client in browser only
function initializeClient(): Promise<SupabaseClient> {
  if (typeof window === 'undefined') {
    // Should never happen, but return a rejected promise
    return Promise.reject(new Error('Supabase client can only be initialized in browser'));
  }

  if (supabaseInstance) {
    return Promise.resolve(supabaseInstance);
  }

  if (!initPromise) {
    initPromise = import('@supabase/ssr').then((module) => {
      const { createBrowserClient } = module;
      supabaseInstance = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      return supabaseInstance;
    }).catch((error) => {
      // Reset promise on error so it can be retried
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
}

// Export a proxy that handles both SSR and browser cases
export const supabase = new Proxy({} as Record<string, unknown>, {
  get(_target, prop: string) {
    // For SSR, return mock methods
    if (typeof window === 'undefined') {
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          signOut: async () => ({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: null }, error: null }),
          setSession: async () => ({ data: { session: null }, error: null }),
        };
      }
      return undefined;
    }

    // For browser, ensure client is initialized
    if (prop === 'auth') {
      return {
        getSession: async () => {
          const client = await initializeClient();
          return client.auth.getSession();
        },
        getUser: async () => {
          const client = await initializeClient();
          return client.auth.getUser();
        },
        signOut: async () => {
          const client = await initializeClient();
          return client.auth.signOut();
        },
        onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
          // Initialize client and set up listener
          const promise = initializeClient();
          let subscription: { unsubscribe: () => void } | null = null;
          
          promise.then((client) => {
            const result = client.auth.onAuthStateChange(callback);
            subscription = result?.data?.subscription ?? null;
          }).catch((error) => {
            console.error('Failed to initialize Supabase client for onAuthStateChange:', error);
          });
          
          // Return a subscription object that can be used immediately
          // Provide a safe unsubscribe method that handles null subscriptions
          const safeUnsubscribe = () => {
            if (subscription && typeof subscription.unsubscribe === 'function') {
              try {
                subscription.unsubscribe();
              } catch (error) {
                console.warn('Error unsubscribing from auth state change:', error);
              }
            }
          };

          // Create a safe subscription object
          const safeSubscription = subscription ? {
            unsubscribe: safeUnsubscribe,
          } : null;

          return {
            data: { subscription: safeSubscription },
            error: null,
            unsubscribe: safeUnsubscribe,
          };
        },
        setSession: async (session: { access_token: string; refresh_token: string }) => {
          const client = await initializeClient();
          return client.auth.setSession(session);
        },
      };
    }

    // For other properties, wait for client and return
    if (supabaseInstance) {
      return (supabaseInstance as Record<string, unknown>)[prop];
    }

    // If not initialized yet, initialize and return
    if (prop !== 'auth') {
      return initializeClient().then((client) => {
        return (client as Record<string, unknown>)[prop];
      });
    }

    return undefined;
  },
}) as SupabaseClient;
