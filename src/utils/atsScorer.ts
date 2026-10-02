import { ResumeData, ATSCheckResult, SkillCategory } from '@/types'

// Common technical skills/keywords for extraction
const TECH_KEYWORDS = [
  // Programming languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab',
  // Frontend
  'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'remix', 'gatsby', 'html', 'css', 'scss', 'sass', 'tailwind', 'bootstrap',
  // Backend
  'node.js', 'express', 'fastapi', 'django', 'flask', 'spring', 'spring boot', 'laravel', 'rails', 'asp.net', 'graphql', 'rest', 'grpc',
  // Databases
  'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'cassandra', 'sqlite', 'oracle', 'sql server',
  // Cloud/DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'gitlab ci', 'github actions', 'circleci',
  // Tools
  'git', 'webpack', 'vite', 'esbuild', 'babel', 'eslint', 'prettier', 'jest', 'cypress', 'playwright', 'storybook',
  // Data/ML
  'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn', 'spark', 'hadoop', 'kafka', 'airflow',
  // Methodologies
  'agile', 'scrum', 'kanban', 'tdd', 'ci/cd', 'microservices', 'serverless', 'event-driven', 'domain-driven design',
]

const ACTION_VERBS = [
  'built', 'developed', 'created', 'designed', 'implemented', 'architected', 'engineered',
  'led', 'managed', 'directed', 'supervised', 'mentored', 'coached',
  'improved', 'optimized', 'reduced', 'increased', 'scaled', 'automated', 'streamlined',
  'delivered', 'launched', 'shipped', 'released', 'deployed',
  'analyzed', 'researched', 'investigated', 'diagnosed', 'resolved', 'fixed',
  'collaborated', 'partnered', 'coordinated', 'facilitated',
]

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s+.#]/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractWords(text: string): string[] {
  return normalizeText(text).split(' ').filter(w => w.length > 2)
}

function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text)
  const found = new Set<string>()
  
  // Check for known tech keywords
  for (const kw of TECH_KEYWORDS) {
    if (normalized.includes(kw)) {
      found.add(kw)
    }
  }
  
  // Also extract capitalized words (potential proper nouns/technologies)
  const words = text.match(/\b[A-Z][a-zA-Z0-9+.#]+\b/g) || []
  for (const w of words) {
    if (w.length > 2 && w.length < 30) {
      found.add(w.toLowerCase())
    }
  }
  
  return Array.from(found)
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

function estimateReadingLevel(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
  const words = countWords(text)
  const syllables = text.match(/[aeiouy]+/gi)?.length || words
  
  if (sentences === 0) return 'N/A'
  
  const avgWordsPerSentence = words / sentences
  const avgSyllablesPerWord = syllables / words
  
  // Flesch-Kincaid Grade Level
  const grade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59
  
  if (grade <= 6) return 'Elementary'
  if (grade <= 9) return 'Middle School'
  if (grade <= 12) return 'High School'
  if (grade <= 14) return 'College'
  if (grade <= 16) return 'Bachelor\'s'
  if (grade <= 18) return 'Master\'s'
  return 'Doctorate'
}

interface ScoredSection {
  name: string
  score: number
  maxScore: number
  feedback: string[]
}

export function calculateATSScore(resume: ResumeData, jobDescription?: string): ATSCheckResult {
  const sections: ScoredSection[] = []
  const allFeedback: string[] = []
  const strengths: string[] = []
  const missing: string[] = []
  let totalScore = 0
  let maxTotalScore = 0

  // Calculate word count once for reuse
  const wordCount = countWords([
    resume.summary,
    ...resume.experience.flatMap(e => e.description),
    ...resume.projects.map(p => p.description),
  ].join(' '))

  // Helper to add section
  const addSection = (section: ScoredSection) => {
    sections.push(section)
    totalScore += section.score
    maxTotalScore += section.maxScore
    allFeedback.push(...section.feedback)
    if (section.score === section.maxScore) {
      strengths.push(section.name)
    } else if (section.score < section.maxScore * 0.5) {
      missing.push(section.name)
    }
  }

  // ===== 1. CONTACT INFORMATION (10 pts) =====
  {
    let score = 0
    const feedback: string[] = []
    const p = resume.personal
    
    if (p.firstName && p.lastName) { score += 2; feedback.push('Full name provided') }
    else { feedback.push('Missing full name') }
    
    if (p.email && p.email.includes('@')) { score += 2; feedback.push('Email provided') }
    else { feedback.push('Missing valid email') }
    
    if (p.phone) { score += 1; feedback.push('Phone number provided') }
    else { feedback.push('Missing phone number') }
    
    if (p.location) { score += 1; feedback.push('Location provided') }
    else { feedback.push('Missing location') }
    
    if (p.linkedin) { score += 2; feedback.push('LinkedIn profile provided') }
    else { feedback.push('Missing LinkedIn profile') }
    
    if (p.github || p.portfolio || p.website) { score += 2; feedback.push('Portfolio/GitHub/website provided') }
    else { feedback.push('Missing portfolio/GitHub/website') }
    
    addSection({ name: 'Contact Information', score, maxScore: 10, feedback })
  }

  // ===== 2. PROFESSIONAL SUMMARY (10 pts) =====
  {
    let score = 0
    const feedback: string[] = []
    const summary = resume.summary?.trim()
    
    if (summary) {
      score += 4
      feedback.push('Professional summary present')
      
      const wordCount = countWords(summary)
      if (wordCount >= 50) { score += 3; feedback.push('Good summary length') }
      else if (wordCount >= 30) { score += 2; feedback.push('Summary could be more detailed') }
      else { score += 1; feedback.push('Summary is too brief') }
      
      // Check for keywords in summary
      const summaryKeywords = extractKeywords(summary)
      if (summaryKeywords.length >= 5) { score += 3; feedback.push('Summary contains relevant keywords') }
      else if (summaryKeywords.length >= 2) { score += 2; feedback.push('Summary has some keywords') }
      else { score += 1; feedback.push('Summary lacks technical keywords') }
    } else {
      feedback.push('Missing professional summary - critical for ATS')
    }
    
    addSection({ name: 'Professional Summary', score, maxScore: 10, feedback })
  }

  // ===== 3. SKILLS (15 pts) =====
  {
    let score = 0
    const feedback: string[] = []
    const skills = resume.skills
    
    if (skills.length === 0) {
      feedback.push('No skills listed - critical for ATS')
    } else {
      score += 3
      feedback.push(`${skills.length} skills listed`)
      
      // Categorize skills
      const categories = new Set<SkillCategory>()
      const proficiencies = new Set<string>()
      
      for (const s of skills) {
        categories.add(s.category)
        proficiencies.add(s.proficiency)
      }
      
      // Category diversity (max 5 pts)
      const catScore = Math.min(categories.size, 5)
      score += catScore
      feedback.push(`${categories.size} skill categories`)
      
      // Proficiency levels (max 3 pts)
      const hasExpert = proficiencies.has('expert')
      const hasAdvanced = proficiencies.has('advanced')
      if (hasExpert) { score += 3; feedback.push('Expert-level skills shown') }
      else if (hasAdvanced) { score += 2; feedback.push('Advanced skills shown') }
      else { score += 1; feedback.push('Add expert/advanced proficiency levels') }
      
      // Technical skills count (max 4 pts)
      const techSkills = skills.filter(s => ['technical', 'framework', 'database', 'cloud', 'tool'].includes(s.category))
      if (techSkills.length >= 15) { score += 4; feedback.push('Strong technical skill set') }
      else if (techSkills.length >= 10) { score += 3; feedback.push('Good technical skill coverage') }
      else if (techSkills.length >= 5) { score += 2; feedback.push('Moderate technical skills') }
      else { score += 1; feedback.push('Add more technical skills') }
    }
    
    addSection({ name: 'Skills', score, maxScore: 15, feedback })
  }

  // ===== 4. WORK EXPERIENCE (25 pts) =====
  {
    let score = 0
    const feedback: string[] = []
    const exp = resume.experience
    
    if (exp.length === 0) {
      feedback.push('No work experience listed')
    } else {
      score += 5
      feedback.push(`${exp.length} position${exp.length > 1 ? 's' : ''} listed`)
      
      // Check each position
      let totalBullets = 0
      let positionsWithBullets = 0
      let positionsWithTech = 0
      let positionsWithDates = 0
      let hasQuantifiable = false
      let hasActionVerbs = false
      
      for (const e of exp) {
        if (e.description.length > 0) {
          positionsWithBullets++
          totalBullets += e.description.length
          
          // Check for action verbs
          const descText = e.description.join(' ').toLowerCase()
          if (ACTION_VERBS.some(v => descText.includes(v))) hasActionVerbs = true
          
          // Check for quantifiable achievements (numbers, percentages)
          if (/\d+(\.\d+)?%?/.test(descText)) hasQuantifiable = true
        }
        
        if (e.technologies.length > 0) positionsWithTech++
        if (e.startDate && e.endDate) positionsWithDates++
      }
      
      // Bullets (max 5 pts)
      const avgBullets = totalBullets / exp.length
      if (avgBullets >= 5) { score += 5; feedback.push('Detailed bullet points') }
      else if (avgBullets >= 3) { score += 3; feedback.push('Good bullet point coverage') }
      else { score += 1; feedback.push('Add more bullet points per role') }
      
      // Technologies per role (max 4 pts)
      if (positionsWithTech === exp.length) { score += 4; feedback.push('Technologies listed for all roles') }
      else if (positionsWithTech > 0) { score += 2; feedback.push('Some roles have technologies') }
      else { feedback.push('Add technologies to each role') }
      
      // Dates (max 3 pts)
      if (positionsWithDates === exp.length) { score += 3; feedback.push('All roles have dates') }
      else { feedback.push('Add start/end dates to all roles') }
      
      // Quantifiable achievements (max 4 pts)
      if (hasQuantifiable) { score += 4; feedback.push('Quantifiable achievements found') }
      else { feedback.push('Add metrics/numbers to achievements') }
      
      // Action verbs (max 2 pts)
      if (hasActionVerbs) { score += 2; feedback.push('Strong action verbs used') }
      else { feedback.push('Start bullets with action verbs') }
      
      // Duration/career progression (max 2 pts)
      if (exp.length >= 3) { score += 2; feedback.push('Good career history depth') }
      else if (exp.length >= 2) { score += 1; feedback.push('Multiple positions shown') }
    }
    
    addSection({ name: 'Work Experience', score, maxScore: 25, feedback })
  }

  // ===== 5. EDUCATION (10 pts) =====
  {
    let score = 0
    const feedback: string[] = []
    const edu = resume.education
    
    if (edu.length === 0) {
      feedback.push('No education listed')
    } else {
      score += 3
      feedback.push(`${edu.length} education entr${edu.length > 1 ? 'ies' : 'y'}`)
      
      for (const e of edu) {
        if (e.degree) { score += 1; break }
      }
      for (const e of edu) {
        if (e.institution) { score += 1; break }
      }
      for (const e of edu) {
        if (e.field) { score += 1; break }
      }
      for (const e of edu) {
        if (e.startDate && e.endDate) { score += 2; feedback.push('Dates provided'); break }
      }
      if (edu.some(e => e.gpa)) { score += 1; feedback.push('GPA included') }
      if (edu.some(e => e.honors && e.honors.length > 0)) { score += 1; feedback.push('Honors/awards listed') }
    }
    
    addSection({ name: 'Education', score, maxScore: 10, feedback })
  }

  // ===== 6. PROJECTS (10 pts) =====
  {
    let score = 0
    const feedback: string[] = []
    const projects = resume.projects
    
    if (projects.length === 0) {
      feedback.push('No projects listed')
    } else {
      score += 3
      feedback.push(`${projects.length} project${projects.length > 1 ? 's' : ''} listed`)
      
      let withDesc = 0, withTech = 0, withLinks = 0, withHighlights = 0
      
      for (const p of projects) {
        if (p.description) withDesc++
        if (p.technologies.length > 0) withTech++
        if (p.url || p.github) withLinks++
        if (p.highlights.length > 0) withHighlights++
      }
      
      if (withDesc === projects.length) { score += 2; feedback.push('All projects have descriptions') }
      else if (withDesc > 0) { score += 1; feedback.push('Some projects have descriptions') }
      
      if (withTech === projects.length) { score += 2; feedback.push('All projects have tech stacks') }
      else if (withTech > 0) { score += 1; feedback.push('Some projects have tech stacks') }
      
      if (withLinks > 0) { score += 2; feedback.push('Project links provided') }
      else { feedback.push('Add live demo/GitHub links') }
      
      if (withHighlights > 0) { score += 1; feedback.push('Project highlights included') }
    }
    
    addSection({ name: 'Projects', score, maxScore: 10, feedback })
  }

  // ===== 7. CERTIFICATIONS (5 pts) =====
  {
    let score = 0
    const feedback: string[] = []
    const certs = resume.certifications
    
    if (certs.length === 0) {
      feedback.push('No certifications listed')
    } else {
      score += 2
      feedback.push(`${certs.length} certification${certs.length > 1 ? 's' : ''}`)
      
      const withIssuer = certs.filter(c => c.issuer).length
      const withDate = certs.filter(c => c.date).length
      const withUrl = certs.filter(c => c.url).length
      
      if (withIssuer === certs.length) { score += 1; feedback.push('All have issuers') }
      if (withDate === certs.length) { score += 1; feedback.push('All have dates') }
      if (withUrl > 0) { score += 1; feedback.push('Verification URLs provided') }
    }
    
    addSection({ name: 'Certifications', score, maxScore: 5, feedback })
  }

  // ===== 8. KEYWORDS vs JOB DESCRIPTION (15 pts) =====
  let resumeKeywords: string[] = []
  let jobKeywords: string[] = []
  let matchedKeywords: string[] = []
  let missingKeywords: string[] = []
  let suggestedKeywords: string[] = []
  let keywordScore = 0
  let keywordFeedback: string[] = []

  if (jobDescription) {
    resumeKeywords = extractKeywords([
      resume.summary,
      ...resume.experience.flatMap(e => [...e.description, ...e.technologies]),
      ...resume.skills.map(s => s.name),
      ...resume.projects.flatMap(p => [p.description, ...p.technologies]),
    ].join(' '))

    jobKeywords = extractKeywords(jobDescription)
    
    matchedKeywords = jobKeywords.filter(k => resumeKeywords.includes(k))
    missingKeywords = jobKeywords.filter(k => !resumeKeywords.includes(k))
    
    // Suggest top missing keywords
    suggestedKeywords = missingKeywords.slice(0, 10)
    
    const matchRate = jobKeywords.length > 0 ? matchedKeywords.length / jobKeywords.length : 0
    
    if (matchRate >= 0.7) { keywordScore = 15; keywordFeedback.push(`Excellent keyword match: ${Math.round(matchRate * 100)}%`) }
    else if (matchRate >= 0.5) { keywordScore = 10; keywordFeedback.push(`Good keyword match: ${Math.round(matchRate * 100)}%`) }
    else if (matchRate >= 0.3) { keywordScore = 5; keywordFeedback.push(`Moderate keyword match: ${Math.round(matchRate * 100)}%`) }
    else { keywordScore = 2; keywordFeedback.push(`Low keyword match: ${Math.round(matchRate * 100)}% - add more relevant keywords`) }
    
    keywordFeedback.push(`${matchedKeywords.length}/${jobKeywords.length} job keywords matched`)
  } else {
    // No job description - score based on general keyword richness
    resumeKeywords = extractKeywords([
      resume.summary,
      ...resume.experience.flatMap(e => [...e.description, ...e.technologies]),
      ...resume.skills.map(s => s.name),
      ...resume.projects.flatMap(p => [p.description, ...p.technologies]),
    ].join(' '))
    
    if (resumeKeywords.length >= 30) { keywordScore = 10; keywordFeedback.push('Rich keyword diversity') }
    else if (resumeKeywords.length >= 20) { keywordScore = 7; keywordFeedback.push('Good keyword variety') }
    else if (resumeKeywords.length >= 10) { keywordScore = 4; keywordFeedback.push('Moderate keyword variety') }
    else { keywordScore = 2; keywordFeedback.push('Add more technical keywords') }
    
    keywordFeedback.push('No job description provided - showing general keyword analysis')
  }

  addSection({ name: 'Keyword Match', score: keywordScore, maxScore: 15, feedback: keywordFeedback })

  // ===== 9. FORMATTING & READABILITY (10 pts) =====
  {
    let score = 0
    const feedback: string[] = []
    const issues: string[] = []
    
    const gradeLevel = estimateReadingLevel([
      resume.summary,
      ...resume.experience.flatMap(e => e.description),
    ].join(' '))
    
    // Section completeness
    const hasContact = resume.personal.firstName && resume.personal.email
    const hasSummary = !!resume.summary?.trim()
    const hasExperience = resume.experience.length > 0
    const hasEducation = resume.education.length > 0
    const hasSkills = resume.skills.length > 0
    
    const completeSections = [hasContact, hasSummary, hasExperience, hasEducation, hasSkills].filter(Boolean).length
    score += completeSections * 1.5 // Max 7.5
    
    if (completeSections === 5) feedback.push('All core sections present')
    else issues.push(`Missing ${5 - completeSections} core section${5 - completeSections > 1 ? 's' : ''}`)
    
    // Word count
    if (wordCount >= 400) { score += 1.5; feedback.push('Good content depth') }
    else if (wordCount >= 250) { score += 1; feedback.push('Adequate content length') }
    else { issues.push('Resume may be too brief') }
    
    // Reading level
    if (gradeLevel !== 'N/A') {
      if (gradeLevel === 'High School' || gradeLevel === 'College') { score += 1; feedback.push('Appropriate reading level') }
    }
    
    addSection({ name: 'Formatting & Readability', score: Math.round(score), maxScore: 10, feedback })
    
    // Store formatting issues for result
    ;(sections[sections.length - 1] as any).formattingIssues = issues
  }

  // ===== FINAL CALCULATION =====
  const finalScore = Math.round((totalScore / maxTotalScore) * 100)

  // Compile suggestions
  const suggestions: string[] = [
    ...missing.map(m => `Complete the ${m} section`),
    ...allFeedback.filter(f => f.startsWith('Add') || f.startsWith('Missing') || f.startsWith('Include')),
  ].slice(0, 10)

  // Get formatting issues from the last section
  const formattingIssues = (sections[sections.length - 1] as any).formattingIssues || []

  return {
    score: finalScore,
    keywords: {
      found: matchedKeywords,
      missing: missingKeywords,
      suggested: suggestedKeywords,
    },
    sections: sections.map(s => ({
      name: s.name,
      score: Math.round((s.score / s.maxScore) * 100),
      feedback: s.feedback,
    })),
    formatting: {
      score: sections.find(s => s.name === 'Formatting & Readability')?.score || 0,
      issues: formattingIssues,
    },
    readability: {
      score: sections.find(s => s.name === 'Formatting & Readability')?.score || 0,
      gradeLevel: estimateReadingLevel([
        resume.summary,
        ...resume.experience.flatMap(e => e.description),
      ].join(' ')),
      wordCount,
    },
    suggestions: [...new Set(suggestions)].slice(0, 10),
  }
}

export { extractKeywords, TECH_KEYWORDS }