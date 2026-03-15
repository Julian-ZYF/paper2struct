"""Paper2Struct FastAPI 应用入口。"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core_app.api.routes_extract import router as extract_router

app = FastAPI(title="Paper2Struct Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    """用于检查服务可用性的健康检查接口。"""
    return {"status": "ok"}


# 挂载抽取相关路由。
app.include_router(extract_router, prefix="", tags=["extract"])
