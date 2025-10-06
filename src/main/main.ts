import { app, BrowserWindow, ipcMain, screen, dialog, systemPreferences, globalShortcut } from 'electron';
import * as path from 'path';
import { CaptureService } from './services/CaptureService';
import { PDFService } from './services/PDFService';
import { CaptureSettings, Point } from '../types';

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let captureService: CaptureService | null = null;
let pdfService: PDFService | null = null;
let pendingCoordinateResolve: ((point: Point) => void) | null = null;

async function checkScreenCapturePermission(): Promise<boolean> {
  if (process.platform === 'darwin') {
    const status = systemPreferences.getMediaAccessStatus('screen');
    if (status !== 'granted') {
      const result = await dialog.showMessageBox({
        type: 'warning',
        title: 'Screen Recording Permission Required',
        message: 'This app needs screen recording permission to capture pages.',
        buttons: ['Open System Preferences', 'Cancel'],
        defaultId: 0,
        cancelId: 1
      });

      if (result.response === 0) {
        await require('child_process').exec('open "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture"');
      }
      return false;
    }
  }
  return true;
}

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

ipcMain.handle('get-cursor-position', async (): Promise<Point> => {
  return new Promise((resolve, reject) => {
    pendingCoordinateResolve = resolve;
    
    createOverlayWindow();
    
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

  const hasPermission = await checkScreenCapturePermission();
  if (!hasPermission) {
    throw new Error('Screen recording permission is required. Please enable it in System Preferences.');
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
