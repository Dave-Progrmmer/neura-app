import React from 'react'
import { Tabs, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { useAuth } from '@clerk/clerk-expo'
import * as Haptics from 'expo-haptics'

const _layout = () => {
  const { signOut } = useAuth()
  const router = useRouter()

  const CreateTabIcon = ({ color, size }: { color: string; size: number }) => (
    <View
      style={[
        styles.createIconContainer,
        {
          padding: 8,
          width: size + 16,
          height: size + 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <View style={[styles.crossContainer, { width: size, height: size }]}>
        <View
          style={[
            styles.crossLine,
            {
              backgroundColor: color,
              width: size * 0.12,
              height: size * 0.7,
              top: size * 0.15,
              left: size * 0.44,
            },
          ]}
        />
        <View
          style={[
            styles.crossLine,
            {
              backgroundColor: color,
              width: size * 0.7,
              height: size * 0.12,
              top: size * 0.44,
              left: size * 0.15,
            },
          ]}
        />
      </View>
    </View>
  )

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => <CreateTabIcon color={color} size={size} />,
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default navigation to the create tab
            e.preventDefault()
            // Provide haptic feedback
            Haptics.selectionAsync()
            // Navigate to the modal instead
            router.push('/(auth)/(modal)/create')
          },
        }}
      />

      <Tabs.Screen
        name="favourites"
        options={{
          title: 'Favourites',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          headerRight: () => (
            <TouchableOpacity onPress={() => signOut()}>
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  )
}

export default _layout

const styles = StyleSheet.create({
  logoutText: {
    marginRight: 10,
    color: 'blue',
  },
  createIconContainer: {
    backgroundColor: Colors.itemBackground,
    borderRadius: 8,
  },
  crossContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossLine: {
    position: 'absolute',
    borderRadius: 2,
  },
})
