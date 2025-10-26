import { useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUserProfile } from '@/hooks/useUserProgfile';
import { Id } from '@/convex/_generated/dataModel';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

export const usePush = () => {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const router = useRouter();
  const updateUser = useMutation(api.users.updateUser);
  const { userProfile } = useUserProfile();

  useEffect(() => {
    if (!Device.isDevice) return;

    registerForPushNotificationsAsync()
      .then((token) => {
        if (token && userProfile?._id) {
          updateUser({ pushToken: token, _id: userProfile._id as Id<'users'> });
        }
      })
      .catch((error) => console.log('error', error));

    // Received notification
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('received notification', notification);
    });

    // Tapped on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const threadId = response.notification.request.content.data.threadId;
      console.log('Tapped notification for threadId:', threadId);
      if (threadId) {
        router.push(`/feed/${threadId}`);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [userProfile?._id]);

  function handleRegistrationError(errorMessage: string) {
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        handleRegistrationError('Permission not granted to get push token for push notification!');
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

      if (!projectId) {
        handleRegistrationError('Project ID not found');
        return;
      }

      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log('Push token:', pushTokenString);
        return pushTokenString;
      } catch (e: unknown) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError('Must use physical device for push notifications');
    }
  }
};
