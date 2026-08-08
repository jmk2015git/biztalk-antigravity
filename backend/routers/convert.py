from fastapi import APIRouter, HTTPException, status
from models.schemas import ConvertRequest, ConvertResponse
from services.tone_converter import convert_tone
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn.error")

@router.post(
    "/convert",
    response_model=ConvertResponse,
    status_code=status.HTTP_200_OK,
    summary="업무 말투 변환",
    description="원문을 선택한 수신 대상의 톤에 맞추어 적절한 비즈니스 문구로 변환합니다."
)
def convert_text(request: ConvertRequest):
    try:
        converted = convert_tone(request.text, request.target_audience)
        return ConvertResponse(
            converted_text=converted,
            target_audience=request.target_audience,
            original_text=request.text
        )
    except ValueError as ve:
        logger.error(f"Validation or Configuration Error: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"LLM API Error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="LLM API 호출 중 오류가 발생했습니다."
        )
