import { Stack } from 'expo-router';

export default function GamesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Games' }} />
      <Stack.Screen name="trivia" options={{ title: 'Trivia' }} />
      <Stack.Screen name="puzzle" options={{ title: 'Puzzle' }} />
      <Stack.Screen name="memory" options={{ title: 'Memory' }} />
      <Stack.Screen name="saint" options={{ title: 'Saint Quiz' }} />
    </Stack>
  );
}
