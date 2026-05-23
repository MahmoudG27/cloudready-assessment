import { RGB, C } from "../constants";
import { fc, sc } from "../helpers";

// ===== Progress Bar =====
export function progressBar(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number, h: number,
  pct: number, color: RGB
) {
  doc.save();
  fc(doc, C.border);
  doc.roundedRect(x, y, w, h, h / 2).fill();
  const fw = (w * Math.max(0, Math.min(100, pct))) / 100;
  if (fw > 0) {
    fc(doc, color);
    doc.roundedRect(x, y, fw, h, h / 2).fill();
  }
  doc.restore();
}

// ===== Score Breakdown Bar (label + bar + value) =====
export function scoreBar(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number,
  label: string, value: number, color: RGB
) {
  doc.save();
  fc(doc, C.textTer);
  doc.font("Helvetica").fontSize(7).text(label.toUpperCase(), x, y);
  progressBar(doc, x, y + 9, w, 5, value, color);
  fc(doc, C.text);
  doc.font("Helvetica-Bold").fontSize(9).text(`${value}%`, x, y + 18);
  doc.restore();
}

// ===== Confidence Bar (inline with label) =====
export function confidenceBar(
  doc: PDFKit.PDFDocument,
  x: number, y: number,
  pct: number
) {
  const barW = 60;
  doc.save();
  fc(doc, C.textSec);
  doc.font("Helvetica").fontSize(8).text("AI confidence", x, y);
  progressBar(doc, x + 74, y + 2, barW, 5, pct, [29, 158, 117] as RGB);
  doc.font("Helvetica-Bold").fontSize(8).text(`${pct}%`, x + 74 + barW + 4, y);
  doc.restore();
}