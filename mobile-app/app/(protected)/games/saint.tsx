import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../../src/features/games/state/useGameStore';
import * as Haptics from 'expo-haptics';

// Mock saint questions
const SAINT_QUESTIONS = [
  {
    id: '1',
    name: 'Saint Peter',
    clues: [
      'One of the twelve apostles',
      'Known as the "Rock"',
      'Denied Jesus three times',
      'First Pope of the Church',
    ],
    image: 'https://via.placeholder.com/200?text=Saint+Peter',
  },
  {
    id: '2',
    name: 'Saint Paul',
    clues: [
      'Formerly known as Saul',
      'Wrote many epistles',
      'Was a persecutor of Christians',
      'Had a vision on the road to Damascus',
    ],
    image: 'https://via.placeholder.com/200?text=Saint+Paul',
  },
  {
    id: '3',
    name: 'Saint Mary',
    clues: [
      'Mother of Jesus',
      'Known as the Theotokos',
      'Visited by the Archangel Gabriel',
      'Present at the Crucifixion',
    ],
    image: 'https://via.placeholder.com/200?text=Saint+Mary',
  },
  {
    id: '4',
    name: 'Saint George',
    clues: [
      'Patron saint of many countries',
      'Known for slaying a dragon',
      'Martyred for his faith',
      'Feast day is April 23',
    ],
    image: 'https://via.placeholder.com/200?text=Saint+George',
  },
  {
    id: '5',
    name: 'Saint Mark',
    clues: [
      'Wrote one of the four Gospels',
      'Founded the Church in Alexandria',
      'Symbol is a lion',
      'Companion of Saint Peter',
    ],
    image: 'https://via.placeholder.com/200?text=Saint+Mark',
  },
];

const OPTIONS = [
  'Saint Peter',
  'Saint Paul',
  'Saint Mary',
  'Saint George',
  'Saint Mark',
  'Saint John',
  'Saint Luke',
  'Saint Matthew',
];

export default function GuessTheSaintScreen() {
  const router = useRouter();
  const addScore = useGameStore((state) => state.addScore);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [revealedClues, setRevealedClues] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const question = SAINT_QUESTIONS[currentQuestion];
  const visibleClues = question.clues.slice(0, revealedClues + 1);

  function handleGuess(saintName: string) {
    setSelectedAnswer(saintName);
    if (saintName === question.name) {
      const points = 20 - revealedClues * 5; // More clues = fewer points
      setScore(score + Math.max(points, 5));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        if (currentQuestion < SAINT_QUESTIONS.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setRevealedClues(0);
          setSelectedAnswer(null);
        } else {
          setGameOver(true);
          const points = 20 - revealedClues * 5;
          const finalScore = score + Math.max(points, 5);
          addScore({
            id: `saint-${Date.now()}`,
            game: 'saint',
            score: finalScore,
            createdAt: new Date().toISOString(),
          });
        }
      }, 2000);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function revealNextClue() {
    if (revealedClues < question.clues.length - 1) {
      setRevealedClues(revealedClues + 1);
    }
  }

  function resetGame() {
    setCurrentQuestion(0);
    setScore(0);
    setRevealedClues(0);
    setSelectedAnswer(null);
    setGameOver(false);
  }

  if (gameOver) {
    return (
      <View style={styles.container}>
        <View style={styles.gameOverCard}>
          <Text style={styles.gameOverTitle}>Game Complete! 🎉</Text>
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
          Question {currentQuestion + 1} of {SAINT_QUESTIONS.length}
        </Text>
      </View>

      <View style={styles.questionCard}>
        <Image source={{ uri: question.image }} style={styles.saintImage} />
        <Text style={styles.questionTitle}>Who is this saint?</Text>

        <View style={styles.cluesSection}>
          <Text style={styles.cluesTitle}>Clues:</Text>
          {visibleClues.map((clue, index) => (
            <View key={index} style={styles.clueItem}>
              <Text style={styles.clueBullet}>•</Text>
              <Text style={styles.clueText}>{clue}</Text>
            </View>
          ))}
          {revealedClues < question.clues.length - 1 && (
            <TouchableOpacity
              style={styles.revealButton}
              onPress={revealNextClue}
              disabled={selectedAnswer !== null}
            >
              <Text style={styles.revealButtonText}>
                Reveal Next Clue (-5 points)
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.options}>
          {OPTIONS.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === question.name;

            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  isSelected && isCorrect && styles.optionCorrect,
                  isSelected && !isCorrect && styles.optionWrong,
                ]}
                onPress={() => handleGuess(option)}
                disabled={selectedAnswer !== null}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && isCorrect && styles.optionTextCorrect,
                    isSelected && !isCorrect && styles.optionTextWrong,
                  ]}
                >
                  {option}
                </Text>
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
    gap: 20,
    alignItems: 'center',
  },
  saintImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
  },
  cluesSection: {
    width: '100%',
    gap: 12,
  },
  cluesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  clueItem: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 8,
  },
  clueBullet: {
    fontSize: 18,
    color: '#2563eb',
    fontWeight: '600',
  },
  clueText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  revealButton: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  revealButtonText: {
    color: '#92400e',
    fontWeight: '600',
    fontSize: 14,
  },
  options: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  option: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
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
    textAlign: 'center',
  },
  optionTextCorrect: {
    color: '#10b981',
    fontWeight: '600',
  },
  optionTextWrong: {
    color: '#ef4444',
    fontWeight: '600',
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

