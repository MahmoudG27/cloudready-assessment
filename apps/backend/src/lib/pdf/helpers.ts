import { RGB, C } from "./constants";

export function fc(doc: PDFKit.PDFDocument, color: RGB) {
  doc.fillColor(color);
}

export function sc(doc: PDFKit.PDFDocument, color: RGB) {
  doc.strokeColor(color);
}

export function hline(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number,
  color: RGB = C.border, lw = 0.5
) {
  doc.save();
  sc(doc, color);
  doc.lineWidth(lw).moveTo(x, y).lineTo(x + w, y).stroke();
  doc.restore();
}

export function safeDate(iso?: string | null): string {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "N/A"
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export function safeText(step: unknown): string {
  if (typeof step === "string") return step;
  if (step && typeof step === "object" && "step" in step) return (step as any).step ?? "";
  return "";
}