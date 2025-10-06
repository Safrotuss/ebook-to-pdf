import { desktopCapturer, screen } from 'electron';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { CaptureSettings, CaptureProgress, CaptureRegion } from '../../types';

const execAsync = promisify(exec);

export class CaptureService {
  private readonly imagesDir: string;
  private capturedImages: string[] = [];

  constructor() {
    this.imagesDir = path.join(process.cwd(), 'temp_images');
  }

  private async ensureImagesDir(): Promise<void> {
    try {
      await fs.access(this.imagesDir);
    } catch {
      await fs.mkdir(this.imagesDir, { recursive: true });
    }
  }

  private getCaptureRegion(settings: CaptureSettings): CaptureRegion {
    const { topLeft, bottomRight } = settings;
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y
    };
  }

  private async captureScreen(region: CaptureRegion): Promise<Buffer> {
    try {
      const display = screen.getPrimaryDisplay();
      const scaleFactor = display.scaleFactor || 2;
      
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: Math.floor(display.workAreaSize.width * scaleFactor),
          height: Math.floor(display.workAreaSize.height * scaleFactor)
        }
      });

      if (sources.length === 0) {
        throw new Error('Unable to capture screen. Please grant screen recording permission.');
      }

      const fullImage = sources[0].thumbnail.toPNG();
      const metadata = await sharp(fullImage).metadata();
      
      // 실제 이미지 크기와 요청 영역 확인
      const actualWidth = metadata.width || 0;
      const actualHeight = metadata.height || 0;
      
      const scaledX = Math.floor(region.x * scaleFactor);
      const scaledY = Math.floor(region.y * scaleFactor);
      const scaledWidth = Math.floor(region.width * scaleFactor);
      const scaledHeight = Math.floor(region.height * scaleFactor);
      
      // 영역이 이미지를 벗어나지 않도록 보정
      const safeX = Math.max(0, Math.min(scaledX, actualWidth - 1));
      const safeY = Math.max(0, Math.min(scaledY, actualHeight - 1));
      const safeWidth = Math.min(scaledWidth, actualWidth - safeX);
      const safeHeight = Math.min(scaledHeight, actualHeight - safeY);
      
      const croppedImage = await sharp(fullImage)
        .extract({
          left: safeX,
          top: safeY,
          width: safeWidth,
          height: safeHeight
        })
        .png({ quality: 100, compressionLevel: 0 })
        .toBuffer();

      return croppedImage;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to get sources')) {
        throw new Error('Screen recording permission required. Please enable it in System Preferences > Privacy & Security > Screen Recording, then restart the app.');
      }
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async pressRightArrow(): Promise<void> {
    const platform = process.platform;
    
    try {
      if (platform === 'darwin') {
        await execAsync(`osascript -e 'tell application "System Events" to key code 124'`);
      } else if (platform === 'win32') {
        await execAsync(`powershell -command "$wsh = New-Object -ComObject WScript.Shell; $wsh.SendKeys('{RIGHT}')"`);
      } else {
        await execAsync('xdotool key Right');
      }
    } catch (error) {
      console.error('Key press error:', error);
      throw new Error('Failed to send keyboard input. Please check permissions.');
    }
  }

  async capturePages(
    settings: CaptureSettings,
    onProgress: (progress: CaptureProgress) => void
  ): Promise<string[]> {
    await this.ensureImagesDir();
    this.capturedImages = [];

    const region = this.getCaptureRegion(settings);

    for (let i = 1; i <= settings.totalPages; i++) {
      onProgress({
        current: i,
        total: settings.totalPages,
        status: 'capturing',
        message: `Capturing page ${i}/${settings.totalPages}...`
      });

      await this.sleep(settings.captureSpeed);

      const imageBuffer = await this.captureScreen(region);
      const imagePath = path.join(
        this.imagesDir,
        `img_${String(i).padStart(4, '0')}.png`
      );
      
      await fs.writeFile(imagePath, imageBuffer);
      this.capturedImages.push(imagePath);

      if (i < settings.totalPages) {
        await this.pressRightArrow();
      }
    }

    return this.capturedImages;
  }

  async cleanup(): Promise<void> {
    try {
      await fs.rm(this.imagesDir, { recursive: true, force: true });
      this.capturedImages = [];
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}
