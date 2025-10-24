import { Ionicons } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import { TouchableOpacity, Text } from 'react-native'

const Layout = () => {
  const router = useRouter()

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: 'white' },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
      }}
    >
      {/* Main tab navigation */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Create post modal */}
      <Stack.Screen
        name="(modal)/create"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      {/* Edit profile modal */}
      <Stack.Screen
        name="(modal)/edit-profile"
        options={{
          presentation: 'modal',
          title: 'Edit profile',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.dismiss()}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  )
}

export default Layout