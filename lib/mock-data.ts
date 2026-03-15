export interface Paper {
  id: string
  titleEn: string
  titleZh: string
  authors: string[]
  year: number
  venue: string
  domain: string[]
  keywords: string[]
  summary: string
  worthReading: boolean
  researchQuestion: string
  methodOverview: string
  datasets: string[]
  metrics: string[]
  coreResults: string[]
  innovations: string[]
  limitations: string[]
  evidence: {
    section: string
    content: string
  }[]
}

export const mockPaper: Paper = {
  id: "1",
  titleEn: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
  titleZh: "BERT：用于语言理解的深度双向 Transformer 预训练",
  authors: ["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee", "Kristina Toutanova"],
  year: 2019,
  venue: "NAACL",
  domain: ["NLP", "LLM"],
  keywords: ["预训练", "双向 Transformer", "Masked LM", "迁移学习", "NLP"],
  summary: "提出了一种新的语言表示模型 BERT，通过联合调节所有层中的双向上下文来预训练深度双向表示。",
  worthReading: true,
  researchQuestion: "如何通过预训练一个深度双向 Transformer 模型，使其能够在各种 NLP 任务上取得最先进的性能？现有的语言模型预训练方法（如 GPT）只能利用单向上下文，这限制了模型对语言的理解能力。",
  methodOverview: "BERT 的核心创新在于采用了 Masked Language Model (MLM) 预训练目标。与传统的从左到右或从右到左的语言模型不同，MLM 随机遮盖输入中的一部分 token，然后预测这些被遮盖的 token。这使得模型能够融合左右两个方向的上下文信息。此外，BERT 还使用了 Next Sentence Prediction (NSP) 任务，通过预测两个句子是否连续来捕获句子级别的关系。模型基于 Transformer 的 encoder 架构，使用多层自注意力机制来编码输入序列。",
  datasets: ["GLUE", "SQuAD 1.1", "SQuAD 2.0", "SWAG", "MultiNLI", "QNLI", "SST-2"],
  metrics: ["Accuracy", "F1 Score", "GLUE Score", "Exact Match"],
  coreResults: [
    "在 GLUE 基准测试中，BERT-Large 取得了 80.5% 的平均分数，比之前最佳结果提升了 7.7%",
    "在 SQuAD 1.1 上，F1 分数达到 93.2%，超过人类表现（91.2%）",
    "在 SQuAD 2.0 上，F1 分数达到 83.1%，比之前最佳结果提升了 5.1%",
    "在所有 11 个 NLP 任务上都取得了最先进的结果"
  ],
  innovations: [
    "提出了 Masked Language Model 预训练目标，首次实现了真正的双向预训练",
    "设计了 Next Sentence Prediction 任务来建模句子关系",
    "证明了预训练模型可以通过简单的微调在各种下游任务上取得优异表现",
    "开创了 \"预训练-微调\" 的 NLP 研究范式"
  ],
  limitations: [
    "预训练和微调阶段存在不一致性（[MASK] token 在微调时不存在）",
    "模型规模大，需要大量计算资源进行训练和推理",
    "对于长文本处理能力有限，最大序列长度为 512",
    "NSP 任务的必要性在后续研究中受到质疑"
  ],
  evidence: [
    {
      section: "Abstract",
      content: "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers."
    },
    {
      section: "Introduction",
      content: "Language model pre-training has been shown to be effective for improving many natural language processing tasks. These include sentence-level tasks such as natural language inference and paraphrasing, which aim to predict the relationships between sentences by analyzing them holistically, as well as token-level tasks such as named entity recognition and question answering, where models are required to produce fine-grained output at the token level."
    },
    {
      section: "Method",
      content: "BERT alleviates the previously mentioned unidirectionality constraint by using a 'masked language model' (MLM) pre-training objective, inspired by the Cloze task. The masked language model randomly masks some of the tokens from the input, and the objective is to predict the original vocabulary id of the masked word based only on its context."
    },
    {
      section: "Experiments",
      content: "We evaluate BERT on eleven NLP tasks. BERT obtains new state-of-the-art results on all eleven tasks. The BERT-Large model obtains a score of 80.5 on the GLUE benchmark, which is 7.7% absolute improvement over the previous state-of-the-art. On SQuAD 1.1, BERT achieves a 93.2 F1 score, surpassing the previous best result by 1.5 F1 and human-level performance by 2.0 F1."
    },
    {
      section: "Results",
      content: "We present experimental results for fine-tuning BERT on downstream tasks. The results demonstrate that BERT significantly outperforms all existing systems across all tasks. On the GLUE benchmark, we achieve state-of-the-art results on all 8 tasks. On SQuAD, we achieve state-of-the-art results on both version 1.1 and 2.0."
    },
    {
      section: "Conclusion",
      content: "We have presented BERT, a new language representation model that is designed to pre-train deep bidirectional representations by jointly conditioning on both left and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks."
    }
  ]
}

export const mockPapers: Paper[] = [
  mockPaper,
  {
    id: "2",
    titleEn: "Attention Is All You Need",
    titleZh: "注意力机制是你所需要的一切",
    authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit"],
    year: 2017,
    venue: "NeurIPS",
    domain: ["NLP", "LLM"],
    keywords: ["Transformer", "自注意力", "序列到序列", "机器翻译"],
    summary: "提出了 Transformer 架构，完全基于注意力机制，摒弃了循环和卷积结构。",
    worthReading: true,
    researchQuestion: "如何设计一种完全基于注意力机制的序列到序列模型，以替代传统的 RNN 和 CNN 架构？",
    methodOverview: "Transformer 模型使用多头自注意力机制和位置编码来处理序列数据，包含编码器和解码器两部分。",
    datasets: ["WMT 2014 En-De", "WMT 2014 En-Fr"],
    metrics: ["BLEU"],
    coreResults: [
      "在 WMT 2014 英德翻译任务上达到 28.4 BLEU",
      "训练时间比之前的模型减少了数量级"
    ],
    innovations: [
      "提出了完全基于注意力的 Transformer 架构",
      "设计了多头注意力机制",
      "引入位置编码来处理序列位置信息"
    ],
    limitations: [
      "对于非常长的序列，计算复杂度较高",
      "需要大量数据进行训练"
    ],
    evidence: []
  },
  {
    id: "3",
    titleEn: "GPT-4 Technical Report",
    titleZh: "GPT-4 技术报告",
    authors: ["OpenAI"],
    year: 2023,
    venue: "arXiv",
    domain: ["LLM"],
    keywords: ["GPT-4", "多模态", "大语言模型", "RLHF"],
    summary: "GPT-4 是一个大规模多模态模型，能够处理图像和文本输入，并生成文本输出。",
    worthReading: true,
    researchQuestion: "如何训练一个能够同时处理多模态输入的大规模语言模型？",
    methodOverview: "GPT-4 基于 Transformer 架构，通过大规模预训练和人类反馈强化学习进行优化。",
    datasets: ["Private Dataset"],
    metrics: ["Human Evaluation", "Benchmark Scores"],
    coreResults: [
      "在多项专业考试中表现接近或超过人类水平",
      "在 MMLU 基准测试中达到 86.4% 的准确率"
    ],
    innovations: [
      "首次实现了高质量的多模态理解",
      "显著提升了推理和复杂任务处理能力"
    ],
    limitations: [
      "训练成本极高",
      "可能产生幻觉和错误信息"
    ],
    evidence: []
  },
  {
    id: "4",
    titleEn: "Clinical BERT: Modeling Clinical Notes and Predicting Hospital Readmission",
    titleZh: "Clinical BERT：临床笔记建模与医院再入院预测",
    authors: ["Kexin Huang", "Jaan Altosaar", "Rajesh Ranganath"],
    year: 2020,
    venue: "CHIL",
    domain: ["Medical AI", "NLP"],
    keywords: ["Clinical NLP", "BERT", "电子健康记录", "再入院预测"],
    summary: "将 BERT 模型适配到临床领域，用于处理电子健康记录中的临床笔记。",
    worthReading: false,
    researchQuestion: "如何将预训练语言模型适配到临床领域以提高医疗预测任务的性能？",
    methodOverview: "在 MIMIC-III 临床笔记上进行领域特定的预训练，然后在下游临床任务上微调。",
    datasets: ["MIMIC-III"],
    metrics: ["AUROC", "AUPRC"],
    coreResults: [
      "在 30 天再入院预测任务上取得了 0.72 的 AUROC"
    ],
    innovations: [
      "首次将 BERT 成功应用于临床 NLP",
      "提出了临床领域特定的预训练策略"
    ],
    limitations: [
      "仅在单一数据集上验证",
      "对隐私敏感数据的处理需要额外考虑"
    ],
    evidence: []
  },
  {
    id: "5",
    titleEn: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    titleZh: "面向知识密集型 NLP 任务的检索增强生成",
    authors: ["Patrick Lewis", "Ethan Perez", "Aleksandra Piktus"],
    year: 2020,
    venue: "NeurIPS",
    domain: ["NLP", "LLM"],
    keywords: ["RAG", "检索增强生成", "开放域问答", "知识密集型任务"],
    summary: "提出了 RAG 模型，结合检索机制和生成模型，用于知识密集型任务。",
    worthReading: true,
    researchQuestion: "如何通过结合检索和生成来改进知识密集型 NLP 任务的性能？",
    methodOverview: "RAG 模型包含一个检索器和一个生成器，检索器从知识库中检索相关文档，生成器基于检索结果生成答案。",
    datasets: ["Natural Questions", "TriviaQA", "WebQuestions"],
    metrics: ["Exact Match", "F1"],
    coreResults: [
      "在开放域问答任务上超越了之前的最佳结果",
      "无需针对特定任务进行额外训练"
    ],
    innovations: [
      "提出了检索增强生成的统一框架",
      "实现了端到端的可微分检索"
    ],
    limitations: [
      "检索延迟可能影响实时应用",
      "知识库的质量直接影响结果"
    ],
    evidence: []
  }
]
