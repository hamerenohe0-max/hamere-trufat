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

export default function NameThatParableScreen() {
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
            <View style={styles.container}>
                <View style={styles.gameOverCard}>
                    <Text style={styles.gameOverTitle}>Knowledgeable! 🌾</Text>
                    <Text style={styles.finalScore}>Total Score: {score}</Text>
                    <View style={styles.gameOverActions}>
                        <TouchableOpacity style={styles.button} onPress={() => { setCurrentIdx(0); setScore(0); setGameOver(false); setCluesShown(1); setShowAnswer(false); }}>
                            <Text style={styles.buttonText}>Play Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={() => router.back()}>
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
                <Text style={styles.progress}>Parable {currentIdx + 1} of {NAME_THAT_PARABLE.length}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.title}>Clues for this Parable:</Text>

                <View style={styles.cluesContainer}>
                    {level.clues.slice(0, cluesShown).map((clue, i) => (
                        <View key={i} style={styles.clueBox}>
                            <Text style={styles.clueText}>• {clue}</Text>
                        </View>
                    ))}
                </View>

                {!showAnswer ? (
                    <View style={styles.actions}>
                        {cluesShown < level.clues.length && (
                            <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={handleNextClue}>
                                <Text style={styles.buttonTextOutline}>NEED ANOTHER CLUE?</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.button} onPress={handleGuess}>
                            <Text style={styles.buttonText}>I KNOW IT!</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.answerContainer}>
                        <Text style={styles.answerLabel}>ANSWER:</Text>
                        <Text style={styles.answerText}>{level.answer}</Text>
                        <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={nextLevel}>
                            <Text style={styles.buttonText}>NEXT PARABLE</Text>
                        </TouchableOpacity>
                    </View>
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
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 4, gap: 24 },
    title: { fontSize: 16, fontWeight: '600', color: '#64748b', textAlign: 'center' },
    cluesContainer: { gap: 12 },
    clueBox: { padding: 16, backgroundColor: '#f1f5f9', borderRadius: 12 },
    clueText: { fontSize: 17, color: '#1e293b', lineHeight: 24, fontWeight: '500' },
    actions: { gap: 12 },
    answerContainer: { alignItems: 'center', padding: 20, backgroundColor: '#fdfce8', borderRadius: 16, borderWidth: 1, borderColor: '#fef08a' },
    answerLabel: { fontSize: 12, fontWeight: '800', color: '#854d0e', letterSpacing: 1 },
    answerText: { fontSize: 24, fontWeight: '800', color: '#854d0e', textAlign: 'center', marginTop: 4 },
    button: { width: '100%', backgroundColor: colors.primary.main, padding: 18, borderRadius: 12, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary.main },
    buttonTextOutline: { color: colors.primary.main, fontWeight: '800' },
    gameOverCard: { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', gap: 16, marginTop: 100 },
    gameOverTitle: { fontSize: 28, fontWeight: '700' },
    finalScore: { fontSize: 24, fontWeight: '600', color: colors.primary.main },
    gameOverActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
