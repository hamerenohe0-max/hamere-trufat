import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../src/services/auth';
import { buildDeviceContext } from '../../src/services/device';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function RegisterScreen() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const device = await buildDeviceContext();
      return authApi.register({
        ...form,
        requireOtp: false,
        device,
      });
    },
    onSuccess: (response) => {
      if (response.otpRequired) {
        router.replace({
          pathname: '/(auth)/otp',
          params: { email: form.email },
        });
        return;
      }
      if (response.user) {
        setSession({ user: response.user, tokens: response.tokens });
        router.replace('/(protected)/home');
      } else {
        router.replace('/(auth)/login');
      }
    },
  });

  const disabled =
    !form.name || !form.email || !form.password || mutation.isPending;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>
          Register to sync assignments, submit field data, and manage updates.
        </Text>

        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={form.name}
          onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
        />
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={form.email}
          onChangeText={(value) =>
            setForm((prev) => ({ ...prev, email: value }))
          }
        />
        <TextInput
          placeholder="Phone (optional)"
          keyboardType="phone-pad"
          style={styles.input}
          value={form.phone}
          onChangeText={(value) =>
            setForm((prev) => ({ ...prev, phone: value }))
          }
        />
        <TextInput
          placeholder="Password (min 8 chars)"
          secureTextEntry
          style={styles.input}
          value={form.password}
          onChangeText={(value) =>
            setForm((prev) => ({ ...prev, password: value }))
          }
        />

        {mutation.isError && (
          <Text style={styles.errorText}>
            {(mutation.error as Error).message ?? 'Registration failed'}
          </Text>
        )}

        <TouchableOpacity
          disabled={disabled}
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text>Already have an account?</Text>
        <Link href="/(auth)/login" style={styles.link}>
          Sign in
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 18,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 10,
    padding: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    alignItems: 'center',
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
  },
});


