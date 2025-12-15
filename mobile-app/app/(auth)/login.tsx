import { useState } from 'react';
import {
  ActivityIndicator,
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

export default function LoginScreen() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const startGuestSession = useAuthStore((state) => state.startGuestSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const device = await buildDeviceContext();
      return authApi.login({ email, password, device });
    },
    onSuccess: (response) => {
      if (response.otpRequired) {
        router.replace({
          pathname: '/(auth)/otp',
          params: { email },
        });
        return;
      }
      setSession({ user: response.user, tokens: response.tokens });
      router.replace('/(protected)/home');
    },
  });

  const guestMutation = useMutation({
    mutationFn: authApi.guest,
    onSuccess: (response) => {
      startGuestSession(response.tokens);
      router.replace('/(protected)/home');
    },
  });

  const disabled = !email || !password || mutation.isPending;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>
        Sign in with your Hamere Trufat credentials or continue as guest.
      </Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        {mutation.isError && (
          <Text style={styles.errorText}>
            {(mutation.error as Error).message ?? 'Login failed'}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          disabled={disabled}
          onPress={() => {
            clearSession();
            mutation.mutate();
          }}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => guestMutation.mutate()}
        >
          {guestMutation.isPending ? (
            <ActivityIndicator color="#2563eb" />
          ) : (
            <Text style={styles.secondaryText}>Continue as Guest</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.links}>
        <Link href="/(auth)/forgot-password" style={styles.link}>
          Forgot password?
        </Link>
        <Link href="/(auth)/register" style={styles.link}>
          Need an account? Register
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
    gap: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
    marginBottom: 12,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5f5',
  },
  secondaryText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  links: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 12,
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
  },
});


