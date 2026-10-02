import { createClient } from '@supabase/supabase-js';

const url = 'https://hjuawsyqgrascremrwwc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdWF3c3lxZ3Jhc2NyZW1yd3djIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg5MzU4NiwiZXhwIjoyMTA2NDY5NTg2fQ.hjcu1k_7j782tXamj-1QjoDIO40swr70IFzglcUMzpo';

const supabase = createClient(url, key);

async function test() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('quotes').select('count', { count: 'exact', head: true });
  if (error) {
    console.error('Quotes table check error:', error.message);
  } else {
    console.log('Quotes table exists! Data count:', data);
  }
}

test();
