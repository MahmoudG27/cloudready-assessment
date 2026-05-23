import { PAGE } from "./constants";
import { pageHeader, pageFooter } from "./components/typography";

export class PageManager {
  private _y: number;
  private _pageNum: number;
  private _totalPages: number;
  private companyName: string;
  private reportId: string;
  private logoBuffer: Buffer | null;
  private doc: PDFKit.PDFDocument;

  constructor(
    doc: PDFKit.PDFDocument,
    companyName: string,
    reportId: string,
    logoBuffer: Buffer | null,
    totalPages: number,
    initialPageNum: number = 2
  ) {
    this.doc         = doc;
    this.companyName = companyName;
    this.reportId    = reportId;
    this.logoBuffer  = logoBuffer;
    this._pageNum    = initialPageNum;
    this._totalPages = totalPages;
    this._y          = PAGE.contentTop;
  }

  get y(): number { return this._y; }
  get pageNum(): number { return this._pageNum; }

  // Move cursor down by h pixels
  addSpacing(h: number) { this._y += h; }

  // Set cursor to absolute position
  moveTo(y: number) { this._y = y; }

  // Check if there's enough space — if not, start new page
  ensureSpace(neededHeight: number) {
    if (this._y + neededHeight > PAGE.contentBottom) {
      this.newPage();
    }
  }

  // Force new page
  newPage() {
    this._pageNum++;
    this.doc.addPage({ margin: 0, size: "A4" });
    pageHeader(this.doc, this.companyName, this.logoBuffer);
    pageFooter(this.doc, this.reportId, this._pageNum, this._totalPages);
    this._y = PAGE.contentTop;
  }

  // Draw footer on current page (call once per page after all content)
  drawFooter() {
    pageFooter(this.doc, this.reportId, this._pageNum, this._totalPages);
  }
}