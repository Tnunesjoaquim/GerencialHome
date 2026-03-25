import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wwtigjrmfaffvwqzxent.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dGlnanJtZmFmZnZ3cXp4ZW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNTA2ODEsImV4cCI6MjA4NzcyNjY4MX0.skNCgvEreZ4w7CWjCG4l7p_6Yu0ygQ2Rqth_RjxzC80'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log('Testing residences table...')
    const { data: residences, error: residencesError } = await supabase
        .from('residences')
        .select('*')
        .limit(1)

    if (residencesError) {
        console.error('Error accessing residences table:', residencesError.message)
    } else {
        console.log('Successfully accessed residences table!')
    }

    console.log('Testing photos bucket...')
    const { data: buckets, error: bucketError } = await supabase
        .storage
        .getBucket('photos')

    if (bucketError) {
        console.error('Error accessing photos bucket:', bucketError.message)
    } else {
        console.log('Successfully accessed photos bucket!')
    }
}

test()
