export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  provider?: 'email' | 'google' | 'microsoft' | 'guest'
  created_at: string
  updated_at: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  default_template?: string
  auto_save: boolean
  notifications: boolean
}

export interface Resume {
  id: string
  user_id: string
  title: string
  template_id: string
  data: ResumeData
  is_public: boolean
  ats_score?: number
  created_at: string
  updated_at: string
}

export interface ResumeData {
  personal: PersonalInfo
  summary: string
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  projects: Project[]
  certifications: Certification[]
  languages: Language[]
  custom_sections: CustomSection[]
}

export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  github: string
  portfolio: string
  title: string
}

export interface Experience {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string[]
  technologies: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  gpa?: string
  honors?: string[]
}

export interface Skill {
  id: string
  name: string
  category: SkillCategory
  proficiency: ProficiencyLevel
}

export type SkillCategory = 'technical' | 'soft' | 'language' | 'tool' | 'framework' | 'database' | 'cloud' | 'other'
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface Project {
  id: string
  name: string
  description: string
  url?: string
  github?: string
  technologies: string[]
  startDate: string
  endDate?: string
  highlights: string[]
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  expiryDate?: string
  credentialId?: string
  url?: string
}

export interface Language {
  id: string
  name: string
  proficiency: 'native' | 'fluent' | 'conversational' | 'basic'
}

export interface CustomSection {
  id: string
  title: string
  items: CustomSectionItem[]
}

export interface CustomSectionItem {
  id: string
  title: string
  subtitle?: string
  date?: string
  description: string
}

export interface Template {
  id: string
  name: string
  description: string
  thumbnail: string
  category: 'modern' | 'classic' | 'creative' | 'minimal' | 'executive'
  isPremium: boolean
  atsOptimized: boolean
  colors: TemplateColors
}

export interface TemplateColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  heading: string
}

export interface ATSCheckResult {
  score: number
  keywords: {
    found: string[]
    missing: string[]
    suggested: string[]
  }
  sections: {
    name: string
    score: number
    feedback: string[]
  }[]
  formatting: {
    score: number
    issues: string[]
  }
  readability: {
    score: number
    gradeLevel: string
    wordCount: number
  }
  suggestions: string[]
}

export interface JobDescription {
  id: string
  title: string
  company: string
  description: string
  requiredSkills: string[]
  preferredSkills: string[]
}

export type Theme = 'light' | 'dark' | 'system'

export interface AnimationConfig {
  duration: number
  ease: string
  delay?: number
}

export interface BlackHoleConfig {
  duration: number
  particleCount: number
  colors: string[]
  blastRadius: number
}