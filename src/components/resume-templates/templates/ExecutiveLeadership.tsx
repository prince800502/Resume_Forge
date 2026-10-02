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
}

export function ExecutiveLeadership({ data, colors }: ExecutiveLeadershipProps) {
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

  return (
    <div className="executive-leadership-template" style={style} data-template="executive-leadership">
      {/* Header - Formal and centered */}
      <header className="mb-10 pb-8 border-b-2 text-center" style={{ borderColor: colors.primary }}>
        <div className="inline-flex items-center gap-3 mb-4" style={{ backgroundColor: colors.primary }}>
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
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 pb-2 border-b-2" style={headingStyle}>
            Executive Summary
          </h2>
          <div className="p-6 border-l-4" style={{ borderColor: colors.primary, backgroundColor: `${colors.primary}05` }}>
            <p className="text-[var(--foreground)] leading-relaxed whitespace-pre-wrap text-lg">{summary}</p>
          </div>
        </section>
      )}

      {/* Core Competencies */}
      {skills.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 pb-2 border-b-2" style={headingStyle}>
            Core Competencies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['technical', 'framework', 'database', 'cloud', 'tool', 'language', 'soft', 'other'].map(category => {
              const categorySkills = skills.filter(s => s.category === category)
              if (categorySkills.length === 0) return null
              
              return (
                <div key={category} className="p-4 border rounded-lg" style={{ borderColor: `${colors.primary}30` }}>
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
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-6 pb-2 border-b-2" style={headingStyle}>
            Leadership Experience
          </h2>
          <div className="space-y-8">
            {experience.map((exp) => (
              <div key={exp.id} className="border-l-4 pl-6" style={{ borderColor: colors.primary }}>
                <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-3">
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
                  <ul className="list-disc list-inside space-y-2 text-[var(--foreground)] leading-relaxed ml-4">
                    {exp.description.map((desc, i) => (
                      <li key={i} className="relative pl-2">{desc}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies.length > 0 && (
                  <p className="mt-4 text-sm text-[var(--muted-foreground)]">
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
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-6 pb-2 border-b-2" style={headingStyle}>
            Education
          </h2>
          <div className="space-y-5">
            {education.map((edu) => (
              <div key={edu.id} className="p-5 border rounded-lg" style={{ borderColor: `${colors.primary}20` }}>
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
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
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-6 pb-2 border-b-2" style={headingStyle}>
            Board Roles & Certifications
          </h2>
          <div className="space-y-4">
            {certifications.map((cert) => (
              <div key={cert.id} className="p-4 border-l-4" style={{ borderColor: colors.accent, backgroundColor: `${colors.accent}05` }}>
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
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 pb-2 border-b-2" style={headingStyle}>
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
        <section key={section.id} className="mb-10">
          <h2 className="text-lg font-bold mb-6 pb-2 border-b-2" style={headingStyle}>
            {section.title.toUpperCase()}
          </h2>
          <div className="space-y-5">
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