import { RGB, C, S, PAGE } from "../constants";
import { fc, hline } from "../helpers";

// ===== Section Label (numbered pill + title + rule) =====
export function sectionLabel(
  doc: PDFKit.PDFDocument,
  num: string, title: string,
  x: number, y: number, w: number
) {
  doc.save();
  fc(doc, C.primaryLight);
  doc.roundedRect(x, y, 22, 15, 3).fill();
  fc(doc, C.primary);
  doc.font("Helvetica-Bold").fontSize(8)
    .text(num, x, y + 3.5, { width: 22, align: "center" });
  fc(doc, C.textSec);
  doc.font("Helvetica-Bold").fontSize(8.5)
    .text(title.toUpperCase(), x + 26, y + 3.5);
  const ruleX = x + 26 + doc.widthOfString(title.toUpperCase()) + 8;
  hline(doc, ruleX, y + 8, x + w - ruleX, C.border);
  doc.restore();
}

// ===== Meta Label + Value pair =====
export function metaField(
  doc: PDFKit.PDFDocument,
  x: number, y: number,
  label: string, value: string
) {
  doc.save();
  fc(doc, C.textSec);
  doc.font("Helvetica").fontSize(8).text(label, x, y);
  fc(doc, C.text);
  doc.font("Helvetica-Bold").fontSize(10).text(value, x, y + 13);
  doc.restore();
}

// ===== Uppercase Tracking Label =====
export function trackingLabel(
  doc: PDFKit.PDFDocument,
  x: number, y: number,
  text: string, color: RGB = C.textSec
) {
  doc.save();
  fc(doc, color);
  doc.font("Helvetica").fontSize(8.5).text(text, x, y);
  doc.restore();
}

// ===== Body Text =====
export function bodyText(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number,
  text: string, color: RGB = C.textSec,
  fontSize = 9, bold = false
) {
  doc.save();
  fc(doc, color);
  doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(fontSize)
    .text(text, x, y, { width: w, lineGap: 2 });
  doc.restore();
}

// ===== Page Header (slim — logo + line) =====
export function pageHeader(
  doc: PDFKit.PDFDocument,
  companyName: string,
  logoBuffer: Buffer | null
) {
  const { width: PW, margin: M } = PAGE;

  // Left accent strip
  fc(doc, C.primary);
  doc.rect(0, 0, 4, 52).fill();

  if (logoBuffer) {
    doc.image(logoBuffer, M, 16, { width: 80 });
  } else {
    fc(doc, C.primary);
    doc.font("Helvetica-Bold").fontSize(13).text("KlayyTech", M, 17);
  }

  fc(doc, C.textSec);
  doc.font("Helvetica").fontSize(8)
    .text(
      `${companyName}  ·  Cloud Readiness Assessment  ·  CONFIDENTIAL`,
      M + 88, 22
    );

  hline(doc, 0, 52, PW, C.border, 0.5);
}

// ===== Page Footer (report id + page number) =====
export function pageFooter(
  doc: PDFKit.PDFDocument,
  reportId: string,
  pageNum: number,
  totalPages: number
) {
  const { width: PW, height: PH, margin: M, contentWidth: CW } = PAGE;
  const fy = PH - 36;

  hline(doc, 0, fy, PW, C.border, 0.5);
  fc(doc, C.textTer);
  doc.font("Helvetica").fontSize(7.5)
    .text(
      `${reportId}  ·  KlayyTech CloudReady  ·  Powered by Azure OpenAI`,
      M, fy + 12, { width: CW - 60 }
    );
  doc.font("Helvetica-Bold").fontSize(7.5)
    .text(`Page ${pageNum} of ${totalPages}`, M, fy + 12, { width: CW, align: "right" });
}