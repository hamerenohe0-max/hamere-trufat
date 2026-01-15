import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../../src/features/games/state/useGameStore';
import * as Haptics from 'expo-haptics';

// Mock trivia questions
const TRIVIA_QUESTIONS = [
  {
    id: '1',
    question: 'Who was the first disciple called by Jesus?',
    options: ['Peter', 'Andrew', 'John', 'James'],
    correct: 1,
  },
  {
    id: '2',
    question: 'How many books are in the New Testament?',
    options: ['25', '26', '27', '28'],
    correct: 2,
  },
  {
    id: '3',
    question: 'What is the first book of the Bible?',
    options: ['Exodus', 'Genesis', 'Matthew', 'Psalms'],
    correct: 1,
  },
  {
    id: '4',
    question: 'Who wrote most of the Psalms?',
    options: ['Solomon', 'David', 'Moses', 'Isaiah'],
    correct: 1,
  },
  {
    id: '5',
    question: 'What is the Ethiopian Orthodox calendar based on?',
    options: ['Julian Calendar', 'Gregorian Calendar', 'Lunar Calendar', 'Solar Calendar'],
    correct: 0,
  },
];

import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TriviaGameScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const addScore = useGameStore((state) => state.addScore);
  // ... rest of the logic ...
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const question = TRIVIA_QUESTIONS[currentQuestion];

  function handleAnswer(optionIndex: number) {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(optionIndex);
    setShowResult(true);

    if (optionIndex === question.correct) {
      setScore(score + 10);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setTimeout(() => {
      if (currentQuestion < TRIVIA_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameOver(true);
        const finalScore = score + (optionIndex === question.correct ? 10 : 0);
        addScore({
          id: `trivia-${Date.now()}`,
          game: 'trivia',
          score: finalScore,
          createdAt: new Date().toISOString(),
        });
      }
    }, 2000);
  }

  function resetGame() {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
  }

  if (gameOver) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={[styles.gameOverCard, { backgroundColor: isDark ? colors.background.secondary : '#FFF' }]}>
          <ThemedText style={styles.gameOverTitle}>Game Over!</ThemedText>
          <ThemedText style={[styles.finalScore, { color: colors.primary.main }]}>Final Score: {score}</ThemedText>
          <ThemedText style={styles.finalScoreText}>
            {score >= 40
              ? 'Excellent! 🎉'
              : score >= 30
                ? 'Great job! 👍'
                : score >= 20
                  ? 'Good effort! 💪'
                  : 'Keep practicing! 📚'}
          </ThemedText>
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
            Question {currentQuestion + 1} / {TRIVIA_QUESTIONS.length}
          </ThemedText>
        </View>

        <View style={[styles.questionCard, { backgroundColor: isDark ? colors.background.secondary : '#FFF' }]}>
          <ThemedText style={styles.question}>{question.question}</ThemedText>

          <View style={styles.options}>
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correct;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc' },
                    isSelected && { borderColor: colors.primary.main, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#eef2ff' },
                    showCorrect && { borderColor: '#10b981', backgroundColor: isDark ? '#064e3b20' : '#d1fae5' },
                    showWrong && { borderColor: '#ef4444', backgroundColor: isDark ? '#991b1b20' : '#fee2e2' },
                  ]}
                  onPress={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <ThemedText
                    style={[
                      styles.optionText,
                      isSelected && { color: colors.primary.main, fontWeight: '700' },
                      showCorrect && { color: '#065f46', fontWeight: '700' },
                      showWrong && { color: '#991b1b', fontWeight: '700' },
                    ]}
                  >
                    {option}
                  </ThemedText>
                  {showCorrect && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                  {showWrong && <ThemedText style={styles.crossmark}>✗</ThemedText>}
                </TouchableOpacity>
              );
            })}
          </View>
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
  questionCard: {
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
  question: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  options: {
    gap: 12,
  },
  option: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionText: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 20,
    color: '#10b981',
    fontWeight: 'bold',
  },
  crossmark: {
    fontSize: 20,
    color: '#ef4444',
    fontWeight: 'bold',
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
  },
  finalScore: {
    fontSize: 24,
    fontWeight: '700',
  },
  finalScoreText: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
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

