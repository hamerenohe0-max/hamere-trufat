import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePreferencesStore } from '../../src/store/usePreferencesStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useTheme } from '../../src/components/ThemeProvider';
import { ThemedText } from '../../src/components/ThemedText';
import { colors as baseColors } from '../../src/config/colors';

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
  const { colors, fontScale: currentFontScale, isDark } = useTheme();

  // Theme-derived background colors
  const screenBg = isDark ? colors.background.primary : colors.background.secondary;
  const cardBg = isDark ? colors.background.secondary : colors.background.primary;
  const textColor = isDark ? colors.text.primary : colors.text.primary; // Should match theme
  const descriptionColor = isDark ? colors.text.tertiary : colors.text.secondary;

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screenBg }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: screenBg }]}>
        <ThemedText style={styles.heading}>Settings</ThemedText>

        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>

          <View style={[styles.settingRow, { borderBottomColor: colors.border.light }]}>
            <ThemedText style={styles.settingLabel}>Theme</ThemedText>
            <View style={styles.themeButtons}>
              {themes.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.themeButton,
                    { borderColor: colors.border.medium, backgroundColor: colors.background.tertiary },
                    theme === t.value && { backgroundColor: colors.secondary.main, borderColor: colors.secondary.main },
                  ]}
                  onPress={() => setTheme(t.value as any)}
                >
                  <ThemedText
                    style={[
                      styles.themeButtonText,
                      theme === t.value && { color: '#ffffff' },
                    ]}
                  >
                    {t.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <ThemedText style={styles.settingLabel} type="primary">Font Size</ThemedText>
            <View style={styles.fontScaleRow}>
              <TouchableOpacity
                style={[styles.fontButton, { backgroundColor: colors.secondary.main + '20' }]}
                onPress={() => setFontScale(Math.max(0.8, fontScale - 0.1))}
              >
                <Text style={[styles.fontButtonText, { color: colors.secondary.main }]}>-</Text>
              </TouchableOpacity>
              <ThemedText style={styles.fontScaleValue}>
                {(fontScale * 100).toFixed(0)}%
              </ThemedText>
              <TouchableOpacity
                style={[styles.fontButton, { backgroundColor: colors.secondary.main + '20' }]}
                onPress={() => setFontScale(Math.min(1.5, fontScale + 0.1))}
              >
                <Text style={[styles.fontButtonText, { color: colors.secondary.main }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Language */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <ThemedText style={styles.sectionTitle}>Language</ThemedText>
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
                  language === lang.code && [styles.languageTextActive, { color: colors.secondary.main }],
                ]}
              >
                {lang.label}
              </Text>
              {language === lang.code && (
                <Text style={[styles.checkmark, { color: colors.secondary.main }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>

          <View style={[styles.settingRow, { borderBottomColor: colors.border.light }]}>
            <View style={styles.settingLabelContainer}>
              <ThemedText style={styles.settingLabel}>Push Notifications</ThemedText>
              <ThemedText style={styles.settingDescription} type="tertiary">
                Receive push notifications on your device
              </ThemedText>
            </View>
            <Switch
              value={notificationPrefs.push}
              onValueChange={(value) => setNotifications({ push: value })}
              trackColor={{ false: colors.border.medium, true: colors.secondary.light }}
              thumbColor={notificationPrefs.push ? colors.secondary.main : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: colors.border.light }]}>
            <View style={styles.settingLabelContainer}>
              <ThemedText style={styles.settingLabel}>Email Notifications</ThemedText>
              <ThemedText style={styles.settingDescription} type="tertiary">
                Receive updates via email
              </ThemedText>
            </View>
            <Switch
              value={notificationPrefs.email}
              onValueChange={(value) => setNotifications({ email: value })}
              trackColor={{ false: colors.border.medium, true: colors.secondary.light }}
              thumbColor={notificationPrefs.email ? colors.secondary.main : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: colors.border.light }]}>
            <View style={styles.settingLabelContainer}>
              <ThemedText style={styles.settingLabel}>Reminders</ThemedText>
              <ThemedText style={styles.settingDescription} type="tertiary">
                Daily readings and event reminders
              </ThemedText>
            </View>
            <Switch
              value={notificationPrefs.reminders}
              onValueChange={(value) => setNotifications({ reminders: value })}
              trackColor={{ false: colors.border.medium, true: colors.secondary.light }}
              thumbColor={notificationPrefs.reminders ? colors.secondary.main : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Offline Mode */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <ThemedText style={styles.sectionTitle}>Offline Mode</ThemedText>

          <View style={[styles.settingRow, { borderBottomColor: colors.border.light }]}>
            <View style={styles.settingLabelContainer}>
              <ThemedText style={styles.settingLabel}>Auto Sync</ThemedText>
              <ThemedText style={styles.settingDescription} type="tertiary">
                Automatically sync when online
              </ThemedText>
            </View>
            <Switch
              value={offlineMode.autoSync}
              onValueChange={(value) => setOfflineMode({ autoSync: value })}
              trackColor={{ false: colors.border.medium, true: colors.secondary.light }}
              thumbColor={offlineMode.autoSync ? colors.secondary.main : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingLabelContainer}>
              <ThemedText style={styles.settingLabel}>WiFi Only</ThemedText>
              <ThemedText style={styles.settingDescription} type="tertiary">
                Only sync when connected to WiFi
              </ThemedText>
            </View>
            <Switch
              value={offlineMode.wifiOnly}
              onValueChange={(value) => setOfflineMode({ wifiOnly: value })}
              trackColor={{ false: colors.border.medium, true: colors.secondary.light }}
              thumbColor={offlineMode.wifiOnly ? colors.secondary.main : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Account */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>
          <TouchableOpacity
            style={[styles.accountButton, { backgroundColor: colors.secondary.main + '10' }]}
            onPress={() => router.push('/(protected)/profile')}
          >
            <ThemedText style={[styles.accountButtonText, { color: colors.secondary.main }]}>Edit Profile</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.accountButton, styles.logoutButton, { backgroundColor: '#fee2e2' }]}
            onPress={() => {
              clearSession();
              router.replace('/(auth)/login');
            }}
          >
            <ThemedText style={[styles.accountButtonText, styles.logoutButtonText]}>
              Logout
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingTop: 16,
    gap: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  section: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  },
  settingDescription: {
    fontSize: 12,
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
    // Moved inline to use dynamic theme
  },
  themeButtonText: {
    fontSize: 14,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  fontScaleValue: {
    fontSize: 16,
    fontWeight: '600',
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
    // Moved inline
  },
  languageText: {
    fontSize: 16,
    color: '#1f2937',
  },
  languageTextActive: {
    // Moved inline
  },
  checkmark: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  accountButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  accountButtonText: {
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

