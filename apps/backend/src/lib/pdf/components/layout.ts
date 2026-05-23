import { RGB, C, S } from "../constants";
import { fc, sc, hline } from "../helpers";

// ===== Rounded Card =====
export function card(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number, h: number,
  opts: {
    fill?:       RGB;
    stroke?:     RGB;
    radius?:     number;
    leftBar?:    RGB;
    leftBarW?:   number;
  } = {}
) {
  const fill    = opts.fill    ?? C.white;
  const stroke  = opts.stroke  ?? C.border;
  const radius  = opts.radius  ?? 4;
  const leftBar = opts.leftBar ?? null;
  const barW    = opts.leftBarW ?? 4;

  doc.save();
  fc(doc, fill);
  sc(doc, stroke);
  doc.lineWidth(0.5).roundedRect(x, y, w, h, radius).fillAndStroke();
  if (leftBar) {
    fc(doc, leftBar);
    doc.rect(x, y, barW, h).fill();
  }
  doc.restore();
}

// ===== Flat Filled Box (no stroke) =====
export function filledBox(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number, h: number,
  color: RGB, radius = 4
) {
  doc.save();
  fc(doc, color);
  doc.roundedRect(x, y, w, h, radius).fill();
  doc.restore();
}

// ===== Outlined Box =====
export function outlinedBox(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number, h: number,
  fill: RGB, stroke: RGB, radius = 4
) {
  doc.save();
  fc(doc, fill);
  sc(doc, stroke);
  doc.lineWidth(0.5).roundedRect(x, y, w, h, radius).fillAndStroke();
  doc.restore();
}

// ===== Section Divider =====
export function sectionDivider(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number
) {
  hline(doc, x, y, w, C.border, 0.5);
}

// ===== Left Accent Bar =====
export function leftBar(
  doc: PDFKit.PDFDocument,
  x: number, y: number, h: number,
  color: RGB, w = 4
) {
  doc.save();
  fc(doc, color);
  doc.rect(x, y, w, h).fill();
  doc.restore();
}

// ===== Layer Header (for architecture section) =====
export function layerHeader(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number,
  label: string, color: RGB
) {
  filledBox(doc, x, y, w, 20, C.bg, 3);
  leftBar(doc, x, y, 20, color, 4);
  doc.save();
  fc(doc, C.textSec);
  doc.font("Helvetica-Bold").fontSize(8)
    .text(label.toUpperCase(), x + S.sm + 2, y + 6);
  doc.restore();
}