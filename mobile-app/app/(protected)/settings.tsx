import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { usePreferencesStore } from '../../src/store/usePreferencesStore';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function SettingsScreen() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const {
    theme,
    language,
    fontScale,
    notificationPrefs,
    offlineMode,
    setTheme,
    setLanguage,
    setFontScale,
    setNotifications,
    setOfflineMode,
  } = usePreferencesStore();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'am', label: 'አማርኛ (Amharic)' },
    { code: 'ti', label: 'ትግርኛ (Tigrinya)' },
  ];

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Settings</Text>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Theme</Text>
          <View style={styles.themeButtons}>
            {themes.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.themeButton,
                  theme === t.value && styles.themeButtonActive,
                ]}
                onPress={() => setTheme(t.value as any)}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    theme === t.value && styles.themeButtonTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Font Size</Text>
          <View style={styles.fontScaleRow}>
            <TouchableOpacity
              style={styles.fontButton}
              onPress={() => setFontScale(Math.max(0.8, fontScale - 0.1))}
            >
              <Text style={styles.fontButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.fontScaleValue}>
              {(fontScale * 100).toFixed(0)}%
            </Text>
            <TouchableOpacity
              style={styles.fontButton}
              onPress={() => setFontScale(Math.min(1.5, fontScale + 0.1))}
            >
              <Text style={styles.fontButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Language */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageOption,
              language === lang.code && styles.languageOptionActive,
            ]}
            onPress={() => setLanguage(lang.code)}
          >
            <Text
              style={[
                styles.languageText,
                language === lang.code && styles.languageTextActive,
              ]}
            >
              {lang.label}
            </Text>
            {language === lang.code && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive push notifications on your device
            </Text>
          </View>
          <Switch
            value={notificationPrefs.push}
            onValueChange={(value) => setNotifications({ push: value })}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive updates via email
            </Text>
          </View>
          <Switch
            value={notificationPrefs.email}
            onValueChange={(value) => setNotifications({ email: value })}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={styles.settingLabel}>Reminders</Text>
            <Text style={styles.settingDescription}>
              Daily readings and event reminders
            </Text>
          </View>
          <Switch
            value={notificationPrefs.reminders}
            onValueChange={(value) => setNotifications({ reminders: value })}
          />
        </View>
      </View>

      {/* Offline Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offline Mode</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={styles.settingLabel}>Auto Sync</Text>
            <Text style={styles.settingDescription}>
              Automatically sync when online
            </Text>
          </View>
          <Switch
            value={offlineMode.autoSync}
            onValueChange={(value) => setOfflineMode({ autoSync: value })}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Text style={styles.settingLabel}>WiFi Only</Text>
            <Text style={styles.settingDescription}>
              Only sync when connected to WiFi
            </Text>
          </View>
          <Switch
            value={offlineMode.wifiOnly}
            onValueChange={(value) => setOfflineMode({ wifiOnly: value })}
          />
        </View>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={styles.accountButton}
          onPress={() => router.push('/(protected)/profile')}
        >
          <Text style={styles.accountButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.accountButton, styles.logoutButton]}
          onPress={() => {
            clearSession();
            router.replace('/(auth)/login');
          }}
        >
          <Text style={[styles.accountButtonText, styles.logoutButtonText]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
    backgroundColor: '#f8fafc',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  settingLabelContainer: {
    flex: 1,
    gap: 4,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    backgroundColor: '#f8fafc',
  },
  themeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  themeButtonText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  themeButtonTextActive: {
    color: '#fff',
  },
  fontScaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fontButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
  },
  fontScaleValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    minWidth: 50,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
  },
  languageOptionActive: {
    backgroundColor: '#eef2ff',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  languageText: {
    fontSize: 16,
    color: '#1f2937',
  },
  languageTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  accountButton: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  accountButtonText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
  },
  logoutButtonText: {
    color: '#dc2626',
  },
});

