import ThreadComposer from '@/components/ThreadComposer';
import { ActivityIndicator, View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '@/convex/_generated/api';
import Thread from '@/components/Thread';
import { Id, Doc } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';

const Page = () => {
  const { id } = useLocalSearchParams();
  const thread = useQuery(api.messages.getThreadById, { messageId: id as Id<'messages'> });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.scrollView}>
        {thread ? (
          <Thread thread={thread as Doc<'messages'> & { creator: Doc<'users'> }} />
        ) : (
          <View style={styles.loaderContainer}>
            <ActivityIndicator />
          </View>
        )}
      </ScrollView>
      
      <ThreadComposer isReply={true} threadId={id as Id<'messages'>} />
    </KeyboardAvoidingView>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
