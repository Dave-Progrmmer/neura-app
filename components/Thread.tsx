import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Doc } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

type ThreadProps = {
    thread: Doc<'messages'> & { creator: Doc<'users'> };
  };
const Thread = ({thread}: ThreadProps) => {
    const { content, mediaFiles, likeCount, commentCount, retweetCount, creator } = thread;
    const likeThread = useMutation(api.messages.likeThread);
  return (
    <View style={styles.container}>
     <Image source={{ uri: creator?.imageUrl }} style={styles.avatar} />
    </View>
  )
}

export default Thread
const styles = StyleSheet.create({
    container: {
      padding: 15,
      flexDirection: 'row',
    },
  
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    headerText: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    username: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    timestamp: {
      color: '#777',
      fontSize: 12,
    },
    content: {
      fontSize: 16,
      marginBottom: 10,
    },
    mediaImage: {
      width: 200,
      height: 200,
      borderRadius: 10,
      marginBottom: 10,
    },
    mediaContainer: {
      flexDirection: 'row',
      gap: 14,
      paddingRight: 40,
    },
    actions: {
      flexDirection: 'row',
      marginTop: 10,
      gap: 16,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionText: {
      marginLeft: 5,
    },
  });