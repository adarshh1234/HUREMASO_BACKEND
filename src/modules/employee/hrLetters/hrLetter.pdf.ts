/**
 * Pure TypeScript PDF 1.4 Binary Generator for HUREMASO HR Letters & Memos
 * Outputs standard-compliant, multi-page PDF documents without native or binary dependencies.
 */

export interface PDFDocumentOptions {
  title: string;
  documentType: 'memo' | 'notice' | 'circular' | 'letter';
  referenceNumber: string;
  date: string;
  department?: string;
  targetAudience?: string;
  author?: string;
  status: string;
  content: string;
  recipientName?: string;
  recipientId?: string;
  effectiveDate?: string;
}

/**
 * Escapes characters for PDF string literals: (, ), \
 */
function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ' '); // remove control chars
}

/**
 * Approximate font width calculator for Helvetica (in points at size 10)
 */
function estimateTextWidth(text: string, fontSize: number): number {
  // Average Helvetica char width ratio is roughly 0.52 of font size
  return text.length * fontSize * 0.52;
}

/**
 * Wraps long text into lines fitting within a max width
 */
function wrapText(text: string, maxPoints: number, fontSize: number): string[] {
  const paragraphs = text.split(/\r?\n/);
  const resultLines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      resultLines.push('');
      continue;
    }

    const words = para.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (estimateTextWidth(candidate, fontSize) <= maxPoints) {
        currentLine = candidate;
      } else {
        if (currentLine) resultLines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) {
      resultLines.push(currentLine);
    }
  }

  return resultLines;
}

export function generateHrDocumentPDF(options: PDFDocumentOptions): Buffer {
  const pageWidth = 595.28; // A4 standard width in points
  const pageHeight = 841.89; // A4 standard height in points
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  // Format type label
  const typeLabels: Record<string, string> = {
    memo: 'OFFICIAL MEMORANDUM',
    notice: 'PUBLIC HR NOTICE',
    circular: 'DEPARTMENT CIRCULAR',
    letter: 'OFFICIAL HR CORRESPONDENCE',
  };
  const typeBadge = typeLabels[options.documentType] || 'OFFICIAL COMMUNICATION';

  // Body text wrapping
  const bodyFontSize = 10.5;
  const bodyLineHeight = 16;
  const wrappedBodyLines = wrapText(options.content, contentWidth, bodyFontSize);

  // Pagination calculation
  // First page space available for body: 460 points
  // Subsequent page space available for body: 680 points
  const firstPageBodyHeight = 440;
  const subsequentPageBodyHeight = 680;

  const firstPageMaxLines = Math.floor(firstPageBodyHeight / bodyLineHeight);
  const subsequentPageMaxLines = Math.floor(subsequentPageBodyHeight / bodyLineHeight);

  const pagesBodyLines: string[][] = [];

  if (wrappedBodyLines.length <= firstPageMaxLines) {
    pagesBodyLines.push(wrappedBodyLines);
  } else {
    pagesBodyLines.push(wrappedBodyLines.slice(0, firstPageMaxLines));
    let remaining = wrappedBodyLines.slice(firstPageMaxLines);
    while (remaining.length > 0) {
      pagesBodyLines.push(remaining.slice(0, subsequentPageMaxLines));
      remaining = remaining.slice(subsequentPageMaxLines);
    }
  }

  const totalPages = pagesBodyLines.length;

  // Generate stream operations for each page
  const pageContentStreams: string[] = [];

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const isFirstPage = pageIdx === 0;
    const isLastPage = pageIdx === totalPages - 1;
    const bodyLines = pagesBodyLines[pageIdx];

    const streamOps: string[] = [];

    // --- Header Banner (Deep Teal Bar: #004848 = [0, 0.282, 0.282]) ---
    streamOps.push('q');
    streamOps.push('0 0.282 0.282 rg'); // Deep Teal fill
    streamOps.push(`${margin} ${pageHeight - 85} ${contentWidth} 48 re f`); // Top banner rectangle
    streamOps.push('Q');

    // Header Text (White on Teal)
    streamOps.push('BT');
    streamOps.push('/F2 16 Tf'); // Helvetica-Bold
    streamOps.push('1 1 1 rg'); // White
    streamOps.push(`${margin + 16} ${pageHeight - 58} Td`);
    streamOps.push(`(${escapePdfText('HUREMASO GLOBAL TECHNOLOGIES')}) Tj`);
    streamOps.push('ET');

    streamOps.push('BT');
    streamOps.push('/F1 9 Tf'); // Helvetica Regular
    streamOps.push('0.8 0.95 0.95 rg'); // Soft white/mint
    streamOps.push(`${margin + 16} ${pageHeight - 72} Td`);
    streamOps.push(`(${escapePdfText('Human Resources & Corporate Governance Management System')}) Tj`);
    streamOps.push('ET');

    // Type Badge (Right side of banner)
    streamOps.push('BT');
    streamOps.push('/F2 9 Tf');
    streamOps.push('1 1 1 rg');
    const badgeWidth = estimateTextWidth(typeBadge, 9);
    streamOps.push(`${pageWidth - margin - badgeWidth - 16} ${pageHeight - 65} Td`);
    streamOps.push(`(${escapePdfText(typeBadge)}) Tj`);
    streamOps.push('ET');

    let currentY = pageHeight - 105;

    // --- Metadata Grid (First Page Only) ---
    if (isFirstPage) {
      const metaBoxHeight = 85;
      const metaBoxY = currentY - metaBoxHeight;

      // Subtle light gray fill (#F8FAFC: [0.97, 0.98, 0.99]) with border (#CBD5E1: [0.8, 0.83, 0.88])
      streamOps.push('q');
      streamOps.push('0.97 0.98 0.99 rg');
      streamOps.push('0.8 0.83 0.88 RG');
      streamOps.push('0.75 w');
      streamOps.push(`${margin} ${metaBoxY} ${contentWidth} ${metaBoxHeight} re B`);
      streamOps.push('Q');

      // Grid items
      const col1X = margin + 14;
      const col2X = margin + contentWidth / 2 + 10;

      // Row 1
      streamOps.push('BT /F2 8.5 Tf 0.35 0.42 0.52 rg');
      streamOps.push(`${col1X} ${metaBoxY + 68} Td (REFERENCE NUMBER) Tj ET`);
      streamOps.push('BT /F1 9 Tf 0.05 0.09 0.16 rg');
      streamOps.push(`${col1X} ${metaBoxY + 54} Td (${escapePdfText(options.referenceNumber)}) Tj ET`);

      streamOps.push('BT /F2 8.5 Tf 0.35 0.42 0.52 rg');
      streamOps.push(`${col2X} ${metaBoxY + 68} Td (DATE OF ISSUE) Tj ET`);
      streamOps.push('BT /F1 9 Tf 0.05 0.09 0.16 rg');
      streamOps.push(`${col2X} ${metaBoxY + 54} Td (${escapePdfText(options.date)}) Tj ET`);

      // Row 2
      const targetLabel = options.recipientName
        ? `RECIPIENT: ${options.recipientName} (${options.recipientId || 'EMP'})`
        : `DEPARTMENT: ${options.department || 'All Organization'}`;

      streamOps.push('BT /F2 8.5 Tf 0.35 0.42 0.52 rg');
      streamOps.push(`${col1X} ${metaBoxY + 32} Td (TARGET / SCOPE) Tj ET`);
      streamOps.push('BT /F1 9 Tf 0.05 0.09 0.16 rg');
      streamOps.push(`${col1X} ${metaBoxY + 18} Td (${escapePdfText(targetLabel)}) Tj ET`);

      streamOps.push('BT /F2 8.5 Tf 0.35 0.42 0.52 rg');
      streamOps.push(`${col2X} ${metaBoxY + 32} Td (ISSUING AUTHORITY / STATUS) Tj ET`);
      streamOps.push('BT /F1 9 Tf 0.05 0.09 0.16 rg');
      const authorStatus = `${options.author || 'HR Operations'} • ${options.status.toUpperCase()}`;
      streamOps.push(`${col2X} ${metaBoxY + 18} Td (${escapePdfText(authorStatus)}) Tj ET`);

      currentY = metaBoxY - 25;

      // Document Title
      streamOps.push('BT');
      streamOps.push('/F2 14 Tf');
      streamOps.push('0.05 0.1 0.15 rg'); // Dark Navy
      streamOps.push(`${margin} ${currentY} Td`);
      streamOps.push(`(${escapePdfText(options.title)}) Tj`);
      streamOps.push('ET');

      currentY -= 20;

      // Horizontal separator line under title
      streamOps.push('q');
      streamOps.push('0 0.282 0.282 RG');
      streamOps.push('1.5 w');
      streamOps.push(`${margin} ${currentY} m ${margin + 80} ${currentY} l S`);
      streamOps.push('Q');

      currentY -= 18;
    } else {
      currentY = pageHeight - 110;
    }

    // --- Body Lines ---
    streamOps.push('BT');
    streamOps.push(`/F1 ${bodyFontSize} Tf`);
    streamOps.push('0.15 0.2 0.25 rg'); // Dark slate text
    streamOps.push(`${margin} ${currentY} Td`);

    let isFirstLine = true;
    for (const line of bodyLines) {
      if (isFirstLine) {
        streamOps.push(`(${escapePdfText(line)}) Tj`);
        isFirstLine = false;
      } else {
        streamOps.push(`0 -${bodyLineHeight} Td`);
        streamOps.push(`(${escapePdfText(line)}) Tj`);
      }
    }
    streamOps.push('ET');

    // --- Signature Block (Last Page Only) ---
    if (isLastPage) {
      const sigY = 120;
      streamOps.push('q');
      streamOps.push('0.6 0.65 0.7 RG');
      streamOps.push('1 w');
      streamOps.push(`${pageWidth - margin - 200} ${sigY} m ${pageWidth - margin} ${sigY} l S`);
      streamOps.push('Q');

      streamOps.push('BT');
      streamOps.push('/F2 9.5 Tf');
      streamOps.push('0.1 0.15 0.2 rg');
      streamOps.push(`${pageWidth - margin - 180} ${sigY - 14} Td`);
      streamOps.push(`(${escapePdfText('Authorized Human Resources Signatory')}) Tj`);
      streamOps.push('ET');

      streamOps.push('BT');
      streamOps.push('/F1 8 Tf');
      streamOps.push('0.4 0.45 0.5 rg');
      streamOps.push(`${pageWidth - margin - 165} ${sigY - 26} Td`);
      streamOps.push(`(${escapePdfText('Huremaso Global HR Operations')}) Tj`);
      streamOps.push('ET');
    }

    // --- Footer on Every Page ---
    // Divider line
    streamOps.push('q');
    streamOps.push('0.85 0.88 0.92 RG');
    streamOps.push('0.75 w');
    streamOps.push(`${margin} 50 m ${pageWidth - margin} 50 l S`);
    streamOps.push('Q');

    // Left footer text
    streamOps.push('BT');
    streamOps.push('/F1 8 Tf');
    streamOps.push('0.45 0.5 0.58 rg');
    streamOps.push(`${margin} 36 Td`);
    streamOps.push(`(${escapePdfText('HUREMASO HRMS • Confidential Official Communication')}) Tj`);
    streamOps.push('ET');

    // Right footer text (Page X of Y)
    const pageStr = `Page ${pageIdx + 1} of ${totalPages}`;
    const pageStrWidth = estimateTextWidth(pageStr, 8);
    streamOps.push('BT');
    streamOps.push('/F1 8 Tf');
    streamOps.push('0.45 0.5 0.58 rg');
    streamOps.push(`${pageWidth - margin - pageStrWidth} 36 Td`);
    streamOps.push(`(${escapePdfText(pageStr)}) Tj`);
    streamOps.push('ET');

    pageContentStreams.push(streamOps.join('\n'));
  }

  // Build the complete PDF document structure
  return assemblePdfDocument(pageWidth, pageHeight, pageContentStreams);
}

/**
 * Assembles PDF objects, xref table, and trailer
 */
function assemblePdfDocument(
  pageWidth: number,
  pageHeight: number,
  pageContentStreams: string[]
): Buffer {
  const chunks: Buffer[] = [];
  const objectOffsets: number[] = [];

  let currentByteOffset = 0;

  function write(str: string) {
    const buf = Buffer.from(str, 'utf-8');
    chunks.push(buf);
    currentByteOffset += buf.length;
  }

  // 1. PDF Header
  write('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  const totalPages = pageContentStreams.length;
  // Object IDs layout:
  // 1: Catalog
  // 2: Pages
  // 3: Font F1 (Helvetica)
  // 4: Font F2 (Helvetica-Bold)
  // Page 1: Obj 5 (Page), Obj 6 (Contents)
  // Page 2: Obj 7 (Page), Obj 8 (Contents) ...
  // Obj (5 + i * 2) = Page i
  // Obj (6 + i * 2) = Contents i

  // 1. Catalog Object
  objectOffsets[1] = currentByteOffset;
  write('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // 2. Pages Object
  const pageObjectRefs = Array.from({ length: totalPages }, (_, i) => `${5 + i * 2} 0 R`).join(' ');
  objectOffsets[2] = currentByteOffset;
  write(`2 0 obj\n<< /Type /Pages /Kids [${pageObjectRefs}] /Count ${totalPages} >>\nendobj\n`);

  // 3. Font F1 (Helvetica Regular)
  objectOffsets[3] = currentByteOffset;
  write('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n');

  // 4. Font F2 (Helvetica-Bold)
  objectOffsets[4] = currentByteOffset;
  write('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n');

  // Pages & Content Streams
  for (let i = 0; i < totalPages; i++) {
    const pageObjId = 5 + i * 2;
    const contentsObjId = 6 + i * 2;
    const streamContent = pageContentStreams[i];
    const streamBuffer = Buffer.from(streamContent, 'utf-8');

    // Page Object
    objectOffsets[pageObjId] = currentByteOffset;
    write(
      `${pageObjId} 0 obj\n` +
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> ` +
      `/Contents ${contentsObjId} 0 R >>\n` +
      `endobj\n`
    );

    // Contents Stream Object
    objectOffsets[contentsObjId] = currentByteOffset;
    write(
      `${contentsObjId} 0 obj\n` +
      `<< /Length ${streamBuffer.length} >>\n` +
      `stream\n`
    );
    chunks.push(streamBuffer);
    currentByteOffset += streamBuffer.length;
    write(`\nendstream\nendobj\n`);
  }

  // Cross-reference table
  const startXrefOffset = currentByteOffset;
  const totalObjects = 5 + totalPages * 2;

  write(`xref\n0 ${totalObjects}\n`);
  write('0000000000 65535 f \n');

  for (let objId = 1; objId < totalObjects; objId++) {
    const offset = objectOffsets[objId] || 0;
    const paddedOffset = String(offset).padStart(10, '0');
    write(`${paddedOffset} 00000 n \n`);
  }

  // Trailer
  write(
    `trailer\n` +
    `<< /Size ${totalObjects} /Root 1 0 R >>\n` +
    `startxref\n` +
    `${startXrefOffset}\n` +
    `%%EOF\n`
  );

  return Buffer.concat(chunks);
}
