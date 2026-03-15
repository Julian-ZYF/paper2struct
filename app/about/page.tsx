import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Zap, 
  Target, 
  Users,
  Code2
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "快速解析",
    description: "上传论文后，系统会在数秒内完成结构化抽取，帮助你快速理解论文核心内容。"
  },
  {
    icon: Target,
    title: "精准抽取",
    description: "基于先进的 NLP 技术，准确识别论文中的研究问题、方法、数据集、指标、实验结果等关键信息。"
  },
  {
    icon: Users,
    title: "面向研究者",
    description: "专为研究生、科研人员和算法工程师设计，让英文论文阅读不再成为障碍。"
  },
  {
    icon: Code2,
    title: "开放导出",
    description: "支持将结构化结果导出为 JSON 或 Markdown 格式，方便集成到你的工作流程中。"
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            关于 Paper2Struct
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Paper2Struct 是一个面向英文学术论文的中文结构化抽取助手，帮助研究者快速理解论文的核心内容。
          </p>
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="p-6">
                <feature.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-medium text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Target Users */}
        <div className="mt-16">
          <h2 className="text-center text-xl font-semibold text-foreground">目标用户</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-secondary/50 p-5 text-center">
              <p className="font-medium text-foreground">研究生 & 科研新人</p>
              <p className="mt-2 text-sm text-muted-foreground">
                快速阅读英文论文，降低入门门槛
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-5 text-center">
              <p className="font-medium text-foreground">AI / NLP 研究者</p>
              <p className="mt-2 text-sm text-muted-foreground">
                高效进行技术调研，把握研究前沿
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-5 text-center">
              <p className="font-medium text-foreground">产品经理 & 工程师</p>
              <p className="mt-2 text-sm text-muted-foreground">
                快速理解论文方法，指导产品开发
              </p>
            </div>
          </div>
        </div>

        {/* Supported Domains */}
        <div className="mt-16">
          <h2 className="text-center text-xl font-semibold text-foreground">支持领域</h2>
          <p className="mt-4 text-center text-muted-foreground">
            当前优先支持以下领域的英文论文：
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {["NLP", "LLM", "Medical AI", "General AI", "Computer Vision", "Multimodal"].map((domain) => (
              <span 
                key={domain}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="mt-16 rounded-lg bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">联系我们</h2>
          <p className="mt-2 text-muted-foreground">
            如有问题或建议，欢迎通过以下方式联系：
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            contact@paper2struct.ai
          </p>
        </div>
      </main>
    </div>
  )
}
