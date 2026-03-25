'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createStaffAccount(formData: FormData) {
    try {
        const fullName = formData.get('full_name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const role = formData.get('role') as string;
        const residenceId = formData.get('residence_id') as string;
        const residenceIdsStr = formData.get('residence_ids') as string;
        const avatarFile = formData.get('avatar') as File | null;

        let residenceIds: string[] = [];
        if (residenceIdsStr) {
            try { residenceIds = JSON.parse(residenceIdsStr); } catch (e) {}
        } else if (residenceId) {
            residenceIds = [residenceId];
        }

        if (!fullName || !email || !password || !role || residenceIds.length === 0) {
            return { error: 'Preencha todos os campos obrigatórios.' };
        }

        // 1. Create the user in Supabase Auth bypassing normal sign-up checks
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto confirm so they can log in immediately
            user_metadata: {
                full_name: fullName,
            }
        });

        if (authError) {
            return { error: authError.message };
        }

        const newUserId = authData.user.id;

        // The database trigger "on_auth_user_created" will have already created the profile
        // Now we upload the avatar via Admin if one was provided
        let avatarUrl = null;

        if (avatarFile && avatarFile.size > 0) {
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${newUserId}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from('avatars')
                .upload(fileName, avatarFile);

            if (uploadError) {
                console.error('Error uploading avatar:', uploadError);
            } else {
                const { data: publicUrlData } = supabaseAdmin.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                avatarUrl = publicUrlData.publicUrl;

                // Update the profile with the avatar url
                await supabaseAdmin.from('user_profiles')
                    .update({ avatar_url: avatarUrl })
                    .eq('id', newUserId);
            }
        }

        // Insert the user into the residences directly
        const inserts = residenceIds.map(rId => ({
            residence_id: rId,
            user_id: newUserId,
            role: role
        }));

        const { error: memberError } = await supabaseAdmin.from('residence_members')
            .insert(inserts);

        if (memberError) {
            // In case they are already added, though unlikely here
            if (memberError.code !== '23505') {
                return { error: 'Usuário criado, mas erro ao associar residência: ' + memberError.message };
            }
        }

        return { success: true };

    } catch (err: any) {
        return { error: err.message || 'Erro interno no servidor' };
    }
}

export async function removeUserFromResidence(userId: string, residenceId: string) {
    try {
        const { error } = await supabaseAdmin.from('residence_members')
            .delete()
            .match({ residence_id: residenceId, user_id: userId });
            
        if (error) {
            return { error: error.message };
        }
        return { success: true };
    } catch (err: any) {
        return { error: err.message || 'Erro ao remover usuário.' };
    }
}
