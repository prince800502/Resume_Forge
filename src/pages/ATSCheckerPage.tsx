import React, { useState, useEffect, useCallback, useRef } from 'react'
import ResumeUploadAnalyzer from '@/components/ats-checker/ResumeUploadAnalyzer'
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
  HomeIcon,
  Squares2X2Icon,
  SparklesIcon,
} from '@heroicons/react/24/solid'
import { 
  ArrowLeftIcon as ArrowLeftOutline,
  CheckCircleIcon as CheckCircleOutline,
  XCircleIcon as XCircleOutline,
  ExclamationTriangleIcon as ExclamationTriangleOutline,
  HomeIcon as HomeOutline,
  Squares2X2Icon as Squares2X2Outline,
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
    updateResume,
    setCurrentResume,
  } = useResume()
  const { resolvedTheme } = useTheme()
  
  const [jobDescription, setJobDescription] = useState('')
  const [showJobDesc, setShowJobDesc] = useState(true)
  const [result, setResult] = useState<ReturnType<typeof calculateATSScore> | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'keywords' | 'suggestions'>('overview')
  const [lastAnalyzedResumeId, setLastAnalyzedResumeId] = useState<string | null>(null)
  const [uploadedFileReport, setUploadedFileReport] = useState<{ report: any; fileName: string } | null>(null)
  const [analysisMode, setAnalysisMode] = useState<'upload' | 'saved'>('upload')

  const analysisRef = useRef<HTMLDivElement>(null)

  // Get current resume from context or URL param
  const resume = currentResume || (id ? resumes.find(r => r.id === id) : null) || resumes[0] || null

  // Determine if we have a saved resume to analyze
  const hasSavedResume = !!resume

  // Auto-analyze when resume changes (for saved resumes)
  useEffect(() => {
    if (resume && resume.id !== lastAnalyzedResumeId && analysisMode === 'saved') {
      runAnalysis()
      setLastAnalyzedResumeId(resume.id)
    }
  }, [resume, lastAnalyzedResumeId, jobDescription, analysisMode])

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
    if (!result && !uploadedFileReport) return
    
    if (uploadedFileReport && analysisMode === 'upload') {
      const reportData = {
        resumeTitle: uploadedFileReport.fileName,
        analyzedAt: new Date().toISOString(),
        jobDescription: jobDescription || null,
        ...uploadedFileReport.report,
      }
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ats-report-${uploadedFileReport.fileName.replace(/\s+/g, '-')}-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success('Report exported')
      return
    }
    
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

  const handleUploadAnalysisComplete = useCallback((report: any, file: File) => {
    setUploadedFileReport({ report, fileName: file.name })
    setAnalysisMode('upload')
    setResult(null) // Clear saved resume analysis
  }, [])

  const handleJobDescriptionMatch = useCallback((report: any, jd: string) => {
    // The ResumeUploadAnalyzer handles this internally now
    // This is kept for compatibility
  }, [])

  const switchToSavedResume = useCallback((resumeId: string) => {
    const selectedResume = resumes.find(r => r.id === resumeId)
    if (selectedResume) {
      setCurrentResume(selectedResume)
      setAnalysisMode('saved')
      setUploadedFileReport(null)
      setLastAnalyzedResumeId(null) // Force re-analysis
    }
  }, [resumes, setCurrentResume])

  // If no resume at all (not even in context), show the upload analyzer prominently
  if (!hasSavedResume) {
    return (
      <div className="min-h-screen relative block w-full" style={{ background: 'var(--background)' }}>
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <MorphingBlobs />
          <FloatingParticles count={40} />
        </div>

        {/* Navigation Header */}
        <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
          <nav className="max-w-full mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
            <div className="flex items-center justify-between h-16 lg:h-18">
              {/* Logo & Brand */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-[var(--muted)] transition-colors"
                  aria-label="ResumeForge Home"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-500 flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-xl bg-gradient-to-r from-cosmic-600 to-nebula-600 bg-clip-text text-transparent hidden sm:block">
                    ResumeForge
                  </span>
                </button>
              </div>

              {/* Navigation Links */}
              <div className="hidden lg:flex items-center gap-6">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  <HomeOutline className="w-4 h-4" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  <Squares2X2Outline className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <span className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-cosmic-500 bg-cosmic-500/10 border border-cosmic-500/20">
                  <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                  <span>ATS Checker</span>
                </span>
              </div>

              {/* Mobile Navigation */}
              <div className="lg:hidden flex items-center gap-1">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  aria-label="Go to Home"
                >
                  <HomeOutline className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  aria-label="Go to Dashboard"
                >
                  <Squares2X2Outline className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Secondary Toolbar - Job Description Toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cosmic-500/10 border border-cosmic-500/20 text-cosmic-500 text-sm font-medium">
                <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                <span>ATS Checker</span>
                <span className="text-[var(--muted-foreground)] mx-1">/</span>
                <span className="truncate max-w-[200px] text-[var(--muted-foreground)]">Universal Resume Analyzer</span>
              </div>

              <div className="flex items-center gap-2">
                <Toggle
                  checked={showJobDesc}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowJobDesc(e.target.checked)}
                  label={showJobDesc ? 'JD: On' : 'JD: Off'}
                  description="Compare resume against job description"
                  className="hidden sm:flex"
                />
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="w-full p-4 lg:p-6 overflow-y-auto">
          <div className="w-full max-w-[1400px] mx-auto">
            <ResumeUploadAnalyzer 
              onAnalysisComplete={handleUploadAnalysisComplete}
              onJobDescriptionMatch={handleJobDescriptionMatch}
              jobDescription={jobDescription}
            />
            
            {/* Job Description Input for Upload Mode */}
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
                    placeholder="Paste a job description here to compare your uploaded resume against specific requirements. The ATS checker will extract keywords and show match percentages."
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

            {/* Show saved resumes section if user has any */}
            {resumes.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Your Saved Resumes</h3>
                  <Button variant="primary" size="sm" onClick={() => navigate('/builder/new')} leftIcon={<PlusIcon className="w-4 h-4" />}>
                    Create New Resume
                  </Button>
                </div>
                <Card variant="glass" padding="lg">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {resumes.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => switchToSavedResume(r.id)}
                        className={clsx(
                          'p-4 rounded-xl border transition-all text-left',
                          'hover:shadow-lg hover:border-cosmic-500/50'
                        )}
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                      >
                        <h4 className="font-semibold truncate">{r.title}</h4>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">Template: {r.template_id} • {new Date(r.updated_at).toLocaleDateString()}</p>
                        {r.ats_score !== undefined && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`text-sm font-bold ${r.ats_score >= 80 ? 'text-green-500' : r.ats_score >= 60 ? 'text-yellow-500' : r.ats_score >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
                              ATS: {r.ats_score}/100
                            </span>
                            <span className="text-xs text-[var(--muted-foreground)]">(saved score)</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  // If we have a saved resume, show the full ATS Checker with tabs
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

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <nav className="max-w-full mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-[var(--muted)] transition-colors"
                aria-label="ResumeForge Home"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-500 flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-cosmic-600 to-nebula-600 bg-clip-text text-transparent hidden sm:block">
                  ResumeForge
                </span>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                <HomeOutline className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                <Squares2X2Outline className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <span className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-cosmic-500 bg-cosmic-500/10 border border-cosmic-500/20">
                <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                <span>ATS Checker</span>
              </span>
            </div>

            {/* Mobile Navigation & Actions */}
            <div className="flex items-center gap-2">
              {/* Job Description Toggle */}
              <Toggle
                checked={showJobDesc}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowJobDesc(e.target.checked)}
                label={showJobDesc ? 'JD: On' : 'JD: Off'}
                description="Compare resume against job description"
                className="hidden sm:flex"
              />
              
              {/* Mobile Menu Button */}
              <div className="lg:hidden flex items-center gap-1">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  aria-label="Go to Home"
                >
                  <HomeOutline className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  aria-label="Go to Dashboard"
                >
                  <Squares2X2Outline className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Toolbar - Analysis Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cosmic-500/10 border border-cosmic-500/20 text-cosmic-500 text-sm font-medium">
                <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                <span>ATS Checker</span>
                {resume && (
                  <>
                    <span className="text-[var(--muted-foreground)] mx-1">/</span>
                    <span className="truncate max-w-[200px] text-[var(--muted-foreground)]">{resume.title}</span>
                  </>
                )}
                {uploadedFileReport && !resume && (
                  <>
                    <span className="text-[var(--muted-foreground)] mx-1">/</span>
                    <span className="truncate max-w-[200px] text-[var(--muted-foreground)]">{uploadedFileReport.fileName}</span>
                  </>
                )}
              </div>
              
              {analysisMode === 'upload' && !uploadedFileReport && (
                <span className="text-xs text-[var(--muted-foreground)] hidden sm:block">Upload a resume to begin analysis</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              {analysisMode === 'upload' && (
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setAnalysisMode('saved')}
                  leftIcon={<ArrowPathIcon className="w-4 h-4" />}
                  className="hidden sm:flex"
                >
                  Switch to Saved Resume
                </Button>
              )}
              
              {analysisMode === 'saved' && (
                <>
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
                    disabled={!result && !uploadedFileReport}
                    leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
                  >
                    Export Report
                  </Button>
                </>
              )}
              
              {analysisMode === 'upload' && uploadedFileReport && (
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={exportReport}
                  leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
                >
                  Export Report
                </Button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="w-full p-4 lg:p-6 overflow-y-auto">
        <div className="w-full max-w-[1400px] mx-auto">
          {/* Upload Analyzer - Always available */}
          <ResumeUploadAnalyzer 
            onAnalysisComplete={handleUploadAnalysisComplete}
            onJobDescriptionMatch={handleJobDescriptionMatch}
            jobDescription={jobDescription}
          />
          
          {/* Mode Toggle */}
          <div className="mb-6">
            <div className="flex gap-2" role="tablist">
              <button
                role="tab"
                aria-selected={analysisMode === 'upload'}
                onClick={() => setAnalysisMode('upload')}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  analysisMode === 'upload'
                    ? 'bg-cosmic-500 text-white shadow-lg'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted-foreground)]/10'
                )}
              >
                Upload Resume
              </button>
              <button
                role="tab"
                aria-selected={analysisMode === 'saved'}
                onClick={() => setAnalysisMode('saved')}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  analysisMode === 'saved'
                    ? 'bg-cosmic-500 text-white shadow-lg'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted-foreground)]/10'
                )}
              >
                Saved Resume: {resume.title}
              </button>
            </div>
          </div>

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

          {/* Analysis Results - Upload Mode */}
          {analysisMode === 'upload' && uploadedFileReport && (
            <div ref={analysisRef}>
              <PageTransition>
                <Card variant="glass" padding="lg" className="mb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                      <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{uploadedFileReport.fileName}</h2>
                      <p className="text-[var(--muted-foreground)]">Uploaded resume analysis</p>
                    </div>
                    
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
                            stroke={uploadedFileReport.report.score >= 80 ? 'green' : uploadedFileReport.report.score >= 60 ? 'yellow' : uploadedFileReport.report.score >= 40 ? 'orange' : 'red'}
                            strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 50}`}
                            strokeDashoffset={`${2 * Math.PI * 50 * (1 - uploadedFileReport.report.score / 100)}`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold" style={{ color: `var(--${uploadedFileReport.report.score >= 80 ? 'green' : uploadedFileReport.report.score >= 60 ? 'yellow' : uploadedFileReport.report.score >= 40 ? 'orange' : 'red'}-500)` }}>
                            {uploadedFileReport.report.score}
                          </span>
                          <span className="text-xs font-medium">/100</span>
                        </div>
                      </div>
                      
                      <div className="text-center lg:text-left">
                        <p className="text-sm text-[var(--muted-foreground)]">ATS Compatibility Score</p>
                        <p className={`${scoreClass(uploadedFileReport.report.score)} text-2xl font-bold`}>
                          {uploadedFileReport.report.score >= 80 ? 'Excellent' : uploadedFileReport.report.score >= 60 ? 'Good' : uploadedFileReport.report.score >= 40 ? 'Needs Work' : 'Poor'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </PageTransition>
            </div>
          )}

          {/* Analysis Results - Saved Resume Mode */}
          {analysisMode === 'saved' && (
            <div ref={analysisRef}>
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
                          <p className={`${scoreColor} text-2xl font-bold`}>
                            {result.score >= 80 ? 'Excellent' : result.score >= 60 ? 'Good' : result.score >= 40 ? 'Needs Work' : 'Poor'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </PageTransition>

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
          )}
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

function scoreClass(score: number) {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}