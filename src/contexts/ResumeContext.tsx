import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Resume, ResumeData, PersonalInfo, Experience, Education, Skill, Project, Certification, Language, CustomSection } from '../types'
import { supabase } from '../services/supabase'
import { useAuth } from './AuthContext'

interface ResumeContextType {
  resumes: Resume[]
  currentResume: Resume | null
  loading: boolean
  createResume: (title?: string, templateId?: string) => Promise<Resume>
  updateResume: (id: string, data: Partial<Resume>) => Promise<void>
  deleteResume: (id: string) => Promise<void>
  setCurrentResume: (resume: Resume | null) => void
  updateResumeData: (data: Partial<ResumeData>) => Promise<void>
  updatePersonalInfo: (info: Partial<PersonalInfo>) => Promise<void>
  addExperience: (exp: Omit<Experience, 'id'>) => Promise<void>
  updateExperience: (id: string, exp: Partial<Experience>) => Promise<void>
  deleteExperience: (id: string) => Promise<void>
  addEducation: (edu: Omit<Education, 'id'>) => Promise<void>
  updateEducation: (id: string, edu: Partial<Education>) => Promise<void>
  deleteEducation: (id: string) => Promise<void>
  addSkill: (skill: Omit<Skill, 'id'>) => Promise<void>
  updateSkill: (id: string, skill: Partial<Skill>) => Promise<void>
  deleteSkill: (id: string) => Promise<void>
  addProject: (project: Omit<Project, 'id'>) => Promise<void>
  updateProject: (id: string, project: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  addCertification: (cert: Omit<Certification, 'id'>) => Promise<void>
  updateCertification: (id: string, cert: Partial<Certification>) => Promise<void>
  deleteCertification: (id: string) => Promise<void>
  addLanguage: (lang: Omit<Language, 'id'>) => Promise<void>
  updateLanguage: (id: string, lang: Partial<Language>) => Promise<void>
  deleteLanguage: (id: string) => Promise<void>
  addCustomSection: (section: Omit<CustomSection, 'id'>) => Promise<void>
  updateCustomSection: (id: string, section: Partial<CustomSection>) => Promise<void>
  deleteCustomSection: (id: string) => Promise<void>
  duplicateResume: (id: string) => Promise<Resume>
  exportResume: (id: string, format: 'pdf' | 'json') => Promise<void>
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined)

const defaultPersonalInfo: PersonalInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  linkedin: '',
  github: '',
  portfolio: '',
  title: '',
}

const defaultResumeData: ResumeData = {
  personal: defaultPersonalInfo,
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  custom_sections: [],
}

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [currentResume, setCurrentResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchResumes = useCallback(async () => {
    if (!user || user.provider === 'guest') return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setResumes(data || [])
    } catch (error) {
      console.error('Error fetching resumes:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchResumes()
  }, [fetchResumes])

  const createResume = useCallback(async (title = 'Untitled Resume', templateId = 'modern-1'): Promise<Resume> => {
    if (!user || user.provider === 'guest') {
      // Create local resume for guest
      const newResume: Resume = {
        id: generateId(),
        user_id: user?.id || 'guest',
        title,
        template_id: templateId,
        data: defaultResumeData,
        is_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setResumes(prev => [newResume, ...prev])
      setCurrentResume(newResume)
      return newResume
    }

    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        title,
        template_id: templateId,
        data: defaultResumeData,
        is_public: false,
      })
      .select()
      .single()

    if (error) throw error
    
    const resume = data as Resume
    setResumes(prev => [resume, ...prev])
    setCurrentResume(resume)
    return resume
  }, [user])

  const updateResume = useCallback(async (id: string, updates: Partial<Resume>) => {
    const updatedResume = { ...updates, updated_at: new Date().toISOString() }
    
    if (user?.provider !== 'guest' && session) {
      const { error } = await supabase
        .from('resumes')
        .update(updatedResume)
        .eq('id', id)
      if (error) throw error
    }

    setResumes(prev => prev.map(r => r.id === id ? { ...r, ...updatedResume } : r))
    if (currentResume?.id === id) {
      setCurrentResume(prev => prev ? { ...prev, ...updatedResume } : null)
    }
  }, [user, session, currentResume])

  const deleteResume = useCallback(async (id: string) => {
    if (user?.provider !== 'guest' && session) {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id)
      if (error) throw error
    }

    setResumes(prev => prev.filter(r => r.id !== id))
    if (currentResume?.id === id) {
      setCurrentResume(null)
    }
  }, [user, session, currentResume])

  const updateResumeData = useCallback(async (data: Partial<ResumeData>) => {
    if (!currentResume) return
    await updateResume(currentResume.id, { data: { ...currentResume.data, ...data } })
  }, [currentResume, updateResume])

  const updatePersonalInfo = useCallback(async (info: Partial<PersonalInfo>) => {
    if (!currentResume) return
    await updateResumeData({ personal: { ...currentResume.data.personal, ...info } })
  }, [currentResume, updateResumeData])

  const addExperience = useCallback(async (exp: Omit<Experience, 'id'>) => {
    if (!currentResume) return
    const newExp = { ...exp, id: generateId() }
    await updateResumeData({ experience: [...currentResume.data.experience, newExp] })
  }, [currentResume, updateResumeData])

  const updateExperience = useCallback(async (id: string, exp: Partial<Experience>) => {
    if (!currentResume) return
    await updateResumeData({
      experience: currentResume.data.experience.map(e => e.id === id ? { ...e, ...exp } : e)
    })
  }, [currentResume, updateResumeData])

  const deleteExperience = useCallback(async (id: string) => {
    if (!currentResume) return
    await updateResumeData({
      experience: currentResume.data.experience.filter(e => e.id !== id)
    })
  }, [currentResume, updateResumeData])

  const addEducation = useCallback(async (edu: Omit<Education, 'id'>) => {
    if (!currentResume) return
    const newEdu = { ...edu, id: generateId() }
    await updateResumeData({ education: [...currentResume.data.education, newEdu] })
  }, [currentResume, updateResumeData])

  const updateEducation = useCallback(async (id: string, edu: Partial<Education>) => {
    if (!currentResume) return
    await updateResumeData({
      education: currentResume.data.education.map(e => e.id === id ? { ...e, ...edu } : e)
    })
  }, [currentResume, updateResumeData])

  const deleteEducation = useCallback(async (id: string) => {
    if (!currentResume) return
    await updateResumeData({
      education: currentResume.data.education.filter(e => e.id !== id)
    })
  }, [currentResume, updateResumeData])

  const addSkill = useCallback(async (skill: Omit<Skill, 'id'>) => {
    if (!currentResume) return
    const newSkill = { ...skill, id: generateId() }
    await updateResumeData({ skills: [...currentResume.data.skills, newSkill] })
  }, [currentResume, updateResumeData])

  const updateSkill = useCallback(async (id: string, skill: Partial<Skill>) => {
    if (!currentResume) return
    await updateResumeData({
      skills: currentResume.data.skills.map(s => s.id === id ? { ...s, ...skill } : s)
    })
  }, [currentResume, updateResumeData])

  const deleteSkill = useCallback(async (id: string) => {
    if (!currentResume) return
    await updateResumeData({
      skills: currentResume.data.skills.filter(s => s.id !== id)
    })
  }, [currentResume, updateResumeData])

  const addProject = useCallback(async (project: Omit<Project, 'id'>) => {
    if (!currentResume) return
    const newProject = { ...project, id: generateId() }
    await updateResumeData({ projects: [...currentResume.data.projects, newProject] })
  }, [currentResume, updateResumeData])

  const updateProject = useCallback(async (id: string, project: Partial<Project>) => {
    if (!currentResume) return
    await updateResumeData({
      projects: currentResume.data.projects.map(p => p.id === id ? { ...p, ...project } : p)
    })
  }, [currentResume, updateResumeData])

  const deleteProject = useCallback(async (id: string) => {
    if (!currentResume) return
    await updateResumeData({
      projects: currentResume.data.projects.filter(p => p.id !== id)
    })
  }, [currentResume, updateResumeData])

  const addCertification = useCallback(async (cert: Omit<Certification, 'id'>) => {
    if (!currentResume) return
    const newCert = { ...cert, id: generateId() }
    await updateResumeData({ certifications: [...currentResume.data.certifications, newCert] })
  }, [currentResume, updateResumeData])

  const updateCertification = useCallback(async (id: string, cert: Partial<Certification>) => {
    if (!currentResume) return
    await updateResumeData({
      certifications: currentResume.data.certifications.map(c => c.id === id ? { ...c, ...cert } : c)
    })
  }, [currentResume, updateResumeData])

  const deleteCertification = useCallback(async (id: string) => {
    if (!currentResume) return
    await updateResumeData({
      certifications: currentResume.data.certifications.filter(c => c.id !== id)
    })
  }, [currentResume, updateResumeData])

  const addLanguage = useCallback(async (lang: Omit<Language, 'id'>) => {
    if (!currentResume) return
    const newLang = { ...lang, id: generateId() }
    await updateResumeData({ languages: [...currentResume.data.languages, newLang] })
  }, [currentResume, updateResumeData])

  const updateLanguage = useCallback(async (id: string, lang: Partial<Language>) => {
    if (!currentResume) return
    await updateResumeData({
      languages: currentResume.data.languages.map(l => l.id === id ? { ...l, ...lang } : l)
    })
  }, [currentResume, updateResumeData])

  const deleteLanguage = useCallback(async (id: string) => {
    if (!currentResume) return
    await updateResumeData({
      languages: currentResume.data.languages.filter(l => l.id !== id)
    })
  }, [currentResume, updateResumeData])

  const addCustomSection = useCallback(async (section: Omit<CustomSection, 'id'>) => {
    if (!currentResume) return
    const newSection = { ...section, id: generateId() }
    await updateResumeData({ custom_sections: [...currentResume.data.custom_sections, newSection] })
  }, [currentResume, updateResumeData])

  const updateCustomSection = useCallback(async (id: string, section: Partial<CustomSection>) => {
    if (!currentResume) return
    await updateResumeData({
      custom_sections: currentResume.data.custom_sections.map(s => s.id === id ? { ...s, ...section } : s)
    })
  }, [currentResume, updateResumeData])

  const deleteCustomSection = useCallback(async (id: string) => {
    if (!currentResume) return
    await updateResumeData({
      custom_sections: currentResume.data.custom_sections.filter(s => s.id !== id)
    })
  }, [currentResume, updateResumeData])

  const duplicateResume = useCallback(async (id: string): Promise<Resume> => {
    const resume = resumes.find(r => r.id === id)
    if (!resume) throw new Error('Resume not found')
    
    return createResume(`${resume.title} (Copy)`, resume.template_id)
  }, [resumes, createResume])

  const exportResume = useCallback(async (id: string, format: 'pdf' | 'json') => {
    const resume = resumes.find(r => r.id === id) || currentResume
    if (!resume) throw new Error('Resume not found')

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resume.title.replace(/\s+/g, '_')}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
    // PDF export handled by component using html2canvas + jspdf
  }, [resumes, currentResume])

  return (
    <ResumeContext.Provider value={{
      resumes,
      currentResume,
      loading,
      createResume,
      updateResume,
      deleteResume,
      setCurrentResume,
      updateResumeData,
      updatePersonalInfo,
      addExperience,
      updateExperience,
      deleteExperience,
      addEducation,
      updateEducation,
      deleteEducation,
      addSkill,
      updateSkill,
      deleteSkill,
      addProject,
      updateProject,
      deleteProject,
      addCertification,
      updateCertification,
      deleteCertification,
      addLanguage,
      updateLanguage,
      deleteLanguage,
      addCustomSection,
      updateCustomSection,
      deleteCustomSection,
      duplicateResume,
      exportResume,
    }}>
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  const context = useContext(ResumeContext)
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider')
  }
  return context
}