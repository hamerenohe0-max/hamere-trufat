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

export default function PrayerMatchScreen() {
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
            <View style={styles.container}>
                <View style={styles.gameOverCard}>
                    <Text style={styles.gameOverTitle}>Match Master! 🙏</Text>
                    <Text style={styles.finalScore}>Score: {score}</Text>
                    <View style={styles.gameOverActions}>
                        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                            <Text style={styles.buttonText}>Finish</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Prayer Match-Up</Text>
            <Text style={styles.subtitle}>Link the prayer to its purpose</Text>

            <View style={styles.columns}>
                <View style={styles.column}>
                    <Text style={styles.colTitle}>PRAYER</Text>
                    {prayers.map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[
                                styles.item,
                                selectedPrayer === p && styles.selected,
                                matches[p] && styles.matched
                            ]}
                            onPress={() => handleSelectPrayer(p)}
                            disabled={!!matches[p]}
                        >
                            <Text style={[styles.itemText, (selectedPrayer === p || matches[p]) && styles.textActive]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.column}>
                    <Text style={styles.colTitle}>PURPOSE</Text>
                    {purposes.map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[
                                styles.item,
                                selectedPurpose === p && styles.selected,
                                Object.values(matches).includes(p) && styles.matched
                            ]}
                            onPress={() => handleSelectPurpose(p)}
                            disabled={Object.values(matches).includes(p)}
                        >
                            <Text style={[styles.itemText, (selectedPurpose === p || Object.values(matches).includes(p)) && styles.textActive]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
    title: { fontSize: 24, fontWeight: '800', color: colors.primary.main, textAlign: 'center', marginTop: 40 },
    subtitle: { textAlign: 'center', color: '#64748b', marginBottom: 30 },
    columns: { flexDirection: 'row', gap: 15 },
    column: { flex: 1, gap: 10 },
    colTitle: { fontSize: 12, fontWeight: '800', color: '#94a3b8', textAlign: 'center' },
    item: { padding: 15, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', minHeight: 80, justifyContent: 'center' },
    selected: { borderColor: colors.primary.main, backgroundColor: colors.primary.lighter + '20' },
    matched: { borderColor: '#10b981', backgroundColor: '#d1fae5' },
    itemText: { fontSize: 13, fontWeight: '600', color: '#334155', textAlign: 'center' },
    textActive: { color: colors.primary.main },
    gameOverCard: { backgroundColor: '#fff', padding: 32, borderRadius: 24, alignItems: 'center', marginTop: 100 },
    gameOverTitle: { fontSize: 28, fontWeight: '800' },
    finalScore: { fontSize: 22, color: colors.primary.main, marginVertical: 10 },
    button: { backgroundColor: colors.primary.main, paddingHorizontal: 40, paddingVertical: 15, borderRadius: 12 },
    buttonText: { color: '#fff', fontWeight: '800' },
    gameOverActions: { marginTop: 20 }
});
