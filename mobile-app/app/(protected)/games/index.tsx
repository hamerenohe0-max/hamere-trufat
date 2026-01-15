import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useGameStore } from '../../../src/features/games/state/useGameStore';
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';

const GAMES = [
  {
    id: 'trivia',
    title: 'Bible Trivia',
    description: 'Test your knowledge',
    icon: '📖',
    route: '/(protected)/games/trivia',
  },
  {
    id: 'who-said-it',
    title: 'Who Said It?',
    description: 'Guess the speaker',
    icon: '🗣️',
    route: '/(protected)/games/who-said-it',
  },
  {
    id: 'scramble',
    title: 'Scripture Scramble',
    description: 'Unscramble verses',
    icon: '🧩',
    route: '/(protected)/games/scramble',
  },
  {
    id: 'parable',
    title: 'Name That Parable',
    description: 'Identify the story',
    icon: '🌾',
    route: '/(protected)/games/parable',
  },
  {
    id: 'memory',
    title: 'Memory Match',
    description: 'Match symbols',
    icon: '🧠',
    route: '/(protected)/games/memory',
  },
  {
    id: 'bingo',
    title: 'Faith Bingo',
    description: 'Spiritual bingo',
    icon: '🎯',
    route: '/(protected)/games/bingo',
  },
  {
    id: 'journey',
    title: 'Bible Journey',
    description: 'Through major events',
    icon: '🗺️',
    route: '/(protected)/games/journey',
  },
  {
    id: 'virtue',
    title: 'Virtue Quest',
    description: 'Christian challenges',
    icon: '🤝',
    route: '/(protected)/games/virtue',
  },
  {
    id: 'history',
    title: 'Church History',
    description: 'Saints and councils',
    icon: '🏛️',
    route: '/(protected)/games/history',
  },
  {
    id: 'matchup',
    title: 'Prayer Match',
    description: 'Link prayers',
    icon: '🙏',
    route: '/(protected)/games/matchup',
  },
  {
    id: 'charades',
    title: 'Bible Charades',
    description: 'Act out stories',
    icon: '🎭',
    route: '/(protected)/games/charades',
  },
  {
    id: 'puzzle',
    title: 'Word Puzzles',
    description: 'Biblical challenges',
    icon: '🔠',
    route: '/(protected)/games/puzzle',
  },
  {
    id: 'saint',
    title: 'Guess the Saint',
    description: 'Identify clues',
    icon: '👼',
    route: '/(protected)/games/saint',
  },
];

export default function GamesListScreen() {
  const leaderboard = useGameStore((state) => state.leaderboard);
  const { colors, isDark } = useTheme();

  const gamesBg = isDark ? colors.background.primary : '#f8fafc';
  const cardBg = isDark ? colors.background.secondary : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: gamesBg }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: gamesBg }]}>
        <ThemedText style={styles.heading}>Games</ThemedText>
        <ThemedText style={styles.subtitle}>
          Test your knowledge and have fun with spiritual games.
        </ThemedText>

        <View style={styles.gamesGrid}>
          {GAMES.map((game) => {
            try {
              const scores = leaderboard(game.id as 'trivia' | 'puzzle' | 'saint' | 'memory');
              const topScore = scores && scores.length > 0 ? scores[0] : null;
              return (
                <Link key={game.id} href={game.route as any} asChild>
                  <TouchableOpacity style={[
                    styles.gameCard,
                    {
                      backgroundColor: cardBg,
                      borderColor: borderColor
                    }
                  ]}>
                    <Text style={styles.gameIcon}>{game.icon}</Text>
                    <ThemedText style={styles.gameTitle}>{game.title}</ThemedText>
                    <ThemedText style={styles.gameDescription}>{game.description}</ThemedText>
                    {topScore && (
                      <ThemedText style={styles.highScore}>
                        Best: {topScore.score} points
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                </Link>
              );
            } catch (error) {
              console.error('Error loading game scores:', error);
              return (
                <Link key={game.id} href={game.route as any} asChild>
                  <TouchableOpacity style={[
                    styles.gameCard,
                    {
                      backgroundColor: cardBg,
                      borderColor: borderColor
                    }
                  ]}>
                    <Text style={styles.gameIcon}>{game.icon}</Text>
                    <ThemedText style={styles.gameTitle}>{game.title}</ThemedText>
                    <ThemedText style={styles.gameDescription}>{game.description}</ThemedText>
                  </TouchableOpacity>
                </Link>
              );
            }
          })}
        </View>

        <View style={[styles.leaderboardSection, { backgroundColor: cardBg, borderColor: borderColor, borderWidth: isDark ? 1 : 0 }]}>
          <ThemedText style={styles.sectionTitle}>Your Top Scores</ThemedText>
          {GAMES.map((game) => {
            try {
              const scores = leaderboard(game.id as 'trivia' | 'puzzle' | 'saint' | 'memory');
              if (!scores || scores.length === 0) return null;
              return (
                <View key={game.id} style={[styles.scoreRow, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0' }]}>
                  <ThemedText style={styles.scoreGame}>{game.title}</ThemedText>
                  <ThemedText style={[styles.scoreValue, { color: colors.secondary.main }]}>{scores[0].score} pts</ThemedText>
                </View>
              );
            } catch (error) {
              console.error('Error loading scores for game:', game.id, error);
              return null;
            }
          })}
          {GAMES.every((game) => {
            try {
              const scores = leaderboard(game.id as 'trivia' | 'puzzle' | 'saint' | 'memory');
              return !scores || scores.length === 0;
            } catch {
              return true;
            }
          }) && (
              <ThemedText style={styles.emptyScores}>No scores yet. Play a game to get started!</ThemedText>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 24,
    paddingTop: 16,
    gap: 24,
    backgroundColor: '#f8fafc',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
    marginBottom: 8,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gameCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  gameIcon: {
    fontSize: 48,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
  gameDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  highScore: {
    fontSize: 11,
    color: '#9D6531', // Secondary
    fontWeight: '600',
    marginTop: 4,
  },
  leaderboardSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  scoreGame: {
    fontSize: 14,
    color: '#475569',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9D6531', // Secondary
  },
  emptyScores: {
    textAlign: 'center',
    color: '#94a3b8',
    paddingVertical: 16,
  },
});

