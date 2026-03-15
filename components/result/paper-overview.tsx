"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BookmarkPlus,
  BookmarkCheck,
  FileJson, 
  FileText,
  Calendar,
  Users,
  Building2,
  CheckCircle2
} from "lucide-react"
import type { Paper } from "@/lib/mock-data"
import { saveToLibrary, isInLibrary } from "@/lib/library"

interface PaperOverviewProps {
  paper: Paper
}

export function PaperOverview({ paper }: PaperOverviewProps) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(isInLibrary(paper.id))
  }, [paper.id])

  const handleSaveToLibrary = () => {
    saveToLibrary(paper)
    setSaved(true)
  }

  const handleExportJSON = () => {
    // Export logic
    const dataStr = JSON.stringify(paper, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${paper.id}-structured.json`
    a.click()
  }

  const handleExportMarkdown = () => {
    // Export logic
    const md = generateMarkdown(paper)
    const blob = new Blob([md], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${paper.id}-structured.md`
    a.click()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="space-y-3">
          {/* Domain Tags */}
          <div className="flex flex-wrap gap-1.5">
            {paper.domain.map((d) => (
              <Badge key={d} variant="secondary" className="text-xs">
                {d}
              </Badge>
            ))}
          </div>
          
          {/* English Title */}
          <h1 className="text-sm font-medium leading-tight text-foreground">
            {paper.titleEn}
          </h1>
          
          {/* Chinese Title */}
          <p className="text-sm leading-tight text-muted-foreground">
            {paper.titleZh}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Meta Info */}
        <div className="space-y-2 text-sm">
          {paper.authors.length > 0 && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <Users className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {paper.authors.length > 3
                  ? paper.authors.slice(0, 3).join("、") + " 等人"
                  : paper.authors.join("、")}
              </span>
            </div>
          )}
          {paper.year ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{paper.year}</span>
            </div>
          ) : null}
          {paper.venue ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0" />
              <span>{paper.venue}</span>
            </div>
          ) : null}
        </div>

        {/* Keywords */}
        {paper.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {paper.keywords.map((kw) => (
              <Badge key={kw} variant="outline" className="text-xs font-normal text-primary border-primary/30 bg-primary/5">
                {kw}
              </Badge>
            ))}
          </div>
        )}

        {/* Worth Reading Badge */}
        <div className="flex items-center gap-2">
          {paper.worthReading ? (
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              值得精读
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              可快速浏览
            </Badge>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button 
            variant={saved ? "outline" : "default"}
            size="sm" 
            className="w-full justify-start"
            onClick={handleSaveToLibrary}
            disabled={saved}
          >
            {saved ? (
              <>
                <BookmarkCheck className="mr-2 h-4 w-4 text-primary" />
                已保存到论文库
              </>
            ) : (
              <>
                <BookmarkPlus className="mr-2 h-4 w-4" />
                保存到论文库
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={handleExportJSON}
          >
            <FileJson className="mr-2 h-4 w-4" />
            导出 JSON
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={handleExportMarkdown}
          >
            <FileText className="mr-2 h-4 w-4" />
            导出 Markdown
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function generateMarkdown(paper: Paper): string {
  return `# ${paper.titleZh}

**English Title:** ${paper.titleEn}

**Authors:** ${paper.authors.join(", ")}

**Year:** ${paper.year}

**Venue:** ${paper.venue}

**Domain:** ${paper.domain.join(", ")}

## 一句话总结

${paper.summary}

## 研究问题

${paper.researchQuestion}

## 方法概述

${paper.methodOverview}

## 数据集

${paper.datasets.map(d => `- ${d}`).join("\n")}

## 指标

${paper.metrics.map(m => `- ${m}`).join("\n")}

## 核心实验结果

${paper.coreResults.map(r => `- ${r}`).join("\n")}

## 创新点

${paper.innovations.map(i => `- ${i}`).join("\n")}

## 局限性

${paper.limitations.map(l => `- ${l}`).join("\n")}
`
}
