import { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BIBLE_CHARADES } from '../../../src/features/games/data/games_data';
import * as Haptics from 'expo-haptics';
import { colors } from '../../../src/config/colors';

export default function BibleCharadesScreen() {
    const router = useRouter();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [showPrompt, setShowPrompt] = useState(false);

    function nextPrompt() {
        const nextIdx = Math.floor(Math.random() * BIBLE_CHARADES.length);
        setCurrentIdx(nextIdx);
        setShowPrompt(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Bible Charades</Text>
                <Text style={styles.subtitle}>Act it out! Others must guess.</Text>
            </View>

            <View style={styles.card}>
                {showPrompt ? (
                    <View style={styles.promptContainer}>
                        <Text style={styles.category}>{BIBLE_CHARADES[currentIdx].category}</Text>
                        <Text style={styles.promptText}>{BIBLE_CHARADES[currentIdx].title}</Text>
                        <TouchableOpacity style={styles.button} onPress={nextPrompt}>
                            <Text style={styles.buttonText}>NEXT PROMPT</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.revealBtn} onPress={() => setShowPrompt(true)}>
                        <Text style={styles.revealText}>TAP TO REVEAL</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
                <Text style={styles.closeBtnText}>BACK TO GAMES</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primary.main, alignItems: 'center', padding: 24 },
    header: { marginTop: 60, alignItems: 'center' },
    title: { fontSize: 32, fontWeight: '900', color: '#fff' },
    subtitle: { fontSize: 16, color: colors.primary.lighter, marginTop: 8 },
    card: {
        width: '100%', height: 400, backgroundColor: '#fff',
        borderRadius: 30, marginTop: 60, justifyContent: 'center',
        alignItems: 'center', padding: 30, elevation: 15
    },
    promptContainer: { alignItems: 'center', width: '100%', gap: 20 },
    category: { fontSize: 14, fontWeight: '800', color: colors.primary.main, letterSpacing: 2 },
    promptText: { fontSize: 36, fontWeight: '900', color: '#111827', textAlign: 'center' },
    revealBtn: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    revealText: { fontSize: 24, fontWeight: '800', color: colors.primary.main },
    button: { width: '100%', backgroundColor: colors.primary.main, padding: 20, borderRadius: 16, alignItems: 'center', marginTop: 30 },
    buttonText: { color: '#fff', fontWeight: '800' },
    closeBtn: { marginTop: 'auto', marginBottom: 40 },
    closeBtnText: { color: colors.primary.lighter, fontWeight: '700' }
});
