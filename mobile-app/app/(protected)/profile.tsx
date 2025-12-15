import { useState, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../../src/services/auth';
import {
  useAuthStore,
  selectIsAuthenticated,
} from '../../src/store/useAuthStore';

interface ProfileForm {
  name: string;
  bio: string;
  language: string;
  region: string;
  phone: string;
  avatarUrl: string;
}

export default function ProfileScreen() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isGuest = useAuthStore((state) => state.guest);
  const updateUser = useAuthStore((state) => state.updateUser);

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.profile,
    enabled: isAuthenticated,
  });

  const [form, setForm] = useState<ProfileForm>({
    name: '',
    bio: '',
    language: '',
    region: '',
    phone: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (profileQuery.data) {
      const profile = profileQuery.data.profile ?? {};
      setForm({
        name: profileQuery.data.name,
        bio: profile.bio ?? '',
        language: profile.language ?? '',
        region: profile.region ?? '',
        phone: profile.phone ?? '',
        avatarUrl: profile.avatarUrl ?? '',
      });
    }
  }, [profileQuery.data]);

  const mutation = useMutation({
    mutationFn: () =>
      authApi.updateProfile({
        name: form.name,
        bio: form.bio,
        language: form.language,
        region: form.region,
        phone: form.phone,
        avatarUrl: form.avatarUrl,
      }),
    onSuccess: (user) => updateUser(user),
  });

  const dirty = useMemo(() => {
    if (!profileQuery.data) return false;
    const profile = profileQuery.data.profile ?? {};
    return (
      form.name !== profileQuery.data.name ||
      form.bio !== (profile.bio ?? '') ||
      form.language !== (profile.language ?? '') ||
      form.region !== (profile.region ?? '') ||
      form.phone !== (profile.phone ?? '') ||
      form.avatarUrl !== (profile.avatarUrl ?? '')
    );
  }, [form, profileQuery.data]);

  if (isGuest) {
    return (
      <View style={styles.center}>
        <Text style={styles.guestTitle}>Guest mode</Text>
        <Text style={styles.guestText}>
          Sign in with a full account to edit your profile details.
        </Text>
      </View>
    );
  }

  if (profileQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>
        Keep your contact preferences up to date for mission updates.
      </Text>

      {renderInput('Full Name', form.name, (value) =>
        setForm((prev) => ({ ...prev, name: value })),
      )}
      {renderInput(
        'Bio',
        form.bio,
        (value) => setForm((prev) => ({ ...prev, bio: value })),
        true,
      )}
      {renderInput('Language', form.language, (value) =>
        setForm((prev) => ({ ...prev, language: value })),
      )}
      {renderInput('Region', form.region, (value) =>
        setForm((prev) => ({ ...prev, region: value })),
      )}
      {renderInput(
        'Phone',
        form.phone,
        (value) => setForm((prev) => ({ ...prev, phone: value })),
        false,
        'phone-pad',
      )}
      {renderInput('Avatar URL', form.avatarUrl, (value) =>
        setForm((prev) => ({ ...prev, avatarUrl: value })),
      )}

      {mutation.isError && (
        <Text style={styles.errorText}>
          {(mutation.error as Error).message ?? 'Update failed'}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          (!dirty || mutation.isPending) && styles.buttonDisabled,
        ]}
        disabled={!dirty || mutation.isPending}
        onPress={() => mutation.mutate()}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function renderInput(
  label: string,
  value: string,
  onChange: (value: string) => void,
  multiline = false,
  keyboardType: 'default' | 'phone-pad' = 'default',
) {
  return (
    <View style={styles.inputGroup} key={label}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={[styles.input, multiline && styles.textarea]}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#64748b',
    marginBottom: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontWeight: '600',
    color: '#0f172a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  textarea: {
    minHeight: 80,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  guestText: {
    color: '#475569',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#dc2626',
  },
});


