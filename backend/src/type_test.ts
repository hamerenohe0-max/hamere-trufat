
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './common/supabase/types';

const client = createClient<Database>('', '');

async function test() {
  // Check if 'events' table is recognized
  const { data: events, error } = await client.from('events').select('*');
  
  // Check insert type
  await client.from('events').insert({
    name: 'Test',
    start_date: '2024-01-01',
    location: 'Test',
    // Missing fields should trigger error if types are working, but 'never' means it rejects EVERYTHING
  });

  // Check update type
  await client.from('events').update({
    name: 'Updated'
  }).eq('id', '123');
}
