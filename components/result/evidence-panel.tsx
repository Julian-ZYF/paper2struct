"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileSearch, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface Evidence {
  section: string
  content: string
}

interface EvidencePanelProps {
  evidence: Evidence[]
  activeSection: string | null
}

const PREVIEW_WORD_COUNT = 40

function wordPreview(text: string, count: number): { preview: string; hasMore: boolean } {
  const words = text.trim().split(/\s+/)
  if (words.length <= count) return { preview: text, hasMore: false }
  return { preview: words.slice(0, count).join(" ") + " …", hasMore: true }
}

export function EvidencePanel({ evidence, activeSection }: EvidencePanelProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const toggle = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <FileSearch className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">原文 Evidence</h2>
        </div>
        {evidence.length > 0 && (
          <span className="text-xs text-muted-foreground">{evidence.length} 条</span>
        )}
      </div>

      <div className="space-y-3">
        {evidence.map((item, index) => {
          const isActive = activeSection === item.section
          const isExpanded = expanded.has(index)
          const { preview, hasMore } = wordPreview(item.content, PREVIEW_WORD_COUNT)

          return (
            <Card
              key={index}
              className={cn(
                "transition-all duration-200",
                isActive
                  ? "ring-2 ring-primary shadow-md"
                  : "opacity-80 hover:opacity-100"
              )}
            >
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="flex items-center gap-2">
                  <Badge
                    variant={isActive ? "default" : "outline"}
                    className="text-xs font-normal"
                  >
                    {item.section}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="border-l-2 border-muted pl-3 text-sm italic leading-relaxed text-muted-foreground">
                  {isExpanded ? item.content : preview}
                </p>
                {hasMore && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => toggle(index)}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="mr-1 h-3 w-3" />
                        收起
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-1 h-3 w-3" />
                        展开全文
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {evidence.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <FileSearch className="h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">暂无原文证据</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
