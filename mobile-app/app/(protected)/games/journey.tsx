import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../../src/features/games/state/useGameStore';
import { JOURNEY_THROUGH_BIBLE } from '../../../src/features/games/data/games_data';
import * as Haptics from 'expo-haptics';
import { colors } from '../../../src/config/colors';

const { width } = Dimensions.get('window');

export default function BibleJourneyScreen() {
    const router = useRouter();
    const addScore = useGameStore((state) => state.addScore);
    const [currentStep, setCurrentStep] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    function handleMove() {
        if (gameOver) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (currentStep < JOURNEY_THROUGH_BIBLE.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setGameOver(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            addScore({
                id: `journey-${Date.now()}`,
                game: 'journey',
                score: 200,
                createdAt: new Date().toISOString(),
            });
        }
    }

    function reset() {
        setCurrentStep(0);
        setGameOver(false);
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Bible Journey</Text>
                <Text style={styles.subtitle}>Navigate through Scripture</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.map}>
                    {JOURNEY_THROUGH_BIBLE.map((step, i) => {
                        const isActive = i === currentStep;
                        const isCompleted = i < currentStep;

                        return (
                            <View key={step.id} style={styles.nodeWrapper}>
                                <View style={[styles.line, i === JOURNEY_THROUGH_BIBLE.length - 1 && { height: 0 }, isCompleted && styles.lineCompleted]} />
                                <View style={[
                                    styles.node,
                                    isActive && styles.nodeActive,
                                    isCompleted && styles.nodeCompleted
                                ]}>
                                    <Text style={[styles.nodeText, (isActive || isCompleted) && styles.nodeTextActive]}>
                                        {isCompleted ? '✓' : i + 1}
                                    </Text>
                                </View>
                                <View style={styles.nodeInfo}>
                                    <Text style={[styles.nodeTitle, isActive && styles.nodeTitleActive]}>{step.title}</Text>
                                    {isActive && <Text style={styles.nodeDesc}>{step.description}</Text>}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                {gameOver ? (
                    <View style={styles.winActions}>
                        <Text style={styles.winText}>Journey Complete! 🏁</Text>
                        <TouchableOpacity style={styles.button} onPress={reset}>
                            <Text style={styles.buttonText}>START NEW JOURNEY</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.button} onPress={handleMove}>
                        <Text style={styles.buttonText}>STEP FORWARD</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 30, paddingTop: 60, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: '800', color: colors.primary.main },
    subtitle: { fontSize: 16, color: '#64748b' },
    scrollContent: { paddingBottom: 150 },
    map: { paddingHorizontal: 40 },
    nodeWrapper: { flexDirection: 'row', height: 100 },
    line: { width: 4, height: 100, backgroundColor: '#e2e8f0', position: 'absolute', left: 18, top: 20 },
    lineCompleted: { backgroundColor: colors.primary.main },
    node: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', borderWidth: 4, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
    nodeActive: { borderColor: colors.primary.main, backgroundColor: colors.primary.main, transform: [{ scale: 1.2 }] },
    nodeCompleted: { borderColor: colors.primary.main, backgroundColor: colors.primary.main },
    nodeText: { fontSize: 14, fontWeight: '800', color: '#94a3b8' },
    nodeTextActive: { color: '#fff' },
    nodeInfo: { marginLeft: 20, flex: 1 },
    nodeTitle: { fontSize: 18, fontWeight: '700', color: '#64748b' },
    nodeTitleActive: { color: '#0f172a' },
    nodeDesc: { fontSize: 14, color: colors.primary.main, marginTop: 4, fontWeight: '500' },
    footer: { position: 'absolute', bottom: 0, width: '100%', padding: 24, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
    button: { backgroundColor: colors.primary.main, padding: 20, borderRadius: 16, alignItems: 'center', elevation: 4 },
    buttonText: { color: '#fff', fontWeight: '800', letterSpacing: 1 },
    winActions: { alignItems: 'center', gap: 12 },
    winText: { fontSize: 22, fontWeight: '800', color: colors.primary.main, marginBottom: 8 }
});
