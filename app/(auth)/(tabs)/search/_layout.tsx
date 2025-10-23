import { Stack } from 'expo-router';

const Layout = () => {
  return (
    <Stack
      screenOptions={{ contentStyle: { backgroundColor: '#fff' }, headerShadowVisible: false }}>
      <Stack.Screen name="index" options={{headerShown: false}}/>
    </Stack>
  );
};
export default Layout;