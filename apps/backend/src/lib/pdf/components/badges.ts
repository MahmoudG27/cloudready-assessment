import { RGB, C, S } from "../constants";
import { fc, sc } from "../helpers";

// ===== Simple Badge =====
export function badge(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number, h: number,
  label: string, fill: RGB, text: RGB,
  fontSize = 8, radius = 3
) {
  doc.save();
  fc(doc, fill);
  doc.roundedRect(x, y, w, h, radius).fill();
  fc(doc, text);
  doc.font("Helvetica-Bold").fontSize(fontSize)
    .text(label, x, y + (h - fontSize) / 2, { width: w, align: "center" });
  doc.restore();
}

// ===== Level Badge (Beginner / Developing / Advanced) =====
export function levelBadge(
  doc: PDFKit.PDFDocument,
  x: number, y: number,
  label: string, fill: RGB, text: RGB
) {
  const w = 88, h = 17;
  badge(doc, x, y, w, h, label.toUpperCase(), fill, text, 9);
}

// ===== Risk Level Badge =====
export function riskBadge(
  doc: PDFKit.PDFDocument,
  x: number, y: number,
  level: string, fill: RGB
) {
  badge(doc, x, y, 42, 15, level.toUpperCase(), fill, C.white, 7.5);
}

// ===== Pill (outlined) =====
export function pill(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number, h: number,
  label: string, fill: RGB, stroke: RGB, text: RGB,
  fontSize = 8
) {
  doc.save();
  fc(doc, fill);
  sc(doc, stroke);
  doc.lineWidth(0.5).roundedRect(x, y, w, h, h / 2).fillAndStroke();
  fc(doc, text);
  doc.font("Helvetica").fontSize(fontSize)
    .text(label, x, y + (h - fontSize) / 2, { width: w, align: "center" });
  doc.restore();
}

// ===== Score Badge (cover page) =====
export function scoreBadge(
  doc: PDFKit.PDFDocument,
  x: number, y: number,
  score: number, level: string,
  fill: RGB, text: RGB
) {
  const w = 130, h = 38;
  doc.save();
  fc(doc, fill);
  doc.roundedRect(x, y, w, h, 6).fill();
  fc(doc, text);
  doc.font("Helvetica-Bold").fontSize(22)
    .text(score.toString(), x + 2, y + 8, { width: 50, align: "center" });
  doc.font("Helvetica").fontSize(11)
    .text(level, x + 56, y + 13, { width: 72 });
  doc.restore();
}

// ===== CONFIDENTIAL Tag =====
export function confidentialTag(
  doc: PDFKit.PDFDocument,
  x: number, y: number
) {
  const w = 116, h = 22;
  doc.save();
  fc(doc, C.bg);
  sc(doc, C.border);
  doc.lineWidth(0.5).roundedRect(x, y, w, h, 4).fillAndStroke();
  fc(doc, C.textSec);
  doc.font("Helvetica-Bold").fontSize(8)
    .text("CONFIDENTIAL", x + 8, y + 7);
  doc.restore();
}