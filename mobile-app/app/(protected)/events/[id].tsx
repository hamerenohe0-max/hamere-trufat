import { useLocalSearchParams, Link } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Image,
  Share,
} from 'react-native';
import { useEventDetail, useEventReminder } from '../../../src/features/events/hooks/useEvents';
import * as Calendar from 'expo-calendar';
import { formatEventDate } from '../../../src/utils/dateFormat';
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';

export default function EventDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const eventQuery = useEventDetail(params.id);
  const reminderMutation = useEventReminder(params.id);
  const { colors, fontScale, isDark } = useTheme();

  if (eventQuery.isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!eventQuery.data) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background.primary }]}>
        <ThemedText style={styles.empty}>Event not found.</ThemedText>
      </View>
    );
  }

  const event = eventQuery.data;

  async function handleAddToCalendar() {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        alert('Calendar permission is required to add events.');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT,
      );
      if (calendars.length === 0) {
        alert('No calendars available.');
        return;
      }

      await Calendar.createEventAsync(calendars[0].id, {
        title: event.name,
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : new Date(event.startDate),
        location: event.location,
        notes: event.description,
      });

      alert('Event added to calendar!');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      alert('Failed to add event to calendar.');
    }
  }

  async function handleOpenMap() {
    if (!event.coordinates) {
      // Fallback to opening location in maps app
      const url = `https://maps.google.com/?q=${encodeURIComponent(event.location)}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
      return;
    }

    const coords = event.coordinates as any;
    const url = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  }

  async function handleShare() {
    try {
      const message = `${event.name}\n\n${new Date(event.startDate).toLocaleString()}\n${event.location}\n\n${event.description || ''}`;
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ThemedText style={styles.heading}>{event.name}</ThemedText>

      <View style={[styles.infoCard, { backgroundColor: colors.background.secondary }]}>
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.text.tertiary }]}>📅 Date & Time</ThemedText>
          <ThemedText style={styles.infoValue}>
            {formatEventDate(event.startDate)}
          </ThemedText>
          {event.endDate && (
            <ThemedText style={styles.infoValue}>
              Until: {new Date(event.endDate).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </ThemedText>
          )}
        </View>

        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.text.tertiary }]}>📍 Location</ThemedText>
          <TouchableOpacity onPress={handleOpenMap}>
            <ThemedText style={[styles.infoValue, styles.link, { color: colors.primary.main }]}>{event.location}</ThemedText>
          </TouchableOpacity>
        </View>

        {event.description && (
          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: colors.text.tertiary }]}>Description</ThemedText>
            <ThemedText style={styles.infoValue}>{event.description}</ThemedText>
          </View>
        )}
      </View>

      {event.flyerImages && event.flyerImages.length > 0 && (
        <View style={styles.flyerSection}>
          <ThemedText style={styles.sectionTitle}>Event Flyers</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {event.flyerImages.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.flyerImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary.main }]}
          onPress={handleAddToCalendar}
        >
          <ThemedText style={styles.actionText}>📅 Add to Calendar</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButtonOutline, { borderColor: colors.primary.main }]}
          onPress={() =>
            reminderMutation.mutate(!event.reminderEnabled)
          }
        >
          <ThemedText style={[styles.actionOutlineText, { color: colors.primary.main }]}>
            {event.reminderEnabled ? '🔔 Reminder On' : '🔕 Set Reminder'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.shareButton, { backgroundColor: colors.background.secondary }]} onPress={handleShare}>
        <ThemedText style={styles.shareText}>Share Event</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  empty: {
    color: '#94a3b8',
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 8,
  },
  infoCard: {
    borderRadius: 20,
    padding: 20,
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(157, 101, 49, 0.1)',
  },
  infoRow: {
    gap: 6,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  link: {
    textDecorationLine: 'none',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  flyerSection: {
    marginTop: 8,
  },
  flyerImage: {
    width: 220,
    height: 330,
    borderRadius: 16,
    marginRight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  actionButtonOutline: {
    flex: 1,
    borderWidth: 2,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionOutlineText: {
    fontWeight: '700',
    fontSize: 15,
  },
  shareButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  shareText: {
    fontWeight: '700',
    fontSize: 15,
  },
});

