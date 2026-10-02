import React, { useState, useCallback } from 'react'
import { 
  ResumeData, 
  PersonalInfo, 
  Experience, 
  Education, 
  Skill, 
  Project, 
  Certification, 
  Language, 
  CustomSection,
  CustomSectionItem,
  SkillCategory,
  ProficiencyLevel
} from '@/types'
import { 
  Button, Input, Textarea, Card, Badge, Select, Toggle, Divider
} from '@/components/ui'
import { 
  PlusIcon, TrashIcon, PencilIcon, 
  ChevronUpIcon, ChevronDownIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

// Personal Info Section
interface PersonalInfoEditorProps {
  data: PersonalInfo
  onChange: (info: Partial<PersonalInfo>) => void
}

export function PersonalInfoEditor({ data, onChange }: PersonalInfoEditorProps) {
  return (
    <Card variant="hover" padding="lg" className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <Badge variant="cosmic" size="sm">Required</Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="First Name"
          value={data.firstName}
          onChange={(e) => onChange({ firstName: e.target.value })}
          placeholder="John"
        />
        <Input
          label="Last Name"
          value={data.lastName}
          onChange={(e) => onChange({ lastName: e.target.value })}
          placeholder="Doe"
        />
        <Input
          label="Professional Title"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Senior Software Engineer"
        />
        <Input
          label="Email"
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="john.doe@email.com"
        />
        <Input
          label="Phone"
          type="tel"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="+1 (555) 123-4567"
        />
        <Input
          label="Location"
          value={data.location}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="San Francisco, CA"
        />
        <Input
          label="LinkedIn"
          value={data.linkedin}
          onChange={(e) => onChange({ linkedin: e.target.value })}
          placeholder="linkedin.com/in/johndoe"
        />
        <Input
          label="GitHub"
          value={data.github}
          onChange={(e) => onChange({ github: e.target.value })}
          placeholder="github.com/johndoe"
        />
        <Input
          label="Portfolio / Website"
          value={data.website}
          onChange={(e) => onChange({ website: e.target.value })}
          placeholder="johndoe.dev"
        />
      </div>
    </Card>
  )
}

// Summary Section
interface SummaryEditorProps {
  summary: string
  onChange: (summary: string) => void
}

export function SummaryEditor({ summary, onChange }: SummaryEditorProps) {
  return (
    <Card variant="hover" padding="lg">
      <h3 className="text-lg font-semibold mb-4">Professional Summary</h3>
      <Textarea
        value={summary}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a compelling summary of your professional background, key achievements, and career goals..."
        rows={4}
      />
    </Card>
  )
}

// Generic Item Editor for array-based sections
interface ItemEditorProps<T> {
  items: T[]
  onItemsChange: (items: T[]) => void
  renderItem: (item: T, index: number, onUpdate: (id: string, updates: Partial<T>) => void, onDelete: (id: string) => void) => React.ReactNode
  addItem: () => T
  sectionTitle: string
  emptyMessage: string
}

export function ItemEditor<T extends { id: string }>({ 
  items, 
  onItemsChange, 
  renderItem, 
  addItem, 
  sectionTitle, 
  emptyMessage 
}: ItemEditorProps<T>) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const handleAdd = () => {
    const newItem = addItem()
    onItemsChange([...items, newItem])
    setExpandedIndex(items.length)
  }

  const handleUpdate = (id: string, updates: Partial<T>) => {
    onItemsChange(items.map(item => item.id === id ? { ...item, ...updates } : item))
  }

  const handleDelete = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id))
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newItems = [...items]
    const [removed] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, removed)
    onItemsChange(newItems)
  }

  return (
    <Card variant="hover" padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{sectionTitle}</h3>
        <Button variant="primary" size="sm" onClick={handleAdd} leftIcon={<PlusIcon className="w-4 h-4" />}>
          Add {sectionTitle.replace(/s$/, '')}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-[var(--muted-foreground)] border-2 border-dashed border-[var(--border)] rounded-xl">
          <p className="mb-2">{emptyMessage}</p>
          <Button variant="primary" size="sm" onClick={handleAdd} leftIcon={<PlusIcon className="w-4 h-4" />}>
            Add First {sectionTitle.replace(/s$/, '')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="group relative">
              <div className="flex items-center gap-2 p-3 bg-[var(--muted)] rounded-lg">
                <svg className="w-5 h-5 text-[var(--muted-foreground)] cursor-grab active:cursor-grabbing" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
</svg>
                <div className="flex-1">
                  {renderItem(item, index, handleUpdate, handleDelete)}
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1"
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    aria-label={expandedIndex === index ? 'Collapse' : 'Expand'}
                  >
                    {expandedIndex === index ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1 text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {expandedIndex === index && (
                <div className="ml-10 mt-2 space-y-3 border-l-2 border-[var(--border)] pl-4">
                  {renderItem(item, index, handleUpdate, handleDelete)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// Experience Item
interface ExperienceItemProps {
  item: Experience
  onUpdate: (id: string, updates: Partial<Experience>) => void
  onDelete: (id: string) => void
}

function ExperienceItem({ item, onUpdate, onDelete }: ExperienceItemProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="Position"
          value={item.position}
          onChange={(e) => onUpdate(item.id, { position: e.target.value })}
          placeholder="Senior Software Engineer"
        />
        <Input
          label="Company"
          value={item.company}
          onChange={(e) => onUpdate(item.id, { company: e.target.value })}
          placeholder="Tech Corp Inc."
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="Location"
          value={item.location}
          onChange={(e) => onUpdate(item.id, { location: e.target.value })}
          placeholder="San Francisco, CA (Remote)"
        />
        <div className="grid gap-2 md:grid-cols-3">
          <Input
            label="Start Date"
            type="month"
            value={item.startDate}
            onChange={(e) => onUpdate(item.id, { startDate: e.target.value })}
          />
          <Input
            label="End Date"
            type="month"
            value={item.endDate}
            onChange={(e) => onUpdate(item.id, { endDate: e.target.value })}
          />
          <div className="flex items-end">
            <Toggle
              checked={item.current}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(item.id, { current: e.target.checked })}
              label="Currently working here"
            />
          </div>
        </div>
      </div>
      <div>
        <label className="label">Description (one bullet per line)</label>
        <Textarea
          value={item.description.join('\n')}
          onChange={(e) => onUpdate(item.id, { description: e.target.value.split('\n').filter(Boolean) })}
          placeholder="• Led a team of 5 engineers...&#10;• Improved system performance by 40%..."
          rows={3}
        />
      </div>
      <div>
        <label className="label">Technologies (comma separated)</label>
        <Input
          value={item.technologies.join(', ')}
          onChange={(e) => onUpdate(item.id, { technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="React, TypeScript, Node.js, AWS, PostgreSQL"
        />
      </div>
    </div>
  )
}

// Education Item
interface EducationItemProps {
  item: Education
  onUpdate: (id: string, updates: Partial<Education>) => void
  onDelete: (id: string) => void
}

function EducationItem({ item, onUpdate, onDelete }: EducationItemProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="Degree"
          value={item.degree}
          onChange={(e) => onUpdate(item.id, { degree: e.target.value })}
          placeholder="Bachelor of Science"
        />
        <Input
          label="Field of Study"
          value={item.field}
          onChange={(e) => onUpdate(item.id, { field: e.target.value })}
          placeholder="Computer Science"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="Institution"
          value={item.institution}
          onChange={(e) => onUpdate(item.id, { institution: e.target.value })}
          placeholder="Stanford University"
        />
        <Input
          label="Location"
          value={item.location}
          onChange={(e) => onUpdate(item.id, { location: e.target.value })}
          placeholder="Stanford, CA"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Input
          label="Start Date"
          type="month"
          value={item.startDate}
          onChange={(e) => onUpdate(item.id, { startDate: e.target.value })}
        />
        <Input
          label="End Date"
          type="month"
          value={item.endDate}
          onChange={(e) => onUpdate(item.id, { endDate: e.target.value })}
        />
        <div className="flex items-end">
          <Toggle
            checked={item.current}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(item.id, { current: e.target.checked })}
            label="Currently studying"
          />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="GPA"
          value={item.gpa || ''}
          onChange={(e) => onUpdate(item.id, { gpa: e.target.value || undefined })}
          placeholder="3.8"
        />
        <Input
          label="Honors (comma separated)"
          value={item.honors?.join(', ') || ''}
          onChange={(e) => onUpdate(item.id, { honors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="Dean's List, Magna Cum Laude"
        />
      </div>
    </div>
  )
}

// Skill Item
const SKILL_CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'framework', label: 'Framework' },
  { value: 'database', label: 'Database' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'tool', label: 'Tool' },
  { value: 'language', label: 'Language' },
  { value: 'soft', label: 'Soft Skill' },
  { value: 'other', label: 'Other' },
]

const PROFICIENCY_LEVELS: { value: ProficiencyLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
]

interface SkillItemProps {
  item: Skill
  onUpdate: (id: string, updates: Partial<Skill>) => void
  onDelete: (id: string) => void
}

function SkillItem({ item, onUpdate, onDelete }: SkillItemProps) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Input
        label="Skill Name"
        value={item.name}
        onChange={(e) => onUpdate(item.id, { name: e.target.value })}
        placeholder="React"
      />
      <Select
        label="Category"
        value={item.category}
        onChange={(e) => onUpdate(item.id, { category: e.target.value as SkillCategory })}
        options={SKILL_CATEGORIES}
      />
      <Select
        label="Proficiency"
        value={item.proficiency}
        onChange={(e) => onUpdate(item.id, { proficiency: e.target.value as ProficiencyLevel })}
        options={PROFICIENCY_LEVELS}
      />
    </div>
  )
}

// Project Item
interface ProjectItemProps {
  item: Project
  onUpdate: (id: string, updates: Partial<Project>) => void
  onDelete: (id: string) => void
}

function ProjectItem({ item, onUpdate, onDelete }: ProjectItemProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="Project Name"
          value={item.name}
          onChange={(e) => onUpdate(item.id, { name: e.target.value })}
          placeholder="E-commerce Platform"
        />
        <Input
          label="URL"
          value={item.url || ''}
          onChange={(e) => onUpdate(item.id, { url: e.target.value || undefined })}
          placeholder="https://myproject.com"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="GitHub"
          value={item.github || ''}
          onChange={(e) => onUpdate(item.id, { github: e.target.value || undefined })}
          placeholder="https://github.com/user/project"
        />
      </div>
      <Textarea
        label="Description"
        value={item.description}
        onChange={(e) => onUpdate(item.id, { description: e.target.value })}
        placeholder="A full-stack e-commerce platform..."
        rows={2}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="Technologies (comma separated)"
          value={item.technologies.join(', ')}
          onChange={(e) => onUpdate(item.id, { technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="React, Node.js, PostgreSQL, Stripe"
        />
        <div className="grid gap-2 md:grid-cols-3">
          <Input
            label="Start Date"
            type="month"
            value={item.startDate}
            onChange={(e) => onUpdate(item.id, { startDate: e.target.value })}
          />
          <Input
            label="End Date"
            type="month"
            value={item.endDate || ''}
            onChange={(e) => onUpdate(item.id, { endDate: e.target.value || undefined })}
          />
        </div>
      </div>
      <div>
        <label className="label">Highlights (one per line)</label>
        <Textarea
          value={item.highlights.join('\n')}
          onChange={(e) => onUpdate(item.id, { highlights: e.target.value.split('\n').filter(Boolean) })}
          placeholder="• Processed 10K+ orders/month&#10;• Integrated Stripe payments&#10;• Achieved 99.9% uptime"
          rows={3}
        />
      </div>
    </div>
  )
}

// Certification Item
interface CertificationItemProps {
  item: Certification
  onUpdate: (id: string, updates: Partial<Certification>) => void
  onDelete: (id: string) => void
}

function CertificationItem({ item, onUpdate, onDelete }: CertificationItemProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Input
        label="Certification Name"
        value={item.name}
        onChange={(e) => onUpdate(item.id, { name: e.target.value })}
        placeholder="AWS Certified Solutions Architect"
      />
      <Input
        label="Issuer"
        value={item.issuer}
        onChange={(e) => onUpdate(item.id, { issuer: e.target.value })}
        placeholder="Amazon Web Services"
      />
      <Input
        label="Date Earned"
        type="month"
        value={item.date}
        onChange={(e) => onUpdate(item.id, { date: e.target.value })}
      />
      <Input
        label="Expiry Date"
        type="month"
        value={item.expiryDate || ''}
        onChange={(e) => onUpdate(item.id, { expiryDate: e.target.value || undefined })}
      />
      <Input
        label="Credential ID"
        value={item.credentialId || ''}
        onChange={(e) => onUpdate(item.id, { credentialId: e.target.value || undefined })}
        placeholder="ABC123XYZ"
      />
      <Input
        label="Verification URL"
        value={item.url || ''}
        onChange={(e) => onUpdate(item.id, { url: e.target.value || undefined })}
        placeholder="https://verify.aws.amazon.com/ABC123XYZ"
      />
    </div>
  )
}

// Language Item
interface LanguageItemProps {
  item: Language
  onUpdate: (id: string, updates: Partial<Language>) => void
  onDelete: (id: string) => void
}

function LanguageItem({ item, onUpdate, onDelete }: LanguageItemProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Input
        label="Language"
        value={item.name}
        onChange={(e) => onUpdate(item.id, { name: e.target.value })}
        placeholder="Spanish"
      />
      <Select
        label="Proficiency"
        value={item.proficiency}
        onChange={(e) => onUpdate(item.id, { proficiency: e.target.value as Language['proficiency'] })}
        options={[
          { value: 'native', label: 'Native' },
          { value: 'fluent', label: 'Fluent' },
          { value: 'conversational', label: 'Conversational' },
          { value: 'basic', label: 'Basic' },
        ]}
      />
    </div>
  )
}

// Custom Section Item
interface CustomSectionItemEditorProps {
  item: CustomSectionItem
  onUpdate: (id: string, updates: Partial<CustomSectionItem>) => void
  onDelete: (id: string) => void
}

function CustomSectionItemEditor({ item, onUpdate, onDelete }: CustomSectionItemEditorProps) {
  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={item.title}
        onChange={(e) => onUpdate(item.id, { title: e.target.value })}
        placeholder="Conference Speaker"
      />
      <Input
        label="Subtitle"
        value={item.subtitle || ''}
        onChange={(e) => onUpdate(item.id, { subtitle: e.target.value || undefined })}
        placeholder="React Conf 2024"
      />
      <Input
        label="Date"
        type="month"
        value={item.date || ''}
        onChange={(e) => onUpdate(item.id, { date: e.target.value || undefined })}
      />
      <Textarea
        label="Description"
        value={item.description}
        onChange={(e) => onUpdate(item.id, { description: e.target.value })}
        placeholder="Presented on 'Building Scalable React Applications'..."
        rows={2}
      />
    </div>
  )
}

// Custom Section Editor (nested sections with items)
interface CustomSectionEditorProps {
  sections: CustomSection[]
  onSectionsChange: (sections: CustomSection[]) => void
}

export function CustomSectionEditor({ sections, onSectionsChange }: CustomSectionEditorProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const addSection = () => {
    const newSection: CustomSection = {
      id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Section',
      items: [],
    }
    onSectionsChange([...sections, newSection])
    setExpandedSection(newSection.id)
  }

  const addItemToSection = (sectionId: string) => {
    onSectionsChange(sections.map(s => 
      s.id === sectionId 
        ? { 
            ...s, 
            items: [...s.items, { 
              id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: '',
              description: '',
            }] 
          } 
        : s
    ))
  }

  const updateSection = (sectionId: string, updates: Partial<CustomSection>) => {
    onSectionsChange(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s))
  }

  const deleteSection = (sectionId: string) => {
    onSectionsChange(sections.filter(s => s.id !== sectionId))
  }

  const updateItem = (sectionId: string, itemId: string, updates: Partial<CustomSectionItem>) => {
    onSectionsChange(sections.map(s => 
      s.id === sectionId 
        ? { ...s, items: s.items.map(i => i.id === itemId ? { ...i, ...updates } : i) }
        : s
    ))
  }

  const deleteItem = (sectionId: string, itemId: string) => {
    onSectionsChange(sections.map(s => 
      s.id === sectionId 
        ? { ...s, items: s.items.filter(i => i.id !== itemId) }
        : s
    ))
  }

  return (
    <Card variant="hover" padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Sections</h3>
        <Button variant="primary" size="sm" onClick={addSection} leftIcon={<PlusIcon className="w-4 h-4" />}>
          Add Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-8 text-[var(--muted-foreground)] border-2 border-dashed border-[var(--border)] rounded-xl">
          <p className="mb-2">Create custom sections for awards, publications, volunteer work, etc.</p>
          <Button variant="primary" size="sm" onClick={addSection} leftIcon={<PlusIcon className="w-4 h-4" />}>
            Add First Section
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <div className="p-4 bg-[var(--muted)] flex items-center justify-between">
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  placeholder="Section Title"
                  className="w-64"
                />
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    aria-label={expandedSection === section.id ? 'Collapse' : 'Expand'}
                  >
                    {expandedSection === section.id ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-400 hover:bg-red-500/10"
                    onClick={() => deleteSection(section.id)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {expandedSection === section.id && (
                <div className="p-4 space-y-4">
                  {section.items.length === 0 ? (
                    <div className="text-center py-4 text-[var(--muted-foreground)]">
                      <p className="mb-2">No items in this section yet.</p>
                      <Button variant="secondary" size="sm" onClick={() => addItemToSection(section.id)} leftIcon={<PlusIcon className="w-4 h-4" />}>
                        Add Item
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {section.items.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4" style={{ borderColor: 'var(--border)' }}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">Section Item</h4>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-400 hover:bg-red-500/10"
                              onClick={() => deleteItem(section.id, item.id)}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                          <CustomSectionItemEditor 
                            item={item} 
                            onUpdate={(id, updates) => updateItem(section.id, id, updates)}
                            onDelete={() => deleteItem(section.id, item.id)}
                          />
                        </div>
                      ))}
                      <Button variant="secondary" size="sm" onClick={() => addItemToSection(section.id)} leftIcon={<PlusIcon className="w-4 h-4" />}>
                        Add Another Item
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// Main Resume Editor Component
interface ResumeEditorProps {
  data: ResumeData
  onChange: (data: Partial<ResumeData>) => void
  templateId: string
}

export function ResumeEditor({ data, onChange, templateId }: ResumeEditorProps) {
  const handlePersonalChange = useCallback((info: Partial<PersonalInfo>) => {
    onChange({ personal: { ...data.personal, ...info } })
  }, [data.personal, onChange])

  const handleSummaryChange = useCallback((summary: string) => {
    onChange({ summary })
  }, [onChange])

  const handleExperienceChange = useCallback((experience: Experience[]) => {
    onChange({ experience })
  }, [onChange])

  const handleEducationChange = useCallback((education: Education[]) => {
    onChange({ education })
  }, [onChange])

  const handleSkillsChange = useCallback((skills: Skill[]) => {
    onChange({ skills })
  }, [onChange])

  const handleProjectsChange = useCallback((projects: Project[]) => {
    onChange({ projects })
  }, [onChange])

  const handleCertificationsChange = useCallback((certifications: Certification[]) => {
    onChange({ certifications })
  }, [onChange])

  const handleLanguagesChange = useCallback((languages: Language[]) => {
    onChange({ languages })
  }, [onChange])

  const handleCustomSectionsChange = useCallback((custom_sections: CustomSection[]) => {
    onChange({ custom_sections })
  }, [onChange])

  return (
    <div className="space-y-6">
      <PersonalInfoEditor data={data.personal} onChange={handlePersonalChange} />
      
      <Divider />
      
      <SummaryEditor summary={data.summary} onChange={handleSummaryChange} />
      
      <Divider />
      
      <ItemEditor
        items={data.experience}
        onItemsChange={handleExperienceChange}
        renderItem={(item, index, onUpdate, onDelete) => (
          <ExperienceItem item={item} onUpdate={onUpdate} onDelete={onDelete} />
        )}
        addItem={() => ({ 
          id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          company: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: [],
          technologies: [],
        })}
        sectionTitle="Experience"
        emptyMessage="No work experience added yet. Add your first position to get started."
      />
      
      <Divider />
      
      <ItemEditor
        items={data.education}
        onItemsChange={handleEducationChange}
        renderItem={(item, index, onUpdate, onDelete) => (
          <EducationItem item={item} onUpdate={onUpdate} onDelete={onDelete} />
        )}
        addItem={() => ({ 
          id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          institution: '',
          degree: '',
          field: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
        })}
        sectionTitle="Education"
        emptyMessage="No education added yet. Add your degrees and certifications."
      />
      
      <Divider />
      
      <ItemEditor
        items={data.skills}
        onItemsChange={handleSkillsChange}
        renderItem={(item, index, onUpdate, onDelete) => (
          <SkillItem item={item} onUpdate={onUpdate} onDelete={onDelete} />
        )}
        addItem={() => ({ 
          id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: '',
          category: 'technical' as SkillCategory,
          proficiency: 'intermediate' as ProficiencyLevel,
        })}
        sectionTitle="Skills"
        emptyMessage="No skills added yet. Add your technical and soft skills."
      />
      
      <Divider />
      
      <ItemEditor
        items={data.projects}
        onItemsChange={handleProjectsChange}
        renderItem={(item, index, onUpdate, onDelete) => (
          <ProjectItem item={item} onUpdate={onUpdate} onDelete={onDelete} />
        )}
        addItem={() => ({ 
          id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: '',
          description: '',
          technologies: [],
          highlights: [],
          startDate: '',
          endDate: '',
        })}
        sectionTitle="Projects"
        emptyMessage="No projects added yet. Showcase your personal and professional projects."
      />
      
      <Divider />
      
      <ItemEditor
        items={data.certifications}
        onItemsChange={handleCertificationsChange}
        renderItem={(item, index, onUpdate, onDelete) => (
          <CertificationItem item={item} onUpdate={onUpdate} onDelete={onDelete} />
        )}
        addItem={() => ({ 
          id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: '',
          issuer: '',
          date: '',
        })}
        sectionTitle="Certifications"
        emptyMessage="No certifications added yet. Add your professional certifications."
      />
      
      <Divider />
      
      <ItemEditor
        items={data.languages}
        onItemsChange={handleLanguagesChange}
        renderItem={(item, index, onUpdate, onDelete) => (
          <LanguageItem item={item} onUpdate={onUpdate} onDelete={onDelete} />
        )}
        addItem={() => ({ 
          id: `lang_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: '',
          proficiency: 'conversational' as const,
        })}
        sectionTitle="Languages"
        emptyMessage="No languages added yet."
      />
      
      <Divider />
      
      <CustomSectionEditor 
        sections={data.custom_sections}
        onSectionsChange={handleCustomSectionsChange}
      />
    </div>
  )
}