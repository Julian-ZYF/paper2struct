"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { 
  Upload, 
  FileText, 
  Languages, 
  Link2, 
  Archive, 
  GitCompare,
  Loader2,
  AlertCircle
} from "lucide-react"
import { extractPaper, adaptToPaper, SESSION_KEY } from "@/lib/api"

const DOMAINS = [
  {
    value: "nlp",
    label: "NLP",
    desc: "自然语言处理",
    active: "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  {
    value: "llm",
    label: "LLM",
    desc: "大语言模型",
    active: "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  {
    value: "agent",
    label: "Agent",
    desc: "智能体与规划",
    active: "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
]

const features = [
  {
    icon: Languages,
    title: "中文结构化抽取",
    description: "自动将英文论文转化为中文结构化内容"
  },
  {
    icon: Link2,
    title: "英文 Evidence 对齐",
    description: "每个抽取结果都对应原文出处"
  },
  {
    icon: Archive,
    title: "论文库归档",
    description: "保存历史解析结果，随时查阅"
  },
  {
    icon: GitCompare,
    title: "多篇论文对比",
    description: "Coming Soon",
    comingSoon: true
  }
]

export default function UploadPage() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [domain, setDomain] = useState("nlp")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
    }
  }, [])

  const handleParse = async () => {
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      const result = await extractPaper(file, domain)
      const paper = adaptToPaper(result)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(paper))
      router.push("/result")
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析失败，请重试")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            上传英文论文，生成中文结构化研究卡片
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            自动抽取研究问题、方法、数据集、指标、实验结果、创新点与局限性
          </p>
        </div>

        {/* Upload Area */}
        <Card className="mt-10 border-2 border-dashed">
          <CardContent className="p-0">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-lg px-6 py-16 transition-colors ${
                isDragging 
                  ? "bg-primary/5 border-primary" 
                  : "bg-card hover:bg-secondary/50"
              }`}
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                file ? "bg-primary/10" : "bg-muted"
              }`}>
                {file ? (
                  <FileText className="h-7 w-7 text-primary" />
                ) : (
                  <Upload className="h-7 w-7 text-muted-foreground" />
                )}
              </div>
              
              {file ? (
                <div className="mt-4 text-center">
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-muted-foreground"
                    onClick={() => setFile(null)}
                  >
                    重新选择
                  </Button>
                </div>
              ) : (
                <>
                  <p className="mt-4 text-sm text-muted-foreground">
                    拖拽 PDF 文件到此处，或
                  </p>
                  <label className="mt-2">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button variant="outline" asChild>
                      <span className="cursor-pointer">选择 PDF</span>
                    </Button>
                  </label>
                  <p className="mt-4 text-xs text-muted-foreground">
                    当前优先支持 AI / NLP / Medical AI 英文论文
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Settings */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">领域选择</label>
            <div className="flex gap-2">
              {DOMAINS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDomain(d.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                    domain === d.value
                      ? d.active + " border-2"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    domain === d.value ? d.dot : "bg-muted-foreground/40"
                  )} />
                  <span>{d.label}</span>
                  <span className="hidden text-xs opacity-70 sm:inline">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <Button 
            size="lg" 
            disabled={!file || isProcessing}
            onClick={handleParse}
            className="w-full sm:w-auto"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                解析中...
              </>
            ) : (
              "开始解析"
            )}
          </Button>
        </div>

        {/* Features */}
        <div className="mt-20">
          <h2 className="text-center text-lg font-medium text-foreground">产品亮点</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className={`relative ${feature.comingSoon ? "opacity-60" : ""}`}>
                <CardContent className="p-5">
                  {feature.comingSoon && (
                    <span className="absolute right-3 top-3 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      Soon
                    </span>
                  )}
                  <feature.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-medium text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
