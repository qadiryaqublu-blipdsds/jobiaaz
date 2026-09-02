import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { JobOffer } from '../types';

export interface OfferPDFOptions {
  fileName?: string;
  onProgress?: (status: string) => void;
}

/**
 * Downloads a rendered Job Offer element as a crisp, corporate A4 PDF file.
 */
export async function downloadJobOfferPDF(
  elementOrId: HTMLElement | string,
  offer: JobOffer,
  options?: OfferPDFOptions
): Promise<void> {
  const { onProgress, fileName } = options || {};

  try {
    if (onProgress) onProgress('İş təklifi sənədi oxunur...');

    let targetElement: HTMLElement | null = null;
    if (typeof elementOrId === 'string') {
      targetElement = document.getElementById(elementOrId);
      if (!targetElement) {
        targetElement = document.querySelector(`[id="${elementOrId}"]`) ||
                        document.querySelector('#job-offer-document-render') ||
                        document.querySelector('#candidate-offer-doc');
      }
    } else {
      targetElement = elementOrId;
    }

    if (!targetElement) {
      throw new Error('İş təklifi sənədinin DOM elementi tapılmadı.');
    }

    if (onProgress) onProgress('Korporativ sənəd qrafikası hazırlanır...');

    // Wait for fonts & layout settling
    await new Promise((resolve) => setTimeout(resolve, 150));

    let canvas: HTMLCanvasElement;
    try {
      canvas = await htmlToImage.toCanvas(targetElement, {
        pixelRatio: 2,
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
      console.warn('toCanvas failed, falling back to toPng:', renderError);
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

    if (onProgress) onProgress('A4 PDF sənədi tərtib edilir...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 5;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const pxSliceHeight = Math.floor((canvasWidth * contentHeight) / contentWidth);

    let renderedHeight = 0;
    let pageIndex = 0;

    while (renderedHeight < canvasHeight) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      const currentSliceHeight = Math.min(pxSliceHeight, canvasHeight - renderedHeight);

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

    if (onProgress) onProgress('PDF faylı endirilir...');

    const safeCandidateName = (offer.candidateName || 'Candidate').trim().replace(/[\s\/\\]+/g, '_');
    const safePosition = (offer.position || 'Offer').trim().replace(/[\s\/\\]+/g, '_');
    const defaultFileName = `Job_Offer_${safeCandidateName}_${safePosition}.pdf`;
    const targetFileName = fileName || defaultFileName;
    const finalFileName = targetFileName.endsWith('.pdf') ? targetFileName : `${targetFileName}.pdf`;

    let downloadSucceeded = false;

    // Method 1: Blob URL
    try {
      const blob = pdf.output('blob');
      const blobUrl = window.URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = finalFileName;
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
    } catch (e) {
      console.warn('Blob URL download failed, falling back to jsPDF.save:', e);
    }

    // Method 2: jsPDF save
    if (!downloadSucceeded) {
      try {
        pdf.save(finalFileName);
        downloadSucceeded = true;
      } catch (e) {
        console.warn('jsPDF save failed:', e);
      }
    }

    // Method 3: window.print
    if (!downloadSucceeded) {
      window.print();
    }

    if (onProgress) onProgress('Uğurla tamamlandı!');
  } catch (error) {
    console.error('Job Offer PDF Generation Error:', error);
    throw error;
  }
}
