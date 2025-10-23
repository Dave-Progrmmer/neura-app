import { Slot, useNavigationContainerRef, useSegments } from 'expo-router';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ClerkProvider, ClerkLoaded, useAuth, useUser } from '@clerk/clerk-expo';
// import { tokenCache } from '@/utils/cache'; // Disabled: missing module, see lint error
import { LogBox } from 'react-native';
import { useRouter } from 'expo-router';
import { tokenCache } from '@/utils/cache'; 
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import * as Sentry from '@sentry/react-native';

SplashScreen.preventAutoHideAsync();

// Prepare env vars
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || '';
const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

// -- Sentry Setup --
// Set up reactNavigationIntegration, but capture the integration instance so we can hold/register ref later.
const reactNavigationIntegrationInstance =
  Sentry.reactNavigationIntegration &&
  Sentry.reactNavigationIntegration({
    // We'll register the ref when it's available
  });

Sentry.init({
  dsn: sentryDsn,
  attachScreenshot: true,
  debug: false, // Set to `false` in production
  tracesSampleRate: 1.0,
  _experiments: {
    profilesSampleRate: 1.0,
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
  },
  integrations: [
    // @ts-ignore: reactNavigationIntegration may be undefined if not available
    reactNavigationIntegrationInstance,
    // This is available in @sentry/react-native
    Sentry.mobileReplayIntegration && Sentry.mobileReplayIntegration(),
  ].filter(Boolean),
});

const InitialLayout = () => {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === '(auth)';

    if (isSignedIn && !inTabsGroup) {
      router.replace('/(auth)/(tabs)/feed');
    } else if (!isSignedIn && inTabsGroup) {
      router.replace('/(public)');
    }
  }, [isSignedIn, segments, isLoaded, router]);

  useEffect(() => {
    if (user && user.user) {
      Sentry.setUser({ email: user.user.emailAddresses[0].emailAddress, id: user.user.id });
    } else {
      Sentry.setUser(null);
    }
  }, [user]);

  return <Slot />;
};

const RootLayoutNav = () => {
  const ref = useNavigationContainerRef();

  useEffect(() => {
    // Register the navigation container ref with Sentry's integration if the API exists
    if (
      ref &&
      reactNavigationIntegrationInstance &&
      typeof reactNavigationIntegrationInstance.registerNavigationContainer === 'function'
    ) {
      reactNavigationIntegrationInstance.registerNavigationContainer(ref);
    }
  }, [ref]);

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <InitialLayout />
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
};

export default Sentry.wrap ? Sentry.wrap(RootLayoutNav) : RootLayoutNav;