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
} from './exportUtils.tsx';

export interface PdfExportOptions {
  templateId?: string;
  colors?: ExportColors;
  fileName?: string;
  onProgress?: (stage: string, progress: number) => void;
}

interface SectionInfo {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  heightPx: number;      // CSS pixels
  heightMm: number;      // millimeters on page
  element: HTMLElement;  // DOM element for measurement
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

    // Capture each section separately for intelligent pagination
    options.onProgress?.('Analyzing sections...', 20);
    const sections = await captureSectionsForExport(contentDiv, colors);

    options.onProgress?.('Generating PDF...', 40);

    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // Layout sections on pages with intelligent pagination
    await layoutSectionsOnPages(pdf, sections, colors, options);

    options.onProgress?.('Finalizing PDF...', 95);

    return pdf.output('blob');
  } finally {
    cleanupExportContainer(container, root);
  }
}

/**
 * Captures each resume section as a separate canvas for precise pagination control
 */
async function captureSectionsForExport(
  contentDiv: HTMLDivElement,
  colors: ExportColors
): Promise<SectionInfo[]> {
  const resumePreview = contentDiv.querySelector('.resume-preview') as HTMLElement | null;
  if (!resumePreview) {
    throw new Error('Resume preview element not found in export content');
  }

  // Find all section elements
  const sectionElements = resumePreview.querySelectorAll('section') as NodeListOf<HTMLElement>;
  if (sectionElements.length === 0) {
    // Fallback: capture entire resume as one section
    const canvas = await captureElementAsCanvas(resumePreview, colors);
    const rect = resumePreview.getBoundingClientRect();
    return [{
      id: 'full-resume',
      name: 'Full Resume',
      canvas,
      heightPx: rect.height,
      heightMm: (rect.height / CAPTURE_SCALE) * (25.4 / 96),
      element: resumePreview,
    }];
  }

  const sections: SectionInfo[] = [];

  // Capture header separately
  const header = resumePreview.querySelector('header') as HTMLElement | null;
  if (header) {
    const canvas = await captureElementAsCanvas(header, colors);
    const rect = header.getBoundingClientRect();
    sections.push({
      id: 'header',
      name: 'Header',
      canvas,
      heightPx: rect.height,
      heightMm: (rect.height / CAPTURE_SCALE) * (25.4 / 96),
      element: header,
    });
  }

  // Capture each section
  for (const section of Array.from(sectionElements)) {
    const canvas = await captureElementAsCanvas(section, colors);
    const rect = section.getBoundingClientRect();
    const sectionId = section.getAttribute('data-section') || `section-${sections.length}`;
    const heading = section.querySelector('h2')?.textContent || 'Section';
    
    sections.push({
      id: sectionId,
      name: heading,
      canvas,
      heightPx: rect.height,
      heightMm: (rect.height / CAPTURE_SCALE) * (25.4 / 96),
      element: section,
    });
  }

  return sections;
}

/**
 * Captures a single DOM element as a high-resolution canvas
 */
async function captureElementAsCanvas(
  element: HTMLElement,
  colors: ExportColors
): Promise<HTMLCanvasElement> {
  const rect = element.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);

  if (width <= 0 || height <= 0) {
    // Return a minimal blank canvas
    const blankCanvas = document.createElement('canvas');
    blankCanvas.width = 1;
    blankCanvas.height = 1;
    return blankCanvas;
  }

  // We need to capture this specific element. Use html2canvas with a custom onclone
  // that hides everything except the target element
  const captureOptions = {
    scale: CAPTURE_SCALE,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: colors.background,
    imageTimeout: 15000,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX: 0,
    scrollY: 0,
    onclone: (clonedDocument: Document) => {
      // Find the cloned version of our target element
      const clonedContent = clonedDocument.getElementById('resume-export-content');
      if (!clonedContent) return;

      const clonedPreview = clonedContent.querySelector('.resume-preview') as HTMLElement | null;
      if (!clonedPreview) return;

      // Hide all elements except our target
      const allElements = clonedPreview.querySelectorAll('header, section');
      const headerEl = clonedPreview.querySelector('header');
      allElements.forEach(el => {
        if (el !== element && el !== headerEl) {
          (el as HTMLElement).style.display = 'none';
        }
      });

      // Apply CSS variables
      Object.entries({
        '--foreground': colors.text,
        '--muted-foreground': colors.secondary,
        '--background': colors.background,
        '--card': colors.background,
        '--primary': colors.primary,
        '--accent': colors.accent,
        '--heading': colors.heading,
      }).forEach(([key, value]) => {
        clonedPreview.style.setProperty(key, value, 'important');
      });

      clonedPreview.style.backgroundColor = colors.background;
      clonedPreview.style.color = colors.text;
      clonedPreview.style.transform = 'none';
      clonedPreview.style.opacity = '1';
      clonedPreview.style.visibility = 'visible';
      clonedPreview.style.position = 'relative';
      clonedPreview.style.left = '0';
      clonedPreview.style.top = '0';

      const inner = clonedPreview.firstElementChild as HTMLElement | null;
      if (inner) {
        inner.style.backgroundColor = colors.background;
        inner.style.color = colors.text;
        inner.style.transform = 'none';
        inner.style.opacity = '1';
        inner.style.visibility = 'visible';
      }
    },
  };

  // Use the parent preview element for capture but with our custom onclone
  const resumePreview = element.closest('.resume-preview') as HTMLElement;
  if (!resumePreview) {
    throw new Error('Could not find resume preview parent');
  }

  let canvas = await html2canvas(resumePreview, captureOptions);

  // Crop to the element's bounds
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = width;
  croppedCanvas.height = height;
  const ctx = croppedCanvas.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0, width, height, 0, 0, width, height);

  return croppedCanvas;
}

/**
 * Lays out sections on PDF pages with intelligent pagination
 * - Keeps sections together when they fit
 * - Splits large sections across pages
 * - Avoids stranding headings at page bottoms
 */
async function layoutSectionsOnPages(
  pdf: jsPDF,
  sections: SectionInfo[],
  colors: ExportColors,
  options: PdfExportOptions
): Promise<void> {
  const pageWidth = pdf.internal.pageSize.getWidth();   // 210mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
  const marginX = MARGIN_LEFT_MM;
  const marginY = MARGIN_TOP_MM;
  const usableWidth = CONTENT_WIDTH_MM;  // 174mm
  const usableHeight = CONTENT_HEIGHT_MM; // 257mm

  let currentY = marginY;
  let isFirstPage = true;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sectionHeightMm = section.heightMm;
    const sectionWidthMm = usableWidth;

    // Check if section fits on current page
    const remainingSpace = pageHeight - marginY - currentY;
    const minSectionSpace = 30; // Minimum space needed for a section (heading + some content)

    // If this is a section (not header) and it doesn't fit well, start new page
    if (section.id !== 'header' && !isFirstPage) {
      if (sectionHeightMm > remainingSpace - minSectionSpace) {
        // Check if section is small enough to move entirely to next page
        if (sectionHeightMm <= usableHeight * 0.8) {
          // Move to next page
          pdf.addPage();
          currentY = marginY;
        }
        // Otherwise, let it split naturally (large section that spans pages)
      }
    }

    // Render section
    const imgData = section.canvas.toDataURL('image/png', 1.0);
    
    // Calculate scale: element width in px -> usable width in mm
    const elementWidthPx = section.canvas.width / CAPTURE_SCALE; // CSS pixels
    const scaleX = usableWidth / elementWidthPx;
    const scaleY = scaleX; // Preserve aspect ratio
    
    const renderWidth = usableWidth;
    const renderHeight = sectionHeightMm;

    // Check if we need to split this section across pages
    if (currentY + renderHeight > pageHeight - marginY && renderHeight > usableHeight * 0.5) {
      // Large section that needs splitting - slice the canvas
      await renderSectionSplit(pdf, section, marginX, currentY, renderWidth, scaleY, pageHeight, marginY, usableHeight);
      currentY = marginY; // Reset for next page
      pdf.addPage();
    } else {
      // Fits on current page (or starts new page)
      if (currentY !== marginY || isFirstPage) {
        if (!isFirstPage && currentY === marginY) {
          // Already added page above
        } else if (!isFirstPage && currentY + renderHeight > pageHeight - marginY) {
          pdf.addPage();
          currentY = marginY;
        }
      }
      
      pdf.addImage(imgData, 'PNG', marginX, currentY, renderWidth, renderHeight);
      currentY += renderHeight + 4; // Small gap between sections
      isFirstPage = false;
    }

    options.onProgress?.(`Rendering ${section.name}...`, 40 + (i / sections.length) * 50);
  }
}

/**
 * Renders a large section split across multiple pages
 */
async function renderSectionSplit(
  pdf: jsPDF,
  section: SectionInfo,
  marginX: number,
  startY: number,
  renderWidth: number,
  scaleY: number,
  pageHeight: number,
  marginY: number,
  usableHeight: number
): Promise<void> {
  const canvas = section.canvas;
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  
  // Calculate how many CSS pixels fit per page
  const pxPerPage = usableHeight / scaleY;
  const totalPages = Math.ceil(section.heightPx / pxPerPage);
  
  let currentY = startY;
  let isFirstSlice = true;

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (!isFirstSlice) {
      pdf.addPage();
      currentY = marginY;
    }
    isFirstSlice = false;

    // Source rectangle in canvas pixels (canvas is at CAPTURE_SCALE)
    const sourceY = Math.round(pageIndex * pxPerPage * CAPTURE_SCALE);
    const sourceHeight = Math.min(
      Math.round(pxPerPage * CAPTURE_SCALE),
      canvasHeight - sourceY
    );

    if (sourceHeight <= 0) continue;

    // Create slice canvas
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvasWidth;
    sliceCanvas.height = sourceHeight;
    const sliceCtx = sliceCanvas.getContext('2d')!;
    sliceCtx.drawImage(
      canvas,
      0, sourceY, canvasWidth, sourceHeight,
      0, 0, canvasWidth, sourceHeight
    );

    const sliceImgData = sliceCanvas.toDataURL('image/png', 1.0);
    const sliceRenderHeight = sourceHeight * scaleY;

    pdf.addImage(sliceImgData, 'PNG', marginX, currentY, renderWidth, sliceRenderHeight);
    currentY += sliceRenderHeight;
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