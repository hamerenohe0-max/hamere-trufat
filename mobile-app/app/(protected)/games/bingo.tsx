import { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../../src/features/games/state/useGameStore';
import { FAITH_BINGO_TILES } from '../../../src/features/games/data/games_data';
import * as Haptics from 'expo-haptics';
import { colors } from '../../../src/config/colors';
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';

const GRID_SIZE = 4; // 4x4 Bingo
const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 80) / GRID_SIZE;

export default function FaithBingoScreen() {
    const { colors: themeColors, isDark } = useTheme();
    const router = useRouter();
    const addScore = useGameStore((state) => state.addScore);
    const [board, setBoard] = useState<Array<{ text: string; marked: boolean }>>([]);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        generateBoard();
    }, []);

    function generateBoard() {
        const shuffled = [...FAITH_BINGO_TILES].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, GRID_SIZE * GRID_SIZE);
        setBoard(selected.map(text => ({ text, marked: false })));
        setGameOver(false);
    }

    function toggleTile(index: number) {
        if (gameOver) return;

        const newBoard = [...board];
        newBoard[index].marked = !newBoard[index].marked;
        setBoard(newBoard);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (checkBingo(newBoard)) {
            setGameOver(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            addScore({
                id: `bingo-${Date.now()}`,
                game: 'bingo',
                score: 100,
                createdAt: new Date().toISOString(),
            });
        }
    }

    function checkBingo(currentBoard: typeof board) {
        // Check rows
        for (let i = 0; i < GRID_SIZE; i++) {
            if (currentBoard.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE).every(t => t.marked)) return true;
        }
        // Check columns
        for (let i = 0; i < GRID_SIZE; i++) {
            const col = [currentBoard[i], currentBoard[i + GRID_SIZE], currentBoard[i + 2 * GRID_SIZE], currentBoard[i + 3 * GRID_SIZE]];
            if (col.every(t => t.marked)) return true;
        }
        // Check diagonals
        const d1 = [currentBoard[0], currentBoard[5], currentBoard[10], currentBoard[15]];
        const d2 = [currentBoard[3], currentBoard[6], currentBoard[9], currentBoard[12]];
        if (d1.every(t => t && t.marked)) return true;
        if (d2.every(t => t && t.marked)) return true;

        return false;
    }

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background.primary }]}>
            <ThemedText style={[styles.title, { color: themeColors.primary.main }]}>Faith Bingo</ThemedText>
            <ThemedText style={styles.subtitle}>Mark 4 in a row to win!</ThemedText>

            <View style={styles.grid}>
                {board.map((tile, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[
                            styles.tile,
                            { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: themeColors.border.subtle },
                            tile.marked && { backgroundColor: themeColors.primary.main, borderColor: themeColors.primary.dark }
                        ]}
                        onPress={() => toggleTile(i)}
                    >
                        <ThemedText style={[
                            styles.tileText,
                            tile.marked && styles.tileTextMarked
                        ]}>
                            {tile.text}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            {gameOver && (
                <View style={[styles.winContainer, { backgroundColor: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)', borderColor: themeColors.primary.main }]}>
                    <ThemedText style={[styles.winText, { color: themeColors.primary.main }]}>BINGO! 🎉</ThemedText>
                    <View style={styles.actions}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary.main }]} onPress={generateBoard}>
                            <ThemedText style={styles.buttonText}>NEW CARD</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buttonOutline, { borderColor: themeColors.primary.main }]} onPress={() => router.back()}>
                            <ThemedText style={[styles.buttonText, { color: themeColors.primary.main }]}>GAMES</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {!gameOver && (
                <TouchableOpacity style={styles.resetBtn} onPress={generateBoard}>
                    <ThemedText style={styles.resetBtnText}>Refresh Card</ThemedText>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: '800', marginTop: 40 },
    subtitle: { fontSize: 16, opacity: 0.6, marginBottom: 30 },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: width - 40,
        justifyContent: 'center',
        gap: 8,
    },
    tile: {
        width: TILE_SIZE,
        height: TILE_SIZE,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        padding: 4,
        borderWidth: 1,
    },
    tileText: {
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    tileTextMarked: {
        color: '#fff',
    },
    winContainer: { position: 'absolute', top: '40%', padding: 40, borderRadius: 30, alignItems: 'center', elevation: 10, borderWidth: 2 },
    winText: { fontSize: 48, fontWeight: '900', marginBottom: 20 },
    actions: { gap: 12, width: 200 },
    button: { padding: 16, borderRadius: 12, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: '800' },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 2 },
    resetBtn: { marginTop: 40 },
    resetBtnText: { opacity: 0.5, fontWeight: '600' }
});
