"""论文结构化抽取相关的 API 路由。"""

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, Response, UploadFile

from core_app.schemas.paper_schema import ExtractPreviewResponse
from core_app.services.extractor import extract_evidence, extract_structured_paper_info, split_sections
from core_app.services.pdf_parser import extract_blocks_from_pdf, extract_full_text, get_pdf_num_pages

router = APIRouter()


@router.post("/extract", response_model=ExtractPreviewResponse)
def extract(
    file: UploadFile = File(..., description="待抽取结构的 PDF 文件"),
    domain: str = Form("nlp", description="论文领域：nlp / llm / agent"),
) -> Response:
    """上传 PDF，保存文件，并返回文本预览与基础统计信息。"""
    if file.content_type not in {"application/pdf", "application/x-pdf"}:
        raise HTTPException(status_code=400, detail="仅支持 PDF 文件。")

    upload_dir = Path("uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)

    original_name = file.filename or "uploaded.pdf"
    if not original_name.lower().endswith(".pdf"):
        original_name = f"{original_name}.pdf"

    safe_name = Path(original_name).name
    save_path = upload_dir / safe_name

    file_bytes = file.file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="上传文件为空。")

    save_path.write_bytes(file_bytes)

    pages = extract_blocks_from_pdf(save_path)
    full_text = extract_full_text(save_path)
    preview_text = full_text[:500]
    num_pages = get_pdf_num_pages(save_path)
    num_blocks = sum(len(page["blocks"]) for page in pages)
    sections = split_sections(full_text)
    sections_preview = {key: value[:300] for key, value in sections.items()}

    # 候选标题：优先使用全文首个非空行，兜底为文件名（去掉扩展名）。
    first_non_empty_line = next((line.strip() for line in full_text.splitlines() if line.strip()), "")
    candidate_title = first_non_empty_line if first_non_empty_line else Path(safe_name).stem

    # 头部文本：前 1500 字符，通常包含标题、作者、机构、期刊/会议信息。
    header_text = full_text[:1500]

    # 两次 DeepSeek 调用并行执行，总耗时取决于较慢的那个。
    with ThreadPoolExecutor(max_workers=2) as pool:
        future_structured = pool.submit(
            extract_structured_paper_info,
            sections=sections,
            title=candidate_title,
            header_text=header_text,
            domain=domain,
        )
        future_evidence = pool.submit(
            extract_evidence,
            sections=sections,
            title=candidate_title,
        )

        try:
            structured_result = future_structured.result()
        except ValueError as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc
        except RuntimeError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc

        try:
            evidence = future_evidence.result()
        except Exception:
            evidence = []

    payload = ExtractPreviewResponse(
        filename=safe_name,
        saved_path=str(save_path),
        num_pages=num_pages,
        preview=preview_text,
        num_blocks=num_blocks,
        sections_preview=sections_preview,
        structured_result=structured_result,
        evidence=evidence,
    )

    # 显式关闭 ASCII 转义，保证中文在响应中直接显示。
    return Response(content=payload.model_dump_json(ensure_ascii=False), media_type="application/json")
