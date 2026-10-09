import React, { useMemo, useRef, useState, useCallback, useEffect, DragEvent } from 'react'
import {
  ArrowUpTrayIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import * as pdfjsLib from 'pdfjs-dist'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

// Vite-compatible PDF.js worker.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

type FileType = 'pdf' | 'docx' | 'txt'

export interface ATSReport {
  score: number
  wordCount: number
  characterCount: number
  contact: {
    email: boolean
    phone: boolean
    linkedin: boolean
    github: boolean
    website: boolean
  }
  sections: { name: string; found: boolean; score: number }[]
  skills: string[]
  strengths: string[]
  issues: string[]
  recommendations: string[]
  formatting: {
    hasTables: boolean
    hasColumns: boolean
    hasImages: boolean
    hasUrls: boolean
  }
  readability: {
    gradeLevel: string
    wordCount: number
  }
  extractedText: string
}

const COMMON_SKILLS = [
  'c', 'c++', 'java', 'python', 'javascript', 'typescript', 'react', 'react.js',
  'node.js', 'node', 'express', 'express.js', 'next.js', 'html', 'css', 'tailwind',
  'bootstrap', 'sql', 'mysql', 'postgresql', 'mongodb', 'firebase', 'supabase',
  'git', 'github', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'rest api', 'rest',
  'api', 'graphql', 'machine learning', 'deep learning', 'artificial intelligence',
  'ai', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn',
  'figma', 'agile', 'scrum', 'communication', 'leadership', 'problem solving',
  'project management', 'team leadership', 'software development', 'web development',
  'frontend', 'backend', 'full stack', 'devops', 'ci/cd', 'testing', 'debugging',
  'architecture', 'design patterns', 'microservices', 'serverless', 'cloud computing',
]

const SECTION_ALIASES: Record<string, string[]> = {
  Summary: ['summary', 'professional summary', 'profile', 'objective', 'career objective', 'about me'],
  Education: ['education', 'academic background', 'academic qualifications', 'degrees'],
  Experience: ['experience', 'work experience', 'professional experience', 'employment', 'employment history', 'work history'],
  Skills: ['skills', 'technical skills', 'core skills', 'technologies', 'tech stack', 'competencies'],
  Projects: ['projects', 'personal projects', 'academic projects', 'project experience', 'key projects'],
  Certifications: ['certifications', 'certificates', 'licenses', 'credentials'],
  Achievements: ['achievements', 'accomplishments', 'awards', 'honors'],
  Publications: ['publications', 'papers', 'research'],
}

function normalizeText(text: string) {
  return text.replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
}

function stripXml(xml: string) {
  return normalizeText(
    decodeXmlEntities(
      xml
        .replace(/<w:tab\s*\/?>/g, ' ')
        .replace(/<w:br\s*\/?>/g, '\n')
        .replace(/<\/w:p>/g, '\n')
        .replace(/<[^>]+>/g, ' '),
    ),
  )
}

/** Extract word/document.xml from a DOCX without mammoth. */
async function extractDocxText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const view = new DataView(buffer)
  const decoder = new TextDecoder('utf-8')
  let offset = 0

  while (offset + 30 <= buffer.byteLength) {
    const signature = view.getUint32(offset, true)

    if (signature !== 0x04034b50) {
      offset += 1
      continue
    }

    const compression = view.getUint16(offset + 8, true)
    const compressedSize = view.getUint32(offset + 18, true)
    const fileNameLength = view.getUint16(offset + 26, true)
    const extraLength = view.getUint16(offset + 28, true)

    const fileNameStart = offset + 30
    const fileName = decoder.decode(new Uint8Array(buffer, fileNameStart, fileNameLength))
    const dataStart = fileNameStart + fileNameLength + extraLength
    const dataEnd = dataStart + compressedSize

    if (fileName === 'word/document.xml' || fileName.endsWith('/word/document.xml')) {
      const compressedData = new Uint8Array(buffer, dataStart, compressedSize)

      if (compression === 0) {
        return stripXml(decoder.decode(compressedData))
      }

      if (compression !== 8) {
        throw new Error(`Unsupported DOCX compression method: ${compression}`)
      }

      if (typeof DecompressionStream === 'undefined') {
        throw new Error('This browser does not support DOCX extraction. Please use a modern browser or convert to PDF/TXT.')
      }

      const stream = new Blob([compressedData])
        .stream()
        .pipeThrough(new DecompressionStream('deflate-raw'))
      const decompressed = await new Response(stream).arrayBuffer()
      return stripXml(decoder.decode(new Uint8Array(decompressed)))
    }

    offset = dataEnd
  }

  throw new Error('Could not read the DOCX document. The file may be corrupted or password-protected.')
}

async function extractPdfText(file: File): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise
  const pages: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    pages.push(
      content.items
        .map((item: any) => (typeof item?.str === 'string' ? item.str : ''))
        .join(' '),
    )
  }

  return normalizeText(pages.join('\n'))
}

async function extractText(file: File, type: FileType) {
  if (type === 'txt') return normalizeText(await file.text())
  if (type === 'pdf') return extractPdfText(file)
  return extractDocxText(file)
}

function detectSections(text: string) {
  const lower = text.toLowerCase()

  return Object.entries(SECTION_ALIASES).map(([name, aliases]) => {
    const found = aliases.some((alias) => {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return new RegExp(`(^|\\n|\\s)${escaped}(\\s|:|$)`, 'i').test(lower)
    })
    return { name, found, score: found ? 100 : 0 }
  })
}

function detectSkills(text: string) {
  const lower = text.toLowerCase()
  return COMMON_SKILLS.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(^|[^a-z0-9+#])${escaped}(?=[^a-z0-9+#]|$)`, 'i').test(lower)
  })
}

function estimateReadingLevel(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
  const syllables = text.match(/[aeiouy]+/gi)?.length || words

  if (sentences === 0) return 'N/A'

  const avgWordsPerSentence = words / sentences
  const avgSyllablesPerWord = syllables / words

  // Flesch-Kincaid Grade Level
  const grade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59

  if (grade <= 6) return 'Elementary'
  if (grade <= 9) return 'Middle School'
  if (grade <= 12) return 'High School'
  if (grade <= 14) return 'College'
  if (grade <= 16) return "Bachelor's"
  if (grade <= 18) return "Master's"
  return 'Doctorate'
}

function buildReport(text: string): ATSReport {
  const normalized = normalizeText(text)
  const lower = normalized.toLowerCase()
  const wordCount = normalized ? normalized.split(/\s+/).filter(Boolean).length : 0
  const characterCount = normalized.length

  const contact = {
    email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(normalized),
    phone: /(?:\+91[-\s]?)?[6-9]\d{9}\b/.test(normalized) || /\+?\d[\d\s()-]{8,}\d/.test(normalized),
    linkedin: /linkedin\.com\/in\//i.test(normalized),
    github: /github\.com\//i.test(normalized),
    website: /https?:\/\/(?!.*linkedin\.com\/in\/)(?!.*github\.com\/)[\w.-]+\.\w+/i.test(normalized),
  }

  const sections = detectSections(normalized)
  const skills = detectSkills(normalized)
  const hasTables = /table/i.test(lower) || /\|.+\|.+\|/.test(normalized)
  const hasColumns = /\t{2,}/.test(normalized) || /column/i.test(lower)
  const hasImages = /\.(png|jpg|jpeg|gif|svg)/i.test(normalized) || /image|photo|headshot/i.test(lower)
  const hasUrls = /https?:\/\/|www\./i.test(normalized)

  const strengths: string[] = []
  const issues: string[] = []
  const recommendations: string[] = []
  let score = Math.min(Object.values(contact).filter(Boolean).length * 5, 25)

  if (contact.email) strengths.push('Professional email address detected.')
  else {
    issues.push('Email address was not detected.')
    recommendations.push('Add a professional email address near your name.')
  }
  if (contact.phone) strengths.push('Phone number detected.')
  else {
    issues.push('Phone number was not detected.')
    recommendations.push('Add a reachable phone number.')
  }
  if (contact.linkedin) strengths.push('LinkedIn profile detected.')
  else recommendations.push('Consider adding a LinkedIn profile URL.')
  if (contact.github) strengths.push('GitHub profile detected.')
  if (contact.website) strengths.push('Personal website/portfolio detected.')

  const requiredSections = ['Summary', 'Education', 'Experience', 'Skills']
  const requiredFound = sections.filter((s) => requiredSections.includes(s.name) && s.found).length
  score += (requiredFound / requiredSections.length) * 25
  if (sections.some((s) => s.name === 'Projects' && s.found)) score += 10
  if (sections.some((s) => s.name === 'Certifications' && s.found)) score += 5

  sections.forEach((section) => {
    if (section.found) strengths.push(`${section.name} section detected.`)
  })
  requiredSections.forEach((name) => {
    const section = sections.find((s) => s.name === name)
    if (section && !section.found) {
      issues.push(`${name} section was not detected.`)
      recommendations.push(`Add a clearly labeled ${name} section.`)
    }
  })

  score += Math.min(skills.length * 1.5, 15)
  if (skills.length >= 8) strengths.push(`${skills.length} recognizable technical/professional skills detected.`)
  else if (skills.length > 0) recommendations.push('Add more relevant skills that match the roles you are applying for.')
  else {
    issues.push('Very few recognizable skills were detected.')
    recommendations.push('Create a clear Technical Skills section.')
  }

  if (wordCount >= 350 && wordCount <= 1200) {
    score += 15
    strengths.push('Resume contains a reasonable amount of searchable text.')
  } else if (wordCount >= 200) {
    score += 10
    recommendations.push('Review resume length and remove unnecessary content or add missing detail.')
  } else {
    score += 5
    issues.push('Very little searchable text was extracted.')
    recommendations.push('Add more relevant content or check whether the resume is image-based.')
  }

  let formattingScore = 15
  if (hasTables) {
    formattingScore -= 5
    issues.push('Table-like formatting was detected.')
    recommendations.push('Avoid complex tables for important resume information because some ATS parsers can read them incorrectly.')
  }
  if (hasColumns) {
    formattingScore -= 4
    issues.push('Possible multi-column/tabular formatting detected.')
    recommendations.push('Prefer a simple single-column layout for maximum ATS compatibility.')
  }
  if (hasImages) {
    formattingScore -= 3
    issues.push('Possible image/photo content detected.')
    recommendations.push('Avoid placing important text inside images.')
  }
  score += Math.max(formattingScore, 0)
  if (hasUrls) strengths.push('Web links were detected.')

  const actionWords = ['developed', 'built', 'created', 'implemented', 'designed', 'optimized', 'managed', 'led', 'improved', 'automated', 'analyzed', 'engineered', 'delivered', 'launched', 'architected', 'spearheaded', 'initiated']
  const actionWordCount = actionWords.filter((word) => new RegExp(`\\b${word}\\b`, 'i').test(lower)).length
  if (actionWordCount >= 4) strengths.push('Strong action-oriented language detected.')
  else recommendations.push('Use more measurable action verbs such as built, developed, implemented, optimized, and automated.')

  const numberCount = (normalized.match(/\b\d+(?:\.\d+)?%?\b/g) || []).length
  if (numberCount >= 4) strengths.push('Quantifiable achievements/metrics detected.')
  else recommendations.push('Add measurable results such as percentages, time saved, users served, or performance improvements where possible.')

  score = Math.round(Math.max(0, Math.min(100, score)))
  if (score >= 80) strengths.push('Overall ATS structure is strong.')
  else if (score >= 60) recommendations.push('The resume has a workable ATS structure but several areas can be improved.')
  else issues.push('The resume needs several ATS compatibility improvements.')

  return {
    score,
    wordCount,
    characterCount,
    contact,
    sections,
    skills,
    strengths: [...new Set(strengths)],
    issues: [...new Set(issues)],
    recommendations: [...new Set(recommendations)],
    formatting: { hasTables, hasColumns, hasImages, hasUrls },
    readability: {
      gradeLevel: estimateReadingLevel(normalized),
      wordCount,
    },
    extractedText: normalized,
  }
}

function scoreClass(score: number) {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}

function scoreLabel(score: number) {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Needs Work'
  return 'Poor'
}

interface ResumeUploadAnalyzerProps {
  onAnalysisComplete?: (report: ATSReport, file: File) => void
  jobDescription?: string
  onJobDescriptionMatch?: (report: ATSReport, jobDescription: string) => void
}

export default function ResumeUploadAnalyzer({ onAnalysisComplete, jobDescription, onJobDescriptionMatch }: ResumeUploadAnalyzerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dropzoneRef = useRef<HTMLDivElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [report, setReport] = useState<ATSReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [showExtractedText, setShowExtractedText] = useState(false)
  const [jobMatch, setJobMatch] = useState<{
    matchedKeywords: string[]
    missingKeywords: string[]
    matchPercentage: number
  } | null>(null)

  const fileType = useMemo<FileType | null>(() => {
    if (!file) return null
    const extension = file.name.split('.').pop()?.toLowerCase()
    return extension === 'pdf' || extension === 'docx' || extension === 'txt' ? extension : null
  }, [file])

  // Job description keyword matching - moved to top level
  useEffect(() => {
    if (jobDescription && report) {
      const resumeKeywords = new Set(
        report.extractedText.toLowerCase()
          .split(/\W+/)
          .filter(w => w.length > 2)
      )
      
      const jdKeywords = jobDescription.toLowerCase()
        .split(/\W+/)
        .filter(w => w.length > 2)
        .filter(w => !['the', 'and', 'for', 'with', 'you', 'your', 'are', 'will', 'this', 'that', 'have', 'has', 'had', 'been', 'from', 'they', 'their', 'our', 'work', 'job', 'role', 'position', 'company', 'team', 'skills', 'experience', 'years', 'ability', 'knowledge', 'understanding', 'strong', 'good', 'excellent'].includes(w))
      
      const uniqueJdKeywords = [...new Set(jdKeywords)]
      const matched = uniqueJdKeywords.filter(kw => resumeKeywords.has(kw))
      const missing = uniqueJdKeywords.filter(kw => !resumeKeywords.has(kw))
      const matchPercentage = uniqueJdKeywords.length > 0 ? Math.round((matched.length / uniqueJdKeywords.length) * 100) : 0
      
      setJobMatch({ matchedKeywords: matched, missingKeywords: missing, matchPercentage })
    } else {
      setJobMatch(null)
    }
  }, [jobDescription, report])

  const handleFile = useCallback(async (selectedFile: File) => {
    console.log('[ATS Upload] file selected:', selectedFile.name)
    
    const extension = selectedFile.name.split('.').pop()?.toLowerCase()
    if (!extension || !['pdf', 'docx', 'txt'].includes(extension)) {
      toast.error('Please upload a PDF, DOCX, or TXT resume.')
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('Maximum file size is 10 MB.')
      return
    }

    setFile(selectedFile)
    setReport(null)
    setText('')
    setLoading(true)

    try {
      const extractedText = await extractText(selectedFile, extension as FileType)
      if (!extractedText.trim()) {
        throw new Error('No readable text was found. This appears to be a scanned/image-only PDF. OCR is required.')
      }
      setText(extractedText)
      const newReport = buildReport(extractedText)
      setReport(newReport)
      toast.success('Resume analyzed successfully.')
      onAnalysisComplete?.(newReport, selectedFile)
      
      // If job description is provided, also run keyword matching
      if (jobDescription && onJobDescriptionMatch) {
        onJobDescriptionMatch(newReport, jobDescription)
      }
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Unable to analyze this resume.')
      setFile(null)
      setText('')
      setReport(null)
    } finally {
      setLoading(false)
      // Reset input value so the same file can be selected again
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [jobDescription, onAnalysisComplete, onJobDescriptionMatch])

  const reset = useCallback(() => {
    setFile(null)
    setText('')
    setReport(null)
    setLoading(false)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!loading) setDragActive(true)
  }, [loading])

  const handleDragLeave = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Only deactivate if leaving the dropzone entirely
    if (dropzoneRef.current && !dropzoneRef.current.contains(e.relatedTarget as Node)) {
      setDragActive(false)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (loading) return
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFile(droppedFile)
    }
  }, [loading, handleFile])

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (selected) handleFile(selected)
  }, [handleFile])

  // Upload state - no report yet
  if (!report) {
    return (
      <section className="mb-6" ref={dropzoneRef}>
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="p-5 sm:p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-cosmic-500/15 flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-6 h-6 text-cosmic-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Resume ATS Analyzer</h2>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">Upload any resume to get an instant ATS compatibility report.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* Label + native file input makes the picker reliable across browsers. */}
            <label
              htmlFor="resume-file-upload"
              aria-disabled={loading}
              className={clsx(
                'block w-full rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all relative',
                loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-cosmic-500 hover:bg-cosmic-500/5',
                dragActive && !loading && 'border-cosmic-500 bg-cosmic-500/10'
              )}
              style={{ borderColor: 'var(--border)' }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                id="resume-file-upload"
                type="file"
                disabled={loading}
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className={clsx(
                  'absolute inset-0 w-full h-full cursor-pointer',
                  'opacity-0',
                  'z-10'
                )}
                onChange={handleInputChange}
                aria-label="Upload resume file"
              />
              
              <div className="relative z-0">
                <div className="w-14 h-14 rounded-2xl bg-cosmic-500/10 flex items-center justify-center mx-auto mb-4 transition-colors" style={dragActive && !loading ? { backgroundColor: 'var(--cosmic-500)', opacity: 0.2 } : {}}>
                  <ArrowUpTrayIcon className="w-7 h-7 text-cosmic-500 transition-colors" style={dragActive && !loading ? { color: 'var(--cosmic-500)' } : {}} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{loading ? 'Analyzing your resume...' : dragActive ? 'Drop your resume here' : 'Upload your resume'}</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">{loading ? 'Please wait while we extract and analyze your resume' : 'Click or drag and drop to choose your resume'}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['PDF', 'DOCX', 'TXT'].map((type) => (
                    <span key={type} className="px-3 py-1 rounded-full text-xs font-medium border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                      {type}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-4">Maximum file size: 10 MB</p>
                {dragActive && !loading && (
                  <p className="text-sm text-cosmic-500 mt-2 font-medium">Release to upload</p>
                )}
              </div>
            </label>

            {file && (
              <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-[var(--muted)] animate-slide-in">
                <DocumentTextIcon className="w-6 h-6 text-cosmic-500" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{(file.size / 1024 / 1024).toFixed(2)} MB{fileType ? ` • ${fileType.toUpperCase()}` : ''}</p>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="p-1 rounded-lg hover:bg-[var(--muted-foreground)]/10 transition-colors text-[var(--muted-foreground)]"
                  aria-label="Remove file"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-6" ref={dropzoneRef}>
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="p-5 sm:p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-cosmic-500/15 flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="w-6 h-6 text-cosmic-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Resume ATS Analyzer</h2>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">Upload any resume to get an instant ATS compatibility report.</p>
              </div>
            </div>
            <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-[var(--muted)]" style={{ borderColor: 'var(--border)' }}>
              <ArrowPathIcon className="w-4 h-4" />
              Analyze Another
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[220px_1fr] mb-6">
            <div className="rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--border)' }}>
              <div className={`${scoreClass(report.score)} text-6xl font-black`}>{report.score}</div>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">ATS Score / 100</p>
              <p className={`${scoreClass(report.score)} text-lg font-bold mt-2`}>{scoreLabel(report.score)}</p>
            </div>
            <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold truncate">{file?.name}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">{report.wordCount} words • {report.characterCount.toLocaleString()} characters</p>
                </div>
                <MagnifyingGlassIcon className="w-6 h-6 text-cosmic-500" />
              </div>
              <div className="w-full h-3 rounded-full bg-[var(--muted)] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 bg-cosmic-500" style={{ width: `${report.score}%` }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
                <MiniStat label="Email" good={report.contact.email} />
                <MiniStat label="Phone" good={report.contact.phone} />
                <MiniStat label="LinkedIn" good={report.contact.linkedin} />
                <MiniStat label="GitHub" good={report.contact.github} />
                <MiniStat label="Website" good={report.contact.website} />
              </div>
            </div>
          </div>

          {/* Job Description Match */}
          {jobMatch && (
            <div className="rounded-2xl border p-5 mb-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cosmic-500/20 flex items-center justify-center">
                    <MagnifyingGlassIcon className="w-5 h-5 text-cosmic-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Job Description Match</h3>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${jobMatch.matchPercentage >= 70 ? 'text-green-500' : jobMatch.matchPercentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {jobMatch.matchPercentage}%
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">Keyword Match</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-green-500 mb-2">Matched Keywords ({jobMatch.matchedKeywords.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {jobMatch.matchedKeywords.length > 0 ? (
                      jobMatch.matchedKeywords.slice(0, 20).map(kw => (
                        <span key={kw} className="px-2 py-1 rounded-full text-xs border bg-green-500/10 text-green-700 dark:text-green-300" style={{ borderColor: 'var(--border)' }}>{kw}</span>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--muted-foreground)]">No keywords matched</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-500 mb-2">Missing Keywords ({jobMatch.missingKeywords.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {jobMatch.missingKeywords.length > 0 ? (
                      jobMatch.missingKeywords.slice(0, 20).map(kw => (
                        <span key={kw} className="px-2 py-1 rounded-full text-xs border bg-red-500/10 text-red-700 dark:text-red-300" style={{ borderColor: 'var(--border)' }}>{kw}</span>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--muted-foreground)]">No missing keywords</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Resume Sections</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {report.sections.map((section) => (
                <div key={section.name} className="rounded-xl border p-3 transition-colors hover:shadow-md" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    {section.found ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <XCircleIcon className="w-5 h-5 text-red-500" />}
                    <span className="text-sm font-medium">{section.name}</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">{section.found ? 'Detected' : 'Missing'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Detected Skills ({report.skills.length})</h3>
            {report.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {report.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 rounded-full text-sm border transition-colors hover:shadow-md" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">No common skills were detected.</p>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-2 mb-6">
            <ReportList title="Strengths" items={report.strengths} icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />} emptyText="No major strengths detected yet." />
            <ReportList title="Issues" items={report.issues} icon={<ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />} emptyText="No major issues detected." />
          </div>

          <div className="rounded-2xl border p-5 mb-6" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className="w-5 h-5 text-cosmic-500" />
              <h3 className="text-lg font-semibold">Recommendations</h3>
            </div>
            <div className="space-y-3">
              {report.recommendations.map((recommendation, index) => (
                <div key={`${recommendation}-${index}`} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cosmic-500/10 text-cosmic-500 flex items-center justify-center text-xs font-bold flex-shrink-0">{index + 1}</span>
                  <p className="text-sm text-[var(--foreground)]">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">ATS Formatting Check</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <FormattingItem label="Tables" bad={report.formatting.hasTables} />
              <FormattingItem label="Columns" bad={report.formatting.hasColumns} />
              <FormattingItem label="Images" bad={report.formatting.hasImages} />
              <FormattingItem label="URLs" bad={false} neutral={report.formatting.hasUrls} />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Readability</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat label="Word Count" value={report.readability.wordCount} />
              <MiniStat label="Reading Level" value={report.readability.gradeLevel} />
              <MiniStat label="Characters" value={report.characterCount.toLocaleString()} />
              <MiniStat label="ATS Score" value={`${report.score}/100`} />
            </div>
          </div>

          <details className="mt-6 group">
            <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
              View extracted resume text
              <ChevronDownIcon className="w-4 h-4 text-[var(--muted-foreground)] group-open:rotate-180 transition-transform" />
            </summary>
            <div className="mt-3 rounded-xl border p-4 max-h-72 overflow-auto whitespace-pre-wrap text-xs leading-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>{text}</div>
          </details>
        </div>
      </div>
    </section>
  )
}

function MiniStat({ label, good, value }: { label: string; good?: boolean; value?: string | number }) {
  if (typeof good === 'boolean') {
    return (
      <div className="rounded-xl bg-[var(--muted)] p-3">
        <div className="flex items-center gap-2">
          {good ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <XCircleIcon className="w-4 h-4 text-red-500" />}
          <span className="text-xs font-medium">{label}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--border)' }}>
      <div className="text-lg font-bold text-[var(--foreground)]">{value}</div>
      <div className="text-xs text-[var(--muted-foreground)]">{label}</div>
    </div>
  )
}

function ReportList({ title, items, icon, emptyText }: { title: string; items: string[]; icon: React.ReactNode; emptyText: string }) {
  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 mb-4">{icon}<h3 className="text-lg font-semibold">{title}</h3></div>
      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--muted-foreground)] flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--muted-foreground)]">{emptyText}</p>
      )}
    </div>
  )
}

function FormattingItem({ label, bad, neutral = false }: { label: string; bad: boolean; neutral?: boolean }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2">
        {bad ? <XCircleIcon className="w-5 h-5 text-red-500" /> : neutral ? <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" /> : <CheckCircleIcon className="w-5 h-5 text-green-500" />}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-xs text-[var(--muted-foreground)] mt-2">{bad ? 'Potential issue' : neutral ? 'Detected' : 'OK'}</p>
    </div>
  )
}