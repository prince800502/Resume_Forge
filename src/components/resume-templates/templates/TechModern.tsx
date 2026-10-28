import React from 'react'
import { ResumeData } from '@/types'
import { clsx } from 'clsx'

interface TechModernProps {
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

export function TechModern({ data, colors, isExport = false }: TechModernProps) {
  const { personal, summary, experience, education, skills, projects, certifications, languages, custom_sections } = data

  const style = {
    backgroundColor: colors.background,
    color: colors.text,
  }

  const headingStyle = {
    color: colors.heading,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    borderBottomColor: colors.primary,
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
    fontSize: '1rem',
    marginBottom: 'var(--space-heading)',
    paddingBottom: '8px',
  }

  const entryStyle = {
    marginBottom: 'var(--space-entry)',
  }

  // Inline styles for layout-critical elements
  const flexRowBetween = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '0.5rem',
  } as React.CSSProperties

  const flexWrapGap4 = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  } as React.CSSProperties

  const flexWrapGap2 = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  } as React.CSSProperties

  const flexGap2 = {
    display: 'flex',
    gap: '0.5rem',
  } as React.CSSProperties

  const textRight = {
    textAlign: 'right' as const,
  } as React.CSSProperties

  const headerContactStyle = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '1rem',
    fontSize: '0.875rem',
  } as React.CSSProperties

  const certFlex = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: 'var(--radius-card)',
    borderWidth: '1px',
    borderStyle: 'solid',
  } as React.CSSProperties

  const projectFlex = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '0.5rem',
  } as React.CSSProperties

  return (
    <div className="tech-modern-template" style={style} data-template="tech-modern">
      {/* Header with accent bar */}
      <header style={{ ...sectionStyle, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0.25rem', backgroundColor: colors.primary }} />
        <div style={{ paddingLeft: '1.5rem' }}>
          <h1 style={{ ...headingStyle, fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', fontWeight: 'bold', marginBottom: '0.25rem' }}>
            {personal.firstName} {personal.lastName}
          </h1>
          {personal.title && (
            <p style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '1rem', color: colors.accent }}>
              {personal.title}
            </p>
          )}
          <div style={headerContactStyle}>
            {personal.email && <span style={{ color: 'var(--muted-foreground)' }}>{personal.email}</span>}
            {personal.phone && <span style={{ color: 'var(--muted-foreground)' }}>{personal.phone}</span>}
            {personal.location && <span style={{ color: 'var(--muted-foreground)' }}>{personal.location}</span>}
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

      {/* Professional Summary */}
      {summary && (
        <section style={sectionStyle} data-section="summary">
          <h2 style={headingStyle2}>
            About
          </h2>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-card)', backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30`, borderWidth: '1px', borderStyle: 'solid' }}>
            <p style={{ color: 'var(--foreground)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{summary}</p>
          </div>
        </section>
      )}

      {/* Tech Stack / Skills - Prominent for tech roles */}
      {skills.length > 0 && (
        <section style={sectionStyle} data-section="skills">
          <h2 style={headingStyle2}>
            Tech Stack
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-entry)' }}>
            {['technical', 'framework', 'database', 'cloud', 'tool'].map(category => {
              const categorySkills = skills.filter(s => s.category === category)
              if (categorySkills.length === 0) return null
              
              return (
                <div key={category}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: colors.heading, textTransform: 'uppercase' }}>
                    {category}
                  </h3>
                  <div style={flexWrapGap2}>
                    {categorySkills.map((skill) => (
                      <span key={skill.id} style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', borderRadius: 'var(--radius-card)', backgroundColor: `${colors.primary}15`, color: colors.primary, border: `1px solid ${colors.primary}30` }}>
                        {skill.name}
                        <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem', opacity: 0.6 }}>({skill.proficiency})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
            {/* Other skills in compact form */}
            {['language', 'soft', 'other'].map(category => {
              const categorySkills = skills.filter(s => s.category === category)
              if (categorySkills.length === 0) return null
              
              return (
                <div key={category}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: colors.heading, textTransform: 'uppercase' }}>
                    {category}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: '1.6' }}>
                    {categorySkills.map((skill, i) => (
                      <span key={skill.id}>
                        {skill.name} ({skill.proficiency}){i < categorySkills.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </p>
                </div>
              )
            })}
          </div>
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
              <div key={exp.id} style={{ ...entryStyle, position: 'relative', paddingLeft: '1.5rem', borderLeftWidth: '2px', borderLeftStyle: 'solid', borderLeftColor: colors.primary }}>
                <div style={{ ...flexRowBetween, marginBottom: 'var(--space-tight)' }}>
                  <div>
                    <h3 style={{ fontWeight: 'bold', color: colors.heading }}>{exp.position}</h3>
                    <p style={{ fontWeight: '500', color: colors.accent }}>{exp.company}</p>
                    {exp.location && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{exp.location}</p>}
                  </div>
                  <div style={textRight}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.accent }}>
                      {getDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                  </div>
                </div>
                {exp.description.length > 0 && (
                  <ul style={{ listStyle: 'disc', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-item)', color: 'var(--foreground)' }}>
                    {exp.description.map((desc, i) => (
                      <li key={i} style={{ lineHeight: '1.6' }}>{desc}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies.length > 0 && (
                  <div style={{ ...flexWrapGap2, marginTop: 'var(--space-item)' }}>
                    {exp.technologies.map((tech, i) => (
                      <span key={i} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: 'var(--radius-card)', backgroundColor: `${colors.accent}20`, color: colors.accent, border: `1px solid ${colors.accent}40` }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects - Important for tech */}
      {projects.length > 0 && (
        <section style={sectionStyle} data-section="projects">
          <h2 style={headingStyle2}>
            Projects
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-entry)' }}>
            {projects.map((project) => (
              <div key={project.id} style={{ ...entryStyle, padding: '1rem', borderWidth: '1px', borderStyle: 'solid', borderColor: `${colors.primary}30`, backgroundColor: `${colors.primary}05`, borderRadius: 'var(--radius-card)' }}>
                <div style={{ ...projectFlex, marginBottom: 'var(--space-tight)' }}>
                  <h3 style={{ fontWeight: 'bold', color: colors.heading }}>{project.name}</h3>
                  <div style={flexGap2}>
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.accent, textDecoration: 'underline' }}>
                        Live
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.accent, textDecoration: 'underline' }}>
                        Code
                      </a>
                    )}
                  </div>
                </div>
                <p style={{ color: 'var(--foreground)', marginBottom: 'var(--space-item)' }}>{project.description}</p>
                {project.technologies.length > 0 && (
                  <div style={{ ...flexWrapGap2, marginBottom: 'var(--space-item)' }}>
                    {project.technologies.map((tech, i) => (
                      <span key={i} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: 'var(--radius-card)', backgroundColor: `${colors.secondary}20`, color: colors.secondary, border: `1px solid ${colors.secondary}40` }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {project.highlights.length > 0 && (
                  <ul style={{ listStyle: 'disc', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-item)', fontSize: '0.875rem', color: 'var(--foreground)' }}>
                    {project.highlights.map((highlight, i) => (
                      <li key={i}>{highlight}</li>
                    ))}
                  </ul>
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
              <div key={edu.id} style={{ ...entryStyle, padding: '0.75rem', borderWidth: '1px', borderStyle: 'solid', borderColor: `${colors.primary}20`, borderRadius: 'var(--radius-card)' }}>
                <div style={flexRowBetween}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: colors.heading }}>
                      {edu.degree}{edu.field && ` in ${edu.field}`}
                    </p>
                    <p style={{ color: 'var(--foreground)' }}>{edu.institution}</p>
                    {edu.location && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{edu.location}</p>}
                  </div>
                  <div style={textRight}>
                    <p style={{ fontSize: '0.875rem', color: colors.accent }}>
                      {getDateRange(edu.startDate, edu.endDate, edu.current)}
                    </p>
                    {edu.gpa && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>GPA: {edu.gpa}</p>}
                  </div>
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
          <div style={flexWrapGap2}>
            {languages.map((language) => (
              <div
                key={language.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.875rem',
                  borderRadius: 'var(--radius-card)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  backgroundColor: `${colors.primary}15`,
                  color: colors.primary,
                  borderColor: `${colors.primary}30`,
                }}
              >
                <span style={{ color: colors.primary }}>
                  {language.name}
                </span>

                {language.proficiency && (
                  <span
                    style={{ marginLeft: '0.375rem', fontSize: '0.75rem', color: colors.secondary }}
                  >
                    ({language.proficiency})
                  </span>
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
              <div key={cert.id} style={{ ...certFlex, borderColor: `${colors.primary}30` }}>
                <div>
                  <p style={{ fontWeight: 'bold', color: colors.heading }}>{cert.name}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{cert.issuer} • {formatDate(cert.date)}</p>
                </div>
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.accent, textDecoration: 'underline' }}>
                    Verify
                  </a>
                )}
              </div>
            ))}
          </div>
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
              <div key={item.id} style={{ padding: '0.75rem', borderRadius: 'var(--radius-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: `${colors.secondary}30`, backgroundColor: `${colors.secondary}05` }}>
                <h3 style={{ fontWeight: 'bold', color: colors.heading }}>{item.title}</h3>
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