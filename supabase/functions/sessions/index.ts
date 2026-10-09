import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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
    if (req.method === 'GET') {
      const { data: sessions, error } = await supabaseAdmin.auth.admin.listUserSessions(userId)
      
      if (error) {
        console.error('Error listing sessions:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch sessions' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Format sessions for frontend
      const formattedSessions = sessions.map(session => ({
        id: session.id,
        device: session.device || 'Unknown Device',
        browser: session.user_agent ? parseUserAgent(session.user_agent).browser : 'Unknown',
        os: session.user_agent ? parseUserAgent(session.user_agent).os : 'Unknown',
        ip: session.ip || 'Unknown',
        location: session.ip ? await getLocationFromIP(session.ip) : 'Unknown',
        created_at: session.created_at,
        last_active: session.updated_at || session.created_at,
        is_current: false, // Will be determined on frontend by comparing access_token
      }))

      return new Response(
        JSON.stringify({ sessions: formattedSessions }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE - Revoke specific session(s)
    if (req.method === 'DELETE') {
      const body = await req.json()
      const { sessionIds, revokeAll } = body

      if (revokeAll) {
        // Revoke all sessions except current (we can't easily identify current session here)
        // Supabase doesn't have a direct "revoke all except current" API
        // We'll revoke all and the user will need to sign in again
        const { error } = await supabaseAdmin.auth.admin.revokeRefreshTokens(userId)
        
        if (error) {
          console.error('Error revoking all sessions:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to revoke sessions' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'All sessions revoked' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (sessionIds && Array.isArray(sessionIds) && sessionIds.length > 0) {
        // Revoke specific sessions
        // Note: Supabase doesn't have a direct API to revoke specific session by ID
        // The admin API only supports revoking all refresh tokens for a user
        // For specific session revocation, we'd need to track sessions ourselves
        // For now, we'll return an error indicating this limitation
        return new Response(
          JSON.stringify({ error: 'Specific session revocation not yet supported. Use "revoke all" option.' }),
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
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Simple user agent parser
function parseUserAgent(ua: string) {
  const browser = ua.includes('Firefox') ? 'Firefox' :
                  ua.includes('Edg/') ? 'Edge' :
                  ua.includes('Chrome') ? 'Chrome' :
                  ua.includes('Safari') ? 'Safari' : 'Unknown'
  
  const os = ua.includes('Windows') ? 'Windows' :
             ua.includes('Mac OS') ? 'macOS' :
             ua.includes('Linux') ? 'Linux' :
             ua.includes('Android') ? 'Android' :
             ua.includes('iOS') ? 'iOS' : 'Unknown'
  
  return { browser, os }
}

// Simple IP location lookup (placeholder - in production use a proper service)
async function getLocationFromIP(ip: string): Promise<string> {
  if (ip === 'Unknown' || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return 'Local Network'
  }
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    const data = await response.json()
    if (data.city && data.country_name) {
      return `${data.city}, ${data.country_name}`
    }
    return 'Unknown'
  } catch {
    return 'Unknown'
  }
}