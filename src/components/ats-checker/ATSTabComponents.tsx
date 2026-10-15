import React from 'react'
import { clsx } from 'clsx'
import { 
  CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon,
  MagnifyingGlassIcon, LightBulbIcon,
  DocumentTextIcon, ChartBarIcon,
} from '@heroicons/react/24/solid'
import { 
  CheckCircleIcon as CheckCircleOutline,
  XCircleIcon as XCircleOutline,
  ExclamationTriangleIcon as ExclamationTriangleOutline,
} from '@heroicons/react/24/outline'
import { Card, Badge, Progress } from '@/components/ui'
import { StaggerContainer, PageTransition } from '@/components/animations/BlackHoleAnimation'
import { 
  CircularProgress,
  CategoryBarChart,
  KeywordDonutChart,
  SkillsMatchChart,
  ResumeCompletenessChart,
  FormattingReadabilityChart,
  SectionScoresChart,
  JobMatchChart,
  AnalysisSummary,
} from './ATSCharts'

import { extractKeywords } from '@/utils/atsScorer'

type ATSCheckResult = ReturnType<typeof import('@/utils/atsScorer').calculateATSScore>

interface OverviewTabProps {
  result: ATSCheckResult
  jobDescription: string
}

export function OverviewTab({ result, jobDescription }: OverviewTabProps) {
  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Circular Progress Indicators Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <CircularProgress
            score={result.score}
            label="Overall Score"
            subtitle="ATS Score"
            size={100}
            tooltip={`${result.score}% overall ATS compatibility`}
          />
          {jobDescription && (
            <JobMatchChart
              matchPercentage={result.keywords?.found?.length && result.keywords?.missing?.length 
                ? Math.round((result.keywords.found.length / (result.keywords.found.length + result.keywords.missing.length)) * 100)
                : 0}
              matchedKeywords={result.keywords?.found || []}
              missingKeywords={result.keywords?.missing || []}
              suggestedKeywords={result.keywords?.suggested || []}
            />
          )}
          <SkillsMatchChart
            resumeSkills={result.sections.find(s => s.name === 'Skills') ? [] : []}
            jobDescriptionSkills={jobDescription ? extractKeywords(jobDescription) : []}
            size={100}
          />
          <ResumeCompletenessChart
            sections={result.sections || []}
            size={100}
          />
          <FormattingReadabilityChart
            formattingScore={result.formatting?.score || 0}
            readabilityScore={result.readability?.score || 0}
            gradeLevel={result.readability?.gradeLevel || 'N/A'}
            wordCount={result.readability?.wordCount || 0}
            size={100}
          />
        </div>

        {/* Section Scores Bar Chart */}
        <SectionScoresChart sections={result.sections || []} />

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <StatItem label="Word Count" value={result.readability.wordCount} />
          <StatItem label="Reading Level" value={result.readability.gradeLevel} />
          <StatItem label="Sections Complete" value={`${result.sections.filter((s: { score: number }) => s.score >= 60).length}/${result.sections.length}`} />
          <StatItem label="Matched Keywords" value={`${result.keywords.found.length}/${result.keywords.found.length + result.keywords.missing.length}`} />
          <StatItem label="Missing Keywords" value={result.keywords.missing.length} />
          <StatItem label="Suggestions" value={result.suggestions.length} />
        </div>

        {/* Strengths & Missing */}
        <StaggerContainer stagger={0.1} direction="up">
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <Card variant="glass" padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircleOutline className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {result.sections.filter((s: { score: number }) => s.score >= 80).length > 0 ? (
                  result.sections.filter((s: { score: number }) => s.score >= 80).map((s: { name: string; feedback: string[] }) => (
                    <li key={s.name} className="flex items-center gap-2 text-sm">
                      <CheckCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{s.name}: {s.feedback[0]}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[var(--muted-foreground)]">Run analysis to see strengths</li>
                )}
              </ul>
            </Card>

            <Card variant="glass" padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <XCircleOutline className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold">Missing / Weak Areas</h3>
              </div>
              <ul className="space-y-2">
                {result.sections.filter((s: { score: number }) => s.score < 60).length > 0 ? (
                  result.sections.filter((s: { score: number }) => s.score < 60).map((s: { name: string; feedback: string[] }) => (
                    <li key={s.name} className="flex items-center gap-2 text-sm">
                      <XCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span>{s.name}: {s.feedback[0] || 'Needs improvement'}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[var(--muted-foreground)]">No critical gaps found!</li>
                )}
              </ul>
            </Card>
          </div>
        </StaggerContainer>
      </div>
    </PageTransition>
  )
}

interface SectionsTabProps {
  sections: { name: string; score: number; feedback: string[] }[]
}

export function SectionsTab({ sections }: SectionsTabProps) {
  return (
    <PageTransition>
      <SectionScoresChart sections={sections || []} />
    </PageTransition>
  )
}

interface KeywordsTabProps {
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestedKeywords: string[]
  matchPercentage: number
}

export function KeywordsTab({ matchedKeywords, missingKeywords, suggestedKeywords, matchPercentage }: KeywordsTabProps) {
  return (
    <PageTransition>
      <StaggerContainer stagger={0.05} direction="up">
        <JobMatchChart
          matchPercentage={matchPercentage}
          matchedKeywords={matchedKeywords}
          missingKeywords={missingKeywords}
          suggestedKeywords={suggestedKeywords}
        />
      </StaggerContainer>
    </PageTransition>
  )
}

interface SuggestionsTabProps {
  result: ReturnType<typeof import('@/utils/atsScorer').calculateATSScore>
  jobDescription: string
}

export function SuggestionsTab({ result, jobDescription }: SuggestionsTabProps) {
  return (
    <PageTransition>
      <StaggerContainer stagger={0.05} direction="up">
        <AnalysisSummary 
          result={result}
          uploadedFileReport={null}
          jobDescription={jobDescription}
        />
      </StaggerContainer>
    </PageTransition>
  )
}

// Helper Components
function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}