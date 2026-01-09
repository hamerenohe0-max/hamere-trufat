import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { colors } from '../config/colors';

interface AudioPlayerProps {
    uri: string;
    title?: string;
}

export function AudioPlayer({ uri, title }: AudioPlayerProps) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [duration, setDuration] = useState<number>(0);
    const [position, setPosition] = useState<number>(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [isLooping, setIsLooping] = useState(false);

    useEffect(() => {
        return () => {
            sound?.unloadAsync();
        };
    }, [sound]);

    const loadSound = async () => {
        setIsLoading(true);
        try {
            console.log('Loading Sound', uri);
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
        } catch (error) {
            console.error('Error loading audio:', error);
            setIsLoading(false);
        }
    };

    const handlePlayPause = async () => {
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
        } else {
            await loadSound();
        }
    };

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setDuration(status.durationMillis);
            if (!isSeeking) {
                setPosition(status.positionMillis);
            }
            setIsPlaying(status.isPlaying);
            setIsLooping(status.isLooping);
            if (status.didJustFinish && !status.isLooping) {
                setIsPlaying(false);
                setPosition(0);
                sound?.setPositionAsync(0);
            }
        } else if (status.error) {
            console.error(`Player Error: ${status.error}`);
        }
    };

    const handleSeek = async (value: number) => {
        if (sound) {
            await sound.setPositionAsync(value);
            setPosition(value);
        }
        setIsSeeking(false);
    };

    const handleSkip = async (seconds: number) => {
        if (sound) {
            const newPosition = position + (seconds * 1000);
            await sound.setPositionAsync(Math.max(0, Math.min(newPosition, duration)));
        }
    };

    const toggleSpeed = async () => {
        if (sound) {
            const speeds = [1.0, 1.25, 1.5, 2.0];
            const currentIndex = speeds.indexOf(playbackSpeed);
            const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
            await sound.setRateAsync(nextSpeed, true);
            setPlaybackSpeed(nextSpeed);
        }
    };

    const toggleLoop = async () => {
        if (sound) {
            const newLoop = !isLooping;
            await sound.setIsLoopingAsync(newLoop);
            setIsLooping(newLoop);
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}

            <View style={styles.controlsRow}>
                {/* Play/Pause Button */}
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
                            style={{ marginLeft: isPlaying ? 0 : 2 }}
                        />
                    )}
                </TouchableOpacity>

                {/* Progress Slider */}
                <View style={styles.sliderContainer}>
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={0}
                        maximumValue={duration}
                        value={position}
                        minimumTrackTintColor={colors.primary.main}
                        maximumTrackTintColor="#cbd5e1"
                        thumbTintColor={colors.primary.main}
                        onSlidingStart={() => setIsSeeking(true)}
                        onSlidingComplete={handleSeek}
                        onValueChange={(val) => setPosition(val)}
                        disabled={!sound}
                    />
                    <View style={styles.timeRow}>
                        <Text style={styles.timeText}>{formatTime(position)}</Text>
                        <Text style={styles.timeText}>{formatTime(duration)}</Text>
                    </View>
                </View>
            </View>

            {/* Sub Controls: Skip & Speed */}
            <View style={styles.subControls}>
                <TouchableOpacity onPress={() => handleSkip(-10)} disabled={!sound} style={styles.iconBtn}>
                    <Ionicons name="arrow-undo-outline" size={22} color={colors.primary.main} />
                    <Text style={styles.iconBtnText}>-10s</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleSpeed} disabled={!sound} style={styles.speedBtn}>
                    <Text style={styles.speedText}>{playbackSpeed}x</Text>
                </TouchableOpacity>

                {/* Repeat Button */}
                <TouchableOpacity onPress={toggleLoop} disabled={!sound} style={[styles.iconBtn, isLooping && styles.activeBtn]}>
                    <Ionicons name="repeat" size={22} color={isLooping ? colors.primary.main : '#94a3b8'} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleSkip(10)} disabled={!sound} style={styles.iconBtn}>
                    <Text style={styles.iconBtnText}>+10s</Text>
                    <Ionicons name="arrow-redo-outline" size={22} color={colors.primary.main} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        gap: 12,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 4,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
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
    sliderContainer: {
        flex: 1,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        marginTop: -8, // Pull time closer to slider
    },
    timeText: {
        fontSize: 12,
        color: '#64748b',
        fontVariant: ['tabular-nums'],
    },
    subControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    iconBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 6,
        borderRadius: 8,
    },
    activeBtn: {
        backgroundColor: '#e2e8f0',
    },
    iconBtnText: {
        fontSize: 12,
        color: colors.primary.main,
        fontWeight: '500',
    },
    speedBtn: {
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    speedText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },
});
