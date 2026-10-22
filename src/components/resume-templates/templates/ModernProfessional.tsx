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

  return (
    <div className="modern-professional-template" style={style} data-template="modern-professional">
      {/* Header */}
      <header className="mb-[var(--space-section)] pb-[var(--space-heading)] border-b-2" style={{ borderColor: colors.primary }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={headingStyle}>
              {personal.firstName} {personal.lastName}
            </h1>
            <p className="text-lg font-medium mb-2" style={accentStyle}>
              {personal.title || 'Professional'}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)]">
              {personal.email && <span>{personal.email}</span>}
              {personal.phone && <span>{personal.phone}</span>}
              {personal.location && <span>{personal.location}</span>}
              {personal.linkedin && (
                <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} 
                   target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={accentStyle}>
                  LinkedIn
                </a>
              )}
              {personal.github && (
                <a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} 
                   target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={accentStyle}>
                  GitHub
                </a>
              )}
              {personal.website && (
                <a href={personal.website.startsWith('http') ? personal.website : `https://${personal.website}`} 
                   target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={accentStyle}>
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
          <h2 className="text-xl font-semibold" style={headingStyle2}>
            Professional Summary
          </h2>
          <p className="text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section style={sectionStyle} data-section="experience">
          <h2 className="text-xl font-semibold" style={headingStyle2}>
            Professional Experience
          </h2>
          <div className="space-y-[var(--space-entry)]">
            {experience.map((exp, index) => (
              <div key={exp.id} className="pl-4 border-l-2" style={{ ...entryStyle, borderColor: colors.primary }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginBottom: 'var(--space-tight)',
                }}>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: colors.heading }}>{exp.position}</h3>
                    <p className="text-[var(--foreground)]" style={{ color: colors.accent }}>{exp.company}</p>
                    {exp.location && <p className="text-sm text-[var(--muted-foreground)]">{exp.location}</p>}
                  </div>
                  <div className="text-right md:text-right">
                    <p className="text-sm font-medium" style={accentStyle}>
                      {getDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                  </div>
                </div>
                {exp.description.length > 0 && (
                  <ul className="list-disc list-inside space-y-[var(--space-item)] text-[var(--foreground)]">
                    {exp.description.map((desc, i) => (
                      <li key={i} className="leading-relaxed">{desc}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies.length > 0 && (
                  <div className="mt-[var(--space-item)] flex flex-wrap gap-2">
                    {exp.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-1 text-xs rounded-full border" 
                            style={{ borderColor: colors.primary, color: colors.primary }}>
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
          <h2 className="text-xl font-semibold" style={headingStyle2}>
            Education
          </h2>
          <div className="space-y-[var(--space-entry)]">
            {education.map((edu) => (
              <div key={edu.id} className="pl-4 border-l-2" style={{ ...entryStyle, borderColor: colors.secondary }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}>
                  <div>
                    <h3 className="font-semibold" style={{ color: colors.heading }}>{edu.degree} in {edu.field}</h3>
                    <p className="text-[var(--foreground)]">{edu.institution}</p>
                    {edu.location && <p className="text-sm text-[var(--muted-foreground)]">{edu.location}</p>}
                    {edu.gpa && <p className="text-sm text-[var(--muted-foreground)]">GPA: {edu.gpa}</p>}
                    {edu.honors && edu.honors.length > 0 && (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Honors: {edu.honors.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={accentStyle}>
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
          <h2 className="text-xl font-semibold" style={headingStyle2}>
            Skills
          </h2>
          <div className="space-y-[var(--space-entry)]">
            {['technical', 'framework', 'database', 'cloud', 'tool', 'language', 'soft', 'other'].map(category => {
              const categorySkills = skills.filter(s => s.category === category)
              if (categorySkills.length === 0) return null
              
              return (
                <div key={category}>
                  <h3 className="text-sm font-medium mb-[var(--space-tight)] capitalize" style={{ color: colors.heading }}>
                    {category.replace('_', ' ')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span key={skill.id} className="px-3 py-1 text-sm rounded-full border" 
                            style={{ borderColor: colors.primary, color: colors.primary }}>
                        {skill.name} 
                        <span className="ml-1 text-xs opacity-70">({skill.proficiency})</span>
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
          <h2 className="text-xl font-semibold" style={headingStyle2}>
            Projects
          </h2>
          <div className="space-y-[var(--space-entry)]">
            {projects.map((project) => (
              <div key={project.id} className="p-4 border" style={{ ...entryStyle, borderColor: colors.primary, borderRadius: 'var(--radius-card)' }}>
                <div className="flex flex-col md:flex-row md:justify-between gap-2 mb-[var(--space-tight)]">
                  <h3 className="font-semibold" style={{ color: colors.heading }}>{project.name}</h3>
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm" style={accentStyle}>
                      Live Demo
                    </a>
                  )}
                </div>
                <p className="text-[var(--foreground)] mb-[var(--space-item)]">{project.description}</p>
                {project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-[var(--space-item)]">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-1 text-xs rounded-full border" 
                            style={{ borderColor: colors.secondary, color: colors.secondary }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {project.highlights.length > 0 && (
                  <ul className="list-disc list-inside space-y-[var(--space-item)] text-sm text-[var(--foreground)]">
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
          <h2 className="text-xl font-semibold" style={headingStyle2}>
            Certifications
          </h2>
          <div className="space-y-[var(--space-item)]">
            {certifications.map((cert) => (
              <div key={cert.id} style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-card)',
                border: '1px solid',
                borderColor: colors.primary,
              }}>
                <div>
                  <h3 className="font-semibold" style={{ color: colors.heading }}>{cert.name}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{cert.issuer}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {formatDate(cert.date)}
                    {cert.expiryDate && ` – Expires: ${formatDate(cert.expiryDate)}`}
                    {cert.credentialId && ` | Credential: ${cert.credentialId}`}
                  </p>
                </div>
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" className="mt-2 md:mt-0 text-sm" style={accentStyle}>
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
          <h2 className="text-xl font-semibold" style={headingStyle2}>
            Languages
          </h2>
          <div className="flex flex-wrap gap-3">
            {languages.map((lang) => (
              <span key={lang.id} className="px-3 py-1 text-sm rounded-full bg-[var(--muted)] border" 
                    style={{ borderColor: colors.primary }}>
                {lang.name} ({lang.proficiency})
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {custom_sections.map((section) => (
        <section key={section.id} style={sectionStyle} data-section={`custom-${section.id}`}>
          <h2 className="text-xl font-semibold" style={headingStyle2}>
            {section.title}
          </h2>
          <div className="space-y-[var(--space-entry)]">
            {section.items.map((item) => (
              <div key={item.id} className="pl-4 border-l-2" style={{ borderColor: colors.secondary }}>
                <h3 className="font-semibold" style={{ color: colors.heading }}>{item.title}</h3>
                {item.subtitle && <p className="text-[var(--foreground)]" style={accentStyle}>{item.subtitle}</p>}
                {item.date && <p className="text-sm text-[var(--muted-foreground)]">{item.date}</p>}
                {item.description && <p className="text-[var(--foreground)] mt-[var(--space-tight)]">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
