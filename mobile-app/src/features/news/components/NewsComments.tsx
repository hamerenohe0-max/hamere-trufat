import { memo, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NewsComment } from '../../../types/models';

interface Props {
  comments: NewsComment[];
  onSubmit: (body: string) => Promise<void>;
}

export const NewsComments = memo(({ comments, onSubmit }: Props) => {
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit() {
    if (!body.trim()) return;
    setIsSending(true);
    try {
      await onSubmit(body.trim());
      setBody('');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>Comments</Text>
      {comments.length === 0 ? (
        <Text style={styles.empty}>Be the first to comment.</Text>
      ) : (
        comments.map((item) => (
          <View key={item.id} style={styles.comment}>
            <Text style={styles.author}>{item.user?.name ?? 'Unknown User'}</Text>
            <Text style={styles.body}>{item.translatedBody ?? item.body}</Text>
          </View>
        ))
      )}

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Share your thoughts"
          style={styles.input}
          value={body}
          onChangeText={setBody}
          multiline
        />
        <TouchableOpacity
          style={[styles.button, (!body.trim() || isSending) && styles.buttonDisabled]}
          disabled={!body.trim() || isSending}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>{isSending ? 'Sending…' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = {
  wrapper: {
    marginTop: 16,
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  comment: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  author: {
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  body: {
    color: '#334155',
  },
  empty: {
    color: '#94a3b8',
    textAlign: 'center' as const,
    paddingVertical: 12,
  },
  inputRow: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 12,
    minHeight: 60,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center' as const,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600' as const,
  },
};


