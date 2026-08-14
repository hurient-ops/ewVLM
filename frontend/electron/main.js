const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1280,
    minHeight: 720,
    title: 'ewVLM Core - Intelligent VMS',
    backgroundColor: '#070A13', // 다크 테마 배경
    autoHideMenuBar: true,      // 상단 메뉴바 숨기기
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 개발 모드와 프로덕션 모드 분기 처리
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    // Vite 개발 서버 로드
    mainWindow.loadURL('http://localhost:5174');
  } else {
    // 빌드된 index.html 로드
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 데스크톱 앱 종료 시 참조 해제
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 앱 준비가 완료되면 윈도우 생성
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 모든 윈도우가 닫히면 앱 종료 (macOS 제외)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
