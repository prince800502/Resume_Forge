import React from 'react'
import { ResumeData } from '@/types'
import { clsx } from 'clsx'

interface CreativePortfolioProps {
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

export function CreativePortfolio({ data, colors, isExport = false }: CreativePortfolioProps) {
  const { personal, summary, experience, education, skills, projects, certifications, languages, custom_sections } = data

  const style = {
    backgroundColor: colors.background,
    color: colors.text,
  }

  const headingStyle = {
    color: colors.heading,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
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
  }

  const entryStyle = {
    marginBottom: 'var(--space-entry)',
  }

  // Inline styles for layout-critical elements
  const headerFlex = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1.5rem',
  } as React.CSSProperties

  const headerContactStyle = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '1rem',
    fontSize: '0.875rem',
  } as React.CSSProperties

  const flexRowBetweenGap1 = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '1rem',
  } as React.CSSProperties

  const flexGap3 = {
    display: 'flex',
    gap: '0.75rem',
  } as React.CSSProperties

  const flexGap2 = {
    display: 'flex',
    gap: '0.5rem',
  } as React.CSSProperties

  const flexWrapGap2 = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  } as React.CSSProperties

  const textRight = {
    textAlign: 'right' as const,
  } as React.CSSProperties

  const flexRowBetween = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '0.5rem',
  } as React.CSSProperties

  const skillsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
  } as React.CSSProperties

  const experienceFlex = {
    display: 'flex',
    gap: '1.5rem',
  } as React.CSSProperties

  return (
    <div className="creative-portfolio-template" style={style} data-template="creative-portfolio">
      {/* Header with creative flair */}
      <header style={sectionStyle}>
        <div style={headerFlex}>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h1 style={{ ...headingStyle, fontSize: 'clamp(2.25rem, 5vw, 3rem)', fontWeight: 'bold', marginBottom: '0.5rem', lineHeight: '1.2' }}>
              {personal.firstName} <span style={{ color: colors.accent }}>{personal.lastName}</span>
            </h1>
            {personal.title && (
              <p style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '1rem', color: colors.accent }}>
                {personal.title}
              </p>
            )}
            <div style={{ ...headerContactStyle, color: colors.text }}>
              {personal.email && <span style={{ opacity: 0.8 }}>{personal.email}</span>}
              {personal.phone && <span style={{ opacity: 0.8 }}>{personal.phone}</span>}
              {personal.location && <span style={{ opacity: 0.8 }}>{personal.location}</span>}
              {personal.linkedin && (
                <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} 
                   target="_blank" rel="noopener noreferrer" style={{ color: colors.accent, textDecoration: 'underline', opacity: 0.8 }}>
                  LinkedIn
                </a>
              )}
              {personal.github && (
                <a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} 
                   target="_blank" rel="noopener noreferrer" style={{ color: colors.accent, textDecoration: 'underline', opacity: 0.8 }}>
                  GitHub
                </a>
              )}
              {personal.website && (
                <a href={personal.website.startsWith('http') ? personal.website : `https://${personal.website}`} 
                   target="_blank" rel="noopener noreferrer" style={{ color: colors.accent, textDecoration: 'underline', opacity: 0.8 }}>
                  Portfolio
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Creative Summary */}
      {summary && (
        <section style={sectionStyle} data-section="summary">
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0.25rem', backgroundColor: colors.accent }} />
          <div style={{ paddingLeft: '1.5rem', position: 'relative' }}>
            <h2 style={headingStyle2}>
              Creative Statement
            </h2>
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-card)', backgroundColor: `${colors.primary}10`, border: `1px solid ${colors.primary}20` }}>
              <p style={{ color: 'var(--foreground)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{summary}</p>
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects - Prominent for creative */}
      {projects.length > 0 && (
        <section style={sectionStyle} data-section="projects">
          <h2 style={headingStyle2}>
            Featured Work
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-entry)' }}>
            {projects.map((project, index) => (
              <div key={project.id} style={{ ...entryStyle, padding: '1rem', borderWidth: '1px', borderStyle: 'solid', borderColor: `${colors.primary}30`, backgroundColor: `${colors.primary}05`, borderRadius: 'var(--radius-card)' }}>
                <div style={{ ...flexRowBetweenGap1, marginBottom: 'var(--space-tight)' }}>
                  <div>
                    <h3 style={{ ...headingStyle, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {project.name}
                    </h3>
                    <p style={{ fontSize: '0.875rem', opacity: 0.7, color: colors.accent }}>
                      {project.technologies.slice(0, 3).join(' • ')}
                      {project.technologies.length > 3 && ` +${project.technologies.length - 3} more`}
                    </p>
                  </div>
                  <div style={flexGap3}>
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" 
                         style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem', fontWeight: '500', borderRadius: 'var(--radius-card)', backgroundColor: colors.primary, color: colors.background }}>
                        View Live
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" 
                         style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem', fontWeight: '500', borderRadius: 'var(--radius-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: colors.accent, color: colors.accent }}>
                        Code
                      </a>
                    )}
                  </div>
                </div>
                <p style={{ color: 'var(--foreground)', lineHeight: '1.6', marginBottom: 'var(--space-item)' }}>{project.description}</p>
                
                {project.technologies.length > 0 && (
                  <div style={flexWrapGap2}>
                    {project.technologies.map((tech, i) => (
                      <span key={i} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '9999px', backgroundColor: `${colors.accent}15`, color: colors.accent, border: `1px solid ${colors.accent}30` }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                
                {project.highlights.length > 0 && (
                  <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-item)', marginTop: 'var(--space-item)', fontSize: '0.875rem', color: 'var(--foreground)' }}>
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

      {/* Experience */}
      {experience.length > 0 && (
        <section style={sectionStyle} data-section="experience">
          <h2 style={headingStyle2}>
            Journey
          </h2>
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: '1rem', top: 0, bottom: 0, width: '2px', backgroundColor: `${colors.primary}30` }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-entry)' }}>
              {experience.map((exp, index) => (
                <div key={exp.id} style={{ ...entryStyle, ...experienceFlex }}>
                  {/* Timeline dot */}
                  <div style={{ position: 'relative', flexShrink: 0, width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, backgroundColor: colors.primary, border: `3px solid ${colors.background}` }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: colors.background }}>
                      {index + 1}
                    </span>
                  </div>
                  
                  <div style={{ flex: 1, padding: '1rem', borderWidth: '1px', borderStyle: 'solid', borderColor: `${colors.primary}20`, backgroundColor: `${colors.primary}05`, borderRadius: 'var(--radius-card)' }}>
                    <div style={{ ...flexRowBetween, marginBottom: 'var(--space-item)' }}>
                      <div>
                        <h3 style={{ ...headingStyle, fontWeight: 'bold', fontSize: '1.125rem' }}>{exp.position}</h3>
                        <p style={{ color: colors.accent }}>{exp.company}</p>
                        {exp.location && <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>{exp.location}</p>}
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
                          <span key={i} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '9999px', backgroundColor: `${colors.accent}20`, color: colors.accent, border: `1px solid ${colors.accent}40` }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
              <div key={edu.id} style={{ ...entryStyle, padding: '1rem', borderWidth: '1px', borderStyle: 'solid', borderColor: `${colors.secondary}30`, backgroundColor: `${colors.secondary}05`, borderRadius: 'var(--radius-card)' }}>
                <div style={{ ...flexRowBetweenGap1 }}>
                  <div>
                    <p style={{ ...headingStyle, fontWeight: 'bold' }}>
                      {edu.degree}{edu.field && ` in ${edu.field}`}
                    </p>
                    <p style={{ color: colors.accent }}>{edu.institution}</p>
                    {edu.location && <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>{edu.location}</p>}
                    {edu.honors && edu.honors.length > 0 && (
                      <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.25rem' }}>
                        Honors: {edu.honors.join(', ')}
                      </p>
                    )}
                  </div>
                  <div style={textRight}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.accent }}>
                      {getDateRange(edu.startDate, edu.endDate, edu.current)}
                    </p>
                    {edu.gpa && <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>GPA: {edu.gpa}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills - Visual */}
      {skills.length > 0 && (
        <section style={sectionStyle} data-section="skills">
          <h2 style={headingStyle2}>
            Toolkit
          </h2>
          <div style={skillsGrid}>
            {['technical', 'framework', 'database', 'cloud', 'tool', 'language', 'soft', 'other'].map(category => {
              const categorySkills = skills.filter(s => s.category === category)
              if (categorySkills.length === 0) return null
              
              return (
                <div key={category} style={{ padding: '1rem', borderWidth: '1px', borderStyle: 'solid', borderColor: `${colors.primary}20`, backgroundColor: `${colors.primary}05`, borderRadius: 'var(--radius-card)' }}>
                  <h3 style={{ ...headingStyle, fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                    {category}
                  </h3>
                  <div style={flexWrapGap2}>
                    {categorySkills.map((skill) => (
                      <span key={skill.id} style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', borderRadius: 'var(--radius-card)', backgroundColor: `${colors.accent}15`, color: colors.accent, border: `1px solid ${colors.accent}30` }}>
                        {skill.name}
                        <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem', opacity: 0.6 }}>({skill.proficiency})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
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
              <div key={item.id} style={{ padding: '1rem', borderWidth: '1px', borderStyle: 'solid', borderColor: `${colors.secondary}30`, backgroundColor: `${colors.secondary}05`, borderRadius: 'var(--radius-card)' }}>
                <h3 style={{ ...headingStyle, fontWeight: 'bold', marginBottom: '0.25rem' }}>{item.title}</h3>
                {item.subtitle && <p style={{ fontSize: '0.875rem', color: colors.accent }}>{item.subtitle}</p>}
                {item.date && <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>{item.date}</p>}
                {item.description && <p style={{ marginTop: '0.5rem', color: 'var(--foreground)' }}>{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}