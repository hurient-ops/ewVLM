# -----------------------------------------------------------------------------
# ewVLM-Core - Ollama 로컬 모델 자동 다운로드 및 무결성 검증 스크립트 (v2 - Windows PowerShell용)
# -----------------------------------------------------------------------------

Write-Host "=======================================================================" -ForegroundColor Blue
Write-Host "   ewVLM-Core - Ollama 로컬 공공보안 모델 자동 다운로드 및 검증 (v2)  " -ForegroundColor Blue
Write-Host "=======================================================================" -ForegroundColor Blue

# 1. Ollama 설치 여부 체크
if (-not (Get-Command "ollama" -ErrorAction SilentlyContinue)) {
    Write-Host "[오류] Ollama가 시스템에 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "https://ollama.com 에 접속하셔서 Windows용 클라이언트를 먼저 설치해 주세요." -ForegroundColor Yellow
    Exit
}
Write-Host "[확인] Ollama 클라이언트 탐지 완료." -ForegroundColor Green

# 2. Ollama 로컬 서비스 데몬(Port: 11434) 작동 상태 검증
Write-Host "[대기] Ollama 로컬 서비스 엔진 연결 상태를 확인하는 중..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434" -Method Get -ErrorAction Stop
    Write-Host "[성공] Ollama 가속 서비스 연결 정상 수립 (Port: 11434)" -ForegroundColor Green
} catch {
    Write-Host "[오류] Ollama 서비스 데몬이 백그라운드에서 구동되고 있지 않습니다." -ForegroundColor Red
    Write-Host "Ollama 앱을 더블 클릭해 실행하거나, 터미널에서 'ollama serve'를 먼저 켜주세요." -ForegroundColor Yellow
    Exit
}

# 3. 모델 리스트 정의 및 순차 다운로드
# Note: Ollama 공식 레포지토리 명칭 기준 PaliGemma의 정확한 식별자는 'paligemma' 입니다.
$models = @("llama3.2-vision", "solar", "paligemma")

foreach ($model in $models) {
    Write-Host "`n-----------------------------------------------------------------------" -ForegroundColor Blue
    Write-Host "[진행] 공공보안 핵심 모델 다운로드 중: $model..." -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------------------------" -ForegroundColor Blue
    
    ollama pull $model
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[성공] $model 모델이 로컬 가속 라이브러리에 탑재 완료되었습니다." -ForegroundColor Green
    } else {
        Write-Host "[실패] $model 모델 다운로드 중 예기치 못한 에러가 발생했습니다." -ForegroundColor Red
        Exit
    }
}

Write-Host "`n=======================================================================" -ForegroundColor Blue
Write-Host "[성공] ewVLM 플랫폼용 공공보안 분산 VLM/LLM 3대 핵심 모델 적재 완료!" -ForegroundColor Green
Write-Host "=======================================================================" -ForegroundColor Blue
ollama list
