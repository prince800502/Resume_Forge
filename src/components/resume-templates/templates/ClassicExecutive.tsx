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
}

export function ClassicExecutive({ data, colors }: ClassicExecutiveProps) {
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

  return (
    <div className="classic-executive-template w-full" style={style} data-template="classic-executive">
      {/* Header - Centered */}
      <header className="mb-5 pb-4 text-center border-b-2" style={{ borderColor: colors.primary }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={headingStyle}>
          {personal.firstName} {personal.lastName}
        </h1>
        {personal.title && (
          <p className="text-lg font-normal mb-4" style={{ color: colors.accent }}>
            {personal.title}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-[var(--muted-foreground)]">
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
        </div>
      </header>

      {/* Professional Summary */}
      {summary && (
        <section className="mb-5">
          <h2 className="text-base font-bold mb-2 pb-1 border-b-2" style={headingStyle}>
            Professional Summary
          </h2>
          <p className="leading-relaxed text-[0.94rem] whitespace-pre-wrap" style={{ color: colors.text }}>{summary}</p>
        </section>
      )}

      {/* Main resume content */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(190px,0.85fr)] gap-x-8 items-start">
        <div className="min-w-0">

      {/* Professional Experience */}
      {experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-base font-bold mb-2 pb-1 border-b-2" style={headingStyle}>
            Professional Experience
          </h2>
          <div className="space-y-2.5">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-col md:flex-row md:justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold" style={{ color: colors.heading }}>{exp.position}</h3>
                    <p className="font-normal" style={{ color: colors.accent }}>{exp.company}</p>
                    {exp.location && <p className="text-sm text-[var(--muted-foreground)]">{exp.location}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: colors.accent }}>
                      {getDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                  </div>
                </div>
                {exp.description.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: colors.text }}>
                    {exp.description.map((desc, i) => (
                      <li key={i} className="leading-relaxed">{desc}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies.length > 0 && (
                  <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                    <span className="font-medium">Technologies: </span>
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
        <section className="mb-5">
          <h2 className="text-base font-bold mb-2 pb-1 border-b-2" style={headingStyle}>
            Education
          </h2>
          <div className="space-y-2.5">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex flex-col md:flex-row md:justify-between gap-2">
                  <div>
                    <p className="font-bold" style={{ color: colors.heading }}>
                      {edu.degree}{edu.field && ` in ${edu.field}`}
                    </p>
                    <p className="font-normal">{edu.institution}</p>
                    {edu.location && <p className="text-sm text-[var(--muted-foreground)]">{edu.location}</p>}
                    {edu.honors && edu.honors.length > 0 && (
                      <p className="text-sm text-[var(--muted-foreground)]">
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
                    <p className="text-sm" style={{ color: colors.accent }}>
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

        <aside className="min-w-0 lg:border-l lg:pl-6" style={{ borderColor: `${colors.primary}30` }}>
      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-base font-bold mb-2 pb-1 border-b-2" style={headingStyle}>
            Core Competencies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['technical', 'framework', 'database', 'cloud', 'tool', 'language', 'soft', 'other'].map(category => {
              const categorySkills = skills.filter(s => s.category === category)
              if (categorySkills.length === 0) return null
              
              return (
                <div key={category}>
                  <h3 className="text-xs font-bold mb-1 capitalize" style={{ color: colors.heading, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {category.replace('_', ' ')}
                  </h3>
                  <p style={{ color: colors.text }}>
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
        <section className="mb-5">
          <h2 className="text-base font-bold mb-2 pb-1 border-b-2" style={headingStyle}>
            Certifications
          </h2>
          <div className="space-y-2.5">
            {certifications.map((cert) => (
              <div key={cert.id} className="p-3 border-l-4" style={{ borderColor: colors.primary }}>
                <div className="flex flex-col md:flex-row md:justify-between gap-2">
                  <div>
                    <p className="font-bold" style={{ color: colors.heading }}>{cert.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{cert.issuer}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {formatDate(cert.date)}
                      {cert.expiryDate && ` – Expires: ${formatDate(cert.expiryDate)}`}
                    </p>
                  </div>
                  {cert.url && (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium" style={{ color: colors.accent }}>
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
        <section className="mb-5">
          <h2 className="text-base font-bold mb-2 pb-1 border-b-2" style={headingStyle}>
            Languages
          </h2>
          <p style={{ color: colors.text }}>
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
        <section key={section.id} className="mb-8">
          <h2 className="text-base font-bold mb-2 pb-1 border-b-2" style={headingStyle}>
            {section.title.toUpperCase()}
          </h2>
          <div className="space-y-2.5">
            {section.items.map((item) => (
              <div key={item.id} className="pl-4 border-l-2" style={{ borderColor: colors.secondary }}>
                <h3 className="font-bold" style={{ color: colors.heading }}>{item.title}</h3>
                {item.subtitle && <p className="text-sm" style={{ color: colors.accent }}>{item.subtitle}</p>}
                {item.date && <p className="text-sm text-[var(--muted-foreground)]">{item.date}</p>}
                {item.description && <p className="mt-1" style={{ color: colors.text }}>{item.description}</p>}
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