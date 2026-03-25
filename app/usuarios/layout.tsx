import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getSelectedResidenceObj } from '../dashboard/actions'

export default async function UsuariosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const residence = await getSelectedResidenceObj()
  
  let isAdmin = false

  if (residence?.id) {
    // 1. Verificar se é Dono da residência
    const { data: residenceInfo } = await supabase
      .from('residences')
      .select('owner_id')
      .eq('id', residence.id)
      .single()
      
    isAdmin = residenceInfo?.owner_id === user.id
    
    // 2. Se não for dono, verificar se foi adicionado como Admin
    if (!isAdmin) {
      const { data: member } = await supabase
        .from('residence_members')
        .select('role')
        .eq('residence_id', residence.id)
        .eq('user_id', user.id)
        .single()
        
      if (member?.role === 'Admin') {
        isAdmin = true
      }
    }
  }

  // Bloqueia e envia de volta para o Dashboard caso não seja Admin ou Dono
  if (!isAdmin) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
