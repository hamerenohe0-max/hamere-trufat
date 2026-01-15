import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../../src/features/games/state/useGameStore';
import { NAME_THAT_PARABLE } from '../../../src/features/games/data/games_data';
import * as Haptics from 'expo-haptics';
import { colors } from '../../../src/config/colors';
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';

export default function NameThatParableScreen() {
    const { colors: themeColors, isDark } = useTheme();
    const router = useRouter();
    const addScore = useGameStore((state) => state.addScore);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [cluesShown, setCluesShown] = useState(1);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);

    const level = NAME_THAT_PARABLE[currentIdx];

    function handleNextClue() {
        if (cluesShown < level.clues.length) {
            setCluesShown(cluesShown + 1);
            Haptics.selectionAsync();
        }
    }

    function handleGuess() {
        setShowAnswer(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Score based on clues used: 3 clues = 10pts, 2 = 20pts, 1 = 30pts
        const points = (4 - cluesShown) * 10;
        setScore(score + points);
    }

    function nextLevel() {
        if (currentIdx < NAME_THAT_PARABLE.length - 1) {
            setCurrentIdx(currentIdx + 1);
            setCluesShown(1);
            setShowAnswer(false);
        } else {
            setGameOver(true);
            addScore({
                id: `parable-${Date.now()}`,
                game: 'parable',
                score: score,
                createdAt: new Date().toISOString(),
            });
        }
    }

    if (gameOver) {
        return (
            <View style={[styles.container, { backgroundColor: themeColors.background.primary }]}>
                <View style={[styles.gameOverCard, { backgroundColor: themeColors.background.secondary }]}>
                    <ThemedText style={styles.gameOverTitle}>Knowledgeable! 🌾</ThemedText>
                    <ThemedText style={[styles.finalScore, { color: themeColors.primary.main }]}>Total Score: {score}</ThemedText>
                    <View style={styles.gameOverActions}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary.main }]} onPress={() => { setCurrentIdx(0); setScore(0); setGameOver(false); setCluesShown(1); setShowAnswer(false); }}>
                            <ThemedText style={styles.buttonText}>Play Again</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buttonOutline, { borderColor: themeColors.primary.main }]} onPress={() => router.back()}>
                            <ThemedText style={[styles.buttonText, { color: themeColors.primary.main }]}>Games</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.background.primary }]}>
            <View style={styles.header}>
                <ThemedText style={[styles.score, { color: themeColors.primary.main }]}>Score: {score}</ThemedText>
                <ThemedText style={styles.progress}>Parable {currentIdx + 1} of {NAME_THAT_PARABLE.length}</ThemedText>
            </View>

            <View style={[styles.card, { backgroundColor: themeColors.background.secondary }]}>
                <ThemedText style={styles.title}>Clues for this Parable:</ThemedText>

                <View style={styles.cluesContainer}>
                    {level.clues.slice(0, cluesShown).map((clue, i) => (
                        <View key={i} style={[styles.clueBox, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                            <ThemedText style={styles.clueText}>• {clue}</ThemedText>
                        </View>
                    ))}
                </View>

                {!showAnswer ? (
                    <View style={styles.actions}>
                        {cluesShown < level.clues.length && (
                            <TouchableOpacity style={[styles.button, styles.buttonOutline, { borderColor: themeColors.primary.main }]} onPress={handleNextClue}>
                                <ThemedText style={[styles.buttonText, { color: themeColors.primary.main }]}>NEED ANOTHER CLUE?</ThemedText>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary.main }]} onPress={handleGuess}>
                            <ThemedText style={styles.buttonText}>I KNOW IT!</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={[styles.answerContainer, { backgroundColor: isDark ? '#3f2b10' : '#fdfce8', borderColor: isDark ? '#d4a017' : '#fef08a' }]}>
                        <ThemedText style={[styles.answerLabel, { color: isDark ? '#fef08a' : '#854d0e' }]}>ANSWER:</ThemedText>
                        <ThemedText style={[styles.answerText, { color: isDark ? '#fef08a' : '#854d0e' }]}>{level.answer}</ThemedText>
                        <TouchableOpacity style={[styles.button, { marginTop: 20, backgroundColor: themeColors.primary.main }]} onPress={nextLevel}>
                            <ThemedText style={styles.buttonText}>NEXT PARABLE</ThemedText>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    score: { fontSize: 20, fontWeight: '700' },
    progress: { fontSize: 14, opacity: 0.6 },
    card: { borderRadius: 24, padding: 24, elevation: 4, gap: 24 },
    title: { fontSize: 16, fontWeight: '600', opacity: 0.6, textAlign: 'center' },
    cluesContainer: { gap: 12 },
    clueBox: { padding: 16, borderRadius: 12 },
    clueText: { fontSize: 17, lineHeight: 24, fontWeight: '500' },
    actions: { gap: 12 },
    answerContainer: { alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1 },
    answerLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    answerText: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginTop: 4 },
    button: { width: '100%', padding: 18, borderRadius: 12, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 2 },
    gameOverCard: { borderRadius: 24, padding: 32, alignItems: 'center', gap: 16, marginTop: 100 },
    gameOverTitle: { fontSize: 28, fontWeight: '700' },
    finalScore: { fontSize: 24, fontWeight: '600' },
    gameOverActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
