#!/bin/bash
# ==============================================================================
# ewVLM Platform - macOS / Linux / WSL 원클릭 통합 기동 쉘 스크립트 (.sh)
# ==============================================================================

# ANSI 터미널 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================================================${NC}"
echo -e "${BLUE}         ewVLM 지능형 선별관제 플랫폼 UNIX/Linux 통합 실행기            ${NC}"
echo -e "${BLUE}=======================================================================${NC}"
echo -e "현재 기동 폴더 경로: $(pwd)"
echo ""

# 1. FastAPI 백엔드 가동
echo -e "${YELLOW}[1/3단계] 백엔드 FastAPI Gateway 서버 구동 시작...${NC}"
if [ -d "backend/.venv" ]; then
    source backend/.venv/bin/activate
elif [ -d "backend/venv" ]; then
    source backend/venv/bin/activate
fi
cd backend
python3 ewvlm_fastapi_gateway.py &
BACKEND_PID=$!
cd ..

sleep 3

# 2. React/Vite 프론트엔드 가동
echo -e "${YELLOW}[2/3단계] 프론트엔드 React/Vite 개발 컴파일러 시작...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 3

# 3. Ollama VLM 브릿지 시뮬레이터 가동
echo -e "${YELLOW}[3/3단계] 가상 카메라 프레임 Ollama VLM 브릿지 연동 시작...${NC}"
if [ -d "backend/.venv" ]; then
    source backend/.venv/bin/activate
fi
cd backend
python3 ewvlm_ollama_bridge.py &
BRIDGE_PID=$!
cd ..

echo -e "\n${GREEN}=======================================================================${NC}"
echo -e "${GREEN}[성공] ewVLM 삼각 동맹 기동 완료! (백그라운드 PID 제어)${NC}"
echo -e "  - 백엔드 포트   : http://localhost:8000"
echo -e "  - 프론트엔드    : http://localhost:5173"
echo -e "  - 백그라운드 PIDs: Backend($BACKEND_PID), Frontend($FRONTEND_PID), Bridge($BRIDGE_PID)"
echo -e "${GREEN}=======================================================================${NC}"
echo "서버를 한꺼번에 종료하시려면 [Ctrl + C]를 누르십시오."

# Ctrl+C 수신 시 모든 백그라운드 프로세스 안전하게 일괄 중지(Clean up)
cleanup() {
    echo -e "\n${YELLOW}[알림] ewVLM 개발 서버 프로세스를 안전하게 정리하고 전면 종료합니다...${NC}"
    kill $BACKEND_PID $FRONTEND_PID $BRIDGE_PID 2>/dev/null
    exit 0
}

trap cleanup INT

# 프로세스 유지 대기
wait
