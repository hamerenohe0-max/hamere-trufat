import { Stack } from 'expo-router';

export default function ArticlesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Articles' }} />
      <Stack.Screen name="[id]" options={{ title: 'Article Detail' }} />
    </Stack>
  );
}
