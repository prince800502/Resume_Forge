import React, { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { 
  ArrowRightIcon, SparklesIcon, ShieldCheckIcon, BoltIcon, CubeIcon, 
  ChartBarIcon, PaintBrushIcon, DocumentTextIcon, MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon, RocketLaunchIcon, CpuChipIcon, GlobeAltIcon,
  StarIcon, CheckCircleIcon
} from '@heroicons/react/24/solid'
import { 
  ArrowRightIcon as ArrowRightOutline, SparklesIcon as SparklesOutline,
  ShieldCheckIcon as ShieldCheckOutline, BoltIcon as BoltOutline,
  CubeIcon as CubeOutline, ChartBarIcon as ChartBarOutline,
  PaintBrushIcon as PaintBrushOutline, DocumentTextIcon as DocumentTextOutline,
  MagnifyingGlassIcon as MagnifyingGlassOutline, RocketLaunchIcon as RocketLaunchOutline,
  CpuChipIcon as CpuChipOutline, GlobeAltIcon as GlobeAltOutline,
  StarIcon as StarOutline, CheckCircleIcon as CheckCircleOutline
} from '@heroicons/react/24/outline'
import { Button, Card, Badge } from '@/components/ui'
import { FloatingParticles, MorphingBlobs, PageTransition, StaggerContainer } from '@/components/animations/BlackHoleAnimation'

export function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const templatesRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.fromTo(heroRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 1 }
    )

    if (featuresRef.current?.children) {
      tl.fromTo(Array.from(featuresRef.current.children), 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 
        '-=0.5'
      )
    }

    if (templatesRef.current?.children) {
      tl.fromTo(Array.from(templatesRef.current.children), 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 
        '-=0.3'
      )
    }

    tl.fromTo(ctaRef.current, 
      { opacity: 0, scale: 0.95 }, 
      { opacity: 1, scale: 1, duration: 0.6 }, 
      '-=0.2'
    )
  }, [])

  const features = [
    {
      icon: SparklesOutline,
      title: 'AI-Powered Builder',
      desc: 'Smart content suggestions tailored to your role and industry',
      highlight: 'Coming Soon',
    },
    {
      icon: BoltOutline,
      title: 'Live Preview',
      desc: 'See changes instantly as you type with real-time rendering',
      highlight: 'Live',
    },
    {
      icon: ShieldCheckOutline,
      title: 'ATS Optimized',
      desc: 'Templates designed to pass applicant tracking systems',
      highlight: 'Pro',
    },
    {
      icon: CubeOutline,
      title: 'Multiple Templates',
      desc: 'Choose from professional, creative, and modern designs',
      highlight: '6 Templates',
    },
    {
      icon: ChartBarOutline,
      title: 'ATS Score Checker',
      desc: 'Upload any resume and analyze against job descriptions',
      highlight: 'Universal',
    },
    {
      icon: PaintBrushOutline,
      title: 'Custom Themes',
      desc: 'Personalize colors, fonts, and layouts to match your brand',
      highlight: 'Customizable',
    },
  ]

  const templates = [
    { id: 'modern-1', name: 'Modern Professional', category: 'Modern', desc: 'Clean, ATS-friendly layout with subtle accents', premium: false },
    { id: 'classic-1', name: 'Classic Executive', category: 'Classic', desc: 'Traditional format for conservative industries', premium: false },
    { id: 'creative-1', name: 'Creative Portfolio', category: 'Creative', desc: 'Bold design for designers and creative professionals', premium: true },
    { id: 'minimal-1', name: 'Minimal Essentials', category: 'Minimal', desc: 'Ultra-clean, content-first design', premium: false },
    { id: 'executive-1', name: 'Executive Leadership', category: 'Executive', desc: 'Sophisticated layout for senior roles', premium: true },
    { id: 'modern-2', name: 'Tech Modern', category: 'Tech', desc: 'Optimized for software engineering roles', premium: false },
  ]

  const steps = [
    { number: '01', title: 'Choose Template', desc: 'Select from 6 professional templates optimized for ATS' },
    { number: '02', title: 'Build Your Resume', desc: 'Fill in your details with live preview and AI suggestions' },
    { number: '03', title: 'Analyze & Improve', desc: 'Run ATS checks and keyword matching against job descriptions' },
    { number: '04', title: 'Export & Apply', desc: 'Download as PDF or share directly with employers' },
  ]

  const benefits = [
    { icon: CheckCircleOutline, title: 'ATS-Friendly Formats', desc: 'All templates tested against major applicant tracking systems' },
    { icon: CheckCircleOutline, title: 'Universal Resume Analyzer', desc: 'Upload ANY resume - PDF, DOCX, TXT - no lock-in' },
    { icon: CheckCircleOutline, title: 'Real-Time Preview', desc: 'See exactly how your resume looks as you type' },
    { icon: CheckCircleOutline, title: 'Multiple Export Options', desc: 'PDF, JSON, and direct sharing links' },
    { icon: CheckCircleOutline, title: 'Privacy First', desc: 'Your data stays yours. Guest mode available without signup' },
    { icon: CheckCircleOutline, title: 'Free to Start', desc: 'Core features free forever. Premium templates optional' },
  ]

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--background)' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <MorphingBlobs />
        <FloatingParticles count={60} />
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-cosmic-500/15 via-transparent to-nebula-500/15 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-nebula-500/15 via-transparent to-cyan-500/15 blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2" aria-label="ResumeForge Home">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-500 flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-cosmic-600 to-nebula-600 bg-clip-text text-transparent">ResumeForge</span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              <Link to="#features" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Features</Link>
              <Link to="#templates" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Templates</Link>
              <Link to="#how-it-works" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">How It Works</Link>
              <Link to="#benefits" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Benefits</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/login">
                <Button variant="primary" size="sm" leftIcon={<ArrowRightIcon className="w-4 h-4" />}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Copy */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cosmic-500/10 border border-cosmic-500/20 text-cosmic-400 text-sm font-medium mb-6 animate-in">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cosmic-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cosmic-500" />
                  </span>
                  Universal ATS Checker now live — upload any resume
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 bg-gradient-to-r from-white via-cosmic-200 to-nebula-200 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Build Resumes That{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cosmic-400 to-nebula-400">Get Interviews</span>
                </h1>

                <p className="text-lg sm:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                  Professional resume builder with live preview, ATS-optimized templates, and a universal 
                  resume analyzer that works with ANY resume — not just ones created here.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/login">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto" leftIcon={<RocketLaunchIcon className="w-5 h-5" />}>
                      Start Building Free
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto" leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}>
                      Try ATS Checker
                    </Button>
                  </Link>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-2">
                    <CheckCircleOutline className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleOutline className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Guest mode available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleOutline className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Export anytime</span>
                  </div>
                </div>
              </div>

              {/* Right: Dashboard Preview */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-cosmic-500/20 via-transparent to-nebula-500/20 rounded-3xl blur-2xl" />
                <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-xl shadow-void overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--muted)]/50">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 text-center text-xs text-[var(--muted-foreground)] font-mono">app.resumeforge.local</div>
                  </div>
                  <div className="p-6 lg:p-8">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <Card variant="glass" padding="md" className="border border-cosmic-500/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-cosmic-500/20 flex items-center justify-center">
                            <DocumentTextIcon className="w-5 h-5 text-cosmic-500" />
                          </div>
                          <div>
                            <p className="font-semibold">Senior Software Engineer</p>
                            <p className="text-sm text-[var(--muted-foreground)]">Modern Professional Template</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-bold text-cosmic-500">94</span>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-500">Excellent ATS Score</p>
                            <p className="text-xs text-[var(--muted-foreground)]">Last updated today</p>
                          </div>
                        </div>
                      </Card>
                      
                      <Card variant="glass" padding="md">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-nebula-500/20 flex items-center justify-center">
                            <ChartBarIcon className="w-5 h-5 text-nebula-500" />
                          </div>
                          <div>
                            <p className="font-semibold">ATS Analysis</p>
                            <p className="text-sm text-[var(--muted-foreground)]">Upload any resume to analyze</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span>Keywords Matched</span><span className="font-semibold">28/32</span></div>
                          <div className="flex justify-between"><span>Sections Complete</span><span className="font-semibold">6/7</span></div>
                          <div className="flex justify-between"><span>Readability</span><span className="font-semibold">College</span></div>
                        </div>
                      </Card>
                      
                      <Card variant="glass" padding="md">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="font-semibold">ATS Optimized</p>
                            <p className="text-sm text-[var(--muted-foreground)]">All templates pass ATS parsing</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="success" size="sm">PDF Export</Badge>
                          <Badge variant="info" size="sm">JSON Backup</Badge>
                          <Badge variant="cosmic" size="sm">Live Preview</Badge>
                        </div>
                      </Card>
                      
                      <Card variant="glass" padding="md">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <SparklesIcon className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-semibold">AI Assistant</p>
                            <p className="text-sm text-[var(--muted-foreground)]">Smart suggestions & improvements</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-[var(--muted-foreground)]">
                          <p className="flex items-center gap-2"><CheckCircleOutline className="w-4 h-4 text-green-500" /> Bullet point optimization</p>
                          <p className="flex items-center gap-2"><CheckCircleOutline className="w-4 h-4 text-green-500" /> Summary generation</p>
                          <p className="flex items-center gap-2"><CheckCircleOutline className="w-4 h-4 text-green-500" /> Skill suggestions</p>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} id="features" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="cosmic" size="sm" className="mb-4">Key Features</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need to Land Your Dream Job</h2>
              <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                From creation to analysis — a complete toolkit for modern job seekers.
              </p>
            </div>

            <StaggerContainer ref={featuresRef} stagger={0.1} direction="up">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, i) => (
                  <Card key={i} variant="hover" padding="lg" className="group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cosmic-500/20 to-nebula-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-cosmic-500" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <Badge variant={feature.highlight === 'Pro' ? 'warning' : feature.highlight === 'Live' ? 'success' : 'cosmic'} size="sm">
                        {feature.highlight}
                      </Badge>
                    </div>
                    <p className="text-[var(--muted-foreground)]">{feature.desc}</p>
                  </Card>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </section>

        {/* Templates Section */}
        <section ref={templatesRef} id="templates" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--muted)/30' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="info" size="sm" className="mb-4">Templates</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Professional Templates for Every Career Stage</h2>
              <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                Choose from 6 carefully crafted designs — all tested against real ATS systems.
              </p>
            </div>

            <StaggerContainer ref={templatesRef} stagger={0.08} direction="up">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {templates.map((template, i) => (
                  <Card key={template.id} variant="hover" padding="md" className="group relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cosmic-500 to-nebula-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={template.premium ? 'warning' : 'success'} size="sm">
                        {template.premium ? 'Pro' : 'Free'}
                      </Badge>
                      <Badge variant="info" size="sm" className="hidden sm:inline-flex">
                        {template.category}
                      </Badge>
                    </div>

                    <div className="w-16 h-20 rounded-lg mb-4 flex items-center justify-center border-2" 
                      style={{ background: template.id === 'modern-1' ? '#f0fdfa' : template.id === 'classic-1' ? '#f8fafc' : template.id === 'creative-1' ? '#fdf4ff' : template.id === 'minimal-1' ? '#ffffff' : template.id === 'executive-1' ? '#fffbeb' : '#f0fdfa', 
                        borderColor: template.id === 'modern-1' ? '#06b6d4' : template.id === 'classic-1' ? '#334155' : template.id === 'creative-1' ? '#d946ef' : template.id === 'minimal-1' ? '#334155' : template.id === 'executive-1' ? '#b45309' : '#06b6d4' }}>
                      <DocumentTextIcon className="w-8 h-8" style={{ color: template.id === 'modern-1' ? '#06b6d4' : template.id === 'classic-1' ? '#334155' : template.id === 'creative-1' ? '#d946ef' : template.id === 'minimal-1' ? '#334155' : template.id === 'executive-1' ? '#b45309' : '#06b6d4' }} />
                    </div>

                    <h4 className="font-semibold mb-1">{template.name}</h4>
                    <p className="text-sm text-[var(--muted-foreground)] mb-3">{template.desc}</p>
                    
                    <div className="flex gap-1.5">
                      <Badge variant="success" size="sm">ATS</Badge>
                      <Badge variant="cosmic" size="sm">Live Preview</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </StaggerContainer>

            <div className="text-center mt-12">
              <Link to="/login">
                <Button variant="primary" size="lg" leftIcon={<ArrowRightIcon className="w-5 h-5" />}>
                  View All Templates
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="cosmic" size="sm" className="mb-4">How It Works</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">From Zero to Hired in 4 Steps</h2>
              <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                A streamlined workflow designed for busy professionals.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div key={i} className="relative text-center lg:text-left">
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cosmic-500 to-nebula-500 rounded-r-full hidden lg:block" />
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cosmic-500/20 to-nebula-500/20 mb-4">
                      <span className="text-2xl font-bold bg-gradient-to-r from-cosmic-500 to-nebula-500 bg-clip-text text-transparent">{step.number}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-[var(--muted-foreground)]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--muted)/30' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="success" size="sm" className="mb-4">Why Choose ResumeForge</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Job Seekers Who Mean Business</h2>
              <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                Every feature designed to save time and increase your interview rate.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, i) => (
                <Card key={i} variant="hover" padding="lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <benefit.icon className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{benefit.title}</h4>
                      <p className="text-sm text-[var(--muted-foreground)]">{benefit.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative rounded-3xl bg-gradient-to-br from-cosmic-500/20 via-transparent to-nebula-500/20 p-8 lg:p-12 xl:p-16 border border-cosmic-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-cosmic-500/5 via-transparent to-nebula-500/5 rounded-3xl blur-xl" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cosmic-500/10 border border-cosmic-500/20 text-cosmic-400 text-sm font-medium mb-6">
                  <SparklesIcon className="w-4 h-4" />
                  Ready to build your best resume?
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  Join thousands of professionals using ResumeForge
                </h2>

                <p className="text-lg text-[var(--muted-foreground)] mb-8 max-w-2xl mx-auto">
                  Start free. Upgrade only if you need premium templates. Cancel anytime.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/login">
                    <Button variant="primary" size="xl" leftIcon={<RocketLaunchIcon className="w-6 h-6" />}>
                      Create Free Resume
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary" size="xl" leftIcon={<MagnifyingGlassIcon className="w-6 h-6" />}>
                      Analyze My Resume
                    </Button>
                  </Link>
                </div>

                <p className="mt-6 text-sm text-[var(--muted-foreground)]">
                  By continuing, you agree to our{' '}
                  <a href="#" className="text-cosmic-500 hover:text-cosmic-400 underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-cosmic-500 hover:text-cosmic-400 underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--muted)/30' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-500 flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-cosmic-600 to-nebula-600 bg-clip-text text-transparent">ResumeForge</span>
              </Link>
              <p className="text-[var(--muted-foreground)] max-w-sm">
                Professional resume builder with live preview, ATS optimization, and universal resume analysis.
                Built for job seekers who want results.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <li><a href="#features" className="hover:text-[var(--foreground)] transition-colors">Features</a></li>
                <li><a href="#templates" className="hover:text-[var(--foreground)] transition-colors">Templates</a></li>
                <li><a href="/ats-checker" className="hover:text-[var(--foreground)] transition-colors">ATS Checker</a></li>
                <li><a href="#how-it-works" className="hover:text-[var(--foreground)] transition-colors">How It Works</a></li>
                <li><a href="#benefits" className="hover:text-[var(--foreground)] transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <li><a href="#" className="hover:text-[var(--foreground)] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[var(--foreground)] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[var(--foreground)] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[var(--foreground)] transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <li><a href="#" className="hover:text-[var(--foreground)] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[var(--foreground)] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[var(--foreground)] transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              © {new Date().getFullYear()} ResumeForge. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
              <a href="#" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.305-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}