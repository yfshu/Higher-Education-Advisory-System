/**
 * Professional PDF Export Utility
 * 
 * Exports program comparison to PDF with structured, professional layout
 */

import jsPDF from 'jspdf';

interface Program {
  id: number;
  name: string;
  level: string | null;
  duration: string | null;
  duration_months: number | null;
  tuition_fee_amount: number | null;
  tuition_fee_period: string | null;
  currency: string | null;
  start_month: string | null;
  deadline: string | null;
  rating: number | null;
  review_count: number | null;
  description: string | null;
  tags: string[] | null;
  entry_requirements: Record<string, any> | string | null;
  curriculum: any;
  career_outcomes: any;
  facilities: any;
  employment_rate: number | null;
  average_salary: number | null;
  satisfaction_rate: number | null;
  university: {
    id: number;
    name: string;
    city: string | null;
    state: string | null;
    email?: string | null;
    phone_number?: string | null;
    website_url?: string | null;
  } | null;
}

interface ExportOptions {
  programA: Program;
  programB: Program;
  includeAIExplanation?: boolean;
  aiExplanation?: string | null;
}

/**
 * Format currency value with proper formatting
 */
function formatCurrency(amount: number | null, currency: string | null, period: string | null): string {
  if (!amount) return '';
  const symbol = currency === 'MYR' ? 'RM' : currency || '';
  const formatted = amount.toLocaleString('en-US');
  const periodText = period ? ` per ${period.charAt(0).toUpperCase() + period.slice(1)}` : '';
  return `${symbol} ${formatted}${periodText}`;
}

/**
 * Format date string to readable format
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
}

/**
 * Format duration
 */
function formatDuration(duration: string | null, durationMonths: number | null): string {
  if (duration) return duration;
  if (durationMonths) {
    const years = Math.floor(durationMonths / 12);
    const months = durationMonths % 12;
    if (years > 0 && months > 0) {
      return `${years} Year${years > 1 ? 's' : ''} ${months} Month${months > 1 ? 's' : ''}`;
    } else if (years > 0) {
      return `${years} Year${years > 1 ? 's' : ''}`;
    } else {
      return `${months} Month${months > 1 ? 's' : ''}`;
    }
  }
  return '';
}

/**
 * Format level
 */
function formatLevel(level: string | null): string {
  if (!level) return '';
  const levelMap: Record<string, string> = {
    foundation: 'Foundation',
    diploma: 'Diploma',
    degree: 'Degree',
    bachelor: 'Bachelor',
  };
  return levelMap[level.toLowerCase()] || level;
}

/**
 * Format entry requirements into clean, human-readable format
 * Handles JSON parsing and converts to readable bulleted format
 */
function formatEntryRequirements(data: Record<string, any> | string | null): string {
  if (!data) return '';
  
  let parsed: any = data;
  
  // Check if it's a JSON string and parse it
  if (typeof data === 'string') {
    // Check if it looks like JSON
    const trimmed = data.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        parsed = JSON.parse(data);
      } catch {
        // If JSON parsing fails, clean up the string
        return data.replace(/[{}[\]"]/g, '').replace(/,/g, ', ').replace(/:/g, ': ');
      }
    } else {
      // Not JSON, return as-is
      return data;
    }
  }
  
  // If parsed is not an object, return empty
  if (typeof parsed !== 'object' || parsed === null) {
    return '';
  }
  
  const parts: string[] = [];
  
  // Handle STPM
  if (parsed.stpm || parsed.STPM) {
    const stpm = parsed.stpm || parsed.STPM;
    const stpmParts: string[] = [];
    if (stpm.cgpa !== null && stpm.cgpa !== undefined) {
      stpmParts.push(`CGPA ${stpm.cgpa}`);
    }
    if (stpm.subjects && Array.isArray(stpm.subjects) && stpm.subjects.length > 0) {
      stpmParts.push(`Subjects: ${stpm.subjects.join(', ')}`);
    }
    if (stpmParts.length > 0) {
      parts.push(`STPM: ${stpmParts.join('; ')}`);
    }
  }
  
  // Handle A-Level
  if (parsed.a_level || parsed['A Level'] || parsed['A-Level'] || parsed.aLevel) {
    const alevel = parsed.a_level || parsed['A Level'] || parsed['A-Level'] || parsed.aLevel;
    const alevelParts: string[] = [];
    if (alevel.grade) {
      alevelParts.push(`Grade ${alevel.grade}`);
    }
    if (alevel.minimum_passes !== null && alevel.minimum_passes !== undefined) {
      alevelParts.push(`Minimum Passes: ${alevel.minimum_passes}`);
    }
    if (alevel.subjects && Array.isArray(alevel.subjects) && alevel.subjects.length > 0) {
      alevelParts.push(`Subjects: ${alevel.subjects.join(', ')}`);
    }
    if (alevelParts.length > 0) {
      parts.push(`A-Level: ${alevelParts.join('; ')}`);
    }
  }
  
  // Handle Diploma
  if (parsed.diploma || parsed.Diploma) {
    const diploma = parsed.diploma || parsed.Diploma;
    if (typeof diploma === 'object' && diploma !== null) {
      const diplomaParts: string[] = [];
      if (diploma.cgpa !== null && diploma.cgpa !== undefined) {
        diplomaParts.push(`CGPA ${diploma.cgpa}`);
      }
      if (diploma.subjects && Array.isArray(diploma.subjects) && diploma.subjects.length > 0) {
        diplomaParts.push(`Subjects: ${diploma.subjects.join(', ')}`);
      }
      if (diplomaParts.length > 0) {
        parts.push(`Diploma: ${diplomaParts.join('; ')}`);
      }
    } else if (typeof diploma === 'number' || typeof diploma === 'string') {
      parts.push(`Diploma: CGPA ${diploma}`);
    }
  }
  
  // Handle Foundation
  if (parsed.foundation || parsed.Foundation) {
    const foundation = parsed.foundation || parsed.Foundation;
    if (typeof foundation === 'object' && foundation !== null) {
      const foundationParts: string[] = [];
      if (foundation.cgpa !== null && foundation.cgpa !== undefined) {
        foundationParts.push(`CGPA ${foundation.cgpa}`);
      }
      if (foundation.subjects && Array.isArray(foundation.subjects) && foundation.subjects.length > 0) {
        foundationParts.push(`Subjects: ${foundation.subjects.join(', ')}`);
      }
      if (foundationParts.length > 0) {
        parts.push(`Foundation: ${foundationParts.join('; ')}`);
      }
    } else if (typeof foundation === 'number' || typeof foundation === 'string') {
      parts.push(`Foundation: CGPA ${foundation}`);
    }
  }
  
  // Handle other fields (avoid duplicates)
  const handledKeys = new Set(['stpm', 'STPM', 'a_level', 'A Level', 'A-Level', 'aLevel', 'diploma', 'Diploma', 'foundation', 'Foundation']);
  
  for (const [key, value] of Object.entries(parsed)) {
    if (handledKeys.has(key)) continue;
    
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const subParts: string[] = [];
        for (const [subKey, subValue] of Object.entries(value)) {
          if (subValue !== null && subValue !== undefined && subValue !== '') {
            if (Array.isArray(subValue)) {
              subParts.push(`${subKey}: ${subValue.join(', ')}`);
            } else {
              subParts.push(`${subKey}: ${String(subValue)}`);
            }
          }
        }
        if (subParts.length > 0) {
          parts.push(`${key}: ${subParts.join('; ')}`);
        }
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          parts.push(`${key}: ${value.join(', ')}`);
        }
      } else {
        parts.push(`${key}: ${String(value)}`);
      }
    }
  }
  
  return parts.join(' • ') || '';
}

/**
 * Parse curriculum
 */
function parseCurriculum(curriculum: any): string {
  if (!curriculum) return '';
  if (typeof curriculum === 'string') {
    try {
      curriculum = JSON.parse(curriculum);
    } catch {
      return curriculum;
    }
  }
  if (Array.isArray(curriculum)) {
    return curriculum.map((item: any) => {
      if (typeof item === 'string') return item;
      if (item.subjects) return item.subjects.join(', ');
      return String(item);
    }).join(', ');
  }
  if (typeof curriculum === 'object') {
    const subjects: string[] = [];
    for (const [key, value] of Object.entries(curriculum)) {
      if (Array.isArray(value)) {
        subjects.push(...value.map(v => String(v)));
      }
    }
    return subjects.join(', ') || '';
  }
  return '';
}

/**
 * Parse facilities
 */
function parseFacilities(facilities: any): string {
  if (!facilities) return '';
  if (typeof facilities === 'string') {
    try {
      facilities = JSON.parse(facilities);
    } catch {
      return facilities;
    }
  }
  if (Array.isArray(facilities)) {
    return facilities.join(', ');
  }
  if (typeof facilities === 'object') {
    const allFacilities: string[] = [];
    for (const value of Object.values(facilities)) {
      if (Array.isArray(value)) {
        allFacilities.push(...value.map(v => String(v)));
      }
    }
    return allFacilities.join(', ') || '';
  }
  return '';
}

/**
 * Parse career outcomes
 */
function parseCareerOutcomes(outcomes: any): string {
  if (!outcomes) return '';
  if (typeof outcomes === 'string') {
    try {
      outcomes = JSON.parse(outcomes);
    } catch {
      return outcomes;
    }
  }
  if (Array.isArray(outcomes)) {
    return outcomes.map((outcome: any) => {
      if (typeof outcome === 'string') return outcome;
      if (outcome.role) return outcome.role;
      return String(outcome);
    }).join(', ');
  }
  return '';
}

/**
 * Split text into lines that fit within width with proper word breaking
 */
function splitText(pdf: jsPDF, text: string, maxWidth: number, fontSize: number = 10): string[] {
  if (!text || text.trim() === '') return [];
  pdf.setFontSize(fontSize);
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = pdf.getTextWidth(testLine);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [];
}

/**
 * Draw a key-value pair in a 2-column grid
 */
function drawKeyValue(
  pdf: jsPDF,
  x: number,
  y: number,
  key: string,
  value: string,
  keyWidth: number = 60,
  valueWidth: number = 120,
  fontSize: number = 10
): number {
  pdf.setFontSize(fontSize);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(60, 60, 60);
  
  // Draw key
  const keyLines = splitText(pdf, key, keyWidth - 4, fontSize);
  let currentY = y;
  for (const line of keyLines) {
    pdf.text(line, x, currentY);
    currentY += 5;
  }
  
  // Draw value
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  const valueX = x + keyWidth;
  const valueLines = splitText(pdf, value, valueWidth - 4, fontSize);
  let valueY = y;
  for (const line of valueLines) {
    pdf.text(line, valueX, valueY);
    valueY += 5;
  }
  
  return Math.max(currentY, valueY + valueLines.length * 5);
}

/**
 * Draw a section header with consistent styling
 */
function drawSectionHeader(pdf: jsPDF, x: number, y: number, width: number, title: string): number {
  // Background - consistent system blue
  pdf.setFillColor(37, 99, 235);
  pdf.rect(x, y, width, 8, 'F');
  
  // Text - white and bold
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text(title, x + 3, y + 6);
  
  return y + 10;
}

/**
 * Draw comparison table row with fixed column widths and proper text wrapping
 * Returns the same Y position if row should be skipped (both values empty)
 */
function drawComparisonRow(
  pdf: jsPDF,
  x: number,
  y: number,
  label: string,
  valueA: string,
  valueB: string,
  colWidths: number[] = [60, 65, 65]
): number {
  const fontSize = 9;
  const padding = 3;
  const lineHeight = 4.5;
  pdf.setFontSize(fontSize);
  
  // Remove empty/N/A values and trim
  const cleanA = valueA ? String(valueA).trim() : '';
  const cleanB = valueB ? String(valueB).trim() : '';
  
  // Skip if both values are empty/null/undefined/N/A - return same Y to effectively skip the row
  // This prevents rendering empty "ghost" rows
  if ((!cleanA || cleanA === '' || cleanA === 'N/A' || cleanA === 'null' || cleanA === 'undefined') && 
      (!cleanB || cleanB === '' || cleanB === 'N/A' || cleanB === 'null' || cleanB === 'undefined')) {
    return y; // Skip this row - return same Y position
  }
  
  // Calculate heights with fixed widths
  const labelLines = splitText(pdf, label, colWidths[0] - 6, fontSize);
  const valueALines = splitText(pdf, cleanA || 'N/A', colWidths[1] - 6, fontSize);
  const valueBLines = splitText(pdf, cleanB || 'N/A', colWidths[2] - 6, fontSize);
  const maxLines = Math.max(labelLines.length, valueALines.length, valueBLines.length);
  const rowHeight = Math.max(8, (maxLines * lineHeight) + (padding * 2));
  
  // Draw cell borders - thin, light grey
  pdf.setDrawColor(226, 232, 240); // #e2e8f0
  pdf.setLineWidth(0.1);
  pdf.rect(x, y, colWidths[0], rowHeight, 'D');
  pdf.rect(x + colWidths[0], y, colWidths[1], rowHeight, 'D');
  pdf.rect(x + colWidths[0] + colWidths[1], y, colWidths[2], rowHeight, 'D');
  
  // Draw label (bold, left-aligned)
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(60, 60, 60);
  let labelY = y + padding + 3;
  for (const line of labelLines) {
    pdf.text(line, x + padding, labelY);
    labelY += lineHeight;
  }
  
  // Draw values (normal, left-aligned)
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  let valueAY = y + padding + 3;
  for (const line of valueALines) {
    pdf.text(line, x + colWidths[0] + padding, valueAY);
    valueAY += lineHeight;
  }
  
  let valueBY = y + padding + 3;
  for (const line of valueBLines) {
    pdf.text(line, x + colWidths[0] + colWidths[1] + padding, valueBY);
    valueBY += lineHeight;
  }
  
  return y + rowHeight;
}

/**
 * Export comparison to PDF
 */
export async function exportComparisonToPdf(
  elementId: string,
  options: ExportOptions,
): Promise<void> {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pdfWidth - (margin * 2);
    
    let yPosition = margin;
    
    // ===== HEADER =====
    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, pdfWidth, 25, 'F');
    
    // Logo/Title - vertically centered in blue bar
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('BackToSchool', margin, 16);
    
    // Subtitle - vertically centered
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Program Comparison Report', margin, 22);
    
    // Generated date - vertically centered, right-aligned
    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on ${generatedDate}`, pdfWidth - margin, 19, { align: 'right' });
    
    yPosition = 30;
    
    // ===== PROGRAM HEADERS =====
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Program A', margin, yPosition);
    pdf.text('Program B', pdfWidth / 2 + 5, yPosition);
    
    yPosition += 8;
    
    // Program names
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const nameALines = splitText(pdf, options.programA.name, (pdfWidth / 2) - margin - 5, 11);
    const nameBLines = splitText(pdf, options.programB.name, (pdfWidth / 2) - margin - 5, 11);
    let nameY = yPosition;
    for (const line of nameALines) {
      pdf.text(line, margin, nameY);
      nameY += 5;
    }
    nameY = yPosition;
    for (const line of nameBLines) {
      pdf.text(line, pdfWidth / 2 + 5, nameY);
      nameY += 5;
    }
    yPosition = Math.max(nameY, yPosition + nameALines.length * 5) + 5;
    
    // ===== COMPARISON TABLE =====
    // Fixed column widths for consistency
    const colWidths = [60, 65, 65];
    const totalTableWidth = colWidths[0] + colWidths[1] + colWidths[2];
    
    // Table header with consistent blue background
    pdf.setFillColor(37, 99, 235);
    pdf.rect(margin, yPosition, colWidths[0], 8, 'F');
    pdf.rect(margin + colWidths[0], yPosition, colWidths[1], 8, 'F');
    pdf.rect(margin + colWidths[0] + colWidths[1], yPosition, colWidths[2], 8, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('Attribute', margin + 3, yPosition + 6);
    pdf.text('Program A', margin + colWidths[0] + 3, yPosition + 6);
    pdf.text('Program B', margin + colWidths[0] + colWidths[1] + 3, yPosition + 6);
    yPosition += 10;
    
    // Basic Information Section
    yPosition = drawSectionHeader(pdf, margin, yPosition, totalTableWidth, 'Basic Information');
    
    const basicFields = [
      { label: 'University', getValue: (p: Program) => p.university?.name || '' },
      { label: 'Location', getValue: (p: Program) => {
        if (!p.university) return '';
        const parts = [p.university.city, p.university.state].filter(Boolean);
        return parts.length > 0 ? `${parts.join(', ')}, Malaysia` : 'Malaysia';
      }},
      { label: 'Level', getValue: (p: Program) => formatLevel(p.level) },
      { label: 'Description', getValue: (p: Program) => p.description || '' },
    ];
    
    for (const field of basicFields) {
      const valueA = field.getValue(options.programA);
      const valueB = field.getValue(options.programB);
      
      // Skip if both values are empty
      if ((!valueA || valueA === 'N/A' || valueA.trim() === '') && 
          (!valueB || valueB === 'N/A' || valueB.trim() === '')) {
        continue;
      }
      
      // Check page break - estimate row height first
      pdf.setFontSize(9);
      const testHeight = Math.max(
        splitText(pdf, valueA || '', colWidths[1] - 6, 9).length,
        splitText(pdf, valueB || '', colWidths[2] - 6, 9).length,
        1
      ) * 4.5 + 6;
      
      if (yPosition + testHeight > pdfHeight - 25) {
        pdf.addPage();
        yPosition = margin;
        // Do NOT redraw table header - only redraw section header
        yPosition = drawSectionHeader(pdf, margin, yPosition, totalTableWidth, 'Basic Information');
      }
      
      const newY = drawComparisonRow(
        pdf,
        margin,
        yPosition,
        field.label,
        valueA,
        valueB,
        colWidths
      );
      
      // Only advance if row was actually drawn
      if (newY > yPosition) {
        yPosition = newY + 1;
      }
    }
    
    yPosition += 3;
    
    // Academic Details Section
    if (yPosition > pdfHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }
    yPosition = drawSectionHeader(pdf, margin, yPosition, totalTableWidth, 'Academic Details');
    
    const academicFields = [
      { label: 'Duration', getValue: (p: Program) => formatDuration(p.duration, p.duration_months) },
      { label: 'Start Month', getValue: (p: Program) => p.start_month || '' },
      { label: 'Application Deadline', getValue: (p: Program) => formatDate(p.deadline) },
      { label: 'Entry Requirements', getValue: (p: Program) => formatEntryRequirements(p.entry_requirements) },
      { label: 'Curriculum', getValue: (p: Program) => parseCurriculum(p.curriculum) },
      { label: 'Facilities', getValue: (p: Program) => parseFacilities(p.facilities) },
    ];
    
    for (const field of academicFields) {
      const valueA = field.getValue(options.programA);
      const valueB = field.getValue(options.programB);
      
      // Skip if both values are empty
      if ((!valueA || valueA === 'N/A' || valueA.trim() === '') && 
          (!valueB || valueB === 'N/A' || valueB.trim() === '')) {
        continue;
      }
      
      // Check page break
      pdf.setFontSize(9);
      const testHeight = Math.max(
        splitText(pdf, valueA || '', colWidths[1] - 6, 9).length,
        splitText(pdf, valueB || '', colWidths[2] - 6, 9).length,
        1
      ) * 4.5 + 6;
      
      if (yPosition + testHeight > pdfHeight - 25) {
        pdf.addPage();
        yPosition = margin;
        // Do NOT redraw table header - only redraw section header
        yPosition = drawSectionHeader(pdf, margin, yPosition, totalTableWidth, 'Academic Details');
      }
      
      const newY = drawComparisonRow(
        pdf,
        margin,
        yPosition,
        field.label,
        valueA,
        valueB,
        colWidths
      );
      
      if (newY > yPosition) {
        yPosition = newY + 1;
      }
    }
    
    yPosition += 3;
    
    // Financial Information Section
    if (yPosition > pdfHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }
    yPosition = drawSectionHeader(pdf, margin, yPosition, totalTableWidth, 'Financial Information');
    
    const financialFields = [
      { label: 'Tuition Fee', getValue: (p: Program) => formatCurrency(p.tuition_fee_amount, p.currency, p.tuition_fee_period) },
    ];
    
    for (const field of financialFields) {
      const valueA = field.getValue(options.programA);
      const valueB = field.getValue(options.programB);
      
      if ((!valueA || valueA === 'N/A' || valueA.trim() === '') && 
          (!valueB || valueB === 'N/A' || valueB.trim() === '')) {
        continue;
      }
      
      if (yPosition > pdfHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      
      const newY = drawComparisonRow(
        pdf,
        margin,
        yPosition,
        field.label,
        valueA,
        valueB,
        colWidths
      );
      
      if (newY > yPosition) {
        yPosition = newY + 1;
      }
    }
    
    yPosition += 3;
    
    // Career Outcomes Section
    if (yPosition > pdfHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }
    yPosition = drawSectionHeader(pdf, margin, yPosition, totalTableWidth, 'Career Outcomes & Performance');
    
    const outcomeFields = [
      { label: 'Employment Rate', getValue: (p: Program) => p.employment_rate ? `${p.employment_rate}%` : '' },
      { label: 'Average Salary', getValue: (p: Program) => p.average_salary ? `RM ${p.average_salary.toLocaleString()}/month` : '' },
      { label: 'Career Outcomes', getValue: (p: Program) => parseCareerOutcomes(p.career_outcomes) },
      { label: 'Satisfaction Rate', getValue: (p: Program) => p.satisfaction_rate ? `${p.satisfaction_rate}%` : '' },
    ];
    
    for (const field of outcomeFields) {
      const valueA = field.getValue(options.programA);
      const valueB = field.getValue(options.programB);
      
      if ((!valueA || valueA === 'N/A' || valueA.trim() === '') && 
          (!valueB || valueB === 'N/A' || valueB.trim() === '')) {
        continue;
      }
      
      pdf.setFontSize(9);
      const testHeight = Math.max(
        splitText(pdf, valueA || '', colWidths[1] - 6, 9).length,
        splitText(pdf, valueB || '', colWidths[2] - 6, 9).length,
        1
      ) * 4.5 + 6;
      
      if (yPosition + testHeight > pdfHeight - 25) {
        pdf.addPage();
        yPosition = margin;
        // Do NOT redraw table header - only redraw section header
        yPosition = drawSectionHeader(pdf, margin, yPosition, totalTableWidth, 'Career Outcomes & Performance');
      }
      
      const newY = drawComparisonRow(
        pdf,
        margin,
        yPosition,
        field.label,
        valueA,
        valueB,
        colWidths
      );
      
      if (newY > yPosition) {
        yPosition = newY + 1;
      }
    }
    
    yPosition += 3;
    
    // Ratings Section
    if (yPosition > pdfHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }
    yPosition = drawSectionHeader(pdf, margin, yPosition, totalTableWidth, 'Ratings & Reviews');
    
    const ratingFields = [
      { label: 'Rating', getValue: (p: Program) => p.rating ? `${p.rating.toFixed(1)} / 5.0` : '' },
      { label: 'Review Count', getValue: (p: Program) => p.review_count ? p.review_count.toLocaleString() : '' },
    ];
    
    for (const field of ratingFields) {
      const valueA = field.getValue(options.programA);
      const valueB = field.getValue(options.programB);
      
      if ((!valueA || valueA === 'N/A' || valueA.trim() === '') && 
          (!valueB || valueB === 'N/A' || valueB.trim() === '')) {
        continue;
      }
      
      if (yPosition > pdfHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      
      const newY = drawComparisonRow(
        pdf,
        margin,
        yPosition,
        field.label,
        valueA,
        valueB,
        colWidths
      );
      
      if (newY > yPosition) {
        yPosition = newY + 1;
      }
    }
    
    // AI Explanation Section
    if (options.includeAIExplanation && options.aiExplanation) {
      // Add spacing before AI section to avoid overlap with Ratings
      yPosition += 8;
      
      // Check if we need a new page - ensure clean break
      if (yPosition > pdfHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }
      
      // Draw section header with extra margin-bottom
      yPosition = drawSectionHeader(pdf, margin, yPosition, totalTableWidth, 'AI Comparison Summary');
      
      // Add significant padding after header (padding-top: 12px = ~3mm, but we'll use 5mm for clarity)
      // This ensures text starts clearly below the blue header (display: block equivalent)
      yPosition += 5;
      
      // Set text styling for AI summary - 9pt font, 1.4 line height for readability
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      const lineHeight = 4.2; // 1.4 line height (9pt * 1.4 = 12.6pt = ~4.2mm)
      
      const aiLines = splitText(pdf, options.aiExplanation, contentWidth - 6, 9);
      for (const line of aiLines) {
        // Check page break - ensure we have space for footer (page-break-inside: avoid)
        if (yPosition + lineHeight > pdfHeight - 20) {
          pdf.addPage();
          yPosition = margin;
          // Redraw section header on new page
          yPosition = drawSectionHeader(pdf, margin, yPosition, totalTableWidth, 'AI Comparison Summary');
          yPosition += 5; // Same padding after header
        }
        pdf.text(line, margin + 3, yPosition);
        yPosition += lineHeight;
      }
    }
    
    // Footer on all pages - ensure it's at the very bottom
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.setFont('helvetica', 'normal');
      
      // Page number - centered at bottom
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pdfWidth / 2,
        pdfHeight - 8,
        { align: 'center' }
      );
    }
    
    // Set metadata
    const fileName = `Program_Comparison_${(options.programA.name || 'ProgramA').substring(0, 30).replace(/[^a-z0-9]/gi, '_')}_vs_${(options.programB.name || 'ProgramB').substring(0, 30).replace(/[^a-z0-9]/gi, '_')}.pdf`
      .toLowerCase();
    
    pdf.setProperties({
      title: `Program Comparison: ${options.programA.name || 'Program A'} vs ${options.programB.name || 'Program B'}`,
      subject: 'University Program Comparison',
      author: 'BackToSchool',
      creator: 'BackToSchool Platform',
    });

    pdf.save(fileName);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}
