import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { 
  ArrowLeftIcon, 
  SparklesIcon,
  ChevronDownIcon, ChevronUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { 
  ArrowPathIcon, ArrowDownTrayIcon, 
  DocumentTextIcon, PhotoIcon, CodeBracketIcon,
  Cog6ToothIcon, MagnifyingGlassPlusIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/solid'
import { useResume } from '@/contexts/ResumeContext'
import { useTheme } from '@/contexts/ThemeContext'
import { ResumeEditor } from '@/components/resume-builder/ResumeEditor'
import { ResumePreview } from '@/components/resume-builder/ResumePreview'
import { TemplateRenderer, TEMPLATE_METADATA, getTemplateById } from '@/components/resume-templates/TemplateRenderer'
import { Button, Card, Modal, Select, Badge, Toggle, Input } from '@/components/ui'
import { FloatingParticles, MorphingBlobs, PageTransition } from '@/components/animations/BlackHoleAnimation'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

interface ResumeBuilderPageProps {}

export function ResumeBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { 
    currentResume, 
    resumes, 
    updateResume, 
    updateResumeData, 
    setCurrentResume,
    loading 
  } = useResume()
  const { resolvedTheme } = useTheme()
  
  const [activeTemplateId, setActiveTemplateId] = useState<string>('modern-1')
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'json'>('pdf')
  const [isExporting, setIsExporting] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'pending'>('saved')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  const previewRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  
  // Use a ref to always have access to the latest resume data
  const resumeRef = useRef<typeof currentResume>(currentResume)
  const resumesRef = useRef(resumes)
  const activeTemplateIdRef = useRef(activeTemplateId)
  
  // Keep refs in sync
  useEffect(() => { resumeRef.current = currentResume }, [currentResume])
  useEffect(() => { resumesRef.current = resumes }, [resumes])
  useEffect(() => { activeTemplateIdRef.current = activeTemplateId }, [activeTemplateId])

  // Get current resume data - prioritize currentResume, then find by ID
  const resume = currentResume || resumes.find(r => r.id === id)
  const templateMeta = getTemplateById(activeTemplateId as any)
  const templateColors = templateMeta?.colors || TEMPLATE_METADATA[0].colors

  // Sync template when resume changes
  useEffect(() => {
    if (resume && resume.template_id !== activeTemplateId) {
      setActiveTemplateId(resume.template_id)
    }
  }, [resume, activeTemplateId])

  // Initialize template from resume
  useEffect(() => {
    if (resume) {
      setActiveTemplateId(resume.template_id)
    }
  }, [resume])

  // Handle data changes with immediate local updates and debounced persistence
  const handleDataChange = useCallback((data: Partial<any>) => {
    const current = resumeRef.current || resumesRef.current.find(r => r.id === id)
    if (!current) return

    const updatedData = {
      ...current.data,
      ...data,
    }

    const updates = {
      data: updatedData,
      template_id: activeTemplateIdRef.current,
    }

    // Update the UI immediately without making a database request.
    void updateResume(current.id, updates, { persist: false })

    setAutoSaveStatus('pending')

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Save only after the user stops typing for 800ms.
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving')

        await updateResume(current.id, updates, { persist: true })

        setAutoSaveStatus('saved')
        setLastSaved(new Date())

        // No success toast for every keystroke.
      } catch (error) {
        console.error('Auto-save failed:', error)
        setAutoSaveStatus('saved')
        toast.error('Failed to save changes', { duration: 2000 })
      }
    }, 800)
  }, [id, updateResume])

  // Handle template change
  const handleTemplateChange = async (newTemplateId: string) => {
    setActiveTemplateId(newTemplateId)
    const current = resumeRef.current || resumesRef.current.find(r => r.id === id)
    if (current) {
      try {
        await updateResume(current.id, { template_id: newTemplateId })
        toast.success('Template changed')
      } catch (error) {
        toast.error('Failed to change template')
      }
    }
  }

  // Export functions
  const getExportElement = () => {
    // Capture only the actual A4 resume, not the editor, sticky wrapper,
    // toolbar, template badge, or zoom controls.
    return previewRef.current?.querySelector('.resume-preview') as HTMLElement | null
  }

  const getSafeFileName = (title: string, extension: string) => {
    const safeTitle = title
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 100) || 'Resume'

    return `${safeTitle}.${extension}`
  }

  const waitForExportLayout = async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready
    }

    await new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve())
      })
    })
  }

  const captureResumeCanvas = async (exportElement: HTMLElement) => {
    const rect = exportElement.getBoundingClientRect()

    if (rect.width <= 0 || rect.height <= 0) {
      throw new Error('Resume preview has no visible dimensions')
    }

    const captureOptions = {
      scale: Math.min(2.5, Math.max(2, window.devicePixelRatio || 1)),
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: templateColors.background,
      imageTimeout: 15000,
      width: Math.ceil(rect.width),
      height: Math.ceil(rect.height),
      windowWidth: Math.max(document.documentElement.clientWidth, Math.ceil(rect.width)),
      windowHeight: Math.max(document.documentElement.clientHeight, Math.ceil(rect.height)),
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDocument: Document) => {
        const clonedResume = clonedDocument.querySelector('.resume-preview') as HTMLElement | null

        if (!clonedResume) return

        // Keep the resume independent from the application's dark/light theme.
        clonedResume.style.setProperty('--foreground', templateColors.text, 'important')
        clonedResume.style.setProperty('--muted-foreground', templateColors.secondary, 'important')
        clonedResume.style.setProperty('--background', templateColors.background, 'important')
        clonedResume.style.setProperty('--card', templateColors.background, 'important')
        clonedResume.style.setProperty('--primary', templateColors.primary, 'important')
        clonedResume.style.setProperty('--accent', templateColors.accent, 'important')
        clonedResume.style.setProperty('--heading', templateColors.heading, 'important')

        clonedResume.style.backgroundColor = templateColors.background
        clonedResume.style.color = templateColors.text
        clonedResume.style.transform = 'none'
        clonedResume.style.opacity = '1'
        clonedResume.style.visibility = 'visible'
        clonedResume.style.position = 'relative'
        clonedResume.style.left = '0'
        clonedResume.style.top = '0'

        const inner = clonedResume.firstElementChild as HTMLElement | null
        if (inner) {
          inner.style.backgroundColor = templateColors.background
          inner.style.color = templateColors.text
          inner.style.transform = 'none'
          inner.style.opacity = '1'
          inner.style.visibility = 'visible'
        }
      },
    }

    let canvas = await html2canvas(exportElement, captureOptions)

    // html2canvas can occasionally produce an empty canvas when a page
    // contains theme CSS variables. Retry with foreignObject rendering.
    if (canvas.width === 0 || canvas.height === 0 || isCanvasBlank(canvas)) {
      canvas = await html2canvas(exportElement, {
        ...captureOptions,
        foreignObjectRendering: true,
      })
    }

    if (canvas.width === 0 || canvas.height === 0 || isCanvasBlank(canvas)) {
      throw new Error('The resume could not be rendered for export')
    }

    return canvas
  }

  const isCanvasBlank = (canvas: HTMLCanvasElement) => {
    const sampleCanvas = document.createElement('canvas')
    sampleCanvas.width = Math.min(canvas.width, 100)
    sampleCanvas.height = Math.min(canvas.height, 100)

    const ctx = sampleCanvas.getContext('2d')
    if (!ctx) return false

    ctx.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      sampleCanvas.width,
      sampleCanvas.height
    )

    const pixels = ctx.getImageData(
      0,
      0,
      sampleCanvas.width,
      sampleCanvas.height
    ).data

    // A completely transparent canvas is definitely blank.
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] !== 0) return false
    }

    return true
  }

  const exportAsPDF = async () => {
    const current = resumeRef.current || resumesRef.current.find(r => r.id === id)
    const exportElement = getExportElement()

    if (!exportElement || !current) {
      toast.error('Resume preview is not ready yet')
      return
    }

    setIsExporting(true)

    try {
      await waitForExportLayout()

      const canvas = await captureResumeCanvas(exportElement)
      const imgData = canvas.toDataURL('image/png', 1.0)

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Always fill exactly one A4 page.
      pdf.addImage(
        imgData,
        'PNG',
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        'FAST'
      )

      pdf.save(getSafeFileName(current.title, 'pdf'))
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
    const current = resumeRef.current || resumesRef.current.find(r => r.id === id)
    const exportElement = getExportElement()

    if (!exportElement || !current) {
      toast.error('Resume preview is not ready yet')
      return
    }

    setIsExporting(true)

    try {
      await waitForExportLayout()

      const canvas = await captureResumeCanvas(exportElement)

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Failed to create PNG')
          return
        }

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = getSafeFileName(current.title, 'png')
        link.style.display = 'none'

        document.body.appendChild(link)
        link.click()
        link.remove()

        setTimeout(() => URL.revokeObjectURL(url), 1000)
        toast.success('PNG downloaded successfully')
      }, 'image/png', 1.0)
    } catch (error) {
      console.error('PNG export error:', error)
      toast.error('Failed to export PNG. Please try again.')
    } finally {
      setIsExporting(false)
      setShowExportModal(false)
    }
  }

  const exportAsJSON = () => {
    const current = resumeRef.current || resumesRef.current.find(r => r.id === id)
    if (!current) return

    const blob = new Blob([JSON.stringify(current, null, 2)], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = getSafeFileName(current.title, 'json')
    a.style.display = 'none'

    document.body.appendChild(a)
    a.click()
    a.remove()

    setTimeout(() => URL.revokeObjectURL(url), 1000)

    toast.success('JSON downloaded successfully')
    setShowExportModal(false)
  }

  const handleExport = () => {
    switch (exportFormat) {
      case 'pdf':
        void exportAsPDF()
        break
      case 'png':
        void exportAsPNG()
        break
      case 'json':
        exportAsJSON()
        break
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  // Animate entrance
  useEffect(() => {
    const tl = gsap.timeline()
    
    tl.fromTo(editorRef.current, 
      { x: -50, opacity: 0 }, 
      { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    )
    
    tl.fromTo(previewRef.current, 
      { x: 50, opacity: 0 }, 
      { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 
      '-=0.3'
    )
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="w-8 h-8 border-4 border-cosmic-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <Card variant="glass" padding="lg" className="max-w-md text-center">
          <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-cosmic-500" />
          <h2 className="text-2xl font-bold mb-2">Resume Not Found</h2>
          <p className="text-[var(--muted-foreground)] mb-6">
            The resume you're looking for doesn't exist or has been deleted.
          </p>
          <Button variant="primary" onClick={() => navigate('/dashboard')} leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  const viewModeLayouts = {
    split: { editor: 'lg:w-1/2', preview: 'lg:w-1/2 hidden lg:block' },
    editor: { editor: 'w-full', preview: 'hidden' },
    preview: { editor: 'hidden', preview: 'w-full' },
  }

  const layout = viewModeLayouts[viewMode]

  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: 'var(--background)' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <MorphingBlobs />
        <FloatingParticles count={40} />
      </div>

      {/* Top Toolbar */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-full mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Navigation & Title */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
              className="hidden sm:flex"
            >
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="sm:hidden p-2"
              aria-label="Back to Dashboard"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>{resume.title}</h1>
              <p className="text-xs text-[var(--muted-foreground)]">{resume.template_id}</p>
            </div>
          </div>

          {/* Center: View Mode & Template */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-[var(--muted)] rounded-lg p-1" role="group" aria-label="View mode">
              {(['split', 'editor', 'preview'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={clsx(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                    viewMode === mode
                      ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  )}
                  aria-pressed={viewMode === mode}
                >
                  {mode === 'split' && <MagnifyingGlassPlusIcon className="w-4 h-4" />}
                  {mode === 'editor' && <DocumentTextIcon className="w-4 h-4" />}
                  {mode === 'preview' && <EyeIcon className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {/* Template Selector */}
            <div className="relative">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowTemplateModal(true)}
                leftIcon={<SparklesIcon className="w-4 h-4" />}
                className="gap-2"
              >
                <span className="hidden sm:inline">{templateMeta?.name || activeTemplateId}</span>
                <ChevronDownIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* ATS Check Button */}
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate(`/ats-checker/${resume.id}`)}
              leftIcon={<DocumentMagnifyingGlassIcon className="w-4 h-4" />}
              className="hidden sm:flex gap-2"
            >
              ATS Check
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate(`/ats-checker/${resume.id}`)}
              className="sm:hidden p-2"
              aria-label="Run ATS Check"
            >
              <DocumentMagnifyingGlassIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Auto-save indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--muted)]">
              <span className={clsx(
                'w-2 h-2 rounded-full',
                autoSaveStatus === 'saved' && 'bg-green-500',
                autoSaveStatus === 'saving' && 'bg-yellow-500 animate-pulse',
                autoSaveStatus === 'pending' && 'bg-blue-500 animate-pulse'
              )} />
              <span className="text-xs text-[var(--muted-foreground)]">
                {autoSaveStatus === 'saved' 
                  ? lastSaved 
                    ? `Saved ${lastSaved.toLocaleTimeString()}` 
                    : 'Saved'
                  : autoSaveStatus === 'saving' 
                    ? 'Saving...' 
                    : 'Pending'}
              </span>
            </div>

            {/* Export */}
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowExportModal(true)}
              leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
              className="hidden sm:flex"
            >
              Export
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowExportModal(true)}
              className="sm:hidden p-2"
              aria-label="Export"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-full mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            {/* Editor Panel */}
            <aside 
              ref={editorRef}
              className={clsx(
                'flex-1 min-w-0',
                layout.editor
              )}
            >
              <div className="sticky top-20 space-y-6">
                <PageTransition>
                  <ResumeEditor 
                    data={resume.data}
                    onChange={handleDataChange}
                    templateId={activeTemplateId}
                  />
                </PageTransition>
              </div>
            </aside>

            {/* Preview Panel */}
            <aside 
              ref={previewRef}
              className={clsx(
                'flex-1 min-w-0',
                layout.preview
              )}
            >
              <div className="sticky top-20">
                <PageTransition>
                  <ResumePreview 
                    data={resume.data}
                    templateId={activeTemplateId}
                    colors={templateColors}
                  />
                </PageTransition>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Template Selection Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Choose Template"
        description="Select a template for your resume. Your content will be preserved."
        size="full"
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_METADATA.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={activeTemplateId === template.id}
                onSelect={() => {
                  handleTemplateChange(template.id)
                  setShowTemplateModal(false)
                }}
              />
            ))}
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Resume"
        description="Choose your preferred export format"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid gap-3">
            {[
              { value: 'pdf', label: 'PDF Document', desc: 'Best for applications and printing', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a4 4 0 004-4V8a4 4 0 10-8 0v6a4 4 0 004 4z" /></svg> },
              { value: 'png', label: 'PNG Image', desc: 'High-resolution image for sharing', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-12z" /></svg> },
              { value: 'json', label: 'JSON Data', desc: 'Backup or transfer to another system', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2 3 3 0 00-3 3H7a3 3 0 00-3-3 2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586 7.707 11.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setExportFormat(option.value as 'pdf' | 'png' | 'json')}
                className={clsx(
                  'p-4 rounded-xl border-2 text-left transition-all',
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
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Template Card Component
type TemplateMeta = typeof TEMPLATE_METADATA[number]

interface TemplateCardProps {
  template: TemplateMeta
  isSelected: boolean
  onSelect: () => void
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className={clsx(
        'relative p-3 rounded-xl border-2 transition-all duration-200 text-left group',
        isSelected
          ? 'border-cosmic-500 bg-cosmic-500/10 shadow-cosmic'
          : 'border-[var(--border)] hover:border-cosmic-500/50'
      )}
      style={{
        background: template.colors.background,
        color: template.colors.text,
      }}
    >
      <div className="absolute top-2 right-2 flex gap-1">
        {template.isPremium && <Badge variant="warning" size="sm">Pro</Badge>}
        {template.atsOptimized && <Badge variant="success" size="sm">ATS</Badge>}
      </div>
      
      <div className="w-full h-24 rounded-lg mb-3 flex items-center justify-center" 
        style={{ background: template.colors.primary, border: `2px solid ${template.colors.accent}` }}>
        <span className="text-2xl font-bold" style={{ color: template.colors.background }}>
          {template.name.charAt(0)}
        </span>
      </div>
      
      <h5 className="font-semibold mb-1" style={{ color: template.colors.heading }}>{template.name}</h5>
      <p className="text-xs mb-2" style={{ color: template.colors.text, opacity: 0.7 }}>{template.description}</p>
      
      <div className="flex gap-1">
        {['primary', 'secondary', 'accent'].map(key => (
          <div 
            key={key} 
            className="w-5 h-5 rounded" 
            style={{ background: template.colors[key as keyof typeof template.colors] }}
          />
        ))}
      </div>
      
      {isSelected && (
        <div className="absolute inset-0 border-2 border-cosmic-500 rounded-xl pointer-events-none">
          <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-cosmic-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
          </div>
        </div>
      )}
    </button>
  )
}