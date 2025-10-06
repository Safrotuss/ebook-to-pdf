import { app, BrowserWindow, ipcMain, screen, desktopCapturer } from 'electron';
import * as path from 'path';
import { CaptureService } from './services/CaptureService';
import { PDFService } from './services/PDFService';
import { CaptureSettings, Point } from '../types';

let mainWindow: BrowserWindow | null = null;
let captureService: CaptureService | null = null;
let pdfService: PDFService | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 550,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // index.html 파일이 존재하는지 확인하여 프로덕션 모드 판단
  const indexPath = path.join(__dirname, 'index.html');
  mainWindow.loadFile(indexPath).catch(() => {
    // 개발 모드일 경우 localhost로 연결
    mainWindow?.loadURL('http://localhost:8080');
  });

  captureService = new CaptureService();
  pdfService = new PDFService();
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

ipcMain.handle('get-cursor-position', async (): Promise<Point> => {
  const point = screen.getCursorScreenPoint();
  return { x: point.x, y: point.y };
});

ipcMain.handle('minimize-window', async (): Promise<void> => {
  mainWindow?.minimize();
});

ipcMain.handle('restore-window', async (): Promise<void> => {
  mainWindow?.restore();
  mainWindow?.focus();
});

ipcMain.handle('start-capture', async (_, settings: CaptureSettings): Promise<void> => {
  if (!captureService || !pdfService) {
    throw new Error('Services not initialized');
  }

  try {
    const images = await captureService.capturePages(settings, (progress) => {
      mainWindow?.webContents.send('capture-progress', progress);
    });

    mainWindow?.webContents.send('capture-progress', {
      current: settings.totalPages,
      total: settings.totalPages,
      status: 'converting',
      message: 'PDF 변환 중...'
    });

    await pdfService.createPDF(images, settings.fileName);

    await captureService.cleanup();

    mainWindow?.webContents.send('capture-progress', {
      current: settings.totalPages,
      total: settings.totalPages,
      status: 'completed',
      message: 'PDF 변환 완료!'
    });
  } catch (error) {
    mainWindow?.webContents.send('capture-progress', {
      current: 0,
      total: settings.totalPages,
      status: 'error',
      message: error instanceof Error ? error.message : '알 수 없는 오류'
    });
    throw error;
  }
});

ipcMain.handle('reset', async (): Promise<void> => {
  if (captureService) {
    await captureService.cleanup();
  }
});
