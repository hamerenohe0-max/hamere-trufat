import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/colors';

interface AudioPlayerProps {
    uri: string;
    title?: string;
}

export function AudioPlayer({ uri, title }: AudioPlayerProps) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [duration, setDuration] = useState<number | null>(null);
    const [position, setPosition] = useState<number | null>(null);

    useEffect(() => {
        return () => {
            sound?.unloadAsync();
        };
    }, [sound]);

    const handlePlayPause = async () => {
        try {
            if (sound) {
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                }
            } else {
                setIsLoading(true);
                console.log('Loading Sound', uri);

                // Configure audio mode for playback in silent mode (iOS)
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: true,
                });

                const { sound: newSound, status } = await Audio.Sound.createAsync(
                    { uri },
                    { shouldPlay: true },
                    onPlaybackStatusUpdate
                );

                setSound(newSound);
                setIsPlaying(true);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            setIsLoading(false);
        }
    };

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setDuration(status.durationMillis);
            setPosition(status.positionMillis);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
                sound?.setPositionAsync(0);
            }
        } else if (status.error) {
            console.error(`Player Error: ${status.error}`);
        }
    };

    const formatTime = (millis: number | null) => {
        if (millis === null) return '--:--';
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={24}
                        color="#fff"
                        style={{ marginLeft: isPlaying ? 0 : 2 }} // Optical adjustment
                    />
                )}
            </TouchableOpacity>

            <View style={styles.info}>
                {title && <Text style={styles.title}>{title}</Text>}
                <View style={styles.progressContainer}>
                    <Text style={styles.timeText}>{formatTime(position)}</Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${duration ? (position || 0) / duration * 100 : 0}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 12,
        gap: 12,
        marginVertical: 8,
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    info: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#cbd5e1',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary.main,
    },
    timeText: {
        fontSize: 12,
        color: '#64748b',
        fontVariant: ['tabular-nums'],
    },
});
