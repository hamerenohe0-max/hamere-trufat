import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { useGameStore } from '../../../src/features/games/state/useGameStore';

const GAMES = [
  {
    id: 'trivia',
    title: 'Bible Trivia',
    description: 'Test your knowledge of the Bible and Orthodox teachings',
    icon: '📖',
    route: '/(protected)/games/trivia',
  },
  {
    id: 'puzzle',
    title: 'Spiritual Puzzles',
    description: 'Solve word puzzles and biblical challenges',
    icon: '🧩',
    route: '/(protected)/games/puzzle',
  },
  {
    id: 'saint',
    title: 'Guess the Saint',
    description: 'Identify saints from clues and images',
    icon: '👼',
    route: '/(protected)/games/saint',
  },
  {
    id: 'memory',
    title: 'Memory Match',
    description: 'Match pairs of biblical symbols and teachings',
    icon: '🧠',
    route: '/(protected)/games/memory',
  },
];

export default function GamesListScreen() {
  const leaderboard = useGameStore((state) => state.leaderboard);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Games</Text>
      <Text style={styles.subtitle}>
        Test your knowledge and have fun with spiritual games.
      </Text>

      <View style={styles.gamesGrid}>
        {GAMES.map((game) => {
          const topScore = leaderboard(game.id as any)[0];
          return (
            <Link key={game.id} href={game.route as any} asChild>
              <TouchableOpacity style={styles.gameCard}>
                <Text style={styles.gameIcon}>{game.icon}</Text>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>
                {topScore && (
                  <Text style={styles.highScore}>
                    Best: {topScore.score} points
                  </Text>
                )}
              </TouchableOpacity>
            </Link>
          );
        })}
      </View>

      <View style={styles.leaderboardSection}>
        <Text style={styles.sectionTitle}>Your Top Scores</Text>
        {GAMES.map((game) => {
          const scores = leaderboard(game.id as any);
          if (scores.length === 0) return null;
          return (
            <View key={game.id} style={styles.scoreRow}>
              <Text style={styles.scoreGame}>{game.title}</Text>
              <Text style={styles.scoreValue}>{scores[0].score} pts</Text>
            </View>
          );
        })}
        {GAMES.every((game) => leaderboard(game.id as any).length === 0) && (
          <Text style={styles.emptyScores}>No scores yet. Play a game to get started!</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
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
    color: '#2563eb',
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
    color: '#2563eb',
  },
  emptyScores: {
    textAlign: 'center',
    color: '#94a3b8',
    paddingVertical: 16,
  },
});

