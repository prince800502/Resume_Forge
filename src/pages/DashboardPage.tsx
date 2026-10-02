import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { 
  PlusIcon, DocumentTextIcon, MagnifyingGlassIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon,
  ArrowDownTrayIcon, DocumentDuplicateIcon, TrashIcon, PencilIcon, EyeIcon, StarIcon,
  Squares2X2Icon, DocumentCheckIcon, PaintBrushIcon, ChartBarIcon, SquaresPlusIcon,
  ChevronRightIcon, SparklesIcon, BoltIcon, ShieldCheckIcon, CubeIcon
} from '@heroicons/react/24/outline'
import { 
  PlusIcon as PlusIconSolid, DocumentTextIcon as DocumentTextIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid, Cog6ToothIcon as Cog6ToothIconSolid,
  ArrowRightOnRectangleIcon as ArrowRightOnRectangleIconSolid,
  ArrowDownTrayIcon as ArrowDownTrayIconSolid, DocumentDuplicateIcon as DocumentDuplicateIconSolid,
  TrashIcon as TrashIconSolid, PencilIcon as PencilIconSolid, EyeIcon as EyeIconSolid,
  StarIcon as StarIconSolid, Squares2X2Icon as Squares2X2IconSolid,
  DocumentCheckIcon as DocumentCheckIconSolid, PaintBrushIcon as PaintBrushIconSolid,
  ChartBarIcon as ChartBarIconSolid, SquaresPlusIcon as SquaresPlusIconSolid,
  ChevronRightIcon as ChevronRightIconSolid, SparklesIcon as SparklesIconSolid,
  BoltIcon as BoltIconSolid, ShieldCheckIcon as ShieldCheckIconSolid, CubeIcon as CubeIconSolid
} from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import { useResume } from '@/contexts/ResumeContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button, Card, Badge, Avatar, Modal, Toggle, Input, Divider } from '@/components/ui'
import { FloatingParticles, MorphingBlobs, PageTransition, StaggerContainer } from '@/components/animations/BlackHoleAnimation'
import { BlackHoleAnimation } from '@/components/animations/BlackHoleAnimation'
import toast from 'react-hot-toast'

const templates = [
  {
    id: 'modern-1',
    name: 'Modern Professional',
    description: 'Clean, ATS-friendly layout with subtle accents',
    category: 'modern',
    isPremium: false,
    atsOptimized: true,
    colors: { primary: '#4f46e5', secondary: '#1e293b', accent: '#6366f1', background: '#ffffff', text: '#0f172a', heading: '#1e293b' },
  },
  {
    id: 'classic-1',
    name: 'Classic Executive',
    description: 'Traditional format preferred by conservative industries',
    category: 'classic',
    isPremium: false,
    atsOptimized: true,
    colors: { primary: '#1e293b', secondary: '#334155', accent: '#475569', background: '#ffffff', text: '#0f172a', heading: '#1e293b' },
  },
  {
    id: 'creative-1',
    name: 'Creative Portfolio',
    description: 'Bold design for designers and creative professionals',
    category: 'creative',
    isPremium: true,
    atsOptimized: false,
    colors: { primary: '#d946ef', secondary: '#701a75', accent: '#f0abfc', background: '#fdf4ff', text: '#4a044e', heading: '#701a75' },
  },
  {
    id: 'minimal-1',
    name: 'Minimal Essentials',
    description: 'Ultra-clean, content-first design',
    category: 'minimal',
    isPremium: false,
    atsOptimized: true,
    colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#334155', background: '#ffffff', text: '#0f172a', heading: '#0f172a' },
  },
  {
    id: 'executive-1',
    name: 'Executive Leadership',
    description: 'Sophisticated layout for senior roles',
    category: 'executive',
    isPremium: true,
    atsOptimized: true,
    colors: { primary: '#78350f', secondary: '#92400e', accent: '#b45309', background: '#fffbeb', text: '#451a03', heading: '#78350f' },
  },
  {
    id: 'modern-2',
    name: 'Tech Modern',
    description: 'Optimized for software engineering roles',
    category: 'modern',
    isPremium: false,
    atsOptimized: true,
    colors: { primary: '#06b6d4', secondary: '#164e63', accent: '#22d3ee', background: '#f0fdfa', text: '#134e4a', heading: '#0f766e' },
  },
]

const features = [
  { icon: SparklesIconSolid, title: 'AI-Powered Suggestions', desc: 'Smart content recommendations tailored to your role' },
  { icon: BoltIconSolid, title: 'Live Preview', desc: 'See changes instantly as you type' },
  { icon: ShieldCheckIconSolid, title: 'ATS Optimized', desc: 'Templates designed to pass applicant tracking systems' },
  { icon: CubeIconSolid, title: 'Multiple Templates', desc: 'Choose from professional, creative, and modern designs' },
  { icon: ChartBarIconSolid, title: 'ATS Score Checker', desc: 'Analyze your resume against job descriptions' },
  { icon: PaintBrushIconSolid, title: 'Custom Themes', desc: 'Personalize colors, fonts, and layouts' },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { resumes, currentResume, createResume, setCurrentResume, deleteResume, duplicateResume, loading: resumeLoading } = useResume()
  const { theme, toggleTheme, resolvedTheme } = useTheme()
  
  const [showBlackHole, setShowBlackHole] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [newResumeTitle, setNewResumeTitle] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('modern-1')
  const [filter, setFilter] = useState<'all' | 'recent' | 'favorites'>('all')
  
  const sidebarRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()
    
    tl.fromTo(sidebarRef.current, 
      { x: -300, opacity: 0 }, 
      { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    )
    
    tl.fromTo(mainRef.current, 
      { x: 50, opacity: 0 }, 
      { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 
      '-=0.4'
    )
    
    if (cardsRef.current) {
      tl.fromTo(Array.from(cardsRef.current.children), 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' }, 
        '-=0.3'
      )
    }
  }, [])

  const handleSignOut = () => {
    setShowBlackHole(true)
  }

  const handleBlackHoleComplete = async () => {
    await signOut()
    navigate('/login', { replace: true })
    setShowBlackHole(false)
  }

  const handleCreateResume = async () => {
    if (!newResumeTitle.trim()) {
      toast.error('Please enter a resume title')
      return
    }
    
    try {
      const resume = await createResume(newResumeTitle, selectedTemplate)
      setCurrentResume(resume)
      setShowCreateModal(false)
      setNewResumeTitle('')
      toast.success('Resume created!')
      navigate(`/builder/${resume.id}`)
    } catch (error) {
      toast.error('Failed to create resume')
    }
  }

  const handleEditResume = (id: string) => {
    navigate(`/builder/${id}`)
  }

  const handleDuplicateResume = async (id: string) => {
    try {
      const resume = await duplicateResume(id)
      toast.success('Resume duplicated!')
      setCurrentResume(resume)
      navigate(`/builder/${resume.id}`)
    } catch (error) {
      toast.error('Failed to duplicate resume')
    }
  }

  const handleDeleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return
    
    try {
      await deleteResume(id)
      toast.success('Resume deleted')
    } catch (error) {
      toast.error('Failed to delete resume')
    }
  }

  const handleViewResume = (id: string) => {
    navigate(`/preview/${id}`)
  }

  const filteredResumes = resumes.filter((_r) => {
    if (filter === 'recent') return true
    if (filter === 'favorites') return false
    return true
  })

  return (
    <div className="min-h-screen relative flex" style={{ background: 'var(--background)' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <MorphingBlobs />
        <FloatingParticles count={60} />
      </div>

      {/* Black Hole Animation Overlay */}
      <BlackHoleAnimation isActive={showBlackHole} onComplete={handleBlackHoleComplete} />

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className="fixed left-0 top-0 z-20 h-screen w-72 bg-[var(--card)] border-r border-[var(--card-border)] flex flex-col hidden lg:block"
        style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)' }}
      >
        <div className="p-6 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-500 flex items-center justify-center">
              <SparklesIconSolid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-cosmic-400 to-nebula-400 bg-clip-text text-transparent">ResumeForge</h1>
              <p className="text-xs text-[var(--muted-foreground)]">Premium Builder</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Button
            variant="primary"
            fullWidth
            onClick={() => setShowCreateModal(true)}
            leftIcon={<PlusIconSolid className="w-4 h-4" />}
            className="justify-start gap-3"
          >
            <span>New Resume</span>
            <Badge variant="cosmic" size="sm">New</Badge>
          </Button>

          <Divider className="my-4" />

          <div className="space-y-1">
            <Button
              variant={filter === 'all' ? 'primary' : 'ghost'}
              fullWidth
              onClick={() => setFilter('all')}
              leftIcon={<Squares2X2IconSolid className="w-4 h-4" />}
              className="justify-start gap-3"
            >
              All Resumes
              <Badge variant="cosmic" size="sm">{resumes.length}</Badge>
            </Button>
            <Button
              variant={filter === 'recent' ? 'primary' : 'ghost'}
              fullWidth
              onClick={() => setFilter('recent')}
              leftIcon={<DocumentTextIconSolid className="w-4 h-4" />}
              className="justify-start gap-3"
            >
              Recent
              <Badge variant="info" size="sm">{Math.min(resumes.length, 5)}</Badge>
            </Button>
            <Button
              variant={filter === 'favorites' ? 'primary' : 'ghost'}
              fullWidth
              onClick={() => setFilter('favorites')}
              leftIcon={<StarIconSolid className="w-4 h-4" />}
              className="justify-start gap-3"
            >
              Favorites
              <Badge variant="warning" size="sm">0</Badge>
            </Button>
          </div>

          <Divider label="Tools" className="my-4" />

          <Button
            variant="ghost"
            fullWidth
            onClick={() => navigate('/ats-checker')}
            leftIcon={<DocumentCheckIconSolid className="w-4 h-4" />}
            className="justify-start gap-3"
          >
            ATS Checker
            <Badge variant="success" size="sm">Pro</Badge>
          </Button>

          <Button
            variant="ghost"
            fullWidth
            onClick={() => setShowSettingsModal(true)}
            leftIcon={<Cog6ToothIconSolid className="w-4 h-4" />}
            className="justify-start gap-3"
          >
            Settings
          </Button>
        </nav>

        <div className="p-4 border-t border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <Avatar 
              src={user?.avatar_url} 
              name={user?.full_name || 'Guest User'} 
              size="md" 
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{user?.full_name || 'Guest User'}</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">{user?.email}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            fullWidth
            onClick={handleSignOut}
            leftIcon={<ArrowRightOnRectangleIconSolid className="w-4 h-4" />}
            className="mt-4 justify-start gap-3 text-red-400 hover:bg-red-500/10"
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        ref={mainRef}
        className="flex-1 lg:ml-72 min-h-screen flex flex-col"
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cosmic-600 to-nebula-600 bg-clip-text text-transparent">
              Dashboard
            </h2>
            <Badge variant="cosmic" size="sm" className="animate-pulse">
              {resumeLoading ? 'Loading...' : `${resumes.length} Resumes`}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Toggle
              checked={resolvedTheme === 'dark'}
              onChange={toggleTheme}
              label="Dark"
              description={resolvedTheme === 'dark' ? 'Dark mode' : 'Light mode'}
            />
            <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={resumeLoading}>
              <ArrowRightOnRectangleIconSolid className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {resumes.length === 0 ? (
            <EmptyState 
              onCreateClick={() => setShowCreateModal(true)} 
              onAtsClick={() => navigate('/ats-checker')} 
            />
          ) : (
            <ResumeGrid
              resumes={filteredResumes}
              currentResume={currentResume}
              templates={templates}
              cardsRef={cardsRef}
              onEdit={handleEditResume}
              onDuplicate={handleDuplicateResume}
              onDelete={handleDeleteResume}
              onView={handleViewResume}
              onSelect={setCurrentResume}
              onCreateClick={() => setShowCreateModal(true)}
            />
          )}
        </div>
      </main>

      {/* Create Resume Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Resume"
        description="Choose a template and give your resume a title"
        size="lg"
      >
        <div className="space-y-6">
          <Input
            label="Resume Title"
            placeholder="e.g., Senior Software Engineer Resume"
            value={newResumeTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewResumeTitle(e.target.value)}
            autoFocus
          />

          <div>
            <label className="label">Select Template</label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate === template.id}
                  onSelect={() => setSelectedTemplate(template.id)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateResume} disabled={!newResumeTitle.trim()}>
              Create Resume
              <ChevronRightIconSolid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Settings"
        description="Customize your ResumeForge experience"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-4">Appearance</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Switch between light and dark themes</p>
                </div>
                <Toggle
                  checked={resolvedTheme === 'dark'}
                  onChange={toggleTheme}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">System Preference</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Automatically match your OS theme</p>
                </div>
                <Toggle
                  checked={theme === 'system'}
                  onChange={() => toggleTheme()}
                />
              </div>
            </div>
          </div>

          <Divider />

          <div>
            <h4 className="font-medium mb-4">Data & Privacy</h4>
            <div className="space-y-3">
              <Button variant="ghost" fullWidth className="justify-start" leftIcon={<ArrowDownTrayIconSolid className="w-4 h-4" />}>
                Export All Data
              </Button>
              <Button variant="ghost" fullWidth className="justify-start text-red-400 hover:bg-red-500/10" leftIcon={<TrashIconSolid className="w-4 h-4" />}>
                Delete Account
              </Button>
            </div>
          </div>

          <Divider />

          <div className="flex justify-end gap-3">
            <Button variant="primary" onClick={() => setShowSettingsModal(false)}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Empty State Component
interface EmptyStateProps {
  onCreateClick: () => void
  onAtsClick: () => void
}

function EmptyState({ onCreateClick, onAtsClick }: EmptyStateProps) {
  return (
    <PageTransition>
      <Card variant="glass" padding="lg" className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cosmic-500/20 to-nebula-500/20 flex items-center justify-center mx-auto mb-6">
          <DocumentTextIconSolid className="w-10 h-10 text-cosmic-500" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No Resumes Yet</h3>
        <p className="text-[var(--muted-foreground)] mb-6">
          Start building your professional resume with our AI-powered templates and live preview.
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            variant="primary" 
            size="lg" 
            onClick={onCreateClick}
            leftIcon={<PlusIconSolid className="w-4 h-4" />}
          >
            Create Your First Resume
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            onClick={onAtsClick}
            leftIcon={<DocumentCheckIconSolid className="w-4 h-4" />}
          >
            Try ATS Checker
          </Button>
        </div>

        <Divider label="Key Features" className="my-8" />

        <StaggerContainer stagger={0.1} direction="up">
          <div className="grid md:grid-cols-3 gap-4 text-left">
            {features.map((feature, i) => (
              <Card key={i} variant="hover" padding="md" className="group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cosmic-500/20 to-nebula-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 text-cosmic-500" />
                </div>
                <h4 className="font-semibold mb-1">{feature.title}</h4>
                <p className="text-sm text-[var(--muted-foreground)]">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </StaggerContainer>
      </Card>
    </PageTransition>
  )
}

// Resume Grid Component
interface ResumeGridProps {
  resumes: any[]
  currentResume: any
  templates: any[]
  cardsRef: React.RefObject<HTMLDivElement>
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
  onSelect: (resume: any) => void
  onCreateClick: () => void
}

function ResumeGrid({ 
  resumes, 
  currentResume, 
  templates, 
  cardsRef, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onView, 
  onSelect, 
  onCreateClick 
}: ResumeGridProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Your Resumes</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            {resumes.length} resume{resumes.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button variant="secondary" onClick={onCreateClick} leftIcon={<PlusIconSolid className="w-4 h-4" />}>
          New Resume
        </Button>
      </div>

      <PageTransition>
        <StaggerContainer ref={cardsRef} stagger={0.08} direction="up">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {resumes.map((resume, index) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                template={templates.find(t => t.id === resume.template_id)}
                isCurrent={currentResume?.id === resume.id}
                onEdit={() => onEdit(resume.id)}
                onDuplicate={() => onDuplicate(resume.id)}
                onDelete={() => onDelete(resume.id)}
                onView={() => onView(resume.id)}
                onSelect={() => onSelect(resume)}
                index={index}
              />
            ))}
          </div>
        </StaggerContainer>
      </PageTransition>
    </>
  )
}

// Resume Card Component
interface ResumeCardProps {
  resume: any
  template: any
  isCurrent: boolean
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onView: () => void
  onSelect: () => void
  index: number
}

function ResumeCard({ resume, template, isCurrent, onEdit, onDuplicate, onDelete, onView, onSelect, index }: ResumeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, delay: index * 0.08, ease: 'power3.out' }
      )
    }
  }, [index])

  return (
    <Card 
      ref={cardRef}
      variant={isCurrent ? 'hover' : 'default'} 
      className={`relative overflow-hidden ${isCurrent ? 'border-cosmic-500/50 shadow-cosmic' : ''}`}
      onClick={onSelect}
    >
      {/* Template Color Bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: template ? `linear-gradient(90deg, ${template.colors.primary}, ${template.colors.accent})` : 'linear-gradient(90deg, #6366f1, #d946ef)' }}
      />
      
      {isCurrent && (
        <div className="absolute top-3 right-3">
          <Badge variant="cosmic" size="sm">Active</Badge>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate">{resume.title}</h4>
            <p className="text-sm text-[var(--muted-foreground)] truncate">
              {template?.name || 'Unknown Template'}
            </p>
          </div>
          {template?.isPremium && (
            <Badge variant="warning" size="sm">Pro</Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-4">
          <span className="flex items-center gap-1">
            <DocumentTextIconSolid className="w-3 h-3" />
            Updated {new Date(resume.updated_at).toLocaleDateString()}
          </span>
          {resume.ats_score && (
            <span className="flex items-center gap-1">
              <ChartBarIconSolid className="w-3 h-3" />
              ATS: {resume.ats_score}%
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            variant={isCurrent ? 'primary' : 'secondary'} 
            size="sm" 
            fullWidth
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onEdit(); }}
            leftIcon={<PencilIconSolid className="w-3 h-3" />}
          >
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onView(); }}
            leftIcon={<EyeIconSolid className="w-3 h-3" />}
          >
            View
          </Button>
        </div>

        <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
          <Button 
            variant="ghost" 
            size="sm" 
            fullWidth
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onDuplicate(); }}
            leftIcon={<DocumentDuplicateIconSolid className="w-3 h-3" />}
          >
            Duplicate
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            fullWidth
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onDelete(); }}
            leftIcon={<TrashIconSolid className="w-3 h-3" />}
            className="text-red-400 hover:bg-red-500/10"
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Template Card Component
interface TemplateCardProps {
  template: any
  isSelected: boolean
  onSelect: () => void
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-left group ${
        isSelected 
          ? 'border-cosmic-500 bg-cosmic-500/10 shadow-cosmic' 
          : 'border-[var(--border)] hover:border-cosmic-500/50'
      }`}
      style={{
        background: template.colors.background,
        color: template.colors.text,
      }}
    >
      <div className="absolute top-2 right-2">
        {template.isPremium && <Badge variant="warning" size="sm">Pro</Badge>}
        {template.atsOptimized && <Badge variant="success" size="sm" className="ml-1">ATS</Badge>}
      </div>
      
      <div className="w-12 h-16 rounded-lg mb-3 flex items-center justify-center" 
        style={{ background: template.colors.primary, border: `2px solid ${template.colors.accent}` }}>
        <DocumentTextIconSolid className="w-6 h-6" style={{ color: template.colors.background }} />
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