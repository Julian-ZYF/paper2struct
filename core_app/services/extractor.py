"""论文结构切分服务（基于规则法）。"""
import json
import os
import re
from pathlib import Path
from typing import Dict, Optional
from dotenv import load_dotenv
from openai import OpenAI

from core_app.schemas.paper_schema import EvidenceItem, PaperExtractionResult

# 统一定义支持识别的章节键，便于返回稳定结构。
SUPPORTED_SECTIONS: tuple[str, ...] = (
    "abstract",
    "introduction",
    "related_work",
    "method",
    "experiments",
    "results",
    "conclusion",
    "limitations",
)


def _load_deepseek_env() -> None:
    """显式加载 DeepSeek 环境变量，优先项目根目录，其次 app 目录。"""
    env_candidates: tuple[Path, Path] = (
        Path("/root/autodl-tmp/.env"),
        Path("/root/autodl-tmp/app/.env"),
    )

    for env_path in env_candidates:
        if env_path.exists():
            load_dotenv(dotenv_path=env_path, override=False)
            return


def _load_prompt_file(filename: str) -> str:
    """从项目根目录的 prompts/ 文件夹加载指定 prompt 文件内容。"""
    prompt_path = Path(__file__).resolve().parents[2] / "prompts" / filename
    try:
        prompt_text = prompt_path.read_text(encoding="utf-8").strip()
    except OSError as exc:
        raise RuntimeError(f"读取 prompt 文件失败: {prompt_path}") from exc

    if not prompt_text:
        raise RuntimeError(f"prompt 文件为空: {prompt_path}")
    return prompt_text


def _load_system_prompt() -> str:
    """加载中文结构化抽取 system prompt。"""
    return _load_prompt_file("prompt.md")


def _load_evidence_prompt() -> str:
    """加载英文证据抽取 system prompt。"""
    return _load_prompt_file("prompt_evidence.md")


def _sanitize_structured_result(raw_result: dict) -> dict:
    """清洗模型返回结果，确保字段类型与默认值符合目标 schema。"""
    string_fields: tuple[str, ...] = (
        "title_zh",
        "year",
        "venue",
        "research_problem_zh",
        "method_summary_zh",
    )
    list_fields: tuple[str, ...] = (
        "authors",
        "keywords",
        "datasets",
        "metrics",
        "main_results_zh",
        "innovation_points_zh",
        "limitations_zh",
    )

    cleaned: dict = {}

    for field in string_fields:
        value = raw_result.get(field, "")
        cleaned[field] = str(value).strip() if value else ""

    for field in list_fields:
        value = raw_result.get(field, [])
        if isinstance(value, list):
            cleaned[field] = [str(item).strip() for item in value if item]
        else:
            cleaned[field] = []

    return cleaned


def _postprocess_key_fields(result: PaperExtractionResult) -> PaperExtractionResult:
    """对关键字段做轻量后处理，提升输出稳定性与一致性。"""
    # 指标：去重（大小写不敏感），保留原始表述，上限 10 条
    seen_metrics: set[str] = set()
    deduped_metrics: list[str] = []
    for metric in result.metrics:
        key = metric.strip().lower()
        if key and key not in seen_metrics:
            seen_metrics.add(key)
            deduped_metrics.append(metric.strip())
        if len(deduped_metrics) >= 10:
            break
    result.metrics = deduped_metrics

    # 核心实验结果：补句号，上限 6 条
    main_results: list[str] = []
    for item in result.main_results_zh:
        text = item.strip()
        if not text:
            continue
        if not text.endswith("。"):
            text = f"{text}。"
        main_results.append(text)
        if len(main_results) >= 6:
            break
    result.main_results_zh = main_results

    # 局限性：补句号，上限 5 条
    limitations: list[str] = []
    for item in result.limitations_zh:
        text = item.strip()
        if not text:
            continue
        if not text.endswith("。"):
            text = f"{text}。"
        limitations.append(text)
        if len(limitations) >= 5:
            break
    result.limitations_zh = limitations

    return result


def normalize_heading(line: str) -> str:
    """规范化标题行，便于后续规则匹配。"""
    normalized = line.strip().lower()

    # 去掉前导编号，兼容如“1 Introduction”“2.3 Method”。
    normalized = re.sub(r"^(?:section\s+)?(?:\d+(?:\.\d+)*|[ivxlcdm]+)[\)\.\-:]*\s+", "", normalized)
    normalized = normalized.strip(" -—:：.\t")
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized


def classify_section_heading(line: str) -> Optional[str]:
    """将一行文本判断为目标章节标题，无法识别时返回 None。"""
    candidate = normalize_heading(line)
    if not candidate:
        return None

    # 标题通常较短，限制长度可减少正文误判。
    if len(candidate) > 80 or candidate.count(" ") > 10:
        return None

    rules: list[tuple[str, str]] = [
        ("abstract", r"^abstract$|^abstract\b"),
        ("introduction", r"^introduction$|^intro\b"),
        ("related_work", r"^related work$|^related work\b|^background$|^literature review$|^prior work$"),
        ("method", r"^method$|^methods$|^methodology$|^approach$|^proposed method$|^model$|^models$"),
        ("experiments", r"^experiment$|^experiments$|^experimental setup$|^implementation details$|^evaluation setup$"),
        ("results", r"^result$|^results$|^analysis$|^ablation study$|^ablation studies$"),
        ("conclusion", r"^conclusion$|^conclusions$|^concluding remarks$"),
        ("limitations", r"^limitation$|^limitations$"),
    ]

    for section_key, pattern in rules:
        if re.search(pattern, candidate):
            return section_key
    return None


def split_sections(full_text: str) -> Dict[str, str]:
    """按规则切分论文全文，返回章节到内容的映射。"""
    sections: Dict[str, str] = {key: "" for key in SUPPORTED_SECTIONS}
    current_section: Optional[str] = None

    for raw_line in full_text.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        heading = classify_section_heading(line)
        if heading is not None:
            current_section = heading
            continue

        if current_section is None:
            continue

        if sections[current_section]:
            sections[current_section] += "\n" + line
        else:
            sections[current_section] = line

    return {key: value.strip() for key, value in sections.items()}


def extract_structured_paper_info(sections: Dict[str, str], title: str = "", header_text: str = "", domain: str = "nlp") -> PaperExtractionResult:
    """调用 DeepSeek 将章节文本抽取为固定结构化结果。"""
    _load_deepseek_env()

    api_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
    if not api_key:
        raise ValueError("未配置 DEEPSEEK_API_KEY，请先在环境变量中设置。")

    # DeepSeek 兼容 OpenAI Chat Completions 协议，这里使用兼容 SDK 调用。
    base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").strip()
    client = OpenAI(api_key=api_key, base_url=base_url)
    model_name = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

    normalized_sections: Dict[str, str] = {key: sections.get(key, "") for key in SUPPORTED_SECTIONS}

    system_prompt = _load_system_prompt()

    user_payload = {
        "title": title,
        "header": header_text,
        "domain": domain,
        "sections": normalized_sections,
        "extraction_priority": {
            "authors": ["header"],
            "year": ["header"],
            "venue": ["header"],
            "research_problem_zh": ["abstract", "introduction"],
            "method_summary_zh": ["method"],
            "datasets": ["experiments", "results"],
            "metrics": ["experiments", "results"],
            "main_results_zh": ["experiments", "results"],
            "limitations_zh": ["limitations", "conclusion"],
        },
        "constraints": {
            "output_language": "zh",
            "json_only": True,
            "no_guessing": True,
        },
    }

    try:
        completion = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(user_payload, ensure_ascii=False)},
            ],
            response_format={"type": "json_object"},
            temperature=0,
        )
    except Exception as exc:
        raise RuntimeError(f"DeepSeek API 调用失败: {exc}") from exc

    content = completion.choices[0].message.content if completion.choices else ""
    if not isinstance(content, str) or not content.strip():
        raise RuntimeError("DeepSeek 返回内容为空。")

    cleaned_content = content.strip()
    if cleaned_content.startswith("```"):
        cleaned_content = cleaned_content.replace("```json", "").replace("```", "").strip()

    try:
        parsed_json = json.loads(cleaned_content)
        sanitized_json = _sanitize_structured_result(parsed_json)
        result = PaperExtractionResult.model_validate(sanitized_json)

        # 轻量兜底：若标题为空且传入了英文标题，则使用原始标题作为保底值。
        if not result.title_zh.strip() and title.strip():
            result.title_zh = title.strip()

        return _postprocess_key_fields(result)
    except Exception as exc:
        raise RuntimeError(f"DeepSeek 返回 JSON 解析失败: {exc}") from exc


def extract_evidence(sections: Dict[str, str], title: str = "") -> list[EvidenceItem]:
    """调用 DeepSeek 从论文各章节中抽取英文原文证据句。"""
    _load_deepseek_env()

    api_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
    if not api_key:
        raise ValueError("未配置 DEEPSEEK_API_KEY，请先在环境变量中设置。")

    base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").strip()
    client = OpenAI(api_key=api_key, base_url=base_url)
    model_name = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

    system_prompt = _load_evidence_prompt()

    user_payload = {
        "title": title,
        "sections": {key: sections.get(key, "") for key in SUPPORTED_SECTIONS},
    }

    try:
        completion = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(user_payload, ensure_ascii=False)},
            ],
            response_format={"type": "json_object"},
            temperature=0,
        )
    except Exception as exc:
        raise RuntimeError(f"DeepSeek Evidence API 调用失败: {exc}") from exc

    content = completion.choices[0].message.content if completion.choices else ""
    if not isinstance(content, str) or not content.strip():
        return []

    cleaned = content.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    try:
        parsed = json.loads(cleaned)
        raw_list = parsed.get("evidence", [])
        if not isinstance(raw_list, list):
            return []

        result: list[EvidenceItem] = []
        for item in raw_list:
            if not isinstance(item, dict):
                continue
            section = item.get("section", "")
            evidence_content = item.get("content", "")
            if isinstance(section, str) and isinstance(evidence_content, str) and evidence_content.strip():
                result.append(EvidenceItem(section=section.strip(), content=evidence_content.strip()))
        return result
    except Exception:
        return []
