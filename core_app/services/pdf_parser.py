"""基于 PyMuPDF 的 PDF 解析服务。"""

from pathlib import Path
from typing import Any

import fitz


def extract_blocks_from_pdf(file_path: str | Path) -> list[dict[str, Any]]:
    """提取 PDF 每一页的文本块，并过滤空文本。

    参数:
        file_path: PDF 文件的绝对路径或相对路径。

    返回:
        结构化列表。每一项代表一页，包含该页抽取出的
        非空文本块。
    """
    path = Path(file_path)
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"未找到 PDF 文件: {path}")

    pages: list[dict[str, Any]] = []
    with fitz.open(path) as document:
        for page in document:
            raw_blocks = page.get_text("blocks")
            blocks: list[dict[str, Any]] = []

            # PyMuPDF 的 block 元组格式：
            # (x0, y0, x1, y1, text, block_no, block_type)
            for block in raw_blocks:
                text = block[4].strip()
                if not text:
                    continue

                blocks.append(
                    {
                        "block_no": int(block[5]),
                        "block_type": int(block[6]),
                        "bbox": [float(block[0]), float(block[1]), float(block[2]), float(block[3])],
                        "text": text,
                    }
                )

            pages.append(
                {
                    "page_number": page.number + 1,
                    "blocks": blocks,
                }
            )

    return pages


def extract_full_text(file_path: str | Path) -> str:
    """通过拼接过滤后的页面文本块，提取 PDF 全文。"""
    pages = extract_blocks_from_pdf(file_path)
    texts: list[str] = []

    for page in pages:
        for block in page["blocks"]:
            texts.append(block["text"])

    return "\n".join(texts)


def get_pdf_num_pages(file_path: str | Path) -> int:
    """统计 PDF 总页数。"""
    path = Path(file_path)
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"未找到 PDF 文件: {path}")

    with fitz.open(path) as document:
        return len(document)
