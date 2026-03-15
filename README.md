# Paper2Struct — 学术论文智能结构化解析系统

> 上传一篇英文学术 PDF，自动提取研究问题、方法概述、实验结果、创新点等结构化内容，并附带原文英文证据段落，支持文献库管理与公网分享。

---

## 目录

1. [项目概述](#项目概述)
2. [功能特性](#功能特性)
3. [技术架构](#技术架构)
4. [项目目录结构](#项目目录结构)
5. [快速启动](#快速启动)
6. [公网访问配置](#公网访问配置)
7. [环境变量说明](#环境变量说明)
8. [简历亮点](#简历亮点)

---

## 项目概述

Paper2Struct 是一个全栈 AI 应用，用户上传任意英文学术论文 PDF，系统自动完成：

- PDF 文本提取与章节切分
- 调用 DeepSeek 大语言模型进行**双路并行**结构化抽取
- 以中文展示论文核心内容（研究问题、方法、数据集、实验结果、创新点、局限性）
- 附带 7 段英文原文证据，每段 150-250 词，对应每个中文板块
- 文献库支持保存、浏览、删除已解析论文

---

## 功能特性

| 功能 | 说明 |
|------|------|
| PDF 智能解析 | 基于 PyMuPDF 提取全文，正则规则自动识别章节 |
| 结构化中文摘要 | 12 个维度：标题、作者、年份、期刊、关键词、研究问题、方法概述、数据集、指标、核心结论、创新点、局限性 |
| 英文原文证据 | 7 段原文段落，每段 150-250 词，与中文板块一一对应，支持折叠展开 |
| 领域引导提取 | 支持 NLP / LLM / Agent 三种领域，定制化提取策略 |
| 双路并行推理 | 结构化抽取与证据抽取同时发起 DeepSeek 调用，节省约 40% 等待时间 |
| 文献库管理 | 基于 localStorage 持久化，支持保存、删除、跳转查看 |
| 公网可访问 | nginx 反向代理 + ngrok 静态域名，无需 SSH 即可分享给他人 |

---

## 技术架构

```
┌─────────────────────────────────────────────────────┐
│                   用户浏览器                          │
│              Next.js 14 前端应用                     │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS (ngrok 静态域名)
┌──────────────────────▼──────────────────────────────┐
│              nginx 反向代理 (port 6006)               │
│  /extract → FastAPI (8000)   /* → Next.js (3000)    │
└──────────┬──────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────┐
│              FastAPI 后端 (core_app)                  │
│                                                     │
│  PDF 上传 → PyMuPDF 解析 → 章节切分                  │
│                  ↓                                  │
│    ┌─────────────────────────────┐                  │
│    │  ThreadPoolExecutor (并行)   │                  │
│    │  ├─ DeepSeek: 结构化抽取    │                  │
│    │  └─ DeepSeek: 英文证据抽取  │                  │
│    └─────────────────────────────┘                  │
│                  ↓                                  │
│          JSON 响应 → 前端渲染                        │
└─────────────────────────────────────────────────────┘
```

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.12 | 运行环境 |
| FastAPI | 0.135 | Web 框架，自动生成 OpenAPI 文档 |
| Uvicorn | 0.41 | ASGI 服务器 |
| Pydantic v2 | 2.12 | 数据校验与 JSON Schema |
| PyMuPDF | 1.27 | PDF 文本与结构提取 |
| OpenAI SDK | 2.26 | 调用 DeepSeek API（兼容 OpenAI 协议） |
| python-dotenv | 1.2 | 环境变量管理 |
| concurrent.futures | 标准库 | 多线程并行 API 调用 |

### 前端技术栈

| 技术 | 用途 |
|------|------|
| Next.js 14 (App Router) | React 全栈框架，SSR/SSG |
| TypeScript | 类型安全，接口定义 |
| Tailwind CSS | 原子化样式 |
| shadcn/ui + Radix UI | 无障碍 UI 组件库 |
| Lucide React | 图标库 |
| localStorage | 文献库数据持久化 |
| sessionStorage | 页面间结果传递 |

### 基础设施

| 技术 | 用途 |
|------|------|
| nginx | 反向代理，统一前后端入口 |
| ngrok | 内网穿透，提供 HTTPS 静态域名 |
| DeepSeek API | 大语言模型推理（deepseek-chat） |

---

## 项目目录结构

```
paper2struct/
├── core_app/                    # FastAPI 后端（Python 包）
│   ├── main.py                  # 应用入口，CORS 配置
│   ├── api/
│   │   └── routes_extract.py    # /extract 路由，并行 API 调用
│   ├── schemas/
│   │   └── paper_schema.py      # Pydantic 数据模型（12 字段）
│   └── services/
│       ├── extractor.py         # DeepSeek 调用，文本后处理
│       └── pdf_parser.py        # PyMuPDF PDF 解析
│
├── app/                         # Next.js App Router 页面
│   ├── page.tsx                 # 首页：文件上传 + 领域选择
│   ├── result/page.tsx          # 结果页：结构化内容展示
│   └── library/page.tsx         # 文献库页面
│
├── components/
│   ├── result/
│   │   ├── paper-overview.tsx   # 论文元数据 + 关键词 + 保存按钮
│   │   ├── structured-content.tsx # 核心内容（带彩色分段要点）
│   │   └── evidence-panel.tsx   # 英文证据面板（折叠/展开）
│   └── ui/                      # shadcn/ui 基础组件
│
├── lib/
│   ├── api.ts                   # 前端 API 封装，数据适配器
│   ├── library.ts               # localStorage 文献库工具函数
│   └── mock-data.ts             # Paper 类型定义
│
├── prompts/                     # LLM Prompt 文件
│   ├── prompt.md                # 结构化中文信息抽取 Prompt
│   └── prompt_evidence.md       # 英文原文证据段落抽取 Prompt
│
├── uploads/                     # 上传 PDF 存储（已 .gitignore）
├── nginx.conf                   # nginx 反向代理配置
├── .env                         # 环境变量（已 .gitignore，不上传）
└── README.md                    # 项目说明文档
```

---

## 快速启动

### 前置要求

- Python 3.10+（已有 `.venv` 虚拟环境）
- Node.js 20+
- DeepSeek API Key

### 第一步：配置环境变量

```bash
# 编辑 .env 文件
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

### 第二步：启动后端

```bash
cd /root/autodl-tmp
source .venv/bin/activate
uvicorn core_app.main:app --host 127.0.0.1 --port 8000
```

后端启动后可访问 API 文档：http://127.0.0.1:8000/docs

### 第三步：启动前端

```bash
# 开发模式
cd /root/autodl-tmp
npm run dev

# 生产模式（推荐，速度更快）
npm run build && npm run start
```

前端访问地址：http://localhost:3000

### 第四步：本地完整访问

如在本地运行，直接打开 http://localhost:3000 即可。

如在远程服务器运行，配置 SSH 端口转发：

```bash
ssh -p <端口> root@<服务器地址> -L 3000:127.0.0.1:3000 -L 8000:127.0.0.1:8000
```

---

## 公网访问配置

通过 nginx + ngrok 将应用暴露到公网，任何人可直接通过浏览器使用。

### 启动 nginx

```bash
nginx
# 若已运行则重载配置：nginx -s reload
```

### 启动 ngrok（需先注册账号并绑定 Token）

```bash
# 绑定 Token（只需一次）
ngrok config add-authtoken <your_token>

# 启动（使用你的固定域名）
ngrok http --url=your-domain.ngrok-free.app 6006
```

### 完整启动顺序（三个终端）

```bash
# 终端 1 — 后端
source .venv/bin/activate && uvicorn core_app.main:app --host 127.0.0.1 --port 8000

# 终端 2 — 前端
npm run build && npm run start

# 终端 3 — 代理
nginx && ngrok http --url=your-domain.ngrok-free.app 6006
```

分享 `https://your-domain.ngrok-free.app` 给任何人即可使用。

---

## 环境变量说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
> **注意**：首次启动后端后，项目根目录会自动生成 `uploads/` 文件夹用于存储上传的 PDF，该目录已加入 `.gitignore` 不会被提交。

| `DEEPSEEK_API_KEY` | 是 | DeepSeek 平台 API 密钥 |
| `DEEPSEEK_BASE_URL` | 否 | API 地址，默认 `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 否 | 模型名称，默认 `deepseek-chat` |

---

## 简历亮点

以下内容可直接用于简历项目描述：

**项目名称**：Paper2Struct — 基于 LLM 的学术论文智能结构化解析系统

**技术栈**：FastAPI · Next.js 14 · TypeScript · Tailwind CSS · DeepSeek API · PyMuPDF · Pydantic v2 · nginx · ngrok

**核心亮点**：

1. **全栈独立开发**：独立完成从 PDF 解析、LLM Prompt 设计、后端 REST API 到前端 UI 渲染的完整链路，前后端分离架构。

2. **Prompt Engineering**：设计两套独立 Prompt，分别针对结构化中文信息抽取（12 字段，含领域引导）和英文原文证据段落抽取（7 板块全覆盖，每段 150-250 词），有效控制输出格式与质量。

3. **并行化性能优化**：使用 `concurrent.futures.ThreadPoolExecutor` 将两次 LLM API 调用由串行改为并行，端到端响应时间降低约 40%。

4. **工程化部署**：配置 nginx 反向代理统一前后端入口，结合 ngrok 静态域名实现 HTTPS 公网访问，无需用户配置即可使用。

5. **前端数据管理**：基于 `localStorage` 实现文献库持久化存储；利用 `sessionStorage` 跨页面传递解析结果，无需引入复杂状态管理库。

6. **类型安全**：全前端 TypeScript 编写，Pydantic v2 严格校验后端数据模型，前后端接口契约清晰。
