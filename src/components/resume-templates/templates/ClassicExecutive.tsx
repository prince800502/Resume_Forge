import React from 'react'
import { ResumeData } from '@/types'
import { clsx } from 'clsx'

interface ClassicExecutiveProps {
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

export function ClassicExecutive({ data, colors, isExport = false }: ClassicExecutiveProps) {
  const { personal, summary, experience, education, skills, projects, certifications, languages, custom_sections } = data

  const style = {
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: 'Georgia, "Times New Roman", serif',
  }

  const headingStyle = {
    color: colors.heading,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    borderBottomColor: colors.primary,
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
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
    fontSize: '0.875rem',
    marginBottom: 'var(--space-heading)',
    paddingBottom: '8px',
  }

  const entryStyle = {
    marginBottom: 'var(--space-entry)',
  }

  // Inline styles for layout-critical elements to ensure they work in export (off-screen container)
  // These replace Tailwind responsive classes that don't work in container-based rendering
  const flexRowBetween = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '0.5rem',
  } as React.CSSProperties

  const flexRowBetweenGap1 = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '1rem',
  } as React.CSSProperties

  const textRight = {
    textAlign: 'right' as const,
  } as React.CSSProperties

  const skillsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  } as React.CSSProperties

  const mainGrid = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.7fr) minmax(190px, 0.85fr)',
    columnGap: '2rem',
    alignItems: 'start' as const,
    position: 'relative' as const,
  } as React.CSSProperties

  const sidebarStyle = {
    gridColumn: 2,
    minWidth: 0,
    paddingLeft: '1.5rem',
  } as React.CSSProperties

  const dividerStyle = {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    left: '68.3%', // Approximate position after column 1 (63.4%) + gap (4.9%)
    borderLeftWidth: '1.5px',
    borderLeftStyle: 'solid' as const,
    borderLeftColor: `${colors.primary}60`,
    pointerEvents: 'none',
  } as React.CSSProperties

  const flexWrapCenterGap4 = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    gap: '1rem',
  } as React.CSSProperties

  const headerContactStyle = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    gap: '1rem',
  } as React.CSSProperties

  return (
    <div className="classic-executive-template w-full" style={style} data-template="classic-executive">
      {/* Header - Centered */}
      <header style={{ ...sectionStyle, paddingBottom: 'var(--space-heading)', textAlign: 'center', borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: colors.primary }}>
        <h1 style={{ ...headingStyle, fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', marginBottom: '0.5rem' }}>
          {personal.firstName} {personal.lastName}
        </h1>
        {personal.title && (
          <p style={{ fontSize: '1.125rem', fontWeight: 'normal', marginBottom: '1rem', color: colors.accent }}>
            {personal.title}
          </p>
        )}
        <div style={headerContactStyle}>
          {personal.email && <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{personal.email}</span>}
          {personal.phone && <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{personal.phone}</span>}
          {personal.location && <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{personal.location}</span>}
          {personal.linkedin && (
            <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} 
               target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: colors.accent, textDecoration: 'underline' }}>
              LinkedIn
            </a>
          )}
          {personal.github && (
            <a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} 
               target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: colors.accent, textDecoration: 'underline' }}>
              GitHub
            </a>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {summary && (
        <section style={sectionStyle} data-section="summary">
          <h2 style={headingStyle2}>
            Professional Summary
          </h2>
          <p style={{ lineHeight: '1.6', fontSize: '0.9375rem', whiteSpace: 'pre-wrap', color: colors.text }}>{summary}</p>
        </section>
      )}

      {/* Main resume content - Explicit inline grid layout that works at fixed content width (174mm/658px)
          regardless of viewport. This ensures the two-column layout with sidebar renders correctly
          in both preview (210mm viewport) and export (658px off-screen container). */}
      <div style={mainGrid}>
        <div style={{ minWidth: 0 }}>

      {/* Professional Experience */}
      {experience.length > 0 && (
        <section style={sectionStyle} data-section="experience">
          <h2 style={headingStyle2}>
            Professional Experience
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-entry)' }}>
            {experience.map((exp) => (
              <div key={exp.id} style={entryStyle}>
                <div style={{ ...flexRowBetween, marginBottom: 'var(--space-tight)' }}>
                  <div>
                    <h3 style={{ fontWeight: 'bold', color: colors.heading }}>{exp.position}</h3>
                    <p style={{ fontWeight: 'normal', color: colors.accent }}>{exp.company}</p>
                    {exp.location && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{exp.location}</p>}
                  </div>
                  <div style={textRight}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.accent }}>
                      {getDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                  </div>
                </div>
                {exp.description.length > 0 && (
                  <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-item)', color: colors.text }}>
                    {exp.description.map((desc, i) => (
                      <li key={i} style={{ lineHeight: '1.6' }}>{desc}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies.length > 0 && (
                  <p style={{ marginTop: 'var(--space-item)', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                    <span style={{ fontWeight: '500' }}>Technologies: </span>
                    {exp.technologies.join(', ')}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-entry)' }}>
            {education.map((edu) => (
              <div key={edu.id} style={entryStyle}>
                <div style={flexRowBetween}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: colors.heading }}>
                      {edu.degree}{edu.field && ` in ${edu.field}`}
                    </p>
                    <p>{edu.institution}</p>
                    {edu.location && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{edu.location}</p>}
                    {edu.honors && edu.honors.length > 0 && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                        <span style={{ fontWeight: '500' }}>Honors: </span>{edu.honors.join(', ')}
                      </p>
                    )}
                    {edu.gpa && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                        <span style={{ fontWeight: '500' }}>GPA: </span>{edu.gpa}
                      </p>
                    )}
                  </div>
                  <div style={textRight}>
                    <p style={{ fontSize: '0.875rem', color: colors.accent }}>
                      {getDateRange(edu.startDate, edu.endDate, edu.current)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

        </div>

        {/* Vertical divider spanning full grid height */}
        <div style={dividerStyle} aria-hidden="true" />

        <aside style={sidebarStyle}>
      {/* Skills */}
      {skills.length > 0 && (
        <section style={sectionStyle} data-section="skills">
          <h2 style={headingStyle2}>
            Core Competencies
          </h2>
          <div style={skillsGrid}>
            {['technical', 'framework', 'database', 'cloud', 'tool', 'language', 'soft', 'other'].map(category => {
              const categorySkills = skills.filter(s => s.category === category)
              if (categorySkills.length === 0) return null
              
              return (
                <div key={category}>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.25rem', color: colors.heading, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {category.replace('_', ' ')}
                  </h3>
                  <p style={{ color: colors.text, lineHeight: '1.6' }}>
                    {categorySkills.map((skill, i) => (
                      <span key={skill.id}>
                        {skill.name} ({skill.proficiency}){i < categorySkills.length - 1 ? '; ' : ''}
                      </span>
                    ))}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section style={sectionStyle} data-section="certifications">
          <h2 style={headingStyle2}>
            Certifications
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-item)' }}>
            {certifications.map((cert) => (
              <div key={cert.id} style={{ padding: '0.75rem', borderLeftWidth: '4px', borderLeftStyle: 'solid', borderLeftColor: colors.primary }}>
                <div style={flexRowBetweenGap1}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: colors.heading }}>{cert.name}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{cert.issuer}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                      {formatDate(cert.date)}
                      {cert.expiryDate && ` – Expires: ${formatDate(cert.expiryDate)}`}
                    </p>
                  </div>
                  {cert.url && (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.accent, textDecoration: 'underline' }}>
                      Verify Credential
                    </a>
                  )}
                </div>
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
          <p style={{ color: colors.text, lineHeight: '1.6' }}>
            {languages.map((lang, i) => (
              <span key={lang.id}>
                {lang.name} ({lang.proficiency}){i < languages.length - 1 ? '; ' : ''}
              </span>
            ))}
          </p>
        </section>
      )}

      {/* Custom Sections */}
      {custom_sections.map((section) => (
        <section key={section.id} style={sectionStyle} data-section={`custom-${section.id}`}>
          <h2 style={headingStyle2}>
            {section.title.toUpperCase()}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-item)' }}>
            {section.items.map((item) => (
              <div key={item.id} style={{ paddingLeft: '1rem', borderLeftWidth: '2px', borderLeftStyle: 'solid', borderLeftColor: colors.secondary }}>
                <h3 style={{ fontWeight: 'bold', color: colors.heading }}>{item.title}</h3>
                {item.subtitle && <p style={{ fontSize: '0.875rem', color: colors.accent }}>{item.subtitle}</p>}
                {item.date && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{item.date}</p>}
                {item.description && <p style={{ marginTop: '0.25rem', color: colors.text }}>{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}

        </aside>
      </div>
    </div>
  )
}