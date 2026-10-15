import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Create user client to verify identity
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id

    // GET - List all sessions for the user
    // Note: Supabase Admin API does not provide a way to list user sessions.
    // The GoTrueAdminApi only supports: listUsers, getUserById, updateUserById, deleteUser,
    // inviteUserByEmail, generateLink, createUser, and signOut (which requires a JWT).
    // We return an empty array with a note that this feature is not available via the Admin API.
    if (req.method === 'GET') {
      console.info('Session listing requested but not supported by Supabase Admin API')
      
      return new Response(
        JSON.stringify({ 
          sessions: [],
          note: 'Session listing is not currently supported by the Supabase Admin API. The admin API does not expose user session data.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE - Revoke sessions
    // The Supabase Admin API only supports revoking ALL sessions for a user via signOut(jwt).
    // It does NOT support revoking specific sessions by ID.
    // We use the user's JWT from the Authorization header to call signOut.
    if (req.method === 'DELETE') {
      const body = await req.json()
      const { sessionIds, revokeAll } = body

      if (revokeAll) {
        // Revoke all sessions for the user using their JWT
        // Note: This will also revoke the current session, requiring the user to sign in again
        try {
          const { error } = await supabaseAdmin.auth.admin.signOut(authHeader.replace('Bearer ', ''))
          
          if (error) {
            console.error('Error revoking all sessions:', error)
            return new Response(
              JSON.stringify({ error: 'Failed to revoke sessions', details: error.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'All sessions revoked. You will need to sign in again.' 
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (err) {
          console.error('Unexpected error revoking sessions:', err)
          return new Response(
            JSON.stringify({ error: 'Failed to revoke sessions', details: err instanceof Error ? err.message : 'Unknown error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      if (sessionIds && Array.isArray(sessionIds) && sessionIds.length > 0) {
        // Specific session revocation is not supported by Supabase Admin API
        return new Response(
          JSON.stringify({ 
            error: 'Specific session revocation is not supported by the Supabase Admin API. Use "revokeAll: true" to revoke all sessions.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Invalid request. Provide sessionIds array or revokeAll: true' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})