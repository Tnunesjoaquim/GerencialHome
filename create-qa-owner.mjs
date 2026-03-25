import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

async function createQAOwner() {
    const email = 'qa_owner@example.com'
    const password = 'QApassword123!'
    
    // Delete existing if any
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers()
    const user = existing?.users.find(u => u.email === email)
    if (user) {
        await supabaseAdmin.auth.admin.deleteUser(user.id)
    }

    // Create User
    const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: 'QA Owner Account' }
    });

    if (error) {
        console.error('Failed to create QA owner:', error.message)
        return
    }
    
    const newUserId = authData.user.id
    console.log('QA Owner created. ID:', newUserId)

    // Verify user profile exists
    await new Promise(res => setTimeout(res, 2000)) // Wait for trigger
    
    // Create a residence for them
    const { data: resData, error: resError } = await supabaseAdmin.from('residences')
        .insert([{ owner_id: newUserId, name: 'Residência QA End-to-End' }])
        .select()
        .single();
        
    if (resError) {
        console.error('Failed to create residence:', resError.message)
    } else {
        console.log('Residence created for QA Owner.')
    }
}

createQAOwner()
