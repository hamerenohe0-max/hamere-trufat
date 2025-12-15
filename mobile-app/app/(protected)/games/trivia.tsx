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

export default function TriviaGameScreen() {
  const router = useRouter();
  const addScore = useGameStore((state) => state.addScore);
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
      <View style={styles.container}>
        <View style={styles.gameOverCard}>
          <Text style={styles.gameOverTitle}>Game Over!</Text>
          <Text style={styles.finalScore}>Final Score: {score}</Text>
          <Text style={styles.finalScoreText}>
            {score >= 40
              ? 'Excellent! 🎉'
              : score >= 30
                ? 'Great job! 👍'
                : score >= 20
                  ? 'Good effort! 💪'
                  : 'Keep practicing! 📚'}
          </Text>
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
          Question {currentQuestion + 1} of {TRIVIA_QUESTIONS.length}
        </Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.question}>{question.question}</Text>

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
                  isSelected && styles.optionSelected,
                  showCorrect && styles.optionCorrect,
                  showWrong && styles.optionWrong,
                ]}
                onPress={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                    showCorrect && styles.optionTextCorrect,
                    showWrong && styles.optionTextWrong,
                  ]}
                >
                  {option}
                </Text>
                {showCorrect && <Text style={styles.checkmark}>✓</Text>}
                {showWrong && <Text style={styles.crossmark}>✗</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
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
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    gap: 24,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 28,
  },
  options: {
    gap: 12,
  },
  option: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eef2ff',
  },
  optionCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
  },
  optionWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  optionTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#10b981',
    fontWeight: '600',
  },
  optionTextWrong: {
    color: '#ef4444',
    fontWeight: '600',
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
  finalScoreText: {
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
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

