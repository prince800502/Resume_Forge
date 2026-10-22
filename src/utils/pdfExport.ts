import { jsPDF } from 'jspdf';
import { ResumeData } from '@/types';
import html2canvas from 'html2canvas';
import {
  createExportContainer,
  renderResumeToContainer,
  waitForExportReady,
  cleanupExportContainer,
  captureResumeForExport,
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

  console.log('[PDF EXPORT DEBUG] Starting export for template:', templateId);
  console.log('[PDF EXPORT DEBUG] Content width constants:', { CONTENT_WIDTH_MM, CONTENT_WIDTH_PX, CONTENT_HEIGHT_PX });

  // Create export container and render resume
  const { container, contentDiv, root } = createExportContainer(colors);
  
  console.log('[PDF EXPORT DEBUG] Container created:', { 
    containerWidth: container.style.width,
    contentDivWidth: contentDiv.style.width,
    contentDivMinHeight: contentDiv.style.minHeight
  });

  try {
    renderResumeToContainer(root, resumeData, templateId, colors);
    console.log('[PDF EXPORT DEBUG] Template rendered to container');
    
    document.body.appendChild(container);

    // Wait for rendering to complete
    options.onProgress?.('Preparing resume...', 10);
    await waitForExportReady(contentDiv);

    // INSPECT SOURCE DOM BEFORE CAPTURE
    const sourceResumePreview = contentDiv.querySelector('.resume-preview') as HTMLElement | null;
    if (sourceResumePreview) {
      const rect = sourceResumePreview.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(sourceResumePreview);
      console.log('[PDF EXPORT DEBUG] SOURCE .resume-preview:', {
        width: rect.width,
        height: rect.height,
        display: computedStyle.display,
        gridTemplateColumns: computedStyle.gridTemplateColumns,
        widthStyle: sourceResumePreview.style.width
      });
      
      // Check main grid
      const mainGrid = sourceResumePreview.querySelector('[data-template="classic-executive"] > div.grid') as HTMLElement | null;
      if (mainGrid) {
        const gridRect = mainGrid.getBoundingClientRect();
        const gridStyle = window.getComputedStyle(mainGrid);
        console.log('[PDF EXPORT DEBUG] SOURCE main grid:', {
          width: gridRect.width,
          height: gridRect.height,
          display: gridStyle.display,
          gridTemplateColumns: gridStyle.gridTemplateColumns,
          className: mainGrid.className
        });
      }
      
      // Check sidebar
      const sidebar = sourceResumePreview.querySelector('aside') as HTMLElement | null;
      if (sidebar) {
        const sideRect = sidebar.getBoundingClientRect();
        const sideStyle = window.getComputedStyle(sidebar);
        console.log('[PDF EXPORT DEBUG] SOURCE sidebar:', {
          width: sideRect.width,
          height: sideRect.height,
          display: sideStyle.display,
          borderLeftWidth: sideStyle.borderLeftWidth,
          paddingLeft: sideStyle.paddingLeft,
          className: sidebar.className
        });
      } else {
        console.log('[PDF EXPORT DEBUG] SOURCE sidebar: NOT FOUND');
      }
      
      // Check experience date row
      const expRow = sourceResumePreview.querySelector('[data-section="experience"] .flex') as HTMLElement | null;
      if (expRow) {
        const rowStyle = window.getComputedStyle(expRow);
        console.log('[PDF EXPORT DEBUG] SOURCE experience row:', {
          display: rowStyle.display,
          flexDirection: rowStyle.flexDirection,
          justifyContent: rowStyle.justifyContent,
          className: expRow.className
        });
      }
    }

    // Capture the entire resume at high resolution once
    options.onProgress?.('Rendering high-resolution image...', 30);
    const { canvas, contentHeightPx, contentWidthPx } = await captureResumeForExport(contentDiv, colors);

    console.log('[PDF EXPORT DEBUG] Canvas captured:', { 
      canvasWidth: canvas.width, 
      canvasHeight: canvas.height,
      contentWidthPx,
      contentHeightPx
    });

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