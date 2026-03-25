'use server'

import { cookies } from 'next/headers'

export async function getSelectedResidence() {
    const cookieStore = await cookies()
    const value = cookieStore.get('selected_residence')?.value

    if (!value) return 'Casa Principal'

    try {
        const parsed = JSON.parse(value)
        return parsed.name || 'Casa Principal'
    } catch {
        // Fallback for old simple string cookies
        return value || 'Casa Principal'
    }
}

export async function getSelectedResidenceObj() {
    const cookieStore = await cookies()
    const value = cookieStore.get('selected_residence')?.value

    if (!value) return null

    try {
        return JSON.parse(value)
    } catch {
        return null
    }
}
