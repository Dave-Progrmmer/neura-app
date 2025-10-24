import { View, Text, Button, FlatList, RefreshControl, StyleSheet, Image } from 'react-native'
import * as Sentry from '@sentry/react-native'
import React, { useState } from 'react'
import { usePaginatedQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import ThreadComposer from '@/components/ThreadComposer';
import Thread from '@/components/Thread';

const index = () => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.getThreads,
    {},
    { initialNumItems: 5 }
  );
  const [refreshing, setRefreshing] = useState(false);
  const { top } = useSafeAreaInsets();

  const navigation = useNavigation();
  // Create a shared value to store the scroll offset
  const tabBarHeight = useBottomTabBarHeight();
  const isFocused = useIsFocused();


  const onLoadmore = () => {
    loadMore(5);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };
  return (
    <FlatList
    data={results}
    showsVerticalScrollIndicator={false}
    renderItem={({item})=> <Thread thread={item}/>}
    keyExtractor={(item)=>item._id}
    onEndReached={onLoadmore}
    onEndReachedThreshold={0.5}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} 
    />}
    ItemSeparatorComponent={()=><View style={{height:StyleSheet.hairlineWidth, backgroundColor: Colors.border}}></View>}
    contentContainerStyle={{paddingVertical: top}}
    ListHeaderComponent={
      <View style={{ paddingBottom: 16 }}>
        <Image
        source={require('@/assets/images/neura-logo.png')}
        style={{width: 90, height:90, alignSelf:'center'}}
        />
        <ThreadComposer isPreview />
      </View>
    }
    />
  )
}

export default index