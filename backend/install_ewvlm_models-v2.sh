#!/bin/bash
# -----------------------------------------------------------------------------
# ewVLM-Core - Ollama 로컬 모델 자동 다운로드 및 무결성 검증 스크립트 (v2 - paligemma 버그 수정본)
# -----------------------------------------------------------------------------
# 대상 모델 라인업:
# 1. llama3.2-vision (Slow-Loop / VSS 시맨틱 검색 핵심 브레인 - 11B)
# 2. solar (K-SOP 수립 및 안전 보고서 자동 완성 전담 LLM - 10.7B)
# 3. paligemma (Local Edge 1차 검출 정탐/오탐 물리 검증기 - 3B)
# -----------------------------------------------------------------------------

# ANSI 터미널 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================================================${NC}"
echo -e "${BLUE}   ewVLM-Core - Ollama 로컬 공공보안 모델 자동 다운로드 및 검증 (v2)  ${NC}"
echo -e "${BLUE}=======================================================================${NC}"

# 1. Ollama 설치 여부 체크
if ! command -v ollama &> /dev/null
then
    echo -e "${RED}[오류] Ollama가 시스템에 설치되어 있지 않습니다.${NC}"
    echo -e "${YELLOW}https://ollama.com 에 접속하셔서 클라이언트를 먼저 설치해 주세요.${NC}"
    exit 1
fi
echo -e "${GREEN}[확인] Ollama 클라이언트 탐지 완료.${NC}"

# 2. Ollama 로컬 서비스 데몬(Port: 11434) 작동 상태 검증
echo -e "${YELLOW}[대기] Ollama 로컬 서비스 엔진 연결 상태를 확인하는 중...${NC}"
if ! curl -s http://localhost:11434 &> /dev/null
then
    echo -e "${RED}[오류] Ollama 서비스 데몬이 백그라운드에서 구동되고 있지 않습니다.${NC}"
    echo -e "${YELLOW}Ollama 앱을 실행하거나, 터미널에서 'ollama serve'를 먼저 켜주세요.${NC}"
    exit 1
fi
echo -e "${GREEN}[성공] Ollama 가속 서비스 연결 정상 수립 (Port: 11434)${NC}"

# 3. 모델 리스트 정의 및 순차 다운로드 (Pulling)
# Note: Ollama 공식 레포지토리 명칭 기준 PaliGemma의 정확한 식별자는 'paligemma' 입니다.
MODELS=("llama3.2-vision" "solar" "paligemma")

for model in "${MODELS[@]}"
do
    echo -e "\n${BLUE}-----------------------------------------------------------------------${NC}"
    echo -e "${YELLOW}[진행] 공공보안 핵심 모델 다운로드 중: $model...${NC}"
    echo -e "${BLUE}-----------------------------------------------------------------------${NC}"
    
    # Ollama 엔진에 모델 다운로드 지시
    if ollama pull "$model"; then
        echo -e "${GREEN}[성공] $model 모델이 로컬 가속 라이브러리에 탑재 완료되었습니다.${NC}"
    else
        echo -e "${RED}[실패] $model 모델 다운로드 중 예기치 못한 네트워크 에러가 발생했습니다.${NC}"
        exit 1
    fi
done

# 4. 최종 다운로드 라이브러리 검증 및 정렬 상태 목록 출력
echo -e "\n${BLUE}=======================================================================${NC}"
echo -e "${GREEN}[성공] ewVLM 플랫폼용 공공보안 분산 VLM/LLM 3대 핵심 모델 적재 완료!${NC}"
echo -e "${BLUE}=======================================================================${NC}"
ollama list

exit 0
