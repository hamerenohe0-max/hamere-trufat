import { Stack } from 'expo-router';

export default function ReadingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Prayers' }} />
    </Stack>
  );
}
