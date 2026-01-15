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
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';

export default function BibleCharadesScreen() {
    const { colors: themeColors, isDark } = useTheme();
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
        <View style={[styles.container, { backgroundColor: themeColors.primary.main }]}>
            <View style={styles.header}>
                <ThemedText style={styles.title}>Bible Charades</ThemedText>
                <ThemedText style={[styles.subtitle, { color: isDark ? themeColors.primary.light : themeColors.primary.lighter }]}>Act it out! Others must guess.</ThemedText>
            </View>

            <View style={[styles.card, { backgroundColor: themeColors.background.secondary }]}>
                {showPrompt ? (
                    <View style={styles.promptContainer}>
                        <ThemedText style={[styles.category, { color: themeColors.primary.main }]}>{BIBLE_CHARADES[currentIdx].category}</ThemedText>
                        <ThemedText style={styles.promptText}>{BIBLE_CHARADES[currentIdx].title}</ThemedText>
                        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary.main }]} onPress={nextPrompt}>
                            <ThemedText style={styles.buttonText}>NEXT PROMPT</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.revealBtn} onPress={() => setShowPrompt(true)}>
                        <ThemedText style={[styles.revealText, { color: themeColors.primary.main }]}>TAP TO REVEAL</ThemedText>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
                <ThemedText style={[styles.closeBtnText, { color: isDark ? themeColors.primary.light : themeColors.primary.lighter }]}>BACK TO GAMES</ThemedText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', padding: 24 },
    header: { marginTop: 60, alignItems: 'center' },
    title: { fontSize: 32, fontWeight: '900', color: '#fff' },
    subtitle: { fontSize: 16, marginTop: 8 },
    card: {
        width: '100%', height: 400,
        borderRadius: 30, marginTop: 60, justifyContent: 'center',
        alignItems: 'center', padding: 30, elevation: 15
    },
    promptContainer: { alignItems: 'center', width: '100%', gap: 20 },
    category: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
    promptText: { fontSize: 36, fontWeight: '900', textAlign: 'center' },
    revealBtn: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    revealText: { fontSize: 24, fontWeight: '800' },
    button: { width: '100%', padding: 20, borderRadius: 16, alignItems: 'center', marginTop: 30 },
    buttonText: { color: '#fff', fontWeight: '800' },
    closeBtn: { marginTop: 'auto', marginBottom: 40 },
    closeBtnText: { fontWeight: '700' }
});
