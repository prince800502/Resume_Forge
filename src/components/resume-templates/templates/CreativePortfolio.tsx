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

  return (
    <div className="creative-portfolio-template" style={style} data-template="creative-portfolio">
      {/* Header with creative flair */}
      <header style={sectionStyle} className="relative">
        <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 leading-tight" style={headingStyle}>
              {personal.firstName} <span style={{ color: colors.accent }}>{personal.lastName}</span>
            </h1>
            {personal.title && (
              <p className="text-xl font-medium mb-4" style={{ color: colors.accent }}>
                {personal.title}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm" style={{ color: colors.text }}>
              {personal.email && <span className="opacity-80">{personal.email}</span>}
              {personal.phone && <span className="opacity-80">{personal.phone}</span>}
              {personal.location && <span className="opacity-80">{personal.location}</span>}
              {personal.linkedin && (
                <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} 
                   target="_blank" rel="noopener noreferrer" className="underline hover:no-underline opacity-80 hover:opacity-100 transition-opacity" style={{ color: colors.accent }}>
                  LinkedIn
                </a>
              )}
              {personal.github && (
                <a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} 
                   target="_blank" rel="noopener noreferrer" className="underline hover:no-underline opacity-80 hover:opacity-100 transition-opacity" style={{ color: colors.accent }}>
                  GitHub
                </a>
              )}
              {personal.website && (
                <a href={personal.website.startsWith('http') ? personal.website : `https://${personal.website}`} 
                   target="_blank" rel="noopener noreferrer" className="underline hover:no-underline opacity-80 hover:opacity-100 transition-opacity" style={{ color: colors.accent }}>
                  Portfolio
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Creative Summary */}
      {summary && (
        <section style={sectionStyle} className="relative" data-section="summary">
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: colors.accent }} />
          <div className="pl-6 relative">
            <h2 style={headingStyle2}>
              Creative Statement
            </h2>
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.primary}10`, border: `1px solid ${colors.primary}20`, borderRadius: 'var(--radius-card)' }}>
              <p className="text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">{summary}</p>
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
          <div className="space-y-[var(--space-entry)]">
            {projects.map((project, index) => (
              <div key={project.id} className="p-4 border" style={{ ...entryStyle, borderColor: `${colors.primary}30`, backgroundColor: `${colors.primary}05`, borderRadius: 'var(--radius-card)' }}>
                <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-[var(--space-tight)]">
                  <div>
                    <h3 className="text-xl font-bold mb-1" style={headingStyle}>
                      {project.name}
                    </h3>
                    <p className="text-sm opacity-70" style={{ color: colors.accent }}>
                      {project.technologies.slice(0, 3).join(' • ')}
                      {project.technologies.length > 3 && ` +${project.technologies.length - 3} more`}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" 
                         className="px-3 py-1.5 text-sm font-medium rounded transition-all"
                         style={{ backgroundColor: colors.primary, color: colors.background, borderRadius: 'var(--radius-card)' }}>
                        View Live
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" 
                         className="px-3 py-1.5 text-sm font-medium rounded border transition-all"
                         style={{ borderColor: colors.accent, color: colors.accent, borderRadius: 'var(--radius-card)' }}>
                        Code
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-[var(--foreground)] leading-relaxed mb-[var(--space-item)]">{project.description}</p>
                
                {project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-1 text-xs rounded-full"
                            style={{ backgroundColor: `${colors.accent}15`, color: colors.accent, border: `1px solid ${colors.accent}30`, borderRadius: 'var(--radius-card)' }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                
                {project.highlights.length > 0 && (
                  <ul className="mt-[var(--space-item)] list-disc list-inside space-y-[var(--space-item)] text-sm text-[var(--foreground)]">
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
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ backgroundColor: `${colors.primary}30` }} />
            
            <div className="space-y-[var(--space-entry)]">
              {experience.map((exp, index) => (
                <div key={exp.id} className="relative flex gap-6" style={entryStyle}>
                  {/* Timeline dot */}
                  <div className="relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10" 
                       style={{ backgroundColor: colors.primary, border: `3px solid ${colors.background}` }}>
                    <span className="text-xs font-bold" style={{ color: colors.background }}>
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="flex-1 p-4 border transition-all duration-300" style={{ borderColor: `${colors.primary}20`, backgroundColor: `${colors.primary}05`, borderRadius: 'var(--radius-card)' }}>
                    <div className="flex flex-col md:flex-row md:justify-between gap-2 mb-[var(--space-item)]">
                      <div>
                        <h3 className="font-bold text-lg" style={headingStyle}>{exp.position}</h3>
                        <p style={{ color: colors.accent }}>{exp.company}</p>
                        {exp.location && <p className="text-sm opacity-70">{exp.location}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium" style={{ color: colors.accent }}>
                          {getDateRange(exp.startDate, exp.endDate, exp.current)}
                        </p>
                      </div>
                    </div>
                    {exp.description.length > 0 && (
                      <ul className="list-disc list-inside space-y-[var(--space-item)] text-[var(--foreground)] ml-2">
                        {exp.description.map((desc, i) => (
                          <li key={i} className="leading-relaxed">{desc}</li>
                        ))}
                      </ul>
                    )}
                    {exp.technologies.length > 0 && (
                      <div className="mt-[var(--space-item)] flex flex-wrap gap-2">
                        {exp.technologies.map((tech, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-full"
                                style={{ backgroundColor: `${colors.accent}20`, color: colors.accent, border: `1px solid ${colors.accent}40`, borderRadius: 'var(--radius-card)' }}>
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
          <div className="space-y-[var(--space-entry)]">
            {education.map((edu) => (
              <div key={edu.id} className="p-4 border transition-all" style={{ ...entryStyle, borderColor: `${colors.secondary}30`, backgroundColor: `${colors.secondary}05`, borderRadius: 'var(--radius-card)' }}>
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div>
                    <p className="font-bold" style={headingStyle}>
                      {edu.degree}{edu.field && ` in ${edu.field}`}
                    </p>
                    <p style={{ color: colors.accent }}>{edu.institution}</p>
                    {edu.location && <p className="text-sm opacity-70">{edu.location}</p>}
                    {edu.honors && edu.honors.length > 0 && (
                      <p className="text-sm opacity-70 mt-1">
                        Honors: {edu.honors.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: colors.accent }}>
                      {getDateRange(edu.startDate, edu.endDate, edu.current)}
                    </p>
                    {edu.gpa && <p className="text-sm opacity-70">GPA: {edu.gpa}</p>}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['technical', 'framework', 'database', 'cloud', 'tool', 'language', 'soft', 'other'].map(category => {
              const categorySkills = skills.filter(s => s.category === category)
              if (categorySkills.length === 0) return null
              
              return (
                <div key={category} className="p-4 border" style={{ borderColor: `${colors.primary}20`, backgroundColor: `${colors.primary}05`, borderRadius: 'var(--radius-card)' }}>
                  <h3 className="text-xs font-bold mb-3 tracking-wider capitalize" style={{ ...headingStyle, textTransform: 'uppercase' }}>
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span key={skill.id} className="px-3 py-1 text-sm rounded-full transition-transform"
                            style={{ backgroundColor: `${colors.accent}15`, color: colors.accent, border: `1px solid ${colors.accent}30`, borderRadius: 'var(--radius-card)' }}>
                        {skill.name}
                        <span className="ml-1 text-xs opacity-60">({skill.proficiency})</span>
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
          <div className="space-y-[var(--space-entry)]">
            {section.items.map((item) => (
              <div key={item.id} className="p-4 border" style={{ borderColor: `${colors.secondary}30`, backgroundColor: `${colors.secondary}05`, borderRadius: 'var(--radius-card)' }}>
                <h3 className="font-bold mb-1" style={headingStyle}>{item.title}</h3>
                {item.subtitle && <p className="text-sm" style={{ color: colors.accent }}>{item.subtitle}</p>}
                {item.date && <p className="text-sm opacity-70">{item.date}</p>}
                {item.description && <p className="mt-2 text-[var(--foreground)]">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}