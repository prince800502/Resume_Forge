import React from 'react'
import { clsx } from 'clsx'
import { ResumeData } from '@/types'
import { TemplateRenderer } from '@/components/resume-templates/TemplateRenderer'

interface ResumePreviewProps {
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
  className?: string
  isFullPreview?: boolean
}

export function ResumePreview({ 
  data, 
  templateId, 
  colors, 
  className = '',
  isFullPreview = false
}: ResumePreviewProps) {
  return (
    <div className={clsx('resume-preview-container relative', className, isFullPreview && 'w-full max-w-[210mm] mx-auto')}>
      {/* Template indicator - hide in full preview */}
      {!isFullPreview && (
        <div className="absolute top-2 right-2 z-10">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-black/50 text-white backdrop-blur">
            {templateId}
          </span>
        </div>
      )}
      
      {/* Preview frame */}
      <div className={clsx(
        'relative shadow-2xl rounded-xl overflow-hidden',
        isFullPreview ? 'mx-auto' : ''
      )} 
           style={{ 
             boxShadow: isFullPreview ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
             maxWidth: isFullPreview ? '210mm' : undefined
           }}>
        <TemplateRenderer 
          data={data} 
          templateId={templateId} 
          colors={colors} 
        />
      </div>
      
      {/* Zoom controls - only show in split/editor mode */}
      {!isFullPreview && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button className="p-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--muted-foreground)]/10 transition-colors"
                  aria-label="Zoom out">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <span className="text-sm text-[var(--muted-foreground)] px-3">100%</span>
          <button className="p-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--muted-foreground)]/10 transition-colors"
                  aria-label="Zoom in">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}