'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('access_key') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect(`/login?error=${encodeURIComponent('Login: ' + error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/selecionar-residencia')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const password = formData.get('access_key') as string;
    const confirmPassword = formData.get('confirm_access_key') as string;

    const avatarFile = formData.get('avatar') as File | null;

    if (password !== confirmPassword) {
        redirect('/login?error=As senhas não coincidem.')
    }

    const data = {
        email: formData.get('email') as string,
        password: password,
        options: {
            data: {
                full_name: formData.get('name') as string,
            }
        }
    }

    const { data: authData, error } = await supabase.auth.signUp(data)

    if (error) {
        redirect(`/login?error=${encodeURIComponent('Erro ao criar conta: ' + error.message)}`)
    }

    if (avatarFile && avatarFile.size > 0 && authData.user) {
        const fileExt = avatarFile.name.split('.').pop() || 'jpg';
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${authData.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile);

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            await supabase
                .from('user_profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', authData.user.id);
        }
    }

    revalidatePath('/', 'layout')
    redirect('/selecionar-residencia')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function recoverPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const origin = (await headers()).get('origin')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/redefinir-senha`,
    })

    if (error) {
        redirect(`/recuperar-senha?error=${encodeURIComponent('Houve um erro: ' + error.message)}`)
    }

    redirect(`/recuperar-senha?message=${encodeURIComponent('Se as informações conferirem, você receberá um e-mail com as instruções em breve.')}`)
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (!password || password !== confirmPassword) {
        redirect('/redefinir-senha?error=As senhas não coincidem ou são inválidas.')
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        redirect(`/redefinir-senha?error=${encodeURIComponent('Erro ao atualizar a senha: ' + error.message)}`)
    }

    redirect('/login?message=Senha alterada com sucesso! Faça login.')
}
