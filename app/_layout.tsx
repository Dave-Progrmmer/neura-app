import { Slot, useRouter, useSegments } from "expo-router";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();
import { useEffect } from "react";
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';


const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!isLoaded || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && !inAuthGroup) {
      // User is signed in but not in auth group, redirect to tabs
      router.replace('/(auth)/(tabs)/profile');
    } else if (!isSignedIn && inAuthGroup) {
      // User is not signed in but in auth group, redirect to login
      router.replace('/(public)');
    }
  }, [isSignedIn, isLoaded, fontsLoaded, segments]);

  if (!fontsLoaded || !isLoaded) {
    return null;
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <ClerkProvider 
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <InitialLayout />
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}