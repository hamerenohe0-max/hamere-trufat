import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../../src/features/games/state/useGameStore';
import { SAINT_QUESTIONS, SAINT_OPTIONS } from '../../../src/features/games/data/games_data';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';


const MAX_QUESTIONS = 4;

export default function GuessTheSaintScreen() {
  const router = useRouter();
  const addScore = useGameStore((state) => state.addScore);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [revealedClues, setRevealedClues] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { colors, fontScale, isDark } = useTheme();

  const question = SAINT_QUESTIONS[currentQuestion];
  const visibleClues = question.clues.slice(0, revealedClues + 1);

  // Generate 4 randomized options (correct answer + 3 random others)
  const [options, setOptions] = useState<string[]>([]);

  useState(() => {
    generateOptions();
  });

  function generateOptions() {
    const currentQuestionData = SAINT_QUESTIONS[currentQuestion];
    const otherOptions = SAINT_OPTIONS.filter(opt => opt !== currentQuestionData.name);
    const shuffledOthers = otherOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalOptions = [currentQuestionData.name, ...shuffledOthers].sort(() => 0.5 - Math.random());
    setOptions(finalOptions);
  }

  function handleGuess(saintName: string) {
    setSelectedAnswer(saintName);
    if (saintName === question.name) {
      const points = 20 - revealedClues * 5; // More clues = fewer points
      setScore(score + Math.max(points, 5));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        if (currentQuestion < MAX_QUESTIONS - 1) {
          const nextIndex = (currentQuestion + 1) % SAINT_QUESTIONS.length;
          setCurrentQuestion(nextIndex);
          setRevealedClues(0);
          setSelectedAnswer(null);
          setImageLoading(true);

          // Generate new options for next question
          const nextQuestionData = SAINT_QUESTIONS[nextIndex];
          const otherOptions = SAINT_OPTIONS.filter(opt => opt !== nextQuestionData.name);
          const shuffledOthers = otherOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
          const finalOptions = [nextQuestionData.name, ...shuffledOthers].sort(() => 0.5 - Math.random());
          setOptions(finalOptions);
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
    setImageLoading(true);
    generateOptions();
  }

  if (gameOver) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={[styles.gameOverCard, { backgroundColor: colors.background.secondary }]}>
          <ThemedText style={styles.gameOverTitle}>Game Complete! 🎉</ThemedText>
          <ThemedText style={styles.finalScore}>Final Score: {score}</ThemedText>
          <View style={styles.gameOverActions}>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary.main }]} onPress={resetGame}>
              <ThemedText style={styles.buttonText}>Play Again</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonOutline, { borderColor: colors.primary.main }]}
              onPress={() => router.back()}
            >
              <ThemedText style={[styles.buttonText, styles.buttonTextOutline, { color: colors.primary.main }]}>
                Back to Games
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.score, { color: colors.primary.main }]}>Score: {score}</ThemedText>
        <ThemedText style={styles.progress}>
          Question {currentQuestion + 1} of {MAX_QUESTIONS}
        </ThemedText>
      </View>

      <View style={styles.questionCard}>
        <View style={[styles.imageContainer, { backgroundColor: colors.background.tertiary }]}>
          <Image
            source={{ uri: question.image }}
            style={styles.saintImage}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            resizeMode="cover"
            key={question.image}
          />
          {imageLoading && (
            <View style={[styles.loaderOverlay, { backgroundColor: colors.background.tertiary }]}>
              <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
          )}
        </View>
        <ThemedText style={styles.questionTitle}>Who is this saint?</ThemedText>

        <View style={styles.cluesSection}>
          <ThemedText style={styles.cluesTitle}>Clues:</ThemedText>
          {visibleClues.map((clue, index) => (
            <View key={index} style={styles.clueItem}>
              <ThemedText style={[styles.clueBullet, { color: colors.primary.main }]}>•</ThemedText>
              <ThemedText style={styles.clueText}>{clue}</ThemedText>
            </View>
          ))}
          {revealedClues < question.clues.length - 1 && (
            <TouchableOpacity
              style={[styles.revealButton, { backgroundColor: isDark ? colors.primary.dark + '40' : '#fef3c7' }]}
              onPress={revealNextClue}
              disabled={selectedAnswer !== null}
            >
              <ThemedText style={[styles.revealButtonText, { color: isDark ? colors.primary.light : '#92400e' }]}>
                Reveal Next Clue (-5 points)
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.options}>
          {options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === question.name;

            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  { backgroundColor: colors.background.secondary },
                  isSelected && isCorrect && [styles.optionCorrect, { borderColor: colors.success }],
                  isSelected && !isCorrect && [styles.optionWrong, { borderColor: colors.error }],
                ]}
                onPress={() => handleGuess(option)}
                disabled={selectedAnswer !== null}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    isSelected && isCorrect && [styles.optionTextCorrect, { color: colors.success }],
                    isSelected && !isCorrect && [styles.optionTextWrong, { color: colors.error }],
                  ]}
                >
                  {option}
                </ThemedText>
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
    padding: 24,
    flexGrow: 1,
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
  },
  progress: {
    fontSize: 14,
  },
  questionCard: {
    borderRadius: 16,
    padding: 24,
    gap: 20,
    alignItems: 'center',
  },
  saintImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  cluesSection: {
    width: '100%',
    gap: 12,
  },
  cluesTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  clueItem: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 8,
  },
  clueBullet: {
    fontSize: 18,
    fontWeight: '600',
  },
  clueText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  revealButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  revealButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  options: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  option: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCorrect: {
    backgroundColor: '#d1fae520',
  },
  optionWrong: {
    backgroundColor: '#fee2e220',
  },
  optionText: {
    fontSize: 16,
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
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    marginTop: 100,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  finalScore: {
    fontSize: 24,
    fontWeight: '600',
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
  },
  buttonTextOutline: {
  },
});

