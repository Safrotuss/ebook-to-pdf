export interface CaptureRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface CaptureSettings {
  topLeft: Point;
  bottomRight: Point;
  totalPages: number;
  fileName: string;
  captureSpeed: number;
  savePath?: string;
}

export interface CaptureProgress {
  current: number;
  total: number;
  status: 'idle' | 'capturing' | 'converting' | 'completed' | 'error';
  message?: string;
}

export const DEFAULT_CAPTURE_SPEED = 1000;
export const MIN_CAPTURE_SPEED = 500;
export const MAX_CAPTURE_SPEED = 5000;

declare global {
  interface Window {
    electronAPI: {
      getCursorPosition: (language: string) => Promise<Point>;
      setCoordinate: (point: Point) => Promise<void>;
      selectSavePath: () => Promise<string | null>;
      startCapture: (settings: CaptureSettings) => Promise<void>;
      onCaptureProgress: (callback: (progress: CaptureProgress) => void) => void;
      reset: () => Promise<void>;
    };
  }
}
