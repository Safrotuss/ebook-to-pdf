/*
 * Copyright 2025 efforthye
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { contextBridge, ipcRenderer } from 'electron';
import { CaptureSettings, Point, CaptureProgress } from '../types';

contextBridge.exposeInMainWorld('electronAPI', {
  getCursorPosition: (language: string): Promise<Point> => ipcRenderer.invoke('get-cursor-position', language),
  
  setCoordinate: (point: Point): Promise<void> => ipcRenderer.invoke('set-coordinate', point),
  
  selectSavePath: (): Promise<string | null> => ipcRenderer.invoke('select-save-path'),
  
  checkPermissions: (language: string): Promise<boolean> => ipcRenderer.invoke('check-permissions', language),
  
  startCapture: (settings: CaptureSettings): Promise<void> => 
    ipcRenderer.invoke('start-capture', settings),
  
  stopCapture: (): Promise<void> => ipcRenderer.invoke('stop-capture'),
  
  onCaptureProgress: (callback: (progress: CaptureProgress) => void): void => {
    ipcRenderer.on('capture-progress', (_, progress) => callback(progress));
  },
  
  reset: (): Promise<void> => ipcRenderer.invoke('reset'),
  
  openCurrentFolder: (): Promise<void> => ipcRenderer.invoke('open-current-folder'),
  
  getDefaultDownloadPath: (): Promise<string> => ipcRenderer.invoke('get-default-download-path')
});
