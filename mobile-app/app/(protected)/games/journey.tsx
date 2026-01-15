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
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';

const { width } = Dimensions.get('window');

export default function BibleJourneyScreen() {
    const { colors: themeColors, isDark } = useTheme();
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
        <View style={[styles.container, { backgroundColor: themeColors.background.primary }]}>
            <View style={styles.header}>
                <ThemedText style={[styles.title, { color: themeColors.primary.main }]}>Bible Journey</ThemedText>
                <ThemedText style={styles.subtitle}>Navigate through Scripture</ThemedText>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.map}>
                    {JOURNEY_THROUGH_BIBLE.map((step, i) => {
                        const isActive = i === currentStep;
                        const isCompleted = i < currentStep;

                        return (
                            <View key={step.id} style={styles.nodeWrapper}>
                                <View style={[styles.line, i === JOURNEY_THROUGH_BIBLE.length - 1 && { height: 0 }, isCompleted && { backgroundColor: themeColors.primary.main }, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]} />
                                <View style={[
                                    styles.node,
                                    { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0' },
                                    isActive && { borderColor: themeColors.primary.main, backgroundColor: themeColors.primary.main, transform: [{ scale: 1.2 }] },
                                    isCompleted && { borderColor: themeColors.primary.main, backgroundColor: themeColors.primary.main }
                                ]}>
                                    <ThemedText style={[styles.nodeText, (isActive || isCompleted) && styles.nodeTextActive]}>
                                        {isCompleted ? '✓' : i + 1}
                                    </ThemedText>
                                </View>
                                <View style={styles.nodeInfo}>
                                    <ThemedText style={[styles.nodeTitle, isActive && { color: themeColors.text.primary, fontWeight: '800' }]}>{step.title}</ThemedText>
                                    {isActive && <ThemedText style={[styles.nodeDesc, { color: themeColors.primary.main }]}>{step.description}</ThemedText>}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)', borderTopColor: themeColors.border.subtle }]}>
                {gameOver ? (
                    <View style={styles.winActions}>
                        <ThemedText style={[styles.winText, { color: themeColors.primary.main }]}>Journey Complete! 🏁</ThemedText>
                        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary.main }]} onPress={reset}>
                            <ThemedText style={styles.buttonText}>START NEW JOURNEY</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary.main }]} onPress={handleMove}>
                        <ThemedText style={styles.buttonText}>STEP FORWARD</ThemedText>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 30, paddingTop: 60, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: '800' },
    subtitle: { fontSize: 16, opacity: 0.6 },
    scrollContent: { paddingBottom: 150 },
    map: { paddingHorizontal: 40 },
    nodeWrapper: { flexDirection: 'row', height: 100 },
    line: { width: 4, height: 100, position: 'absolute', left: 18, top: 20 },
    node: { width: 40, height: 40, borderRadius: 20, borderWidth: 4, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
    nodeText: { fontSize: 14, fontWeight: '800', opacity: 0.5 },
    nodeTextActive: { color: '#fff', opacity: 1 },
    nodeInfo: { marginLeft: 20, flex: 1 },
    nodeTitle: { fontSize: 18, fontWeight: '700', opacity: 0.6 },
    nodeDesc: { fontSize: 14, marginTop: 4, fontWeight: '500' },
    footer: { position: 'absolute', bottom: 0, width: '100%', padding: 24, borderTopWidth: 1 },
    button: { padding: 20, borderRadius: 16, alignItems: 'center', elevation: 4 },
    buttonText: { color: '#fff', fontWeight: '800', letterSpacing: 1 },
    winActions: { alignItems: 'center', gap: 12 },
    winText: { fontSize: 22, fontWeight: '800', marginBottom: 8 }
});
