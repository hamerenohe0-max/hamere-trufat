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

const GRID_SIZE = 4; // 4x4 Bingo
const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 80) / GRID_SIZE;

export default function FaithBingoScreen() {
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
        <View style={styles.container}>
            <Text style={styles.title}>Faith Bingo</Text>
            <Text style={styles.subtitle}>Mark 4 in a row to win!</Text>

            <View style={styles.grid}>
                {board.map((tile, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.tile, tile.marked && styles.tileMarked]}
                        onPress={() => toggleTile(i)}
                    >
                        <Text style={[styles.tileText, tile.marked && styles.tileTextMarked]}>
                            {tile.text}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {gameOver && (
                <View style={styles.winContainer}>
                    <Text style={styles.winText}>BINGO! 🎉</Text>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.button} onPress={generateBoard}>
                            <Text style={styles.buttonText}>NEW CARD</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={() => router.back()}>
                            <Text style={styles.buttonTextOutline}>GAMES</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {!gameOver && (
                <TouchableOpacity style={styles.resetBtn} onPress={generateBoard}>
                    <Text style={styles.resetBtnText}>Refresh Card</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f8fafc', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: '800', color: colors.primary.main, marginTop: 40 },
    subtitle: { fontSize: 16, color: '#64748b', marginBottom: 30 },
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
        backgroundColor: '#fff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        padding: 4,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    tileMarked: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.dark,
    },
    tileText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#334155',
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    tileTextMarked: {
        color: '#fff',
    },
    winContainer: { position: 'absolute', top: '40%', backgroundColor: 'rgba(255,255,255,0.95)', padding: 40, borderRadius: 30, alignItems: 'center', elevation: 10, borderWeight: 2, borderColor: colors.primary.main },
    winText: { fontSize: 48, fontWeight: '900', color: colors.primary.main, marginBottom: 20 },
    actions: { gap: 12, width: 200 },
    button: { backgroundColor: colors.primary.main, padding: 16, borderRadius: 12, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: '800' },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary.main },
    buttonTextOutline: { color: colors.primary.main, fontWeight: '800' },
    resetBtn: { marginTop: 40 },
    resetBtnText: { color: '#94a3b8', fontWeight: '600' }
});
