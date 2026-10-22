import React from 'react'
import { ResumeData } from '@/types'
import { ModernProfessional } from './templates/ModernProfessional'
import { ClassicExecutive } from './templates/ClassicExecutive'
import { TechModern } from './templates/TechModern'
import { MinimalEssentials } from './templates/MinimalEssentials'
import { CreativePortfolio } from './templates/CreativePortfolio'
import { ExecutiveLeadership } from './templates/ExecutiveLeadership'

// Content width inside margins (A4 210mm - 18mm left - 18mm right = 174mm)
const CONTENT_WIDTH_MM = 174
const A4_WIDTH_MM = 210

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
  isFullPreview?: boolean
  isExport?: boolean
}

export function TemplateRenderer({ data, templateId, colors, isFullPreview = false, isExport = false }: TemplateRendererProps) {
  const renderTemplate = () => {
    switch (templateId) {
      case 'modern-1':
      case 'modern-2':
        return <ModernProfessional data={data} colors={colors} isExport={isExport} />
      case 'classic-1':
        return <ClassicExecutive data={data} colors={colors} isExport={isExport} />
      case 'creative-1':
        return <CreativePortfolio data={data} colors={colors} isExport={isExport} />
      case 'minimal-1':
        return <MinimalEssentials data={data} colors={colors} isExport={isExport} />
      case 'executive-1':
        return <ExecutiveLeadership data={data} colors={colors} isExport={isExport} />
      default:
        return <ModernProfessional data={data} colors={colors} isExport={isExport} />
    }
  }

  const resumeVariables = {
    '--foreground': colors.text,
    '--muted-foreground': colors.secondary,
    '--background': colors.background,
    '--card': colors.background,
    '--primary': colors.primary,
    '--accent': colors.accent,
    '--heading': colors.heading,
    // Print-optimized spacing variables - more compact for export to fit content better
    '--space-section': isExport ? '16px' : '32px',      // Between major sections
    '--space-heading': isExport ? '8px' : '16px',       // After section heading
    '--space-entry': isExport ? '12px' : '24px',        // Between entries
    '--space-item': isExport ? '6px' : '12px',          // Between items within entry
    '--space-tight': isExport ? '3px' : '6px',          // Tight spacing
    '--radius-card': isExport ? '0' : '8px',            // Card radius (0 for print)
    '--border-width': isExport ? '1px' : '1px',
  } as React.CSSProperties

  // CONSISTENT WIDTH: Always use content width (174mm) for both preview and export
  // This ensures visual consistency between preview and exported output
  // The ResumePreview wrapper handles showing page margins for full preview mode
  const previewWidth = `${CONTENT_WIDTH_MM}mm`
  const previewStyle: React.CSSProperties = {
    ...resumeVariables,
    minWidth: previewWidth,
    maxWidth: previewWidth,
    width: previewWidth,
    transformOrigin: 'top center',
  }

  const innerStyle: React.CSSProperties = {
    backgroundColor: colors.background,
    color: colors.text,
    minHeight: isFullPreview ? 'auto' : '297mm',
    padding: isExport ? '0' : '0', // No extra padding - templates handle their own spacing
    width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <div
      className="resume-preview"
      style={previewStyle}
    >
      <div
        className="resume-inner"
        style={innerStyle}
      >
        {renderTemplate()}
      </div>
    </div>
  )
}

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