import { ResumeData } from '@/types';
import {
  captureResumeForExport,
  createExportContainer,
  renderResumeToContainer,
  waitForExportReady,
  cleanupExportContainer,
  getSafeFileName,
  ExportColors,
  CONTENT_WIDTH_PX,
  CAPTURE_SCALE,
} from './exportUtils.tsx';

export interface PngExportOptions {
  templateId?: string;
  colors?: ExportColors;
  fileName?: string;
  onProgress?: (stage: string, progress: number) => void;
  /** Target DPI for output (default: 300 for print quality) */
  targetDpi?: number;
}

export async function exportResumeToPng(
  resumeData: ResumeData,
  options: PngExportOptions = {}
): Promise<Blob> {
  const { templateId = 'modern-1', colors, fileName, targetDpi = 300 } = options;

  if (!colors) {
    throw new Error('Colors are required for PNG export');
  }

  // Create export container and render resume
  const { container, contentDiv, root } = createExportContainer(colors);
  
  try {
    renderResumeToContainer(root, resumeData, templateId, colors);
    document.body.appendChild(container);

    // Wait for rendering to complete
    options.onProgress?.('Preparing resume...', 10);
    await waitForExportReady(contentDiv);

    // Capture at high resolution
    options.onProgress?.('Rendering high-resolution image...', 50);
    const { canvas, contentHeightPx, contentWidthPx } = await captureResumeForExport(contentDiv, colors);

    options.onProgress?.('Optimizing image...', 80);

    // The canvas is already at high resolution (CAPTURE_SCALE * CSS px)
    // For a clean PNG, we may want to crop to exact content bounds
    // to remove any extra whitespace at the bottom
    
    // Find the actual content bottom by scanning for non-transparent pixels
    const croppedCanvas = cropCanvasToContent(canvas, contentWidthPx);
    
    options.onProgress?.('Generating PNG...', 90);

    // Convert to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      croppedCanvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 1.0);
    });

    if (!blob) {
      throw new Error('Failed to create PNG blob');
    }

    options.onProgress?.('Complete', 100);
    return blob;
  } finally {
    cleanupExportContainer(container, root);
  }
}

/**
 * Crops the canvas to the actual content height, removing excess whitespace at the bottom.
 * Keeps the full width but finds the last non-transparent row.
 */
function cropCanvasToContent(canvas: HTMLCanvasElement, contentWidthCssPx: number): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Scan from bottom up to find last row with visible content
  // Sample every few pixels for performance
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const width = canvas.width;
  const height = canvas.height;
  
  let lastContentY = height - 1;
  const sampleStep = Math.max(1, Math.floor(width / 100)); // Sample ~100 columns
  
  for (let y = height - 1; y >= 0; y--) {
    let hasContent = false;
    for (let x = 0; x < width; x += sampleStep) {
      const idx = (y * width + x) * 4 + 3; // Alpha channel
      if (pixels[idx] > 10) { // Threshold for "visible"
        hasContent = true;
        break;
      }
    }
    if (hasContent) {
      lastContentY = y;
      break;
    }
  }

  // Add a small padding at bottom (equivalent to ~10mm in CSS px at capture scale)
  const bottomPaddingPx = Math.round(10 / 25.4 * 96 * (canvas.width / contentWidthCssPx));
  const cropHeight = Math.min(height, lastContentY + 1 + bottomPaddingPx);

  // If crop height is nearly the full height, don't bother cropping
  if (cropHeight > height * 0.95) {
    return canvas;
  }

  // Create cropped canvas
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = width;
  croppedCanvas.height = cropHeight;
  const croppedCtx = croppedCanvas.getContext('2d')!;
  croppedCtx.drawImage(canvas, 0, 0, width, cropHeight, 0, 0, width, cropHeight);

  console.log('[PNG Export] Cropped canvas:', { originalHeight: height, croppedHeight: cropHeight });
  return croppedCanvas;
}

/**
 * Convenience function to trigger PNG download.
 */
export async function downloadResumeAsPng(
  resumeData: ResumeData,
  title: string,
  options: PngExportOptions = {}
): Promise<void> {
  const blob = await exportResumeToPng(resumeData, {
    ...options,
    fileName: options.fileName || getSafeFileName(title, 'png'),
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = options.fileName || getSafeFileName(title, 'png');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}