import { useState, useEffect } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../../src/features/games/state/useGameStore';
import { PRAYER_MATCHUP } from '../../../src/features/games/data/games_data';
import * as Haptics from 'expo-haptics';
import { colors } from '../../../src/config/colors';
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';

export default function PrayerMatchScreen() {
    const { colors: themeColors, isDark } = useTheme();
    const router = useRouter();
    const addScore = useGameStore((state) => state.addScore);
    const [prayers, setPrayers] = useState<string[]>([]);
    const [purposes, setPurposes] = useState<string[]>([]);
    const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);
    const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
    const [matches, setMatches] = useState<Record<string, string>>({});
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        setPrayers([...PRAYER_MATCHUP].map(p => p.prayer).sort(() => 0.5 - Math.random()));
        setPurposes([...PRAYER_MATCHUP].map(p => p.purpose).sort(() => 0.5 - Math.random()));
    }, []);

    function handleSelectPrayer(p: string) {
        if (matches[p]) return;
        setSelectedPrayer(p);
        checkMatch(p, selectedPurpose);
        Haptics.selectionAsync();
    }

    function handleSelectPurpose(p: string) {
        if (Object.values(matches).includes(p)) return;
        setSelectedPurpose(p);
        checkMatch(selectedPrayer, p);
        Haptics.selectionAsync();
    }

    function checkMatch(prayer: string | null, purpose: string | null) {
        if (!prayer || !purpose) return;

        const correctMatch = PRAYER_MATCHUP.find(m => m.prayer === prayer && m.purpose === purpose);
        if (correctMatch) {
            const newMatches = { ...matches, [prayer]: purpose };
            setMatches(newMatches);
            setScore(score + 25);
            setSelectedPrayer(null);
            setSelectedPurpose(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            if (Object.keys(newMatches).length === PRAYER_MATCHUP.length) {
                setGameOver(true);
                addScore({
                    id: `matchup-${Date.now()}`,
                    game: 'matchup',
                    score: score + 25,
                    createdAt: new Date().toISOString(),
                });
            }
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setSelectedPrayer(null);
            setSelectedPurpose(null);
        }
    }

    if (gameOver) {
        return (
            <View style={[styles.container, { backgroundColor: themeColors.background.primary }]}>
                <View style={[styles.gameOverCard, { backgroundColor: themeColors.background.secondary }]}>
                    <ThemedText style={styles.gameOverTitle}>Match Master! 🙏</ThemedText>
                    <ThemedText style={[styles.finalScore, { color: themeColors.primary.main }]}>Score: {score}</ThemedText>
                    <View style={styles.gameOverActions}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary.main }]} onPress={() => router.back()}>
                            <ThemedText style={styles.buttonText}>Finish</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.background.primary }]}>
            <ThemedText style={[styles.title, { color: themeColors.primary.main }]}>Prayer Match-Up</ThemedText>
            <ThemedText style={styles.subtitle}>Link the prayer to its purpose</ThemedText>

            <View style={styles.columns}>
                <View style={styles.column}>
                    <ThemedText style={styles.colTitle}>PRAYER</ThemedText>
                    {prayers.map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[
                                styles.item,
                                { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: themeColors.border.subtle },
                                selectedPrayer === p && { borderColor: themeColors.primary.main, backgroundColor: themeColors.primary.main + '20' },
                                matches[p] && { borderColor: '#10b981', backgroundColor: isDark ? '#064e3b' : '#d1fae5' }
                            ]}
                            onPress={() => handleSelectPrayer(p)}
                            disabled={!!matches[p]}
                        >
                            <ThemedText style={[styles.itemText, (selectedPrayer === p || matches[p]) && { color: themeColors.primary.main }]}>{p}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.column}>
                    <ThemedText style={styles.colTitle}>PURPOSE</ThemedText>
                    {purposes.map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[
                                styles.item,
                                { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: themeColors.border.subtle },
                                selectedPurpose === p && { borderColor: themeColors.primary.main, backgroundColor: themeColors.primary.main + '20' },
                                Object.values(matches).includes(p) && { borderColor: '#10b981', backgroundColor: isDark ? '#064e3b' : '#d1fae5' }
                            ]}
                            onPress={() => handleSelectPurpose(p)}
                            disabled={Object.values(matches).includes(p)}
                        >
                            <ThemedText style={[styles.itemText, (selectedPurpose === p || Object.values(matches).includes(p)) && { color: themeColors.primary.main }]}>{p}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginTop: 40 },
    subtitle: { textAlign: 'center', opacity: 0.6, marginBottom: 30 },
    columns: { flexDirection: 'row', gap: 15 },
    column: { flex: 1, gap: 10 },
    colTitle: { fontSize: 12, fontWeight: '800', opacity: 0.5, textAlign: 'center' },
    item: { padding: 15, borderRadius: 12, borderWidth: 1, minHeight: 80, justifyContent: 'center' },
    itemText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
    gameOverCard: { padding: 32, borderRadius: 24, alignItems: 'center', marginTop: 100 },
    gameOverTitle: { fontSize: 28, fontWeight: '800' },
    finalScore: { fontSize: 22, marginVertical: 10 },
    button: { paddingHorizontal: 40, paddingVertical: 15, borderRadius: 12 },
    buttonText: { color: '#fff', fontWeight: '800' },
    gameOverActions: { marginTop: 20 }
});
