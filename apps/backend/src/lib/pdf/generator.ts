import PDFDocument from "pdfkit";
import * as path from "path";
import * as fs from "fs";
import { AssessmentDocument } from "../../types/assessment";
import { PAGE } from "./constants";
import { pageHeader, pageFooter } from "./components/typography";
import { PageManager } from "./pageManager";
import { renderCover } from "./cover";
import {
  renderExecutiveSummary,
  renderScore,
  renderKeyFindings,
  renderRiskAssessment,
  renderServices,
  // renderArchitecture,
  renderRoadmap,
  renderCost,
  renderNextSteps,
  renderCTA,
  renderDisclaimer,
} from "./sections";

// Load logo once
const logoPath = path.join(__dirname, "../../assets/logo.png");
let logoBuffer: Buffer | null = null;
try {
  if (fs.existsSync(logoPath)) logoBuffer = fs.readFileSync(logoPath);
} catch { /* silent */ }

const TOTAL_PAGES = 5;

export async function generatePDF(document: AssessmentDocument): Promise<Buffer> {
  if (!document.report?.data) throw new Error("Missing report data");

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: "A4", autoFirstPage: true });
    const chunks: Buffer[] = [];
    doc.on("data",  c => chunks.push(c));
    doc.on("end",   () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const report = document.report.data!;
    const score  = report.readinessScore.total;
    const conf   = document.meta.confidenceScore ?? 82;

    // ── PAGE 1: Cover ──────────────────────────────────────────
    renderCover(doc, document, logoBuffer);

    // ── // PAGE 2: Summary + Score ─────────────
    doc.addPage({ margin: 0, size: "A4" });
    pageHeader(doc, document.companyName, logoBuffer);
    const page2 = new PageManager(doc, document.companyName, document.id, logoBuffer, TOTAL_PAGES, 2);
    page2.drawFooter();

    renderExecutiveSummary(doc, page2, report, document.companyName, score, conf);
    renderScore(doc, page2, report, conf);

    // ── PAGE 3: Findings + Risks ──────────────
    doc.addPage({ margin: 0, size: "A4" });
    pageHeader(doc, document.companyName, logoBuffer);
    const page3 = new PageManager(doc, document.companyName, document.id, logoBuffer, TOTAL_PAGES, 3);
    page3.drawFooter();

    renderKeyFindings(doc, page3, report);
    renderRiskAssessment(doc, page3, report);

    // ── PAGE 4: Services + Architecture + Roadmap ───────────
    doc.addPage({ margin: 0, size: "A4" });
    pageHeader(doc, document.companyName, logoBuffer);
    const page4 = new PageManager(doc, document.companyName, document.id, logoBuffer, TOTAL_PAGES, 4);
    page4.drawFooter();

    renderServices(doc, page4, report);
    renderRoadmap(doc, page4, report);

    // ── PAGE 5: Cost + Next Steps + CTA + Disclaimer ───────────
    doc.addPage({ margin: 0, size: "A4" });
    pageHeader(doc, document.companyName, logoBuffer);
    const page5 = new PageManager(doc, document.companyName, document.id, logoBuffer, TOTAL_PAGES, 5);
    page5.drawFooter();

    renderCost(doc, page5, report);
    renderNextSteps(doc, page5, report);
    renderCTA(doc, page5);
    renderDisclaimer(doc, page5);

    doc.end();
  });
}