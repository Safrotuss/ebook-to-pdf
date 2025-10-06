import { contextBridge, ipcRenderer } from 'electron';
import { CaptureSettings, Point, CaptureProgress } from '../types';

contextBridge.exposeInMainWorld('electronAPI', {
  getCursorPosition: (): Promise<Point> => ipcRenderer.invoke('get-cursor-position'),
  
  minimizeWindow: (): Promise<void> => ipcRenderer.invoke('minimize-window'),
  
  restoreWindow: (): Promise<void> => ipcRenderer.invoke('restore-window'),
  
  startCapture: (settings: CaptureSettings): Promise<void> => 
    ipcRenderer.invoke('start-capture', settings),
  
  onCaptureProgress: (callback: (progress: CaptureProgress) => void): void => {
    ipcRenderer.on('capture-progress', (_, progress) => callback(progress));
  },
  
  reset: (): Promise<void> => ipcRenderer.invoke('reset')
});
