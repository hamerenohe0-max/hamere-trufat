import { Stack } from 'expo-router';

export default function FeastsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Feasts' }} />
      <Stack.Screen name="[id]" options={{ title: 'Feast Detail' }} />
    </Stack>
  );
}
