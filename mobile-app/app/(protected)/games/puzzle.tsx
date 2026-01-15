import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../../src/features/games/state/useGameStore';
import * as Haptics from 'expo-haptics';

// Mock puzzle questions
const PUZZLES = [
  {
    id: '1',
    clue: 'The first book of the Bible',
    answer: 'GENESIS',
    hint: 'Starts with G',
  },
  {
    id: '2',
    clue: 'The city where Jesus was born',
    answer: 'BETHLEHEM',
    hint: 'Starts with B',
  },
  {
    id: '3',
    clue: 'The disciple who denied Jesus three times',
    answer: 'PETER',
    hint: 'Starts with P',
  },
  {
    id: '4',
    clue: 'The number of days Jesus was in the tomb',
    answer: 'THREE',
    hint: 'Starts with T',
  },
  {
    id: '5',
    clue: 'The mountain where Moses received the Ten Commandments',
    answer: 'SINAI',
    hint: 'Starts with S',
  },
];

import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PuzzleGameScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const addScore = useGameStore((state) => state.addScore);
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const puzzle = PUZZLES[currentPuzzle];

  function handleSubmit() {
    if (answer.toUpperCase().trim() === puzzle.answer) {
      const points = showHint ? 5 : 10;
      setScore(score + points);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAnswer('');
      setShowHint(false);

      if (currentPuzzle < PUZZLES.length - 1) {
        setCurrentPuzzle(currentPuzzle + 1);
      } else {
        setGameOver(true);
        const finalScore = score + (showHint ? 5 : 10);
        addScore({
          id: `puzzle-${Date.now()}`,
          game: 'puzzle',
          score: finalScore,
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function resetGame() {
    setCurrentPuzzle(0);
    setScore(0);
    setAnswer('');
    setShowHint(false);
    setGameOver(false);
  }

  if (gameOver) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={[styles.gameOverCard, { backgroundColor: isDark ? colors.background.secondary : '#FFF' }]}>
          <ThemedText style={styles.gameOverTitle}>Puzzle Complete! 🎉</ThemedText>
          <ThemedText style={[styles.finalScore, { color: colors.primary.main }]}>Final Score: {score}</ThemedText>
          <View style={styles.gameOverActions}>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary.main }]} onPress={resetGame}>
              <ThemedText style={styles.buttonText}>Play Again</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonOutline, { borderColor: colors.primary.main }]}
              onPress={() => router.back()}
            >
              <ThemedText style={[styles.buttonText, { color: colors.primary.main }]}>
                Exit
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <ThemedText style={[styles.score, { color: colors.primary.main }]}>Score: {score}</ThemedText>
          <ThemedText type="secondary" style={styles.progress}>
            Puzzle {currentPuzzle + 1} / {PUZZLES.length}
          </ThemedText>
        </View>

        <View style={[styles.puzzleCard, { backgroundColor: isDark ? colors.background.secondary : '#FFF' }]}>
          <ThemedText style={styles.clue}>{puzzle.clue}</ThemedText>

          {showHint && (
            <View style={[styles.hintBox, { backgroundColor: isDark ? 'rgba(157, 101, 49, 0.15)' : '#fef3c7' }]}>
              <ThemedText style={[styles.hintText, { color: isDark ? colors.secondary.light : '#92400e' }]}>Hint: {puzzle.hint}</ThemedText>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5f5', backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#fff', color: colors.text.primary }]}
              value={answer}
              onChangeText={setAnswer}
              placeholder="Enter your answer"
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8'}
              autoCapitalize="characters"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary.main }]} onPress={handleSubmit}>
              <ThemedText style={styles.submitText}>Submit</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.hintButton}
            onPress={() => setShowHint(true)}
            disabled={showHint}
          >
            <ThemedText style={[styles.hintButtonText, { color: colors.primary.main }, showHint && styles.hintButtonDisabled]}>
              {showHint ? 'Hint Used' : '💡 Get Hint (-5 points)'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  score: {
    fontSize: 20,
    fontWeight: '800',
  },
  progress: {
    fontSize: 14,
    fontWeight: '600',
  },
  puzzleCard: {
    borderRadius: 20,
    padding: 24,
    gap: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  clue: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  hintBox: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  hintText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
  },
  submitButton: {
    paddingHorizontal: 20,
    borderRadius: 16,
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
  hintButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  hintButtonText: {
    fontWeight: '700',
  },
  hintButtonDisabled: {
    opacity: 0.3,
  },
  gameOverCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 20,
    marginTop: 100,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    textAlign: 'center',
  },
  finalScore: {
    fontSize: 24,
    fontWeight: '700',
  },
  gameOverActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
});

