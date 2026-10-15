import { useCallback, useState } from 'react'
import { ResumeData } from '@/types'
import { supabase } from '@/services/supabase'
import toast from 'react-hot-toast'

interface AISuggestionResult {
  success: boolean
  data?: any
  error?: string
  message?: string
  setupRequired?: boolean
}

interface UseAISuggestionsReturn {
  generateSummary: (resumeData: ResumeData, targetRole?: string, jobDescription?: string) => Promise<string | null>
  improveBullets: (bullets: string[], context: string, targetRole?: string, jobDescription?: string) => Promise<string[] | null>
  suggestSkills: (resumeData: ResumeData, targetRole?: string, jobDescription?: string) => Promise<{ existing: string[]; recommended: string[]; categories: Record<string, string[]> } | null>
  improveText: (text: string, mode: 'concise' | 'professional' | 'target-role' | 'alternatives', targetRole?: string, jobDescription?: string) => Promise<{ improved: string; alternatives: string[] } | null>
  getATSFeedback: (resumeData: ResumeData, targetRole?: string, jobDescription?: string) => Promise<{ matchedKeywords: string[]; missingKeywords: string[]; suggestions: string[]; score: number } | null>
  loading: boolean
  error: string | null
}

export function useAISuggestions(): UseAISuggestionsReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const callAI = useCallback(async (
    type: 'summary' | 'bullets' | 'skills' | 'improve' | 'ats-feedback',
    data: any,
    targetRole?: string,
    jobDescription?: string
  ): Promise<any> => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('Authentication required')
      }

      const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
      
      const response = await fetch(`${functionsUrl}/ai-suggestions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data, targetRole, jobDescription }),
      })

      const result: AISuggestionResult = await response.json()

      if (!response.ok) {
        if (result.setupRequired) {
          throw new Error(result.message || 'AI service not configured. Please contact administrator.')
        }
        throw new Error(result.error || 'AI request failed')
      }

      return result.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI request failed'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const generateSummary = useCallback(async (
    resumeData: ResumeData,
    targetRole?: string,
    jobDescription?: string
  ) => {
    const result = await callAI('summary', resumeData, targetRole, jobDescription)
    if (!result) return null
    // Result can be { text: "..." } or just a string
    return typeof result === 'string' ? result : result?.text || null
  }, [callAI])

  const improveBullets = useCallback(async (
    bullets: string[],
    context: string,
    targetRole?: string,
    jobDescription?: string
  ) => {
    return callAI('bullets', { bullets, context }, targetRole, jobDescription)
  }, [callAI])

  const suggestSkills = useCallback(async (
    resumeData: ResumeData,
    targetRole?: string,
    jobDescription?: string
  ) => {
    return callAI('skills', resumeData, targetRole, jobDescription)
  }, [callAI])

  const improveText = useCallback(async (
    text: string,
    mode: 'concise' | 'professional' | 'target-role' | 'alternatives',
    targetRole?: string,
    jobDescription?: string
  ) => {
    return callAI('improve', { text, mode }, targetRole, jobDescription)
  }, [callAI])

  const getATSFeedback = useCallback(async (
    resumeData: ResumeData,
    targetRole?: string,
    jobDescription?: string
  ) => {
    // Extract plain text from resume for analysis
    const resumeText = [
      resumeData.summary,
      ...resumeData.experience.flatMap(e => [...e.description, ...e.technologies]),
      ...resumeData.skills.map(s => s.name),
      ...resumeData.projects.flatMap(p => [p.description, ...p.technologies]),
    ].join(' ')

    return callAI('ats-feedback', { resumeText }, targetRole, jobDescription)
  }, [callAI])

  return {
    generateSummary,
    improveBullets,
    suggestSkills,
    improveText,
    getATSFeedback,
    loading,
    error,
  }
}