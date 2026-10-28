import React from 'react'
import { ResumeData } from '@/types'
import { clsx } from 'clsx'

interface ModernProfessionalProps {
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

export function ModernProfessional({ data, colors, isExport = false }: ModernProfessionalProps) {
  const { personal, summary, experience, education, skills, projects, certifications, languages, custom_sections } = data

  const style = {
    backgroundColor: colors.background,
    color: colors.text,
  }

  const headingStyle = {
    color: colors.heading,
    borderBottomColor: colors.primary,
  }

  const accentStyle = {
    color: colors.accent,
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
    marginBottom: 'var(--space-heading)',
    paddingBottom: '8px',
  }

  const entryStyle = {
    marginBottom: 'var(--space-entry)',
  }

  const itemStyle = {
    marginBottom: 'var(--space-item)',
  }

  // Inline styles for layout-critical elements
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

  const flexWrapGap4 = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  } as React.CSSProperties

  const flexWrapGap4TextSm = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '1rem',
    fontSize: '0.875rem',
  } as React.CSSProperties

  const textRight = {
    textAlign: 'right' as const,
  } as React.CSSProperties

  const headerFlex = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
  } as React.CSSProperties

  const certFlex = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '0.75rem',
    borderRadius: 'var(--radius-card)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.primary,
  } as React.CSSProperties

  const projectFlex = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '0.5rem',
  } as React.CSSProperties

  const skillsFlexWrap = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  } as React.CSSProperties

  const techFlexWrap = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  } as React.CSSProperties

  const langsFlexWrap = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.75rem',
  } as React.CSSProperties

  return (
    <div className="modern-professional-template" style={style} data-template="modern-professional">
      {/* Header */}
      <header style={{ ...sectionStyle, paddingBottom: 'var(--space-heading)', borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: colors.primary }}>
        <div style={headerFlex}>
          <div>
            <h1 style={{ ...headingStyle, fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {personal.firstName} {personal.lastName}
            </h1>
            <p style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem', ...accentStyle }}>
              {personal.title || 'Professional'}
            </p>
            <div style={flexWrapGap4TextSm}>
              {personal.email && <span>{personal.email}</span>}
              {personal.phone && <span>{personal.phone}</span>}
              {personal.location && <span>{personal.location}</span>}
              {personal.linkedin && (
                <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} 
                   target="_blank" rel="noopener noreferrer" style={{ ...accentStyle, textDecoration: 'underline' }}>
                  LinkedIn
                </a>
              )}
              {personal.github && (
                <a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} 
                   target="_blank" rel="noopener noreferrer" style={{ ...accentStyle, textDecoration: 'underline' }}>
                  GitHub
                </a>
              )}
              {personal.website && (
                <a href={personal.website.startsWith('http') ? personal.website : `https://${personal.website}`} 
                   target="_blank" rel="noopener noreferrer" style={{ ...accentStyle, textDecoration: 'underline' }}>
                  Portfolio
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Professional Summary */}
      {summary && (
        <section style={sectionStyle} data-section="summary">
          <h2 style={{ ...headingStyle2, fontSize: '1.25rem', fontWeight: '600' }}>
            Professional Summary
          </h2>
          <p style={{ color: 'var(--foreground)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section style={sectionStyle} data-section="experience">
          <h2 style={{ ...headingStyle2, fontSize: '1.25rem', fontWeight: '600' }}>
            Professional Experience
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-entry)' }}>
            {experience.map((exp, index) => (
              <div key={exp.id} style={{ ...entryStyle, paddingLeft: '1rem', borderLeftWidth: '2px', borderLeftStyle: 'solid', borderLeftColor: colors.primary }}>
                <div style={{ ...flexRowBetween, marginBottom: 'var(--space-tight)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: colors.heading }}>{exp.position}</h3>
                    <p style={{ color: colors.accent }}>{exp.company}</p>
                    {exp.location && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{exp.location}</p>}
                  </div>
                  <div style={textRight}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', ...accentStyle }}>
                      {getDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                  </div>
                </div>
                {exp.description.length > 0 && (
                  <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-item)', color: 'var(--foreground)' }}>
                    {exp.description.map((desc, i) => (
                      <li key={i} style={{ lineHeight: '1.6' }}>{desc}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies.length > 0 && (
                  <div style={{ ...techFlexWrap, marginTop: 'var(--space-item)' }}>
                    {exp.technologies.map((tech, i) => (
                      <span key={i} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '9999px', borderWidth: '1px', borderStyle: 'solid', borderColor: colors.primary, color: colors.primary }}>
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

      {/* Education */}
      {education.length > 0 && (
        <section style={sectionStyle} data-section="education">
          <h2 style={{ ...headingStyle2, fontSize: '1.25rem', fontWeight: '600' }}>
            Education
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-entry)' }}>
            {education.map((edu) => (
              <div key={edu.id} style={{ ...entryStyle, paddingLeft: '1rem', borderLeftWidth: '2px', borderLeftStyle: 'solid', borderLeftColor: colors.secondary }}>
                <div style={flexRowBetween}>
                  <div>
                    <h3 style={{ fontWeight: '600', color: colors.heading }}>{edu.degree} in {edu.field}</h3>
                    <p style={{ color: 'var(--foreground)' }}>{edu.institution}</p>
                    {edu.location && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{edu.location}</p>}
                    {edu.gpa && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>GPA: {edu.gpa}</p>}
                    {edu.honors && edu.honors.length > 0 && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                        Honors: {edu.honors.join(', ')}
                      </p>
                    )}
                  </div>
                  <div style={textRight}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', ...accentStyle }}>
                      {getDateRange(edu.startDate, edu.endDate, edu.current)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section style={sectionStyle} data-section="skills">
          <h2 style={{ ...headingStyle2, fontSize: '1.25rem', fontWeight: '600' }}>
            Skills
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-entry)' }}>
            {['technical', 'framework', 'database', 'cloud', 'tool', 'language', 'soft', 'other'].map(category => {
              const categorySkills = skills.filter(s => s.category === category)
              if (categorySkills.length === 0) return null
              
              return (
                <div key={category}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--space-tight)', textTransform: 'capitalize', color: colors.heading }}>
                    {category.replace('_', ' ')}
                  </h3>
                  <div style={skillsFlexWrap}>
                    {categorySkills.map((skill) => (
                      <span key={skill.id} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', borderRadius: '9999px', borderWidth: '1px', borderStyle: 'solid', borderColor: colors.primary, color: colors.primary }}>
                        {skill.name} 
                        <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem', opacity: 0.7 }}>({skill.proficiency})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section style={sectionStyle} data-section="projects">
          <h2 style={{ ...headingStyle2, fontSize: '1.25rem', fontWeight: '600' }}>
            Projects
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-entry)' }}>
            {projects.map((project) => (
              <div key={project.id} style={{ ...entryStyle, padding: '1rem', borderWidth: '1px', borderStyle: 'solid', borderColor: colors.primary, borderRadius: 'var(--radius-card)' }}>
                <div style={{ ...projectFlex, marginBottom: 'var(--space-tight)' }}>
                  <h3 style={{ fontWeight: '600', color: colors.heading }}>{project.name}</h3>
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', ...accentStyle }}>
                      Live Demo
                    </a>
                  )}
                </div>
                <p style={{ color: 'var(--foreground)', marginBottom: 'var(--space-item)' }}>{project.description}</p>
                {project.technologies.length > 0 && (
                  <div style={{ ...techFlexWrap, marginBottom: 'var(--space-item)' }}>
                    {project.technologies.map((tech, i) => (
                      <span key={i} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '9999px', borderWidth: '1px', borderStyle: 'solid', borderColor: colors.secondary, color: colors.secondary }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {project.highlights.length > 0 && (
                  <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-item)', fontSize: '0.875rem', color: 'var(--foreground)' }}>
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

      {/* Certifications */}
      {certifications.length > 0 && (
        <section style={sectionStyle} data-section="certifications">
          <h2 style={{ ...headingStyle2, fontSize: '1.25rem', fontWeight: '600' }}>
            Certifications
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-item)' }}>
            {certifications.map((cert) => (
              <div key={cert.id} style={certFlex}>
                <div>
                  <h3 style={{ fontWeight: '600', color: colors.heading }}>{cert.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{cert.issuer}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                    {formatDate(cert.date)}
                    {cert.expiryDate && ` – Expires: ${formatDate(cert.expiryDate)}`}
                    {cert.credentialId && ` | Credential: ${cert.credentialId}`}
                  </p>
                </div>
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ marginTop: '0.5rem', display: 'inline-block', fontSize: '0.875rem', ...accentStyle }}>
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
          <h2 style={{ ...headingStyle2, fontSize: '1.25rem', fontWeight: '600' }}>
            Languages
          </h2>
          <div style={langsFlexWrap}>
            {languages.map((lang) => (
              <span key={lang.id} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', borderRadius: '9999px', backgroundColor: 'var(--muted)', borderWidth: '1px', borderStyle: 'solid', borderColor: colors.primary }}>
                {lang.name} ({lang.proficiency})
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {custom_sections.map((section) => (
        <section key={section.id} style={sectionStyle} data-section={`custom-${section.id}`}>
          <h2 style={{ ...headingStyle2, fontSize: '1.25rem', fontWeight: '600' }}>
            {section.title}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-entry)' }}>
            {section.items.map((item) => (
              <div key={item.id} style={{ paddingLeft: '1rem', borderLeftWidth: '2px', borderLeftStyle: 'solid', borderLeftColor: colors.secondary }}>
                <h3 style={{ fontWeight: '600', color: colors.heading }}>{item.title}</h3>
                {item.subtitle && <p style={{ color: colors.accent }}>{item.subtitle}</p>}
                {item.date && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{item.date}</p>}
                {item.description && <p style={{ color: 'var(--foreground)', marginTop: 'var(--space-tight)' }}>{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
