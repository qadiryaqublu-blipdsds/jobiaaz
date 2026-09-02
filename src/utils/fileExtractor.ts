/**
 * Utility functions for reading and parsing uploaded CV documents
 * (PDF, DOCX, TXT, Images) on the client side.
 */

export interface UploadedFileInfo {
  file: File;
  fileName: string;
  fileSizeFormatted: string;
  fileType: string;
  base64Data?: string;
  extractedText?: string;
  previewUrl?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(file);
  });
}

export async function processUploadedCVFile(file: File): Promise<UploadedFileInfo> {
  const fileType = file.type || '';
  const fileName = file.name;
  const fileSizeFormatted = formatFileSize(file.size);

  let base64Data: string | undefined;
  let extractedText: string | undefined;
  let previewUrl: string | undefined;

  // Plain text or markdown
  if (fileType.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    try {
      extractedText = await readFileAsText(file);
    } catch {
      // ignore
    }
  }

  // Always generate Base64 for PDF and Images for multimodal AI
  try {
    base64Data = await readFileAsBase64(file);
    if (fileType.startsWith('image/')) {
      previewUrl = base64Data;
    }
  } catch {
    // ignore
  }

  return {
    file,
    fileName,
    fileSizeFormatted,
    fileType: fileType || (fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
    base64Data,
    extractedText,
    previewUrl,
  };
}
