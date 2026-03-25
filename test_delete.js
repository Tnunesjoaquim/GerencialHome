const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://wwtigjrmfaffvwqzxent.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dGlnanJtZmFmZnZ3cXp4ZW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE1MDY4MSwiZXhwIjoyMDg3NzI2NjgxfQ.7kx2aWu7iIuPHB9y2pnVqp-yst-UV4KdYNqmsKR7eFA'; // SERVICE ROLE
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
  const { data, error } = await supabase.from('inventory_items').select('*').limit(2);
  console.log('Items available:', data.length);
  if (data.length > 0) {
    const item = data[0];
    console.log('Attempting to delete item:', item.name, item.id);
    const { error: delErr } = await supabase.from('inventory_items').delete().eq('id', item.id);
    console.log('Delete result:', delErr);
  }
}
testDelete();
