import { CaptureSettings, Point, CaptureProgress } from '../types';

declare global {
  interface Window {
    electronAPI: {
      getCursorPosition: (language: string) => Promise<Point>;
      setCoordinate: (point: Point) => Promise<void>;
      selectSavePath: () => Promise<string | null>;
      checkPermissions: (language: string) => Promise<boolean>;
      startCapture: (settings: CaptureSettings) => Promise<void>;
      stopCapture: () => Promise<void>;
      onCaptureProgress: (callback: (progress: CaptureProgress) => void) => void;
      reset: () => Promise<void>;
      openCurrentFolder: () => Promise<void>;
      getDefaultDownloadPath: () => Promise<string>;
    };
  }
}

export {};
