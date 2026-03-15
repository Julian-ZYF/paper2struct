"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Search, 
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Trash2
} from "lucide-react"
import type { Paper } from "@/lib/mock-data"
import { getLibrary, removeFromLibrary } from "@/lib/library"
import { SESSION_KEY } from "@/lib/api"

export default function LibraryPage() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [domainFilter, setDomainFilter] = useState<string>("all")
  const [worthReadingFilter, setWorthReadingFilter] = useState<string>("all")

  useEffect(() => {
    setPapers(getLibrary())
  }, [])

  const handleRemove = (id: string) => {
    removeFromLibrary(id)
    setPapers(getLibrary())
  }

  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      const matchesSearch =
        searchQuery === "" ||
        paper.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.titleZh.includes(searchQuery) ||
        paper.summary.includes(searchQuery)

      const matchesYear =
        yearFilter === "all" ||
        paper.year.toString() === yearFilter

      const matchesDomain =
        domainFilter === "all" ||
        paper.domain.includes(domainFilter)

      const matchesWorthReading =
        worthReadingFilter === "all" ||
        (worthReadingFilter === "yes" && paper.worthReading) ||
        (worthReadingFilter === "no" && !paper.worthReading)

      return matchesSearch && matchesYear && matchesDomain && matchesWorthReading
    })
  }, [papers, searchQuery, yearFilter, domainFilter, worthReadingFilter])

  const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a)
  const domains = [...new Set(papers.flatMap((p) => p.domain))].sort()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">论文库</h1>
          <p className="mt-1 text-muted-foreground">
            共 {papers.length} 篇论文，已筛选 {filteredPapers.length} 篇
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索论文标题、摘要..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="年份" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部年份</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="领域" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部领域</SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={worthReadingFilter} onValueChange={setWorthReadingFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="精读筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部论文</SelectItem>
                <SelectItem value="yes">值得精读</SelectItem>
                <SelectItem value="no">可快速浏览</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Paper Cards */}
        {filteredPapers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPapers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} onRemove={handleRemove} />
            ))}
          </div>
        ) : papers.length === 0 ? (
          /* 库为空 */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 font-medium text-foreground">论文库暂无内容</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              解析完论文后，点击「保存到论文库」即可在这里查看
            </p>
          </div>
        ) : (
          /* 有数据但筛选无结果 */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-medium text-foreground">未找到匹配的论文</h3>
            <p className="mt-1 text-sm text-muted-foreground">尝试调整搜索条件或筛选器</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("")
                setYearFilter("all")
                setDomainFilter("all")
                setWorthReadingFilter("all")
              }}
            >
              清除筛选条件
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

function PaperCard({ paper, onRemove }: { paper: Paper; onRemove: (id: string) => void }) {
  const router = useRouter()

  const handleView = () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(paper))
    router.push("/result")
  }

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col p-5">
        {/* Domain Tags */}
        <div className="flex flex-wrap gap-1.5">
          {paper.domain.map((d) => (
            <Badge key={d} variant="secondary" className="text-xs">
              {d}
            </Badge>
          ))}
          {paper.worthReading && (
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              精读
            </Badge>
          )}
        </div>

        {/* Chinese Title */}
        <h3 className="mt-3 line-clamp-2 font-medium leading-snug text-foreground">
          {paper.titleZh || paper.titleEn}
        </h3>

        {/* English Title */}
        {paper.titleEn && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {paper.titleEn}
          </p>
        )}

        {/* Summary */}
        <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {paper.summary}
        </p>

        {/* Dataset Tags */}
        {paper.datasets.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {paper.datasets.slice(0, 3).map((dataset) => (
              <Badge key={dataset} variant="outline" className="text-xs font-normal">
                {dataset}
              </Badge>
            ))}
            {paper.datasets.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{paper.datasets.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Meta & Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-muted-foreground">
            {[paper.venue, paper.year || ""].filter(Boolean).join(" · ")}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(paper.id)}
              title="从论文库移除"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleView}>
              查看详情
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
