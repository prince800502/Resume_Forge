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
}

export function TechModern({ data, colors }: TechModernProps) {
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

  return (
    <div className="tech-modern-template" style={style} data-template="tech-modern">
      {/* Header with accent bar */}
      <header className="mb-8 relative">
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: colors.primary }} />
        <div className="pl-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-1" style={headingStyle}>
            {personal.firstName} {personal.lastName}
          </h1>
          {personal.title && (
            <p className="text-lg font-medium mb-4" style={{ color: colors.accent }}>
              {personal.title}
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)]">
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.location && <span>{personal.location}</span>}
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

      {/* Professional Summary */}
      {summary && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={headingStyle}>
            About
          </h2>
          <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }}>
            <p className="text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">{summary}</p>
          </div>
        </section>
      )}

      {/* Tech Stack / Skills - Prominent for tech roles */}
      {skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={headingStyle}>
            Tech Stack
          </h2>
          <div className="space-y-4">
            {['technical', 'framework', 'database', 'cloud', 'tool'].map(category => {
              const categorySkills = skills.filter(s => s.category === category)
              if (categorySkills.length === 0) return null
              
              return (
                <div key={category}>
                  <h3 className="text-sm font-bold mb-2 capitalize tracking-wide" style={{ color: colors.heading, textTransform: 'uppercase' }}>
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span key={skill.id} className="px-3 py-1 text-sm rounded" 
                            style={{ backgroundColor: `${colors.primary}15`, color: colors.primary, border: `1px solid ${colors.primary}30` }}>
                        {skill.name}
                        <span className="ml-1 text-xs opacity-60">({skill.proficiency})</span>
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
                  <h3 className="text-sm font-bold mb-2 capitalize tracking-wide" style={{ color: colors.heading, textTransform: 'uppercase' }}>
                    {category}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
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
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 pb-1 border-b-2" style={headingStyle}>
            Experience
          </h2>
          <div className="space-y-6">
            {experience.map((exp) => (
              <div key={exp.id} className="relative pl-6 border-l-2" style={{ borderColor: colors.primary }}>
                <div className="flex flex-col md:flex-row md:justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold" style={{ color: colors.heading }}>{exp.position}</h3>
                    <p className="font-medium" style={{ color: colors.accent }}>{exp.company}</p>
                    {exp.location && <p className="text-sm text-[var(--muted-foreground)]">{exp.location}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: colors.accent }}>
                      {getDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                  </div>
                </div>
                {exp.description.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-[var(--foreground)] ml-2">
                    {exp.description.map((desc, i) => (
                      <li key={i} className="leading-relaxed">{desc}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {exp.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs rounded" 
                            style={{ backgroundColor: `${colors.accent}20`, color: colors.accent, border: `1px solid ${colors.accent}40` }}>
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
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 pb-1 border-b-2" style={headingStyle}>
            Projects
          </h2>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="p-4 rounded-lg border" style={{ borderColor: `${colors.primary}30`, backgroundColor: `${colors.primary}05` }}>
                <div className="flex flex-col md:flex-row md:justify-between gap-2 mb-2">
                  <h3 className="font-bold" style={{ color: colors.heading }}>{project.name}</h3>
                  <div className="flex gap-2">
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium" style={{ color: colors.accent }}>
                        Live
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-sm font-medium" style={{ color: colors.accent }}>
                        Code
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-[var(--foreground)] mb-3">{project.description}</p>
                {project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs rounded" 
                            style={{ backgroundColor: `${colors.secondary}20`, color: colors.secondary, border: `1px solid ${colors.secondary}40` }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {project.highlights.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-sm text-[var(--foreground)] ml-2">
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
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={headingStyle}>
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="p-3 rounded-lg border" style={{ borderColor: `${colors.primary}20` }}>
                <div className="flex flex-col md:flex-row md:justify-between gap-2">
                  <div>
                    <p className="font-bold" style={{ color: colors.heading }}>
                      {edu.degree}{edu.field && ` in ${edu.field}`}
                    </p>
                    <p className="text-[var(--foreground)]">{edu.institution}</p>
                    {edu.location && <p className="text-sm text-[var(--muted-foreground)]">{edu.location}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm" style={{ color: colors.accent }}>
                      {getDateRange(edu.startDate, edu.endDate, edu.current)}
                    </p>
                    {edu.gpa && <p className="text-sm text-[var(--muted-foreground)]">GPA: {edu.gpa}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={headingStyle}>
            Languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {languages.map((language) => (
              <div
                key={language.id}
                className="!inline-flex !items-center !px-3 !py-1.5 !text-sm !rounded-full !border !bg-cyan-50 !text-slate-900 !border-cyan-300"
                style={{
                  backgroundColor: '#ecfeff',
                  color: '#0f172a',
                  borderColor: '#67e8f9',
                }}
              >
                <span className="!text-slate-900" style={{ color: '#0f172a' }}>
                  {language.name}
                </span>

                {language.proficiency && (
                  <span
                    className="!ml-1.5 !text-xs !text-cyan-900"
                    style={{ color: '#164e63' }}
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
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={headingStyle}>
            Certifications
          </h2>
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-3 rounded-lg border" 
                   style={{ borderColor: `${colors.primary}30` }}>
                <div>
                  <p className="font-bold" style={{ color: colors.heading }}>{cert.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{cert.issuer} • {formatDate(cert.date)}</p>
                </div>
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" className="mt-2 md:mt-0 text-sm font-medium" style={{ color: colors.accent }}>
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
        <section key={section.id} className="mb-8">
          <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={headingStyle}>
            {section.title.toUpperCase()}
          </h2>
          <div className="space-y-3">
            {section.items.map((item) => (
              <div key={item.id} className="p-3 rounded-lg border" style={{ borderColor: `${colors.secondary}30` }}>
                <h3 className="font-bold" style={{ color: colors.heading }}>{item.title}</h3>
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