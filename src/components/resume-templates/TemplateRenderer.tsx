import React from 'react'
import { ResumeData } from '@/types'
import { ModernProfessional } from './templates/ModernProfessional'
import { ClassicExecutive } from './templates/ClassicExecutive'
import { TechModern } from './templates/TechModern'
import { MinimalEssentials } from './templates/MinimalEssentials'
import { CreativePortfolio } from './templates/CreativePortfolio'
import { ExecutiveLeadership } from './templates/ExecutiveLeadership'

export interface TemplateRendererProps {
  data: ResumeData
  templateId: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    heading: string
  }
}

export function TemplateRenderer({ data, templateId, colors }: TemplateRendererProps) {
  const renderTemplate = () => {
    switch (templateId) {
      case 'modern-1':
      case 'modern-2':
        return <ModernProfessional data={data} colors={colors} />
      case 'classic-1':
        return <ClassicExecutive data={data} colors={colors} />
      case 'creative-1':
        return <CreativePortfolio data={data} colors={colors} />
      case 'minimal-1':
        return <MinimalEssentials data={data} colors={colors} />
      case 'executive-1':
        return <ExecutiveLeadership data={data} colors={colors} />
      default:
        return <ModernProfessional data={data} colors={colors} />
    }
  }

  /*
   * IMPORTANT:
   * Resume templates are rendered inside the application's dark theme.
   * Some templates use CSS variables such as:
   *   text-[var(--foreground)]
   *   text-[var(--muted-foreground)]
   *
   * Those variables normally belong to the app's dark/light theme, not
   * the resume itself. In dark mode they can therefore make text disappear
   * on the white/cream resume page.
   *
   * Override the variables locally at the resume root so every template
   * always uses its own configured resume colors.
   */
  const resumeVariables = {
    '--foreground': colors.text,
    '--muted-foreground': colors.secondary,
    '--background': colors.background,
    '--card': colors.background,
    '--primary': colors.primary,
    '--accent': colors.accent,
    '--heading': colors.heading,
  } as React.CSSProperties

  return (
    <div
      className="resume-preview"
      style={{
        minWidth: '210mm',
        maxWidth: '210mm',
        ...resumeVariables,
      }}
    >
      <div
        className="p-8 md:p-12"
        style={{
          backgroundColor: colors.background,
          color: colors.text,
          minHeight: '297mm',
        }}
      >
        {renderTemplate()}
      </div>
    </div>
  )
}

// Template metadata for the builder
export const TEMPLATE_METADATA = [
  {
    id: 'modern-1',
    name: 'Modern Professional',
    description: 'Clean, ATS-friendly layout with subtle accents',
    category: 'modern' as const,
    isPremium: false,
    atsOptimized: true,
    colors: { primary: '#4f46e5', secondary: '#1e293b', accent: '#6366f1', background: '#ffffff', text: '#0f172a', heading: '#1e293b' },
    preview: 'modern-professional',
  },
  {
    id: 'classic-1',
    name: 'Classic Executive',
    description: 'Traditional format preferred by conservative industries',
    category: 'classic' as const,
    isPremium: false,
    atsOptimized: true,
    colors: { primary: '#1e293b', secondary: '#334155', accent: '#475569', background: '#ffffff', text: '#0f172a', heading: '#1e293b' },
    preview: 'classic-executive',
  },
  {
    id: 'creative-1',
    name: 'Creative Portfolio',
    description: 'Bold design for designers and creative professionals',
    category: 'creative' as const,
    isPremium: true,
    atsOptimized: false,
    colors: { primary: '#d946ef', secondary: '#701a75', accent: '#f0abfc', background: '#fdf4ff', text: '#4a044e', heading: '#701a75' },
    preview: 'creative-portfolio',
  },
  {
    id: 'minimal-1',
    name: 'Minimal Essentials',
    description: 'Ultra-clean, content-first design',
    category: 'minimal' as const,
    isPremium: false,
    atsOptimized: true,
    colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#334155', background: '#ffffff', text: '#0f172a', heading: '#0f172a' },
    preview: 'minimal-essentials',
  },
  {
    id: 'executive-1',
    name: 'Executive Leadership',
    description: 'Sophisticated layout for senior roles',
    category: 'executive' as const,
    isPremium: true,
    atsOptimized: true,
    colors: { primary: '#78350f', secondary: '#92400e', accent: '#b45309', background: '#fffbeb', text: '#451a03', heading: '#78350f' },
    preview: 'executive-leadership',
  },
  {
    id: 'modern-2',
    name: 'Tech Modern',
    description: 'Optimized for software engineering roles',
    category: 'modern' as const,
    isPremium: false,
    atsOptimized: true,
    colors: { primary: '#06b6d4', secondary: '#164e63', accent: '#22d3ee', background: '#f0fdfa', text: '#134e4a', heading: '#0f766e' },
    preview: 'tech-modern',
  },
] as const

export type TemplateId = typeof TEMPLATE_METADATA[number]['id']
export type TemplateCategory = typeof TEMPLATE_METADATA[number]['category']

export function getTemplateById(id: TemplateId) {
  return TEMPLATE_METADATA.find(t => t.id === id) || TEMPLATE_METADATA[0]
}

export function getTemplatesByCategory(category: TemplateCategory) {
  return TEMPLATE_METADATA.filter(t => t.category === category)
}
