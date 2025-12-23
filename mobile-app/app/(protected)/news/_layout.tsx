import { Stack } from 'expo-router';

export default function NewsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'News' }} />
      <Stack.Screen name="[id]" options={{ title: 'News Detail' }} />
    </Stack>
  );
}
