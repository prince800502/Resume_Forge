import React from 'react'
import { ResumeData } from '@/types'
import { clsx } from 'clsx'

interface ExecutiveLeadershipProps {
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

export function ExecutiveLeadership({ data, colors, isExport = false }: ExecutiveLeadershipProps) {
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
    fontWeight: 700,
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
    fontSize: '1rem',
    marginBottom: 'var(--space-heading)',
    paddingBottom: '8px',
  }

  const entryStyle = {
    marginBottom: 'var(--space-entry)',
  }

  // Inline styles for layout-critical elements
  const headerContactStyle = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    gap: '1.5rem',
    fontSize: '0.875rem',
  } as React.CSSProperties

  const flexRowBetweenGap1 = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '1rem',
  } as React.CSSProperties

  const flexRowBetween = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '0.5rem',
  } as React.CSSProperties

  const textRight = {
    textAlign: 'right' as const,
  } as React.CSSProperties

  const skillsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
  } as React.CSSProperties

  const certFlex = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    padding: '1rem',
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid' as const,
  } as React.CSSProperties

  const borderLeft2Style = {
    paddingLeft: '1.5rem',
    borderLeftWidth: '2px',
    borderLeftStyle: 'solid' as const,
  } as React.CSSProperties

  return (
    <div className="executive-leadership-template" style={style} data-template="executive-leadership">
      {/* Header - Formal and centered */}
      <header style={{ ...sectionStyle, paddingBottom: 'var(--space-heading)', borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: colors.primary, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', backgroundColor: colors.primary, borderRadius: 'var(--radius-card)' }}>
          <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: colors.accent }} />
        </div>
        <h1 style={{ ...headingStyle, fontSize: 'clamp(2.25rem, 5vw, 3rem)', fontWeight: 'bold', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
          {personal.firstName} {personal.lastName}
        </h1>
        {personal.title && (
          <p style={{ fontSize: '1.25rem', fontWeight: 'normal', marginBottom: '1.5rem', letterSpacing: '0.02em', color: colors.accent, textTransform: 'uppercase' }}>
            {personal.title}
          </p>
        )}
        <div style={headerContactStyle}>
          {personal.email && <span style={{ opacity: 0.8 }}>{personal.email}</span>}
          {personal.phone && <span style={{ opacity: 0.8 }}>{personal.phone}</span>}
          {personal.location && <span style={{ opacity: 0.8 }}>{personal.location}</span>}
          {personal.linkedin && (
            <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} 
               target="_blank" rel="noopener noreferrer" style={{ color: colors.accent, textDecoration: 'underline', opacity: 0.8 }}>
              LinkedIn
            </a>
          )}
        </div>
      </header>

      {/* Executive Summary */}
      {summary && (
        <section style={sectionStyle} data-section="summary">
          <h2 style={headingStyle2}>
            Executive Summary
          </h2>
          <div style={{ padding: '1rem', borderLeftWidth: '4px', borderLeftStyle: 'solid', borderLeftColor: colors.primary, backgroundColor: `${colors.primary}05`, borderRadius: 'var(--radius-card)' }}>
            <p style={{ color: 'var(--foreground)', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '1.125rem' }}>{summary}</p>
          </div>
        </section>
      )}

      {/* Core Competencies */}
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
                <div key={category} style={{ padding: '1rem', borderWidth: '1px', borderStyle: 'solid', borderColor: `${colors.primary}30`, borderRadius: 'var(--radius-card)' }}>
                  <h3 style={{ ...headingStyle, fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    {category.replace('_', ' ')}
                  </h3>
                  <p style={{ color: 'var(--foreground)', lineHeight: '1.6' }}>
                    {categorySkills.map((skill, i) => (
                      <span key={skill.id} style={{ display: 'block', marginBottom: '0.25rem' }}>
                        {skill.name} <span style={{ fontWeight: 'normal', opacity: 0.6 }}>({skill.proficiency})</span>
                      </span>
                    ))}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Executive Experience */}
      {experience.length > 0 && (
        <section style={sectionStyle} data-section="experience">
          <h2 style={headingStyle2}>
            Leadership Experience
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-entry)' }}>
            {experience.map((exp) => (
              <div key={exp.id} style={{ ...entryStyle, borderLeftWidth: '4px', borderLeftStyle: 'solid', borderLeftColor: colors.primary, paddingLeft: '1.5rem' }}>
                <div style={{ ...flexRowBetweenGap1, marginBottom: 'var(--space-item)' }}>
                  <div>
                    <h3 style={{ ...headingStyle, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{exp.position}</h3>
                    <p style={{ fontSize: '1.125rem', fontWeight: '500', color: colors.accent }}>{exp.company}</p>
                    {exp.location && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{exp.location}</p>}
                  </div>
                  <div style={{ ...textRight, alignSelf: 'center' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', letterSpacing: '0.05em', color: colors.heading, textTransform: 'uppercase', textAlign: 'right' }}>
                      {getDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                  </div>
                </div>
                {exp.description.length > 0 && (
                  <ul style={{ listStyle: 'disc', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-item)', color: 'var(--foreground)', lineHeight: '1.6' }}>
                    {exp.description.map((desc, i) => (
                      <li key={i} style={{ position: 'relative', paddingLeft: '0.5rem' }}>{desc}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies.length > 0 && (
                  <p style={{ marginTop: 'var(--space-item)', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                    <span style={{ fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Key Areas: </span>
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
              <div key={edu.id} style={{ ...entryStyle, padding: '1rem', borderWidth: '1px', borderStyle: 'solid', borderColor: `${colors.primary}20`, borderRadius: 'var(--radius-card)' }}>
                <div style={flexRowBetweenGap1}>
                  <div>
                    <p style={{ ...headingStyle, fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                      {edu.degree}{edu.field && ` in ${edu.field}`}
                    </p>
                    <p style={{ fontWeight: '500', color: colors.accent }}>{edu.institution}</p>
                    {edu.location && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{edu.location}</p>}
                    {edu.honors && edu.honors.length > 0 && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
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
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', letterSpacing: '0.05em', color: colors.heading, textTransform: 'uppercase', textAlign: 'right' }}>
                      {getDateRange(edu.startDate, edu.endDate, edu.current)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Board Roles / Certifications */}
      {certifications.length > 0 && (
        <section style={sectionStyle} data-section="certifications">
          <h2 style={headingStyle2}>
            Board Roles & Certifications
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-item)' }}>
            {certifications.map((cert) => (
              <div key={cert.id} style={{ ...certFlex, borderLeftColor: colors.accent, backgroundColor: `${colors.accent}05`, borderRadius: 'var(--radius-card)' }}>
                <div>
                  <p style={{ ...headingStyle, fontWeight: 'bold' }}>{cert.name}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{cert.issuer}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                    {formatDate(cert.date)}
                    {cert.expiryDate && ` – Expires: ${formatDate(cert.expiryDate)}`}
                    {cert.credentialId && ` | ID: ${cert.credentialId}`}
                  </p>
                </div>
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.accent, textDecoration: 'underline' }}>
                    Verify Credential
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
              <span key={lang.id} style={{ display: 'inline-block', marginRight: '1.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 500 }}>{lang.name}</span> — {lang.proficiency}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-entry)' }}>
            {section.items.map((item) => (
              <div key={item.id} style={{ ...borderLeft2Style, borderLeftColor: colors.secondary }}>
                <h3 style={{ ...headingStyle, fontWeight: 'bold', marginBottom: '0.25rem' }}>{item.title}</h3>
                {item.subtitle && <p style={{ fontSize: '0.875rem', color: colors.accent }}>{item.subtitle}</p>}
                {item.date && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{item.date}</p>}
                {item.description && <p style={{ marginTop: '0.5rem', color: 'var(--foreground)', lineHeight: '1.6' }}>{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}