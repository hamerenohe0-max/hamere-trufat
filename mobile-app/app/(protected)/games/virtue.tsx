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
import { VIRTUE_QUEST } from '../../../src/features/games/data/games_data';
import * as Haptics from 'expo-haptics';
import { colors } from '../../../src/config/colors';
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';

export default function VirtueQuestScreen() {
    const { colors: themeColors, isDark } = useTheme();
    const router = useRouter();
    const addScore = useGameStore((state) => state.addScore);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [showChallenge, setShowChallenge] = useState(true);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);

    const quest = VIRTUE_QUEST[currentIdx];

    function handleChallengeDone() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowChallenge(false);
    }

    function handleComplete() {
        setShowAnswer(true);
        setScore(score + 50);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    function nextQuest() {
        if (currentIdx < VIRTUE_QUEST.length - 1) {
            setCurrentIdx(currentIdx + 1);
            setShowChallenge(true);
            setShowAnswer(false);
        } else {
            setGameOver(true);
            addScore({
                id: `virtue-${Date.now()}`,
                game: 'virtue',
                score: score,
                createdAt: new Date().toISOString(),
            });
        }
    }

    if (gameOver) {
        return (
            <View style={[styles.container, { backgroundColor: themeColors.background.primary }]}>
                <View style={[styles.gameOverCard, { backgroundColor: themeColors.background.secondary }]}>
                    <ThemedText style={styles.gameOverTitle}>Virtuous! 🤝</ThemedText>
                    <ThemedText style={[styles.finalScore, { color: themeColors.primary.main }]}>Total Points: {score}</ThemedText>
                    <View style={styles.gameOverActions}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary.main }]} onPress={() => { setCurrentIdx(0); setScore(0); setGameOver(false); setShowChallenge(true); setShowAnswer(false); }}>
                            <ThemedText style={styles.buttonText}>Restart Quest</ThemedText>
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
                <ThemedText style={[styles.score, { color: themeColors.primary.main }]}>Virtue Points: {score}</ThemedText>
                <ThemedText style={styles.progress}>Quest {currentIdx + 1} of {VIRTUE_QUEST.length}</ThemedText>
            </View>

            <View style={[styles.card, { backgroundColor: themeColors.background.secondary }]}>
                <ThemedText style={[styles.virtueName, { color: themeColors.primary.main }]}>{quest.virtue}</ThemedText>

                {showChallenge ? (
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>CHALLENGE</ThemedText>
                        <View style={[styles.challengeBox, { backgroundColor: isDark ? '#2d1b4d' : '#f5f3ff', borderColor: isDark ? '#4c1d95' : '#ddd6fe' }]}>
                            <ThemedText style={[styles.challengeText, { color: isDark ? '#a78bfa' : '#4c1d95' }]}>"{quest.challenge}"</ThemedText>
                        </View>
                        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary.main }]} onPress={handleChallengeDone}>
                            <ThemedText style={styles.buttonText}>I HAVE DONE THIS</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>REFLECTION QUESTION</ThemedText>
                        <ThemedText style={styles.questionText}>{quest.question}</ThemedText>

                        {!showAnswer ? (
                            <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary.main }]} onPress={handleComplete}>
                                <ThemedText style={styles.buttonText}>REVEAL ANSWER</ThemedText>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.answerContainer}>
                                <ThemedText style={[styles.answerText, { color: '#059669' }]}>{quest.answer}</ThemedText>
                                <TouchableOpacity style={[styles.button, { marginTop: 20, backgroundColor: themeColors.primary.main }]} onPress={nextQuest}>
                                    <ThemedText style={styles.buttonText}>NEXT VIRTUE</ThemedText>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    score: { fontSize: 18, fontWeight: '700' },
    progress: { fontSize: 14, opacity: 0.6 },
    card: { borderRadius: 24, padding: 24, elevation: 4, gap: 24, alignItems: 'center' },
    virtueName: { fontSize: 32, fontWeight: '900', textTransform: 'uppercase' },
    section: { width: '100%', gap: 16, alignItems: 'center' },
    sectionTitle: { fontSize: 12, fontWeight: '800', opacity: 0.5, letterSpacing: 2 },
    challengeBox: { padding: 24, borderRadius: 16, borderWidth: 1, width: '100%' },
    challengeText: { fontSize: 20, textAlign: 'center', lineHeight: 28, fontWeight: '600' },
    questionText: { fontSize: 18, textAlign: 'center', lineHeight: 26, marginBottom: 10 },
    answerContainer: { alignItems: 'center', width: '100%' },
    answerText: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
    button: { width: '100%', padding: 18, borderRadius: 12, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 2 },
    gameOverCard: { borderRadius: 24, padding: 32, alignItems: 'center', gap: 16, marginTop: 100 },
    gameOverTitle: { fontSize: 28, fontWeight: '700' },
    finalScore: { fontSize: 24, fontWeight: '600' },
    gameOverActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
