import { CaptureSettings, Point, CaptureProgress } from '../types';

declare global {
  interface Window {
    electronAPI: {
      getCursorPosition: () => Promise<Point>;
      startCapture: (settings: CaptureSettings) => Promise<void>;
      onCaptureProgress: (callback: (progress: CaptureProgress) => void) => void;
      reset: () => Promise<void>;
    };
  }
}

export {};
