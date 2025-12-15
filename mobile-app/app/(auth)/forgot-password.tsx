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
import { authApi } from '../../src/services/auth';
import { useRouter } from 'expo-router';

type Stage = 'request' | 'reset';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const requestMutation = useMutation({
    mutationFn: () => authApi.forgotPassword({ email }),
    onSuccess: () => setStage('reset'),
  });

  const resetMutation = useMutation({
    mutationFn: () => authApi.resetPassword({ email, code, newPassword }),
    onSuccess: () => router.replace('/(auth)/login'),
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {stage === 'request' ? 'Forgot password' : 'Enter reset code'}
        </Text>
        <Text style={styles.subtitle}>
          {stage === 'request'
            ? 'We will send you a one-time code to reset your password.'
            : 'Enter the code you received and choose a new password.'}
        </Text>

        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        {stage === 'request' ? (
          <>
            {requestMutation.isError && (
              <Text style={styles.errorText}>
                {(requestMutation.error as Error).message ??
                  'Unable to send code'}
              </Text>
            )}
            <TouchableOpacity
              disabled={!email || requestMutation.isPending}
              style={[
                styles.button,
                (!email || requestMutation.isPending) && styles.buttonDisabled,
              ]}
              onPress={() => requestMutation.mutate()}
            >
              {requestMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send reset code</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              placeholder="6-digit code"
              keyboardType="number-pad"
              style={styles.input}
              maxLength={6}
              value={code}
              onChangeText={setCode}
            />
            <TextInput
              placeholder="New password"
              secureTextEntry
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            {resetMutation.isError && (
              <Text style={styles.errorText}>
                {(resetMutation.error as Error).message ??
                  'Unable to reset password'}
              </Text>
            )}
            <TouchableOpacity
              disabled={
                !code || code.length !== 6 || newPassword.length < 8 || resetMutation.isPending
              }
              style={[
                styles.button,
                (resetMutation.isPending || code.length !== 6) &&
                  styles.buttonDisabled,
              ]}
              onPress={() => resetMutation.mutate()}
            >
              {resetMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Reset password</Text>
              )}
            </TouchableOpacity>
          </>
        )}
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
  errorText: {
    color: '#dc2626',
  },
});


