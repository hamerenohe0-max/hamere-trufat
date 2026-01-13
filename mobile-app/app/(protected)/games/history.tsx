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

export default function ChurchHistoryScreen() {
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
            <View style={styles.container}>
                <View style={styles.gameOverCard}>
                    <Text style={styles.gameOverTitle}>History Buff! 🏛️</Text>
                    <Text style={styles.finalScore}>Final Score: {score}</Text>
                    <View style={styles.gameOverActions}>
                        <TouchableOpacity style={styles.button} onPress={resetGame}>
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonOutline]}
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.buttonText, styles.buttonTextOutline]}>Games</Text>
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
                <Text style={styles.progress}>Legacy {currentIdx + 1} of {CHURCH_HISTORY.length}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.category}>CHURCH HISTORY</Text>
                <Text style={styles.questionText}>{question.question}</Text>

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
                                {showResult && isCorrect && <Text style={{ color: '#10b981', fontWeight: 'bold' }}>✓</Text>}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    score: { fontSize: 20, fontWeight: '700', color: '#b45309' },
    progress: { fontSize: 14, color: '#64748b' },
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, gap: 20, elevation: 6 },
    category: { fontSize: 12, fontWeight: '800', color: '#b45309', letterSpacing: 2, textAlign: 'center' },
    questionText: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', lineHeight: 30 },
    options: { gap: 12 },
    option: {
        padding: 18, borderRadius: 16, backgroundColor: '#f9fafb',
        flexDirection: 'row', justifyContent: 'space-between', borderWidth: 2, borderColor: '#f3f4f6'
    },
    optionSelected: { borderColor: '#b45309', backgroundColor: '#fffbeb' },
    optionCorrect: { borderColor: '#10b981', backgroundColor: '#ecfdf5' },
    optionWrong: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
    optionText: { fontSize: 16, color: '#374151', fontWeight: '500' },
    optionTextSelected: { color: '#b45309', fontWeight: '700' },
    optionTextCorrect: { color: '#065f46', fontWeight: '700' },
    optionTextWrong: { color: '#991b1b', fontWeight: '700' },
    gameOverCard: { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', gap: 16, marginTop: 100 },
    gameOverTitle: { fontSize: 28, fontWeight: '700' },
    finalScore: { fontSize: 24, fontWeight: '600', color: '#b45309' },
    gameOverActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    button: { backgroundColor: '#b45309', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
    buttonText: { color: '#fff', fontWeight: '700' },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#b45309' },
    buttonTextOutline: { color: '#b45309' },
});
