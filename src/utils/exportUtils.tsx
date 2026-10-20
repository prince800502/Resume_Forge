import { ResumeData } from '@/types';
import { TemplateRenderer } from '@/components/resume-templates/TemplateRenderer';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';

// ============================================================================
// CONSTANTS - Professional Print Dimensions
// ============================================================================

// A4 dimensions in mm
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

// Standard print DPI for high-quality output
export const PRINT_DPI = 300;
export const CSS_DPI = 96; // CSS pixels per inch

// A4 dimensions in CSS pixels (at 96 DPI)
export const A4_WIDTH_PX = Math.round(A4_WIDTH_MM / 25.4 * CSS_DPI); // 794px
export const A4_HEIGHT_PX = Math.round(A4_HEIGHT_MM / 25.4 * CSS_DPI); // 1123px

// Professional margins (mm)
export const MARGIN_TOP_MM = 20;
export const MARGIN_BOTTOM_MM = 20;
export const MARGIN_LEFT_MM = 18;
export const MARGIN_RIGHT_MM = 18;

// Content area dimensions (mm)
export const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_LEFT_MM - MARGIN_RIGHT_MM; // 174mm
export const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - MARGIN_TOP_MM - MARGIN_BOTTOM_MM; // 257mm

// Content area in CSS pixels
export const CONTENT_WIDTH_PX = Math.round(CONTENT_WIDTH_MM / 25.4 * CSS_DPI); // ~658px
export const CONTENT_HEIGHT_PX = Math.round(CONTENT_HEIGHT_MM / 25.4 * CSS_DPI); // ~972px

// High-resolution capture scale (for 300 DPI output from 96 DPI CSS)
// 300/96 ≈ 3.125, use 3.2 for safety
export const CAPTURE_SCALE = 3.2;

// High-res content dimensions in pixels (for capture)
export const HR_CONTENT_WIDTH_PX = Math.round(CONTENT_WIDTH_PX * CAPTURE_SCALE);
export const HR_CONTENT_HEIGHT_PX = Math.round(CONTENT_HEIGHT_PX * CAPTURE_SCALE);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ExportColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  heading: string;
}

export interface RenderedResume {
  canvas: HTMLCanvasElement;
  contentHeightPx: number; // Actual content height in CSS pixels
  pageCount: number;
  contentWidthPx: number;
}

// ============================================================================
// SHARED RENDERING LOGIC
// ============================================================================

/**
 * Creates an off-screen export container with exact A4 content dimensions.
 * This replaces the ad-hoc container in ResumeBuilderPage.
 */
export function createExportContainer(colors: ExportColors): {
  container: HTMLDivElement;
  contentDiv: HTMLDivElement;
  root: ReturnType<typeof createRoot>;
} {
  // Outer container - positioned off-screen but visible
  const container = document.createElement('div');
  container.className = 'resume-export-container';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${A4_WIDTH_PX}px`; // Full A4 width in CSS px
  container.style.height = 'auto';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '0';
  container.style.overflow = 'visible';
  container.style.backgroundColor = colors.background;
  container.style.color = colors.text;
  container.style.boxSizing = 'border-box';

  // Apply CSS variables that templates depend on
  const cssVars = {
    '--foreground': colors.text,
    '--muted-foreground': colors.secondary,
    '--background': colors.background,
    '--card': colors.background,
    '--primary': colors.primary,
    '--accent': colors.accent,
    '--heading': colors.heading,
  };
  Object.entries(cssVars).forEach(([key, value]) => {
    container.style.setProperty(key, value, 'important');
  });

  // Inner content div - this is what TemplateRenderer renders into
  // IMPORTANT: This div represents the PRINTABLE CONTENT AREA (inside margins)
  const contentDiv = document.createElement('div');
  contentDiv.id = 'resume-export-content';
  contentDiv.style.width = `${CONTENT_WIDTH_PX}px`; // Exact content width
  contentDiv.style.minHeight = `${CONTENT_HEIGHT_PX}px`; // At least one page
  contentDiv.style.boxSizing = 'border-box';
  contentDiv.style.padding = '0'; // No extra padding - TemplateRenderer handles it
  contentDiv.style.margin = '0 auto'; // Center horizontally

  container.appendChild(contentDiv);

  // Render TemplateRenderer directly into contentDiv with isFullPreview=true
  // TemplateRenderer will create .resume-preview with its own internal padding
  const root = createRoot(contentDiv);
  // Note: The actual template rendering happens after this function returns
  // The caller must call root.render() with the TemplateRenderer

  return { container, contentDiv, root };
}

/**
 * Renders the resume template into the export container.
 * Must be called after createExportContainer.
 */
export function renderResumeToContainer(
  root: ReturnType<typeof createRoot>,
  data: ResumeData,
  templateId: string,
  colors: ExportColors
): void {
  root.render(
    <TemplateRenderer
      data={data}
      templateId={templateId}
      colors={colors}
      isFullPreview={true}
      isExport={true}
    />
  );
}

/**
 * Waits for fonts, images, and layout to stabilize.
 */
export async function waitForExportReady(contentDiv: HTMLDivElement): Promise<void> {
  // Wait for fonts to load
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  // Wait for React to finish rendering and browser to complete layout
  await new Promise<void>(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        queueMicrotask(() => resolve());
      });
    });
  });

  // Wait for images to load
  const images = contentDiv.querySelectorAll('img');
  if (images.length > 0) {
    const promises: Promise<void>[] = [];
    for (const img of images) {
      if (img.complete) continue;
      promises.push(new Promise<void>(resolve => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Don't fail on image errors
      }));
    }
    await Promise.all(promises);
  }

  // Final layout stabilization
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
}

/**
 * Checks if a canvas is blank (all transparent).
 */
export function isCanvasBlank(canvas: HTMLCanvasElement): boolean {
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = Math.min(canvas.width, 100);
  sampleCanvas.height = Math.min(canvas.height, 100);

  const ctx = sampleCanvas.getContext('2d');
  if (!ctx) return false;

  ctx.drawImage(
    canvas,
    0, 0, canvas.width, canvas.height,
    0, 0, sampleCanvas.width, sampleCanvas.height
  );

  const pixels = ctx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
  
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] !== 0) return false;
  }
  return true;
}

/**
 * Captures the resume content at high resolution for print-quality output.
 * Returns the canvas and the actual content height in CSS pixels.
 */
export async function captureResumeForExport(
  contentDiv: HTMLDivElement,
  colors: ExportColors
): Promise<RenderedResume> {
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
  console.log('[Export] Canvas captured:', {
    width: canvas.width,
    height: canvas.height,
    contentWidthPx,
    contentHeightPx,
    scale: CAPTURE_SCALE,
    isBlank: isCanvasBlank(canvas),
  });

  // Retry with foreignObjectRendering if blank
  if (canvas.width === 0 || canvas.height === 0 || isCanvasBlank(canvas)) {
    console.log('[Export] First capture blank, retrying with foreignObjectRendering...');
    canvas = await html2canvas(resumePreview, {
      ...captureOptions,
      foreignObjectRendering: true,
    });
    console.log('[Export] Retry canvas:', {
      width: canvas.width,
      height: canvas.height,
      isBlank: isCanvasBlank(canvas),
    });
  }

  if (canvas.width === 0 || canvas.height === 0 || isCanvasBlank(canvas)) {
    throw new Error('The resume could not be rendered for export - canvas is blank');
  }

  // Calculate how many A4 pages this content spans
  const pageCount = Math.max(1, Math.ceil(contentHeightPx / CONTENT_HEIGHT_PX));

  return {
    canvas,
    contentHeightPx,
    pageCount,
    contentWidthPx,
  };
}

/**
 * Cleans up the export container and React root.
 */
export function cleanupExportContainer(
  container: HTMLDivElement,
  root: ReturnType<typeof createRoot>
): void {
  if (root) {
    root.unmount();
  }
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

/**
 * Generates a safe filename for export.
 */
export function getSafeFileName(title: string, extension: string): string {
  const safeTitle = title
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 100) || 'Resume';
  return `${safeTitle}.${extension}`;
}

/**
 * Triggers a browser download for a blob.
 */
export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}