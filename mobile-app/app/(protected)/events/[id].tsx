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
} from 'react-native';
import { useEventDetail, useEventReminder } from '../../../src/features/events/hooks/useEvents';
import * as Calendar from 'expo-calendar';
import * as Sharing from 'expo-sharing';

export default function EventDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const eventQuery = useEventDetail(params.id);
  const reminderMutation = useEventReminder(params.id);

  if (eventQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!eventQuery.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Event not found.</Text>
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

    const url = `https://maps.google.com/?q=${event.coordinates.lat},${event.coordinates.lng}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  }

  async function handleShare() {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        alert('Sharing is not available on this device.');
        return;
      }

      const message = `${event.name}\n\n${new Date(event.startDate).toLocaleString()}\n${event.location}\n\n${event.description || ''}`;
      await Sharing.shareAsync({
        message,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{event.name}</Text>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📅 Date & Time</Text>
          <Text style={styles.infoValue}>
            {new Date(event.startDate).toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {event.endDate && (
            <Text style={styles.infoValue}>
              Until: {new Date(event.endDate).toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 Location</Text>
          <TouchableOpacity onPress={handleOpenMap}>
            <Text style={[styles.infoValue, styles.link]}>{event.location}</Text>
          </TouchableOpacity>
        </View>

        {event.description && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Description</Text>
            <Text style={styles.infoValue}>{event.description}</Text>
          </View>
        )}
      </View>

      {event.flyerImages && event.flyerImages.length > 0 && (
        <View style={styles.flyerSection}>
          <Text style={styles.sectionTitle}>Event Flyers</Text>
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
          style={styles.actionButton}
          onPress={handleAddToCalendar}
        >
          <Text style={styles.actionText}>📅 Add to Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonOutline}
          onPress={() =>
            reminderMutation.mutate(!event.reminderEnabled)
          }
        >
          <Text style={styles.actionOutlineText}>
            {event.reminderEnabled ? '🔔 Reminder On' : '🔕 Set Reminder'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareText}>Share Event</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
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
    fontWeight: '700',
    color: '#0f172a',
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    color: '#0f172a',
  },
  link: {
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  flyerSection: {
    gap: 8,
  },
  flyerImage: {
    width: 200,
    height: 300,
    borderRadius: 12,
    marginRight: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
  actionButtonOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionOutlineText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareText: {
    color: '#475569',
    fontWeight: '600',
  },
});

