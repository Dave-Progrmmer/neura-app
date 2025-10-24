import { StyleSheet, TouchableOpacity, View, Image, RefreshControl } from 'react-native';
import { usePaginatedQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Link, useNavigation } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Thread from '@/components/Thread';
import { Doc } from '@/convex/_generated/dataModel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThreadComposer from '@/components/ThreadComposer';
import { useCallback, useState } from 'react';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';

const Page = () => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.getThreads,
    {},
    { initialNumItems: 5 }
  );
  const [refreshing, setRefreshing] = useState(false);
  const { top } = useSafeAreaInsets();

  const navigation = useNavigation();

  // Shared values for scroll
  const scrollOffset = useSharedValue(0);
  const prevScrollOffset = useSharedValue(0);
  const tabBarHeight = useBottomTabBarHeight();
  const isFocused = useIsFocused();

  // Show/hide tab bar based on scroll direction
  const updateTabbar = () => {
    let newMarginBottom = 0;
    // Only hide if scrolling DOWN more than a threshold, or show if scrolling UP
    if (scrollOffset.value > prevScrollOffset.value + 2) {
      // Scrolling down - hide
      newMarginBottom = -tabBarHeight;
    } else if (scrollOffset.value < prevScrollOffset.value - 2) {
      // Scrolling up - show
      newMarginBottom = 0;
    }
    navigation.getParent()?.setOptions({ tabBarStyle: { marginBottom: newMarginBottom } });
    prevScrollOffset.value = scrollOffset.value;
  };

  // Create an animated scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (isFocused) {
        scrollOffset.value = event.contentOffset.y;
        runOnJS(updateTabbar)();
      }
    },
  });

  const onLoadmore = () => {
    loadMore(5);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  useFocusEffect(
    useCallback(() => {
      // Always reset tabbar when leaving screen
      return () => {
        navigation.getParent()?.setOptions({ tabBarStyle: { marginBottom: 0 } });
      };
    }, [])
  );

  return (
    <Animated.FlatList
      showsVerticalScrollIndicator={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      data={results}
      renderItem={({ item }) => (
        <Link href={`/feed/${item._id}`} asChild>
          <TouchableOpacity>
            <Thread thread={item as Doc<'messages'> & { creator: Doc<'users'> }} />
          </TouchableOpacity>
        </Link>
      )}
      onEndReached={onLoadmore}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <View style={{ paddingBottom: 16 }}>
          <Image
            source={require('@/assets/images/threads-logo-black.png')}
            style={{ width: 40, height: 40, alignSelf: 'center' }}
          />
          <ThreadComposer isPreview />
        </View>
      }
      ItemSeparatorComponent={() => (
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: Colors.border }} />
      )}
      contentContainerStyle={{ paddingVertical: top }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
};
export default Page;

const styles = StyleSheet.create({});