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
import { CHURCH_HISTORY } from '../../../src/features/games/data/games_data';
import * as Haptics from 'expo-haptics';
import { colors } from '../../../src/config/colors';
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';

export default function ChurchHistoryScreen() {
    const { colors: themeColors, isDark } = useTheme();
    const router = useRouter();
    const addScore = useGameStore((state) => state.addScore);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const question = CHURCH_HISTORY[currentIdx];

    function handleAnswer(optionIndex: number) {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(optionIndex);
        setShowResult(true);

        if (optionIndex === question.correct) {
            setScore(score + 25);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        setTimeout(() => {
            if (currentIdx < CHURCH_HISTORY.length - 1) {
                setCurrentIdx(currentIdx + 1);
                setSelectedAnswer(null);
                setShowResult(false);
            } else {
                setGameOver(true);
                const finalScore = score + (optionIndex === question.correct ? 25 : 0);
                addScore({
                    id: `history-${Date.now()}`,
                    game: 'history',
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
                    <ThemedText style={styles.gameOverTitle}>History Buff! 🏛️</ThemedText>
                    <ThemedText style={[styles.finalScore, { color: themeColors.primary.main }]}>Final Score: {score}</ThemedText>
                    <View style={styles.gameOverActions}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary.main }]} onPress={resetGame}>
                            <ThemedText style={styles.buttonText}>Try Again</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonOutline, { borderColor: themeColors.primary.main }]}
                            onPress={() => router.back()}
                        >
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
                <ThemedText style={styles.progress}>Legacy {currentIdx + 1} of {CHURCH_HISTORY.length}</ThemedText>
            </View>

            <View style={[styles.card, { backgroundColor: themeColors.background.secondary }]}>
                <ThemedText style={[styles.category, { color: themeColors.primary.main }]}>CHURCH HISTORY</ThemedText>
                <ThemedText style={styles.questionText}>{question.question}</ThemedText>

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
                                    { backgroundColor: isDark ? '#1e293b' : '#f9fafb', borderColor: isDark ? '#334155' : '#f3f4f6' },
                                    isSelected && { borderColor: themeColors.primary.main, backgroundColor: isDark ? '#b4530920' : '#fffbeb' },
                                    showCorrect && { borderColor: '#10b981', backgroundColor: isDark ? '#064e3b20' : '#ecfdf5' },
                                    showWrong && { borderColor: '#ef4444', backgroundColor: isDark ? '#991b1b20' : '#fef2f2' },
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
                                {showResult && isCorrect && <ThemedText style={{ color: '#10b981', fontWeight: 'bold' }}>✓</ThemedText>}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    score: { fontSize: 20, fontWeight: '700' },
    progress: { fontSize: 14, opacity: 0.6 },
    card: { borderRadius: 24, padding: 24, gap: 20, elevation: 6 },
    category: { fontSize: 12, fontWeight: '800', letterSpacing: 2, textAlign: 'center' },
    questionText: { fontSize: 22, fontWeight: '700', textAlign: 'center', lineHeight: 30 },
    options: { gap: 12 },
    option: {
        padding: 18, borderRadius: 16,
        flexDirection: 'row', justifyContent: 'space-between', borderWidth: 2
    },
    optionText: { fontSize: 16, fontWeight: '500' },
    gameOverCard: { borderRadius: 24, padding: 32, alignItems: 'center', gap: 16, marginTop: 100 },
    gameOverTitle: { fontSize: 28, fontWeight: '700' },
    finalScore: { fontSize: 24, fontWeight: '600' },
    gameOverActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    button: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
    buttonText: { color: '#fff', fontWeight: '700' },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 1 },
});
