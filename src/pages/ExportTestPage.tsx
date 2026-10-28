import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, DocumentTextIcon, PhotoIcon, CodeBracketIcon } from '@heroicons/react/24/solid'
import { useResume } from '@/contexts/ResumeContext'
import { TemplateRenderer, TEMPLATE_METADATA } from '@/components/resume-templates/TemplateRenderer'
import { downloadResumeAsPdf } from '@/utils/pdfExport'
import { downloadResumeAsPng } from '@/utils/pngExport'
import { exportResumeToDocx, triggerDownload, getSafeFileName as getDocxSafeFileName } from '@/utils/docxExport'
import { Button, Card } from '@/components/ui'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'
import { ResumeData, SkillCategory, ProficiencyLevel } from '@/types'

// Comprehensive test resume data
const createTestResumeData = (): ResumeData => ({
  personal: {
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'alexmorgan.dev',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
    portfolio: 'alexmorgan.dev',
    title: 'Senior Software Engineer'
  },
  summary: 'Results-driven Senior Software Engineer with 8+ years of experience building scalable web applications and distributed systems. Proven track record of leading cross-functional teams, architecting cloud-native solutions, and delivering high-impact products at scale. Passionate about clean code, developer experience, and mentoring the next generation of engineers.',
  experience: [
    {
      id: 'exp1',
      company: 'TechCorp Inc.',
      position: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2021-03-01',
      endDate: '2024-01-15',
      current: false,
      description: [
        'Led a team of 6 engineers to rebuild the core payment processing platform, reducing latency by 40% and increasing throughput to 10K requests/second.',
        'Architected a microservices migration strategy, decomposing a monolithic Rails application into 12 independently deployable services using Go and gRPC.',
        'Implemented comprehensive observability stack (Prometheus, Grafana, Jaeger) reducing MTTR from 45 minutes to under 5 minutes.',
        'Mentored 3 junior engineers through structured code reviews, pair programming, and career development planning.',
        'Established CI/CD pipelines with GitHub Actions, enabling 50+ deployments per day with zero-downtime deployments.'
      ],
      technologies: ['Go', 'TypeScript', 'React', 'Kubernetes', 'PostgreSQL', 'Redis', 'gRPC', 'GraphQL', 'AWS', 'Terraform']
    },
    {
      id: 'exp2',
      company: 'StartupXYZ',
      position: 'Full Stack Engineer',
      location: 'Remote',
      startDate: '2018-06-01',
      endDate: '2021-02-28',
      current: false,
      description: [
        'Built the MVP from scratch using React, Node.js, and PostgreSQL, achieving product-market fit within 6 months.',
        'Designed and implemented a real-time collaboration feature using WebSockets and Operational Transform, supporting 100+ concurrent users per document.',
        'Optimized database queries and added strategic indexes, reducing API p99 latency from 800ms to 120ms.',
        'Integrated third-party APIs (Stripe, SendGrid, Twilio) with robust error handling and retry logic.',
        'Championed TypeScript adoption across the codebase, reducing production bugs by 35%.'
      ],
      technologies: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'WebSockets', 'Docker', 'AWS Lambda', 'Stripe API']
    },
    {
      id: 'exp3',
      company: 'DataFlow Systems',
      position: 'Software Engineer',
      location: 'Austin, TX',
      startDate: '2016-01-15',
      endDate: '2018-05-31',
      current: false,
      description: [
        'Developed ETL pipelines processing 500GB+ daily using Apache Spark and Kafka, enabling real-time analytics for enterprise clients.',
        'Built internal developer tools improving deployment velocity by 60% and reducing configuration errors.',
        'Collaborated with data science team to productionize ML models for anomaly detection in financial transactions.',
        'Participated in on-call rotation and incident response, maintaining 99.9% uptime SLA.'
      ],
      technologies: ['Python', 'Apache Spark', 'Kafka', 'Scala', 'AWS', 'Docker', 'Airflow', 'TensorFlow']
    }
  ],
  education: [
    {
      id: 'edu1',
      institution: 'Stanford University',
      degree: 'Master of Science',
      field: 'Computer Science',
      location: 'Stanford, CA',
      startDate: '2014-09-01',
      endDate: '2016-06-15',
      current: false,
      gpa: '3.9',
      honors: ['Dean\'s List', 'ACM ICPC Regional Finalist']
    },
    {
      id: 'edu2',
      institution: 'University of Texas at Austin',
      degree: 'Bachelor of Science',
      field: 'Computer Engineering',
      location: 'Austin, TX',
      startDate: '2010-09-01',
      endDate: '2014-05-31',
      current: false,
      gpa: '3.7',
      honors: ['Magna Cum Laude', 'Tau Beta Pi']
    }
  ],
  skills: [
    { id: 's1', name: 'Go', category: 'technical' as SkillCategory, proficiency: 'expert' as ProficiencyLevel },
    { id: 's2', name: 'TypeScript', category: 'technical' as SkillCategory, proficiency: 'expert' as ProficiencyLevel },
    { id: 's3', name: 'Python', category: 'technical' as SkillCategory, proficiency: 'advanced' as ProficiencyLevel },
    { id: 's4', name: 'React', category: 'framework' as SkillCategory, proficiency: 'expert' as ProficiencyLevel },
    { id: 's5', name: 'Node.js', category: 'framework' as SkillCategory, proficiency: 'expert' as ProficiencyLevel },
    { id: 's6', name: 'Next.js', category: 'framework' as SkillCategory, proficiency: 'advanced' as ProficiencyLevel },
    { id: 's7', name: 'Kubernetes', category: 'cloud' as SkillCategory, proficiency: 'advanced' as ProficiencyLevel },
    { id: 's8', name: 'AWS', category: 'cloud' as SkillCategory, proficiency: 'advanced' as ProficiencyLevel },
    { id: 's9', name: 'PostgreSQL', category: 'database' as SkillCategory, proficiency: 'advanced' as ProficiencyLevel },
    { id: 's10', name: 'Redis', category: 'database' as SkillCategory, proficiency: 'advanced' as ProficiencyLevel },
    { id: 's11', name: 'GraphQL', category: 'technical' as SkillCategory, proficiency: 'advanced' as ProficiencyLevel },
    { id: 's12', name: 'gRPC', category: 'technical' as SkillCategory, proficiency: 'advanced' as ProficiencyLevel },
    { id: 's13', name: 'Terraform', category: 'tool' as SkillCategory, proficiency: 'intermediate' as ProficiencyLevel },
    { id: 's14', name: 'Docker', category: 'tool' as SkillCategory, proficiency: 'expert' as ProficiencyLevel },
    { id: 's15', name: 'Git', category: 'tool' as SkillCategory, proficiency: 'expert' as ProficiencyLevel },
    { id: 's16', name: 'System Design', category: 'soft' as SkillCategory, proficiency: 'expert' as ProficiencyLevel },
    { id: 's17', name: 'Technical Leadership', category: 'soft' as SkillCategory, proficiency: 'advanced' as ProficiencyLevel },
    { id: 's18', name: 'Mentoring', category: 'soft' as SkillCategory, proficiency: 'advanced' as ProficiencyLevel },
  ],
  projects: [
    {
      id: 'proj1',
      name: 'Distributed Task Queue',
      description: 'Open-source distributed task queue built in Go with Redis backend, supporting priority queues, delayed execution, and horizontal scaling. 2.5K GitHub stars.',
      url: 'github.com/alexmorgan/taskq',
      github: 'github.com/alexmorgan/taskq',
      technologies: ['Go', 'Redis', 'Docker', 'Kubernetes'],
      startDate: '2022-01-01',
      endDate: '2023-12-31',
      highlights: ['Processes 1M+ jobs/day in production', 'Sub-millisecond enqueue latency', 'Used by 3 companies in production']
    },
    {
      id: 'proj2',
      name: 'Real-time Collaboration Editor',
      description: 'A Google Docs-like collaborative text editor using Operational Transform and WebRTC for peer-to-peer synchronization.',
      url: 'collab-editor.dev',
      github: 'github.com/alexmorgan/collab-editor',
      technologies: ['TypeScript', 'React', 'WebRTC', 'WebSockets', 'Yjs'],
      startDate: '2020-06-01',
      endDate: '2021-12-31',
      highlights: ['Supports 50+ concurrent editors', 'Conflict-free replicated data type', 'Offline-first architecture']
    }
  ],
  certifications: [
    {
      id: 'cert1',
      name: 'AWS Certified Solutions Architect - Professional',
      issuer: 'Amazon Web Services',
      date: '2023-03-15',
      expiryDate: '2026-03-15',
      credentialId: 'AWS-SAA-PRO-123456',
      url: 'aws.amazon.com/verification'
    },
    {
      id: 'cert2',
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation',
      date: '2022-09-20',
      expiryDate: '2025-09-20',
      credentialId: 'CKA-789012',
      url: 'cncf.io/verification'
    }
  ],
  languages: [
    { id: 'lang1', name: 'English', proficiency: 'native' },
    { id: 'lang2', name: 'Spanish', proficiency: 'conversational' },
    { id: 'lang3', name: 'Mandarin', proficiency: 'basic' }
  ],
  custom_sections: [
    {
      id: 'custom1',
      title: 'Publications',
      items: [
        {
          id: 'pub1',
          title: 'Scalable Microservice Architectures for High-Throughput Systems',
          subtitle: 'ACM Queue, Vol. 18, No. 4',
          date: '2023-07',
          description: 'Peer-reviewed article on microservice decomposition patterns and communication strategies.'
        },
        {
          id: 'pub2',
          title: 'Optimizing Distributed Consensus in Geo-Replicated Databases',
          subtitle: 'USENIX ATC 2022',
          date: '2022-07',
          description: 'Conference paper presenting a novel consensus protocol reducing cross-region latency by 60%.'
        }
      ]
    },
    {
      id: 'custom2',
      title: 'Speaking Engagements',
      items: [
        {
          id: 'talk1',
          title: 'Building Resilient Systems at Scale',
          subtitle: 'GopherCon 2023',
          date: '2023-09',
          description: 'Keynote on chaos engineering, observability, and incident response practices.'
        },
        {
          id: 'talk2',
          title: 'TypeScript Patterns for Large Codebases',
          subtitle: 'React Conf 2022',
          date: '2022-10',
          description: 'Workshop on advanced TypeScript patterns, strict mode, and migration strategies.'
        }
      ]
    }
  ]
})

export const TEST_RESUME_DATA = createTestResumeData()

export function ExportTestPage() {
  const navigate = useNavigate()
  const { updateResume, resumes } = useResume()
  const [activeTemplateId, setActiveTemplateId] = useState('modern-1')
  const [isFullPreview, setIsFullPreview] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportResults, setExportResults] = useState<Record<string, string>>({})
  
  const templateMeta = TEMPLATE_METADATA.find(t => t.id === activeTemplateId) || TEMPLATE_METADATA[0]
  const templateColors = templateMeta.colors

  const exportAllFormats = async (templateId: string, colors: typeof templateColors) => {
    setIsExporting(true)
    const results: Record<string, string> = {}
    
    try {
      // Test PDF
      await downloadResumeAsPdf(TEST_RESUME_DATA, `Test_${templateId}_PDF`, {
        templateId,
        colors,
        onProgress: (stage, progress) => console.log(`[PDF] ${stage} (${progress}%)`),
      })
      results.pdf = '✓ Success'
      toast.success(`${templateId}: PDF exported`)
    } catch (e) {
      results.pdf = `✗ ${(e as Error).message}`
      toast.error(`${templateId}: PDF failed`)
    }

    // Test PNG
    try {
      await downloadResumeAsPng(TEST_RESUME_DATA, `Test_${templateId}_PNG`, {
        templateId,
        colors,
        onProgress: (stage, progress) => console.log(`[PNG] ${stage} (${progress}%)`),
      })
      results.png = '✓ Success'
      toast.success(`${templateId}: PNG exported`)
    } catch (e) {
      results.png = `✗ ${(e as Error).message}`
      toast.error(`${templateId}: PNG failed`)
    }

    // Test DOCX
    try {
      const blob = await exportResumeToDocx(TEST_RESUME_DATA, { templateId, colors })
      triggerDownload(blob, getDocxSafeFileName(`Test_${templateId}_DOCX`, 'docx'))
      results.docx = '✓ Success'
      toast.success(`${templateId}: DOCX exported`)
    } catch (e) {
      results.docx = `✗ ${(e as Error).message}`
      toast.error(`${templateId}: DOCX failed`)
    }

    setExportResults(prev => ({ ...prev, [templateId]: JSON.stringify(results, null, 2) }))
    setIsExporting(false)
  }

  const exportAllTemplates = async () => {
    setIsExporting(true)
    for (const template of TEMPLATE_METADATA) {
      try {
        await downloadResumeAsPdf(TEST_RESUME_DATA, `Test_${template.id}_PDF`, {
          templateId: template.id,
          colors: template.colors,
        })
        await downloadResumeAsPng(TEST_RESUME_DATA, `Test_${template.id}_PNG`, {
          templateId: template.id,
          colors: template.colors,
        })
        const blob = await exportResumeToDocx(TEST_RESUME_DATA, { templateId: template.id, colors: template.colors })
        triggerDownload(blob, getDocxSafeFileName(`Test_${template.id}_DOCX`, 'docx'))
        toast.success(`${template.id}: All 3 formats exported`)
      } catch (e) {
        toast.error(`${template.id}: ${(e as Error).message}`)
      }
      // Small delay between templates
      await new Promise(r => setTimeout(r, 1000))
    }
    setIsExporting(false)
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Export Test Suite</h1>
          <div className="w-32" />
        </div>

        {/* Template Selector */}
        <Card variant="glass" padding="lg">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Select Template</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {TEMPLATE_METADATA.map(template => (
              <button
                key={template.id}
                onClick={() => setActiveTemplateId(template.id)}
                className={clsx(
                  'p-3 rounded-lg text-left transition-all text-sm',
                  activeTemplateId === template.id
                    ? 'border-2 shadow-lg'
                    : 'border hover:border-cosmic-500/50'
                )}
                style={{
                  borderColor: activeTemplateId === template.id ? template.colors.primary : 'var(--border)',
                  background: activeTemplateId === template.id ? `${template.colors.primary}15` : 'var(--card)',
                  color: template.colors.text,
                }}
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-xs opacity-70 mt-1">{template.id}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Preview Controls */}
        <Card variant="glass" padding="lg">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFullPreview}
                onChange={e => setIsFullPreview(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)]"
              />
              <span style={{ color: 'var(--foreground)' }}>Full Preview Mode (210mm width)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={false}
                onChange={() => {}}
                className="w-4 h-4 rounded border-[var(--border)]"
                disabled
              />
              <span style={{ color: 'var(--foreground)' }}>Export Mode (174mm content width)</span>
            </label>
          </div>
        </Card>

        {/* Preview */}
        <Card variant="glass" padding="lg">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            Preview: {templateMeta.name} ({activeTemplateId})
          </h2>
          <div className={clsx(
            'transition-all duration-300',
            isFullPreview 
              ? 'flex items-start justify-center p-4 min-h-[600px]' 
              : 'h-[600px] overflow-y-auto'
          )}>
            <div className={clsx(
              'relative shadow-2xl rounded-xl overflow-hidden',
              isFullPreview ? 'mx-auto' : ''
            )} style={{ 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: isFullPreview ? '210mm' : undefined
            }}>
              <TemplateRenderer 
                data={TEST_RESUME_DATA} 
                templateId={activeTemplateId} 
                colors={templateColors} 
                isFullPreview={isFullPreview}
                isExport={false}
              />
            </div>
          </div>
        </Card>

        {/* Export Actions */}
        <Card variant="glass" padding="lg">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Export Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="primary" 
              onClick={() => exportAllFormats(activeTemplateId, templateColors)}
              loading={isExporting}
              leftIcon={<DocumentTextIcon className="w-4 h-4" />}
            >
              Export All 3 Formats (Current Template)
            </Button>
            <Button 
              variant="secondary" 
              onClick={exportAllTemplates}
              loading={isExporting}
              leftIcon={<DocumentTextIcon className="w-4 h-4" />}
            >
              Export ALL Templates (18 files)
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setExportResults({})}
            >
              Clear Results
            </Button>
          </div>
        </Card>

        {/* Export Results */}
        <Card variant="glass" padding="lg">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Export Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {TEMPLATE_METADATA.map(template => (
              <div key={template.id} className="p-3 rounded-lg" style={{ background: 'var(--muted)' }}>
                <div className="font-medium mb-2" style={{ color: template.colors.heading }}>
                  {template.name} ({template.id})
                </div>
                <pre className="text-xs whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
                  {exportResults[template.id] || 'Not tested yet'}
                </pre>
              </div>
            ))}
          </div>
        </Card>

        {/* Dimension Reference */}
        <Card variant="glass" padding="lg">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Dimension Reference</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded" style={{ background: 'var(--muted)' }}>
              <div className="font-medium">A4 Width</div>
              <div className="text-2xl font-mono">210 mm</div>
              <div className="text-xs opacity-60">794 CSS px @ 96 DPI</div>
            </div>
            <div className="p-3 rounded" style={{ background: 'var(--muted)' }}>
              <div className="font-medium">Content Width</div>
              <div className="text-2xl font-mono">174 mm</div>
              <div className="text-xs opacity-60">658 CSS px @ 96 DPI</div>
            </div>
            <div className="p-3 rounded" style={{ background: 'var(--muted)' }}>
              <div className="font-medium">Margins</div>
              <div className="text-2xl font-mono">18 mm</div>
              <div className="text-xs opacity-60">Left & Right</div>
            </div>
            <div className="p-3 rounded" style={{ background: 'var(--muted)' }}>
              <div className="font-medium">Capture Scale</div>
              <div className="text-2xl font-mono">3.2x</div>
              <div className="text-xs opacity-60">~300 DPI output</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}