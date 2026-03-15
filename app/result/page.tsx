"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { PaperOverview } from "@/components/result/paper-overview"
import { StructuredContent } from "@/components/result/structured-content"
import { EvidencePanel } from "@/components/result/evidence-panel"
import { mockPaper, type Paper } from "@/lib/mock-data"
import { SESSION_KEY } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function ResultPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [paper, setPaper] = useState<Paper | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) {
      try {
        setPaper(JSON.parse(stored) as Paper)
      } catch {
        setPaper(mockPaper)
      }
    } else {
      setPaper(mockPaper)
    }
  }, [])

  if (!paper) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr_340px]">
          {/* Left Column - Paper Overview */}
          <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <PaperOverview paper={paper} />
          </aside>
          
          {/* Center Column - Structured Content */}
          <div className="min-w-0">
            <StructuredContent 
              paper={paper} 
              onSectionHover={setActiveSection}
            />
          </div>
          
          {/* Right Column - Evidence Panel */}
          <aside className="hidden lg:sticky lg:top-20 lg:block lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <EvidencePanel 
              evidence={paper.evidence} 
              activeSection={activeSection}
            />
          </aside>
        </div>
      </main>
    </div>
  )
}
