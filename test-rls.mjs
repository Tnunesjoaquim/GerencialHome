import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wwtigjrmfaffvwqzxent.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dGlnanJtZmFmZnZ3cXp4ZW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNTA2ODEsImV4cCI6MjA4NzcyNjY4MX0.skNCgvEreZ4w7CWjCG4l7p_6Yu0ygQ2Rqth_RjxzC80'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { data: residences, error } = await supabase
        .from('residences')
        .select('*')

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Residences found with anon key:', residences.length)
    }
}
test()
