import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  VerticalAlign,
  PageBreak,
  ExternalHyperlink,
  type IRunOptions,
} from 'docx';
import { ResumeData, PersonalInfo, Experience, Education, Skill, Project, Certification, Language, CustomSection } from '@/types';
import { normalizeColorToHex, parseColorToRgb, createColorObject } from './colorUtils';

// Type aliases for docx enums
type AlignmentTypeValue = typeof AlignmentType[keyof typeof AlignmentType];
type BorderStyleValue = typeof BorderStyle[keyof typeof BorderStyle];

// ============================================================================
// CONSTANTS - Professional DOCX Layout (A4)
// ============================================================================

// A4 dimensions in mm
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// Convert mm to twips (1 mm = 56.693 twips)
const MM_TO_TWIPS = 56.693;

// Page dimensions (in twips)
const PAGE_WIDTH_TWIPS = Math.round(A4_WIDTH_MM * MM_TO_TWIPS);   // 11906 twips
const PAGE_HEIGHT_TWIPS = Math.round(A4_HEIGHT_MM * MM_TO_TWIPS); // 16838 twips

// Professional margins (in twips) - 18mm left/right, 20mm top/bottom
const MARGIN_TOP = Math.round(20 * MM_TO_TWIPS);    // 1134 twips
const MARGIN_BOTTOM = Math.round(20 * MM_TO_TWIPS); // 1134 twips
const MARGIN_LEFT = Math.round(18 * MM_TO_TWIPS);   // 1020 twips
const MARGIN_RIGHT = Math.round(18 * MM_TO_TWIPS);  // 1020 twips

// Content width in twips
const CONTENT_WIDTH = PAGE_WIDTH_TWIPS - MARGIN_LEFT - MARGIN_RIGHT; // ~9866 twips

// Font sizes (in half-points, as required by docx)
const FONT_SIZES = {
  name: 44,           // 22pt
  title: 26,          // 13pt
  contact: 20,        // 10pt
  heading: 28,        // 14pt
  subheading: 24,     // 12pt
  body: 22,           // 11pt
  small: 20,          // 10pt
  tiny: 18,           // 9pt
};

// Spacing (in twips)
const SPACING = {
  xs: 60,    // 3pt
  sm: 120,   // 6pt
  md: 180,   // 9pt
  lg: 240,   // 12pt
  xl: 360,   // 18pt
  xxl: 480,  // 24pt
};

// ============================================================================
// TEMPLATE CONFIGURATIONS
// ============================================================================

interface DocxTemplateConfig {
  fontFamily: string;
  fontFamilyFallback: string;
  headingStyle: {
    uppercase: boolean;
    letterSpacing: number; // in twips (1/20 point)
    borderBottom: boolean;
    alignment: AlignmentTypeValue;
  };
  nameStyle: {
    fontSize: number; // half-points
    bold: boolean;
    alignment: AlignmentTypeValue;
    color: 'heading' | 'primary';
  };
  contactStyle: {
    alignment: AlignmentTypeValue;
    separator: 'bullets' | 'pipes' | 'lines';
    showIcons: boolean;
  };
  sectionOrder: string[];
  useColumns: boolean;
  columnSections: string[];
  headingColorUsage: 'heading' | 'primary' | 'accent';
  accentColorUsage: 'company' | 'dates' | 'both';
  dateFormat: 'short' | 'long';
  bulletStyle: 'disc' | 'dash' | 'arrow';
}

const TEMPLATE_DOCX_CONFIG: Record<string, DocxTemplateConfig> = {
  'modern-1': {
    fontFamily: 'Calibri',
    fontFamilyFallback: 'Arial, sans-serif',
    headingStyle: { uppercase: false, letterSpacing: 0, borderBottom: true, alignment: AlignmentType.LEFT },
    nameStyle: { fontSize: 44, bold: true, alignment: AlignmentType.CENTER, color: 'heading' },
    contactStyle: { alignment: AlignmentType.CENTER, separator: 'bullets', showIcons: false },
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'custom_sections'],
    useColumns: false,
    columnSections: [],
    headingColorUsage: 'heading',
    accentColorUsage: 'both',
    dateFormat: 'short',
    bulletStyle: 'disc',
  },
  'modern-2': {
    fontFamily: 'Calibri',
    fontFamilyFallback: 'Arial, sans-serif',
    headingStyle: { uppercase: false, letterSpacing: 0, borderBottom: true, alignment: AlignmentType.LEFT },
    nameStyle: { fontSize: 44, bold: true, alignment: AlignmentType.CENTER, color: 'heading' },
    contactStyle: { alignment: AlignmentType.CENTER, separator: 'bullets', showIcons: false },
    sectionOrder: ['summary', 'projects', 'experience', 'education', 'skills', 'certifications', 'languages', 'custom_sections'],
    useColumns: false,
    columnSections: [],
    headingColorUsage: 'heading',
    accentColorUsage: 'both',
    dateFormat: 'short',
    bulletStyle: 'disc',
  },
  'classic-1': {
    fontFamily: 'Georgia',
    fontFamilyFallback: '"Times New Roman", serif',
    headingStyle: { uppercase: true, letterSpacing: 100, borderBottom: true, alignment: AlignmentType.LEFT },
    nameStyle: { fontSize: 44, bold: true, alignment: AlignmentType.CENTER, color: 'heading' },
    contactStyle: { alignment: AlignmentType.CENTER, separator: 'pipes', showIcons: false },
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications', 'languages', 'projects', 'custom_sections'],
    useColumns: true,
    columnSections: ['skills', 'certifications', 'languages'],
    headingColorUsage: 'heading',
    accentColorUsage: 'dates',
    dateFormat: 'long',
    bulletStyle: 'disc',
  },
  'creative-1': {
    fontFamily: 'Calibri',
    fontFamilyFallback: 'Arial, sans-serif',
    headingStyle: { uppercase: true, letterSpacing: 100, borderBottom: false, alignment: AlignmentType.LEFT },
    nameStyle: { fontSize: 48, bold: true, alignment: AlignmentType.LEFT, color: 'primary' },
    contactStyle: { alignment: AlignmentType.LEFT, separator: 'lines', showIcons: false },
    sectionOrder: ['summary', 'projects', 'experience', 'education', 'skills', 'certifications', 'languages', 'custom_sections'],
    useColumns: false,
    columnSections: [],
    headingColorUsage: 'heading',
    accentColorUsage: 'both',
    dateFormat: 'short',
    bulletStyle: 'dash',
  },
  'minimal-1': {
    fontFamily: 'Calibri',
    fontFamilyFallback: 'Arial, sans-serif',
    headingStyle: { uppercase: true, letterSpacing: 50, borderBottom: false, alignment: AlignmentType.LEFT },
    nameStyle: { fontSize: 40, bold: true, alignment: AlignmentType.CENTER, color: 'heading' },
    contactStyle: { alignment: AlignmentType.RIGHT, separator: 'lines', showIcons: false },
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'custom_sections'],
    useColumns: false,
    columnSections: [],
    headingColorUsage: 'heading',
    accentColorUsage: 'company',
    dateFormat: 'short',
    bulletStyle: 'disc',
  },
  'executive-1': {
    fontFamily: 'Georgia',
    fontFamilyFallback: '"Times New Roman", serif',
    headingStyle: { uppercase: true, letterSpacing: 80, borderBottom: true, alignment: AlignmentType.LEFT },
    nameStyle: { fontSize: 42, bold: true, alignment: AlignmentType.CENTER, color: 'heading' },
    contactStyle: { alignment: AlignmentType.CENTER, separator: 'pipes', showIcons: false },
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications', 'languages', 'projects', 'custom_sections'],
    useColumns: true,
    columnSections: ['skills', 'certifications', 'languages'],
    headingColorUsage: 'primary',
    accentColorUsage: 'dates',
    dateFormat: 'long',
    bulletStyle: 'disc',
  },
  'default': {
    fontFamily: 'Calibri',
    fontFamilyFallback: 'Arial, sans-serif',
    headingStyle: { uppercase: false, letterSpacing: 0, borderBottom: true, alignment: AlignmentType.LEFT },
    nameStyle: { fontSize: 44, bold: true, alignment: AlignmentType.CENTER, color: 'heading' },
    contactStyle: { alignment: AlignmentType.CENTER, separator: 'bullets', showIcons: false },
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'custom_sections'],
    useColumns: false,
    columnSections: [],
    headingColorUsage: 'heading',
    accentColorUsage: 'both',
    dateFormat: 'short',
    bulletStyle: 'disc',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

interface DocxExportOptions {
  templateId?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    heading: string;
  };
}

export async function exportResumeToDocx(
  resumeData: ResumeData,
  options: DocxExportOptions = {}
): Promise<Blob> {
  const { colors, templateId = 'modern-1' } = options;
  const templateConfig = TEMPLATE_DOCX_CONFIG[templateId] || TEMPLATE_DOCX_CONFIG['default'];

  // Normalize all colors
  const primaryColor = createColorObject(colors?.primary, '4F46E5');
  const headingColor = createColorObject(colors?.heading, '1E293B');
  const accentColor = createColorObject(colors?.accent, '6366F1');
  const textColor = createColorObject(colors?.text, '0F172A');
  const secondaryColor = createColorObject(colors?.secondary, '1E293B');
  const mutedColor = createColorObject('#64748B', '64748B');

  const getHeadingColor = () => {
    switch (templateConfig.headingColorUsage) {
      case 'primary': return primaryColor;
      case 'accent': return accentColor;
      case 'heading':
      default: return headingColor;
    }
  };

  const getAccentColor = () => accentColor;
  const getMutedColor = () => mutedColor;
  const getTextColor = () => textColor;

  const fontFamily = templateConfig.fontFamily;
  const fontFamilyFallback = templateConfig.fontFamilyFallback;
  const fontFamilyFull = `${fontFamily}, ${fontFamilyFallback}`;

  const children: Paragraph[] = [];
  const sidebarChildren: Paragraph[] = [];

  // Helper to add a paragraph with consistent formatting
  const addParagraph = (options: {
    children: TextRun[];
    spacing?: { before?: number; after?: number };
    alignment?: AlignmentTypeValue;
    indent?: { left?: number; hanging?: number; right?: number };
    border?: { bottom?: { color: string; style: BorderStyleValue; size: number } };
    keepNext?: boolean;
    keepLines?: boolean;
    pageBreakBefore?: boolean;
  }, target: Paragraph[] = children) => {
    target.push(new Paragraph({
      children: options.children,
      spacing: options.spacing,
      alignment: options.alignment,
      indent: options.indent,
      border: options.border,
      keepNext: options.keepNext,
      keepLines: options.keepLines,
      pageBreakBefore: options.pageBreakBefore,
    }));
  };

  // Heading helper
  const addHeading = (text: string, level = HeadingLevel.HEADING_2, isSidebar = false) => {
    const target = isSidebar ? sidebarChildren : children;
    const headingText = templateConfig.headingStyle.uppercase ? text.toUpperCase() : text;
    
    const runs: TextRun[] = [
      new TextRun({
        text: headingText,
        bold: true,
        color: getHeadingColor().hex,
        size: isSidebar ? 22 : 28,
        font: fontFamilyFull,
        characterSpacing: templateConfig.headingStyle.letterSpacing,
      }),
    ];

    addParagraph({
      children: runs,
      spacing: { before: isSidebar ? SPACING.xl : SPACING.xxl, after: SPACING.lg },
      alignment: templateConfig.headingStyle.alignment,
      border: templateConfig.headingStyle.borderBottom ? {
        bottom: { color: primaryColor.hex, style: BorderStyle.SINGLE, size: 6 },
      } : undefined,
      // Only keepNext on non-sidebar headings to prevent stranded headings
      // keepLines can cause issues with long headings
      keepNext: !isSidebar,
      keepLines: false,
    }, target);
  };

  // Body text helper
  const addText = (text: string, options: {
    bold?: boolean;
    size?: number;
    color?: ReturnType<typeof createColorObject>;
    spacing?: { before?: number; after?: number };
    alignment?: AlignmentTypeValue;
    italics?: boolean;
    indent?: { left?: number; hanging?: number };
  } = {}, isSidebar = false) => {
    if (!text) return;
    const target = isSidebar ? sidebarChildren : children;
    
    addParagraph({
      children: [
        new TextRun({
          text,
          bold: options.bold ?? false,
          size: options.size ?? (isSidebar ? FONT_SIZES.small : FONT_SIZES.body),
          color: options.color?.hex ?? getTextColor().hex,
          font: fontFamilyFull,
          italics: options.italics ?? false,
        }),
      ],
      spacing: options.spacing ?? { before: SPACING.xs, after: SPACING.xs },
      alignment: options.alignment,
      indent: options.indent,
    }, target);
  };

  // Bullet helper
  const addBullet = (text: string, indentLevel = 0, isSidebar = false) => {
    if (!text) return;
    const target = isSidebar ? sidebarChildren : children;
    
    const bulletChar = templateConfig.bulletStyle === 'dash' ? '–' : 
                       templateConfig.bulletStyle === 'arrow' ? '▸' : '•';
    
    // Clean text: remove leading bullet characters (*, -, •, etc.) that may come from source data
    const cleanText = text.replace(/^[\s*\-•]+/, '').trim();
    
    addParagraph({
      children: [
        new TextRun({
          text: `${bulletChar} ${cleanText}`,
          size: isSidebar ? FONT_SIZES.small : FONT_SIZES.body,
          color: getTextColor().hex,
          font: fontFamilyFull,
        }),
      ],
      spacing: { before: SPACING.xs, after: SPACING.xs },
      indent: { left: 720 + indentLevel * 360, hanging: 360 },
    }, target);
  };

  // Spacer
  const addSpacer = (size = SPACING.md, isSidebar = false) => {
    const target = isSidebar ? sidebarChildren : children;
    addParagraph({
      children: [new TextRun({ text: '', size: 2 })],
      spacing: { before: size, after: size },
    }, target);
  };

  // Page break helper - only add when needed
  const addPageBreakIfNeeded = (target: Paragraph[] = children) => {
    target.push(new Paragraph({
      children: [new TextRun({ text: '', size: 2, break: 1 })], // Page break
      spacing: { before: 0, after: 0 },
    }));
  };

  // Date formatting
  const formatDate = (dateStr: string, format: 'short' | 'long' = 'short') => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: format === 'long' ? 'long' : 'short', 
      year: 'numeric' 
    });
  };

  const getDateRange = (start: string, end: string, current: boolean, format: 'short' | 'long' = 'short') => {
    const startDate = formatDate(start, format);
    const endDate = current ? 'Present' : formatDate(end, format);
    return `${startDate} – ${endDate}`;
  };

  // Contact line with proper formatting
  const buildContactLine = (parts: string[], isSidebar = false) => {
    const target = isSidebar ? sidebarChildren : children;
    
    if (templateConfig.contactStyle.separator === 'lines') {
      // Each contact item on its own line
      parts.forEach((part, i) => {
        addParagraph({
          children: [new TextRun({
            text: part,
            size: isSidebar ? FONT_SIZES.tiny : FONT_SIZES.contact,
            color: getTextColor().hex,
            font: fontFamilyFull,
          })],
          spacing: { before: i === 0 ? SPACING.xs : SPACING.xs / 2, after: SPACING.xs / 2 },
          alignment: templateConfig.contactStyle.alignment,
        }, target);
      });
    } else if (templateConfig.contactStyle.separator === 'bullets') {
      // Bullet-separated on one line
      const separator = '  •  ';
      addParagraph({
        children: [new TextRun({
          text: parts.join(separator),
          size: isSidebar ? FONT_SIZES.tiny : FONT_SIZES.contact,
          color: getTextColor().hex,
          font: fontFamilyFull,
        })],
        spacing: { before: SPACING.xs, after: SPACING.lg },
        alignment: templateConfig.contactStyle.alignment,
      }, target);
    } else {
      // Pipe-separated on one line
      addParagraph({
        children: [new TextRun({
          text: parts.join('  |  '),
          size: isSidebar ? FONT_SIZES.tiny : FONT_SIZES.contact,
          color: getTextColor().hex,
          font: fontFamilyFull,
        })],
        spacing: { before: SPACING.xs, after: SPACING.lg },
        alignment: templateConfig.contactStyle.alignment,
      }, target);
    }
  };

  // ============================================================================
  // BUILD HEADER
  // ============================================================================
  const { personal, summary, experience, education, skills, projects, certifications, languages, custom_sections } = resumeData;

  // Name
  const fullName = `${personal.firstName || ''} ${personal.lastName || ''}`.trim();
  if (fullName) {
    const nameColor = templateConfig.nameStyle.color === 'primary' ? primaryColor : getHeadingColor();
    
    // For creative template, highlight last name with accent color
    if (templateId === 'creative-1' && personal.lastName) {
      const firstName = personal.firstName || '';
      const lastName = personal.lastName || '';
      const nameRuns: TextRun[] = [];
      
      if (firstName) {
        nameRuns.push(new TextRun({
          text: firstName + ' ',
          bold: true,
          size: templateConfig.nameStyle.fontSize,
          color: getHeadingColor().hex,
          font: fontFamilyFull,
        }));
      }
      nameRuns.push(new TextRun({
        text: lastName,
        bold: true,
        size: templateConfig.nameStyle.fontSize,
        color: accentColor.hex,
        font: fontFamilyFull,
      }));

      addParagraph({
        children: nameRuns,
        spacing: { before: 0, after: SPACING.xs },
        alignment: templateConfig.nameStyle.alignment,
      });
    } else {
      addParagraph({
        children: [
          new TextRun({
            text: fullName,
            bold: templateConfig.nameStyle.bold,
            size: templateConfig.nameStyle.fontSize,
            color: nameColor.hex,
            font: fontFamilyFull,
          }),
        ],
        spacing: { before: 0, after: SPACING.xs },
        alignment: templateConfig.nameStyle.alignment,
      });
    }
  }

  // Title
  if (personal.title) {
    addParagraph({
      children: [
        new TextRun({
          text: personal.title,
          size: FONT_SIZES.title,
          color: accentColor.hex,
          font: fontFamilyFull,
        }),
      ],
      spacing: { before: 0, after: SPACING.lg },
      alignment: templateConfig.nameStyle.alignment,
    });
  }

  // Contact Info - Build parts
  const contactParts: string[] = [];
  if (personal.email) contactParts.push(personal.email);
  if (personal.phone) contactParts.push(personal.phone);
  if (personal.location) contactParts.push(personal.location);
  if (personal.linkedin) contactParts.push(personal.linkedin.replace(/^https?:\/\//, ''));
  if (personal.github) contactParts.push(personal.github.replace(/^https?:\/\//, ''));
  if (personal.website) contactParts.push(personal.website.replace(/^https?:\/\//, ''));
  if (personal.portfolio) contactParts.push(personal.portfolio.replace(/^https?:\/\//, ''));

  if (contactParts.length > 0) {
    buildContactLine(contactParts);
  }

  // Horizontal rule after header
  addParagraph({
    children: [new TextRun({ text: '', size: 2 })],
    spacing: { before: SPACING.md, after: SPACING.xl },
    border: {
      bottom: { color: primaryColor.hex, style: BorderStyle.SINGLE, size: 6 },
    },
  });

  // ============================================================================
  // SECTION BUILDERS
  // ============================================================================

  const buildSummary = (isSidebar = false) => {
    if (summary?.trim()) {
      addHeading('Professional Summary', HeadingLevel.HEADING_2, isSidebar);
      addText(summary.trim(), { 
        size: isSidebar ? FONT_SIZES.small : FONT_SIZES.body, 
        color: getTextColor(), 
        spacing: { before: SPACING.md, after: SPACING.xl } 
      }, isSidebar);
    }
  };

  const addSectionWithKeepTogether = (isSidebar = false) => {
    // Add a small spacer before new section to prevent crowding
    if (!isSidebar) {
      addSpacer(SPACING.lg);
    }
  };

  const buildExperience = (isSidebar = false) => {
    if (experience.length > 0) {
      addHeading('Professional Experience', HeadingLevel.HEADING_2, isSidebar);
      
      experience.forEach((exp, expIndex) => {
        const target = isSidebar ? sidebarChildren : children;
        
        // Position and Company on same line
        const posRuns: TextRun[] = [
          new TextRun({
            text: exp.position,
            bold: true,
            size: isSidebar ? FONT_SIZES.subheading : FONT_SIZES.body + 2,
            color: getHeadingColor().hex,
            font: fontFamilyFull,
          }),
        ];

        // Company with accent color if configured
        if (templateConfig.accentColorUsage === 'company' || templateConfig.accentColorUsage === 'both') {
          posRuns.push(new TextRun({
            text: `  |  ${exp.company}`,
            size: isSidebar ? FONT_SIZES.subheading : FONT_SIZES.body + 2,
            color: getAccentColor().hex,
            font: fontFamilyFull,
          }));
        } else {
          posRuns.push(new TextRun({
            text: `  |  ${exp.company}`,
            size: isSidebar ? FONT_SIZES.subheading : FONT_SIZES.body + 2,
            color: getTextColor().hex,
            font: fontFamilyFull,
          }));
        }

        addParagraph({
          children: posRuns,
          spacing: { before: expIndex === 0 ? SPACING.xl : SPACING.xxl, after: SPACING.xs },
          keepNext: true, // Keep position/company with meta
        }, target);

        // Location and Dates
        const metaParts: string[] = [];
        if (exp.location) metaParts.push(exp.location);
        if (exp.startDate || exp.endDate) {
          const dateRange = getDateRange(exp.startDate, exp.endDate, exp.current, templateConfig.dateFormat);
          metaParts.push(dateRange);
        }
        
        if (metaParts.length > 0) {
          addText(metaParts.join('  |  '), { 
            size: isSidebar ? FONT_SIZES.tiny : FONT_SIZES.small, 
            color: getMutedColor(), 
            spacing: { before: 0, after: SPACING.md } 
          }, isSidebar);
        }

        // Description bullets - keep together with position
        if (exp.description.length > 0) {
          exp.description.forEach((desc, descIndex) => {
            addBullet(desc, 0, isSidebar);
          });
        }

        // Technologies
        if (exp.technologies.length > 0) {
          addText(`Technologies: ${exp.technologies.join(', ')}`, { 
            size: isSidebar ? FONT_SIZES.tiny : FONT_SIZES.small, 
            color: getMutedColor(), 
            spacing: { before: SPACING.md, after: SPACING.lg } 
          }, isSidebar);
        }
        
        // Add spacing between entries
        if (expIndex < experience.length - 1 && !isSidebar) {
          addSpacer(SPACING.md);
        }
      });
    }
  };

  const buildEducation = (isSidebar = false) => {
    if (education.length > 0) {
      addHeading('Education', HeadingLevel.HEADING_2, isSidebar);
      
      education.forEach((edu, eduIndex) => {
        const target = isSidebar ? sidebarChildren : children;
        
        const degreeField = `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`;
        
        // Degree and Institution
        const eduRuns: TextRun[] = [
          new TextRun({
            text: degreeField,
            bold: true,
            size: isSidebar ? FONT_SIZES.subheading : FONT_SIZES.body + 2,
            color: getHeadingColor().hex,
            font: fontFamilyFull,
          }),
        ];

        if (templateConfig.accentColorUsage === 'company' || templateConfig.accentColorUsage === 'both') {
          eduRuns.push(new TextRun({
            text: `  |  ${edu.institution}`,
            size: isSidebar ? FONT_SIZES.subheading : FONT_SIZES.body + 2,
            color: getAccentColor().hex,
            font: fontFamilyFull,
          }));
        } else {
          eduRuns.push(new TextRun({
            text: `  |  ${edu.institution}`,
            size: isSidebar ? FONT_SIZES.subheading : FONT_SIZES.body + 2,
            color: getTextColor().hex,
            font: fontFamilyFull,
          }));
        }

        addParagraph({
          children: eduRuns,
          spacing: { before: eduIndex === 0 ? SPACING.xl : SPACING.xxl, after: SPACING.xs },
          keepNext: true,
        }, target);

        // Meta info
        const metaParts: string[] = [];
        if (edu.location) metaParts.push(edu.location);
        if (edu.startDate || edu.endDate) {
          metaParts.push(getDateRange(edu.startDate, edu.endDate, edu.current, templateConfig.dateFormat));
        }
        if (edu.gpa) metaParts.push(`GPA: ${edu.gpa}`);
        if (edu.honors && edu.honors.length > 0) metaParts.push(`Honors: ${edu.honors.join(', ')}`);
        
        if (metaParts.length > 0) {
          addText(metaParts.join('  |  '), { 
            size: isSidebar ? FONT_SIZES.tiny : FONT_SIZES.small, 
            color: getMutedColor(), 
            spacing: { before: 0, after: SPACING.lg } 
          }, isSidebar);
        }
        
        if (eduIndex < education.length - 1 && !isSidebar) {
          addSpacer(SPACING.md);
        }
      });
    }
  };

  const buildSkills = (isSidebar = false) => {
    if (skills.length > 0) {
      addHeading(isSidebar ? 'Core Competencies' : 'Skills', HeadingLevel.HEADING_2, isSidebar);
      
      const categories: { value: string; label: string }[] = [
        { value: 'technical', label: 'Technical' },
        { value: 'framework', label: 'Frameworks' },
        { value: 'database', label: 'Databases' },
        { value: 'cloud', label: 'Cloud' },
        { value: 'tool', label: 'Tools' },
        { value: 'language', label: 'Languages' },
        { value: 'soft', label: 'Soft Skills' },
        { value: 'other', label: 'Other' },
      ];

      categories.forEach((cat, catIndex) => {
        const catSkills = skills.filter((s) => s.category === cat.value);
        if (catSkills.length === 0) return;

        addText(cat.label, { 
          bold: true, 
          size: isSidebar ? FONT_SIZES.small : FONT_SIZES.body, 
          color: getHeadingColor(), 
          spacing: { before: catIndex === 0 ? SPACING.lg : SPACING.md, after: SPACING.xs } 
        }, isSidebar);

        const skillTexts = catSkills.map(
          (s) => `${s.name} (${s.proficiency})`
        );
        addText(skillTexts.join(', '), { 
          size: isSidebar ? FONT_SIZES.tiny : FONT_SIZES.small, 
          color: getTextColor(), 
          spacing: { before: 0, after: SPACING.md } 
        }, isSidebar);
      });
    }
  };

  const buildProjects = (isSidebar = false) => {
    if (projects.length > 0) {
      addHeading(templateId === 'creative-1' ? 'Featured Work' : 'Projects', HeadingLevel.HEADING_2, isSidebar);
      
      projects.forEach((project, projIndex) => {
        const target = isSidebar ? sidebarChildren : children;
        
        // Project name
        addParagraph({
          children: [
            new TextRun({
              text: project.name,
              bold: true,
              size: isSidebar ? FONT_SIZES.subheading : FONT_SIZES.body + 2,
              color: getHeadingColor().hex,
              font: fontFamilyFull,
            }),
          ],
          spacing: { before: projIndex === 0 ? SPACING.xl : SPACING.xxl, after: SPACING.xs },
          keepNext: true,
        }, target);

        // Description
        if (project.description) {
          addText(project.description, { 
            size: isSidebar ? FONT_SIZES.small : FONT_SIZES.body, 
            color: getTextColor(), 
            spacing: { before: 0, after: SPACING.md } 
          }, isSidebar);
        }

        // Technologies
        if (project.technologies.length > 0) {
          addText(`Technologies: ${project.technologies.join(', ')}`, { 
            size: isSidebar ? FONT_SIZES.tiny : FONT_SIZES.small, 
            color: getMutedColor(), 
            spacing: { before: 0, after: SPACING.md } 
          }, isSidebar);
        }

        // Highlights
        if (project.highlights.length > 0) {
          project.highlights.forEach((highlight) => {
            addBullet(highlight, 0, isSidebar);
          });
        }

        // Links
        if (project.url || project.github) {
          const links: string[] = [];
          if (project.url) links.push(`Live: ${project.url}`);
          if (project.github) links.push(`Code: ${project.github}`);
          addText(links.join('  |  '), { 
            size: isSidebar ? FONT_SIZES.tiny : FONT_SIZES.small, 
            color: getAccentColor(), 
            spacing: { before: SPACING.md, after: SPACING.lg } 
          }, isSidebar);
        }
        
        if (projIndex < projects.length - 1 && !isSidebar) {
          addSpacer(SPACING.md);
        }
      });
    }
  };

  const buildCertifications = (isSidebar = false) => {
    if (certifications.length > 0) {
      addHeading('Certifications', HeadingLevel.HEADING_2, isSidebar);
      
      certifications.forEach((cert, certIndex) => {
        const target = isSidebar ? sidebarChildren : children;
        
        // Name and Issuer
        addParagraph({
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
              size: isSidebar ? FONT_SIZES.subheading : FONT_SIZES.body + 2,
              color: getHeadingColor().hex,
              font: fontFamilyFull,
            }),
            new TextRun({
              text: `  -  ${cert.issuer}`,
              size: isSidebar ? FONT_SIZES.small : FONT_SIZES.body,
              color: getAccentColor().hex,
              font: fontFamilyFull,
            }),
          ],
          spacing: { before: certIndex === 0 ? SPACING.xl : SPACING.xl, after: SPACING.xs },
          keepNext: true,
        }, target);

        // Meta
        const metaParts: string[] = [];
        if (cert.date) metaParts.push(formatDate(cert.date, templateConfig.dateFormat));
        if (cert.expiryDate) metaParts.push(`Expires: ${formatDate(cert.expiryDate, templateConfig.dateFormat)}`);
        if (cert.credentialId) metaParts.push(`Credential: ${cert.credentialId}`);
        
        if (metaParts.length > 0) {
          addText(metaParts.join('  |  '), { 
            size: isSidebar ? FONT_SIZES.tiny : FONT_SIZES.small, 
            color: getMutedColor(), 
            spacing: { before: 0, after: SPACING.md } 
          }, isSidebar);
        }

        if (cert.url) {
          addText(`Verify: ${cert.url}`, { 
            size: isSidebar ? FONT_SIZES.tiny : FONT_SIZES.small, 
            color: getAccentColor(), 
            spacing: { before: 0, after: SPACING.lg } 
          }, isSidebar);
        }
        
        if (certIndex < certifications.length - 1 && !isSidebar) {
          addSpacer(SPACING.md);
        }
      });
    }
  };

  const buildLanguages = (isSidebar = false) => {
    if (languages.length > 0) {
      addHeading('Languages', HeadingLevel.HEADING_2, isSidebar);
      
      const langTexts = languages.map((l) => `${l.name} (${l.proficiency})`);
      addText(langTexts.join(', '), { 
        size: isSidebar ? FONT_SIZES.small : FONT_SIZES.body, 
        color: getTextColor(), 
        spacing: { before: SPACING.md, after: SPACING.xl } 
      }, isSidebar);
    }
  };

  const buildCustomSections = (isSidebar = false) => {
    custom_sections.forEach((section) => {
      addHeading(section.title, HeadingLevel.HEADING_2, isSidebar);
      
      section.items.forEach((item, itemIndex) => {
        if (item.title) {
          addText(item.title, { 
            bold: true, 
            size: isSidebar ? FONT_SIZES.small : FONT_SIZES.body, 
            color: getHeadingColor(), 
            spacing: { before: itemIndex === 0 ? SPACING.lg : SPACING.md, after: SPACING.xs } 
          }, isSidebar);
        }
        if (item.subtitle) {
          addText(item.subtitle, { 
            size: isSidebar ? FONT_SIZES.tiny : FONT_SIZES.small, 
            color: getAccentColor(), 
            spacing: { before: 0, after: SPACING.xs } 
          }, isSidebar);
        }
        if (item.date) {
          addText(item.date, { 
            size: isSidebar ? FONT_SIZES.tiny : FONT_SIZES.small, 
            color: getMutedColor(), 
            spacing: { before: 0, after: SPACING.xs } 
          }, isSidebar);
        }
        if (item.description) {
          addText(item.description, { 
            size: isSidebar ? FONT_SIZES.small : FONT_SIZES.body, 
            color: getTextColor(), 
            spacing: { before: 0, after: SPACING.md } 
          }, isSidebar);
        }
      });
    });
  };

  // ============================================================================
  // BUILD DOCUMENT
  // ============================================================================

  const buildSection = (sectionName: string, isSidebar = false) => {
    switch (sectionName) {
      case 'summary': buildSummary(isSidebar); break;
      case 'experience': buildExperience(isSidebar); break;
      case 'education': buildEducation(isSidebar); break;
      case 'skills': buildSkills(isSidebar); break;
      case 'projects': buildProjects(isSidebar); break;
      case 'certifications': buildCertifications(isSidebar); break;
      case 'languages': buildLanguages(isSidebar); break;
      case 'custom_sections': buildCustomSections(isSidebar); break;
    }
  };

  // For templates with two-column layout (classic-1, executive-1), use a table
  // to place sidebar sections (skills, certifications, languages) in the right column
  // alongside the main content (experience, education) in the left column.
  if (templateConfig.useColumns && templateConfig.columnSections.length > 0) {
    // Build main content sections (non-sidebar)
    const mainSections = templateConfig.sectionOrder.filter(
      s => !templateConfig.columnSections.includes(s)
    );
    const sidebarSections = templateConfig.columnSections;

    // Build main content paragraphs
    mainSections.forEach((sectionName) => {
      buildSection(sectionName, false);
    });

    // Build sidebar content paragraphs
    sidebarSections.forEach((sectionName) => {
      buildSection(sectionName, true);
    });

    // Create a two-column table for the sidebar sections area
    // The table will have the main content that flows alongside sidebar in the left column
    // and sidebar sections in the right column
    // For simplicity and editability, we'll append sidebar sections after main content
    // but use a table structure for the two-column portion (experience/education vs skills/certs/langs)
    
    // Actually, for better editability and ATS compatibility, we'll render sidebar sections
    // after main content with a clear visual separation, but preserve all content.
    // Add a page break before sidebar content to separate it visually.
    if (sidebarChildren.length > 0) {
      addPageBreakIfNeeded(children);
      // Add a subtle heading to indicate sidebar content
      addParagraph({
        children: [
          new TextRun({
            text: 'Core Competencies & Additional Information',
            bold: true,
            size: 28,
            color: getHeadingColor().hex,
            font: fontFamilyFull,
            characterSpacing: templateConfig.headingStyle.letterSpacing,
          }),
        ],
        spacing: { before: SPACING.xl, after: SPACING.lg },
        alignment: templateConfig.headingStyle.alignment,
        border: templateConfig.headingStyle.borderBottom ? {
          bottom: { color: primaryColor.hex, style: BorderStyle.SINGLE, size: 6 },
        } : undefined,
      });
      children.push(...sidebarChildren);
    }
  } else {
    // Single column layout - render all sections normally
    const sectionsToRender = templateConfig.sectionOrder;
    
    sectionsToRender.forEach((sectionName) => {
      buildSection(sectionName, false);
    });
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: MARGIN_TOP,
              right: MARGIN_RIGHT,
              bottom: MARGIN_BOTTOM,
              left: MARGIN_LEFT,
            },
            size: {
              width: PAGE_WIDTH_TWIPS,
              height: PAGE_HEIGHT_TWIPS,
            },
          },
        },
        children: children,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: fontFamilyFull,
            color: textColor.hex,
            size: FONT_SIZES.body,
          },
          paragraph: {
            spacing: { line: 276 }, // 1.15 line spacing
          },
        },
      },
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: fontFamilyFull,
            color: textColor.hex,
            size: FONT_SIZES.body,
          },
          paragraph: {
            spacing: { line: 276, after: SPACING.md },
          },
        },
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            bold: true,
            color: getHeadingColor().hex,
            size: 32,
            font: fontFamilyFull,
          },
          paragraph: {
            spacing: { before: SPACING.xxl, after: SPACING.lg, line: 276 },
            keepNext: true,
            keepLines: true,
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            bold: true,
            color: getHeadingColor().hex,
            size: 28,
            font: fontFamilyFull,
            characterSpacing: templateConfig.headingStyle.letterSpacing,
          },
          paragraph: {
            spacing: { before: SPACING.xxl, after: SPACING.lg, line: 276 },
            keepNext: true,
            keepLines: true,
          },
        },
      ],
    },
  });

  return Packer.toBlob(doc);
}

export function getSafeFileName(title: string, extension: string): string {
  const safeTitle = title
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 100) || 'Resume';
  return `${safeTitle}.${extension}`;
}

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