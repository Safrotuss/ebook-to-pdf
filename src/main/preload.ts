import { contextBridge, ipcRenderer } from 'electron';
import { CaptureSettings, Point, CaptureProgress } from '../types';

contextBridge.exposeInMainWorld('electronAPI', {
  getCursorPosition: (language: string): Promise<Point> => ipcRenderer.invoke('get-cursor-position', language),
  
  setCoordinate: (point: Point): Promise<void> => ipcRenderer.invoke('set-coordinate', point),
  
  selectSavePath: (): Promise<string | null> => ipcRenderer.invoke('select-save-path'),
  
  checkPermissions: (language: string): Promise<boolean> => ipcRenderer.invoke('check-permissions', language),
  
  startCapture: (settings: CaptureSettings): Promise<void> => 
    ipcRenderer.invoke('start-capture', settings),
  
  onCaptureProgress: (callback: (progress: CaptureProgress) => void): void => {
    ipcRenderer.on('capture-progress', (_, progress) => callback(progress));
  },
  
  reset: (): Promise<void> => ipcRenderer.invoke('reset'),
  
  openCurrentFolder: (): Promise<void> => ipcRenderer.invoke('open-current-folder'),
  
  getDefaultDownloadPath: (): Promise<string> => ipcRenderer.invoke('get-default-download-path')
});
