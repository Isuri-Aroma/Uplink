import { jsPDF } from 'jspdf';

// Shared layout for Uplink PDFs (A4, mm)
const BLUE = [11, 107, 203];
const INK = [12, 34, 48];
const MUTED = [85, 112, 128];
const LINE = [215, 230, 234];
const LEFT = 14;
const WIDTH = 182;

export function createPdf(title, reference) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Header band with the U-arrow logo
  doc.setFillColor(...BLUE).rect(0, 0, 210, 30, 'F');
  doc.setFillColor(255, 255, 255).roundedRect(LEFT, 8, 14, 14, 3, 3, 'F');
  doc.setDrawColor(...BLUE).setLineWidth(1.2).setLineCap('round');
  doc.line(18.2, 12.6, 18.2, 16.4);
  doc.line(23.8, 12, 23.8, 16.4);
  doc.lines([[0, 1.6], [1.4, 2.8, 4.2, 2.8, 5.6, 0]], 18.2, 16.4, [1, 1], 'S');
  doc.line(22.2, 13.6, 23.8, 12);
  doc.line(23.8, 12, 25.4, 13.6);

  doc.setTextColor(255, 255, 255).setFont('helvetica', 'bold').setFontSize(17).text('Uplink', 32, 16.5);
  doc.setFont('helvetica', 'normal').setFontSize(9).text(title, 32, 22);
  doc.setFont('courier', 'bold').setFontSize(15).text(reference, 196, 16.5, { align: 'right' });
  doc.setFont('helvetica', 'normal').setFontSize(8).text(`Printed ${new Date().toLocaleString('en-GB')}`, 196, 22, { align: 'right' });

  return { doc, y: 40 };
}

export function section(pdf, title) {
  const { doc } = pdf;
  doc.setTextColor(...BLUE).setFont('helvetica', 'bold').setFontSize(9).text(title.toUpperCase(), LEFT, pdf.y);
  doc.setDrawColor(...LINE).setLineWidth(0.3).line(LEFT, pdf.y + 2, LEFT + WIDTH, pdf.y + 2);
  pdf.y += 8;
}

// Rows of label/value pairs, `cols` per row
export function fields(pdf, items, cols = 3) {
  const { doc } = pdf;
  const colW = WIDTH / cols;
  for (let i = 0; i < items.length; i += cols) {
    let rowH = 0;
    items.slice(i, i + cols).forEach(([label, value, span = 1], j) => {
      const x = LEFT + j * colW;
      doc.setTextColor(...MUTED).setFont('helvetica', 'normal').setFontSize(7.5).text(label.toUpperCase(), x, pdf.y);
      const lines = doc.setTextColor(...INK).setFontSize(10).splitTextToSize(String(value ?? '-'), colW * span - 4);
      doc.text(lines, x, pdf.y + 5);
      rowH = Math.max(rowH, 5 + lines.length * 4.6);
    });
    pdf.y += rowH + 4;
  }
  pdf.y += 2;
}

// Empty ruled box for handwriting
export function writingBox(pdf, label, lines = 3) {
  const { doc } = pdf;
  const h = 8 + lines * 7;
  doc.setDrawColor(...LINE).setLineWidth(0.3).roundedRect(LEFT, pdf.y, WIDTH, h, 2, 2, 'S');
  doc.setTextColor(...MUTED).setFontSize(7.5).text(label.toUpperCase(), LEFT + 3, pdf.y + 5);
  for (let i = 1; i <= lines; i++) doc.line(LEFT + 3, pdf.y + 6 + i * 7, LEFT + WIDTH - 3, pdf.y + 6 + i * 7);
  pdf.y += h + 6;
}

export function signatures(pdf, left, right) {
  const { doc } = pdf;
  const y = pdf.y + 16;
  doc.setDrawColor(...INK).setLineWidth(0.3);
  [[left, LEFT], [right, LEFT + WIDTH / 2 + 6]].forEach(([label, x]) => {
    doc.line(x, y, x + WIDTH / 2 - 6, y);
    doc.setTextColor(...MUTED).setFontSize(8).text(`${label}  ·  Name  ·  Date`, x, y + 5);
  });
  pdf.y = y + 12;
}

export function savePdf(pdf, filename, footer) {
  const { doc } = pdf;
  doc.setDrawColor(...LINE).line(LEFT, 285, LEFT + WIDTH, 285);
  doc.setTextColor(...MUTED).setFontSize(7.5).text(footer, LEFT, 290);
  doc.text('Uplink broadband management system', LEFT + WIDTH, 290, { align: 'right' });
  doc.save(filename);
}
