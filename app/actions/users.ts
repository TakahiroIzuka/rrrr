'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function createUser(email: string, password: string, type: 'admin' | 'user', companyId: number | null) {
  try {
    // Use regular client to check current user permissions
    const supabase = await createClient()

    // Get current user to verify they're admin
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return { error: 'Not authenticated' }
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('type')
      .eq('auth_user_id', authUser.id)
      .single()

    if (!currentUser || currentUser.type !== 'admin') {
      return { error: 'Permission denied' }
    }

    // Use admin client for creating user
    const adminClient = createAdminClient()

    // Use admin API to create user without affecting current session
    const { data: newAuthUser, error: authError } = await adminClient.auth.admin.createUser({
      email: email.trim(),
      password: password.trim(),
      email_confirm: true, // Auto-confirm email
    })

    if (authError) {
      return { error: authError.message }
    }

    if (!newAuthUser.user) {
      return { error: 'Failed to create auth user' }
    }

    // Insert into users table using admin client
    const { error: dbError } = await adminClient
      .from('users')
      .insert({
        email: email.trim(),
        type: type,
        company_id: companyId,
        auth_user_id: newAuthUser.user.id
      })

    if (dbError) {
      // Rollback: delete auth user if database insert fails
      await adminClient.auth.admin.deleteUser(newAuthUser.user.id)
      return { error: dbError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating user:', error)
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
