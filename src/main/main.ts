import { app, BrowserWindow, ipcMain, screen, desktopCapturer, dialog } from 'electron';
import * as path from 'path';
import { CaptureService } from './services/CaptureService';
import { PDFService } from './services/PDFService';
import { CaptureSettings, Point } from '../types';

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let captureService: CaptureService | null = null;
let pdfService: PDFService | null = null;
let pendingCoordinateResolve: ((point: Point) => void) | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 600,
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
}

function createOverlayWindow(): void {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();
  
  overlayWindow = new BrowserWindow({
    fullscreen: true,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  overlayWindow.setIgnoreMouseEvents(false);
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  
  // 간단한 오버레이 HTML
  const overlayHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.3);
          cursor: crosshair;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .message {
          background-color: rgba(255, 255, 255, 0.95);
          padding: 20px 40px;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 18px;
          font-weight: bold;
          color: #333;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="message">Click to select coordinate</div>
      <script>
        document.body.addEventListener('click', (e) => {
          window.electronAPI.setCoordinate({ x: e.screenX, y: e.screenY });
        });
      </script>
    </body>
    </html>
  `;

  overlayWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(overlayHtml)}`);
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
  return new Promise((resolve) => {
    pendingCoordinateResolve = resolve;
    createOverlayWindow();
  });
});

ipcMain.handle('set-coordinate', async (_, point: Point): Promise<void> => {
  if (pendingCoordinateResolve) {
    pendingCoordinateResolve(point);
    pendingCoordinateResolve = null;
  }
  
  if (overlayWindow) {
    overlayWindow.close();
    overlayWindow = null;
  }
  
  mainWindow?.focus();
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
    mainWindow?.webContents.send('capture-progress', {
      current: 0,
      total: settings.totalPages,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
});

ipcMain.handle('reset', async (): Promise<void> => {
  if (captureService) {
    await captureService.cleanup();
  }
});
