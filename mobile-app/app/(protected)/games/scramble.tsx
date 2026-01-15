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
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';

export default function ScriptureScrambleScreen() {
    const { colors: themeColors, isDark } = useTheme();
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
            <View style={[styles.container, { backgroundColor: themeColors.background.primary }]}>
                <View style={[styles.gameOverCard, { backgroundColor: themeColors.background.secondary }]}>
                    <ThemedText style={styles.gameOverTitle}>Great Work! 🧩</ThemedText>
                    <ThemedText style={[styles.finalScore, { color: themeColors.primary.main }]}>Score: {score}</ThemedText>
                    <View style={styles.gameOverActions}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary.main }]} onPress={() => { setCurrentIdx(0); setScore(0); setGameOver(false); }}>
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
                <ThemedText style={styles.progress}>Level {currentIdx + 1} / {SCRIPTURE_SCRAMBLE.length}</ThemedText>
            </View>

            <View style={[styles.card, { backgroundColor: themeColors.background.secondary }]}>
                <ThemedText style={styles.hintTitle}>HINT</ThemedText>
                <ThemedText style={styles.hintText}>{level.hint}</ThemedText>

                <View style={styles.scrambledContainer}>
                    {scrambled.split('').map((char, i) => (
                        <View key={i} style={[styles.letterBox, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                            <ThemedText style={[styles.letterText, { color: themeColors.primary.main }]}>{char}</ThemedText>
                        </View>
                    ))}
                </View>

                <TextInput
                    style={[
                        styles.input,
                        { backgroundColor: isDark ? '#1e293b' : '#f8fafc', color: themeColors.text.primary, borderColor: themeColors.border.subtle },
                        feedback === 'success' && styles.inputSuccess,
                        feedback === 'error' && styles.inputError,
                    ]}
                    value={userInput}
                    onChangeText={setUserInput}
                    placeholder="Type your answer..."
                    placeholderTextColor={themeColors.text.disabled}
                    autoCapitalize="characters"
                    autoCorrect={false}
                />

                <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary.main }]} onPress={handleSubmit}>
                    <ThemedText style={styles.buttonText}>CHECK ANSWER</ThemedText>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    score: { fontSize: 20, fontWeight: '700' },
    progress: { fontSize: 14, opacity: 0.6 },
    card: { borderRadius: 20, padding: 24, gap: 24, elevation: 4, alignItems: 'center' },
    hintTitle: { fontSize: 12, opacity: 0.5, fontWeight: '700', letterSpacing: 1 },
    hintText: { fontSize: 18, textAlign: 'center', lineHeight: 26 },
    scrambledContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    letterBox: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    letterText: { fontSize: 20, fontWeight: '700' },
    input: {
        width: '100%', height: 60, borderRadius: 12,
        borderWidth: 2, paddingHorizontal: 16,
        fontSize: 22, fontWeight: '700', textAlign: 'center'
    },
    inputSuccess: { borderColor: '#10b981', backgroundColor: '#d1fae5' },
    inputError: { borderColor: '#ef4444', backgroundColor: '#fee2e2' },
    button: { width: '100%', padding: 18, borderRadius: 12, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 1, marginTop: 10 },
    gameOverCard: { borderRadius: 20, padding: 32, alignItems: 'center', gap: 16, marginTop: 100 },
    gameOverTitle: { fontSize: 28, fontWeight: '700' },
    finalScore: { fontSize: 24, fontWeight: '600' },
    gameOverActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
