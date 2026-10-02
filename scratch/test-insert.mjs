import { createClient } from '@supabase/supabase-js';

const url = 'https://hjuawsyqgrascremrwwc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdWF3c3lxZ3Jhc2NyZW1yd3djIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg5MzU4NiwiZXhwIjoyMTA2NDY5NTg2fQ.hjcu1k_7j782tXamj-1QjoDIO40swr70IFzglcUMzpo';

const supabase = createClient(url, key);

async function testInsert() {
  const { data, error } = await supabase.from('quotes').insert({
    empresa: 'Empresa Test',
    nombre: 'Contacto Test',
    telefono: '+56900000000',
    correo: 'test@charles.cl',
    personalizacion: 'Bordado',
    mensaje: 'Prueba de conexión Supabase'
  }).select('id').single();

  if (error) {
    console.log('RESULT_ERROR:', error.message);
  } else {
    console.log('RESULT_SUCCESS: Quote inserted with ID:', data.id);
    // clean up test record
    await supabase.from('quotes').delete().eq('id', data.id);
  }
}

testInsert();
