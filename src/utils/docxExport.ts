import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
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

export async function exportResumeToDocx(
  resumeData: ResumeData,
  options: DocxExportOptions = {}
): Promise<Blob> {
  const { colors } = options;
  
  // Normalize all colors to hex format required by docx library
  const primaryColor = createColorObject(colors?.primary, '4F46E5');
  const headingColor = createColorObject(colors?.heading, '1E293B');
  const accentColor = createColorObject(colors?.accent, '6366F1');
  const textColor = createColorObject(colors?.text, '0F172A');
  const secondaryColor = createColorObject(colors?.secondary, '1E293B');
  const mutedColor = createColorObject('#64748B', '64748B'); // slate-500 for muted text

  const children: Paragraph[] = [];

  // Helper functions
  const addHeading = (text: string, level = HeadingLevel.HEADING_2) => {
    children.push(
      new Paragraph({
        text,
        heading: level,
        thematicBreak: true,
        spacing: { before: 240, after: 120 },
        style: 'heading',
      })
    );
  };

  const addText = (text: string, bold = false, size = 22, color = textColor, spacing = { before: 60, after: 60 }) => {
    if (!text) return;
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold,
            size,
            color: color.hex,
          }),
        ],
        spacing,
      })
    );
  };

  const addBullet = (text: string, indentLevel = 0) => {
    if (!text) return;
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text,
            size: 22,
            color: textColor.hex,
          }),
        ],
        bullet: { level: indentLevel },
        spacing: { before: 40, after: 40 },
        indent: { left: 720 + indentLevel * 360, hanging: 360 },
      })
    );
  };

  const addSpacer = (size = 120) => {
    children.push(
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
    return `${startDate} - ${endDate}`;
  };

  // ============ HEADER ============
  const { personal, summary, experience, education, skills, projects, certifications, languages, custom_sections } = resumeData;

  // Name
  const fullName = `${personal.firstName || ''} ${personal.lastName || ''}`.trim();
  if (fullName) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: fullName,
            bold: true,
            size: 40,
            color: headingColor.hex,
          }),
        ],
        alignment: AlignmentType.CENTER,
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
          }),
        ],
        alignment: AlignmentType.CENTER,
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
          }),
        ],
        alignment: AlignmentType.CENTER,
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

  // ============ PROFESSIONAL SUMMARY ============
  if (summary?.trim()) {
    addHeading('Professional Summary');
    addText(summary.trim());
  }

  // ============ EXPERIENCE ============
  if (experience.length > 0) {
    addHeading('Professional Experience');
    
    experience.forEach((exp) => {
      // Position and Company
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.position,
              bold: true,
              size: 24,
              color: headingColor.hex,
            }),
            new TextRun({
              text: `  |  ${exp.company}`,
              size: 24,
              color: accentColor.hex,
            }),
          ],
          spacing: { before: 120, after: 40 },
        })
      );

      // Location and Dates
      const metaParts: string[] = [];
      if (exp.location) metaParts.push(exp.location);
      if (exp.startDate || exp.endDate) metaParts.push(getDateRange(exp.startDate, exp.endDate, exp.current));
      
      if (metaParts.length > 0) {
        addText(metaParts.join('  |  '), false, 20);
      }

      // Description bullets
      if (exp.description.length > 0) {
        exp.description.forEach((desc) => {
          addBullet(desc);
        });
      }

      // Technologies
      if (exp.technologies.length > 0) {
        addText(`Technologies: ${exp.technologies.join(', ')}`, false, 20, mutedColor);
      }
    });
  }

  // ============ EDUCATION ============
  if (education.length > 0) {
    addHeading('Education');
    
    education.forEach((edu) => {
      const degreeField = `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`;
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: degreeField,
              bold: true,
              size: 24,
              color: headingColor.hex,
            }),
            new TextRun({
              text: `  |  ${edu.institution}`,
              size: 24,
              color: accentColor.hex,
            }),
          ],
          spacing: { before: 120, after: 40 },
        })
      );

      const metaParts: string[] = [];
      if (edu.location) metaParts.push(edu.location);
      if (edu.startDate || edu.endDate) metaParts.push(getDateRange(edu.startDate, edu.endDate, edu.current));
      if (edu.gpa) metaParts.push(`GPA: ${edu.gpa}`);
      if (edu.honors && edu.honors.length > 0) metaParts.push(`Honors: ${edu.honors.join(', ')}`);
      
      if (metaParts.length > 0) {
        addText(metaParts.join('  |  '), false, 20);
      }
    });
  }

  // ============ SKILLS ============
  if (skills.length > 0) {
    addHeading('Skills');
    
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

      addText(cat.label, true, 22, headingColor, { before: 100, after: 60 });

      const skillTexts = catSkills.map(
        (s) => `${s.name} (${s.proficiency})`
      );
      addText(skillTexts.join(', '), false, 20, textColor, { before: 0, after: 80 });
    });
  }

  // ============ PROJECTS ============
  if (projects.length > 0) {
    addHeading('Projects');
    
    projects.forEach((project) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: project.name,
              bold: true,
              size: 24,
              color: headingColor.hex,
            }),
          ],
          spacing: { before: 120, after: 40 },
        })
      );

      if (project.description) {
        addText(project.description, false, 20);
      }

      if (project.technologies.length > 0) {
        addText(`Technologies: ${project.technologies.join(', ')}`, false, 20, mutedColor);
      }

      if (project.highlights.length > 0) {
        project.highlights.forEach((highlight) => {
          addBullet(highlight);
        });
      }

      if (project.url || project.github) {
        const links: string[] = [];
        if (project.url) links.push(`Live: ${project.url}`);
        if (project.github) links.push(`Code: ${project.github}`);
        addText(links.join('  |  '), false, 20, accentColor);
      }
    });
  }

  // ============ CERTIFICATIONS ============
  if (certifications.length > 0) {
    addHeading('Certifications');
    
    certifications.forEach((cert) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
              size: 24,
              color: headingColor.hex,
            }),
            new TextRun({
              text: `  -  ${cert.issuer}`,
              size: 22,
              color: accentColor.hex,
            }),
          ],
          spacing: { before: 100, after: 40 },
        })
      );

      const metaParts: string[] = [];
      if (cert.date) metaParts.push(formatDate(cert.date));
      if (cert.expiryDate) metaParts.push(`Expires: ${formatDate(cert.expiryDate)}`);
      if (cert.credentialId) metaParts.push(`Credential: ${cert.credentialId}`);
      
      if (metaParts.length > 0) {
        addText(metaParts.join('  |  '), false, 20);
      }

      if (cert.url) {
        addText(`Verify: ${cert.url}`, false, 20, accentColor);
      }
    });
  }

  // ============ LANGUAGES ============
  if (languages.length > 0) {
    addHeading('Languages');
    
    const langTexts = languages.map((l) => `${l.name} (${l.proficiency})`);
    addText(langTexts.join(', '));
  }

  // ============ CUSTOM SECTIONS ============
  custom_sections.forEach((section) => {
    addHeading(section.title);
    
    section.items.forEach((item) => {
      if (item.title) {
        addText(item.title, true, 22, headingColor, { before: 80, after: 20 });
      }
      if (item.subtitle) {
        addText(item.subtitle, false, 20, accentColor, { before: 0, after: 20 });
      }
      if (item.date) {
        addText(item.date, false, 20, mutedColor, { before: 0, after: 20 });
      }
      if (item.description) {
        addText(item.description, false, 20);
      }
    });
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
        children,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: 'Inter',
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
            color: headingColor.hex,
            size: 28,
            font: 'Inter',
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