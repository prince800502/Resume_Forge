import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, DocumentMagnifyingGlassIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/solid'
import { ArrowLeftIcon as ArrowLeftOutline, ShareIcon as ShareOutline } from '@heroicons/react/24/outline'
import { useResume } from '@/contexts/ResumeContext'
import { useTheme } from '@/contexts/ThemeContext'
import { ResumePreview } from '@/components/resume-builder/ResumePreview'
import { TemplateRenderer, TEMPLATE_METADATA, getTemplateById } from '@/components/resume-templates/TemplateRenderer'
import { Button, Card, Badge } from '@/components/ui'
import { clsx } from 'clsx'
import { downloadResumeAsPdf } from '@/utils/pdfExport'
import { downloadResumeAsPng } from '@/utils/pngExport'
import { exportResumeToDocx, triggerDownload, getSafeFileName as getDocxSafeFileName } from '@/utils/docxExport'
import toast from 'react-hot-toast'

export function PreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { 
    resumes, 
    updateResume,
  } = useResume()
  const { resolvedTheme } = useTheme()
  
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'docx'>('pdf')
  const [showExportModal, setShowExportModal] = useState(false)
  
  // Get resume from URL parameter
  const resume = resumes.find(r => r.id === id)
  
  // Get template metadata
  const templateMeta = resume ? getTemplateById(resume.template_id as any) : TEMPLATE_METADATA[0]
  const templateColors = templateMeta?.colors || TEMPLATE_METADATA[0].colors
  
  // Handle missing resume
  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <Card variant="glass" padding="lg" className="max-w-md text-center">
          <DocumentMagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4 text-cosmic-500" />
          <h2 className="text-2xl font-bold mb-2">Resume Not Found</h2>
          <p className="text-[var(--muted-foreground)] mb-6">
            The resume you're looking for doesn't exist or has been deleted.
          </p>
          <Button variant="primary" onClick={() => navigate('/dashboard')} leftIcon={<ArrowLeftOutline className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    )
  }
  
  const exportAsPDF = async () => {
    setIsExporting(true)
    try {
      await downloadResumeAsPdf(resume.data, resume.title, {
        templateId: resume.template_id,
        colors: templateColors,
        onProgress: (stage, progress) => console.log(`[PDF Export] ${stage} (${progress}%)`),
      })
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
      setShowExportModal(false)
    }
  }
  
  const exportAsPNG = async () => {
    setIsExporting(true)
    try {
      await downloadResumeAsPng(resume.data, resume.title, {
        templateId: resume.template_id,
        colors: templateColors,
        onProgress: (stage, progress) => console.log(`[PNG Export] ${stage} (${progress}%)`),
      })
      toast.success('PNG downloaded successfully')
    } catch (error) {
      console.error('PNG export error:', error)
      toast.error('Failed to export PNG. Please try again.')
    } finally {
      setIsExporting(false)
      setShowExportModal(false)
    }
  }
  
  const exportAsDOCX = async () => {
    setIsExporting(true)
    try {
      const blob = await exportResumeToDocx(resume.data, {
        templateId: resume.template_id,
        colors: templateColors,
      })
      triggerDownload(blob, getDocxSafeFileName(resume.title, 'docx'))
      toast.success('Word document downloaded successfully')
    } catch (error) {
      console.error('DOCX export error:', error)
      toast.error('Failed to export Word document. Please try again.')
    } finally {
      setIsExporting(false)
      setShowExportModal(false)
    }
  }
  
  const handleExport = () => {
    switch (exportFormat) {
      case 'pdf': exportAsPDF(); break
      case 'png': exportAsPNG(); break
      case 'docx': exportAsDOCX(); break
    }
  }
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resume.title,
        text: `Check out my resume: ${resume.title}`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }
  
  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: 'var(--background)' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cosmic-500/5 via-transparent to-nebula-500/5" />
      </div>
      
      {/* Top Toolbar */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-full mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Navigation & Title */}
          <div className="flex items-center gap-4 w-full sm:w-auto flex-wrap gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              leftIcon={<ArrowLeftOutline className="w-4 h-4" />}
              className="flex-1 sm:flex-none min-w-0"
            >
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden" aria-label="Dashboard"><ArrowLeftOutline className="w-4 h-4" /></span>
            </Button>
            
            <div className="hidden sm:block flex-1 min-w-0">
              <h1 className="font-bold text-lg truncate" style={{ color: 'var(--foreground)' }}>{resume.title}</h1>
              <p className="text-xs text-[var(--muted-foreground)] truncate">Template: {templateMeta?.name || resume.template_id}</p>
            </div>
            <div className="sm:hidden flex-1 min-w-0">
              <h1 className="font-bold text-base truncate" style={{ color: 'var(--foreground)' }}>{resume.title}</h1>
            </div>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="cosmic" size="sm" className="hidden sm:inline-flex">
              {templateMeta?.name || resume.template_id}
            </Badge>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowExportModal(true)}
              leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
              className="hidden xs:flex gap-2"
            >
              Export
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowExportModal(true)}
              className="xs:hidden p-2"
              aria-label="Export"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleShare}
              leftIcon={<ShareOutline className="w-4 h-4" />}
              className="hidden xs:flex gap-2"
            >
              Share
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleShare}
              className="xs:hidden p-2"
              aria-label="Share"
            >
              <ShareOutline className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate(`/builder/${resume.id}`)}
              leftIcon={<DocumentMagnifyingGlassIcon className="w-4 h-4" />}
              className="hidden xs:flex gap-2"
            >
              Edit
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate(`/builder/${resume.id}`)}
              className="xs:hidden p-2"
              aria-label="Edit resume"
            >
              <DocumentMagnifyingGlassIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-full mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            {/* Preview Panel - Full Width */}
            <div className="w-full lg:flex-1 min-w-0">
              <div className="flex items-start justify-center p-4 lg:p-8 min-h-[calc(100vh-8rem)]">
                <ResumePreview 
                  data={resume.data} 
                  templateId={resume.template_id} 
                  colors={templateColors} 
                  isFullPreview={true}
                />
              </div>
            </div>
            
            {/* Sidebar with Resume Info */}
            <aside className="lg:w-80 flex-none">
              <div className="sticky top-20 space-y-6">
                <Card variant="glass" padding="lg">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Resume Details</h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-[var(--muted-foreground)]">Title</dt>
                      <dd className="font-medium truncate">{resume.title}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted-foreground)]">Template</dt>
                      <dd className="font-medium">{templateMeta?.name || resume.template_id}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted-foreground)]">Last Updated</dt>
                      <dd className="font-medium">{new Date(resume.updated_at).toLocaleDateString()}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted-foreground)]">Created</dt>
                      <dd className="font-medium">{new Date(resume.created_at).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </Card>
                
                <Card variant="glass" padding="lg">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Contact</h3>
                  <dl className="space-y-2 text-sm">
                    {resume.data.personal.email && (
                      <div>
                        <dt className="text-[var(--muted-foreground)]">Email</dt>
                        <dd className="font-medium truncate">{resume.data.personal.email}</dd>
                      </div>
                    )}
                    {resume.data.personal.phone && (
                      <div>
                        <dt className="text-[var(--muted-foreground)]">Phone</dt>
                        <dd className="font-medium">{resume.data.personal.phone}</dd>
                      </div>
                    )}
                    {resume.data.personal.location && (
                      <div>
                        <dt className="text-[var(--muted-foreground)]">Location</dt>
                        <dd className="font-medium truncate">{resume.data.personal.location}</dd>
                      </div>
                    )}
                    {resume.data.personal.linkedin && (
                      <div>
                        <dt className="text-[var(--muted-foreground)]">LinkedIn</dt>
                        <dd className="font-medium truncate">
                          <a href={resume.data.personal.linkedin.startsWith('http') ? resume.data.personal.linkedin : `https://${resume.data.personal.linkedin}`} 
                             target="_blank" rel="noopener noreferrer" 
                             style={{ color: templateColors.accent, textDecoration: 'underline' }}>
                            View Profile
                          </a>
                        </dd>
                      </div>
                    )}
                    {resume.data.personal.github && (
                      <div>
                        <dt className="text-[var(--muted-foreground)]">GitHub</dt>
                        <dd className="font-medium truncate">
                          <a href={resume.data.personal.github.startsWith('http') ? resume.data.personal.github : `https://${resume.data.personal.github}`} 
                             target="_blank" rel="noopener noreferrer" 
                             style={{ color: templateColors.accent, textDecoration: 'underline' }}>
                            View Profile
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </main>
      
      {/* Export Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ display: showExportModal ? 'flex' : 'none' }}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowExportModal(false)} />
        <Card variant="glass" padding="lg" className="w-full max-w-md relative z-10 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Export Resume</h2>
            <button onClick={() => setShowExportModal(false)} className="p-1 rounded-lg hover:bg-[var(--muted)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
            {[
              { value: 'pdf', label: 'PDF Document', desc: 'Best for applications and printing', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a4 4 0 004-4V8a4 4 0 10-8 0v6a4 4 0 004 4z" /></svg> },
              { value: 'docx', label: 'Word Document (DOCX)', desc: 'Editable Microsoft Word format', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a4 4 0 004-4V8a4 4 0 10-8 0v6a4 4 0 004 4z" /><path d="M8 10h4v4H8v-4zm0 6h4v2H8v-2z" opacity=".5"/></svg> },
              { value: 'png', label: 'PNG Image', desc: 'High-resolution image for sharing', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-12z" /></svg> },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setExportFormat(option.value as 'pdf' | 'png' | 'docx')}
                className={clsx(
                  'p-4 rounded-xl border-2 text-left transition-all w-full',
                  exportFormat === option.value
                    ? 'border-cosmic-500 bg-cosmic-500/10'
                    : 'border-[var(--border)] hover:border-cosmic-500/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${templateColors.primary}20` }}>
                    {option.icon}
                  </div>
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{option.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button variant="secondary" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleExport}
              loading={isExporting}
              leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Export
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}