import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../../src/features/games/state/useGameStore';
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';
import * as Haptics from 'expo-haptics';

// Memory match cards
const CARD_PAIRS = [
  { id: 1, symbol: '✝️', name: 'Cross' },
  { id: 2, symbol: '📖', name: 'Bible' },
  { id: 3, symbol: '🕊️', name: 'Dove' },
  { id: 4, symbol: '⛪', name: 'Church' },
  { id: 5, symbol: '🕯️', name: 'Candle' },
  { id: 6, symbol: '🙏', name: 'Prayer' },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MemoryMatchScreen() {
  const { colors: themeColors, isDark } = useTheme();
  const router = useRouter();
  const addScore = useGameStore((state) => state.addScore);
  const [cards, setCards] = useState<Array<{ id: number; symbol: string; name: string; flipped: boolean; matched: boolean }>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    // Create pairs and shuffle
    const cardPairs = [...CARD_PAIRS, ...CARD_PAIRS];
    const shuffled = shuffleArray(cardPairs).map((card, index) => ({
      ...card,
      id: index,
      flipped: false,
      matched: false,
    }));
    setCards(shuffled);
  }, []);

  function handleCardPress(cardId: number) {
    if (flippedCards.length >= 2 || cards[cardId].flipped || cards[cardId].matched) {
      return;
    }

    const newCards = [...cards];
    newCards[cardId].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.symbol === secondCard.symbol) {
        // Match!
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[first].matched = true;
          updatedCards[second].matched = true;
          setCards(updatedCards);
          setFlippedCards([]);
          setMatches(matches + 1);

          if (matches + 1 === CARD_PAIRS.length) {
            setGameWon(true);
            const score = Math.max(100 - moves * 5, 10);
            addScore({
              id: `memory-${Date.now()}`,
              game: 'memory',
              score,
              createdAt: new Date().toISOString(),
            });
          }
        }, 500);
      } else {
        // No match
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[first].flipped = false;
          updatedCards[second].flipped = false;
          setCards(updatedCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  }

  function resetGame() {
    const cardPairs = [...CARD_PAIRS, ...CARD_PAIRS];
    const shuffled = shuffleArray(cardPairs).map((card, index) => ({
      ...card,
      id: index,
      flipped: false,
      matched: false,
    }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameWon(false);
  }

  if (gameWon) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background.primary }]}>
        <View style={[styles.gameOverCard, { backgroundColor: themeColors.background.secondary }]}>
          <ThemedText style={styles.gameOverTitle}>You Won! 🎉</ThemedText>
          <ThemedText style={styles.finalScore}>Moves: {moves}</ThemedText>
          <ThemedText style={styles.finalScoreText}>
            Score: {Math.max(100 - moves * 5, 10)} points
          </ThemedText>
          <View style={styles.gameOverActions}>
            <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary.main }]} onPress={resetGame}>
              <ThemedText style={styles.buttonText}>Play Again</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonOutline, { borderColor: themeColors.primary.main }]}
              onPress={() => router.back()}
            >
              <ThemedText style={[styles.buttonText, { color: themeColors.primary.main }]}>
                Back to Games
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.background.primary }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.score, { color: themeColors.primary.main }]}>Moves: {moves}</ThemedText>
        <ThemedText style={styles.progress}>Matches: {matches}/{CARD_PAIRS.length}</ThemedText>
      </View>

      <View style={styles.grid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              { backgroundColor: isDark ? '#1e293b' : '#e2e8f0', borderColor: isDark ? '#334155' : '#cbd5f5' },
              card.flipped && { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: themeColors.primary.main },
              card.matched && { backgroundColor: isDark ? '#064e3b' : '#d1fae5', borderColor: '#10b981' },
            ]}
            onPress={() => handleCardPress(card.id)}
            disabled={card.matched}
          >
            {card.flipped || card.matched ? (
              <ThemedText style={styles.cardSymbol}>{card.symbol}</ThemedText>
            ) : (
              <ThemedText style={styles.cardBack}>?</ThemedText>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
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
    opacity: 0.6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  card: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  cardSymbol: {
    fontSize: 32,
  },
  cardBack: {
    fontSize: 24,
    opacity: 0.5,
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
  finalScoreText: {
    fontSize: 18,
    opacity: 0.8,
  },
  gameOverActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
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
});

