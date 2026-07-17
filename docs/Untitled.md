이전 계획에서 제안했던 Streamlit은 백엔드 개발자가 빠르게 프로토타입을 뽑아내는 데는 훌륭하지만, 엔터프라이즈급 관제 시스템의 복잡한 상태 관리(비디오 플레이어, 실시간 오버레이, 채팅창, 메모 연동)를 처리하기에는 한계가 명확합니다.  
UI/UX 개발에 Stitch(컴포넌트 주도형 UI 프레임워크 및 도구)를 도입하기로 하신 것은 상용화 수준(Production-level)의 퍼포먼스와 디자인 시스템을 구축하기 위한 가장 탁월한 선택입니다.  
20년 차 아키텍트의 관점에서, 백엔드의 하이브리드 VLM 엔진과 프론트엔드의 **Stitch 기반 반응형/모듈형 UI**를 완벽하게 결합할 수 있도록 antigravity 에이전트 맞춤형 개발 계획서를 전면 재작성해 드립니다.

# **🚀 VLM 기반 지능형 영상 분석 솔루션 개발 계획서 (Stitch UI/UX 통합형)**

## **📌 핵심 기술 스택 정의**

* **Edge/Fast Loop:** YOLOv11 / RT-DETR (TensorRT 가속)  
* **Cloud/Slow Loop:** Qwen2.5-VL (7B/72B), Florence-2 (SGLang 서빙)  
* **데이터베이스:** Milvus (벡터), Graph DB, PostgreSQL (관제 메모용 RDB)  
* **UI/UX 프론트엔드:** **React/Next.js 기반 \+ Stitch** (Atomic 디자인 시스템 및 동적 테마/스타일링)

## **1\. 프론트엔드(Stitch) 및 코어 엔진 확보 방안**

엔터프라이즈 관제 대시보드는 '어두운 환경(Dark Mode) 최적화', '초저지연 렌더링', '복잡한 상태(State) 관리'가 필수입니다. Stitch를 활용해 이를 구축하도록 에이전트에게 지시합니다.

* **UI/UX 스택 (Stitch & React):**  
  * **확보 방안:** antigravity 터미널에서 npx create-next-app@latest로 React/Next.js 환경을 세팅한 후, npm install @stitches/react를 설치합니다. 관제 대시보드에 필수적인 다크 테마와 재사용 가능한 UI 컴포넌트(버튼, 알림 카드, 비디오 래퍼 등)의 Base 설계를 Stitch의 styled API로 최우선 구축하도록 지시합니다.  
* **비디오 렌더링 및 상태 관리:**  
  * **확보 방안:** WebSocket을 통해 Fast Loop의 좌표 데이터와 비디오 스트림을 수신하고, 화면에 지연 없이 그리기 위해 Zustand(상태 관리)와 Canvas API를 Stitch 컴포넌트와 결합합니다.

## **2\. Antigravity 모듈별 실전 구현 플랜 (프롬프트 지시서)**

각 모듈은 독립된 마이크로 프론트엔드/백엔드 구조로 개발됩니다. 아래는 antigravity 에이전트에게 직접 입력하여 구현을 유도하는 상세 프롬프트입니다.

### **🛠️ Module A: Fast Loop 엔진 및 Stitch 기반 비디오 뷰어 컴포넌트**

백엔드에서 영상을 분석하고, 프론트엔드에서 Stitch를 활용해 이를 직관적으로 그려내는 첫 단계입니다.

* **Antigravity 프롬프트:**

"두 가지 작업을 수행해 줘.

1. \[백엔드\] DeepStream을 이용해 RTSP 스트림을 받고, 정적 프레임을 프루닝(CodecSight)한 뒤 YOLOv11로 분석해 Bounding Box 좌표를 WebSocket으로 쏘는 FastAPI 서버를 만들어 줘.  
   2. \[프론트엔드\] React와 @stitches/react를 사용해서 관제용 VideoPlayer 컴포넌트를 만들어 줘. Stitch를 활용해 관제실 환경에 맞는 완벽한 '다크 모드' 테마를 기본으로 설정하고, WebSocket으로 들어온 좌표 데이터를 비디오 위에 60fps로 부드럽게 오버레이(SoM)하는 Canvas 레이어를 구현해 줘."

### **🧠 Module B: Slow Loop (VLM) 연동 및 동적 알림 카드 (Event Card) UI**

VLM이 분석한 심층 데이터를 관제 요원이 쉽게 인지할 수 있도록, Stitch의 가변성(Variants)을 활용하여 직관적인 UI를 만듭니다.

* **Antigravity 프롬프트:**

"다음 시스템을 구축해 줘.

1. \[백엔드\] SGLang을 이용해 Qwen2.5-VL 모델을 서빙하고, 이상 징후 발생 시 '상황 요약 캡션'과 '위험도(High/Med/Low)'를 JSON으로 반환하는 로직을 짜 줘.  
   2. \[프론트엔드\] Stitch의 variants 기능을 적극 활용해서 EventCard 컴포넌트를 디자인해 줘. 위험도에 따라 테두리 색상과 텍스트 스타일이 즉각적으로 변하도록(예: High는 붉은색 점멸 효과) Stitch 스타일을 정의하고, 카드 내부에 VLM이 생성한 상황 요약 캡션을 표시해 줘."

### **📝 Module C: 관제 메모 바인딩 및 상호작용 UX**

관제 요원이 시스템과 소통하는 핵심 창구입니다. Stitch 기반의 모달(Modal)과 폼(Form)을 구현합니다.

* **Antigravity 프롬프트:**

"관제 요원의 조치 이력을 기록하는 기능을 만들어 줘.

1. \[백엔드\] PostgreSQL에 이벤트 ID와 관제 메모를 1:1 매핑하여 저장하는 API를 작성해 줘.  
   2. \[프론트엔드\] 이벤트 카드(EventCard)를 클릭하면 부드럽게 열리는 MemoModal 컴포넌트를 Stitch로 디자인해 줘. 입력 폼의 Focus 상태나 Error 상태에 대한 스타일링을 Stitch로 깔끔하게 처리하고, 작성 완료 시 API를 호출하여 화면의 상태(조치 완료 아이콘 등)가 즉시 업데이트되도록 만들어 줘."

### **💬 Module D: VLA 자연어 에이전트 채팅창 및 대시보드 레이아웃 통합**

모든 컴포넌트를 하나의 화면에 엮어내는 최종 관제 레이아웃입니다.

* **Antigravity 프롬프트:**

"지금까지 만든 컴포넌트들을 모아서 최종 OperatorDashboard 레이아웃을 구성해 줘.

1. 화면 좌측 70%는 VideoPlayer를 배치하고, 우측 30%는 세로 분할하여 상단에는 EventCard 리스트, 하단에는 AgentChat 컴포넌트를 배치해 줘.  
   2. AgentChat 컴포넌트는 Stitch를 이용해 말풍선 UI를 디자인해 줘. 사용자가 자연어로 '어제 발생한 붉은 트럭 침입 사건 요약해 줘'라고 물으면, 백엔드(Milvus 벡터 DB 검색)를 호출하여 답변과 썸네일 이미지를 말풍선 안에 렌더링해 줘.  
   3. 대시보드 전체의 반응형 레이아웃(Grid/Flex)을 Stitch를 사용해 구성하여, 모니터 해상도에 상관없이 깨짐 없는 UI를 보장해 줘."

## **💡 아키텍트의 실무 조언 (Stitch 도입 시 주의점)**

Stitch는 런타임 성능이 뛰어나고 DX(Developer Experience)가 좋지만, 비디오 위에 마스크(SoM)를 초당 30\~60번씩 다시 그리는 연산은 DOM 조작(CSS/Stitch)으로 해결해서는 안 됩니다.  
반드시 레이아웃과 뼈대 컴포넌트(버튼, 모달, 카드)는 **Stitch**로 미려하게 구축하되, 실시간으로 좌표가 변하는 비디오 오버레이 영역은 **HTML5 Canvas**나 **WebGL**에 렌더링을 위임하는 방식으로 프론트엔드 구조를 분리하셔야 프레임 드랍(Frame Drop) 없는 완벽한 솔루션을 완성하실 수 있습니다.  
이 플랜을 복사하여 antigravity 에이전트에게 순차적으로 지시하시면, 백엔드의 강력한 VLM 지능과 프론트엔드의 세련된 UI가 결합된 솔루션을 얻으실 수 있습니다. 더 세부적인 백엔드 쿼리 최적화나 프론트엔드 상태 관리 전략이 필요하신가요?