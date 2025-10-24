import {
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  View,
  Text,
} from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Thread from '@/components/Thread';
import { Id, Doc } from '@/convex/_generated/dataModel';
import Comments from '@/components/Comments';

import { useUserProfile } from '@/hooks/useUserProgfile';
import { Colors } from '@/constants/Colors';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const REPLY_BUTTON_OFFSET = 70; // amount to bring the reply button further down

const Page = () => {
  const { id } = useLocalSearchParams();
  const thread = useQuery(api.messages.getThreadById, { messageId: id as Id<'messages'> });
  const { userProfile } = useUserProfile();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBarHeight + 60 - REPLY_BUTTON_OFFSET }}>
        {thread ? (
          <Thread thread={thread as Doc<'messages'> & { creator: Doc<'users'> }} />
        ) : (
          <ActivityIndicator />
        )}
        <Comments threadId={id as Id<'messages'>} />
      </ScrollView>
      
      <View style={[styles.replyButtonContainer, { bottom: Math.max(0, tabBarHeight - REPLY_BUTTON_OFFSET) }]}>
        <View style={styles.border} />
        <Link href={`/(auth)/(modal)/reply/${id}`} asChild>
          <TouchableOpacity style={styles.replyButton}>
            <Image
              source={{ uri: userProfile?.imageUrl as string }}
              style={styles.replyButtonImage}
            />
            <Text>Reply to {thread?.creator?.first_name}</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  border: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  replyButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'white',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    margin: 6,
    backgroundColor: Colors.itemBackground,
    borderRadius: 100,
    gap: 10,
  },
  replyButtonImage: {
    width: 25,
    height: 25,
    borderRadius: 15,
  },
});