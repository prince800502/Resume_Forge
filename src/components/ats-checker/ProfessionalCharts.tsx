import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts'
import { clsx } from 'clsx'
import { 
  CheckCircleIcon,
  XCircleIcon,
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

// Color palette for professional charts
const CHART_COLORS = {
  primary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  muted: '#64748b',
  grid: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  background: '#0f172a',
  cardBackground: '#1e293b',
  border: '#334155',
}

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

const getBarColor = (percentage: number) => {
  if (percentage >= 80) return CHART_COLORS.success
  if (percentage >= 60) return CHART_COLORS.warning
  if (percentage >= 40) return '#f97316'
  return CHART_COLORS.danger
}

// Circular Progress Indicator / Radial Gauge
interface RadialGaugeProps {
  score: number | null
  label: string
  subtitle?: string
  size?: number
  strokeWidth?: number
  showPercentage?: boolean
  tooltip?: string
  notAvailable?: boolean
}

export function RadialGauge({
  score,
  label,
  subtitle,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  tooltip,
  notAvailable = false,
}: RadialGaugeProps) {
  const progress = notAvailable ? 0 : (score ?? 0)
  const color = progress >= 80 ? CHART_COLORS.success : progress >= 60 ? CHART_COLORS.warning : progress >= 40 ? CHART_COLORS.danger : CHART_COLORS.danger

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  const scoreColor = notAvailable ? 'text-[var(--muted-foreground)]' : getScoreColor(score ?? 0)
  const strokeColorClass = notAvailable ? 'stroke-[var(--border)]' : getScoreColorClass(score ?? 0)

  return (
    <div className="flex flex-col items-center" role="img" aria-label={`${label}: ${notAvailable ? 'Not available' : `${progress}%`}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90" aria-hidden="true">
          <defs>
            <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={color} stopOpacity="0.6" />
            </linearGradient>
          </defs>
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
            stroke="url(#gauge-gradient)"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {showPercentage && !notAvailable ? (
              <span className={`text-2xl font-bold ${getScoreColor(score ?? 0)}`}>
                {progress}%
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
interface SectionBarChartProps {
  data: { name: string; score: number; maxScore: number }[]
  height?: number
  showValues?: boolean
}

export function SectionBarChart({ data, height = 280 }: SectionBarChartProps) {
  return (
    <div className="w-full" style={{ height: height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            type="number"
            domain={[0, 'dataMax']}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--foreground)', fontSize: 12, fontWeight: 500 }}
            tickFormatter={(name) => name.length > 18 ? name.substring(0, 18) + '…' : name}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => value !== undefined ? [`${Math.round(Number(value))}%`, 'Score'] : ['', 'Score']}
          />
          <Bar
            dataKey="score"
            name="Score"
            radius={[0, 4, 4, 0]}
            maxBarSize={40}
          >
            {data.map((item) => {
              const percentage = Math.round((item.score / item.maxScore) * 100)
              return <Cell key={item.name} fill={getBarColor(percentage)} />
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 flex-wrap mt-2" aria-hidden="true">
        <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: CHART_COLORS.success }} />
          <span>≥80%</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: CHART_COLORS.warning }} />
          <span>60-79%</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }} />
          <span>40-59%</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: CHART_COLORS.danger }} />
          <span>{'<40%'}</span>
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

export function KeywordDonut({ matched, missing, suggested, size = 200 }: KeywordDonutProps) {
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
              stroke={CHART_COLORS.success}
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
              stroke={CHART_COLORS.danger}
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
              stroke={CHART_COLORS.warning}
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

export function SkillsMatch({ 
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
      <RadialGauge
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
interface CompletenessChartProps {
  sections: { name: string; score: number }[]
  size?: number
}

export function CompletenessChart({ sections, size = 120 }: CompletenessChartProps) {
  const completedSections = sections.filter(s => s.score >= 60).length
  const totalSections = sections.length
  const completeness = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0

  return (
    <div className="flex flex-col items-center">
      <RadialGauge
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

export function FormattingReadability({ 
  formattingScore, 
  readabilityScore, 
  gradeLevel, 
  wordCount,
  size = 120 
}: FormattingReadabilityProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <RadialGauge
        score={formattingScore}
        label="Formatting"
        subtitle="ATS friendly"
        size={size}
        tooltip="Formatting and structure quality for ATS parsing"
      />
      <RadialGauge
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
interface SectionScoresProps {
  sections: { name: string; score: number; feedback: string[] }[]
}

export function SectionScores({ sections }: SectionScoresProps) {
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
                backgroundColor: getBarColor(section.score)
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
interface JobMatchProps {
  matchPercentage: number
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestedKeywords: string[]
}

export function JobMatch({ 
  matchPercentage, 
  matchedKeywords, 
  missingKeywords, 
  suggestedKeywords 
}: JobMatchProps) {
  return (
    <div className="space-y-6">
      {/* Overall Match Score */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <RadialGauge
            score={matchPercentage}
            label="Job Match"
            subtitle="Keyword overlap"
            size={100}
            tooltip={`${matchPercentage}% of job description keywords found in resume`}
          />
          <div className="text-center lg:text-left">
            <p className="text-sm text-[var(--muted-foreground)]">Keyword Match Score</p>
            <p className={`text-2xl font-bold ${matchPercentage >= 70 ? 'text-green-500' : matchPercentage >= 50 ? 'text-yellow-500' : matchPercentage >= 30 ? 'text-orange-500' : 'text-red-500'}`}>
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
      <KeywordDonut
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

const variantStyles = {
  success: 'bg-green-500/10 text-green-500 border-green-500/20',
  danger: 'bg-red-500/10 text-red-500 border-red-500/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
}