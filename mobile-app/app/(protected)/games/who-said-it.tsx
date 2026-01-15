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
import { WHO_SAID_IT } from '../../../src/features/games/data/games_data';
import * as Haptics from 'expo-haptics';
import { colors } from '../../../src/config/colors';
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';

export default function WhoSaidItScreen() {
    const { colors: themeColors, isDark } = useTheme();
    const router = useRouter();
    const addScore = useGameStore((state) => state.addScore);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const question = WHO_SAID_IT[currentIdx];

    function handleAnswer(optionIndex: number) {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(optionIndex);
        setShowResult(true);

        if (optionIndex === question.correct) {
            setScore(score + 15);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        setTimeout(() => {
            if (currentIdx < WHO_SAID_IT.length - 1) {
                setCurrentIdx(currentIdx + 1);
                setSelectedAnswer(null);
                setShowResult(false);
            } else {
                setGameOver(true);
                const finalScore = score + (optionIndex === question.correct ? 15 : 0);
                addScore({
                    id: `who-said-it-${Date.now()}`,
                    game: 'who-said-it',
                    score: finalScore,
                    createdAt: new Date().toISOString(),
                });
            }
        }, 2000);
    }

    function resetGame() {
        setCurrentIdx(0);
        setScore(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setGameOver(false);
    }

    if (gameOver) {
        return (
            <View style={[styles.container, { backgroundColor: themeColors.background.primary }]}>
                <View style={[styles.gameOverCard, { backgroundColor: themeColors.background.secondary }]}>
                    <ThemedText style={styles.gameOverTitle}>Well Done! 🗣️</ThemedText>
                    <ThemedText style={[styles.finalScore, { color: themeColors.primary.main }]}>Final Score: {score}</ThemedText>
                    <ThemedText style={styles.finalScoreText}>
                        {score >= 45 ? 'True Prophet! 🎉' : 'Keep reading! 📖'}
                    </ThemedText>
                    <View style={styles.gameOverActions}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary.main }]} onPress={resetGame}>
                            <ThemedText style={styles.buttonText}>Play Again</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonOutline, { borderColor: themeColors.primary.main }]}
                            onPress={() => router.back()}
                        >
                            <ThemedText style={[styles.buttonText, { color: themeColors.primary.main }]}>Back</ThemedText>
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
                <ThemedText style={styles.progress}>Quote {currentIdx + 1} of {WHO_SAID_IT.length}</ThemedText>
            </View>

            <View style={[styles.card, { backgroundColor: themeColors.background.secondary }]}>
                <ThemedText style={styles.quoteTitle}>Who said this?</ThemedText>
                <View style={[styles.quoteContainer, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                    <ThemedText style={styles.quoteText}>"{question.quote}"</ThemedText>
                </View>

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
                                    { backgroundColor: isDark ? '#1e293b' : '#f8fafc' },
                                    isSelected && { borderColor: themeColors.primary.main, backgroundColor: themeColors.primary.main + '20' },
                                    showCorrect && { borderColor: '#10b981', backgroundColor: isDark ? '#064e3b' : '#d1fae5' },
                                    showWrong && { borderColor: '#ef4444', backgroundColor: isDark ? '#7f1d1d' : '#fee2e2' },
                                ]}
                                onPress={() => handleAnswer(index)}
                                disabled={selectedAnswer !== null}
                            >
                                <ThemedText style={[
                                    styles.optionText,
                                    isSelected && { color: themeColors.primary.main, fontWeight: '700' },
                                    showCorrect && { color: '#10b981', fontWeight: '700' },
                                    showWrong && { color: '#ef4444', fontWeight: '700' },
                                ]}>
                                    {option}
                                </ThemedText>
                                {showResult && isCorrect && <ThemedText style={{ color: '#10b981' }}>✓</ThemedText>}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {showResult && (
                    <ThemedText style={styles.referenceText}>Reference: {question.reference}</ThemedText>
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
    card: { borderRadius: 20, padding: 24, gap: 20, elevation: 4 },
    quoteTitle: { fontSize: 16, opacity: 0.6, fontWeight: '600', textAlign: 'center' },
    quoteContainer: { padding: 20, borderRadius: 16 },
    quoteText: { fontSize: 20, fontWeight: '700', textAlign: 'center', fontStyle: 'italic' },
    options: { gap: 12 },
    option: {
        padding: 16, borderRadius: 12,
        flexDirection: 'row', justifyContent: 'space-between', borderWidth: 2, borderColor: 'transparent'
    },
    optionText: { fontSize: 16 },
    referenceText: { textAlign: 'center', marginTop: 10, fontSize: 12, opacity: 0.5 },
    gameOverCard: { borderRadius: 20, padding: 32, alignItems: 'center', gap: 16, marginTop: 100 },
    gameOverTitle: { fontSize: 28, fontWeight: '700' },
    finalScore: { fontSize: 24, fontWeight: '600' },
    finalScoreText: { fontSize: 18, opacity: 0.8 },
    gameOverActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    buttonText: { color: '#fff', fontWeight: '600' },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 1 },
});
