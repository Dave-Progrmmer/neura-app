import React from 'react'
import { Tabs, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { useAuth } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';


const _layout = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  // The cross icon is less thick and has more padding around it
  const CreateTabIcon = ({ color, size }: { color: string; size: number }) => (
    <View
      style={[
        styles.createIconContainer,
        {
          padding: 8, // more padding for extra space around the cross
          width: size + 16,
          height: size + 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <View style={[styles.crossContainer, { width: size, height: size }]}>
        {/* Vertical line */}
        <View
          style={[
            styles.crossLine,
            {
              backgroundColor: color,
              width: size * 0.12, // thinner
              height: size * 0.7,
              top: size * 0.15,
              left: size * 0.44, // reposition for thin line
            },
          ]}
        />
        {/* Horizontal line */}
        <View
          style={[
            styles.crossLine,
            {
              backgroundColor: color,
              width: size * 0.7,
              height: size * 0.12, // thinner
              top: size * 0.44, // reposition for thin line
              left: size * 0.15,
            },
          ]}
        />
      </View>
    </View>
  );

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
              name={focused ? "home" : "home-outline"}
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
              name={focused ? "search" : "search-outline"}
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
            e.preventDefault();
            Haptics.selectionAsync();
            router.push('/(auth)/(modal)/create');
          },
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: 'Favourites',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
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
          headerRight: () => (
            <TouchableOpacity onPress={() => signOut()}>
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout

const styles = StyleSheet.create({
  logoutText: {
    marginRight: 10,
    color: 'blue',
  },
  createIconContainer: {
    backgroundColor: Colors.itemBackground,
    borderRadius: 8,
    // padding is now controlled in the component for better flexibility
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
});