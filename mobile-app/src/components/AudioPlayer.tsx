import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
    Animated,
    LayoutAnimation,
} from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { colors } from '../config/colors';

interface AudioPlayerProps {
    uri: string;
    title?: string;
    autoPlay?: boolean;
}

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export function AudioPlayer({ uri, title, autoPlay = false }: AudioPlayerProps) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [status, setStatus] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [volume, setVolume] = useState(1.0);
    const [isMuted, setIsMuted] = useState(false);
    const [rate, setRate] = useState(1.0);
    const [isLooping, setIsLooping] = useState(false);

    // Animation for expanding advanced controls
    const expandAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setupAudio();
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    const setupAudio = async () => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                staysActiveInBackground: true,
            });
        } catch (e) {
            console.error("Error setting audio mode", e);
        }
    };

    const loadSound = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: autoPlay, rate, volume, isLooping, isMuted },
                onPlaybackStatusUpdate
            );
            setSound(newSound);
        } catch (error) {
            console.error('Error loading sound', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onPlaybackStatusUpdate = (newStatus: any) => {
        setStatus(newStatus);
        if (newStatus.didJustFinish && !newStatus.isLooping) {
            // Handle completion if needed
        }
    };

    const handlePlayPause = async () => {
        if (!sound) {
            await loadSound();
            return;
        }

        if (status?.isPlaying) {
            await sound.pauseAsync();
        } else {
            await sound.playAsync();
        }
    };

    const handleSeek = async (value: number) => {
        if (sound && status?.isLoaded) {
            await sound.setPositionAsync(value);
        }
    };

    const handleVolumeChange = async (value: number) => {
        setVolume(value);
        if (sound) {
            await sound.setVolumeAsync(value);
        }
        if (value > 0 && isMuted) {
            setIsMuted(false);
            if (sound) await sound.setIsMutedAsync(false);
        }
    };

    const toggleMute = async () => {
        const newMute = !isMuted;
        setIsMuted(newMute);
        if (sound) {
            await sound.setIsMutedAsync(newMute);
        }
    };

    const changeRate = async (newRate: number) => {
        setRate(newRate);
        if (sound) {
            await sound.setRateAsync(newRate, true);
        }
    };

    const toggleLoop = async () => {
        const newLoop = !isLooping;
        setIsLooping(newLoop);
        if (sound) {
            await sound.setIsLoopingAsync(newLoop);
        }
    };

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
        Animated.timing(expandAnim, {
            toValue: isExpanded ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const formatTime = (millis: number | undefined) => {
        if (millis === undefined || millis === null) return '0:00';
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const position = status?.positionMillis || 0;
    const duration = status?.durationMillis || 0;
    const isPlaying = status?.isPlaying || false;

    return (
        <View style={[styles.container, isExpanded && styles.containerExpanded]}>
            {/* Main Header / Info */}
            <View style={styles.headerRow}>
                <View style={styles.infoContainer}>
                    {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
                    <Text style={styles.timeText}>
                        {formatTime(position)} / {formatTime(duration)}
                    </Text>
                </View>
                <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "options-outline"}
                        size={20}
                        color={colors.neutral.gray[500]}
                    />
                </TouchableOpacity>
            </View>

            {/* Main Controls Row */}
            <View style={styles.controlsRow}>
                <TouchableOpacity
                    onPress={() => handleSeek(Math.max(0, position - 10000))}
                    style={styles.secondaryControl}
                >
                    <Ionicons name="play-back" size={24} color={colors.primary.main} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handlePlayPause}
                    style={styles.playButton}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={32}
                            color="#fff"
                            style={!isPlaying && { marginLeft: 4 }}
                        />
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleSeek(Math.min(duration, position + 10000))}
                    style={styles.secondaryControl}
                >
                    <Ionicons name="play-forward" size={24} color={colors.primary.main} />
                </TouchableOpacity>
            </View>

            {/* Seek Bar */}
            <View style={styles.sliderContainer}>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration || 1}
                    value={position}
                    onSlidingComplete={handleSeek}
                    minimumTrackTintColor={colors.primary.main}
                    maximumTrackTintColor={colors.neutral.gray[300]}
                    thumbTintColor={colors.primary.main}
                />
            </View>

            {/* Advanced Controls (Expandable) */}
            {isExpanded && (
                <View style={styles.advancedContainer}>
                    <View style={styles.divider} />

                    {/* Volume Row */}
                    <View style={styles.advancedRow}>
                        <TouchableOpacity onPress={toggleMute}>
                            <Ionicons
                                name={isMuted || volume === 0 ? "volume-mute" : volume < 0.5 ? "volume-low" : "volume-high"}
                                size={20}
                                color={colors.neutral.gray[600]}
                            />
                        </TouchableOpacity>
                        <Slider
                            style={styles.volumeSlider}
                            minimumValue={0}
                            maximumValue={1}
                            value={volume}
                            onValueChange={handleVolumeChange}
                            minimumTrackTintColor={colors.primary.main}
                            maximumTrackTintColor={colors.neutral.gray[300]}
                            thumbTintColor={colors.primary.main}
                        />
                    </View>

                    {/* Speed & Loop Row */}
                    <View style={styles.advancedRow}>
                        <View style={styles.speedContainer}>
                            <Text style={styles.label}>Speed</Text>
                            <View style={styles.speedOptions}>
                                {SPEEDS.map((s) => (
                                    <TouchableOpacity
                                        key={s}
                                        onPress={() => changeRate(s)}
                                        style={[styles.speedBadge, rate === s && styles.speedBadgeActive]}
                                    >
                                        <Text style={[styles.speedText, rate === s && styles.speedTextActive]}>
                                            {s}x
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={toggleLoop}
                            style={[styles.loopButton, isLooping && styles.loopButtonActive]}
                        >
                            <Ionicons
                                name="repeat"
                                size={20}
                                color={isLooping ? "#fff" : colors.neutral.gray[600]}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginVertical: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    containerExpanded: {
        // Optional extra styling when expanded
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    infoContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.neutral.gray[800],
        marginBottom: 2,
    },
    timeText: {
        fontSize: 12,
        color: colors.neutral.gray[500],
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    expandButton: {
        padding: 4,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 8,
    },
    playButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    secondaryControl: {
        padding: 8,
    },
    sliderContainer: {
        width: '100%',
        height: 40,
        justifyContent: 'center',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    advancedContainer: {
        marginTop: 8,
        gap: 16,
    },
    divider: {
        height: 1,
        backgroundColor: colors.neutral.gray[100],
        width: '100%',
    },
    advancedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    volumeSlider: {
        flex: 1,
        height: 40,
    },
    speedContainer: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.neutral.gray[500],
        marginBottom: 4,
    },
    speedOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    speedBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: colors.neutral.gray[100],
    },
    speedBadgeActive: {
        backgroundColor: colors.primary.main,
    },
    speedText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.neutral.gray[600],
    },
    speedTextActive: {
        color: '#fff',
    },
    loopButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    loopButtonActive: {
        backgroundColor: colors.primary.main,
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
});
