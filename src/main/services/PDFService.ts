import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

export class PDFService {
  async createPDF(imagePaths: string[], fileName: string, savePath?: string): Promise<void> {
    if (imagePaths.length === 0) {
      throw new Error('No images to convert.');
    }

    const firstImageInfo = await sharp(imagePaths[0]).metadata();
    const imageWidth = firstImageInfo.width || 595;
    const imageHeight = firstImageInfo.height || 842;

    const outputDir = savePath || process.cwd();
    const pdfPath = path.join(outputDir, `${fileName}.pdf`);
    
    const doc = new PDFDocument({
      size: [imageWidth, imageHeight],
      autoFirstPage: false
    });

    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    for (const imagePath of imagePaths) {
      doc.addPage({ size: [imageWidth, imageHeight] });
      doc.image(imagePath, 0, 0, {
        width: imageWidth,
        height: imageHeight
      });
    }

    doc.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
    });
  }
}
