"""论文抽取相关的 Pydantic 数据模型。"""

from pydantic import BaseModel, Field


class SectionItem(BaseModel):
    """抽取结果中的章节项。"""

    heading: str = Field(default="", description="章节标题")
    content: str = Field(default="", description="章节内容")


class EvidenceItem(BaseModel):
    """单条英文原文证据。"""

    section: str = Field(default="", description="来源章节名（英文标准名）")
    content: str = Field(default="", description="英文原文句子")


class ExtractResponse(BaseModel):
    """`/extract` 接口的响应模型。"""

    title: str = Field(default="", description="抽取出的论文标题")
    abstract: str = Field(default="", description="抽取出的摘要")
    sections: list[SectionItem] = Field(default_factory=list, description="抽取出的章节列表")
    raw_text_preview: str = Field(default="", description="解析原文预览")
    message: str = Field(default="", description="当前抽取器状态信息")


class PaperExtractionResult(BaseModel):
    """论文结构化抽取结果（MVP）。"""

    title_zh: str = Field(default="", description="论文标题（中文）")
    authors: list[str] = Field(default_factory=list, description="作者列表")
    year: str = Field(default="", description="发表年份")
    venue: str = Field(default="", description="发表期刊或会议名称")
    keywords: list[str] = Field(default_factory=list, description="论文关键词列表")
    research_problem_zh: str = Field(default="", description="研究问题（中文）")
    method_summary_zh: str = Field(default="", description="方法总结（中文）")
    datasets: list[str] = Field(default_factory=list, description="涉及的数据集列表")
    metrics: list[str] = Field(default_factory=list, description="涉及的评测指标列表")
    main_results_zh: list[str] = Field(default_factory=list, description="主要实验结果（中文要点列表）")
    innovation_points_zh: list[str] = Field(default_factory=list, description="创新点（中文要点列表）")
    limitations_zh: list[str] = Field(default_factory=list, description="局限性（中文要点列表）")


class ExtractPreviewResponse(BaseModel):
    """`/extract` 文件上传与文本预览接口的响应模型。"""

    filename: str = Field(..., description="上传文件名")
    saved_path: str = Field(..., description="文件保存路径")
    num_pages: int = Field(..., description="PDF 页数")
    preview: str = Field(..., description="文本预览")
    num_blocks: int = Field(..., description="文本块总数")
    sections_preview: dict[str, str] = Field(default_factory=dict, description="章节预览（每节截断前 300 字符）")
    structured_result: PaperExtractionResult = Field(..., description="中文结构化抽取结果")
    evidence: list[EvidenceItem] = Field(default_factory=list, description="英文原文证据列表")
