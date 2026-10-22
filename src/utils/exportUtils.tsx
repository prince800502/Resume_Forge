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
  // Use CONTENT_WIDTH_PX to match TemplateRenderer's consistent 174mm width
  const container = document.createElement('div');
  container.className = 'resume-export-container';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${CONTENT_WIDTH_PX}px`; // Match TemplateRenderer's 174mm content width
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
  // TemplateRenderer will render at 174mm width (CONTENT_WIDTH_PX)
  const contentDiv = document.createElement('div');
  contentDiv.id = 'resume-export-content';
  contentDiv.style.width = '100%'; // Full width of container
  contentDiv.style.minHeight = `${CONTENT_HEIGHT_PX}px`; // At least one page
  contentDiv.style.boxSizing = 'border-box';
  contentDiv.style.padding = '0';

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
 * Forces correct layout styles on the source DOM before capture.
 * This ensures the source DOM has the correct layout (as if viewport = container width),
 * since Tailwind responsive classes are viewport-based, not container-based.
 */
function forceCorrectLayoutStyles(sourceRoot: HTMLElement): void {
  const layoutSelectors = [
    // Main grid containers
    { selector: '[data-template="classic-executive"] > div.grid', description: 'Main grid' },
    { selector: '.classic-executive-template > div.grid', description: 'Main grid (alt)' },
    // Sidebar
    { selector: 'aside', description: 'Sidebar' },
    // Experience/education title/date rows
    { selector: '[data-section="experience"] .flex', description: 'Experience flex rows' },
    { selector: '[data-section="education"] .flex', description: 'Education flex rows' },
    { selector: '[data-section="certifications"] .flex', description: 'Certifications flex rows' },
    // Skills grid
    { selector: '[data-section="skills"] .grid', description: 'Skills grid' },
  ];

  for (const { selector } of layoutSelectors) {
    try {
      const elements = sourceRoot.querySelectorAll(selector);
      
      for (const el of elements) {
        const htmlEl = el as HTMLElement;
        if (!htmlEl) continue;
        
        // Force critical layout properties that should apply at container width (658px = sm: breakpoint)
        const style = htmlEl.style;
        
        // For grid containers: force grid display and columns
        if (selector.includes('.grid')) {
          style.setProperty('display', 'grid', 'important');
          style.setProperty('grid-template-columns', 'minmax(0, 1.7fr) minmax(190px, 0.85fr)', 'important');
          style.setProperty('column-gap', '2rem', 'important'); // gap-x-8
        }
        
        // For sidebar: force border and padding
        if (selector === 'aside') {
          style.setProperty('border-left-width', '1px', 'important');
          style.setProperty('border-left-style', 'solid', 'important');
          style.setProperty('padding-left', '1.5rem', 'important'); // pl-6
        }
        
        // For flex rows (experience/education/certifications): force row direction
        if (selector.includes('.flex')) {
          style.setProperty('display', 'flex', 'important');
          style.setProperty('flex-direction', 'row', 'important');
          style.setProperty('justify-content', 'space-between', 'important');
        }
      }
    } catch (e) {
      // Ignore selector errors
    }
  }
}

/**
 * Applies computed layout styles to key elements in the cloned document.
 * This preserves layout from Tailwind responsive classes that don't work in the cloned document.
 */
function applyComputedLayoutStyles(
  sourceRoot: HTMLElement,
  clonedRoot: HTMLElement
): void {
  // First, force correct styles on source (so they're captured correctly)
  forceCorrectLayoutStyles(sourceRoot);
  
  const layoutSelectors = [
    // Main grid containers
    { selector: '[data-template="classic-executive"] > div.grid', description: 'Main grid' },
    { selector: '.classic-executive-template > div.grid', description: 'Main grid (alt)' },
    // Sidebar
    { selector: 'aside', description: 'Sidebar' },
    // Experience/education title/date rows
    { selector: '[data-section="experience"] .flex', description: 'Experience flex rows' },
    { selector: '[data-section="education"] .flex', description: 'Education flex rows' },
    { selector: '[data-section="certifications"] .flex', description: 'Certifications flex rows' },
    // Skills grid
    { selector: '[data-section="skills"] .grid', description: 'Skills grid' },
  ];

  for (const { selector } of layoutSelectors) {
    try {
      const sourceElements = sourceRoot.querySelectorAll(selector);
      const clonedElements = clonedRoot.querySelectorAll(selector);
      
      if (sourceElements.length === 0) continue;
      
      for (let i = 0; i < sourceElements.length && i < clonedElements.length; i++) {
        const sourceEl = sourceElements[i] as HTMLElement;
        const clonedEl = clonedElements[i] as HTMLElement;
        
        if (!sourceEl || !clonedEl) continue;
        
        const computedStyle = window.getComputedStyle(sourceEl);
        
        // Copy critical layout properties
        const criticalProps = [
          'display',
          'gridTemplateColumns',
          'gridTemplateRows',
          'flexDirection',
          'flexWrap',
          'justifyContent',
          'alignItems',
          'width',
          'minWidth',
          'maxWidth',
          'paddingLeft',
          'paddingRight',
          'borderLeftWidth',
          'borderLeftStyle',
          'borderLeftColor',
        ];
        
        criticalProps.forEach(prop => {
          const value = computedStyle.getPropertyValue(prop);
          if (value && value !== 'initial' && value !== 'normal' && value !== 'none' && value !== '0px') {
            try {
              clonedEl.style.setProperty(prop, value, 'important');
            } catch (e) {
              // Ignore
            }
          }
        });
      }
    } catch (e) {
      // Ignore selector errors
    }
  }
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

  // FORCE CORRECT LAYOUT on source DOM before capture
  // This ensures the source DOM has correct layout (sm: breakpoint styles)
  // since Tailwind responsive classes are viewport-based, not container-based
  forceCorrectLayoutStyles(resumePreview);

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

      // TARGETED: Apply computed styles to key layout elements that depend on responsive breakpoints
      // This is more reliable than generic element-by-index copying
      applyComputedLayoutStyles(resumePreview, clonedResume);

      // INSPECT CLONED DOM AFTER STYLES APPLIED
      const clonedMainGrid = clonedResume.querySelector('[data-template="classic-executive"] > div.grid') as HTMLElement | null;
      if (clonedMainGrid) {
        const gridStyle = clonedDocument.defaultView?.getComputedStyle(clonedMainGrid);
        console.log('[EXPORT DEBUG] CLONED main grid:', {
          display: gridStyle?.display,
          gridTemplateColumns: gridStyle?.gridTemplateColumns,
          className: clonedMainGrid.className
        });
      }
      
      const clonedSidebar = clonedResume.querySelector('aside') as HTMLElement | null;
      if (clonedSidebar) {
        const sideStyle = clonedDocument.defaultView?.getComputedStyle(clonedSidebar);
        console.log('[EXPORT DEBUG] CLONED sidebar:', {
          display: sideStyle?.display,
          borderLeftWidth: sideStyle?.borderLeftWidth,
          paddingLeft: sideStyle?.paddingLeft,
          className: clonedSidebar.className
        });
      } else {
        console.log('[EXPORT DEBUG] CLONED sidebar: NOT FOUND');
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