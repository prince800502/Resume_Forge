import { jsPDF } from 'jspdf';
import { ResumeData } from '@/types';
import html2canvas from 'html2canvas';
import {
  createExportContainer,
  renderResumeToContainer,
  waitForExportReady,
  cleanupExportContainer,
  getSafeFileName,
  A4_WIDTH_MM,
  A4_HEIGHT_MM,
  MARGIN_LEFT_MM,
  MARGIN_TOP_MM,
  CONTENT_WIDTH_MM,
  CONTENT_HEIGHT_MM,
  ExportColors,
  CAPTURE_SCALE,
  CONTENT_WIDTH_PX,
  CONTENT_HEIGHT_PX,
} from './exportUtils.tsx';

export interface PdfExportOptions {
  templateId?: string;
  colors?: ExportColors;
  fileName?: string;
  onProgress?: (stage: string, progress: number) => void;
}

export async function exportResumeToPdf(
  resumeData: ResumeData,
  options: PdfExportOptions = {}
): Promise<Blob> {
  const { templateId = 'modern-1', colors, fileName } = options;

  if (!colors) {
    throw new Error('Colors are required for PDF export');
  }

  // Create export container and render resume
  const { container, contentDiv, root } = createExportContainer(colors);
  
  try {
    renderResumeToContainer(root, resumeData, templateId, colors);
    document.body.appendChild(container);

    // Wait for rendering to complete
    options.onProgress?.('Preparing resume...', 10);
    await waitForExportReady(contentDiv);

    // Capture the entire resume at high resolution once
    options.onProgress?.('Rendering high-resolution image...', 30);
    const { canvas, contentHeightPx, contentWidthPx } = await captureResumeForExport(contentDiv, colors);

    options.onProgress?.('Generating PDF...', 60);

    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // Calculate precise scaling: source canvas bitmap pixels -> mm
    // canvas.width = contentWidthPx * CAPTURE_SCALE (bitmap pixels)
    // Target: CONTENT_WIDTH_MM (printable area width in mm)
    const bitmapToMmScale = CONTENT_WIDTH_MM / canvas.width;
    const renderWidth = CONTENT_WIDTH_MM;
    const renderHeight = canvas.height * bitmapToMmScale;

    const pageWidth = pdf.internal.pageSize.getWidth();   // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const marginX = MARGIN_LEFT_MM;
    const marginY = MARGIN_TOP_MM;
    const usableHeight = CONTENT_HEIGHT_MM; // 257mm

    const imgData = canvas.toDataURL('image/png', 1.0);

    // Single-page optimization: if content fits, center it properly
    if (renderHeight <= usableHeight) {
      const x = marginX;
      const y = marginY + (usableHeight - renderHeight) / 2; // Center vertically
      pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight);
    } else {
      // Multi-page: slice the canvas horizontally with proper bitmap-to-mm conversion
      // Calculate how many bitmap pixels fit per page
      const pxPerPageBitmap = Math.round(usableHeight / bitmapToMmScale);
      const totalPages = Math.ceil(canvas.height / pxPerPageBitmap);
      
      let currentY = marginY;
      
      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        if (pageIndex > 0) {
          pdf.addPage();
          currentY = marginY;
        }

        // Source rectangle in canvas pixels (bitmap pixels)
        const sourceY = pageIndex * pxPerPageBitmap;
        const sourceHeight = Math.min(pxPerPageBitmap, canvas.height - sourceY);

        if (sourceHeight <= 0) continue;

        // Create slice canvas
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sourceHeight;
        const sliceCtx = sliceCanvas.getContext('2d')!;
        sliceCtx.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight,
          0, 0, canvas.width, sourceHeight
        );

        const sliceImgData = sliceCanvas.toDataURL('image/png', 1.0);
        
        // Convert sourceHeight (bitmap pixels) to mm using same scale
        const sliceRenderHeight = sourceHeight * (CONTENT_WIDTH_MM / canvas.width);

        // Avoid placing tiny slices at page end (orphaned content)
        const remainingSpace = pageHeight - marginY - currentY;
        if (pageIndex < totalPages - 1 && sliceRenderHeight < 20 && remainingSpace < 40) {
          // Move this slice to next page if it's very small and would leave little space
          pdf.addPage();
          currentY = marginY;
        }

        pdf.addImage(sliceImgData, 'PNG', marginX, currentY, renderWidth, sliceRenderHeight);
        currentY += sliceRenderHeight;
        
        options.onProgress?.(`Writing page ${pageIndex + 1}/${totalPages}...`, 60 + (pageIndex / totalPages) * 35);
      }
    }

    options.onProgress?.('Finalizing PDF...', 95);

    return pdf.output('blob');
  } finally {
    cleanupExportContainer(container, root);
  }
}

/**
 * Captures the resume content at high resolution for print-quality output.
 * Returns the canvas and the actual content height in CSS pixels.
 */
async function captureResumeForExport(
  contentDiv: HTMLDivElement,
  colors: ExportColors
): Promise<{ canvas: HTMLCanvasElement; contentHeightPx: number; contentWidthPx: number }> {
  // Find the .resume-preview element rendered by TemplateRenderer
  const resumePreview = contentDiv.querySelector('.resume-preview') as HTMLElement | null;
  
  if (!resumePreview) {
    throw new Error('Resume preview element not found in export content');
  }

  const rect = resumePreview.getBoundingClientRect();
  
  if (rect.width <= 0 || rect.height <= 0) {
    throw new Error('Resume preview has no visible dimensions');
  }

  // The resumePreview should be exactly CONTENT_WIDTH_PX wide
  // but may be taller (multi-page content)
  const contentWidthPx = Math.ceil(rect.width);
  const contentHeightPx = Math.ceil(rect.height);

  // Capture at high resolution for print quality
  const captureOptions = {
    scale: CAPTURE_SCALE,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: colors.background,
    imageTimeout: 15000,
    width: contentWidthPx,
    height: contentHeightPx,
    windowWidth: contentWidthPx,
    windowHeight: contentHeightPx,
    scrollX: 0,
    scrollY: 0,
    onclone: (clonedDocument: Document) => {
      const clonedContent = clonedDocument.getElementById('resume-export-content');
      if (!clonedContent) return;
      
      const clonedResume = clonedContent.querySelector('.resume-preview') as HTMLElement | null;
      if (!clonedResume) return;

      // Ensure CSS variables are set correctly in the cloned document
      Object.entries({
        '--foreground': colors.text,
        '--muted-foreground': colors.secondary,
        '--background': colors.background,
        '--card': colors.background,
        '--primary': colors.primary,
        '--accent': colors.accent,
        '--heading': colors.heading,
      }).forEach(([key, value]) => {
        clonedResume.style.setProperty(key, value, 'important');
      });

      clonedResume.style.backgroundColor = colors.background;
      clonedResume.style.color = colors.text;
      clonedResume.style.transform = 'none';
      clonedResume.style.opacity = '1';
      clonedResume.style.visibility = 'visible';
      clonedResume.style.position = 'relative';
      clonedResume.style.left = '0';
      clonedResume.style.top = '0';
      clonedResume.style.width = `${contentWidthPx}px`;

      const inner = clonedResume.firstElementChild as HTMLElement | null;
      if (inner) {
        inner.style.backgroundColor = colors.background;
        inner.style.color = colors.text;
        inner.style.transform = 'none';
        inner.style.opacity = '1';
        inner.style.visibility = 'visible';
      }
    },
  };

  let canvas = await html2canvas(resumePreview, captureOptions);

  // Diagnostic logging
  console.log('[PDF Export] Canvas captured:', {
    width: canvas.width,
    height: canvas.height,
    contentWidthPx,
    contentHeightPx,
    scale: CAPTURE_SCALE,
  });

  // Retry with foreignObjectRendering if blank
  if (canvas.width === 0 || canvas.height === 0) {
    console.log('[PDF Export] First capture blank, retrying with foreignObjectRendering...');
    canvas = await html2canvas(resumePreview, {
      ...captureOptions,
      foreignObjectRendering: true,
    });
    console.log('[PDF Export] Retry canvas:', {
      width: canvas.width,
      height: canvas.height,
    });
  }

  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('The resume could not be rendered for export - canvas is blank');
  }

  return { canvas, contentHeightPx, contentWidthPx };
}

/**
 * Convenience function to trigger PDF download.
 */
export async function downloadResumeAsPdf(
  resumeData: ResumeData,
  title: string,
  options: PdfExportOptions = {}
): Promise<void> {
  const blob = await exportResumeToPdf(resumeData, {
    ...options,
    fileName: options.fileName || getSafeFileName(title, 'pdf'),
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = options.fileName || getSafeFileName(title, 'pdf');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}