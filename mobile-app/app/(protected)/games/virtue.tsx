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

export default function VirtueQuestScreen() {
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
            <View style={styles.container}>
                <View style={styles.gameOverCard}>
                    <Text style={styles.gameOverTitle}>Virtuous! 🤝</Text>
                    <Text style={styles.finalScore}>Total Points: {score}</Text>
                    <View style={styles.gameOverActions}>
                        <TouchableOpacity style={styles.button} onPress={() => { setCurrentIdx(0); setScore(0); setGameOver(false); setShowChallenge(true); setShowAnswer(false); }}>
                            <Text style={styles.buttonText}>Restart Quest</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={() => router.back()}>
                            <Text style={styles.buttonTextOutline}>Games</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.score}>Virtue Points: {score}</Text>
                <Text style={styles.progress}>Quest {currentIdx + 1} of {VIRTUE_QUEST.length}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.virtueName}>{quest.virtue}</Text>

                {showChallenge ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>CHALLENGE</Text>
                        <View style={styles.challengeBox}>
                            <Text style={styles.challengeText}>"{quest.challenge}"</Text>
                        </View>
                        <TouchableOpacity style={styles.button} onPress={handleChallengeDone}>
                            <Text style={styles.buttonText}>I HAVE DONE THIS</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>REFLECTION QUESTION</Text>
                        <Text style={styles.questionText}>{quest.question}</Text>

                        {!showAnswer ? (
                            <TouchableOpacity style={styles.button} onPress={handleComplete}>
                                <Text style={styles.buttonText}>REVEAL ANSWER</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.answerContainer}>
                                <Text style={styles.answerText}>{quest.answer}</Text>
                                <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={nextQuest}>
                                    <Text style={styles.buttonText}>NEXT VIRTUE</Text>
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
    container: { flex: 1, padding: 24, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    score: { fontSize: 18, fontWeight: '700', color: '#8b5cf6' },
    progress: { fontSize: 14, color: '#64748b' },
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 4, gap: 24, alignItems: 'center' },
    virtueName: { fontSize: 32, fontWeight: '900', color: '#8b5cf6', textTransform: 'uppercase' },
    section: { width: '100%', gap: 16, alignItems: 'center' },
    sectionTitle: { fontSize: 12, fontWeight: '800', color: '#94a3b8', letterSpacing: 2 },
    challengeBox: { padding: 24, backgroundColor: '#f5f3ff', borderRadius: 16, borderWidth: 1, borderColor: '#ddd6fe', width: '100%' },
    challengeText: { fontSize: 20, color: '#4c1d95', textAlign: 'center', lineHeight: 28, fontWeight: '600' },
    questionText: { fontSize: 18, color: '#1e293b', textAlign: 'center', lineHeight: 26, marginBottom: 10 },
    answerContainer: { alignItems: 'center', width: '100%' },
    answerText: { fontSize: 22, fontWeight: '800', color: '#059669', textAlign: 'center' },
    button: { width: '100%', backgroundColor: '#8b5cf6', padding: 18, borderRadius: 12, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#8b5cf6' },
    buttonTextOutline: { color: '#8b5cf6', fontWeight: '800' },
    gameOverCard: { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', gap: 16, marginTop: 100 },
    gameOverTitle: { fontSize: 28, fontWeight: '700' },
    finalScore: { fontSize: 24, fontWeight: '600', color: '#8b5cf6' },
    gameOverActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
