import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import convert

app = FastAPI(
    title="업무 말투 변환기 API",
    description="Solar-Pro3 기반의 비즈니스 어조 변환 서비스 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. 헬스 체크 엔드포인트 (API 라우터 마운트 전 정의)
@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok"}

# 2. API 라우터 등록
app.include_router(convert.router, prefix="/api")

# 3. 프론트엔드 정적 파일 서빙 (CORS 및 API 라우트보다 나중에 마운트하여 경로 간섭 방지)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
