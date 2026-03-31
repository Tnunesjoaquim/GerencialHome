'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="h-14 mt-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-black tracking-widest text-xs uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? (
                <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Adicionando...
                </>
            ) : (
                <>
                    <span className="material-symbols-outlined">add_circle</span>
                    Adicionar
                </>
            )}
        </button>
    )
}
