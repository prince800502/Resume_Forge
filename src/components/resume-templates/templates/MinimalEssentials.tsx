import React from 'react'
import { ResumeData } from '@/types'
import { clsx } from 'clsx'

interface MinimalEssentialsProps {
  data: ResumeData
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    heading: string
  }
  isExport?: boolean
}

export function MinimalEssentials({ data, colors, isExport = false }: MinimalEssentialsProps) {
  const { personal, summary, experience, education, skills, projects, certifications, languages, custom_sections } = data

  const style = {
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  }

  const headingStyle = {
    color: colors.heading,
    fontWeight: 600,
    letterSpacing: '-0.02em',
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const getDateRange = (start: string, end: string, current: boolean) => {
    const startDate = formatDate(start)
    const endDate = current ? 'Present' : formatDate(end)
    return `${startDate} – ${endDate}`
  }

  const sectionStyle = {
    marginBottom: 'var(--space-section)',
  }

  const headingStyle2 = {
    ...headingStyle,
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginBottom: 'var(--space-heading)',
  }

  const entryStyle = {
    marginBottom: 'var(--space-entry)',
  }

  return (
    <div className="minimal-essentials-template" style={style} data-template="minimal-essentials">
      {/* Header - Clean and minimal */}
      <header className="mb-[var(--space-section)] pb-[var(--space-heading)] border-b" style={{ borderColor: `${colors.primary}30` }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div>
            <h1 className="text-3xl md:text-4xl mb-1" style={headingStyle}>
              {personal.firstName} {personal.lastName}
            </h1>
            {personal.title && (
              <p className="text-lg font-normal" style={{ color: colors.accent }}>
                {personal.title}
              </p>
            )}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: '0.5rem',
          }}>
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.location && <span>{personal.location}</span>}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: '0.5rem',
            marginTop: '0.5rem',
          }}>
              {personal.linkedin && (
                <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} 
                   target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: colors.accent }}>
                  LinkedIn
                </a>
              )}
              {personal.github && (
                <a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} 
                   target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: colors.accent }}>
                  GitHub
                </a>
              )}
              {personal.website && (
                <a href={personal.website.startsWith('http') ? personal.website : `https://${personal.website}`} 
                   target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: colors.accent }}>
                  Portfolio
                </a>
              )}
            </div>
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section style={sectionStyle} data-section="summary">
          <h2 style={headingStyle2}>
            Summary
          </h2>
          <p className="text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section style={sectionStyle} data-section="experience">
          <h2 style={headingStyle2}>
            Experience
          </h2>
          <div className="space-y-[var(--space-entry)]">
            {experience.map((exp) => (
              <div key={exp.id} style={entryStyle}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginBottom: 'var(--space-tight)',
                }}>
                  <div>
                    <h3 className="font-medium text-lg" style={headingStyle}>{exp.position}</h3>
                    <p style={{ color: colors.accent }}>{exp.company}</p>
                    {exp.location && <p className="text-sm text-[var(--muted-foreground)]">{exp.location}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: colors.accent }}>
                      {getDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                  </div>
                </div>
                {exp.description.length > 0 && (
                  <ul className="list-disc list-inside space-y-[var(--space-item)] text-[var(--foreground)] leading-relaxed ml-4">
                    {exp.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies.length > 0 && (
                  <p className="mt-[var(--space-item)] text-sm text-[var(--muted-foreground)]">
                    <span style={{ color: colors.primary }}>Stack:</span> {exp.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section style={sectionStyle} data-section="education">
          <h2 style={headingStyle2}>
            Education
          </h2>
          <div className="space-y-[var(--space-item)]">
            {education.map((edu) => (
              <div key={edu.id} style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginBottom: 'var(--space-entry)',
                }}>
                <div>
                  <p className="font-medium" style={headingStyle}>
                    {edu.degree}{edu.field && ` in ${edu.field}`}
                  </p>
                  <p>{edu.institution}</p>
                  {edu.location && <p className="text-sm text-[var(--muted-foreground)]">{edu.location}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm" style={{ color: colors.accent }}>
                    {getDateRange(edu.startDate, edu.endDate, edu.current)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section style={sectionStyle} data-section="skills">
          <h2 style={headingStyle2}>
            Skills
          </h2>
          <p className="text-[var(--foreground)]">
            {skills.map((skill, i) => (
              <span key={skill.id}>
                {skill.name} ({skill.proficiency}){i < skills.length - 1 ? '; ' : ''}
              </span>
            ))}
          </p>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section style={sectionStyle} data-section="projects">
          <h2 style={headingStyle2}>
            Projects
          </h2>
          <div className="space-y-[var(--space-item)]">
            {projects.map((project) => (
              <div key={project.id} style={entryStyle}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginBottom: 'var(--space-tight)',
                }}>
                  <h3 className="font-medium" style={headingStyle}>{project.name}</h3>
                  <div className="flex gap-3">
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm underline hover:no-underline" style={{ color: colors.accent }}>
                        Live
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-sm underline hover:no-underline" style={{ color: colors.accent }}>
                        Code
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-[var(--foreground)] text-sm mb-[var(--space-tight)]">{project.description}</p>
                {project.technologies.length > 0 && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {project.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section style={sectionStyle} data-section="certifications">
          <h2 style={headingStyle2}>
            Certifications
          </h2>
          <div className="space-y-[var(--space-tight)]">
            {certifications.map((cert) => (
              <div key={cert.id} style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: '0.5rem',
                padding: '0.75rem',
                borderColor: `${colors.primary}20`,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderRadius: 'var(--radius-card)',
              }}>
                <div>
                  <p className="font-medium" style={headingStyle}>{cert.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{cert.issuer} • {formatDate(cert.date)}</p>
                </div>
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-sm underline hover:no-underline" style={{ color: colors.accent }}>
                    Verify
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section style={sectionStyle} data-section="languages">
          <h2 style={headingStyle2}>
            Languages
          </h2>
          <p className="text-[var(--foreground)]">
            {languages.map((lang, i) => (
              <span key={lang.id}>
                {lang.name} ({lang.proficiency}){i < languages.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
        </section>
      )}

      {/* Custom Sections */}
      {custom_sections.map((section) => (
        <section key={section.id} style={sectionStyle} data-section={`custom-${section.id}`}>
          <h2 style={headingStyle2}>
            {section.title}
          </h2>
          <div className="space-y-[var(--space-item)]">
            {section.items.map((item) => (
              <div key={item.id} className="pl-4 border-l" style={{ borderColor: `${colors.primary}30` }}>
                <h3 className="font-medium" style={headingStyle}>{item.title}</h3>
                {item.subtitle && <p className="text-sm" style={{ color: colors.accent }}>{item.subtitle}</p>}
                {item.date && <p className="text-sm text-[var(--muted-foreground)]">{item.date}</p>}
                {item.description && <p className="mt-1 text-[var(--foreground)]">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}