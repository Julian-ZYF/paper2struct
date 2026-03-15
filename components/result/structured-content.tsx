"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  HelpCircle, 
  Lightbulb, 
  Database, 
  BarChart3, 
  FlaskConical,
  Sparkles,
  AlertTriangle
} from "lucide-react"
import type { Paper } from "@/lib/mock-data"

interface StructuredContentProps {
  paper: Paper
  onSectionHover: (section: string | null) => void
}

interface SectionCardProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  sectionKey: string
  onHover: (section: string | null) => void
}

function SectionCard({ title, icon, children, sectionKey, onHover }: SectionCardProps) {
  return (
    <Card 
      className="transition-shadow hover:shadow-md"
      onMouseEnter={() => onHover(sectionKey)}
      onMouseLeave={() => onHover(null)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  )
}

export function StructuredContent({ paper, onSectionHover }: StructuredContentProps) {
  return (
    <div className="space-y-4">
      {/* Research Question */}
      <SectionCard
        title="研究问题"
        icon={<HelpCircle className="h-4 w-4 text-primary" />}
        sectionKey="Introduction"
        onHover={onSectionHover}
      >
        <ul className="space-y-3">
          {paper.researchQuestion.split(/\n+/).filter(p => p.trim()).map((para, i) => (
            <li key={i} className="flex gap-3 text-sm text-foreground">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                i === 0 ? "bg-sky-500" : "bg-cyan-400"
              }`} />
              <span className="leading-relaxed">{para.trim()}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Method Overview */}
      <SectionCard
        title="方法概述"
        icon={<Lightbulb className="h-4 w-4 text-primary" />}
        sectionKey="Method"
        onHover={onSectionHover}
      >
        <ul className="space-y-3">
          {paper.methodOverview.split(/\n+/).filter(p => p.trim()).map((para, i) => (
            <li key={i} className="flex gap-3 text-sm text-foreground">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                i === 0 ? "bg-primary" :
                i === 1 ? "bg-violet-500" :
                "bg-orange-400"
              }`} />
              <span className="leading-relaxed">{para.trim()}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Datasets */}
      <SectionCard
        title="数据集"
        icon={<Database className="h-4 w-4 text-primary" />}
        sectionKey="Experiments"
        onHover={onSectionHover}
      >
        <div className="flex flex-wrap gap-2">
          {paper.datasets.map((dataset) => (
            <Badge key={dataset} variant="outline" className="font-normal">
              {dataset}
            </Badge>
          ))}
        </div>
      </SectionCard>

      {/* Metrics */}
      <SectionCard
        title="评估指标"
        icon={<BarChart3 className="h-4 w-4 text-primary" />}
        sectionKey="Experiments"
        onHover={onSectionHover}
      >
        <div className="flex flex-wrap gap-2">
          {paper.metrics.map((metric) => (
            <Badge key={metric} variant="secondary" className="font-normal">
              {metric}
            </Badge>
          ))}
        </div>
      </SectionCard>

      {/* Core Results */}
      <SectionCard
        title="核心实验结果"
        icon={<FlaskConical className="h-4 w-4 text-primary" />}
        sectionKey="Results"
        onHover={onSectionHover}
      >
        <ul className="space-y-2">
          {paper.coreResults.map((result, index) => (
            <li key={index} className="flex gap-2 text-sm text-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">{result}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Innovations */}
      <SectionCard
        title="创新点"
        icon={<Sparkles className="h-4 w-4 text-primary" />}
        sectionKey="Abstract"
        onHover={onSectionHover}
      >
        <ul className="space-y-2">
          {paper.innovations.map((innovation, index) => (
            <li key={index} className="flex gap-2 text-sm text-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
              <span className="leading-relaxed">{innovation}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Limitations */}
      <SectionCard
        title="局限性"
        icon={<AlertTriangle className="h-4 w-4 text-primary" />}
        sectionKey="Conclusion"
        onHover={onSectionHover}
      >
        <ul className="space-y-2">
          {paper.limitations.map((limitation, index) => (
            <li key={index} className="flex gap-2 text-sm text-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              <span className="leading-relaxed">{limitation}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  )
}
