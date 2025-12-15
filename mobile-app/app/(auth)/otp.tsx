import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { authApi } from '../../src/services/auth';

export default function OtpScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();
  const [email, setEmail] = useState(params.email ?? '');
  const [code, setCode] = useState('');

  const mutation = useMutation({
    mutationFn: () => authApi.verifyOtp({ email, code }),
    onSuccess: () => {
      router.replace('/(auth)/login');
    },
  });

  const disabled = !email || code.length !== 6;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to your email to activate your account.
        </Text>

        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="123456"
          keyboardType="number-pad"
          style={styles.input}
          value={code}
          onChangeText={setCode}
          maxLength={6}
        />

        {mutation.isError && (
          <Text style={styles.errorText}>
            {(mutation.error as Error).message ?? 'Invalid OTP'}
          </Text>
        )}

        <TouchableOpacity
          disabled={disabled || mutation.isPending}
          onPress={() => mutation.mutate()}
          style={[
            styles.button,
            (disabled || mutation.isPending) && styles.buttonDisabled,
          ]}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 18,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 10,
    padding: 12,
  },
  button: {
    backgroundColor: '#16a34a',
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
  errorText: {
    color: '#dc2626',
  },
});


