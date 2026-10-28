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

  // Inline styles for layout-critical elements
  const headerFlex = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '1rem',
  } as React.CSSProperties

  const flexEndGapHalf = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  } as React.CSSProperties

  const flexRowBetween = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '0.5rem',
  } as React.CSSProperties

  const flexGap3 = {
    display: 'flex',
    gap: '0.75rem',
  } as React.CSSProperties

  const textRight = {
    textAlign: 'right' as const,
  } as React.CSSProperties

  const certFlex = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '0.5rem',
    padding: '0.75rem',
    borderColor: `${colors.primary}20`,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: 'var(--radius-card)',
  } as React.CSSProperties

  const borderLeftStyle = {
    paddingLeft: '1rem',
    borderLeftWidth: '2px',
    borderLeftStyle: 'solid' as const,
    borderLeftColor: `${colors.primary}30`,
  } as React.CSSProperties

  return (
    <div className="minimal-essentials-template" style={style} data-template="minimal-essentials">
      {/* Header - Clean and minimal */}
      <header style={{ ...sectionStyle, paddingBottom: 'var(--space-heading)', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: `${colors.primary}30` }}>
        <div style={headerFlex}>
          <div>
            <h1 style={{ ...headingStyle, fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', marginBottom: '0.25rem' }}>
              {personal.firstName} {personal.lastName}
            </h1>
            {personal.title && (
              <p style={{ fontSize: '1.125rem', fontWeight: 'normal', color: colors.accent }}>
                {personal.title}
              </p>
            )}
          </div>
          <div style={flexEndGapHalf}>
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.location && <span>{personal.location}</span>}
          </div>
          <div style={{ ...flexEndGapHalf, marginTop: '0.5rem' }}>
              {personal.linkedin && (
                <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} 
                   target="_blank" rel="noopener noreferrer" style={{ color: colors.accent, textDecoration: 'underline' }}>
                  LinkedIn
                </a>
              )}
              {personal.github && (
                <a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} 
                   target="_blank" rel="noopener noreferrer" style={{ color: colors.accent, textDecoration: 'underline' }}>
                  GitHub
                </a>
              )}
              {personal.website && (
                <a href={personal.website.startsWith('http') ? personal.website : `https://${personal.website}`} 
                   target="_blank" rel="noopener noreferrer" style={{ color: colors.accent, textDecoration: 'underline' }}>
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
          <p style={{ color: 'var(--foreground)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section style={sectionStyle} data-section="experience">
          <h2 style={headingStyle2}>
            Experience
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-entry)' }}>
            {experience.map((exp) => (
              <div key={exp.id} style={entryStyle}>
                <div style={{ ...flexRowBetween, marginBottom: 'var(--space-tight)' }}>
                  <div>
                    <h3 style={{ ...headingStyle, fontWeight: 500, fontSize: '1.125rem' }}>{exp.position}</h3>
                    <p style={{ color: colors.accent }}>{exp.company}</p>
                    {exp.location && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{exp.location}</p>}
                  </div>
                  <div style={textRight}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: colors.accent }}>
                      {getDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                  </div>
                </div>
                {exp.description.length > 0 && (
                  <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-item)', color: 'var(--foreground)', lineHeight: '1.6' }}>
                    {exp.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies.length > 0 && (
                  <p style={{ marginTop: 'var(--space-item)', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-item)' }}>
            {education.map((edu) => (
              <div key={edu.id} style={{ ...flexRowBetween, marginBottom: 'var(--space-entry)' }}>
                <div>
                  <p style={{ ...headingStyle, fontWeight: 500 }}>
                    {edu.degree}{edu.field && ` in ${edu.field}`}
                  </p>
                  <p>{edu.institution}</p>
                  {edu.location && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{edu.location}</p>}
                </div>
                <div style={textRight}>
                  <p style={{ fontSize: '0.875rem', color: colors.accent }}>
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
          <p style={{ color: 'var(--foreground)', lineHeight: '1.6' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-item)' }}>
            {projects.map((project) => (
              <div key={project.id} style={entryStyle}>
                <div style={{ ...flexRowBetween, marginBottom: 'var(--space-tight)' }}>
                  <h3 style={{ ...headingStyle, fontWeight: 500 }}>{project.name}</h3>
                  <div style={flexGap3}>
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: colors.accent, textDecoration: 'underline' }}>
                        Live
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: colors.accent, textDecoration: 'underline' }}>
                        Code
                      </a>
                    )}
                  </div>
                </div>
                <p style={{ color: 'var(--foreground)', fontSize: '0.875rem', marginBottom: 'var(--space-tight)' }}>{project.description}</p>
                {project.technologies.length > 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-tight)' }}>
            {certifications.map((cert) => (
              <div key={cert.id} style={certFlex}>
                <div>
                  <p style={{ ...headingStyle, fontWeight: 500 }}>{cert.name}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{cert.issuer} • {formatDate(cert.date)}</p>
                </div>
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: colors.accent, textDecoration: 'underline' }}>
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
          <p style={{ color: 'var(--foreground)', lineHeight: '1.6' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-item)' }}>
            {section.items.map((item) => (
              <div key={item.id} style={borderLeftStyle}>
                <h3 style={{ ...headingStyle, fontWeight: 500 }}>{item.title}</h3>
                {item.subtitle && <p style={{ fontSize: '0.875rem', color: colors.accent }}>{item.subtitle}</p>}
                {item.date && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{item.date}</p>}
                {item.description && <p style={{ marginTop: '0.25rem', color: 'var(--foreground)' }}>{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}