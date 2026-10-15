import React from 'react'
import { clsx } from 'clsx'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BriefcaseIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
  FolderIcon,
  StarIcon,
  MagnifyingGlassIcon as SearchIcon,
} from '@heroicons/react/24/solid'
import { calculateATSScore, extractKeywords } from '@/utils/atsScorer'

// Color utilities
const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}

const getScoreColorClass = (score: number) => {
  if (score >= 80) return 'stroke-green-500'
  if (score >= 60) return 'stroke-yellow-500'
  if (score >= 40) return 'stroke-orange-500'
  return 'stroke-red-500'
}

const getScoreBgClass = (score: number) => {
  if (score >= 80) return 'bg-green-500/10'
  if (score >= 60) return 'bg-yellow-500/10'
  if (score >= 40) return 'bg-orange-500/10'
  return 'bg-red-500/10'
}

// Circular Progress Indicator
interface CircularProgressProps {
  score: number | null
  label: string
  subtitle?: string
  size?: number
  strokeWidth?: number
  showPercentage?: boolean
  tooltip?: string
  notAvailable?: boolean
}

export function CircularProgress({
  score,
  label,
  subtitle,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  tooltip,
  notAvailable = false,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = notAvailable ? 0 : (score ?? 0)
  const offset = circumference - (progress / 100) * circumference

  const scoreColor = notAvailable ? 'text-[var(--muted-foreground)]' : getScoreColor(score ?? 0)
  const strokeColorClass = notAvailable ? 'stroke-[var(--border)]' : getScoreColorClass(score ?? 0)

  return (
    <div className="flex flex-col items-center" role="img" aria-label={`${label}: ${notAvailable ? 'Not available' : `${progress}%`}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${strokeColorClass}`}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {showPercentage && !notAvailable ? (
              <span className={`text-2xl font-bold ${getScoreColor(score ?? 0)}`}>
                {score}%
              </span>
            ) : notAvailable ? (
              <span className="text-sm text-[var(--muted-foreground)]">N/A</span>
            ) : (
              <span className="text-2xl font-bold text-[var(--muted-foreground)]">-</span>
            )}
            {subtitle && <div className="text-xs text-[var(--muted-foreground)] mt-1">{subtitle}</div>}
          </div>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
        {tooltip && <p className="text-xs text-[var(--muted-foreground)] mt-1">{tooltip}</p>}
      </div>
    </div>
  )
}

// Bar Chart for Category Comparison
interface BarChartProps {
  data: { name: string; score: number; maxScore: number }[]
  height?: number
  showValues?: boolean
}

export function CategoryBarChart({ data, height = 200, showValues = true }: BarChartProps) {
  const maxScore = Math.max(...data.map(d => d.maxScore), 100)
  const chartHeight = height - 60
  const barWidth = 40
  const gap = 20
  const totalWidth = data.length * (barWidth + gap) - gap

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="w-full" style={{ height: height }}>
      <div className="flex items-end justify-center gap-[20px] h-[calc(100%-40px)] px-4" style={{ width: totalWidth }}>
        {data.map((item, index) => {
          const percentage = Math.round((item.score / item.maxScore) * 100)
          const barHeight = Math.max((percentage / 100) * chartHeight, 2)
          
          return (
            <div key={item.name} className="flex flex-col items-center" style={{ width: barWidth }}>
              {showValues && (
                <div className="mb-1 text-xs font-medium text-[var(--foreground)]">
                  {Math.round((item.score / item.maxScore) * 100)}%
                </div>
              )}
              <div className="relative w-full" style={{ height: chartHeight }}>
                <div 
                  className="absolute bottom-0 w-full rounded-t transition-all duration-1000 ease-out"
                  style={{ 
                    height: `${barHeight}px`,
                    backgroundColor: getBarColor(percentage)
                  }}
                />
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-[var(--foreground)] truncate w-[60px]">{item.name}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">
                  {item.score}/{item.maxScore}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-center gap-4 flex-wrap mt-2" aria-hidden="true">
        <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <span className="w-3 h-3 rounded bg-green-500"></span>
          <span>≥80%</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <span className="w-3 h-3 rounded bg-yellow-500"></span>
          <span>60-79%</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <span className="w-3 h-3 rounded bg-orange-500"></span>
          <span>40-59%</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <span className="w-3 h-3 rounded bg-red-500"></span>
          <span>{"<40%"}</span>
        </div>
      </div>
    </div>
  )
}

// Keyword Distribution Donut Chart
interface KeywordDonutProps {
  matched: number
  missing: number
  suggested: number
  size?: number
}

export function KeywordDonutChart({ matched, missing, suggested, size = 200 }: KeywordDonutProps) {
  const total = matched + missing + suggested
  
  if (total === 0) {
    return (
      <div className="flex flex-col items-center" style={{ width: size, height: size }}>
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 8}
              fill="none"
              stroke="var(--border)"
              strokeWidth={16}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-[var(--muted-foreground)]">No data</span>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-4 flex-wrap">
          <LegendItem color="bg-green-500" label="Matched" value={0} />
          <LegendItem color="bg-red-500" label="Missing" value={0} />
          <LegendItem color="bg-yellow-500" label="Suggested" value={0} />
        </div>
      </div>
    )
  }

  const matchedPct = matched / total
  const missingPct = missing / total
  const suggestedPct = suggested / total

  const radius = size / 2 - 8
  const circumference = 2 * Math.PI * radius

  const matchedOffset = circumference - matchedPct * circumference
  const missingOffset = circumference - (matchedPct + missingPct) * circumference

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90" aria-hidden="true">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={16}
          />
          {/* Matched - Green */}
          {matched > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="green"
              strokeWidth={16}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - matchedPct * circumference}
              className="transition-all duration-1000 ease-out"
            />
          )}
          {/* Missing - Red */}
          {missing > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="red"
              strokeWidth={16}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - missingPct * circumference - matchedPct * circumference}
              className="transition-all duration-1000 ease-out"
            />
          )}
          {/* Suggested - Yellow */}
          {suggested > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="yellow"
              strokeWidth={16}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - suggestedPct * circumference - missingPct * circumference - matchedPct * circumference}
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[var(--foreground)]">{total}</span>
          <span className="text-xs text-[var(--muted-foreground)]">Keywords</span>
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-4 flex-wrap">
        <LegendItem color="bg-green-500" label="Matched" value={matched} />
        <LegendItem color="bg-red-500" label="Missing" value={missing} />
        <LegendItem color="bg-yellow-500" label="Suggested" value={suggested} />
      </div>
    </div>
  )
}

interface LegendItemProps {
  color: string
  label: string
  value: number
}

function LegendItem({ color, label, value }: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-sm text-[var(--foreground)]">{label}: {value}</span>
    </div>
  )
}

// Skills Match Circular Progress
interface SkillsMatchProps {
  resumeSkills: string[]
  jobDescriptionSkills: string[]
  size?: number
}

export function SkillsMatchChart({ 
  resumeSkills, 
  jobDescriptionSkills, 
  size = 120 
}: SkillsMatchProps) {
  const resumeSkillsLower = new Set(resumeSkills.map(s => s.toLowerCase()))
  const jdSkillsLower = jobDescriptionSkills.map(s => s.toLowerCase())
  
  const matched = jdSkillsLower.filter(s => resumeSkillsLower.has(s))
  const missing = jdSkillsLower.filter(s => !resumeSkillsLower.has(s))
  
  const matchPercentage = jdSkillsLower.length > 0 
    ? Math.round((matched.length / jdSkillsLower.length) * 100)
    : 0

  return (
    <div className="flex flex-col items-center">
      <CircularProgress
        score={matchPercentage}
        label="Skills Match"
        subtitle={`${matched.length}/${jdSkillsLower.length} skills`}
        size={size}
        tooltip={`${matched.length} of ${jdSkillsLower.length} job description skills found in resume`}
      />
      <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-[200px] text-center">
        {matched.length > 0 && (
          <div className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
            Matched: {matched.length}
          </div>
        )}
        {missing.length > 0 && (
          <div className="px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium">
            Missing: {missing.length}
          </div>
        )}
      </div>
    </div>
  )
}

// Resume Completeness Indicator
interface ResumeCompletenessProps {
  sections: { name: string; score: number }[]
  size?: number
}

export function ResumeCompletenessChart({ sections, size = 120 }: ResumeCompletenessProps) {
  const completedSections = sections.filter(s => s.score >= 60).length
  const totalSections = sections.length
  const completeness = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0

  return (
    <div className="flex flex-col items-center">
      <CircularProgress
        score={completeness}
        label="Completeness"
        subtitle={`${completedSections}/${totalSections} sections`}
        size={size}
        tooltip={`${completedSections} of ${totalSections} sections have good scores (≥60%)`}
      />
      <div className="mt-2 text-xs text-[var(--muted-foreground)] text-center max-w-[200px]">
        {completedSections} of {totalSections} core sections well-populated
      </div>
    </div>
  )
}

// Formatting & Readability Score
interface FormattingReadabilityProps {
  formattingScore: number
  readabilityScore: number
  gradeLevel: string
  wordCount: number
  size?: number
}

export function FormattingReadabilityChart({ 
  formattingScore, 
  readabilityScore, 
  gradeLevel, 
  wordCount,
  size = 120 
}: FormattingReadabilityProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <CircularProgress
        score={formattingScore}
        label="Formatting"
        subtitle="ATS friendly"
        size={size}
        tooltip="Formatting and structure quality for ATS parsing"
      />
      <CircularProgress
        score={readabilityScore}
        label="Readability"
        subtitle={gradeLevel !== 'N/A' ? gradeLevel : 'Level'}
        size={size}
        tooltip={`Reading level: ${gradeLevel}, Word count: ${wordCount}`}
      />
      <div className="col-span-2 grid grid-cols-2 gap-4 mt-2">
        <div className="p-3 rounded-xl bg-[var(--muted)] text-center">
          <div className="text-2xl font-bold text-[var(--foreground)]">{wordCount.toLocaleString()}</div>
          <div className="text-xs text-[var(--muted-foreground)]">Words</div>
        </div>
        <div className="p-3 rounded-xl bg-[var(--muted)] text-center">
          <div className="text-2xl font-bold text-[var(--foreground)]">{gradeLevel}</div>
          <div className="text-xs text-[var(--muted-foreground)]">Reading Level</div>
        </div>
      </div>
    </div>
  )
}

// Section Scores Radar/Bar Chart
interface SectionScoresChartProps {
  sections: { name: string; score: number; feedback: string[] }[]
}

export function SectionScoresChart({ sections }: SectionScoresChartProps) {
  return (
    <div className="space-y-3">
      {sections.map(section => (
        <div key={section.name} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{section.name}</span>
            <span className={`text-sm font-bold ${getScoreColor(section.score)}`}>
              {section.score}%
            </span>
          </div>
          <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${section.score}%`,
                backgroundColor: getScoreColor(section.score).replace('text-', 'bg-')
              }}
            />
          </div>
          {section.feedback[0] && (
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{section.feedback[0]}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// Job Description Match Chart
interface JobMatchChartProps {
  matchPercentage: number
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestedKeywords: string[]
}

export function JobMatchChart({ 
  matchPercentage, 
  matchedKeywords, 
  missingKeywords, 
  suggestedKeywords 
}: JobMatchChartProps) {
  return (
    <div className="space-y-6">
      {/* Overall Match Score */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <CircularProgress
            score={matchPercentage}
            label="Job Match"
            subtitle="Keyword overlap"
            size={100}
            tooltip={`${matchPercentage}% of job description keywords found in resume`}
          />
          <div className="text-center lg:text-left">
            <p className="text-sm text-[var(--muted-foreground)]">Keyword Match Score</p>
            <p className={`text-2xl font-bold ${getScoreColor(matchPercentage)}`}>
              {matchPercentage >= 70 ? 'Excellent' : matchPercentage >= 50 ? 'Good' : matchPercentage >= 30 ? 'Needs Work' : 'Poor'}
            </p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center lg:grid-cols-3">
          <div className="p-3 rounded-xl bg-green-500/10">
            <div className="text-2xl font-bold text-green-500">{matchedKeywords.length}</div>
            <div className="text-xs text-green-500">Matched</div>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10">
            <div className="text-2xl font-bold text-red-500">{missingKeywords.length}</div>
            <div className="text-xs text-red-500">Missing</div>
          </div>
          <div className="p-3 rounded-xl bg-yellow-500/10">
            <div className="text-2xl font-bold text-yellow-500">{suggestedKeywords.length}</div>
            <div className="text-xs text-yellow-500">Suggested</div>
          </div>
        </div>
      </div>

      {/* Keyword Distribution Donut */}
      <KeywordDonutChart 
        matched={matchedKeywords.length} 
        missing={missingKeywords.length} 
        suggested={suggestedKeywords.length}
        size={180}
      />

      {/* Keyword Lists */}
      <div className="grid gap-4 lg:grid-cols-3">
        <KeywordList 
          title="Matched Keywords" 
          keywords={matchedKeywords} 
          variant="success" 
          icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />} 
        />
        <KeywordList 
          title="Missing Keywords" 
          keywords={missingKeywords} 
          variant="danger" 
          icon={<XCircleIcon className="w-5 h-5 text-red-500" />} 
        />
        <KeywordList 
          title="Suggested Keywords" 
          keywords={suggestedKeywords} 
          variant="warning" 
          icon={<LightBulbIcon className="w-5 h-5 text-yellow-500" />} 
        />
      </div>
    </div>
  )
}

interface KeywordListProps {
  title: string
  keywords: string[]
  variant: 'success' | 'danger' | 'warning' | 'info'
  icon: React.ReactNode
}

function KeywordList({ title, keywords, variant, icon }: KeywordListProps) {
  const variantStyles = {
    success: 'bg-green-500/10 text-green-500 border-green-500/20',
    danger: 'bg-red-500/10 text-red-500 border-red-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  }

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="text-sm font-medium">{title} ({keywords.length})</h4>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {keywords.length > 0 ? (
          keywords.slice(0, 20).map(kw => (
            <span 
              key={kw} 
              className={`px-2 py-1 rounded-full text-xs border font-medium ${variantStyles[variant]}`}
            >
              {kw}
            </span>
          ))
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            {variant === 'danger' ? 'No missing keywords - great job!' : 'No keywords found'}
          </p>
        )}
      </div>
    </div>
  )
}

// Analysis Summary Component
interface AnalysisSummaryProps {
  result: ReturnType<typeof calculateATSScore> | null
  uploadedFileReport: { report: any; fileName: string } | null
  jobDescription: string
}

export function AnalysisSummary({ 
  result, 
  uploadedFileReport, 
  jobDescription 
}: AnalysisSummaryProps) {
  const report = result || uploadedFileReport?.report
  
  if (!report) return null

  const strengths = report.strengths || []
  const issues = report.issues || []
  const suggestions = report.suggestions || []
  const missingKeywords = report.keywords?.missing || []
  const matchedKeywords = report.keywords?.found || []

  return (
    <div className="space-y-6">
      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {strengths.map((item: string, index: number) => (
              <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-[var(--foreground)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Issues */}
      {issues.length > 0 && (
        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold">Issues to Address</h3>
          </div>
          <ul className="space-y-2">
            {issues.map((item: string, index: number) => (
              <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <span className="text-[var(--foreground)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Keywords from Job Description */}
      {jobDescription && missingKeywords.length > 0 && (
        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <MagnifyingGlassIcon className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold">Missing Keywords from Job Description</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.slice(0, 15).map((kw: string) => (
              <span key={kw} className="px-2 py-1 rounded-full text-xs border bg-red-500/10 text-red-700 dark:text-red-300" style={{ borderColor: 'var(--border)' }}>
                {kw}
              </span>
            ))}
            {missingKeywords.length > 15 && (
              <span className="px-2 py-1 rounded-full text-xs text-[var(--muted-foreground)]">
                +{missingKeywords.length - 15} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cosmic-500/20 flex items-center justify-center">
              <LightBulbIcon className="w-5 h-5 text-cosmic-500" />
            </div>
            <h3 className="text-xl font-semibold">Improvement Suggestions</h3>
          </div>
          <div className="space-y-3">
            {suggestions.map((suggestion: string, index: number) => (
              <div key={`${suggestion}-${index}`} className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cosmic-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-cosmic-500">{index + 1}</span>
                  </div>
                  <p className="text-[var(--foreground)]">{suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Description Match Summary */}
      {jobDescription && (
        <div className="rounded-xl border p-5 bg-blue-500/10" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <MagnifyingGlassIcon className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold">Job Description Match Summary</h3>
          </div>
          <p className="text-sm text-[var(--foreground)]">
            {report.keywords?.found?.length || 0} of {report.keywords?.found?.length + report.keywords?.missing?.length || 0} job keywords matched.
            {report.keywords?.suggested?.length && ` Consider adding: ${report.keywords.suggested.slice(0, 5).join(', ')}.`}
          </p>
        </div>
      )}
    </div>
  )
}