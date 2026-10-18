import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { useParams, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { 
  ArrowLeftIcon, 
  SparklesIcon,
  ChevronDownIcon, ChevronUpIcon,
  EyeIcon,
  XMarkIcon
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
import { AISuggestionsPanel } from '@/components/ai-assistant/AISuggestionsPanel'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { exportResumeToDocx, getSafeFileName as getDocxSafeFileName, triggerDownload } from '@/utils/docxExport'

interface ResumeBuilderPageProps {}

export function ResumeBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { 
    currentResume: contextCurrentResume, 
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
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'json' | 'docx'>('pdf')
  const [isExporting, setIsExporting] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'pending'>('saved')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [targetRole, setTargetRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [showAIModal, setShowAIModal] = useState(false)
  
  const previewRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  
  // Resolve resume from URL parameter - this is the authoritative source
  const resume = useMemo(() => 
    resumes.find(r => r.id === id), 
    [resumes, id]
  )
  
  // Refs for latest values without triggering re-renders
  const resumesRef = useRef(resumes)
  const activeTemplateIdRef = useRef(activeTemplateId)
  const updateResumeRef = useRef(updateResume)
  // Ref to always access the latest resume (from route param) for handleDataChange
  const resumeRef = useRef<typeof resume | null>(null)
  
  // Keep refs in sync
  useEffect(() => { resumesRef.current = resumes }, [resumes])
  useEffect(() => { activeTemplateIdRef.current = activeTemplateId }, [activeTemplateId])
  useEffect(() => { updateResumeRef.current = updateResume }, [updateResume])
  useEffect(() => { resumeRef.current = resume }, [resume])
  
  // Handle missing resume - redirect to dashboard when not loading
  useEffect(() => {
    if (!resume && !loading) {
      navigate('/dashboard', { replace: true })
    }
  }, [resume, loading, navigate])
  
  // If resume not found, show loading or not found state
  if (!resume) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
          <div className="w-8 h-8 border-4 border-cosmic-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )
    }
  
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
  
  // Sync context's currentResume with route resume when it changes
  useEffect(() => {
    if (resume && resume !== contextCurrentResume) {
      setCurrentResume(resume)
    }
  }, [resume, contextCurrentResume, setCurrentResume])
  
  // Memoize resume data to provide stable reference to ResumeEditor
  // Only updates when actual data content changes, not object reference
  const resumeData = useMemo(() => resume?.data ?? {
    personal: { firstName: '', lastName: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '', portfolio: '', title: '' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    custom_sections: [],
  }, [resume?.data])
  
  const templateMeta = getTemplateById(activeTemplateId as any)
  const templateColors = templateMeta?.colors || TEMPLATE_METADATA[0].colors
  
  // Sync template when resume changes - only run when resume data actually changes
  useEffect(() => {
    if (resume && resume.template_id !== activeTemplateId) {
      setActiveTemplateId(resume.template_id)
    }
  }, [resume?.template_id, activeTemplateId])
  
  // Initialize template from resume - only on mount/resume change
  useEffect(() => {
    if (resume) {
      setActiveTemplateId(resume.template_id)
    }
  }, [resume?.id])
  
  // Track the last saved data revision to prevent stale overwrites
  const saveRevisionRef = useRef(0)
  
  // Handle data changes with immediate local updates and debounced persistence
  const handleDataChange = useCallback((data: Partial<any>) => {
    // Use the resume ref to always get the latest resume from the route parameter
    const currentResume = resumeRef.current
    if (!currentResume) return
  
    const updatedData = {
      ...currentResume.data,
      ...data,
    }
  
    // Only include template_id in updates if it actually changed
    const templateId = activeTemplateIdRef.current
    const updates: any = { data: updatedData }
    if (currentResume.template_id !== templateId) {
      updates.template_id = templateId
    }
  
    // Update the UI immediately without making a database request.
    void updateResumeRef.current(currentResume.id, updates, { persist: false })
  
    setAutoSaveStatus('pending')
  
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
  
    // Increment revision to track this save cycle
    const thisRevision = ++saveRevisionRef.current
  
    // Save only after the user stops typing for 800ms.
    autoSaveTimeoutRef.current = setTimeout(async () => {
      // Check if a newer revision has started - if so, skip this save
      if (thisRevision !== saveRevisionRef.current) {
        return
      }
      
      try {
        setAutoSaveStatus('saving')
  
        await updateResumeRef.current(currentResume.id, updates, { persist: true })
        
        // Only update status if this is still the latest revision
        if (thisRevision === saveRevisionRef.current) {
          setAutoSaveStatus('saved')
          setLastSaved(new Date())
        }
      } catch (error) {
        console.error('Auto-save failed:', error)
        if (thisRevision === saveRevisionRef.current) {
          setAutoSaveStatus('saved')
          toast.error('Failed to save changes', { duration: 2000 })
        }
      }
    }, 800)
  }, [])
  
  // Handle template change
  const handleTemplateChange = useCallback(async (newTemplateId: string) => {
    setActiveTemplateId(newTemplateId)
    const currentResume = resumeRef.current
    if (!currentResume) return
    try {
      await updateResumeRef.current(currentResume.id, { template_id: newTemplateId })
      toast.success('Template changed')
    } catch (error) {
      toast.error('Failed to change template')
    }
  }, [])
  
  // AI Suggestion handlers
  const handleApplySummary = useCallback((summary: string) => {
    handleDataChange({ summary })
  }, [handleDataChange])
  
  const handleApplyBullets = useCallback((
    sectionType: 'experience' | 'projects',
    itemId: string,
    bullets: string[]
  ) => {
    if (!resume) return
  
    if (sectionType === 'experience') {
      const updatedExperience = resume.data.experience.map((exp: any) =>
        exp.id === itemId ? { ...exp, description: bullets } : exp
      )
      handleDataChange({ experience: updatedExperience })
    } else {
      const updatedProjects = resume.data.projects.map((proj: any) =>
        proj.id === itemId ? { ...proj, highlights: bullets } : proj
      )
      handleDataChange({ projects: updatedProjects })
    }
  }, [handleDataChange, resume])
  
  const handleApplySkills = useCallback((skills: string[]) => {
    if (!resume) return
  
    const newSkills = skills.map(name => ({
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      category: 'technical' as const,
      proficiency: 'intermediate' as const,
    }))
  
    handleDataChange({ skills: [...resume.data.skills, ...newSkills] })
  }, [handleDataChange, resume])
  
  const handleApplyText = useCallback((field: string, value: string) => {
    if (!resume) return
  
    if (field === 'summary') {
      handleDataChange({ summary: value })
    } else if (field.startsWith('experience-')) {
      const expId = field.replace('experience-', '')
      const updatedExperience = resume.data.experience.map((exp: any) =>
        exp.id === expId ? { ...exp, description: value.split('\n').filter(Boolean) } : exp
      )
      handleDataChange({ experience: updatedExperience })
    } else if (field.startsWith('project-')) {
      const projId = field.replace('project-', '')
      const updatedProjects = resume.data.projects.map((proj: any) =>
        proj.id === projId ? { ...proj, description: value } : proj
      )
      handleDataChange({ projects: updatedProjects })
    }
  }, [handleDataChange, resume])
  
  // Export functions
  // Create a temporary export preview element that's independent of the view mode
  const createExportElement = () => {
    // Create a container for the export - use absolute positioning off-screen but VISIBLE
    // html2canvas cannot capture elements with visibility:hidden or negative z-index
    const exportContainer = document.createElement('div')
    exportContainer.className = 'resume-export-container'
    exportContainer.style.position = 'absolute'
    exportContainer.style.left = '-9999px'
    exportContainer.style.top = '0'
    exportContainer.style.width = '210mm'
    exportContainer.style.pointerEvents = 'none'
    // DO NOT use visibility:hidden or z-index:-1 - these prevent html2canvas from capturing
    exportContainer.style.zIndex = '0'
    exportContainer.style.overflow = 'visible'
    
    // Apply the CSS variables that TemplateRenderer and templates depend on
    exportContainer.style.setProperty('--foreground', templateColors.text, 'important')
    exportContainer.style.setProperty('--muted-foreground', templateColors.secondary, 'important')
    exportContainer.style.setProperty('--background', templateColors.background, 'important')
    exportContainer.style.setProperty('--card', templateColors.background, 'important')
    exportContainer.style.setProperty('--primary', templateColors.primary, 'important')
    exportContainer.style.setProperty('--accent', templateColors.accent, 'important')
    exportContainer.style.setProperty('--heading', templateColors.heading, 'important')
    exportContainer.style.backgroundColor = templateColors.background
    exportContainer.style.color = templateColors.text
    exportContainer.style.boxSizing = 'border-box'
    
    // Create the inner content div where TemplateRenderer will render
    // This div will receive the .resume-preview class from TemplateRenderer
    const contentDiv = document.createElement('div')
    contentDiv.id = 'resume-export-content'
    contentDiv.style.width = '100%'
    contentDiv.style.boxSizing = 'border-box'
    
    exportContainer.appendChild(contentDiv)
    
    // Render the TemplateRenderer component directly into contentDiv
    // TemplateRenderer will create its own .resume-preview element inside contentDiv
    const root = createRoot(contentDiv)
    root.render(
      <TemplateRenderer
        data={resumeData}
        templateId={activeTemplateId}
        colors={templateColors}
        isFullPreview={true}
      />
    )
    
    document.body.appendChild(exportContainer)
    return { exportContainer, contentDiv, root }
  }
  
  // Wait for React to finish rendering, fonts to load, and layout to stabilize
  const waitForExportReady = async (contentDiv: HTMLElement) => {
    // Wait for fonts to load
    if (document.fonts?.ready) {
      await document.fonts.ready
    }
    
    // Wait for React to finish rendering - use a more robust approach
    // React 18's createRoot.render is synchronous for the initial render, but
    // layout effects and ref callbacks fire after paint. We need to wait for
    // the browser to complete layout.
    await new Promise<void>(resolve => {
      // Use requestAnimationFrame to wait for the next paint cycle
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Additional microtask wait for any deferred work
          queueMicrotask(() => resolve())
        })
      })
    })
    
    // Verify the contentDiv has actual rendered content
    const resumePreview = contentDiv.querySelector('.resume-preview')
    if (!resumePreview) {
      console.warn('[Export] .resume-preview element not found in contentDiv')
    }
    
    // Additional wait for any images to load
    const images = contentDiv.querySelectorAll('img')
    if (images.length > 0) {
      const promises: Promise<void>[] = []
      for (const img of images) {
        if (img.complete) continue
        promises.push(new Promise<void>((resolve) => {
          img.onload = () => resolve()
          img.onerror = () => resolve() // Don't fail on image errors
        }))
      }
      await Promise.all(promises)
    }
    
    // Final layout stabilization - wait one more frame after images load
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
  
  const cleanupExportElement = (exportContainer: HTMLElement, root?: ReturnType<typeof createRoot>) => {
    if (root) {
      root.unmount()
    }
    if (exportContainer && exportContainer.parentNode) {
      exportContainer.parentNode.removeChild(exportContainer)
    }
  }
  
  const getExportElement = () => {
    // Fallback to existing preview element for backward compatibility
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
  
  const captureResumeCanvas = async (contentDiv: HTMLElement) => {
    // Find the actual .resume-preview element rendered by TemplateRenderer inside contentDiv
    const resumePreview = contentDiv.querySelector('.resume-preview') as HTMLElement | null
    
    if (!resumePreview) {
      throw new Error('Resume preview element not found in export content')
    }

    const rect = resumePreview.getBoundingClientRect()

    if (rect.width <= 0 || rect.height <= 0) {
      throw new Error('Resume preview has no visible dimensions')
    }

    const captureOptions = {
      scale: Math.min(2.5, Math.max(2, window.devicePixelRatio || 1)),
      useCORS: true,
      allowTaint: false,
      logging: true,
      backgroundColor: templateColors.background,
      imageTimeout: 15000,
      width: Math.ceil(rect.width),
      height: Math.ceil(rect.height),
      windowWidth: Math.max(document.documentElement.clientWidth, Math.ceil(rect.width)),
      windowHeight: Math.max(document.documentElement.clientHeight, Math.ceil(rect.height)),
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDocument: Document) => {
        // In the cloned document, find the .resume-preview element
        // Use the ID we set on the contentDiv to find the right one
        const clonedContent = clonedDocument.getElementById('resume-export-content')
        if (!clonedContent) return
        
        const clonedResume = clonedContent.querySelector('.resume-preview') as HTMLElement | null
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

    let canvas = await html2canvas(resumePreview, captureOptions)

    // Diagnostic: log canvas info
    console.log('[Export] Canvas captured:', {
      width: canvas.width,
      height: canvas.height,
      isBlank: isCanvasBlank(canvas)
    })

    // html2canvas can occasionally produce an empty canvas when a page
    // contains theme CSS variables. Retry with foreignObject rendering.
    if (canvas.width === 0 || canvas.height === 0 || isCanvasBlank(canvas)) {
      console.log('[Export] First capture blank, retrying with foreignObjectRendering...')
      canvas = await html2canvas(resumePreview, {
        ...captureOptions,
        foreignObjectRendering: true,
      })
      console.log('[Export] Retry canvas:', {
        width: canvas.width,
        height: canvas.height,
        isBlank: isCanvasBlank(canvas)
      })
    }

    if (canvas.width === 0 || canvas.height === 0 || isCanvasBlank(canvas)) {
      throw new Error('The resume could not be rendered for export - canvas is blank')
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
    const current = resume
    if (!current) {
      toast.error('Resume not found')
      return
    }
  
    setIsExporting(true)
  
    try {
      // Create a dedicated export element that works regardless of view mode
      const { exportContainer, contentDiv, root } = createExportElement()
      
      try {
        // Wait for React rendering and fonts to load
        await waitForExportReady(contentDiv)
        
        const canvas = await captureResumeCanvas(contentDiv)
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
      } finally {
        cleanupExportElement(exportContainer, root)
      }
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
      setShowExportModal(false)
    }
  }
  
  const exportAsPNG = async () => {
    const current = resume
    if (!current) {
      toast.error('Resume not found')
      return
    }
  
    setIsExporting(true)
  
    try {
      // Create a dedicated export element that works regardless of view mode
      const { exportContainer, contentDiv, root } = createExportElement()
      
      try {
        // Wait for React rendering and fonts to load
        await waitForExportReady(contentDiv)
  
        const canvas = await captureResumeCanvas(contentDiv)
  
        // Wrap toBlob in a Promise to ensure proper async handling
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob)
          }, 'image/png', 1.0)
        })
  
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
      } finally {
        cleanupExportElement(exportContainer, root)
      }
    } catch (error) {
      console.error('PNG export error:', error)
      toast.error('Failed to export PNG. Please try again.')
    } finally {
      setIsExporting(false)
      setShowExportModal(false)
    }
  }
  
  const exportAsJSON = () => {
    const current = resume
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
  
  const exportAsDOCX = async () => {
    const current = resume
    if (!current) {
      toast.error('Resume not found')
      return
    }
  
    setIsExporting(true)
  
    try {
      const blob = await exportResumeToDocx(current.data, {
        templateId: activeTemplateIdRef.current,
        colors: templateColors,
      })
  
      triggerDownload(blob, getDocxSafeFileName(current.title, 'docx'))
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
      case 'pdf':
        void exportAsPDF()
        break
      case 'png':
        void exportAsPNG()
        break
      case 'json':
        exportAsJSON()
        break
      case 'docx':
        void exportAsDOCX()
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
  
  // Full preview mode detection
  const isFullPreview = viewMode === 'preview'
  
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
          <div className="flex items-center gap-4 w-full sm:w-auto flex-wrap gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
              className="flex-1 sm:flex-none min-w-0"
            >
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden" aria-label="Dashboard"><ArrowLeftIcon className="w-4 h-4" /></span>
            </Button>
            
            <div className="hidden sm:block flex-1 min-w-0">
              <h1 className="font-bold text-lg truncate" style={{ color: 'var(--foreground)' }}>{resume.title}</h1>
              <p className="text-xs text-[var(--muted-foreground)] truncate">{resume.template_id}</p>
            </div>
            <div className="sm:hidden flex-1 min-w-0">
              <h1 className="font-bold text-base truncate" style={{ color: 'var(--foreground)' }}>{resume.title}</h1>
            </div>
          </div>
  
          {/* Center: View Mode, Template, AI Toggle */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-wrap gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-[var(--muted)] rounded-lg p-1 w-full sm:w-auto" role="group" aria-label="View mode">
              {(['split', 'editor', 'preview'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={clsx(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-all min-w-[80px] sm:min-w-[90px]',
                    viewMode === mode
                      ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  )}
                  aria-pressed={viewMode === mode}
                >
                  <span className="flex items-center gap-1.5">
                    {mode === 'split' && <MagnifyingGlassPlusIcon className="w-4 h-4" />}
                    {mode === 'editor' && <DocumentTextIcon className="w-4 h-4" />}
                    {mode === 'preview' && <EyeIcon className="w-4 h-4" />}
                    <span className="hidden xs:inline">{mode === 'split' ? 'Split' : mode === 'editor' ? 'Edit' : 'View'}</span>
                  </span>
                </button>
              ))}
            </div>
  
            {/* Template Selector */}
            <div className="relative w-full sm:w-auto">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowTemplateModal(true)}
                leftIcon={<SparklesIcon className="w-4 h-4" />}
                className="gap-2 w-full sm:w-auto"
              >
                <span className="truncate">{templateMeta?.name || activeTemplateId}</span>
                <ChevronDownIcon className="w-4 h-4 flex-shrink-0" />
              </Button>
            </div>
  
            {/* ATS Check Button */}
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate(`/ats-checker/${resume.id}`)}
              leftIcon={<DocumentMagnifyingGlassIcon className="w-4 h-4" />}
              className="hidden xs:flex gap-2"
            >
              ATS Check
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate(`/ats-checker/${resume.id}`)}
              className="xs:hidden p-2"
              aria-label="Run ATS Check"
            >
              <DocumentMagnifyingGlassIcon className="w-5 h-5" />
            </Button>
  
            {/* AI Suggestions Modal Toggle */}
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowAIModal(true)}
              leftIcon={<SparklesIcon className="w-4 h-4" />}
              className={clsx('hidden xs:flex gap-2', showAIModal && 'bg-cosmic-500/10 border-cosmic-500/50')}
            >
              AI Suggestions
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowAIModal(true)}
              className={clsx('xs:hidden p-2', showAIModal && 'bg-cosmic-500/10 border-cosmic-500/50')}
              aria-label="Open AI Suggestions"
            >
              <SparklesIcon className="w-5 h-5" />
            </Button>
          </div>
  
          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Auto-save indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--muted)]">
              <span className={clsx(
                'w-2 h-2 rounded-full',
                autoSaveStatus === 'saved' && 'bg-green-500',
                autoSaveStatus === 'saving' && 'bg-yellow-500 animate-pulse',
                autoSaveStatus === 'pending' && 'bg-blue-500 animate-pulse'
              )} />
              <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
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
                'flex-1 min-w-0 w-full lg:max-w-2xl',
                layout.editor
              )}
            >
              <div className="sticky top-20 space-y-6">
                <PageTransition>
                  <ResumeEditor 
                    data={resumeData}
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
                'w-full lg:flex-1 min-w-0',
                layout.preview
              )}
            >
              <div className={clsx(
                'transition-all duration-300',
                isFullPreview 
                  ? 'flex items-start justify-center p-4 lg:p-8 min-h-[calc(100vh-8rem)]' 
                  : 'h-[calc(100vh-5rem)] overflow-y-auto'
              )}>
                <PageTransition>
                  <ResumePreview 
                    data={resumeData}
                    templateId={activeTemplateId}
                    colors={templateColors}
                    isFullPreview={isFullPreview}
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
              { value: 'docx', label: 'Word Document (DOCX)', desc: 'Editable Microsoft Word format for further editing', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a4 4 0 004-4V8a4 4 0 10-8 0v6a4 4 0 004 4z" /><path d="M8 10h4v4H8v-4zm0 6h4v2H8v-2z" opacity=".5"/></svg> },
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
  
      {/* AI Suggestions Modal - Centered Premium Glassmorphism */}
      <Modal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        title="AI Suggestions"
        description="Enhance your resume with AI-powered insights tailored to your target role"
        size="2xl"
        className="max-w-[1100px] w-[calc(100vw-48px)] max-h-[calc(100dvh-48px)]"
      >
        <AISuggestionsPanel
          resumeData={resumeData}
          targetRole={targetRole}
          jobDescription={jobDescription}
          onApplySummary={handleApplySummary}
          onApplyBullets={handleApplyBullets}
          onApplySkills={handleApplySkills}
          onApplyText={handleApplyText}
          onTargetRoleChange={setTargetRole}
          onJobDescriptionChange={setJobDescription}
          onClose={() => setShowAIModal(false)}
        />
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