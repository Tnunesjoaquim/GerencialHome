import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { selectResidence, createResidence, deleteResidence } from './actions'
import { logout } from '@/app/login/actions'
import * as mot from 'framer-motion/client'
import { SubmitButton } from '@/components/SubmitButton'

export default async function SelectResidencePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch owned residences
    const { data: ownedResidences } = await supabase
        .from('residences')
        .select('*')
        .eq('owner_id', user.id)

    // Fetch joined residences
    const { data: memberRecords } = await supabase
        .from('residence_members')
        .select('residences(*)')
        .eq('user_id', user.id)

    // Merge and extract residence objects cleanly
    const joinedResidences = memberRecords
        ?.map(record => record.residences)
        .filter(r => r !== null && !Array.isArray(r)) as any[] || []

    const allResidences = [...(ownedResidences || []), ...joinedResidences]

    // Clean up duplicates if a user is both owner and member
    const uniqueResidences = Array.from(new Map(allResidences.map(r => [r.id, r])).values())
    const houses = uniqueResidences.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    return (
        <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 font-sans selection:bg-primary/30">
            {/* Left Side - Image/Branding (Hidden on small screens) */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-10" />
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                <mot.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="z-20 text-center flex flex-col items-center"
                >
                    <div className="size-24 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 mb-8 border border-white/10">
                        <span className="material-symbols-outlined text-slate-950 font-black text-5xl">home_app_logo</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
                        Gerencial<span className="text-primary tracking-normal not-italic">Home</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-sm">
                        Gestão unificada, inteligente e adaptável para sua residência premium.
                    </p>
                </mot.div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto max-h-screen scrollbar-thin">
                <div className="w-full max-w-[440px] py-10">
                    {/* Mobile Header (Only visible when Left Side is hidden) */}
                    <div className="lg:hidden flex flex-col items-center mb-10">
                        <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 mb-4">
                            <span className="material-symbols-outlined text-slate-950 font-black text-3xl">home_app_logo</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Gerencial<span className="text-primary tracking-normal not-italic">Home</span>
                        </h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Selecione a Residência</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Escolha qual ambiente você deseja gerenciar agora.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {houses.length === 0 ? (
                            <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-sm font-bold border border-orange-100 dark:border-orange-900/50 flex flex-col items-center gap-2 text-center">
                                <span className="material-symbols-outlined text-3xl">warning</span>
                                Nenhuma residência vinculada ao seu perfil. Crie uma nova abaixo.
                            </div>
                        ) : (
                            houses.map((house) => (
                                <div key={house.id} className="w-full group relative flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary transition-all text-left shadow-sm hover:shadow-md">
                                    <form action={selectResidence.bind(null, house.id, house.name)} className="flex-1 min-w-0">
                                        <button type="submit" className="w-full text-left flex items-center gap-4 group-focus:ring-4 focus:ring-primary/10 outline-none rounded-xl">
                                            {house.photo_url ? (
                                                <div
                                                    className="size-16 rounded-xl shrink-0 shadow-inner bg-cover bg-center border border-slate-100 dark:border-slate-800"
                                                    style={{ backgroundImage: `url(${house.photo_url})` }}
                                                />
                                            ) : (
                                                <div className="size-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200 dark:border-slate-700">
                                                    <span className="material-symbols-outlined text-2xl">home</span>
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0 pr-2">
                                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate text-lg">
                                                    {house.name}
                                                </h3>
                                                {(house.address || house.number) ? (
                                                    <p className="text-xs text-slate-500 truncate mt-1">
                                                        {house.address}{house.address && house.number ? ', ' : ''}{house.number}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-slate-400 mt-1 italic">Sem endereço cadastrado</p>
                                                )}
                                            </div>
                                        </button>
                                    </form>

                                    <div className="flex items-center gap-1 transition-opacity">
                                        {/* Edit Button Placeholder */}
                                        <button
                                            type="button"
                                            title="Editar Residência"
                                            className="size-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>

                                        <form action={deleteResidence.bind(null, house.id, house.photo_url)}>
                                            <button
                                                type="submit"
                                                className="size-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="Excluir Residência"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))
                        )}

                        <div className="relative mt-8 mb-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-50 dark:bg-slate-950 px-2 text-slate-500 font-bold tracking-widest">Nova Residência</span>
                            </div>
                        </div>

                        <form action={createResidence} className="mt-2 flex flex-col gap-3 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">

                            <div className="relative mb-2">
                                <input type="file" name="photo" accept="image/*" className="hidden" id="photo-upload" />
                                <label htmlFor="photo-upload" className="flex items-center justify-center gap-2 h-16 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-slate-500 hover:text-primary hover:border-primary font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer group shadow-sm">
                                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">add_a_photo</span>
                                    <span>Anexar Foto</span>
                                </label>
                            </div>

                            <input
                                className="h-14 px-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white shadow-sm font-medium text-sm"
                                name="residenceName"
                                type="text"
                                placeholder="Nome (ex: Casa Veraneio)"
                                required
                            />

                            <div className="flex gap-3">
                                <input
                                    className="flex-1 w-full min-w-0 h-14 px-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white shadow-sm font-medium text-sm"
                                    name="address"
                                    type="text"
                                    placeholder="Endereço principal"
                                />
                                <input
                                    className="w-28 shrink-0 h-14 px-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white shadow-sm font-medium text-sm"
                                    name="number"
                                    type="text"
                                    placeholder="Número"
                                />
                            </div>

                            <SubmitButton />
                        </form>
                    </div>

                    <div className="mt-12 text-center flex flex-col items-center gap-4 pb-12">
                        <form action={logout}>
                            <button
                                type="submit"
                                className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[16px]">logout</span>
                                Sair da conta
                            </button>
                        </form>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Gerencial Home System &copy; {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
