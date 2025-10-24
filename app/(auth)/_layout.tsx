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
      <Stack.Screen
        name="(modal)/image/[url]"
        options={{
          presentation: 'fullScreenModal',
          title: '',
          headerTitleAlign: 'center',
          headerStyle:{backgroundColor: 'black'},
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.dismiss()}>
              <Ionicons name='close' size={24} color="white"/>
            </TouchableOpacity>
          ),
          // Fix: headerRight should return a ReactNode, not void
          headerRight: () => (
            <TouchableOpacity>
              <Ionicons name='ellipsis-horizontal-circle' size={24} color='white'/>
            </TouchableOpacity>
          )
        }}
      />
    </Stack>
  )
}

export default Layout