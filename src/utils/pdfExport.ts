import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { CVData } from '../types';

export interface PDFExportOptions {
  fileName?: string;
  onProgress?: (status: string) => void;
}

/**
 * Downloads a rendered CV element as a high-resolution, multi-page capable PDF file.
 * Uses html-to-image to natively support modern CSS (oklch, color-mix, custom properties) and Tailwind v4.
 */
export async function downloadCVAsPDF(
  elementOrId: HTMLElement | string,
  options?: PDFExportOptions
): Promise<void> {
  const { onProgress, fileName } = options || {};

  try {
    if (onProgress) onProgress('CV məlumatları oxunur...');

    let targetElement: HTMLElement | null = null;
    if (typeof elementOrId === 'string') {
      targetElement = document.getElementById(elementOrId);
      if (!targetElement) {
        targetElement = document.querySelector(`[id="${elementOrId}"]`) || 
                        document.querySelector('#cv-document-export') ||
                        document.querySelector('#modal-submitted-cv-export') ||
                        document.querySelector('#applicant-cv-export');
      }
    } else {
      targetElement = elementOrId;
    }

    if (!targetElement) {
      throw new Error('Çap ediləcək CV sənədi tapılmadı.');
    }

    if (onProgress) onProgress('Səhifə qrafikası hazırlanır...');

    // Small delay to ensure all DOM elements and fonts settle
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Render using html-to-image toCanvas (natively supports oklch, lab, modern CSS)
    let canvas: HTMLCanvasElement;
    try {
      canvas = await htmlToImage.toCanvas(targetElement, {
        pixelRatio: 2, // 300 DPI equivalent for crisp text
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
        style: {
          boxShadow: 'none',
          margin: '0 auto',
          transform: 'none',
        },
      });
    } catch (renderError) {
      console.warn('html-to-image toCanvas failed, attempting toPng fallback:', renderError);
      const dataUrl = await htmlToImage.toPng(targetElement, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
      });

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = dataUrl;
      });

      canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
    }

    if (onProgress) onProgress('PDF sənədi tərtib edilir...');

    // A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210; // A4 width mm
    const pageHeight = 297; // A4 height mm
    const margin = 5; // 5mm margin
    const contentWidth = pageWidth - margin * 2; // 200mm
    const contentHeight = pageHeight - margin * 2; // 287mm

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate slice height in canvas pixels corresponding to one A4 content page in mm
    const pxSliceHeight = Math.floor((canvasWidth * contentHeight) / contentWidth);

    let renderedHeight = 0;
    let pageIndex = 0;

    while (renderedHeight < canvasHeight) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      const currentSliceHeight = Math.min(pxSliceHeight, canvasHeight - renderedHeight);

      // Create slice canvas for clean multi-page split
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvasWidth;
      pageCanvas.height = currentSliceHeight;
      const ctx = pageCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, currentSliceHeight);
        ctx.drawImage(
          canvas,
          0,
          renderedHeight,
          canvasWidth,
          currentSliceHeight,
          0,
          0,
          canvasWidth,
          currentSliceHeight
        );

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
        const renderedPdfHeight = (currentSliceHeight * contentWidth) / canvasWidth;

        pdf.addImage(
          pageImgData,
          'JPEG',
          margin,
          margin,
          contentWidth,
          renderedPdfHeight,
          undefined,
          'FAST'
        );
      }

      renderedHeight += currentSliceHeight;
      pageIndex++;
    }

    if (onProgress) onProgress('PDF faylı kompüterə yüklənir...');

    const rawFileName = fileName || 'CV_jobia_az.pdf';
    const safeFileName = rawFileName.endsWith('.pdf') ? rawFileName : `${rawFileName}.pdf`;

    // Multi-tier direct download
    let downloadSucceeded = false;

    // Tier 1: Blob URL direct click
    try {
      const blob = pdf.output('blob');
      const blobUrl = window.URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = safeFileName;
      downloadLink.rel = 'noopener';
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);

      downloadLink.click();
      downloadSucceeded = true;

      setTimeout(() => {
        if (downloadLink.parentNode) {
          document.body.removeChild(downloadLink);
        }
        window.URL.revokeObjectURL(blobUrl);
      }, 10000);
    } catch (blobErr) {
      console.warn('Blob URL trigger failed, falling back to jsPDF save:', blobErr);
    }

    // Tier 2: jsPDF built-in save method
    if (!downloadSucceeded) {
      try {
        pdf.save(safeFileName);
        downloadSucceeded = true;
      } catch (saveErr) {
        console.warn('jsPDF save failed, falling back to data URI:', saveErr);
      }
    }

    // Tier 3: Data URI download trigger
    if (!downloadSucceeded) {
      try {
        const dataUri = pdf.output('datauristring');
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = safeFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        downloadSucceeded = true;
      } catch (uriErr) {
        console.error('All automated PDF download methods failed:', uriErr);
        window.print();
      }
    }

    if (onProgress) onProgress('Uğurla tamamlandı!');
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

/**
 * Generates a clean default file name for candidate's CV
 */
export function generateCVFileName(cvData: CVData): string {
  const name = cvData.personalInfo?.fullName
    ? cvData.personalInfo.fullName.trim().replace(/\s+/g, '_')
    : 'Namized';
  const role = cvData.personalInfo?.jobTitle
    ? `_${cvData.personalInfo.jobTitle.trim().replace(/[\s\/\\]+/g, '_')}`
    : '';
  return `CV_${name}${role}_jobia.pdf`;
}
