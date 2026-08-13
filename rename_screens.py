import os

mapping = {
    "3차원 기하학 좌표계 보정 및 가상 펜스 설정 콘솔": "GeometryCalibrationConsole.html",
    "ewVLM 모바일 패트롤 앱": "MobilePatrolApp.html",
    "ewvlm-ui-spec-v2.md": "EwVlmUiSpecV2.html",
    "GIS 스마트 맵 기반 카메라 동적 화각 매핑": "GisSmartMap.html",
    "Monitor A - 실시간 관제 및 PTZ 제어": "MonitorALiveControl.html",
    "Monitor B - VLM 지능형 영상 분석 및 제언": "MonitorBVlmAnalysis.html",
    "NVR 스토리지 및 하드웨어 상태 검수 대시보드": "NvrStorageDashboard.html",
    "광역 IP Audio 그룹 방송 및 비상벨 인터컴 제어 콘솔": "IpAudioBroadcastConsole.html",
    "다중 사이트 페더레이션 & 사용자 권한 매트릭스 관리 콘솔": "MultiSiteAuthMatrix.html",
    "다차원 의미 벡터 가시화 & 분석 포탈": "SemanticVectorPortal.html",
    "다채널 동시 동기화 플레이백 & 동선 복원": "MultiChannelSyncPlayback.html",
    "단말 카메라 하드웨어 사이버 보안 & 인증서 관리자 포탈": "CameraSecurityPortal.html",
    "단말 하드웨어 정밀 진단 및 자율 복구(Self-Healing) 마스터 쉘": "HardwareSelfHealingShell.html",
    "대규모 장비 일괄 설정 및 프로파일 클론 콘솔": "MassDeviceConfigClone.html",
    "물리 장치 네트워크 토폴로지 및 PoE 스위치 모니터링 콘솔": "NetworkTopologyMonitor.html",
    "실시간 통계 및 BI 대시보드 (SightMind)": "RealtimeBiDashboard.html",
    "암호학적 시스템 로그 위변조 방지 감사 이력 포탈": "SystemAuditLogPortal.html",
    "에지 AI 컨테이너 오케스트레이션 및 NIM 분산 전개 모니터링 콘솔": "EdgeAiOrchestration.html",
    "이벤트 리뷰어 및 오탐 검증 센터": "EventReviewCenter.html",
    "자연어 관제 룰셋 코파일럿 콘솔": "NaturalLanguageRuleCopilot.html",
    "자율 피드백 루프 및 LoRA 미세조정 관리 콘솔": "LoraFinetuningConsole.html",
    "재난대응 통합 가상 워룸 및 유관기관 협업 콘솔": "DisasterVirtualWarRoom.html",
    "저장영상 조회 및 시맨틱 검색": "VssSemanticSearch.html",
    "지능형 PTZ 타겟 락온 및 다중 카메라 궤적 인계(Handover) 컨트롤러": "PtzTargetHandover.html",
    "지능형 영상 관제 플랫폼 회원가입": "Signup.html",
    "지능형 자율 PTZ 순찰 투어 및 스케줄 기획 콘솔": "PtzPatrolSchedule.html",
    "카메라 자산 및 환경설정 관리": "CameraSetupConfig.html",
    "프라이버시 비식별화 가공 및 암호화 반출 워크숍": "PrivacyExportWorkshop.html",
    "프롬프트 게이트웨이 및 엣지 장치 일괄 배포 콘솔": "PromptGatewayDeploy.html"
}

src_dir = 'e:/projects/ewVLM/frontend/src'
files = [f for f in os.listdir(src_dir) if f.endswith('.html')]

renamed_log = []

for filename in files:
    new_name = None
    for k, v in mapping.items():
        if filename.startswith(k) or k in filename:
            new_name = v
            break
            
    if new_name:
        old_path = os.path.join(src_dir, filename)
        new_path = os.path.join(src_dir, new_name)
        os.rename(old_path, new_path)
        renamed_log.append(f"| {k} | `{new_name}` |")

md_table = "\n\n---\n\n## 5. 프론트엔드 React 컴포넌트 파일명 매핑 기준 (Component Naming Mapping)\n\n"
md_table += "Stitch에서 도출된 28개의 UI 스크린 원본 파일들을 React 개발 표준(PascalCase)에 맞춰 다음과 같이 파일명을 변경 및 매핑하여 개발을 진행합니다.\n\n"
md_table += "| 원본 스크린 명칭 (도메인 기능) | 변경된 파일명 (PascalCase) |\n"
md_table += "| :--- | :--- |\n"
md_table += "\n".join(renamed_log)
md_table += "\n"

spec_path = 'e:/projects/ewVLM/frontend/ewvlm-ui-spec-v2.md'
with open(spec_path, 'a', encoding='utf-8') as f:
    f.write(md_table)

print(f"Renamed {len(renamed_log)} files and updated spec.")
