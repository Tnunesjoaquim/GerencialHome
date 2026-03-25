'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function selectResidence(residenceId: string, residenceName: string) {
    const cookieStore = await cookies()
    // Storing JSON to avoid extra DB query just to show the name
    cookieStore.set('selected_residence', JSON.stringify({ id: residenceId, name: residenceName }), { path: '/' })

    redirect('/dashboard')
}

export async function createResidence(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const name = formData.get('residenceName') as string
    const address = formData.get('address') as string
    const number = formData.get('number') as string
    const photo = formData.get('photo') as File | null

    if (!name || name.trim() === '') return

    let photo_url = null

    // Upload photo if provided
    if (photo && photo.size > 0) {
        const fileExt = photo.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(filePath, photo)

        if (!uploadError) {
            const { data } = supabase.storage.from('photos').getPublicUrl(filePath)
            photo_url = data.publicUrl
        } else {
            console.error('Photo upload failed:', uploadError)
        }
    }

    // Insert new residence
    const { data: newResidence, error } = await supabase
        .from('residences')
        .insert({
            owner_id: user.id,
            name: name.trim(),
            address: address ? address.trim() : null,
            number: number ? number.trim() : null,
            photo_url
        })
        .select()
        .single()

    if (!error && newResidence) {
        const cookieStore = await cookies()
        cookieStore.set('selected_residence', JSON.stringify({ id: newResidence.id, name: newResidence.name }), { path: '/' })
        redirect('/dashboard')
    } else {
        console.error('Failed to insert residence:', error)
    }
}

export async function deleteResidence(residenceId: string, photoUrl: string | null) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Verify ownership and delete
    const { error } = await supabase
        .from('residences')
        .delete()
        .match({ id: residenceId, owner_id: user.id })

    // Optionally delete the photo if it exists (extra robustness)
    if (!error && photoUrl) {
        // Assuming photoUrl has a recognizable pattern we can extract the path from
        const urlParts = photoUrl.split('/')
        const fileName = urlParts[urlParts.length - 1]
        if (fileName) {
            const filePath = `${user.id}/${fileName}`
            await supabase.storage.from('photos').remove([filePath])
        }
    }

    if (!error) {
        const cookieStore = await cookies()
        const currentCookie = cookieStore.get('selected_residence')
        if (currentCookie) {
            try {
                const currentData = JSON.parse(currentCookie.value)
                if (currentData.id === residenceId) {
                    cookieStore.delete('selected_residence')
                }
            } catch (e) {}
        }
        revalidatePath('/selecionar-residencia')
    } else {
        console.error('Failed to delete residence:', error)
    }
}
