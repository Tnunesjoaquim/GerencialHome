import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

async function test() {
    const testEmail = `test_staff_${Date.now()}@example.com`
    console.log('Testing auth profile creation for', testEmail)
    
    // 1. Create User (This triggers process_residence_invites which previously failed)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: 'password123',
        email_confirm: true,
        user_metadata: { full_name: 'Test Staff' }
    });

    if (authError) {
        console.error('Failed to create auth user:', authError.message)
        return
    }
    
    console.log('User created:', authData.user.id)
    console.log('SUCCESS! Auth user created without trigger errors.')
}

test()
