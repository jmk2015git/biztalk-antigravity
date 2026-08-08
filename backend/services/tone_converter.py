import os
from dotenv import load_dotenv
from langchain_upstage import ChatUpstage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from prompts.templates import SYSTEM_INSTRUCTION, PROMPTS

# 프로젝트 루트(.env) 경로를 명시하여 로드
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
dotenv_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path=dotenv_path)

def convert_tone(text: str, target: str) -> str:
    """
    원문 텍스트를 수신 대상에 맞는 적절한 비즈니스 톤으로 변환합니다.
    """
    if target not in PROMPTS:
        raise ValueError(f"지원하지 않는 수신 대상입니다: {target}")
    
    # API 키 존재 여부 확인
    if not os.getenv("UPSTAGE_API_KEY"):
        raise ValueError("UPSTAGE_API_KEY 환경 변수가 설정되어 있지 않습니다.")
    
    # 시스템 프롬프트 조립
    system_prompt = f"{SYSTEM_INSTRUCTION}\n\n[지시사항]\n{PROMPTS[target]}"
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", "원문: {text}")
    ])
    
    # ChatUpstage 인스턴스 생성 (solar-pro3 모델 사용)
    chat = ChatUpstage(model="solar-pro3")
    
    # LangChain LCEL 체인 구성
    chain = prompt | chat | StrOutputParser()
    
    # 변환 처리
    response = chain.invoke({"text": text})
    return response.strip()
