import { useState, useEffect } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../../src/features/games/state/useGameStore';
import { SCRIPTURE_SCRAMBLE } from '../../../src/features/games/data/games_data';
import * as Haptics from 'expo-haptics';
import { colors } from '../../../src/config/colors';

export default function ScriptureScrambleScreen() {
    const router = useRouter();
    const addScore = useGameStore((state) => state.addScore);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [scrambled, setScrambled] = useState('');
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);

    const level = SCRIPTURE_SCRAMBLE[currentIdx];

    useEffect(() => {
        if (level) {
            setScrambled(shuffleString(level.word));
            setUserInput('');
            setFeedback(null);
        }
    }, [currentIdx]);

    function shuffleString(s: string) {
        const arr = s.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        const res = arr.join('');
        return res === s ? shuffleString(s) : res;
    }

    function handleSubmit() {
        if (userInput.toUpperCase() === level.word) {
            setFeedback('success');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setScore(score + 20);

            setTimeout(() => {
                if (currentIdx < SCRIPTURE_SCRAMBLE.length - 1) {
                    setCurrentIdx(currentIdx + 1);
                } else {
                    setGameOver(true);
                    addScore({
                        id: `scramble-${Date.now()}`,
                        game: 'scramble',
                        score: score + 20,
                        createdAt: new Date().toISOString(),
                    });
                }
            }, 1000);
        } else {
            setFeedback('error');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setTimeout(() => setFeedback(null), 1000);
        }
    }

    if (gameOver) {
        return (
            <View style={styles.container}>
                <View style={styles.gameOverCard}>
                    <Text style={styles.gameOverTitle}>Great Work! 🧩</Text>
                    <Text style={styles.finalScore}>Score: {score}</Text>
                    <View style={styles.gameOverActions}>
                        <TouchableOpacity style={styles.button} onPress={() => { setCurrentIdx(0); setScore(0); setGameOver(false); }}>
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
                <Text style={styles.progress}>Level {currentIdx + 1} / {SCRIPTURE_SCRAMBLE.length}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.hintTitle}>HINT</Text>
                <Text style={styles.hintText}>{level.hint}</Text>

                <View style={styles.scrambledContainer}>
                    {scrambled.split('').map((char, i) => (
                        <View key={i} style={styles.letterBox}>
                            <Text style={styles.letterText}>{char}</Text>
                        </View>
                    ))}
                </View>

                <TextInput
                    style={[
                        styles.input,
                        feedback === 'success' && styles.inputSuccess,
                        feedback === 'error' && styles.inputError,
                    ]}
                    value={userInput}
                    onChangeText={setUserInput}
                    placeholder="Type your answer..."
                    autoCapitalize="characters"
                    autoCorrect={false}
                />

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>CHECK ANSWER</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    score: { fontSize: 20, fontWeight: '700', color: colors.primary.main },
    progress: { fontSize: 14, color: '#64748b' },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, gap: 24, elevation: 4, alignItems: 'center' },
    hintTitle: { fontSize: 12, color: '#94a3b8', fontWeight: '700', letterSpacing: 1 },
    hintText: { fontSize: 18, color: '#475569', textAlign: 'center', lineHeight: 26 },
    scrambledContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    letterBox: { width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    letterText: { fontSize: 20, fontWeight: '700', color: colors.primary.main },
    input: {
        width: '100%', height: 60, backgroundColor: '#f8fafc', borderRadius: 12,
        borderWidth: 2, borderColor: '#e2e8f0', paddingHorizontal: 16,
        fontSize: 22, fontWeight: '700', textAlign: 'center', color: '#0f172a'
    },
    inputSuccess: { borderColor: '#10b981', backgroundColor: '#d1fae5' },
    inputError: { borderColor: '#ef4444', backgroundColor: '#fee2e2' },
    button: { width: '100%', backgroundColor: colors.primary.main, padding: 18, borderRadius: 12, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary.main, marginTop: 10 },
    buttonTextOutline: { color: colors.primary.main },
    gameOverCard: { backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', gap: 16, marginTop: 100 },
    gameOverTitle: { fontSize: 28, fontWeight: '700' },
    finalScore: { fontSize: 24, fontWeight: '600', color: colors.primary.main },
    gameOverActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
