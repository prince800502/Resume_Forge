import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AIRequest {
  type: 'summary' | 'bullets' | 'skills' | 'improve' | 'ats-feedback'
  data: any
  targetRole?: string
  jobDescription?: string
}

function getSystemPrompt(type: AIRequest['type']): string {
  const basePrompt = `You are an expert resume writer and career coach. Provide professional, ATS-friendly suggestions. Never invent false information, metrics, or achievements. If information is missing, suggest where the user could add genuine details.`

  switch (type) {
    case 'summary':
      return `${basePrompt}

Generate a compelling professional summary based on the user's background.
Focus on: key skills, years of experience, notable achievements, and target role alignment.
Length: 3-5 sentences. Professional tone. Include relevant keywords for ATS.
Return ONLY the summary text, no explanations.`

    case 'bullets':
      return `${basePrompt}

Improve the provided experience/project bullet points.
Rules:
- Start with strong action verbs (built, developed, led, optimized, automated, etc.)
- Make concise and impactful
- Add measurable outcomes where appropriate (suggest placeholders like "X%" if missing)
- Keep technical accuracy
- Maximum 2 lines per bullet
Return ONLY the improved bullets as a JSON array of strings.`

    case 'skills':
      return `${basePrompt}

Suggest relevant skills based on the user's background and target role.
Categorize as: technical, framework, database, cloud, tool, language, soft, other.
Distinguish between existing skills and recommended skills.
Return JSON with: { existing: string[], recommended: string[], categories: Record<string, string[]> }`

    case 'improve':
      return `${basePrompt}

Improve the provided text for a resume.
Options: more concise, more professional, better for target role, generate alternatives.
Return JSON with: { improved: string, alternatives: string[] }`

    case 'ats-feedback':
      return `${basePrompt}

Analyze the resume against the job description.
Provide: matched keywords, missing keywords, specific improvement suggestions.
Be honest - don't guarantee ATS passage.
Return JSON with: { matchedKeywords: string[], missingKeywords: string[], suggestions: string[], score: number }`

    default:
      return basePrompt
  }
}

function buildUserPrompt(request: AIRequest): string {
  const { data, targetRole, jobDescription } = request
  
  let prompt = ''
  
  switch (request.type) {
    case 'summary':
      prompt = `Background:
- Skills: ${data.skills?.map((s: any) => s.name).join(', ') || 'None'}
- Experience: ${data.experience?.map((e: any) => `${e.position} at ${e.company}`).join('; ') || 'None'}
- Education: ${data.education?.map((e: any) => `${e.degree} in ${e.field} at ${e.institution}`).join('; ') || 'None'}
- Projects: ${data.projects?.map((p: any) => p.name).join(', ') || 'None'}
${targetRole ? `- Target Role: ${targetRole}` : ''}
${jobDescription ? `- Job Description: ${jobDescription}` : ''}`
      break

    case 'bullets':
      prompt = `Current bullets: ${JSON.stringify(data.bullets)}
Context: ${data.context || ''}
${targetRole ? `Target Role: ${targetRole}` : ''}
${jobDescription ? `Job Description: ${jobDescription}` : ''}`
      break

    case 'skills':
      prompt = `Current skills: ${data.skills?.map((s: any) => s.name).join(', ') || 'None'}
Experience: ${data.experience?.map((e: any) => `${e.position} at ${e.company}`).join('; ') || 'None'}
Projects: ${data.projects?.map((p: any) => `${p.name}: ${p.technologies.join(', ')}`).join('; ') || 'None'}
${targetRole ? `Target Role: ${targetRole}` : ''}
${jobDescription ? `Job Description: ${jobDescription}` : ''}`
      break

    case 'improve':
      prompt = `Text to improve: "${data.text}"
Mode: ${data.mode || 'improve'}
${targetRole ? `Target Role: ${targetRole}` : ''}
${jobDescription ? `Job Description: ${jobDescription}` : ''}`
      break

    case 'ats-feedback':
      prompt = `Resume text: ${data.resumeText}
${jobDescription ? `Job Description: ${jobDescription}` : ''}
${targetRole ? `Target Role: ${targetRole}` : ''}`
      break
  }

  return prompt
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get AI provider configuration from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    const aiProvider = Deno.env.get('AI_PROVIDER') || 'openai'
    const aiModel = Deno.env.get('AI_MODEL') || 'gpt-4o-mini'

    if (!openaiApiKey && !anthropicApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'AI service not configured',
          message: 'Please configure OPENAI_API_KEY or ANTHROPIC_API_KEY in Supabase Edge Function secrets.',
          setupRequired: true
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body: AIRequest = await req.json()
    const { type, data, targetRole, jobDescription } = body

    if (!type || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = getSystemPrompt(type)
    const userPrompt = buildUserPrompt(body)

    let result: any

    if (aiProvider === 'openai' && openaiApiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('OpenAI API error:', error)
        throw new Error(`AI provider error: ${error.error?.message || 'Unknown error'}`)
      }

      const completion = await response.json()
      const content = completion.choices[0]?.message?.content || ''
      
      // Try to parse JSON response for structured outputs
      if (['bullets', 'skills', 'improve', 'ats-feedback'].includes(type)) {
        try {
          result = JSON.parse(content)
        } catch {
          result = { raw: content }
        }
      } else {
        result = { text: content }
      }
    } else if (aiProvider === 'anthropic' && anthropicApiKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicApiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: aiModel || 'claude-3-haiku-20240307',
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Anthropic API error:', error)
        throw new Error(`AI provider error: ${error.error?.message || 'Unknown error'}`)
      }

      const completion = await response.json()
      const content = completion.content[0]?.text || ''
      
      if (['bullets', 'skills', 'improve', 'ats-feedback'].includes(type)) {
        try {
          result = JSON.parse(content)
        } catch {
          result = { raw: content }
        }
      } else {
        result = { text: content }
      }
    } else {
      throw new Error('No valid AI provider configured')
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('AI Suggestions error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate AI suggestions',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})