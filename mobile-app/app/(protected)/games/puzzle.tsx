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

export default function PuzzleGameScreen() {
  const router = useRouter();
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
      <View style={styles.container}>
        <View style={styles.gameOverCard}>
          <Text style={styles.gameOverTitle}>Puzzle Complete! 🎉</Text>
          <Text style={styles.finalScore}>Final Score: {score}</Text>
          <View style={styles.gameOverActions}>
            <TouchableOpacity style={styles.button} onPress={resetGame}>
              <Text style={styles.buttonText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonOutline]}
              onPress={() => router.back()}
            >
              <Text style={[styles.buttonText, styles.buttonTextOutline]}>
                Back to Games
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.progress}>
          Puzzle {currentPuzzle + 1} of {PUZZLES.length}
        </Text>
      </View>

      <View style={styles.puzzleCard}>
        <Text style={styles.clue}>{puzzle.clue}</Text>

        {showHint && (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>Hint: {puzzle.hint}</Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={answer}
            onChangeText={setAnswer}
            placeholder="Enter your answer"
            autoCapitalize="characters"
            onSubmitEditing={handleSubmit}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.hintButton}
          onPress={() => setShowHint(true)}
          disabled={showHint}
        >
          <Text style={[styles.hintButtonText, showHint && styles.hintButtonDisabled]}>
            {showHint ? 'Hint Used' : '💡 Get Hint (-5 points)'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  score: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
  },
  progress: {
    fontSize: 14,
    color: '#64748b',
  },
  puzzleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    gap: 20,
  },
  clue: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 30,
    textAlign: 'center',
  },
  hintBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  hintText: {
    fontSize: 16,
    color: '#92400e',
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  hintButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  hintButtonText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  hintButtonDisabled: {
    color: '#94a3b8',
  },
  gameOverCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    marginTop: 100,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  finalScore: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2563eb',
  },
  gameOverActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  buttonTextOutline: {
    color: '#2563eb',
  },
});

