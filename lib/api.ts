import type { Paper } from "@/lib/mock-data"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ""

// ── 后端响应类型 ─────────────────────────────────────────────────────────────

export interface PaperExtractionResult {
  title_zh: string
  authors: string[]
  year: string
  venue: string
  keywords: string[]
  research_problem_zh: string
  method_summary_zh: string
  datasets: string[]
  metrics: string[]
  main_results_zh: string[]
  innovation_points_zh: string[]
  limitations_zh: string[]
}

export interface EvidenceItem {
  section: string
  content: string
}

export interface ExtractApiResponse {
  filename: string
  saved_path: string
  num_pages: number
  preview: string
  num_blocks: number
  sections_preview: Record<string, string>
  structured_result: PaperExtractionResult
  evidence: EvidenceItem[]
}

// ── API 请求 ─────────────────────────────────────────────────────────────────

export async function extractPaper(file: File, domain = "nlp"): Promise<ExtractApiResponse> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("domain", domain)

  const res = await fetch(`${API_BASE}/extract`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "请求失败" }))
    throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<ExtractApiResponse>
}

// ── 后端数据 → 前端 Paper 适配 ───────────────────────────────────────────────

export function adaptToPaper(res: ExtractApiResponse): Paper {
  const { structured_result: sr, evidence: rawEvidence, filename } = res

  const evidence = (rawEvidence ?? []).map((item) => ({
    section: item.section,
    content: item.content,
  }))

  const baseName = filename.replace(/\.pdf$/i, "")

  return {
    id: filename,
    titleEn: baseName,
    titleZh: sr.title_zh || baseName,
    authors: sr.authors ?? [],
    year: sr.year ? (parseInt(sr.year) || new Date().getFullYear()) : new Date().getFullYear(),
    venue: sr.venue ?? "",
    domain: [],
    keywords: sr.keywords ?? [],
    summary: sr.research_problem_zh,
    worthReading: true,
    researchQuestion: sr.research_problem_zh,
    methodOverview: sr.method_summary_zh,
    datasets: sr.datasets,
    metrics: sr.metrics,
    coreResults: sr.main_results_zh,
    innovations: sr.innovation_points_zh,
    limitations: sr.limitations_zh,
    evidence,
  }
}

export const SESSION_KEY = "paper2struct_result"
