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

export default function WhoSaidItScreen() {
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
            <View style={styles.container}>
                <View style={styles.gameOverCard}>
                    <Text style={styles.gameOverTitle}>Well Done! 🗣️</Text>
                    <Text style={styles.finalScore}>Final Score: {score}</Text>
                    <Text style={styles.finalScoreText}>
                        {score >= 45 ? 'True Prophet! 🎉' : 'Keep reading! 📖'}
                    </Text>
                    <View style={styles.gameOverActions}>
                        <TouchableOpacity style={styles.button} onPress={resetGame}>
                            <Text style={styles.buttonText}>Play Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonOutline]}
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.buttonText, styles.buttonTextOutline]}>Back</Text>
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
                <Text style={styles.progress}>Quote {currentIdx + 1} of {WHO_SAID_IT.length}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.quoteTitle}>Who said this?</Text>
                <View style={styles.quoteContainer}>
                    <Text style={styles.quoteText}>"{question.quote}"</Text>
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
                                    isSelected && styles.optionSelected,
                                    showCorrect && styles.optionCorrect,
                                    showWrong && styles.optionWrong,
                                ]}
                                onPress={() => handleAnswer(index)}
                                disabled={selectedAnswer !== null}
                            >
                                <Text style={[
                                    styles.optionText,
                                    isSelected && styles.optionTextSelected,
                                    showCorrect && styles.optionTextCorrect,
                                    showWrong && styles.optionTextWrong,
                                ]}>
                                    {option}
                                </Text>
                                {showResult && isCorrect && <Text style={{ color: '#10b981' }}>✓</Text>}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {showResult && (
                    <Text style={styles.referenceText}>Reference: {question.reference}</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    score: { fontSize: 20, fontWeight: '700', color: colors.primary.main },
    progress: { fontSize: 14, color: '#64748b' },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, gap: 20, elevation: 4 },
    quoteTitle: { fontSize: 16, color: '#64748b', fontWeight: '600', textAlign: 'center' },
    quoteContainer: { padding: 20, backgroundColor: '#f1f5f9', borderRadius: 16 },
    quoteText: { fontSize: 20, fontWeight: '700', color: '#0f172a', textAlign: 'center', fontStyle: 'italic' },
    options: { gap: 12 },
    option: {
        padding: 16, borderRadius: 12, backgroundColor: '#f8fafc',
        flexDirection: 'row', justifyContent: 'space-between', borderWidth: 2, borderColor: 'transparent'
    },
    optionSelected: { borderColor: colors.primary.main, backgroundColor: colors.primary.lighter + '20' },
    optionCorrect: { borderColor: '#10b981', backgroundColor: '#d1fae5' },
    optionWrong: { borderColor: '#ef4444', backgroundColor: '#fee2e2' },
    optionText: { fontSize: 16, color: '#1f2937' },
    optionTextSelected: { fontWeight: '700', color: colors.primary.main },
    optionTextCorrect: { fontWeight: '700', color: '#059669' },
    optionTextWrong: { fontWeight: '700', color: '#dc2626' },
    referenceText: { textAlign: 'center', color: '#64748b', marginTop: 10, fontSize: 12 },
    gameOverCard: { backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', gap: 16, marginTop: 100 },
    gameOverTitle: { fontSize: 28, fontWeight: '700' },
    finalScore: { fontSize: 24, fontWeight: '600', color: colors.primary.main },
    finalScoreText: { fontSize: 18, color: '#475569' },
    gameOverActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    button: { backgroundColor: colors.primary.main, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    buttonText: { color: '#fff', fontWeight: '600' },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary.main },
    buttonTextOutline: { color: colors.primary.main },
});
