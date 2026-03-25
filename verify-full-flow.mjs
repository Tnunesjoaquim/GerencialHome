import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

async function testFull() {
    const testEmail = `test_staff_full_${Date.now()}@example.com`
    console.log('Testing full flow for:', testEmail)
    
    // 1. Get a valid residence ID or create one
    const { data: residences } = await supabaseAdmin.from('residences').select('id').limit(1)
    if (!residences || residences.length === 0) {
        console.error('No residence found to test with')
        return
    }
    const residenceId = residences[0].id
    console.log('Using residence ID:', residenceId)

    // 2. Create User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: 'password123',
        email_confirm: true,
        user_metadata: { full_name: 'Test Full Flow' }
    });

    if (authError) {
        console.error('Failed to create auth user:', authError.message)
        return
    }
    
    const newUserId = authData.user.id
    console.log('Auth user created successfully:', newUserId)

    // 3. Insert into residence_members
    const { error: memberError } = await supabaseAdmin.from('residence_members')
        .insert([{ residence_id: residenceId, user_id: newUserId, role: 'Staff' }]);

    if (memberError) {
        console.error('Error inserting into residence_members:', memberError.message)
        return
    }

    console.log('User successfully added to residence_members!')
    console.log('SUCCESS! The entire user creation flow works perfectly.')
}

testFull()
