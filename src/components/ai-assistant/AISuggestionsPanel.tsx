import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { 
  SparklesIcon, 
  DocumentTextIcon, 
  ListBulletIcon, 
  CpuChipIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  FolderIcon,
  TrophyIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  InformationCircleIcon,
  BeakerIcon,
  DocumentIcon,
  CogIcon,
} from '@heroicons/react/24/outline'
import { useAISuggestions } from '@/hooks/useAISuggestions'
import { ResumeData } from '@/types'
import { Button, Card, Input, Textarea, Badge, Divider, Select } from '@/components/ui'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

interface AISuggestionsPanelProps {
  resumeData: ResumeData
  targetRole?: string
  jobDescription?: string
  onApplySummary: (summary: string) => void
  onApplyBullets: (sectionType: 'experience' | 'projects', id: string, bullets: string[]) => void
  onApplySkills: (skills: string[]) => void
  onApplyText: (field: string, value: string) => void
  onTargetRoleChange?: (value: string) => void
  onJobDescriptionChange?: (value: string) => void
  onClose?: () => void
}

type TabId = 'overview' | 'summary' | 'bullets' | 'skills' | 'refine' | 'ats'

interface TabConfig {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  requiresAI: boolean
  requiresJobDescription?: boolean
}

const TABS: TabConfig[] = [
  { 
    id: 'overview', 
    label: 'Overview', 
    icon: InformationCircleIcon, 
    description: 'Resume completeness check and suggested actions',
    requiresAI: false 
  },
  { 
    id: 'summary', 
    label: 'Summary', 
    icon: DocumentIcon, 
    description: 'Generate an AI-powered professional summary',
    requiresAI: true 
  },
  { 
    id: 'bullets', 
    label: 'Bullets', 
    icon: ListBulletIcon, 
    description: 'Improve experience and project bullet points',
    requiresAI: true 
  },
  { 
    id: 'skills', 
    label: 'Skills', 
    icon: CpuChipIcon, 
    description: 'Get role-specific skill recommendations',
    requiresAI: true 
  },
  { 
    id: 'refine', 
    label: 'Refine', 
    icon: BeakerIcon, 
    description: 'Rewrite and polish any section of your resume',
    requiresAI: true 
  },
  { 
    id: 'ats', 
    label: 'ATS', 
    icon: ShieldCheckIcon, 
    description: 'Analyze keyword match against a job description',
    requiresAI: true,
    requiresJobDescription: true
  },
]

type Priority = 'high' | 'medium' | 'low'

interface CompletenessCheck {
  id: string
  title: string
  description: string
  passed: boolean
  priority: Priority
  actionLabel: string
  actionTab?: TabId
}

interface SkillsSuggestion {
  existing: string[]
  recommended: string[]
  categories: Record<string, string[]>
}

interface ImprovedText {
  original: string
  improved: string
  alternatives: string[]
  field: string
}

interface ATSFeedback {
  score: number
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestions: string[]
}

interface LoadingState {
  summary: boolean
  bullets: Record<string, boolean>
  skills: boolean
  refine: Record<string, boolean>
  ats: boolean
}

interface ErrorState {
  summary: string | null
  bullets: Record<string, string | null>
  skills: string | null
  refine: Record<string, string | null>
  ats: string | null
}

export function AISuggestionsPanel({ 
  resumeData, 
  targetRole, 
  jobDescription, 
  onApplySummary,
  onApplyBullets,
  onApplySkills,
  onApplyText,
  onTargetRoleChange,
  onJobDescriptionChange,
  onClose
}: AISuggestionsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [loading, setLoading] = useState<LoadingState>({
    summary: false,
    bullets: {},
    skills: false,
    refine: {},
    ats: false,
  })
  const [errors, setErrors] = useState<ErrorState>({
    summary: null,
    bullets: {},
    skills: null,
    refine: {},
    ats: null,
  })
  const [completenessScore, setCompletenessScore] = useState(0)
  const [completenessChecks, setCompletenessChecks] = useState<CompletenessCheck[]>([])
  const [suggestedSummary, setSuggestedSummary] = useState<string | null>(null)
  const [suggestedSkills, setSuggestedSkills] = useState<SkillsSuggestion | null>(null)
  const [improvedBullets, setImprovedBullets] = useState<Record<string, string[]>>({})
  const [improveTarget, setImproveTarget] = useState<{ sectionType: 'summary' | 'experience' | 'projects', id: string, originalContent: string, label: string } | null>(null)
  const [improvedText, setImprovedText] = useState<ImprovedText | null>(null)
  const [atsFeedback, setAtsFeedback] = useState<ATSFeedback | null>(null)
  const [expandStates, setExpandStates] = useState<Record<string, boolean>>({})
  const [refineTone, setRefineTone] = useState<'concise' | 'professional' | 'target-role' | 'alternatives'>('professional')

  const { 
    generateSummary, 
    improveBullets, 
    suggestSkills, 
    improveText, 
    getATSFeedback 
  } = useAISuggestions()

  const toggleExpand = useCallback((key: string) => {
    setExpandStates(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const calculateCompleteness = useCallback(() => {
    const checks: CompletenessCheck[] = []
    let passedCount = 0

    const hasSummary = !!(resumeData.summary && resumeData.summary.trim().length > 50)
    checks.push({
      id: 'summary',
      title: 'Professional Summary',
      description: hasSummary ? 'Well-written summary present' : 'Add a compelling professional summary (50+ chars)',
      passed: hasSummary,
      priority: 'high',
      actionLabel: 'Generate with AI',
      actionTab: 'summary'
    })
    if (hasSummary) passedCount++

    const hasExperience = resumeData.experience.length > 0
    const hasDetailedExperience = resumeData.experience.some(e => e.description.length > 0)
    checks.push({
      id: 'experience',
      title: 'Work Experience',
      description: hasDetailedExperience ? 'Detailed experience with bullets' : hasExperience ? 'Experience entries need bullet points' : 'Add work experience',
      passed: hasDetailedExperience,
      priority: 'high',
      actionLabel: hasExperience ? 'Improve Bullets' : 'Add Experience',
      actionTab: hasExperience ? 'bullets' : undefined
    })
    if (hasDetailedExperience) passedCount++

    const hasSkills = resumeData.skills.length > 0
    checks.push({
      id: 'skills',
      title: 'Skills',
      description: hasSkills ? `${resumeData.skills.length} skills listed` : 'Add relevant skills',
      passed: hasSkills,
      priority: 'high',
      actionLabel: 'Suggest Skills',
      actionTab: 'skills'
    })
    if (hasSkills) passedCount++

    const hasEducation = resumeData.education.length > 0
    checks.push({
      id: 'education',
      title: 'Education',
      description: hasEducation ? 'Education listed' : 'Add education background',
      passed: hasEducation,
      priority: 'medium',
      actionLabel: 'Add Education',
    })
    if (hasEducation) passedCount++

    const hasProjects = resumeData.projects.length > 0
    checks.push({
      id: 'projects',
      title: 'Projects',
      description: hasProjects ? `${resumeData.projects.length} projects showcased` : 'Add projects to demonstrate experience',
      passed: hasProjects,
      priority: 'medium',
      actionLabel: 'Add Projects',
    })
    if (hasProjects) passedCount++

    const hasContact = !!(resumeData.personal.email && resumeData.personal.phone)
    checks.push({
      id: 'contact',
      title: 'Contact Information',
      description: hasContact ? 'Complete contact details' : 'Add email and phone number',
      passed: hasContact,
      priority: 'high',
      actionLabel: 'Update Contact Info',
    })
    if (hasContact) passedCount++

    const score = Math.round((passedCount / checks.length) * 100)
    setCompletenessScore(score)
    setCompletenessChecks(checks)
  }, [resumeData])

  useEffect(() => {
    calculateCompleteness()
  }, [calculateCompleteness])

  const getPriorityLabel = useCallback((priority: Priority) => {
    return priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low'
  }, [])

  const setLoadingState = useCallback(<K extends keyof LoadingState>(key: K, value: LoadingState[K]) => {
    setLoading(prev => ({ ...prev, [key]: value }))
  }, [])

  const setErrorState = useCallback(<K extends keyof ErrorState>(key: K, value: ErrorState[K]) => {
    setErrors(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearError = useCallback((key: keyof ErrorState) => {
    setErrorState(key, null)
  }, [setErrorState])

  const handleGenerateSummary = useCallback(async () => {
    if (!targetRole && !jobDescription) {
      setErrorState('summary', 'Enter a target role or job description first')
      return
    }
    clearError('summary')
    setLoadingState('summary', true)
    try {
      const summary = await generateSummary(resumeData, targetRole, jobDescription)
      if (summary) {
        setSuggestedSummary(summary)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate summary'
      setErrorState('summary', msg)
      toast.error(msg)
    } finally {
      setLoadingState('summary', false)
    }
  }, [resumeData, targetRole, jobDescription, generateSummary, setLoadingState, setErrorState, clearError])

  const handleImproveBullets = useCallback(async (sectionType: 'experience' | 'projects', id: string, bullets: string[], label: string) => {
    if (!targetRole && !jobDescription) {
      setErrorState('bullets', { ...errors.bullets, [id]: 'Enter a target role or job description first' })
      return
    }
    clearError('bullets')
    setLoadingState('bullets', { ...loading.bullets, [id]: true })
    setImproveTarget({ sectionType, id, originalContent: bullets.join('\n'), label })
    try {
      const improved = await improveBullets(bullets, label, targetRole, jobDescription)
      if (improved) {
        setImprovedBullets(prev => ({ ...prev, [id]: improved }))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to improve bullets'
      setErrorState('bullets', { ...errors.bullets, [id]: msg })
      toast.error(msg)
    } finally {
      setLoadingState('bullets', { ...loading.bullets, [id]: false })
    }
  }, [improveBullets, targetRole, jobDescription, setLoadingState, setErrorState, clearError, errors.bullets, loading.bullets])

  const handleApplyBullets = useCallback((sectionType: 'experience' | 'projects', id: string) => {
    const bullets = improvedBullets[id]
    if (bullets) {
      onApplyBullets(sectionType, id, bullets)
      setImprovedBullets(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      toast.success('Bullets applied!')
    }
  }, [improvedBullets, onApplyBullets])

  const handleSuggestSkills = useCallback(async () => {
    if (!targetRole && !jobDescription) {
      setErrorState('skills', 'Enter a target role or job description first')
      return
    }
    clearError('skills')
    setLoadingState('skills', true)
    try {
      const skills = await suggestSkills(resumeData, targetRole, jobDescription)
      if (skills) {
        setSuggestedSkills(skills)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to suggest skills'
      setErrorState('skills', msg)
      toast.error(msg)
    } finally {
      setLoadingState('skills', false)
    }
  }, [resumeData, targetRole, jobDescription, suggestSkills, setLoadingState, setErrorState, clearError])

  const handleApplySkill = useCallback((skill: string) => {
    // Check if skill already exists in resume data (case-insensitive)
    const existingSkill = resumeData.skills.some(
      (s) => s.name.toLowerCase() === skill.toLowerCase()
    )
    if (existingSkill) {
      toast(`"${skill}" is already in your skills`, { icon: 'ℹ️' })
      return
    }
    onApplySkills([skill])
    toast.success(`Added "${skill}" to skills`)
  }, [onApplySkills, resumeData.skills])

  const handleImproveText = useCallback(async (field: string, value: string, type: 'summary' | 'experience' | 'projects', tone: 'concise' | 'professional' | 'target-role' | 'alternatives') => {
    if (!targetRole && !jobDescription) {
      setErrorState('refine', { ...errors.refine, [field]: 'Enter a target role or job description first' })
      return
    }
    clearError('refine')
    setLoadingState('refine', { ...loading.refine, [field]: true })
    setImproveTarget({ sectionType: type, id: field, originalContent: value, label: field })
    try {
      const improved = await improveText(value, tone, targetRole, jobDescription)
      if (improved) {
        setImprovedText({ ...improved, field, original: value })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to improve text'
      setErrorState('refine', { ...errors.refine, [field]: msg })
      toast.error(msg)
    } finally {
      setLoadingState('refine', { ...loading.refine, [field]: false })
    }
  }, [improveText, targetRole, jobDescription, setLoadingState, setErrorState, clearError, errors.refine, loading.refine])

  const handleApplyImprovedText = useCallback(() => {
    if (improvedText && improveTarget) {
      onApplyText(improveTarget.id, improvedText.improved)
      setImprovedText(null)
      setImproveTarget(null)
      toast.success('Text improved!')
    }
  }, [improvedText, improveTarget, onApplyText])

  const handleGetATSFeedback = useCallback(async () => {
    if (!targetRole && !jobDescription) {
      setErrorState('ats', 'Enter a target role or job description first')
      return
    }
    clearError('ats')
    setLoadingState('ats', true)
    try {
      const feedback = await getATSFeedback(resumeData, targetRole, jobDescription)
      if (feedback) {
        setAtsFeedback(feedback)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze ATS'
      setErrorState('ats', msg)
      toast.error(msg)
    } finally {
      setLoadingState('ats', false)
    }
  }, [resumeData, targetRole, jobDescription, getATSFeedback, setLoadingState, setErrorState, clearError])

  const hasAnyAnalysis = useMemo(() => 
    suggestedSummary || suggestedSkills || Object.keys(improvedBullets).length > 0 || improvedText || atsFeedback,
    [suggestedSummary, suggestedSkills, improvedBullets, improvedText, atsFeedback]
  )

  const canAnalyze = targetRole || jobDescription
  const currentTabConfig = TABS.find(t => t.id === activeTab)

  const getErrorForTab = useCallback(() => {
    const err = errors[activeTab as keyof ErrorState]
    if (activeTab === 'bullets') {
      const bulletErr = Object.entries(errors.bullets).find(([, v]) => v)?.[1]
      if (bulletErr) return bulletErr
    }
    if (activeTab === 'refine') {
      const refineErr = Object.entries(errors.refine).find(([, v]) => v)?.[1]
      if (refineErr) return refineErr
    }
    if (typeof err === 'string') return err
    return null
  }, [activeTab, errors])

  const getSetupError = useCallback(() => {
    const err = errors[activeTab as keyof ErrorState]
    if (typeof err === 'string' && err.includes('not configured')) {
      return <p className="mt-1 text-xs">Configure AI provider in Supabase Edge Function secrets.</p>
    }
    if (activeTab === 'bullets') {
      const bulletErr = Object.entries(errors.bullets).find(([, v]) => v)?.[1]
      if (typeof bulletErr === 'string' && bulletErr.includes('not configured')) {
        return <p className="mt-1 text-xs">Configure AI provider in Supabase Edge Function secrets.</p>
      }
    }
    if (activeTab === 'refine') {
      const refineErr = Object.entries(errors.refine).find(([, v]) => v)?.[1]
      if (typeof refineErr === 'string' && refineErr.includes('not configured')) {
        return <p className="mt-1 text-xs">Configure AI provider in Supabase Edge Function secrets.</p>
      }
    }
    return null
  }, [activeTab, errors])

  return (
    <div className="flex flex-col h-full min-h-0 bg-[var(--background)]">
      {/* Header - Fixed at top */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-4 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-500 flex items-center justify-center flex-shrink-0">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold truncate">AI Suggestions</h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
              Enhance your resume with AI-powered insights tailored to your target role
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap text-sm">
              <span className="text-[var(--muted-foreground)] truncate">
                Target: {targetRole || 'Not set'}
              </span>
              {jobDescription && (
                <>
                  <span className="text-cosmic-500/70">•</span>
                  <span className="text-[var(--muted-foreground)] truncate max-w-xs">JD provided</span>
                </>
              )}
              <Badge variant="cosmic" size="sm" className="flex-shrink-0">{completenessScore}% Complete</Badge>
            </div>
          </div>
        </div>

        {/* Close Button */}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close AI Suggestions"
            className="flex-shrink-0 sm:ml-2"
          >
            <XMarkIcon className="w-5 h-5" />
          </Button>
        )}
      </header>

      {/* Context Inputs Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-5 pb-4 border-b border-[var(--border)] flex-shrink-0 space-y-3 sm:space-y-0">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Target Role</label>
          <Input
            type="text"
            placeholder="e.g., Senior Software Engineer"
            value={targetRole || ''}
            onChange={(e) => onTargetRoleChange?.(e.target.value)}
            className="w-full"
            aria-label="Target job role"
            autoFocus
          />
        </div>
        <div className="flex-1 min-w-0 sm:w-96">
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Job Description <span className="text-[var(--muted-foreground)] font-normal">(optional)</span></label>
          <Textarea
            placeholder="Paste a job description here for more tailored suggestions..."
            value={jobDescription || ''}
            onChange={(e) => onJobDescriptionChange?.(e.target.value)}
            className="w-full min-h-[72px] resize-y"
            aria-label="Job description"
            rows={2}
          />
        </div>
      </div>

      {/* Error Display - Scoped to active tab */}
      {getErrorForTab() && (
        <div className="p-3 rounded-lg mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex-shrink-0" role="alert">
          {getErrorForTab()}
          {getSetupError()}
        </div>
      )}

      {/* Tab Navigation */}
      <nav className="flex gap-1 bg-[var(--muted)] rounded-lg p-1 overflow-x-auto pb-2 -mb-2 flex-shrink-0" role="tablist" aria-label="AI Suggestion categories" style={{ scrollbarWidth: 'thin' }}>
        {TABS.map(tab => {
          const isLoading = tab.id === 'summary' && loading.summary
            || tab.id === 'bullets' && Object.values(loading.bullets).some(Boolean)
            || tab.id === 'skills' && loading.skills
            || tab.id === 'refine' && Object.values(loading.refine).some(Boolean)
            || tab.id === 'ats' && loading.ats

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.requiresAI && !canAnalyze && !hasAnyAnalysis}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-md transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                  : tab.requiresAI && !canAnalyze && !hasAnyAnalysis
                  ? 'text-[var(--muted-foreground)]/50 cursor-not-allowed'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
              title={tab.requiresAI && !canAnalyze && !hasAnyAnalysis ? 'Enter a target role or job description to enable' : tab.description}
            >
              <tab.icon className={clsx('w-4 h-4 flex-shrink-0', isLoading && 'animate-spin')} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Tab Description */}
      <div className="mb-4 p-3 bg-[var(--muted)]/50 rounded-lg flex-shrink-0">
        <p className="text-sm text-[var(--muted-foreground)]">{currentTabConfig?.description}</p>
        {currentTabConfig?.requiresJobDescription && !jobDescription && (
          <p className="text-xs text-cosmic-500 mt-1">This analysis requires a job description. Please add one above.</p>
        )}
        {currentTabConfig?.requiresAI && !canAnalyze && !hasAnyAnalysis && (
          <p className="text-xs text-cosmic-500 mt-1">Enter a target role or job description above to enable AI analysis.</p>
        )}
      </div>

      {/* Tab Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {(function() {
          const _canAnalyze = !!canAnalyze
          const _hasAnyAnalysis = !!hasAnyAnalysis
          switch (activeTab) {
            case 'overview':
              return (
                <OverviewTab 
                  completenessScore={completenessScore}
                  completenessChecks={completenessChecks}
                  getPriorityLabel={getPriorityLabel}
                  onTabChange={setActiveTab}
                  canAnalyze={!!canAnalyze}
                  hasAnyAnalysis={!!hasAnyAnalysis}
                />
              )
            case 'summary':
              return (
                <SummaryTab
                  resumeData={resumeData}
                  targetRole={targetRole}
                  jobDescription={jobDescription}
                  suggestedSummary={suggestedSummary}
                  setSuggestedSummary={setSuggestedSummary}
                  onApplySummary={onApplySummary}
                  handleGenerateSummary={handleGenerateSummary}
                  loading={loading.summary}
                  error={errors.summary}
                  canAnalyze={!!canAnalyze}
                />
              )
            case 'bullets':
              return (
                <BulletsTab
                  resumeData={resumeData}
                  targetRole={targetRole}
                  jobDescription={jobDescription}
                  improvedBullets={improvedBullets}
                  loading={loading.bullets}
                  errors={errors.bullets}
                  improveTarget={improveTarget}
                  handleImproveBullets={handleImproveBullets}
                  handleApplyBullets={handleApplyBullets}
                  canAnalyze={!!canAnalyze}
                  setErrorState={setErrorState}
                />
              )
            case 'skills':
              return (
                <SkillsTab
                  resumeData={resumeData}
                  targetRole={targetRole}
                  jobDescription={jobDescription}
                  suggestedSkills={suggestedSkills}
                  loading={loading.skills}
                  error={errors.skills}
                  handleSuggestSkills={handleSuggestSkills}
                  handleApplySkill={handleApplySkill}
                  canAnalyze={!!canAnalyze}
                />
              )
            case 'refine':
              return (
                <RefineTab
                  resumeData={resumeData}
                  targetRole={targetRole}
                  jobDescription={jobDescription}
                  improveTarget={improveTarget}
                  setImproveTarget={setImproveTarget}
                  improvedText={improvedText}
                  setImprovedText={setImprovedText}
                  loading={loading.refine}
                  errors={errors.refine}
                  refineTone={refineTone}
                  setRefineTone={setRefineTone}
                  handleImproveText={handleImproveText}
                  handleApplyImprovedText={handleApplyImprovedText}
                  canAnalyze={!!canAnalyze}
                  setErrorState={setErrorState}
                />
              )
            case 'ats':
              return (
                <ATSTab
                  resumeData={resumeData}
                  targetRole={targetRole}
                  jobDescription={jobDescription}
                  atsFeedback={atsFeedback}
                  loading={loading.ats}
                  error={errors.ats}
                  handleGetATSFeedback={handleGetATSFeedback}
                  handleApplySkill={handleApplySkill}
                  canAnalyze={!!canAnalyze}
                />
              )
            default:
              return null
          }
        })()}
      </div>
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

function OverviewTab({ 
  completenessScore, 
  completenessChecks, 
  getPriorityLabel,
  onTabChange,
  canAnalyze,
  hasAnyAnalysis
}: {
  completenessScore: number
  completenessChecks: CompletenessCheck[]
  getPriorityLabel: (p: Priority) => string
  onTabChange: (tab: TabId) => void
  canAnalyze: boolean
  hasAnyAnalysis: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Completeness Score Circle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full border-4 border-cosmic-500/20 flex items-center justify-center relative flex-shrink-0">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="none" stroke="var(--border)" strokeWidth="4" />
              <circle 
                cx="16" cy="16" r="14" 
                fill="none" 
                stroke="var(--cosmic-500)" 
                strokeWidth="4" 
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - completenessScore / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-cosmic-500">{completenessScore}%</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Resume Completeness</h3>
            <p className="text-sm text-[var(--muted-foreground)]">{completenessChecks.filter(c => c.passed).length} of {completenessChecks.length} sections complete</p>
          </div>
        </div>
        <div className="flex-1 min-w-0" />
        {!canAnalyze && !hasAnyAnalysis && (
          <Badge variant="cosmic" size="sm" className="flex-shrink-0">Add target role for AI actions</Badge>
        )}
      </div>

      {/* Section Checks Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {completenessChecks.map(check => (
          <Card 
            key={check.id} 
            variant="hover" 
            padding="md" 
            className={clsx(
              'border-l-4 transition-all min-h-[120px] flex flex-col',
              check.passed ? 'border-green-500 bg-green-500/5' : 'border-red-500 bg-red-500/5'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                check.passed ? 'bg-green-500/10' : 'bg-red-500/10'
              )}>
                {check.passed ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm truncate">{check.title}</h4>
                  <Badge 
                    variant={check.priority === 'high' ? 'danger' : check.priority === 'medium' ? 'warning' : 'info'} 
                    size="sm"
                  >
                    {getPriorityLabel(check.priority)}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 flex-1">{check.description}</p>
              </div>
            </div>
            {!check.passed && check.actionTab && canAnalyze && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-3 w-full justify-start text-cosmic-500 hover:bg-cosmic-500/10"
                onClick={() => onTabChange(check.actionTab!)}
              >
                {check.actionLabel}
                <ChevronDownIcon className="w-3 h-3 ml-1" />
              </Button>
            )}
            {!check.passed && check.actionTab && !canAnalyze && (
              <div className="mt-3 p-2 text-xs text-center text-[var(--muted-foreground)] bg-[var(--muted)]/50 rounded">
                Add target role to enable
              </div>
            )}
          </Card>
        ))}
      </div>

      {completenessScore === 100 && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
          <CheckCircleIcon className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <h4 className="font-semibold text-green-700 dark:text-green-300">Excellent! Your resume is complete.</h4>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">All key sections are well-populated. Add a target role for AI-powered improvements.</p>
        </div>
      )}

      {!hasAnyAnalysis && !canAnalyze && (
        <div className="p-6 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-center">
          <SparklesIcon className="w-12 h-12 mx-auto mb-3 text-cosmic-500/50" />
          <h3 className="text-lg font-semibold mb-2">Ready for AI Analysis</h3>
          <p className="text-[var(--muted-foreground)] mb-4 max-w-md mx-auto">
            Enter a target role above to unlock personalized AI suggestions for your resume.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <span className="text-sm text-[var(--muted-foreground)] px-3 py-1 bg-[var(--card)] rounded-lg">
              Try: "Senior Software Engineer"
            </span>
            <span className="text-sm text-[var(--muted-foreground)] px-3 py-1 bg-[var(--card)] rounded-lg">
              Try: "Frontend Developer"
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryTab({ 
  resumeData,
  targetRole,
  jobDescription,
  suggestedSummary,
  setSuggestedSummary,
  onApplySummary,
  handleGenerateSummary,
  loading,
  error,
  canAnalyze
}: {
  resumeData: ResumeData
  targetRole?: string
  jobDescription?: string
  suggestedSummary: string | null
  setSuggestedSummary: (s: string | null) => void
  onApplySummary: (s: string) => void
  handleGenerateSummary: () => void
  loading: boolean
  error: string | null
  canAnalyze: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Professional Summary Generator</h3>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleGenerateSummary} 
          loading={loading}
          disabled={!canAnalyze}
          leftIcon={<SparklesIcon className="w-4 h-4" />}
        >
          Generate Summary
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {suggestedSummary && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h4 className="font-medium text-sm text-[var(--muted-foreground)] mb-2">AI Generated Summary</h4>
            <Textarea
              value={suggestedSummary}
              onChange={(e) => setSuggestedSummary(e.target.value)}
              rows={5}
              className="mb-3"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setSuggestedSummary(null)}>
                Discard
              </Button>
              <Button variant="primary" size="sm" onClick={() => { onApplySummary(suggestedSummary); setSuggestedSummary(null) }} leftIcon={<CheckIcon className="w-4 h-4" />}>
                Apply Summary
              </Button>
            </div>
          </div>
        </div>
      )}

      {!suggestedSummary && !loading && (
        <div className="p-8 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-center">
          <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-cosmic-500/50" />
          <h4 className="font-medium mb-2">Generate a Professional Summary</h4>
          <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-md mx-auto">
            The AI will create a compelling 3-5 sentence summary based on your experience, skills, and target role.
          </p>
          {!canAnalyze && (
            <p className="text-xs text-cosmic-500">Enter a target role above to enable generation.</p>
          )}
        </div>
      )}
    </div>
  )
}

function BulletsTab({ 
  resumeData,
  targetRole,
  jobDescription,
  improvedBullets,
  loading,
  errors,
  improveTarget,
  handleImproveBullets,
  handleApplyBullets,
  canAnalyze,
  setErrorState
}: {
  resumeData: ResumeData
  targetRole?: string
  jobDescription?: string
  improvedBullets: Record<string, string[]>
  loading: Record<string, boolean>
  errors: Record<string, string | null>
  improveTarget: { sectionType: 'summary' | 'experience' | 'projects', id: string, originalContent: string, label: string } | null
  handleImproveBullets: (sectionType: 'experience' | 'projects', id: string, bullets: string[], label: string) => void
  handleApplyBullets: (sectionType: 'experience' | 'projects', id: string) => void
  canAnalyze: boolean
  setErrorState: (key: 'bullets', value: Record<string, string | null>) => void
}) {
  const clearError = (id: string) => {
    setErrorState('bullets', { ...errors, [id]: null })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Bullet Point Improver</h3>
        {!canAnalyze && (
          <Badge variant="cosmic" size="sm">Add target role to enable</Badge>
        )}
      </div>

      {!canAnalyze && (
        <div className="p-6 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-center">
          <ListBulletIcon className="w-12 h-12 mx-auto mb-3 text-cosmic-500/50" />
          <h4 className="font-medium mb-2">Improve Your Bullet Points</h4>
          <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-md mx-auto">
            Enter a target role above to get AI-powered bullet point improvements tailored to your desired position.
          </p>
        </div>
      )}

      {resumeData.experience.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-[var(--muted-foreground)]">Experience</h4>
          {resumeData.experience.map(exp => (
            <BulletSection
              key={exp.id}
              id={exp.id}
              label={`${exp.position} at ${exp.company}`}
              bullets={exp.description}
              improved={improvedBullets[exp.id]}
              isLoading={loading[exp.id]}
              error={errors[exp.id]}
              onImprove={() => { clearError(exp.id); handleImproveBullets('experience', exp.id, exp.description, `${exp.position} at ${exp.company}`) }}
              onApply={() => handleApplyBullets('experience', exp.id)}
              canAnalyze={!!canAnalyze}
            />
          ))}
        </div>
      )}

      {resumeData.projects.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-[var(--muted-foreground)]">Projects</h4>
          {resumeData.projects.map(proj => (
            <BulletSection
              key={proj.id}
              id={proj.id}
              label={proj.name}
              bullets={proj.highlights}
              improved={improvedBullets[proj.id]}
              isLoading={loading[proj.id]}
              error={errors[proj.id]}
              onImprove={() => { clearError(proj.id); handleImproveBullets('projects', proj.id, proj.highlights, proj.description) }}
              onApply={() => handleApplyBullets('projects', proj.id)}
              canAnalyze={!!canAnalyze}
            />
          ))}
        </div>
      )}

      {resumeData.experience.length === 0 && resumeData.projects.length === 0 && canAnalyze && (
        <div className="p-6 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-center">
          <ListBulletIcon className="w-12 h-12 mx-auto mb-3 text-cosmic-500/50" />
          <h4 className="font-medium mb-2">No Experience or Projects</h4>
          <p className="text-sm text-[var(--muted-foreground)]">Add experience entries or projects to your resume first, then return here to improve their bullet points.</p>
        </div>
      )}
    </div>
  )
}

function BulletSection({ 
  id, label, bullets, improved, isLoading, error, onImprove, onApply, canAnalyze
}: {
  id: string
  label: string
  bullets: string[]
  improved: string[] | undefined
  isLoading: boolean
  error: string | null
  onImprove: () => void
  onApply: () => void
  canAnalyze: boolean
}) {
  return (
    <div key={id} className="border rounded-lg p-3 bg-[var(--card)]" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm truncate">{label}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onImprove}
          disabled={!canAnalyze || isLoading || bullets.length === 0}
          leftIcon={<SparklesIcon className="w-3 h-3" />}
        >
          {isLoading ? 'Improving...' : 'Improve'}
        </Button>
      </div>
      {bullets.length > 0 ? (
        <ul className="list-disc list-inside text-sm text-[var(--muted-foreground)] space-y-1 max-h-32 overflow-auto mb-2">
          {bullets.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      ) : (
        <p className="text-xs text-[var(--muted-foreground)] mb-2">No bullets to improve</p>
      )}
      {error && (
        <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-2" role="alert">
          {error}
        </div>
      )}
      {improved && (
        <div className="mt-2 space-y-2 animate-in slide-in-from-top-2">
          <Divider label="AI Suggestions" />
          <ul className="list-disc list-inside text-sm space-y-1 bg-[var(--muted)]/50 p-2 rounded max-h-40 overflow-auto">
            {improved.map((b, i) => (
              <li key={i} className="text-[var(--foreground)]">{b}</li>
            ))}
          </ul>
          <Button variant="primary" size="sm" onClick={onApply} leftIcon={<CheckIcon className="w-3 h-3" />}>
            Apply These Bullets
          </Button>
        </div>
      )}
    </div>
  )
}

function SkillsTab({ 
  resumeData,
  targetRole,
  jobDescription,
  suggestedSkills,
  loading,
  error,
  handleSuggestSkills,
  handleApplySkill,
  canAnalyze
}: {
  resumeData: ResumeData
  targetRole?: string
  jobDescription?: string
  suggestedSkills: SkillsSuggestion | null
  loading: boolean
  error: string | null
  handleSuggestSkills: () => void
  handleApplySkill: (skill: string) => void
  canAnalyze: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Skills Suggestions</h3>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleSuggestSkills} 
          loading={loading}
          disabled={!canAnalyze}
          leftIcon={<SparklesIcon className="w-4 h-4" />}
        >
          Analyze & Suggest
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {suggestedSkills && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h4 className="font-medium text-sm text-[var(--muted-foreground)] mb-2">Your Current Skills</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedSkills.existing.map(skill => (
                <Badge key={skill} variant="success" size="sm">{skill}</Badge>
              ))}
              {suggestedSkills.existing.length === 0 && (
                <span className="text-sm text-[var(--muted-foreground)]">No skills added yet</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-[var(--muted-foreground)] mb-2">Recommended Skills</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedSkills.recommended.map(skill => (
                <Badge 
                  key={skill} 
                  variant="cosmic" 
                  size="sm" 
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => handleApplySkill(skill)}
                >
                  + {skill}
                </Badge>
              ))}
              {suggestedSkills.recommended.length === 0 && (
                <span className="text-sm text-[var(--muted-foreground)]">No additional recommendations</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-[var(--muted-foreground)] mb-2">By Category</h4>
            <div className="space-y-2">
              {Object.entries(suggestedSkills.categories).map(([cat, skills]) => (
                skills.length > 0 && (
                  <div key={cat} className="border rounded-lg p-3" style={{ borderColor: 'var(--border)' }}>
                    <h5 className="font-medium text-xs capitalize mb-2">{cat.replace('_', ' ')}</h5>
                    <div className="flex flex-wrap gap-1">
                      {skills.map(s => (
                        <Badge key={s} variant="default" size="sm">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}

      {!suggestedSkills && !loading && (
        <div className="p-6 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-center">
          <CpuChipIcon className="w-12 h-12 mx-auto mb-3 text-cosmic-500/50" />
          <h4 className="font-medium mb-2">Get Skill Recommendations</h4>
          <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-md mx-auto">
            The AI will analyze your background and target role to suggest relevant skills organized by category.
          </p>
          {!canAnalyze && (
            <p className="text-xs text-cosmic-500">Enter a target role above to enable analysis.</p>
          )}
        </div>
      )}
    </div>
  )
}

function RefineTab({ 
  resumeData,
  targetRole,
  jobDescription,
  improveTarget,
  setImproveTarget,
  improvedText,
  setImprovedText,
  loading,
  errors,
  refineTone,
  setRefineTone,
  handleImproveText,
  handleApplyImprovedText,
  canAnalyze,
  setErrorState
}: {
  resumeData: ResumeData
  targetRole?: string
  jobDescription?: string
  improveTarget: { sectionType: 'summary' | 'experience' | 'projects', id: string, originalContent: string, label: string } | null
  setImproveTarget: React.Dispatch<React.SetStateAction<{ sectionType: 'summary' | 'experience' | 'projects', id: string, originalContent: string, label: string } | null>>
  improvedText: ImprovedText | null
  setImprovedText: React.Dispatch<React.SetStateAction<ImprovedText | null>>
  loading: Record<string, boolean>
  errors: Record<string, string | null>
  refineTone: 'concise' | 'professional' | 'target-role' | 'alternatives'
  setRefineTone: (t: 'concise' | 'professional' | 'target-role' | 'alternatives') => void
  handleImproveText: (field: string, value: string, type: 'summary' | 'experience' | 'projects', tone: 'concise' | 'professional' | 'target-role' | 'alternatives') => void
  handleApplyImprovedText: () => void
  canAnalyze: boolean
  setErrorState: (key: 'refine', value: Record<string, string | null>) => void
}) {
  const clearError = (field: string) => {
    setErrorState('refine', { ...errors, [field]: null })
  }

  const sections = useMemo(() => [
    { field: 'summary', value: resumeData.summary, label: 'Professional Summary', type: 'summary' as const },
    ...resumeData.experience.map(e => ({ 
      field: `experience-${e.id}`, 
      value: e.description.join('\n'), 
      label: `Experience: ${e.position}`, 
      type: 'experience' as const 
    })),
    ...resumeData.projects.map(p => ({ 
      field: `project-${p.id}`, 
      value: p.description, 
      label: `Project: ${p.name}`, 
      type: 'projects' as const 
    })),
  ], [resumeData])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Writing Assistant</h3>
        <Select
          value={refineTone}
          onChange={(e) => setRefineTone(e.target.value as 'concise' | 'professional' | 'target-role' | 'alternatives')}
          options={[
            { value: 'professional', label: 'Professional' },
            { value: 'concise', label: 'Concise' },
            { value: 'target-role', label: 'Target Role' },
            { value: 'alternatives', label: 'Alternatives' },
          ]}
          className="w-40"
          disabled={loading.summary || Object.values(loading).some(Boolean)}
        />
      </div>

      {!canAnalyze && (
        <div className="p-4 rounded-lg bg-[var(--muted)]/50 border border-[var(--border)] text-center">
          <PencilIcon className="w-8 h-8 mx-auto mb-2 text-cosmic-500/50" />
          <h4 className="font-medium mb-2">Refine Your Resume Text</h4>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Enter a target role above to enable AI-powered text improvements.
          </p>
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {sections.map(item => (
          item.value && (
            <Button
              key={item.field}
              variant="ghost"
              className="justify-start h-auto py-3 text-left"
              onClick={() => { clearError(item.field); handleImproveText(item.field, item.value, item.type, refineTone) }}
              disabled={!canAnalyze || loading[item.field] || Object.values(loading).some(v => v)}
            >
              <div className="w-full">
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">{item.value.slice(0, 80)}...</p>
              </div>
              <SparklesIcon className="w-4 h-4 flex-shrink-0" />
            </Button>
          )
        ))}
      </div>

      {improveTarget && improvedText && (
        <div className="border rounded-lg p-4 bg-[var(--muted)]/50 animate-in slide-in-from-top-2" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Improved: {improveTarget.label}</h4>
            <Button variant="ghost" size="sm" onClick={() => { setImprovedText(null); setImproveTarget(null) }}>
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>
          
          <Textarea
            value={improvedText.improved}
            onChange={(e) => setImprovedText((prev: ImprovedText | null) => prev ? { ...prev, improved: e.target.value } : null)}
            rows={4}
            className="mb-3"
          />
          
          {improvedText.alternatives.length > 0 && (
            <div className="mb-3">
              <h5 className="font-medium text-sm mb-2">Alternatives</h5>
              <div className="space-y-1">
                {improvedText.alternatives.map((alt, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-auto py-2"
                    onClick={() => setImprovedText((prev: ImprovedText | null) => prev ? { ...prev, improved: alt } : null)}
                  >
                    {alt}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => { setImprovedText(null); setImproveTarget(null) }}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleApplyImprovedText} leftIcon={<CheckIcon className="w-4 h-4" />}>
              Apply Improvement
            </Button>
          </div>
        </div>
      )}

      {!improveTarget && !improvedText && canAnalyze && sections.some(s => s.value) && (
        <div className="p-6 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-center">
          <PencilIcon className="w-10 h-10 mx-auto mb-3 text-cosmic-500/50" />
          <h4 className="font-medium mb-2">Select a Section to Improve</h4>
          <p className="text-sm text-[var(--muted-foreground)]">Click any section above to get AI-powered improvements with your chosen tone.</p>
        </div>
      )}
    </div>
  )
}

function ATSTab({ 
  resumeData,
  targetRole,
  jobDescription,
  atsFeedback,
  loading,
  error,
  handleGetATSFeedback,
  handleApplySkill,
  canAnalyze
}: {
  resumeData: ResumeData
  targetRole?: string
  jobDescription?: string
  atsFeedback: ATSFeedback | null
  loading: boolean
  error: string | null
  handleGetATSFeedback: () => void
  handleApplySkill: (skill: string) => void
  canAnalyze: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">ATS Keyword Analysis</h3>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleGetATSFeedback} 
          loading={loading}
          disabled={!canAnalyze || !jobDescription}
          leftIcon={<SparklesIcon className="w-4 h-4" />}
        >
          {atsFeedback ? 'Re-analyze' : 'Analyze'}
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {!jobDescription && !atsFeedback && (
        <div className="p-6 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-center">
          <ShieldCheckIcon className="w-12 h-12 mx-auto mb-3 text-cosmic-500/50" />
          <h4 className="font-medium mb-2">ATS Analysis Requires Job Description</h4>
          <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-md mx-auto">
            Paste a job description in the input above to compare your resume against specific requirements and get keyword matching insights.
          </p>
          {!canAnalyze && (
            <p className="text-xs text-cosmic-500">Also enter a target role to enable analysis.</p>
          )}
        </div>
      )}

      {atsFeedback && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card variant="glass" padding="md" className="text-center">
              <div className="text-3xl font-bold text-cosmic-500">{atsFeedback.score}%</div>
              <div className="text-sm text-[var(--muted-foreground)]">Keyword Match</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {atsFeedback.matchedKeywords.length}/{atsFeedback.matchedKeywords.length + atsFeedback.missingKeywords.length} keywords
              </div>
            </Card>
            <Card variant="glass" padding="md" className="text-center">
              <div className="text-3xl font-bold text-green-500">{atsFeedback.matchedKeywords.length}</div>
              <div className="text-sm text-[var(--muted-foreground)]">Matched</div>
            </Card>
            <Card variant="glass" padding="md" className="text-center">
              <div className="text-3xl font-bold text-red-500">{atsFeedback.missingKeywords.length}</div>
              <div className="text-sm text-[var(--muted-foreground)]">Missing</div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card variant="glass" padding="md">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <h4 className="font-medium">Matched Keywords ({atsFeedback.matchedKeywords.length})</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {atsFeedback.matchedKeywords.length > 0 ? (
                  atsFeedback.matchedKeywords.map(kw => (
                    <Badge key={kw} variant="success" size="sm">{kw}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">No matched keywords</p>
                )}
              </div>
            </Card>

            <Card variant="glass" padding="md">
              <div className="flex items-center gap-2 mb-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                <h4 className="font-medium">Missing Keywords ({atsFeedback.missingKeywords.length})</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {atsFeedback.missingKeywords.length > 0 ? (
                  atsFeedback.missingKeywords.slice(0, 20).map(kw => (
                    <Badge key={kw} variant="danger" size="sm">{kw}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">No missing keywords</p>
                )}
                {atsFeedback.missingKeywords.length > 20 && (
                  <Badge variant="default" size="sm">+{atsFeedback.missingKeywords.length - 20} more</Badge>
                )}
              </div>
            </Card>

            <Card variant="glass" padding="md">
              <div className="flex items-center gap-2 mb-3">
                <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                <h4 className="font-medium">Suggested to Add ({atsFeedback.suggestions.length})</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {atsFeedback.suggestions.length > 0 ? (
                  atsFeedback.suggestions.map(kw => (
                    <Badge key={kw} variant="warning" size="sm" className="cursor-pointer hover:opacity-80" onClick={() => handleApplySkill(kw)}>
                      + {kw}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">No suggestions</p>
                )}
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                These keywords appear in the job description but not in your resume. Consider adding them naturally.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}