import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, VerticalAlign } from 'docx';
import { ResumeData, PersonalInfo, Experience, Education, Skill, Project, Certification, Language, CustomSection } from '@/types';
import { normalizeColorToHex, parseColorToRgb, createColorObject } from './colorUtils';

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

// Template-specific configurations for DOCX export
const TEMPLATE_DOCX_CONFIG: Record<string, {
  fontFamily: string;
  headingStyle: {
    uppercase: boolean;
    letterSpacing: number;
    borderBottom: boolean;
  };
  nameStyle: {
    fontSize: number;
    bold: boolean;
    alignment: (typeof AlignmentType)[keyof typeof AlignmentType];
  };
  sectionOrder: string[];
  useSidebar: boolean;
  sidebarSections: string[];
  headingColorUsage: 'heading' | 'primary' | 'accent';
}> = {
  'modern-1': {
    fontFamily: 'Inter, Calibri, Arial, sans-serif',
    headingStyle: { uppercase: false, letterSpacing: 0, borderBottom: true },
    nameStyle: { fontSize: 40, bold: true, alignment: AlignmentType.CENTER },
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'custom_sections'],
    useSidebar: false,
    sidebarSections: [],
    headingColorUsage: 'heading',
  },
  'modern-2': {
    fontFamily: 'Inter, Calibri, Arial, sans-serif',
    headingStyle: { uppercase: false, letterSpacing: 0, borderBottom: true },
    nameStyle: { fontSize: 40, bold: true, alignment: AlignmentType.CENTER },
    sectionOrder: ['summary', 'projects', 'experience', 'education', 'skills', 'certifications', 'languages', 'custom_sections'],
    useSidebar: false,
    sidebarSections: [],
    headingColorUsage: 'heading',
  },
  'classic-1': {
    fontFamily: 'Georgia, "Times New Roman", serif',
    headingStyle: { uppercase: true, letterSpacing: 15, borderBottom: true },
    nameStyle: { fontSize: 40, bold: true, alignment: AlignmentType.CENTER },
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications', 'languages', 'projects', 'custom_sections'],
    useSidebar: true,
    sidebarSections: ['skills', 'certifications', 'languages'],
    headingColorUsage: 'heading',
  },
  'creative-1': {
    fontFamily: 'Inter, Calibri, Arial, sans-serif',
    headingStyle: { uppercase: true, letterSpacing: 15, borderBottom: false },
    nameStyle: { fontSize: 48, bold: true, alignment: AlignmentType.LEFT },
    sectionOrder: ['summary', 'projects', 'experience', 'education', 'skills', 'certifications', 'languages', 'custom_sections'],
    useSidebar: false,
    sidebarSections: [],
    headingColorUsage: 'heading',
  },
  'minimal-1': {
    fontFamily: 'Inter, Calibri, Arial, sans-serif',
    headingStyle: { uppercase: false, letterSpacing: 0, borderBottom: false },
    nameStyle: { fontSize: 36, bold: true, alignment: AlignmentType.CENTER },
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'custom_sections'],
    useSidebar: false,
    sidebarSections: [],
    headingColorUsage: 'heading',
  },
  'executive-1': {
    fontFamily: 'Georgia, "Times New Roman", serif',
    headingStyle: { uppercase: true, letterSpacing: 10, borderBottom: true },
    nameStyle: { fontSize: 38, bold: true, alignment: AlignmentType.CENTER },
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications', 'languages', 'projects', 'custom_sections'],
    useSidebar: true,
    sidebarSections: ['skills', 'certifications', 'languages'],
    headingColorUsage: 'primary',
  },
  'default': {
    fontFamily: 'Inter, Calibri, Arial, sans-serif',
    headingStyle: { uppercase: false, letterSpacing: 0, borderBottom: true },
    nameStyle: { fontSize: 40, bold: true, alignment: AlignmentType.CENTER },
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'custom_sections'],
    useSidebar: false,
    sidebarSections: [],
    headingColorUsage: 'heading',
  },
};

export async function exportResumeToDocx(
  resumeData: ResumeData,
  options: DocxExportOptions = {}
): Promise<Blob> {
  const { colors, templateId = 'modern-1' } = options;
  
  const templateConfig = TEMPLATE_DOCX_CONFIG[templateId] || TEMPLATE_DOCX_CONFIG['default'];

  // Normalize all colors to hex format required by docx library
  const primaryColor = createColorObject(colors?.primary, '4F46E5');
  const headingColor = createColorObject(colors?.heading, '1E293B');
  const accentColor = createColorObject(colors?.accent, '6366F1');
  const textColor = createColorObject(colors?.text, '0F172A');
  const secondaryColor = createColorObject(colors?.secondary, '1E293B');
  const mutedColor = createColorObject('#64748B', '64748B'); // slate-500 for muted text

  const getHeadingColor = () => {
    switch (templateConfig.headingColorUsage) {
      case 'primary': return primaryColor;
      case 'accent': return accentColor;
      case 'heading':
      default: return headingColor;
    }
  };

  const children: Paragraph[] = [];
  const sidebarChildren: Paragraph[] = [];

  // Helper functions
  const addHeading = (text: string, level = HeadingLevel.HEADING_2, isSidebar = false) => {
    const target = isSidebar ? sidebarChildren : children;
    const headingText = templateConfig.headingStyle.uppercase ? text.toUpperCase() : text;
    
    const paragraph = new Paragraph({
      text: headingText,
      heading: level,
      thematicBreak: templateConfig.headingStyle.borderBottom,
      spacing: { before: isSidebar ? 180 : 240, after: 120 },
      style: 'heading',
      run: {
        bold: true,
        color: getHeadingColor().hex,
        size: isSidebar ? 22 : 28,
        font: templateConfig.fontFamily,
        characterSpacing: templateConfig.headingStyle.letterSpacing,
      },
      border: templateConfig.headingStyle.borderBottom ? {
        bottom: { color: primaryColor.hex, style: BorderStyle.SINGLE, size: 12 },
      } : undefined,
    });
    target.push(paragraph);
  };

  const addText = (text: string, bold = false, size = 22, color = textColor, spacing = { before: 60, after: 60 }, isSidebar = false) => {
    if (!text) return;
    const target = isSidebar ? sidebarChildren : children;
    target.push(
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold,
            size,
            color: color.hex,
            font: templateConfig.fontFamily,
          }),
        ],
        spacing,
      })
    );
  };

  const addBullet = (text: string, indentLevel = 0, isSidebar = false) => {
    if (!text) return;
    const target = isSidebar ? sidebarChildren : children;
    target.push(
      new Paragraph({
        children: [
          new TextRun({
            text,
            size: isSidebar ? 20 : 22,
            color: textColor.hex,
            font: templateConfig.fontFamily,
          }),
        ],
        bullet: { level: indentLevel },
        spacing: { before: isSidebar ? 30 : 40, after: isSidebar ? 30 : 40 },
        indent: { left: 720 + indentLevel * 360, hanging: 360 },
      })
    );
  };

  const addSpacer = (size = 120, isSidebar = false) => {
    const target = isSidebar ? sidebarChildren : children;
    target.push(
      new Paragraph({
        text: '',
        spacing: { before: size, after: size },
      })
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getDateRange = (start: string, end: string, current: boolean) => {
    const startDate = formatDate(start);
    const endDate = current ? 'Present' : formatDate(end);
    return `${startDate} – ${endDate}`;
  };

  // ============ HEADER ============
  const { personal, summary, experience, education, skills, projects, certifications, languages, custom_sections } = resumeData;

  // Name
  const fullName = `${personal.firstName || ''} ${personal.lastName || ''}`.trim();
  if (fullName) {
    const nameRuns: TextRun[] = [
      new TextRun({
        text: fullName,
        bold: templateConfig.nameStyle.bold,
        size: templateConfig.nameStyle.fontSize,
        color: getHeadingColor().hex,
        font: templateConfig.fontFamily,
      }),
    ];

    // For creative template, highlight last name with accent color
    if (templateId === 'creative-1' && personal.lastName) {
      const firstName = personal.firstName || '';
      const lastName = personal.lastName || '';
      nameRuns.length = 0;
      if (firstName) {
        nameRuns.push(new TextRun({
          text: firstName + ' ',
          bold: true,
          size: templateConfig.nameStyle.fontSize,
          color: getHeadingColor().hex,
          font: templateConfig.fontFamily,
        }));
      }
      nameRuns.push(new TextRun({
        text: lastName,
        bold: true,
        size: templateConfig.nameStyle.fontSize,
        color: accentColor.hex,
        font: templateConfig.fontFamily,
      }));
    }

    children.push(
      new Paragraph({
        children: nameRuns,
        alignment: templateConfig.nameStyle.alignment,
        spacing: { before: 0, after: 40 },
      })
    );
  }

  // Title
  if (personal.title) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personal.title,
            size: 26,
            color: accentColor.hex,
            font: templateConfig.fontFamily,
          }),
        ],
        alignment: templateConfig.nameStyle.alignment,
        spacing: { before: 0, after: 120 },
      })
    );
  }

  // Contact Info
  const contactParts: string[] = [];
  if (personal.email) contactParts.push(personal.email);
  if (personal.phone) contactParts.push(personal.phone);
  if (personal.location) contactParts.push(personal.location);
  if (personal.linkedin) contactParts.push(personal.linkedin);
  if (personal.github) contactParts.push(personal.github);
  if (personal.website) contactParts.push(personal.website);
  if (personal.portfolio) contactParts.push(personal.portfolio);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join('  |  '),
            size: 20,
            color: textColor.hex,
            font: templateConfig.fontFamily,
          }),
        ],
        alignment: templateConfig.nameStyle.alignment,
        spacing: { before: 0, after: 180 },
      })
    );
  }

  // Horizontal line
  children.push(
    new Paragraph({
      text: '',
      thematicBreak: true,
      spacing: { before: 60, after: 180 },
      border: {
        bottom: { color: primaryColor.hex, style: BorderStyle.SINGLE, size: 12 },
      },
    })
  );

  // ============ SECTION BUILDERS ============
  
  const buildSummary = (isSidebar = false) => {
    if (summary?.trim()) {
      addHeading('Professional Summary', HeadingLevel.HEADING_2, isSidebar);
      addText(summary.trim(), false, isSidebar ? 20 : 22, textColor, { before: 60, after: 120 }, isSidebar);
    }
  };

  const buildExperience = (isSidebar = false) => {
    if (experience.length > 0) {
      addHeading('Professional Experience', HeadingLevel.HEADING_2, isSidebar);
      
      experience.forEach((exp) => {
        // Position and Company
        const target = isSidebar ? sidebarChildren : children;
        target.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.position,
                bold: true,
                size: isSidebar ? 22 : 24,
                color: getHeadingColor().hex,
                font: templateConfig.fontFamily,
              }),
              new TextRun({
                text: `  |  ${exp.company}`,
                size: isSidebar ? 22 : 24,
                color: accentColor.hex,
                font: templateConfig.fontFamily,
              }),
            ],
            spacing: { before: isSidebar ? 100 : 120, after: 40 },
          })
        );

        // Location and Dates
        const metaParts: string[] = [];
        if (exp.location) metaParts.push(exp.location);
        if (exp.startDate || exp.endDate) metaParts.push(getDateRange(exp.startDate, exp.endDate, exp.current));
        
        if (metaParts.length > 0) {
          addText(metaParts.join('  |  '), false, isSidebar ? 18 : 20, mutedColor, { before: 0, after: 60 }, isSidebar);
        }

        // Description bullets
        if (exp.description.length > 0) {
          exp.description.forEach((desc) => {
            addBullet(desc, 0, isSidebar);
          });
        }

        // Technologies
        if (exp.technologies.length > 0) {
          addText(`Technologies: ${exp.technologies.join(', ')}`, false, isSidebar ? 18 : 20, mutedColor, { before: 40, after: 80 }, isSidebar);
        }
      });
    }
  };

  const buildEducation = (isSidebar = false) => {
    if (education.length > 0) {
      addHeading('Education', HeadingLevel.HEADING_2, isSidebar);
      
      education.forEach((edu) => {
        const degreeField = `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`;
        
        const target = isSidebar ? sidebarChildren : children;
        target.push(
          new Paragraph({
            children: [
              new TextRun({
                text: degreeField,
                bold: true,
                size: isSidebar ? 22 : 24,
                color: getHeadingColor().hex,
                font: templateConfig.fontFamily,
              }),
              new TextRun({
                text: `  |  ${edu.institution}`,
                size: isSidebar ? 22 : 24,
                color: accentColor.hex,
                font: templateConfig.fontFamily,
              }),
            ],
            spacing: { before: isSidebar ? 100 : 120, after: 40 },
          })
        );

        const metaParts: string[] = [];
        if (edu.location) metaParts.push(edu.location);
        if (edu.startDate || edu.endDate) metaParts.push(getDateRange(edu.startDate, edu.endDate, edu.current));
        if (edu.gpa) metaParts.push(`GPA: ${edu.gpa}`);
        if (edu.honors && edu.honors.length > 0) metaParts.push(`Honors: ${edu.honors.join(', ')}`);
        
        if (metaParts.length > 0) {
          addText(metaParts.join('  |  '), false, isSidebar ? 18 : 20, mutedColor, { before: 0, after: 80 }, isSidebar);
        }
      });
    }
  };

  const buildSkills = (isSidebar = false) => {
    if (skills.length > 0) {
      addHeading(isSidebar ? 'Core Competencies' : 'Skills', HeadingLevel.HEADING_2, isSidebar);
      
      const categories: { value: string; label: string }[] = [
        { value: 'technical', label: 'Technical' },
        { value: 'framework', label: 'Framework' },
        { value: 'database', label: 'Database' },
        { value: 'cloud', label: 'Cloud' },
        { value: 'tool', label: 'Tool' },
        { value: 'language', label: 'Language' },
        { value: 'soft', label: 'Soft Skill' },
        { value: 'other', label: 'Other' },
      ];

      categories.forEach((cat) => {
        const catSkills = skills.filter((s) => s.category === cat.value);
        if (catSkills.length === 0) return;

        addText(cat.label, true, isSidebar ? 20 : 22, getHeadingColor(), { before: isSidebar ? 80 : 100, after: 60 }, isSidebar);

        const skillTexts = catSkills.map(
          (s) => `${s.name} (${s.proficiency})`
        );
        addText(skillTexts.join(', '), false, isSidebar ? 18 : 20, textColor, { before: 0, after: 80 }, isSidebar);
      });
    }
  };

  const buildProjects = (isSidebar = false) => {
    if (projects.length > 0) {
      addHeading(templateId === 'creative-1' ? 'Featured Work' : 'Projects', HeadingLevel.HEADING_2, isSidebar);
      
      projects.forEach((project) => {
        const target = isSidebar ? sidebarChildren : children;
        target.push(
          new Paragraph({
            children: [
              new TextRun({
                text: project.name,
                bold: true,
                size: isSidebar ? 22 : 24,
                color: getHeadingColor().hex,
                font: templateConfig.fontFamily,
              }),
            ],
            spacing: { before: isSidebar ? 100 : 120, after: 40 },
          })
        );

        if (project.description) {
          addText(project.description, false, isSidebar ? 18 : 20, textColor, { before: 0, after: 60 }, isSidebar);
        }

        if (project.technologies.length > 0) {
          addText(`Technologies: ${project.technologies.join(', ')}`, false, isSidebar ? 18 : 20, mutedColor, { before: 0, after: 60 }, isSidebar);
        }

        if (project.highlights.length > 0) {
          project.highlights.forEach((highlight) => {
            addBullet(highlight, 0, isSidebar);
          });
        }

        if (project.url || project.github) {
          const links: string[] = [];
          if (project.url) links.push(`Live: ${project.url}`);
          if (project.github) links.push(`Code: ${project.github}`);
          addText(links.join('  |  '), false, isSidebar ? 18 : 20, accentColor, { before: 40, after: 80 }, isSidebar);
        }
      });
    }
  };

  const buildCertifications = (isSidebar = false) => {
    if (certifications.length > 0) {
      addHeading('Certifications', HeadingLevel.HEADING_2, isSidebar);
      
      certifications.forEach((cert) => {
        const target = isSidebar ? sidebarChildren : children;
        target.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cert.name,
                bold: true,
                size: isSidebar ? 22 : 24,
                color: getHeadingColor().hex,
                font: templateConfig.fontFamily,
              }),
              new TextRun({
                text: `  -  ${cert.issuer}`,
                size: isSidebar ? 20 : 22,
                color: accentColor.hex,
                font: templateConfig.fontFamily,
              }),
            ],
            spacing: { before: isSidebar ? 80 : 100, after: 40 },
          })
        );

        const metaParts: string[] = [];
        if (cert.date) metaParts.push(formatDate(cert.date));
        if (cert.expiryDate) metaParts.push(`Expires: ${formatDate(cert.expiryDate)}`);
        if (cert.credentialId) metaParts.push(`Credential: ${cert.credentialId}`);
        
        if (metaParts.length > 0) {
          addText(metaParts.join('  |  '), false, isSidebar ? 18 : 20, mutedColor, { before: 0, after: 40 }, isSidebar);
        }

        if (cert.url) {
          addText(`Verify: ${cert.url}`, false, isSidebar ? 18 : 20, accentColor, { before: 0, after: 80 }, isSidebar);
        }
      });
    }
  };

  const buildLanguages = (isSidebar = false) => {
    if (languages.length > 0) {
      addHeading('Languages', HeadingLevel.HEADING_2, isSidebar);
      
      const langTexts = languages.map((l) => `${l.name} (${l.proficiency})`);
      addText(langTexts.join(', '), false, isSidebar ? 20 : 22, textColor, { before: 60, after: 120 }, isSidebar);
    }
  };

  const buildCustomSections = (isSidebar = false) => {
    custom_sections.forEach((section) => {
      addHeading(section.title, HeadingLevel.HEADING_2, isSidebar);
      
      section.items.forEach((item) => {
        if (item.title) {
          addText(item.title, true, isSidebar ? 20 : 22, getHeadingColor(), { before: isSidebar ? 60 : 80, after: 20 }, isSidebar);
        }
        if (item.subtitle) {
          addText(item.subtitle, false, isSidebar ? 18 : 20, accentColor, { before: 0, after: 20 }, isSidebar);
        }
        if (item.date) {
          addText(item.date, false, isSidebar ? 18 : 20, mutedColor, { before: 0, after: 20 }, isSidebar);
        }
        if (item.description) {
          addText(item.description, false, isSidebar ? 18 : 20, textColor, { before: 0, after: 60 }, isSidebar);
        }
      });
    });
  };

  // ============ BUILD DOCUMENT ============
  
  // Helper to build a section by name
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

  // Build main content sections
  templateConfig.sectionOrder.forEach((sectionName) => {
    const isSidebar = templateConfig.useSidebar && templateConfig.sidebarSections.includes(sectionName);
    buildSection(sectionName, isSidebar);
  });

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: templateConfig.useSidebar && sidebarChildren.length > 0 
          ? [
              // For sidebar templates, create a two-column table layout
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 65, type: WidthType.PERCENTAGE },
                        children: children,
                        verticalAlign: VerticalAlign.TOP,
                      }),
                      new TableCell({
                        width: { size: 35, type: WidthType.PERCENTAGE },
                        children: sidebarChildren,
                        verticalAlign: VerticalAlign.TOP,
                        margins: { left: 720 }, // 0.5 inch left margin for sidebar
                      }),
                    ],
                  }),
                ],
              }),
            ]
          : children,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: templateConfig.fontFamily,
            color: textColor.hex,
            size: 22,
          },
          paragraph: {
            spacing: { line: 276 }, // 1.15 line spacing
          },
        },
      },
      paragraphStyles: [
        {
          id: 'heading',
          name: 'Heading',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            bold: true,
            color: getHeadingColor().hex,
            size: 28,
            font: templateConfig.fontFamily,
            characterSpacing: templateConfig.headingStyle.letterSpacing,
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
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