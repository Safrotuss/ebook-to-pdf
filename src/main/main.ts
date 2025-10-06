import { app, BrowserWindow, ipcMain, screen, dialog, desktopCapturer, systemPreferences } from 'electron';
import * as path from 'path';
import { CaptureService } from './services/CaptureService';
import { PDFService } from './services/PDFService';
import { CaptureSettings, Point } from '../types';

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let captureService: CaptureService | null = null;
let pdfService: PDFService | null = null;
let pendingCoordinateResolve: ((point: Point) => void) | null = null;

const permissionGuidesMac: Record<string, string> = {
  en: 'Screen recording permission required.\n\n[macOS]\nPlease follow these steps.\n1. Open System Preferences (System Settings)\n2. Go to Privacy & Security > Screen Recording\n3. Click the lock icon to make changes\n4. Click + button and add this app.\n   /Applications/Electron.app\n   OR drag from node_modules/electron/dist/Electron.app\n5. Enable the checkbox\n6. Restart this app\n\nQuick access - Click the button below to copy command.',
  ko: '화면 녹화 권한이 필요합니다.\n\n[macOS]\n다음 단계를 따라주세요.\n1. 시스템 설정(또는 시스템 환경설정)을 엽니다\n2. 개인 정보 보호 및 보안 > 화면 녹화로 이동\n3. 자물쇠 아이콘을 클릭하여 변경 가능하게 합니다\n4. + 버튼을 클릭하고 이 앱을 추가합니다. (현재 폴더 열기 버튼 클릭)\n   /Applications/Electron.app\n   또는 node_modules/electron/dist/Electron.app에서 드래그\n5. 체크박스를 활성화합니다\n6. 이 앱을 재시작합니다\n\n빠른 접근 - 아래 버튼을 눌러 명령어 복사.',
  ja: '画面録画の許可が必要です。\n\n[macOS]\n次の手順に従ってください.\n1. システム環境設定を開く\n2. プライバシーとセキュリティ > 画面録画に移動\n3. ロックアイコンをクリックして変更を許可\n4. +ボタンをクリックしてこのアプリを追加. (現在のフォルダを開くボタンをクリック)\n   /Applications/Electron.app\n   またはnode_modules/electron/dist/Electron.appからドラッグ\n5. チェックボックスを有効にする\n6. このアプリを再起動\n\nクイックアクセス - 以下のボタンでコマンドをコピー.',
  zh: '需要屏幕录制权限。\n\n[macOS]\n请按照以下步骤操作.\n1. 打开系统偏好设置\n2. 转到 隐私与安全 > 屏幕录制\n3. 点击锁图标以允许更改\n4. 点击 + 按钮并添加此应用程序. (点击打开当前文件夹按钮)\n   /Applications/Electron.app\n   或从 node_modules/electron/dist/Electron.app 拖动\n5. 启用复选框\n6. 重新启动此应用\n\n快速访问 - 点击下方按钮复制命令.'
};

const permissionGuidesWindows: Record<string, string> = {
  en: 'Screen recording permission required.\n\n[Windows]\nNo additional permission needed on Windows.\nIf the app doesn\'t work.\n1. Check Windows Defender Firewall settings\n2. Run the app as Administrator\n3. Check antivirus software settings',
  ko: '화면 녹화 권한이 필요합니다.\n\n[Windows]\nWindows에서는 추가 권한이 필요하지 않습니다.\n앱이 작동하지 않는 경우.\n1. Windows Defender 방화벽 설정 확인\n2. 관리자 권한으로 앱 실행\n3. 백신 프로그램 설정 확인',
  ja: '画面録画の許可が必要です。\n\n[Windows]\nWindowsでは追加の許可は必要ありません.\nアプリが動作しない場合.\n1. Windows Defenderファイアウォールの設定を確認\n2. 管理者としてアプリを実行\n3. ウイルス対策ソフトウェアの設定を確認',
  zh: '需要屏幕录制权限。\n\n[Windows]\nWindows上不需要额外权限.\n如果应用无法工作.\n1. 检查Windows Defender防火墙设置\n2. 以管理员身份运行应用\n3. 检查杀毒软件设置'
};

const quickAccessCommand = 'open "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture"';

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 650,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const indexPath = path.join(__dirname, 'index.html');
  mainWindow.loadFile(indexPath).catch(() => {
    mainWindow?.loadURL('http://localhost:8080');
  });

  captureService = new CaptureService();
  pdfService = new PDFService();

  if (process.platform === 'darwin') {
    systemPreferences.getMediaAccessStatus('screen');
  }
}

function createOverlayWindow(): void {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  overlayWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: width,
    height: height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: true,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setIgnoreMouseEvents(false);
  
  const overlayHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          user-select: none;
        }
        body {
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.3);
          cursor: crosshair;
          overflow: hidden;
        }
        .message {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(255, 255, 255, 0.95);
          padding: 30px 50px;
          border-radius: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 20px;
          font-weight: bold;
          color: #333;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          pointer-events: none;
        }
        .coords {
          position: fixed;
          top: 10px;
          left: 10px;
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 10px 15px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 14px;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      <div class="message">Click anywhere to select coordinate<br><small style="font-size:14px; font-weight:normal;">Press ESC to cancel</small></div>
      <div class="coords" id="coords">X: 0, Y: 0</div>
      <script>
        const { ipcRenderer } = require('electron');
        
        document.body.addEventListener('mousemove', (e) => {
          document.getElementById('coords').textContent = 'X: ' + e.screenX + ', Y: ' + e.screenY;
        });
        
        document.body.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          ipcRenderer.send('overlay-click', { x: e.screenX, y: e.screenY });
        });
        
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            ipcRenderer.send('overlay-cancel');
          }
        });
      </script>
    </body>
    </html>
  `;

  overlayWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(overlayHtml)}`);
  
  overlayWindow.webContents.on('did-finish-load', () => {
    overlayWindow?.show();
    overlayWindow?.focus();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-cursor-position', async (_, language: string): Promise<Point> => {
  return new Promise((resolve, reject) => {
    pendingCoordinateResolve = resolve;
    
    createOverlayWindow();
    
    const translations: Record<string, { title: string; cancel: string }> = {
      en: { title: 'Click anywhere to select coordinate', cancel: 'Press ESC to cancel' },
      ko: { title: '좌표를 선택하려면 아무 곳이나 클릭하세요', cancel: 'ESC 키를 눌러 취소' },
      ja: { title: '座標を選択するには任意の場所をクリック', cancel: 'ESCキーでキャンセル' },
      zh: { title: '点击任意位置选择坐标', cancel: '按ESC键取消' }
    };
    
    const t = translations[language] || translations.en;
    
    if (overlayWindow) {
      overlayWindow.webContents.executeJavaScript(`
        document.querySelector('.message').innerHTML = '${t.title}<br><small style="font-size:14px; font-weight:normal;">${t.cancel}</small>';
      `);
    }
    
    const clickHandler = (_: any, point: Point) => {
      if (pendingCoordinateResolve) {
        pendingCoordinateResolve(point);
        pendingCoordinateResolve = null;
      }
      
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.close();
        overlayWindow = null;
      }
      
      ipcMain.removeListener('overlay-click', clickHandler);
      ipcMain.removeListener('overlay-cancel', cancelHandler);
      
      setTimeout(() => {
        mainWindow?.focus();
      }, 100);
    };
    
    const cancelHandler = () => {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.close();
        overlayWindow = null;
      }
      
      pendingCoordinateResolve = null;
      
      ipcMain.removeListener('overlay-click', clickHandler);
      ipcMain.removeListener('overlay-cancel', cancelHandler);
      
      mainWindow?.focus();
      reject(new Error('Cancelled'));
    };
    
    ipcMain.on('overlay-click', clickHandler);
    ipcMain.on('overlay-cancel', cancelHandler);
  });
});

ipcMain.handle('select-save-path', async (): Promise<string | null> => {
  if (!mainWindow) return null;
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select PDF Save Location'
  });
  
  if (result.canceled) {
    return null;
  }
  
  return result.filePaths[0];
});

ipcMain.handle('start-capture', async (_, settings: CaptureSettings): Promise<void> => {
  if (!captureService || !pdfService) {
    throw new Error('Services not initialized');
  }

  try {
    const testSources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1, height: 1 }
    });
    
    if (testSources.length === 0) {
      const lang = settings.language || 'en';
      const platform = process.platform;
      const errorMsg = platform === 'darwin' 
        ? (permissionGuidesMac[lang] || permissionGuidesMac.en)
        : (permissionGuidesWindows[lang] || permissionGuidesWindows.en);
      
      mainWindow?.webContents.send('capture-progress', {
        current: 0,
        total: settings.totalPages,
        status: 'error',
        message: errorMsg,
        command: platform === 'darwin' ? quickAccessCommand : undefined
      });
      throw new Error(errorMsg);
    }
  } catch (error) {
    const lang = settings.language || 'en';
    const platform = process.platform;
    const errorMsg = platform === 'darwin' 
      ? (permissionGuidesMac[lang] || permissionGuidesMac.en)
      : (permissionGuidesWindows[lang] || permissionGuidesWindows.en);
    
    mainWindow?.webContents.send('capture-progress', {
      current: 0,
      total: settings.totalPages,
      status: 'error',
      message: errorMsg,
      command: platform === 'darwin' ? quickAccessCommand : undefined
    });
    throw new Error(errorMsg);
  }

  try {
    const images = await captureService.capturePages(settings, (progress) => {
      mainWindow?.webContents.send('capture-progress', progress);
    });

    mainWindow?.webContents.send('capture-progress', {
      current: settings.totalPages,
      total: settings.totalPages,
      status: 'converting',
      message: 'Converting to PDF...'
    });

    await pdfService.createPDF(images, settings.fileName, settings.savePath);

    await captureService.cleanup();

    mainWindow?.webContents.send('capture-progress', {
      current: settings.totalPages,
      total: settings.totalPages,
      status: 'completed',
      message: 'PDF conversion completed!'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    mainWindow?.webContents.send('capture-progress', {
      current: 0,
      total: settings.totalPages,
      status: 'error',
      message: errorMessage
    });
    throw error;
  }
});

ipcMain.handle('reset', async (): Promise<void> => {
  if (captureService) {
    await captureService.cleanup();
  }
});

ipcMain.handle('open-current-folder', async (): Promise<void> => {
  const { shell } = require('electron');
  const currentDir = process.cwd();
  await shell.openPath(currentDir);
});
