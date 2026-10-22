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

  return (
    <div className="executive-leadership-template" style={style} data-template="executive-leadership">
      {/* Header - Formal and centered */}
      <header className="mb-[var(--space-section)] pb-[var(--space-heading)] border-b-2 text-center" style={{ borderColor: colors.primary }}>
        <div className="inline-flex items-center gap-3 mb-4" style={{ backgroundColor: colors.primary, borderRadius: 'var(--radius-card)' }}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-wide" style={headingStyle}>
          {personal.firstName} {personal.lastName}
        </h1>
        {personal.title && (
          <p className="text-xl font-normal mb-6 tracking-wide" style={{ color: colors.accent, textTransform: 'uppercase' }}>
            {personal.title}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-6 text-sm" style={{ color: colors.text, opacity: 0.8 }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && (
            <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} 
               target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: colors.accent }}>
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
          <div className="p-4 border-l-4" style={{ borderColor: colors.primary, backgroundColor: `${colors.primary}05`, borderRadius: 'var(--radius-card)' }}>
            <p className="text-[var(--foreground)] leading-relaxed whitespace-pre-wrap text-lg">{summary}</p>
          </div>
        </section>
      )}

      {/* Core Competencies */}
      {skills.length > 0 && (
        <section style={sectionStyle} data-section="skills">
          <h2 style={headingStyle2}>
            Core Competencies
          </h2>
          <div className="grid" style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}>
            {['technical', 'framework', 'database', 'cloud', 'tool', 'language', 'soft', 'other'].map(category => {
              const categorySkills = skills.filter(s => s.category === category)
              if (categorySkills.length === 0) return null
              
              return (
                <div key={category} className="p-4 border" style={{ borderColor: `${colors.primary}30`, borderRadius: 'var(--radius-card)' }}>
                  <h3 className="text-xs font-bold mb-3 tracking-widest capitalize" style={{ ...headingStyle, textTransform: 'uppercase' }}>
                    {category.replace('_', ' ')}
                  </h3>
                  <p className="text-[var(--foreground)] leading-relaxed">
                    {categorySkills.map((skill, i) => (
                      <span key={skill.id} className="block mb-1">
                        {skill.name} <span className="font-normal opacity-60">({skill.proficiency})</span>
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
          <div className="space-y-[var(--space-entry)]">
            {experience.map((exp) => (
              <div key={exp.id} className="border-l-4 pl-6" style={{ ...entryStyle, borderColor: colors.primary }}>
                <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: 'var(--space-item)',
          }}>
                  <div>
                    <h3 className="text-xl font-bold mb-1" style={headingStyle}>{exp.position}</h3>
                    <p className="text-lg font-medium" style={{ color: colors.accent }}>{exp.company}</p>
                    {exp.location && <p className="text-sm text-[var(--muted-foreground)]">{exp.location}</p>}
                  </div>
                  <div className="text-right md:text-right self-center">
                    <p className="text-sm font-semibold tracking-wide" style={{ ...headingStyle, textTransform: 'uppercase' }}>
                      {getDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                  </div>
                </div>
                {exp.description.length > 0 && (
                  <ul className="list-disc list-inside space-y-[var(--space-item)] text-[var(--foreground)] leading-relaxed ml-4">
                    {exp.description.map((desc, i) => (
                      <li key={i} className="relative pl-2">{desc}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies.length > 0 && (
                  <p className="mt-[var(--space-item)] text-sm text-[var(--muted-foreground)]">
                    <span className="font-medium tracking-wide" style={{ textTransform: 'uppercase' }}>Key Areas: </span>
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
          <div className="space-y-[var(--space-entry)]">
            {education.map((edu) => (
              <div key={edu.id} className="p-4 border" style={{ ...entryStyle, borderColor: `${colors.primary}20`, borderRadius: 'var(--radius-card)' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}>
                  <div>
                    <p className="font-bold text-lg mb-1" style={headingStyle}>
                      {edu.degree}{edu.field && ` in ${edu.field}`}
                    </p>
                    <p className="font-medium" style={{ color: colors.accent }}>{edu.institution}</p>
                    {edu.location && <p className="text-sm text-[var(--muted-foreground)]">{edu.location}</p>}
                    {edu.honors && edu.honors.length > 0 && (
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">
                        <span className="font-medium">Honors: </span>{edu.honors.join(', ')}
                      </p>
                    )}
                    {edu.gpa && (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        <span className="font-medium">GPA: </span>{edu.gpa}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tracking-wide" style={{ ...headingStyle, textTransform: 'uppercase' }}>
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
          <div className="space-y-[var(--space-item)]">
            {certifications.map((cert) => (
              <div key={cert.id} className="p-4 border-l-4" style={{ ...entryStyle, borderColor: colors.accent, backgroundColor: `${colors.accent}05`, borderRadius: 'var(--radius-card)' }}>
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div>
                    <p className="font-bold" style={headingStyle}>{cert.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{cert.issuer}</p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      {formatDate(cert.date)}
                      {cert.expiryDate && ` – Expires: ${formatDate(cert.expiryDate)}`}
                      {cert.credentialId && ` | ID: ${cert.credentialId}`}
                    </p>
                  </div>
                  {cert.url && (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium self-center" style={{ color: colors.accent, textDecoration: 'underline' }}>
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
          <p className="text-[var(--foreground)]">
            {languages.map((lang, i) => (
              <span key={lang.id} className="block md:inline-block md:mr-6 mb-2 md:mb-0">
                <span className="font-medium">{lang.name}</span> — {lang.proficiency}
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
          <div className="space-y-[var(--space-entry)]">
            {section.items.map((item) => (
              <div key={item.id} className="pl-6 border-l-2" style={{ borderColor: colors.secondary }}>
                <h3 className="font-bold mb-1" style={headingStyle}>{item.title}</h3>
                {item.subtitle && <p className="text-sm" style={{ color: colors.accent }}>{item.subtitle}</p>}
                {item.date && <p className="text-sm text-[var(--muted-foreground)]">{item.date}</p>}
                {item.description && <p className="mt-2 text-[var(--foreground)] leading-relaxed">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}