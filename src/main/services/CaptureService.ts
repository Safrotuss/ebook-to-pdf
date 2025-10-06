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
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: screen.getPrimaryDisplay().workAreaSize
    });

    if (sources.length === 0) {
      throw new Error('화면을 캡처할 수 없습니다.');
    }

    const fullImage = sources[0].thumbnail.toPNG();
    
    const croppedImage = await sharp(fullImage)
      .extract({
        left: Math.floor(region.x),
        top: Math.floor(region.y),
        width: Math.floor(region.width),
        height: Math.floor(region.height)
      })
      .png()
      .toBuffer();

    return croppedImage;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async pressRightArrow(): Promise<void> {
    const platform = process.platform;
    
    try {
      if (platform === 'darwin') {
        // macOS: AppleScript 사용
        await execAsync(`osascript -e 'tell application "System Events" to key code 124'`);
      } else if (platform === 'win32') {
        // Windows: PowerShell 사용
        await execAsync(`powershell -command "$wsh = New-Object -ComObject WScript.Shell; $wsh.SendKeys('{RIGHT}')"`);
      } else {
        // Linux: xdotool 사용 (설치 필요)
        await execAsync('xdotool key Right');
      }
    } catch (error) {
      console.error('키 입력 오류:', error);
      throw new Error('키 입력에 실패했습니다. 권한을 확인해주세요.');
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
        message: `페이지 ${i}/${settings.totalPages} 캡처 중...`
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
