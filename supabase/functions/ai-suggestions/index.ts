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

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  type: AIRequest['type'],
  model: string
): Promise<any> {
  // Combine system and user prompts for Gemini (which doesn't have a separate system role)
  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: combinedPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
          topP: 0.95,
          topK: 40,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    console.error('Gemini API error:', JSON.stringify(error, null, 2))
    const errorMessage = error.error?.message || 'Unknown error'
    const errorCode = error.error?.code
    
    // Handle specific error cases
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
    
    // Handle invalid API key
    if (response.status === 400 && errorMessage.includes('API key')) {
      throw new Error('Invalid API key configuration. Please check GEMINI_API_KEY.')
    }
    
    // Handle invalid API key (401)
    if (response.status === 401) {
      throw new Error('Invalid or expired API key. Please check GEMINI_API_KEY.')
    }
    
    // Handle model not found / deprecated model
    if (response.status === 404 || (response.status === 400 && (errorMessage.includes('model') || errorMessage.includes('not found') || errorMessage.includes('deprecated') || errorMessage.includes('404')))) {
      throw new Error('The AI model is not available. Please check the model configuration.')
    }
    
    // Handle quota exceeded
    if (errorCode === 8 || errorMessage.includes('quota') || errorMessage.includes('QUOTA')) {
      throw new Error('API quota exceeded. Please check your Google Cloud quota.')
    }
    
    // Handle permission denied
    if (response.status === 403) {
      throw new Error('Permission denied. Please check API key permissions.')
    }
    
    throw new Error(`Gemini API error (${response.status}): ${errorMessage}`)
  }

  const completion = await response.json()
  
  // Check for candidates array
  if (!completion.candidates || completion.candidates.length === 0) {
    console.error('No candidates in response:', JSON.stringify(completion, null, 2))
    throw new Error('No response candidates from Gemini API')
  }
  
  const candidate = completion.candidates[0]
  
  // Check for finish reason
  if (candidate.finishReason && candidate.finishReason !== 'STOP') {
    console.warn('Gemini finish reason:', candidate.finishReason)
    if (candidate.finishReason === 'SAFETY') {
      throw new Error('Content blocked by safety filters')
    }
  }
  
  const content = candidate.content?.parts?.[0]?.text || ''
  
  if (!content) {
    throw new Error('Empty response from Gemini API')
  }

  // Try to parse JSON response for structured outputs
  if (['bullets', 'skills', 'improve', 'ats-feedback'].includes(type)) {
    try {
      // Clean up potential markdown code blocks
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      return JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError, 'Raw content:', content)
      // If JSON parsing fails, return raw content in a structured format
      return { raw: content }
    }
  } else {
    return { text: content }
  }
}

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  type: AIRequest['type'],
  model: string
): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
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
  
  if (['bullets', 'skills', 'improve', 'ats-feedback'].includes(type)) {
    try {
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      return JSON.parse(cleanContent)
    } catch {
      return { raw: content }
    }
  } else {
    return { text: content }
  }
}

async function callAnthropic(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  type: AIRequest['type'],
  model: string
): Promise<any> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-3-haiku-20240307',
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
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      return JSON.parse(cleanContent)
    } catch {
      return { raw: content }
    }
  } else {
    return { text: content }
  }
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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    
    // Determine provider: prefer Gemini if available, then OpenAI, then Anthropic
    const configuredProvider = Deno.env.get('AI_PROVIDER')
    let aiProvider: 'gemini' | 'openai' | 'anthropic' | null = null
    let aiModel: string | null = null

    if (configuredProvider) {
      aiProvider = configuredProvider as 'gemini' | 'openai' | 'anthropic'
    } else if (geminiApiKey) {
      aiProvider = 'gemini'
    } else if (openaiApiKey) {
      aiProvider = 'openai'
    } else if (anthropicApiKey) {
      aiProvider = 'anthropic'
    }

    // Default models for each provider
    // Current stable models as per Google Gemini API documentation (as of 2025-10)
    // Note: gemini-1.5-flash and gemini-1.5-flash-8b were deprecated/shut down on 2025-09-29
    // gemini-2.0-flash and gemini-2.0-flash-lite were deprecated/shut down on 2026-06-01
    // Current stable models: gemini-2.5-flash, gemini-2.5-flash-lite
    if (aiProvider === 'gemini') {
      aiModel = Deno.env.get('AI_MODEL') || 'gemini-2.5-flash'
    } else if (aiProvider === 'openai') {
      aiModel = Deno.env.get('AI_MODEL') || 'gpt-4o-mini'
    } else if (aiProvider === 'anthropic') {
      aiModel = Deno.env.get('AI_MODEL') || 'claude-3-haiku-20240307'
    }

    if (!aiProvider) {
      return new Response(
        JSON.stringify({ 
          error: 'AI service not configured',
          message: 'Please configure GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY in Supabase Edge Function secrets.',
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

    try {
      if (aiProvider === 'gemini' && geminiApiKey) {
        result = await callGemini(geminiApiKey, systemPrompt, userPrompt, type, aiModel!)
      } else if (aiProvider === 'openai' && openaiApiKey) {
        result = await callOpenAI(openaiApiKey, systemPrompt, userPrompt, type, aiModel!)
      } else if (aiProvider === 'anthropic' && anthropicApiKey) {
        result = await callAnthropic(anthropicApiKey, systemPrompt, userPrompt, type, aiModel!)
      } else {
        throw new Error(`No valid AI provider configured for ${aiProvider}`)
      }
    } catch (providerError) {
      // If the configured provider fails, don't fall back silently - return the error
      throw providerError
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('AI Suggestions error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Check if it's a setup/configuration error
    const isSetupError = errorMessage.includes('not configured') || 
                         errorMessage.includes('Invalid API key') ||
                         errorMessage.includes('Rate limit')
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate AI suggestions',
        message: errorMessage,
        setupRequired: isSetupError
      }),
      { status: isSetupError ? 503 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})