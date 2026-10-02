import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { 
  ArrowLeftIcon, 
  DocumentMagnifyingGlassIcon,
  CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon,
  PlusIcon, MinusIcon,
  DocumentTextIcon, ChartBarIcon, LightBulbIcon,
  MagnifyingGlassIcon, ArrowPathIcon,
  ArrowDownTrayIcon, ShareIcon,
} from '@heroicons/react/24/solid'
import { 
  ArrowLeftIcon as ArrowLeftOutline,
  CheckCircleIcon as CheckCircleOutline,
  XCircleIcon as XCircleOutline,
  ExclamationTriangleIcon as ExclamationTriangleOutline,
} from '@heroicons/react/24/outline'
import { useResume } from '@/contexts/ResumeContext'
import { useTheme } from '@/contexts/ThemeContext'
import { calculateATSScore, extractKeywords } from '@/utils/atsScorer'
import { Button, Card, Badge, Modal, Textarea, Progress, Select, Input, Divider, Toggle } from '@/components/ui'
import { FloatingParticles, MorphingBlobs, PageTransition, StaggerContainer } from '@/components/animations/BlackHoleAnimation'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

interface ATSCheckerPageProps {}

export function ATSCheckerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { 
    currentResume, 
    resumes, 
    updateResume 
  } = useResume()
  const { resolvedTheme } = useTheme()
  
  const [jobDescription, setJobDescription] = useState('')
  const [showJobDesc, setShowJobDesc] = useState(true)
  const [result, setResult] = useState<ReturnType<typeof calculateATSScore> | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'keywords' | 'suggestions'>('overview')
  const [lastAnalyzedResumeId, setLastAnalyzedResumeId] = useState<string | null>(null)
  
  const analysisRef = useRef<HTMLDivElement>(null)

  // Get current resume
  const resume = currentResume || (id ? resumes.find(r => r.id === id) : null) || resumes[0] || null

  // Auto-analyze when resume changes
  useEffect(() => {
    if (resume && resume.id !== lastAnalyzedResumeId) {
      runAnalysis()
      setLastAnalyzedResumeId(resume.id)
    }
  }, [resume, lastAnalyzedResumeId, jobDescription])

  const runAnalysis = useCallback(() => {
    if (!resume) return
    
    setIsAnalyzing(true)
    // Small delay to show loading state
    setTimeout(() => {
      const analysis = calculateATSScore(resume.data, jobDescription || undefined)
      setResult(analysis)
      setIsAnalyzing(false)
      toast.success('ATS analysis complete')
    }, 500)
  }, [resume, jobDescription])

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value)
  }

  const clearJobDescription = () => {
    setJobDescription('')
  }

  const exportReport = () => {
    if (!result || !resume) return
    
    const report = {
      resumeTitle: resume.title,
      resumeId: resume.id,
      analyzedAt: new Date().toISOString(),
      jobDescription: jobDescription || null,
      ...result,
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ats-report-${resume.title.replace(/\s+/g, '-')}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Report exported')
  }

  if (!resume) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="absolute inset-0 z-0 overflow-hidden">
          <MorphingBlobs />
          <FloatingParticles count={40} />
        </div>
        <PageTransition>
          <Card variant="glass" padding="lg" className="max-w-md text-center relative z-10">
            <DocumentMagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4 text-cosmic-500" />
            <h2 className="text-2xl font-bold mb-2">No Resume Selected</h2>
            <p className="text-[var(--muted-foreground)] mb-6">
              Create or select a resume from the Dashboard to analyze it.
            </p>
            <Button variant="primary" onClick={() => navigate('/dashboard')} leftIcon={<ArrowLeftOutline className="w-4 h-4" />}>
              Go to Dashboard
            </Button>
          </Card>
        </PageTransition>
      </div>
    )
  }

  const scoreColor = result 
    ? result.score >= 80 ? 'text-green-500' 
    : result.score >= 60 ? 'text-yellow-500' 
    : result.score >= 40 ? 'text-orange-500' 
    : 'text-red-500'
    : 'text-[var(--muted-foreground)]'

  return (
    <div className="min-h-screen relative block w-full" style={{ background: 'var(--background)' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <MorphingBlobs />
        <FloatingParticles count={40} />
      </div>

      {/* Top Toolbar */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-full mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              leftIcon={<ArrowLeftOutline className="w-4 h-4" />}
              className="hidden sm:flex"
            >
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="sm:hidden p-2"
            >
              <ArrowLeftOutline className="w-5 h-5" />
            </Button>
            
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>ATS Checker</h1>
              <p className="text-xs text-[var(--muted-foreground)]">{resume.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Toggle
              checked={showJobDesc}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowJobDesc(e.target.checked)}
              label={showJobDesc ? 'Job Description: On' : 'Job Description: Off'}
              description="Compare resume against job description"
            />
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={runAnalysis}
              disabled={isAnalyzing}
              leftIcon={<ArrowPathIcon className="w-4 h-4" />}
            >
              Re-analyze
            </Button>

            <Button 
              variant="primary" 
              size="sm"
              onClick={exportReport}
              disabled={!result}
              leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
            >
              Export Report
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full p-4 lg:p-6 overflow-y-auto">
        <div className="w-full max-w-[1400px] mx-auto">
          {/* Resume Header & Score */}
          <PageTransition>
            <Card variant="glass" padding="lg" className="mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{resume.title}</h2>
                  <p className="text-[var(--muted-foreground)]">Template: {resume.template_id} • Last updated: {new Date(resume.updated_at).toLocaleDateString()}</p>
                </div>
                
                {result && (
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    {/* Score Circle */}
                    <div className="relative w-28 h-28 flex-shrink-0">
                      <svg className="w-28 h-28 transform -rotate-90">
                        <circle
                          cx="56" cy="56" r="50"
                          fill="none"
                          stroke="var(--muted)"
                          strokeWidth="8"
                        />
                        <circle
                          cx="56" cy="56" r="50"
                          fill="none"
                          stroke={result.score >= 80 ? 'green' : result.score >= 60 ? 'yellow' : result.score >= 40 ? 'orange' : 'red'}
                          strokeWidth="8"
                          strokeDasharray={`${2 * Math.PI * 50}`}
                          strokeDashoffset={`${2 * Math.PI * 50 * (1 - result.score / 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold" style={{ color: `var(--${result.score >= 80 ? 'green' : result.score >= 60 ? 'yellow' : result.score >= 40 ? 'orange' : 'red'}-500)` }}>
                          {result.score}
                        </span>
                        <span className="text-xs font-medium">/100</span>
                      </div>
                    </div>
                    
                    <div className="text-center lg:text-left">
                      <p className="text-sm text-[var(--muted-foreground)]">ATS Compatibility Score</p>
                      <p className={`text-2xl font-bold ${scoreColor}`}>
                        {result.score >= 80 ? 'Excellent' : result.score >= 60 ? 'Good' : result.score >= 40 ? 'Needs Work' : 'Poor'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </PageTransition>

          {/* Job Description Input */}
          {showJobDesc && (
            <PageTransition>
              <Card variant="glass" padding="lg" className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Job Description (Optional)</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearJobDescription}
                    disabled={!jobDescription}
                    leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
                  >
                    Clear
                  </Button>
                </div>
                <Textarea
                  value={jobDescription}
                  onChange={handleJobDescriptionChange}
                  placeholder="Paste a job description here to compare your resume against specific requirements. The ATS checker will extract keywords and show match percentages."
                  rows={4}
                />
                {jobDescription && (
                  <div className="mt-3 flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                    <span>{extractKeywords(jobDescription).length} keywords extracted</span>
                    <span>{jobDescription.split(/\s+/).length} words</span>
                  </div>
                )}
              </Card>
            </PageTransition>
          )}

          {/* Analysis Results */}
          {(() => {
            if (!result) {
              return (
                <PageTransition>
                  <Card variant="glass" padding="lg" className="max-w-2xl mx-auto text-center">
                    <DocumentMagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4 text-cosmic-500" />
                    <h3 className="text-2xl font-bold mb-2">Ready to Analyze</h3>
                    <p className="text-[var(--muted-foreground)] mb-6">
                      Click "Re-analyze" or add a job description to run the ATS compatibility check on your resume.
                    </p>
                    <Button variant="primary" size="lg" onClick={runAnalysis} disabled={isAnalyzing} leftIcon={<ArrowPathIcon className="w-4 h-4" />}>
                      {isAnalyzing ? 'Analyzing...' : 'Run ATS Check'}
                    </Button>
                  </Card>
                </PageTransition>
              );
            }

            return (
              <div>
                {/* Tab Navigation */}
              <PageTransition>
                <Card variant="glass" padding="none" className="mb-6 overflow-hidden">
                  <div className="flex border-b border-[var(--border)]">
                    {([
                      { id: 'overview', label: 'Overview', icon: <DocumentTextIcon className="w-4 h-4" /> },
                      { id: 'sections', label: 'Sections', icon: <ChartBarIcon className="w-4 h-4" /> },
                      { id: 'keywords', label: 'Keywords', icon: <MagnifyingGlassIcon className="w-4 h-4" /> },
                      { id: 'suggestions', label: 'Suggestions', icon: <LightBulbIcon className="w-4 h-4" /> },
                    ] as const).map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                          'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 -mb-px',
                          activeTab === tab.id
                            ? 'border-cosmic-500 text-cosmic-500 bg-cosmic-500/5'
                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                        )}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </Card>
              </PageTransition>

              {/* Tab Content */}
              {activeTab === 'overview' && result && (
                <PageTransition>
                  <div className="grid gap-6 lg:grid-cols-3 mb-6">
                    {/* Score Breakdown */}
                    <Card variant="glass" padding="lg" className="lg:col-span-2">
                      <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
                      <div className="space-y-4">
                        {result.sections.map(section => (
                          <div key={section.name}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{section.name}</span>
                              <span className={`font-bold ${section.score >= 80 ? 'text-green-500' : section.score >= 60 ? 'text-yellow-500' : section.score >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
                                {section.score}%
                              </span>
                            </div>
                            <Progress value={section.score} max={100} size="md" variant={section.score >= 80 ? 'success' : section.score >= 60 ? 'warning' : section.score >= 40 ? 'warning' : 'default'} />
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">{section.feedback[0] || ''}</p>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Quick Stats */}
                    <Card variant="glass" padding="lg">
                      <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                      <div className="space-y-3">
                        <StatItem label="Word Count" value={result.readability.wordCount} />
                        <StatItem label="Reading Level" value={result.readability.gradeLevel} />
                        <StatItem label="Sections Complete" value={`${result.sections.filter(s => s.score >= 60).length}/${result.sections.length}`} />
                        <StatItem label="Matched Keywords" value={`${result.keywords.found.length}/${result.keywords.found.length + result.keywords.missing.length}`} />
                        <StatItem label="Missing Keywords" value={result.keywords.missing.length} />
                        <StatItem label="Suggestions" value={result.suggestions.length} />
                      </div>
                    </Card>
                  </div>

                  {/* Strengths & Missing */}
                  <StaggerContainer stagger={0.1} direction="up">
                    <div className="grid gap-6 lg:grid-cols-2 mb-6">
                      <Card variant="glass" padding="lg">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <CheckCircleOutline className="w-5 h-5 text-green-500" />
                          </div>
                          <h3 className="text-lg font-semibold">Strengths</h3>
                        </div>
                        <ul className="space-y-2">
                          {result.sections.filter(s => s.score >= 80).length > 0 ? (
                            result.sections.filter(s => s.score >= 80).map(s => (
                              <li key={s.name} className="flex items-center gap-2 text-sm">
                                <CheckCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>{s.name}: {s.feedback[0]}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-[var(--muted-foreground)]">Run analysis to see strengths</li>
                          )}
                        </ul>
                      </Card>

                      <Card variant="glass" padding="lg">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <XCircleOutline className="w-5 h-5 text-red-500" />
                          </div>
                          <h3 className="text-lg font-semibold">Missing / Weak Areas</h3>
                        </div>
                        <ul className="space-y-2">
                          {result.sections.filter(s => s.score < 60).length > 0 ? (
                            result.sections.filter(s => s.score < 60).map(s => (
                              <li key={s.name} className="flex items-center gap-2 text-sm">
                                <XCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <span>{s.name}: {s.feedback[0] || 'Needs improvement'}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-[var(--muted-foreground)]">No critical gaps found!</li>
                          )}
                        </ul>
                      </Card>
                    </div>
                  </StaggerContainer>
                </PageTransition>
              )}

              {activeTab === 'sections' && result && (
                <PageTransition>
                  <StaggerContainer stagger={0.05} direction="up">
                    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 mb-6">
                      {result.sections.map(section => (
                        <SectionDetailCard key={section.name} section={section} />
                      ))}
                    </div>
                  </StaggerContainer>
                </PageTransition>
              )}

              {activeTab === 'keywords' && result && (
                <PageTransition>
                  <StaggerContainer stagger={0.05} direction="up">
                    <div className="grid gap-6 lg:grid-cols-2 mb-6">
                      {/* Matched Keywords */}
                      <Card variant="glass" padding="lg">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <CheckCircleOutline className="w-5 h-5 text-green-500" />
                          </div>
                          <h3 className="text-lg font-semibold">Matched Keywords ({result.keywords.found.length})</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.keywords.found.length > 0 ? (
                            result.keywords.found.map(kw => (
                              <Badge key={kw} variant="success" size="sm">{kw}</Badge>
                            ))
                          ) : (
                            <p className="text-[var(--muted-foreground)]">No matched keywords. Add a job description to compare.</p>
                          )}
                        </div>
                      </Card>

                      {/* Missing Keywords */}
                      <Card variant="glass" padding="lg">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <XCircleOutline className="w-5 h-5 text-red-500" />
                          </div>
                          <h3 className="text-lg font-semibold">Missing Keywords ({result.keywords.missing.length})</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.keywords.missing.length > 0 ? (
                            result.keywords.missing.map(kw => (
                              <Badge key={kw} variant="danger" size="sm">{kw}</Badge>
                            ))
                          ) : (
                            <p className="text-[var(--muted-foreground)]">No missing keywords - great job!</p>
                          )}
                        </div>
                      </Card>
                    </div>

                    {/* Suggested Keywords */}
                    {result.keywords.suggested.length > 0 && (
                      <Card variant="glass" padding="lg" className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                            <ExclamationTriangleOutline className="w-5 h-5 text-yellow-500" />
                          </div>
                          <h3 className="text-lg font-semibold">Suggested Keywords to Add ({result.keywords.suggested.length})</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.keywords.suggested.map(kw => (
                            <Badge key={kw} variant="warning" size="sm">{kw}</Badge>
                          ))}
                        </div>
                        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                          These keywords appear in the job description but not in your resume. Consider adding them naturally to your skills, experience, or summary.
                        </p>
                      </Card>
                    )}
                  </StaggerContainer>
                </PageTransition>
              )}

              {activeTab === 'suggestions' && result && (
                <PageTransition>
                  <StaggerContainer stagger={0.05} direction="up">
                    <Card variant="glass" padding="lg">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-cosmic-500/20 flex items-center justify-center">
                          <LightBulbIcon className="w-5 h-5 text-cosmic-500" />
                        </div>
                        <h3 className="text-xl font-semibold">Improvement Suggestions</h3>
                      </div>
                      
                      {result.suggestions.length > 0 ? (
                        <div className="space-y-3">
                          {result.suggestions.map((suggestion, i) => (
                            <div key={i} className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-cosmic-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-sm font-bold text-cosmic-500">{i + 1}</span>
                                </div>
                                <p className="text-[var(--foreground)]">{suggestion}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-[var(--muted-foreground)]">
                          <LightBulbIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No specific suggestions at this time</p>
                          <p>Your resume looks great! Consider adding a job description for targeted feedback.</p>
                        </div>
                      )}
                    </Card>
                  </StaggerContainer>
                </PageTransition>
              )}
            </div>
          );
        })()}
        </div>
      </main>
    </div>
  )
}

// Helper Components
function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function SectionDetailCard({ section }: { section: { name: string; score: number; feedback: string[] } }) {
  const color = section.score >= 80 ? 'text-green-500' : section.score >= 60 ? 'text-yellow-500' : section.score >= 40 ? 'text-orange-500' : 'text-red-500'
  
  return (
    <Card variant="hover" padding="lg">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold">{section.name}</h4>
        <span className={`text-2xl font-bold ${color}`}>{section.score}%</span>
      </div>
      <Progress value={section.score} max={100} size="md" variant={section.score >= 80 ? 'success' : section.score >= 60 ? 'warning' : section.score >= 40 ? 'warning' : 'default'} className="mb-3" />
      <ul className="space-y-1 text-sm text-[var(--muted-foreground)]">
        {section.feedback.map((f, i) => (
          <li key={i} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted-foreground)] flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </Card>
  )
}