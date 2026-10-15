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
} from '@heroicons/react/24/outline'
import { useAISuggestions } from '@/hooks/useAISuggestions'
import { ResumeData, Experience, Project } from '@/types'
import { Button, Card, Input, Textarea, Badge, Modal, Divider, Select } from '@/components/ui'
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
}

// Priority levels
type Priority = 'high' | 'medium' | 'low'

interface Suggestion {
  id: string
  title: string
  description: string
  category: string
  priority: Priority
  actionType: 'apply' | 'edit' | 'navigate' | 'add'
  actionLabel: string
  sectionType?: 'summary' | 'experience' | 'projects' | 'skills'
  sectionId?: string
  originalContent?: string
}

interface CompletenessCheck {
  id: string
  title: string
  description: string
  passed: boolean
  priority: Priority
  actionLabel: string
  sectionType?: 'summary' | 'experience' | 'skills'
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

export function AISuggestionsPanel({ 
  resumeData, 
  targetRole, 
  jobDescription, 
  onApplySummary,
  onApplyBullets,
  onApplySkills,
  onApplyText
}: AISuggestionsPanelProps) {
  const [activeTab, setActiveTab] = useState<'completeness' | 'summary' | 'bullets' | 'skills' | 'refine' | 'ats'>('completeness')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completenessScore, setCompletenessScore] = useState(0)
  const [completenessChecks, setCompletenessChecks] = useState<CompletenessCheck[]>([])
  const [suggestedSummary, setSuggestedSummary] = useState<string | null>(null)
  const [suggestedSkills, setSuggestedSkills] = useState<SkillsSuggestion | null>(null)
  const [improvedBullets, setImprovedBullets] = useState<Record<string, string[]>>({})
  const [improveTarget, setImproveTarget] = useState<{ sectionType: 'experience' | 'projects', id: string, originalContent: string, label: string } | null>(null)
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

  const toggleExpand = (key: string) => {
    setExpandStates(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const calculateCompleteness = useCallback(() => {
    const checks: CompletenessCheck[] = []
    let passedCount = 0

    // Check summary
    const hasSummary = !!(resumeData.summary && resumeData.summary.trim().length > 50)
    checks.push({
      id: 'summary',
      title: 'Professional Summary',
      description: hasSummary ? 'Well-written summary present' : 'Add a compelling professional summary (50+ chars)',
      passed: hasSummary,
      priority: 'high',
      actionLabel: 'Generate Summary',
      sectionType: 'summary'
    })
    if (hasSummary) passedCount++

    // Check experience
    const hasExperience = resumeData.experience.length > 0
    const hasDetailedExperience = resumeData.experience.some(e => e.description.length > 0)
    checks.push({
      id: 'experience',
      title: 'Work Experience',
      description: hasDetailedExperience ? 'Detailed experience with bullets' : hasExperience ? 'Experience entries need bullet points' : 'Add work experience',
      passed: hasDetailedExperience,
      priority: 'high',
      actionLabel: hasExperience ? 'Improve Bullets' : 'Add Experience',
      sectionType: 'experience'
    })
    if (hasDetailedExperience) passedCount++

    // Check skills
    const hasSkills = resumeData.skills.length > 0
    checks.push({
      id: 'skills',
      title: 'Skills',
      description: hasSkills ? `${resumeData.skills.length} skills listed` : 'Add relevant skills',
      passed: hasSkills,
      priority: 'high',
      actionLabel: 'Suggest Skills',
      sectionType: 'skills'
    })
    if (hasSkills) passedCount++

    // Check education
    const hasEducation = resumeData.education.length > 0
    checks.push({
      id: 'education',
      title: 'Education',
      description: hasEducation ? 'Education listed' : 'Add education background',
      passed: hasEducation,
      priority: 'medium',
      actionLabel: 'Add Education'
    })
    if (hasEducation) passedCount++

    // Check projects
    const hasProjects = resumeData.projects.length > 0
    checks.push({
      id: 'projects',
      title: 'Projects',
      description: hasProjects ? `${resumeData.projects.length} projects showcased` : 'Add projects to demonstrate experience',
      passed: hasProjects,
      priority: 'medium',
      actionLabel: 'Add Projects'
    })
    if (hasProjects) passedCount++

    // Check contact info
    const hasContact = !!(resumeData.personal.email && resumeData.personal.phone)
    checks.push({
      id: 'contact',
      title: 'Contact Information',
      description: hasContact ? 'Complete contact details' : 'Add email and phone number',
      passed: hasContact,
      priority: 'high',
      actionLabel: 'Update Contact Info'
    })
    if (hasContact) passedCount++

    const score = Math.round((passedCount / checks.length) * 100)
    setCompletenessScore(score)
    setCompletenessChecks(checks)
  }, [resumeData])

  // Auto-calculate completeness on mount and when resume data changes
  useEffect(() => {
    calculateCompleteness()
  }, [calculateCompleteness])

  const handleAnalyze = useCallback(async () => {
    if (!targetRole && !jobDescription) return
    setLoading(true)
    setError(null)
    try {
      // Use improveText with a special prompt to get comprehensive suggestions
      // For now, we'll rely on the local completeness calculation
      // and the other AI functions for specific improvements
      toast.success('Analysis complete!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions')
      toast.error('Failed to generate AI suggestions')
    } finally {
      setLoading(false)
    }
  }, [resumeData, targetRole, jobDescription])

  const handleGenerateSummary = useCallback(async () => {
    setLoading(true)
    try {
      const summary = await generateSummary(resumeData, targetRole, jobDescription)
      if (summary) {
        setSuggestedSummary(summary)
      }
    } catch (err) {
      toast.error('Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }, [resumeData, targetRole, jobDescription, generateSummary])

  const handleImproveBullets = useCallback(async (sectionType: 'experience' | 'projects', id: string, bullets: string[], label: string) => {
    setLoading(true)
    setImproveTarget({ sectionType, id, originalContent: bullets.join('\n'), label })
    try {
      const improved = await improveBullets(bullets, label, targetRole, jobDescription)
      if (improved) {
        setImprovedBullets(prev => ({ ...prev, [id]: improved }))
      }
    } catch (err) {
      toast.error('Failed to improve bullets')
    } finally {
      setLoading(false)
    }
  }, [improveBullets, targetRole, jobDescription])

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
    setLoading(true)
    try {
      const skills = await suggestSkills(resumeData, targetRole, jobDescription)
      if (skills) {
        setSuggestedSkills(skills)
      }
    } catch (err) {
      toast.error('Failed to suggest skills')
    } finally {
      setLoading(false)
    }
  }, [resumeData, targetRole, jobDescription, suggestSkills])

  const handleApplySkill = useCallback((skill: string) => {
    onApplySkills([skill])
    toast.success(`Added "${skill}" to skills`)
  }, [onApplySkills])

  const handleImproveText = useCallback(async (field: string, value: string, type: 'summary' | 'experience' | 'projects', tone: 'concise' | 'professional' | 'target-role' | 'alternatives') => {
    setLoading(true)
    setImproveTarget({ sectionType: type as any, id: field, originalContent: value, label: field })
    try {
      const improved = await improveText(value, tone, targetRole, jobDescription)
      if (improved) {
        setImprovedText({ ...improved, field, original: value })
      }
    } catch (err) {
      toast.error('Failed to improve text')
    } finally {
      setLoading(false)
    }
  }, [improveText, targetRole, jobDescription])

  const handleApplyImprovedText = useCallback(() => {
    if (improvedText && improveTarget) {
      onApplyText(improveTarget.id, improvedText.improved)
      setImprovedText(null)
      setImproveTarget(null)
      toast.success('Text improved!')
    }
  }, [improvedText, improveTarget, onApplyText])

  const handleGetATSFeedback = useCallback(async () => {
    setLoading(true)
    try {
      const feedback = await getATSFeedback(resumeData, targetRole, jobDescription)
      if (feedback) {
        setAtsFeedback(feedback)
      }
    } catch (err) {
      toast.error('Failed to analyze ATS')
    } finally {
      setLoading(false)
    }
  }, [resumeData, targetRole, jobDescription, getATSFeedback])

  const getPriorityLabel = (priority: Priority) => {
    return priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low'
  }

  if (!targetRole && !jobDescription) {
    return (
      <Card variant="glass" padding="lg" className="text-center">
        <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-cosmic-500/50" />
        <h3 className="text-lg font-semibold mb-2">AI Suggestions Ready</h3>
        <p className="text-[var(--muted-foreground)] mb-4">
          Enter a target job title or job description to unlock personalized AI suggestions.
        </p>
        <div className="flex gap-2 justify-center">
          <Input
            placeholder="Target job title (e.g., Senior Software Engineer)"
            value={targetRole || ''}
            onChange={(e) => {}}
            className="w-64"
          />
        </div>
      </Card>
    )
  }

  return (
    <Card variant="glass" padding="lg">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-500 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">AI Suggestions</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Target: {targetRole || 'Custom JD'} {loading && <span className="ml-2 text-cosmic-500">⟳</span>}
                <Badge variant="cosmic" size="sm" className="ml-2">{completenessScore}% Complete</Badge>
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
            {error.includes('not configured') && (
              <p className="mt-1 text-xs">Configure OPENAI_API_KEY in Supabase Edge Function secrets.</p>
            )}
          </div>
        )}

        {/* Tabs - horizontally scrollable on mobile */}
        <div className="flex gap-1 bg-[var(--muted)] rounded-lg p-1 overflow-x-auto pb-2 -mb-2" role="tablist" style={{ scrollbarWidth: 'thin' }}>
          {([
            { id: 'completeness', label: 'Completeness', icon: CheckCircleIcon },
            { id: 'summary', label: 'Summary', icon: DocumentTextIcon },
            { id: 'bullets', label: 'Bullets', icon: ListBulletIcon },
            { id: 'skills', label: 'Skills', icon: CpuChipIcon },
            { id: 'refine', label: 'Refine', icon: PencilIcon },
            { id: 'ats', label: 'ATS', icon: ShieldCheckIcon },
          ] as const).map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {/* Completeness Tab */}
        {activeTab === 'completeness' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Resume Completeness</h4>
              <div className="flex items-center gap-2">
                <div className="w-16 h-16 rounded-full border-4 border-cosmic-500/20 flex items-center justify-center relative">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 32 32">
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
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-cosmic-500">{completenessScore}%</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {completenessChecks.map(check => (
                <Card 
                  key={check.id} 
                  variant="hover" 
                  padding="md" 
                  className={clsx(
                    'border-l-4 transition-all',
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm">{check.title}</h5>
                        <Badge 
                          variant={check.priority === 'high' ? 'danger' : check.priority === 'medium' ? 'warning' : 'info'} 
                          size="sm"
                        >
                          {getPriorityLabel(check.priority)}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">{check.description}</p>
                    </div>
                  </div>
                  {!check.passed && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 w-full justify-start text-red-500 hover:bg-red-500/10"
                      onClick={() => { setActiveTab(check.actionLabel.includes('Summary') ? 'summary' : check.actionLabel.includes('Experience') ? 'bullets' : check.actionLabel.includes('Skills') ? 'skills' : 'completeness') }}
                    >
                      {check.actionLabel}
                      <ChevronDownIcon className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </Card>
              ))}
            </div>

            {completenessScore === 100 && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                <CheckCircleIcon className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <h4 className="font-semibold text-green-700 dark:text-green-300">Excellent! Your resume is complete.</h4>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">All key sections are well-populated. Consider adding a target role for AI-powered improvements.</p>
              </div>
            )}
          </div>
        )}

        {/* Professional Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Professional Summary Generator</h4>
              <Button variant="secondary" size="sm" onClick={handleGenerateSummary} loading={loading} leftIcon={<SparklesIcon className="w-4 h-4" />}>
                Generate
              </Button>
            </div>

            {suggestedSummary && (
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-sm text-[var(--muted-foreground)] mb-2">AI Generated Summary</h5>
                  <Textarea
                    value={suggestedSummary}
                    onChange={(e) => setSuggestedSummary(e.target.value)}
                    rows={4}
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

            {!suggestedSummary && (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
                Click "Generate" to create an AI-powered professional summary tailored to your target role.
              </p>
            )}
          </div>
        )}

        {/* Experience/Project Bullets Tab */}
        {activeTab === 'bullets' && (
          <div className="space-y-4">
            <h4 className="font-medium">Bullet Point Improver</h4>
            
            {resumeData.experience.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-medium text-sm text-[var(--muted-foreground)]">Experience</h5>
                {resumeData.experience.map(exp => (
                  <div key={exp.id} className="border rounded-lg p-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{exp.position} at {exp.company}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleImproveBullets('experience', exp.id, exp.description, `${exp.position} at ${exp.company}`)}
                        disabled={loading || exp.description.length === 0}
                        leftIcon={<SparklesIcon className="w-3 h-3" />}
                      >
                        Improve
                      </Button>
                    </div>
                    {exp.description.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-[var(--muted-foreground)] space-y-1 max-h-24 overflow-auto">
                        {exp.description.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    ) : (
                      <p className="text-xs text-[var(--muted-foreground)]">No bullets to improve</p>
                    )}
                    {improvedBullets[exp.id] && (
                      <div className="mt-2 space-y-2">
                        <Divider label="AI Suggestions" />
                        <ul className="list-disc list-inside text-sm space-y-1 bg-[var(--muted)]/50 p-2 rounded">
                          {improvedBullets[exp.id].map((b, i) => (
                            <li key={i} className="text-[var(--foreground)]">{b}</li>
                          ))}
                        </ul>
                        <Button variant="primary" size="sm" onClick={() => handleApplyBullets('experience', exp.id)} leftIcon={<CheckIcon className="w-3 h-3" />}>
                          Apply These Bullets
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {resumeData.projects.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-medium text-sm text-[var(--muted-foreground)]">Projects</h5>
                {resumeData.projects.map(proj => (
                  <div key={proj.id} className="border rounded-lg p-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{proj.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleImproveBullets('projects', proj.id, proj.highlights, proj.description)}
                        disabled={loading || proj.highlights.length === 0}
                        leftIcon={<SparklesIcon className="w-3 h-3" />}
                      >
                        Improve
                      </Button>
                    </div>
                    {proj.highlights.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-[var(--muted-foreground)] space-y-1 max-h-24 overflow-auto">
                        {proj.highlights.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    ) : (
                      <p className="text-xs text-[var(--muted-foreground)]">No highlights to improve</p>
                    )}
                    {improvedBullets[proj.id] && (
                      <div className="mt-2 space-y-2">
                        <Divider label="AI Suggestions" />
                        <ul className="list-disc list-inside text-sm space-y-1 bg-[var(--muted)]/50 p-2 rounded">
                          {improvedBullets[proj.id].map((b, i) => (
                            <li key={i} className="text-[var(--foreground)]">{b}</li>
                          ))}
                        </ul>
                        <Button variant="primary" size="sm" onClick={() => handleApplyBullets('projects', proj.id)} leftIcon={<CheckIcon className="w-3 h-3" />}>
                          Apply These Highlights
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {resumeData.experience.length === 0 && resumeData.projects.length === 0 && (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
                Add experience or projects first to use the bullet improver.
              </p>
            )}
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Skills Suggestions</h4>
              <Button variant="secondary" size="sm" onClick={handleSuggestSkills} loading={loading} leftIcon={<SparklesIcon className="w-4 h-4" />}>
                Analyze & Suggest
              </Button>
            </div>

            {suggestedSkills && (
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-sm text-[var(--muted-foreground)] mb-2">Your Current Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.existing.map(skill => (
                      <Badge key={skill} variant="success" size="sm">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-sm text-[var(--muted-foreground)] mb-2">Recommended Skills</h5>
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
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-sm text-[var(--muted-foreground)] mb-2">By Category</h5>
                  <div className="space-y-2">
                    {Object.entries(suggestedSkills.categories).map(([cat, skills]) => (
                      skills.length > 0 && (
                        <div key={cat} className="border rounded-lg p-3" style={{ borderColor: 'var(--border)' }}>
                          <h6 className="font-medium text-xs capitalize mb-2">{cat.replace('_', ' ')}</h6>
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

            {!suggestedSkills && (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
                Click "Analyze & Suggest" to get AI-powered skill recommendations based on your background and target role.
              </p>
            )}
          </div>
        )}

        {/* Refine Text Tab */}
        {activeTab === 'refine' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Writing Assistant</h4>
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
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {[
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
              ].map(item => (
                item.value && (
                  <Button
                    key={item.field}
                    variant="ghost"
                    className="justify-start h-auto py-3"
                    onClick={() => handleImproveText(item.field, item.value, item.type, refineTone)}
                    disabled={loading}
                  >
                    <div className="w-full text-left">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">{item.value.slice(0, 60)}...</p>
                    </div>
                    <SparklesIcon className="w-4 h-4" />
                  </Button>
                )
              ))}
            </div>

            {improveTarget && improvedText && (
              <div className="border rounded-lg p-4 bg-[var(--muted)]/50" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium">Improved: {improveTarget.label}</h5>
                  <Button variant="ghost" size="sm" onClick={() => { setImprovedText(null); setImproveTarget(null) }}>
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
                
                <Textarea
                  value={improvedText.improved}
                  onChange={(e) => setImprovedText(prev => prev ? { ...prev, improved: e.target.value } : null)}
                  rows={4}
                  className="mb-3"
                />
                
                {improvedText.alternatives.length > 0 && (
                  <div className="mb-3">
                    <h6 className="font-medium text-sm mb-2">Alternatives</h6>
                    <div className="space-y-1">
                      {improvedText.alternatives.map((alt, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-auto py-2"
                          onClick={() => setImprovedText(prev => prev ? { ...prev, improved: alt } : null)}
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

            {!improveTarget && !improvedText && (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
                Click any section above to improve its text with AI.
              </p>
            )}
          </div>
        )}

        {/* ATS Feedback Tab */}
        {activeTab === 'ats' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">ATS Keyword Analysis</h4>
              <Button variant="secondary" size="sm" onClick={handleGetATSFeedback} loading={loading} leftIcon={<SparklesIcon className="w-4 h-4" />}>
                {atsFeedback ? 'Re-analyze' : 'Analyze'}
              </Button>
            </div>

            {atsFeedback && (
              <div className="space-y-4">
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
                      <h5 className="font-medium">Matched Keywords ({atsFeedback.matchedKeywords.length})</h5>
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
                      <h5 className="font-medium">Missing Keywords ({atsFeedback.missingKeywords.length})</h5>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {atsFeedback.missingKeywords.length > 0 ? (
                        atsFeedback.missingKeywords.slice(0, 15).map(kw => (
                          <Badge key={kw} variant="danger" size="sm">{kw}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-[var(--muted-foreground)]">No missing keywords</p>
                      )}
                      {atsFeedback.missingKeywords.length > 15 && (
                        <Badge variant="default" size="sm">+{atsFeedback.missingKeywords.length - 15} more</Badge>
                      )}
                    </div>
                  </Card>

                  <Card variant="glass" padding="md">
                    <div className="flex items-center gap-2 mb-3">
                      <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                      <h5 className="font-medium">Suggested to Add ({atsFeedback.suggestions.length})</h5>
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

            {!atsFeedback && (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
                Click "Analyze" to compare your resume against the target job description and get keyword matching insights.
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}