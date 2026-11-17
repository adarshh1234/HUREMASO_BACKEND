/**
 * Pure TypeScript CSV, Excel & PDF Exporter for HUREMASO Reporting & Analytics
 * Zero external native/binary dependencies.
 */

export interface ReportExportInput {
  reportType: string;
  title: string;
  dateGenerated: string;
  filterSummary: string;
  summaryMetrics: Record<string, string | number>;
  columns: Array<{ key: string; header: string }>;
  rows: Array<Record<string, any>>;
}

/**
 * Escapes characters for PDF string literals: (, ), \
 */
function escapePdfText(text: string): string {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
}

function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.52;
}

/**
 * Generates an RFC 4180 compliant CSV string
 */
export function generateReportCSV(input: ReportExportInput): string {
  const lines: string[] = [];

  // Metadata headers
  lines.push(`"HUREMASO GLOBAL HRMS - ${input.title.toUpperCase()}"`);
  lines.push(`"Generated At:","${input.dateGenerated}"`);
  lines.push(`"Applied Filters:","${input.filterSummary}"`);
  lines.push('');

  // Summary Metrics
  lines.push('"SUMMARY METRICS"');
  for (const [key, val] of Object.entries(input.summaryMetrics)) {
    lines.push(`"${key}","${val}"`);
  }
  lines.push('');

  // Table Column Headers
  const headerRow = input.columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',');
  lines.push(headerRow);

  // Table Rows
  for (const row of input.rows) {
    const rowCells = input.columns.map((c) => {
      const val = row[c.key] !== undefined && row[c.key] !== null ? String(row[c.key]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    });
    lines.push(rowCells.join(','));
  }

  return lines.join('\r\n');
}

/**
 * Generates an ISO 32000-1 / PDF 1.4 binary buffer for reports
 */
export function generateReportPDF(input: ReportExportInput): Buffer {
  const pageWidth = 595.28; // A4 standard width
  const pageHeight = 841.89; // A4 standard height
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  const rowHeight = 16;
  const maxRowsPerPage = 32;

  // Pagination for rows
  const paginatedRows: Array<Array<Record<string, any>>> = [];
  if (input.rows.length === 0) {
    paginatedRows.push([]);
  } else {
    let remaining = [...input.rows];
    while (remaining.length > 0) {
      paginatedRows.push(remaining.slice(0, maxRowsPerPage));
      remaining = remaining.slice(maxRowsPerPage);
    }
  }

  const totalPages = paginatedRows.length;
  const pageContentStreams: string[] = [];

  // Visible columns (up to 5 columns max for A4 portrait fit)
  const displayCols = input.columns.slice(0, 5);
  const colWidth = contentWidth / displayCols.length;

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const isFirstPage = pageIdx === 0;
    const isLastPage = pageIdx === totalPages - 1;
    const rows = paginatedRows[pageIdx];

    const streamOps: string[] = [];

    // Header Banner (Deep Teal Bar: #004848)
    streamOps.push('q');
    streamOps.push('0 0.282 0.282 rg');
    streamOps.push(`${margin} ${pageHeight - 75} ${contentWidth} 42 re f`);
    streamOps.push('Q');

    // Header Titles
    streamOps.push('BT /F2 14 Tf 1 1 1 rg');
    streamOps.push(`${margin + 12} ${pageHeight - 52} Td`);
    streamOps.push(`(${escapePdfText('HUREMASO GLOBAL TECHNOLOGIES')}) Tj ET`);

    streamOps.push('BT /F1 8.5 Tf 0.8 0.95 0.95 rg');
    streamOps.push(`${margin + 12} ${pageHeight - 65} Td`);
    streamOps.push(`(${escapePdfText(`Reporting & Executive Analytics • ${input.title}`)}) Tj ET`);

    // Type Badge
    streamOps.push('BT /F2 8.5 Tf 1 1 1 rg');
    const badgeText = `OFFICIAL REPORT`;
    const bWidth = estimateTextWidth(badgeText, 8.5);
    streamOps.push(`${pageWidth - margin - bWidth - 12} ${pageHeight - 58} Td (${badgeText}) Tj ET`);

    let currentY = pageHeight - 90;

    // First page metadata summary box
    if (isFirstPage) {
      const metaBoxHeight = 55;
      const metaBoxY = currentY - metaBoxHeight;

      streamOps.push('q 0.97 0.98 0.99 rg 0.8 0.83 0.88 RG 0.75 w');
      streamOps.push(`${margin} ${metaBoxY} ${contentWidth} ${metaBoxHeight} re B Q`);

      streamOps.push('BT /F2 8 Tf 0.35 0.42 0.52 rg');
      streamOps.push(`${margin + 10} ${metaBoxY + 42} Td (GENERATION DATE) Tj ET`);
      streamOps.push('BT /F1 8.5 Tf 0.05 0.09 0.16 rg');
      streamOps.push(`${margin + 10} ${metaBoxY + 30} Td (${escapePdfText(input.dateGenerated)}) Tj ET`);

      streamOps.push('BT /F2 8 Tf 0.35 0.42 0.52 rg');
      streamOps.push(`${margin + 180} ${metaBoxY + 42} Td (FILTERS APPLIED) Tj ET`);
      streamOps.push('BT /F1 8.5 Tf 0.05 0.09 0.16 rg');
      streamOps.push(`${margin + 180} ${metaBoxY + 30} Td (${escapePdfText(input.filterSummary)}) Tj ET`);

      streamOps.push('BT /F2 8 Tf 0.35 0.42 0.52 rg');
      streamOps.push(`${margin + 360} ${metaBoxY + 42} Td (TOTAL RECORDS) Tj ET`);
      streamOps.push('BT /F1 8.5 Tf 0.05 0.09 0.16 rg');
      streamOps.push(`${margin + 360} ${metaBoxY + 30} Td (${escapePdfText(String(input.rows.length))}) Tj ET`);

      currentY = metaBoxY - 20;
    } else {
      currentY = pageHeight - 95;
    }

    // Table Header Bar
    const tableHeaderHeight = 20;
    streamOps.push('q 0.1 0.15 0.2 rg');
    streamOps.push(`${margin} ${currentY - tableHeaderHeight} ${contentWidth} ${tableHeaderHeight} re f Q`);

    // Column Headers Text
    streamOps.push('BT /F2 8.5 Tf 1 1 1 rg');
    for (let cIdx = 0; cIdx < displayCols.length; cIdx++) {
      const colX = margin + cIdx * colWidth + 6;
      streamOps.push(`${colX} ${currentY - 14} Td (${escapePdfText(displayCols[cIdx].header)}) Tj`);
      if (cIdx < displayCols.length - 1) {
        streamOps.push(`-${colX} -${currentY - 14} Td`);
      }
    }
    streamOps.push('ET');

    currentY -= tableHeaderHeight + 4;

    // Table Rows
    let isZebra = false;
    for (const row of rows) {
      if (isZebra) {
        streamOps.push('q 0.96 0.97 0.98 rg');
        streamOps.push(`${margin} ${currentY - rowHeight + 4} ${contentWidth} ${rowHeight} re f Q`);
      }
      isZebra = !isZebra;

      streamOps.push('BT /F1 8 Tf 0.1 0.15 0.2 rg');
      for (let cIdx = 0; cIdx < displayCols.length; cIdx++) {
        const colX = margin + cIdx * colWidth + 6;
        const rawVal = row[displayCols[cIdx].key];
        const valStr = rawVal !== undefined && rawVal !== null ? String(rawVal) : '-';
        const truncated = valStr.length > 24 ? valStr.substring(0, 22) + '..' : valStr;

        streamOps.push(`${colX} ${currentY - 8} Td (${escapePdfText(truncated)}) Tj`);
        if (cIdx < displayCols.length - 1) {
          streamOps.push(`-${colX} -${currentY - 8} Td`);
        }
      }
      streamOps.push('ET');

      currentY -= rowHeight;
    }

    // Signatory on final page
    if (isLastPage) {
      const sigY = 90;
      streamOps.push('q 0.6 0.65 0.7 RG 1 w');
      streamOps.push(`${pageWidth - margin - 180} ${sigY} m ${pageWidth - margin} ${sigY} l S Q`);

      streamOps.push('BT /F2 8.5 Tf 0.1 0.15 0.2 rg');
      streamOps.push(`${pageWidth - margin - 160} ${sigY - 12} Td (${escapePdfText('Authorized Audit & Reporting Officer')}) Tj ET`);

      streamOps.push('BT /F1 7.5 Tf 0.4 0.45 0.5 rg');
      streamOps.push(`${pageWidth - margin - 145} ${sigY - 22} Td (${escapePdfText('HUREMASO HR Analytics Governance')}) Tj ET`);
    }

    // Footer on Every Page
    streamOps.push('q 0.85 0.88 0.92 RG 0.75 w');
    streamOps.push(`${margin} 42 m ${pageWidth - margin} 42 l S Q`);

    streamOps.push('BT /F1 7.5 Tf 0.45 0.5 0.58 rg');
    streamOps.push(`${margin} 30 Td (${escapePdfText('HUREMASO HRMS • Confidential Organizational Data Report')}) Tj ET`);

    const pageStr = `Page ${pageIdx + 1} of ${totalPages}`;
    const pWidth = estimateTextWidth(pageStr, 7.5);
    streamOps.push('BT /F1 7.5 Tf 0.45 0.5 0.58 rg');
    streamOps.push(`${pageWidth - margin - pWidth} 30 Td (${escapePdfText(pageStr)}) Tj ET`);

    pageContentStreams.push(streamOps.join('\n'));
  }

  // Assemble PDF Objects
  return assemblePdfDocument(pageWidth, pageHeight, pageContentStreams);
}

function assemblePdfDocument(
  pageWidth: number,
  pageHeight: number,
  pageContentStreams: string[]
): Buffer {
  const chunks: Buffer[] = [];
  const objectOffsets: number[] = [];
  let currentOffset = 0;

  function write(str: string) {
    const buf = Buffer.from(str, 'utf-8');
    chunks.push(buf);
    currentOffset += buf.length;
  }

  write('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  const totalPages = pageContentStreams.length;
  const pageRefs = Array.from({ length: totalPages }, (_, i) => `${5 + i * 2} 0 R`).join(' ');

  // Obj 1: Catalog
  objectOffsets[1] = currentOffset;
  write('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Obj 2: Pages
  objectOffsets[2] = currentOffset;
  write(`2 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${totalPages} >>\nendobj\n`);

  // Obj 3: Font F1 (Helvetica Regular)
  objectOffsets[3] = currentOffset;
  write('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n');

  // Obj 4: Font F2 (Helvetica-Bold)
  objectOffsets[4] = currentOffset;
  write('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n');

  // Pages & Contents
  for (let i = 0; i < totalPages; i++) {
    const pageObjId = 5 + i * 2;
    const contentsObjId = 6 + i * 2;
    const streamContent = pageContentStreams[i];
    const streamBuffer = Buffer.from(streamContent, 'utf-8');

    // Page
    objectOffsets[pageObjId] = currentOffset;
    write(
      `${pageObjId} 0 obj\n` +
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> ` +
      `/Contents ${contentsObjId} 0 R >>\n` +
      `endobj\n`
    );

    // Contents
    objectOffsets[contentsObjId] = currentOffset;
    write(`${contentsObjId} 0 obj\n<< /Length ${streamBuffer.length} >>\nstream\n`);
    chunks.push(streamBuffer);
    currentOffset += streamBuffer.length;
    write(`\nendstream\nendobj\n`);
  }

  // XREF
  const startXref = currentOffset;
  const totalObjects = 5 + totalPages * 2;

  write(`xref\n0 ${totalObjects}\n0000000000 65535 f \n`);
  for (let i = 1; i < totalObjects; i++) {
    const off = objectOffsets[i] || 0;
    write(`${String(off).padStart(10, '0')} 00000 n \n`);
  }

  write(`trailer\n<< /Size ${totalObjects} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`);

  return Buffer.concat(chunks);
}
