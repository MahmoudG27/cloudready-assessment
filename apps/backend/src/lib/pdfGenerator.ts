import PDFDocument from "pdfkit";
import { AssessmentDocument } from "../types/assessment";
import * as path from "path";
import * as fs from "fs";

type RGB = [number, number, number];

const logoPath = path.join(__dirname, "../../assets/logo.png");

const C = {
  primary: [24, 95, 165] as RGB,
  primaryDark: [12, 68, 124] as RGB,
  primaryLight: [230, 241, 251] as RGB,
  success: [39, 80, 10] as RGB,
  successLight: [234, 243, 222] as RGB,
  warning: [99, 56, 6] as RGB,
  warningLight: [250, 238, 218] as RGB,
  danger: [121, 31, 31] as RGB,
  dangerLight: [252, 235, 235] as RGB,
  text: [17, 24, 39] as RGB,
  textSec: [107, 114, 128] as RGB,
  textTer: [156, 163, 175] as RGB,
  border: [229, 231, 235] as RGB,
  bg: [249, 250, 251] as RGB,
  white: [255, 255, 255] as RGB,
};

const S = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

function fc(doc: PDFKit.PDFDocument, color: RGB) { doc.fillColor(color); }
function sc(doc: PDFKit.PDFDocument, color: RGB) { doc.strokeColor(color); }

function getScoreColor(score: number): RGB {
  if (score >= 71) return C.success;
  if (score >= 41) return C.warning;
  return C.danger;
}

function getRiskColors(level: string) {
  if (level === "High") return { bg: C.dangerLight, text: C.danger, left: C.danger };
  if (level === "Medium") return { bg: C.warningLight, text: C.warning, left: C.warning };
  return { bg: C.successLight, text: C.success, left: C.success };
}

function drawLine(doc: PDFKit.PDFDocument, x1: number, y1: number, x2: number, y2: number, color: RGB, width = 0.5) {
  doc.save();
  sc(doc, color);
  doc.lineWidth(width).moveTo(x1, y1).lineTo(x2, y2).stroke();
  doc.restore();
}

function progressBar(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, pct: number, color: RGB) {
  doc.save();
  fc(doc, C.border);
  doc.roundedRect(x, y, w, h, h / 2).fill();
  if (pct > 0) {
    fc(doc, color);
    doc.roundedRect(x, y, Math.max((w * pct) / 100, h), h, h / 2).fill();
  }
  doc.restore();
}

function sectionHeader(doc: PDFKit.PDFDocument, num: string, title: string, x: number, y: number, w: number) {
  fc(doc, C.primaryLight);
  doc.roundedRect(x, y, 20, 14, 3).fill();
  fc(doc, C.primary);
  doc.font("Helvetica-Bold").fontSize(8).text(num, x, y + 3, { width: 20, align: "center" });
  fc(doc, C.textSec);
  doc.font("Helvetica-Bold").fontSize(7.5).text(title.toUpperCase(), x + 24, y + 3.5);
  drawLine(doc, x + 24 + doc.widthOfString(title.toUpperCase()) + 8, y + 7, x + w, y + 7, C.border);
}

// ===== MAIN GENERATOR =====
export async function generatePDF(document: AssessmentDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const PW = 595, PH = 842;
    const M = 44;
    const CW = PW - M * 2;

    const report = document.report.data!;
    const score = report.readinessScore.total;
    const scoreColor = getScoreColor(score);

    // ============================================================
    // COVER PAGE
    // ============================================================

    // Background
    fc(doc, C.primary);
    doc.rect(0, 0, PW, PH).fill();

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, M, 36, { width: 55 });
    }

    // Top accent bar
    fc(doc, C.primaryDark);
    doc.rect(0, 0, PW, 6).fill();

    // Left accent strip
    fc(doc, [255, 255, 255, 0.08] as any);
    doc.rect(0, 0, 180, PH).fill();

    // Logo area
    fc(doc, C.white);
    doc.font("Helvetica-Bold").fontSize(22).text("KlayyTech", M, 60);
    fc(doc, [180, 210, 240] as RGB);
    doc.font("Helvetica").fontSize(11).text("CloudReady", M + 118, 64);

    // Divider
    drawLine(doc, M, 95, PW - M, 95, [255, 255, 255, 0.2] as any, 0.5);

    // Report title
    fc(doc, [255, 255, 255, 0.7] as any);
    doc.font("Helvetica").fontSize(10).text("CLOUD READINESS ASSESSMENT REPORT", M, 160);

    fc(doc, C.white);
    doc.font("Helvetica-Bold").fontSize(32).text("Cloud Readiness", M, 180);
    doc.font("Helvetica-Bold").fontSize(32).text("Assessment", M, 218);

    // Score badge on cover
    const badgeBg = score >= 71 ? C.successLight : score >= 41 ? C.warningLight : C.dangerLight;
    const badgeText = score >= 71 ? C.success : score >= 41 ? C.warning : C.danger;
    fc(doc, badgeBg);
    doc.roundedRect(M, 268, 110, 32, 6).fill();
    fc(doc, badgeText);
    doc.font("Helvetica-Bold").fontSize(18).text(score.toString(), M, 272, { width: 44, align: "center" });
    doc.font("Helvetica").fontSize(10).text(report.readinessScore.level, M + 48, 276, { width: 60 });

    // Divider
    drawLine(doc, M, 320, PW - M, 320, [255, 255, 255, 0.2] as any, 0.5);

    // Prepared for
    fc(doc, [180, 210, 240] as RGB);
    doc.font("Helvetica").fontSize(8).text("PREPARED FOR", M, 336);
    fc(doc, C.white);
    doc.font("Helvetica-Bold").fontSize(20).text(document.companyName, M, 350);
    fc(doc, [180, 210, 240] as RGB);
    doc.font("Helvetica").fontSize(10)
      .text(`${report.companyOverview.industry} · ${report.companyOverview.companySize} employees`, M, 374);

    // Prepared by
    drawLine(doc, M, 410, PW - M, 410, [255, 255, 255, 0.2] as any, 0.5);

    fc(doc, [180, 210, 240] as RGB);
    doc.font("Helvetica").fontSize(8).text("PREPARED BY", M, 426);
    fc(doc, C.white);
    doc.font("Helvetica-Bold").fontSize(13).text("KlayyTech Cloud Solutions Team", M, 440);
    fc(doc, [180, 210, 240] as RGB);
    doc.font("Helvetica").fontSize(9).text("support@klayytech.com", M, 456);

    // Date + ID
    drawLine(doc, M, 490, PW - M, 490, [255, 255, 255, 0.2] as any, 0.5);

    const cols = [
      { label: "REPORT ID", value: document.id },
      { label: "GENERATED", value: new Date(document.meta.generatedAt ?? "").toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) },
      { label: "AI CONFIDENCE", value: `${document.meta.confidenceScore ?? 82}%` },
    ];

    cols.forEach((col, i) => {
      const cx = M + i * (CW / 3);
      fc(doc, [180, 210, 240] as RGB);
      doc.font("Helvetica").fontSize(7.5).text(col.label, cx, 506);
      fc(doc, C.white);
      doc.font("Helvetica-Bold").fontSize(10).text(col.value, cx, 518);
    });

    // CONFIDENTIAL badge
    fc(doc, [255, 255, 255, 0.12] as any);
    doc.roundedRect(M, PH - 60, 120, 22, 4).fill();
    fc(doc, [180, 210, 240] as RGB);
    doc.font("Helvetica-Bold").fontSize(8).text("CONFIDENTIAL", M + 6, PH - 53);

    // Cover footer
    fc(doc, [255, 255, 255, 0.4] as any);
    doc.font("Helvetica").fontSize(7)
      .text("Generated by KlayyTech CloudReady · Powered by Azure OpenAI", M, PH - 28, { width: CW, align: "center" });

    // ============================================================
    // PAGE 2 — EXECUTIVE SUMMARY + SCORE
    // ============================================================
    doc.addPage({ margin: 0, size: "A4" });

    // Page header
    fc(doc, C.primary);
    doc.rect(0, 0, PW, 44).fill();
    fc(doc, C.white);
    doc.font("Helvetica-Bold").fontSize(10).text("KlayyTech CloudReady", M, 16);
    fc(doc, [180, 210, 240] as RGB);
    doc.font("Helvetica").fontSize(9)
      .text(`${document.companyName} · Cloud Readiness Assessment`, M, 28);

    let y = 60;

    // EXECUTIVE SUMMARY
    sectionHeader(doc, "01", "Executive Summary", M, y, CW);
    y += 22;

    // Summary box
    fc(doc, C.primaryLight);
    doc.roundedRect(M, y, CW, 100, 5).fill();
    sc(doc, [180, 210, 240] as RGB);
    doc.lineWidth(0.5).roundedRect(M, y, CW, 100, 5).stroke();

    // Build executive summary text
    const levelText = score >= 71 ? "strong cloud readiness" : score >= 41 ? "moderate cloud readiness" : "early-stage cloud readiness";
    const topRisk = report.riskAssessment.find(r => r.level === "High")?.risk ?? "infrastructure modernization";
    const topStrength = report.keyFindings.find(f => f.type === "strength")?.text ?? "existing IT foundation";

    fc(doc, C.primaryDark);
    doc.font("Helvetica-Bold").fontSize(10)
      .text(`${document.companyName} demonstrates ${levelText} with a score of ${score}/100.`, M + S.md, y + S.md, { width: CW - S.md * 2 });

    fc(doc, C.text);
    doc.font("Helvetica").fontSize(9)
      .text(`The assessment identified key gaps in ${topRisk.toLowerCase()} that require attention before migration. The organization shows strength in ${topStrength.toLowerCase().substring(0, 60)}.`, M + S.md, y + 36, { width: CW - S.md * 2 });

    // Key priorities
    fc(doc, C.primary);
    doc.font("Helvetica-Bold").fontSize(8.5).text("Key priorities:", M + S.md, y + 64);

    const priorities = report.nextSteps.slice(0, 3);
    priorities.forEach((step, i) => {
      const stepText = typeof step === "string" ? step : (step as any).step ?? "";
      fc(doc, C.text);
      doc.font("Helvetica").fontSize(8.5)
        .text(`${i + 1}.  ${stepText}`, M + S.md + 8, y + 64 + (i + 1) * 11, { width: CW - S.md * 3 });
    });

    y += 110;

    // Timeline + Cost pills
    const pills = [
      { label: "Readiness Level", value: report.readinessScore.level },
      { label: "Est. Timeline", value: "3–4 months" },
      { label: "Est. Monthly Cost", value: `$${report.estimatedMonthlyCost.min}–$${report.estimatedMonthlyCost.max}` },
    ];

    pills.forEach((pill, i) => {
      const px = M + i * (CW / 3 + S.sm / 3);
      fc(doc, C.bg);
      doc.roundedRect(px, y, CW / 3 - 4, 36, 5).fill();
      sc(doc, C.border);
      doc.lineWidth(0.5).roundedRect(px, y, CW / 3 - 4, 36, 5).stroke();
      fc(doc, C.textSec);
      doc.font("Helvetica").fontSize(7).text(pill.label.toUpperCase(), px + S.sm, y + S.sm);
      fc(doc, C.text);
      doc.font("Helvetica-Bold").fontSize(10).text(pill.value, px + S.sm, y + 20);
    });

    y += 50;

    // SCORE SECTION
    sectionHeader(doc, "02", "Cloud Readiness Score", M, y, CW);
    y += 22;

    // Score card
    fc(doc, C.white);
    sc(doc, C.border);
    doc.lineWidth(0.5).roundedRect(M, y, CW, 110, 5).fillAndStroke();

    // Big score
    fc(doc, scoreColor);
    doc.font("Helvetica-Bold").fontSize(48).text(score.toString(), M + S.md, y + S.md, { width: 72, align: "center" });
    fc(doc, C.textSec);
    doc.font("Helvetica").fontSize(8).text("/ 100", M + S.md, y + 68, { width: 72, align: "center" });
    doc.font("Helvetica").fontSize(7).text("READINESS SCORE", M + S.md, y + S.sm, { width: 72, align: "center" });

    // Divider
    sc(doc, C.border);
    doc.lineWidth(0.5).moveTo(M + 96, y + S.md).lineTo(M + 96, y + 110 - S.md).stroke();

    // Level badge
    const lbColors = score >= 71
      ? { bg: C.successLight, text: C.success }
      : score >= 41 ? { bg: C.warningLight, text: C.warning }
      : { bg: C.dangerLight, text: C.danger };
    fc(doc, lbColors.bg);
    doc.roundedRect(M + 96 + S.md, y + S.md, 80, 16, 3).fill();
    fc(doc, lbColors.text);
    doc.font("Helvetica-Bold").fontSize(8).text(report.readinessScore.level.toUpperCase(), M + 96 + S.md, y + S.md + 4, { width: 80, align: "center" });

    // Maturity text
    fc(doc, C.textSec);
    doc.font("Helvetica").fontSize(8.5)
      .text(report.cloudMaturityPosition, M + 96 + S.md, y + 36, { width: CW - 118 });

    // AI Confidence
    const confW = 60;
    const confPct = document.meta.confidenceScore ?? 82;
    fc(doc, C.textSec);
    doc.font("Helvetica").fontSize(7.5).text("AI confidence", M + 96 + S.md, y + 76);
    progressBar(doc, M + 96 + S.md + 68, y + 78, confW, 4, confPct, [29, 158, 117] as RGB);
    doc.font("Helvetica-Bold").fontSize(7.5).text(`${confPct}%`, M + 96 + S.md + 68 + confW + 4, y + 76);

    // Breakdown bars
    const bars = [
      { label: "Infrastructure", value: report.readinessScore.breakdown.infrastructure, color: C.primary },
      { label: "Security", value: report.readinessScore.breakdown.security, color: report.readinessScore.breakdown.security < 50 ? C.danger : C.primary },
      { label: "Team Readiness", value: report.readinessScore.breakdown.teamReadiness, color: C.success },
    ];

    const barW = (CW - 118 - S.md) / 3 - 6;
    bars.forEach((b, i) => {
      const bx = M + 96 + S.md + i * (barW + 6);
      const by = y + 88;
      fc(doc, C.textSec);
      doc.font("Helvetica").fontSize(6.5).text(b.label.toUpperCase(), bx, by);
      progressBar(doc, bx, by + S.sm, barW, 5, b.value, b.color);
      fc(doc, C.text);
      doc.font("Helvetica-Bold").fontSize(8.5).text(`${b.value}%`, bx, by + 18);
    });

    y += 120;

    // KEY FINDINGS
    sectionHeader(doc, "03", "Key Findings", M, y, CW);
    y += 22;

    report.keyFindings.forEach((f) => {
      const isRisk = f.type === "risk";
      const fBg = isRisk ? C.dangerLight : C.successLight;
      const fText = isRisk ? C.danger : C.success;
      const fBorder = isRisk ? [247, 193, 193] as RGB : [192, 221, 151] as RGB;
      const fH = 26;

      fc(doc, fBg);
      doc.roundedRect(M, y, CW, fH, 4).fill();
      sc(doc, fBorder);
      doc.lineWidth(0.5).roundedRect(M, y, CW, fH, 4).stroke();

      fc(doc, fText);
      doc.circle(M + S.md, y + fH / 2, 3).fill();
      doc.font("Helvetica").fontSize(8.5)
        .text(f.text, M + S.xl - 4, y + 8, { width: CW - S.xl });

      y += fH + 4;
    });

    y += S.sm;

    // BUSINESS RISKS
    sectionHeader(doc, "04", "Business Risk Assessment", M, y, CW);
    y += 22;

    report.riskAssessment.forEach((r) => {
      const rc = getRiskColors(r.level);
      const rH = 58;

      fc(doc, rc.bg);
      doc.roundedRect(M, y, CW, rH, 4).fill();
      fc(doc, rc.left);
      doc.rect(M, y, 3, rH).fill();

      // Level badge
      fc(doc, rc.text);
      doc.roundedRect(M + S.sm, y + S.sm, 36, 13, 3).fill();
      fc(doc, C.white);
      doc.font("Helvetica-Bold").fontSize(7).text(r.level.toUpperCase(), M + S.sm, y + S.sm + 3, { width: 36, align: "center" });

      fc(doc, rc.text);
      doc.font("Helvetica-Bold").fontSize(9).text(r.risk, M + 52, y + S.sm, { width: CW - 62 });
      fc(doc, C.text);
      doc.font("Helvetica-Bold").fontSize(8).text(`Business impact: ${r.businessImpact}`, M + 52, y + 26, { width: CW - 62 });
      fc(doc, C.textSec);
      doc.font("Helvetica").fontSize(7.5).text(`Recommended action: ${r.mitigation}`, M + 52, y + 38, { width: CW - 62 });

      y += rH + 5;
    });

    // ============================================================
    // PAGE 3 — RECOMMENDATIONS + ARCHITECTURE + ROADMAP
    // ============================================================
    doc.addPage({ margin: 0, size: "A4" });

    // Page header
    fc(doc, C.primary);
    doc.rect(0, 0, PW, 44).fill();
    fc(doc, C.white);
    doc.font("Helvetica-Bold").fontSize(10).text("KlayyTech CloudReady", M, 16);
    fc(doc, [180, 210, 240] as RGB);
    doc.font("Helvetica").fontSize(9)
      .text(`${document.companyName} · Cloud Readiness Assessment`, M, 28);

    y = 60;

    // RECOMMENDED SERVICES
    sectionHeader(doc, "05", "Recommended Azure Services", M, y, CW);
    y += 22;

    report.recommendedServices.forEach((svc) => {
      const sH = 52;
      fc(doc, C.white);
      sc(doc, C.border);
      doc.lineWidth(0.5).roundedRect(M, y, CW, sH, 4).fillAndStroke();

      fc(doc, C.primaryLight);
      doc.roundedRect(M + S.sm, y + S.sm, 32, 32, 4).fill();
      fc(doc, C.primary);
      doc.font("Helvetica-Bold").fontSize(10).text("Az", M + S.sm, y + S.sm + 8, { width: 32, align: "center" });

      fc(doc, C.primary);
      doc.font("Helvetica-Bold").fontSize(10).text(svc.service, M + 50, y + S.sm);
      fc(doc, C.text);
      doc.font("Helvetica-Bold").fontSize(8.5).text(svc.outcome, M + 50, y + 24, { width: CW - 60 });
      fc(doc, C.textSec);
      doc.font("Helvetica").fontSize(8).text(`Why it fits: ${svc.whyItFits}`, M + 50, y + 36, { width: CW - 60 });

      y += sH + 5;
    });

    y += S.sm;

    // ARCHITECTURE
    sectionHeader(doc, "06", "Architecture Suggestion", M, y, CW);
    y += 22;

    const layerDefs = [
      { name: "App Layer", color: C.primary },
      { name: "Data Layer", color: [29, 122, 107] as RGB },
      { name: "Security Layer", color: [91, 62, 143] as RGB },
    ];

    (["App", "Data", "Security"] as const).forEach((layer, li) => {
      const items = report.architectureSuggestion.filter(a => a.layer === layer);
      if (!items.length) return;
      const ld = layerDefs[li];

      fc(doc, C.bg);
      doc.roundedRect(M, y, CW, 18, 3).fill();
      fc(doc, ld.color);
      doc.rect(M, y, 3, 18).fill();
      fc(doc, C.textSec);
      doc.font("Helvetica-Bold").fontSize(7).text(ld.name.toUpperCase(), M + S.sm, y + 5.5);
      y += 18;

      items.forEach((item) => {
        const bw = 140, rowH = 20;
        fc(doc, C.white);
        sc(doc, C.border);
        doc.lineWidth(0.5).roundedRect(M + S.sm, y + 3, bw, rowH, 3).fillAndStroke();
        fc(doc, C.text);
        doc.font("Helvetica").fontSize(8.5).text(item.component, M + S.sm, y + 9, { width: bw, align: "center" });

        const arrowX = M + S.sm + bw + S.sm;
        const arrowMid = y + 3 + rowH / 2;
        sc(doc, C.textSec);
        doc.lineWidth(1).moveTo(arrowX, arrowMid).lineTo(arrowX + 16, arrowMid).stroke();
        fc(doc, C.textSec);
        doc.polygon([arrowX + 16, arrowMid], [arrowX + 12, arrowMid - 3], [arrowX + 12, arrowMid + 3]).fill();

        const svcBx = arrowX + 20;
        fc(doc, C.primaryLight);
        doc.roundedRect(svcBx, y + 3, bw + 10, rowH, 3).fill();
        sc(doc, [180, 210, 240] as RGB);
        doc.lineWidth(0.5).roundedRect(svcBx, y + 3, bw + 10, rowH, 3).stroke();
        fc(doc, C.primary);
        doc.font("Helvetica-Bold").fontSize(8.5).text(item.azureService, svcBx, y + 9, { width: bw + 10, align: "center" });

        y += rowH + 5;
      });
      y += S.sm;
    });

    y += S.sm;

    // MIGRATION ROADMAP
    sectionHeader(doc, "07", "Migration Roadmap", M, y, CW);
    y += 22;

    const phaseColors: RGB[] = [C.primary, [29, 122, 107], [91, 62, 143]];

    report.migrationRoadmap.forEach((phase, i) => {
      const pc = phaseColors[i] ?? C.primary;
      const phH = 18 + phase.activities.length * 14 + S.sm;

      fc(doc, C.white);
      sc(doc, C.border);
      doc.lineWidth(0.5).roundedRect(M, y, CW, phH, 4).fillAndStroke();
      fc(doc, pc);
      doc.rect(M, y, 3, phH).fill();

      fc(doc, pc);
      doc.font("Helvetica-Bold").fontSize(9.5)
        .text(`Phase ${phase.phase}: ${phase.title}`, M + S.md, y + S.sm, { width: CW - 100 });

      // Duration badge
      fc(doc, C.bg);
      doc.roundedRect(PW - M - 85, y + 5, 77, 14, 3).fill();
      fc(doc, C.textSec);
      doc.font("Helvetica").fontSize(7.5).text(phase.estimatedDuration, PW - M - 85, y + 8.5, { width: 77, align: "center" });

      phase.activities.forEach((act, j) => {
        fc(doc, C.textTer);
        doc.circle(M + S.md + 3, y + 22 + j * 14, 2).fill();
        fc(doc, C.textSec);
        doc.font("Helvetica").fontSize(8).text(act, M + S.md + S.sm, y + 17 + j * 14, { width: CW - S.xl - S.md });
      });

      y += phH + 6;
    });

    // Total timeline
    fc(doc, C.bg);
    doc.roundedRect(M, y, CW, 20, 3).fill();
    fc(doc, C.textSec);
    doc.font("Helvetica").fontSize(8.5).text("Estimated total migration timeline", M + S.sm, y + 5.5);
    fc(doc, C.text);
    doc.font("Helvetica-Bold").fontSize(8.5).text("3–4 months", M, y + 5.5, { width: CW - S.sm, align: "right" });

    y += 30;

    // ============================================================
    // PAGE 4 — COST + NEXT STEPS + DISCLAIMER + FOOTER
    // ============================================================
    doc.addPage({ margin: 0, size: "A4" });

    // Page header
    fc(doc, C.primary);
    doc.rect(0, 0, PW, 44).fill();
    fc(doc, C.white);
    doc.font("Helvetica-Bold").fontSize(10).text("KlayyTech CloudReady", M, 16);
    fc(doc, [180, 210, 240] as RGB);
    doc.font("Helvetica").fontSize(9)
      .text(`${document.companyName} · Cloud Readiness Assessment`, M, 28);

    y = 60;

    // COST & ROI
    sectionHeader(doc, "08", "Estimated Cost & ROI", M, y, CW);
    y += 22;

    fc(doc, C.white);
    sc(doc, C.border);
    doc.lineWidth(0.5).roundedRect(M, y, CW, 78, 5).fillAndStroke();

    fc(doc, C.text);
    doc.font("Helvetica-Bold").fontSize(28)
      .text(`$${report.estimatedMonthlyCost.min} – $${report.estimatedMonthlyCost.max}`, M + S.md, y + S.md);
    fc(doc, C.textSec);
    doc.font("Helvetica").fontSize(10).text("/ month", M + S.md, y + 48);
    doc.font("Helvetica").fontSize(8)
      .text(report.estimatedMonthlyCost.notes, M + S.md, y + 58, { width: CW - S.md * 2 });

    y += 88;

    // ROI boxes
    const roiW = CW / 2 - 4;
    fc(doc, C.dangerLight);
    doc.roundedRect(M, y, roiW, 32, 4).fill();
    fc(doc, C.danger);
    doc.font("Helvetica").fontSize(7).text("COST OF NOT MIGRATING", M + S.sm, y + 5);
    doc.font("Helvetica-Bold").fontSize(10).text("$5K – $20K per incident", M + S.sm, y + 15);

    fc(doc, C.successLight);
    doc.roundedRect(M + roiW + S.sm, y, roiW, 32, 4).fill();
    fc(doc, C.success);
    doc.font("Helvetica").fontSize(7).text("EXPECTED OVERHEAD REDUCTION", M + roiW + S.sm + S.sm, y + 5);
    doc.font("Helvetica-Bold").fontSize(10).text("~30% after full migration", M + roiW + S.sm + S.sm, y + 15);

    y += 44;

    // Cost disclaimer
    fc(doc, C.bg);
    doc.roundedRect(M, y, CW, 44, 4).fill();
    sc(doc, C.border);
    doc.lineWidth(0.5).roundedRect(M, y, CW, 44, 4).stroke();
    fc(doc, C.textSec);
    doc.font("Helvetica-Bold").fontSize(7).text("COST DISCLAIMER", M + S.sm, y + S.sm);
    doc.font("Helvetica").fontSize(7.5)
      .text("Cost estimates are indicative only and based on selected Azure services and company size. Final pricing may vary based on actual usage patterns, data volumes, storage requirements, licensing, and implementation scope. A detailed cost analysis will be provided during the architecture scoping phase.", M + S.sm, y + 22, { width: CW - S.md });

    y += 56;

    // NEXT STEPS
    sectionHeader(doc, "09", "Recommended Next Steps", M, y, CW);
    y += 22;

    report.nextSteps.forEach((step, i) => {
      const stepText = typeof step === "string" ? step : (step as any).step ?? "";
      const isFirst = i === 0;
      const nsH = 24;

      if (isFirst) {
        fc(doc, C.primaryLight);
        doc.roundedRect(M, y, CW, nsH, 4).fill();
        sc(doc, [180, 210, 240] as RGB);
        doc.lineWidth(0.5).roundedRect(M, y, CW, nsH, 4).stroke();
      } else {
        fc(doc, C.white);
        sc(doc, C.border);
        doc.lineWidth(0.5).roundedRect(M, y, CW, nsH, 4).fillAndStroke();
      }

      fc(doc, isFirst ? C.primary : C.bg);
      doc.circle(M + S.md + S.sm, y + nsH / 2, S.sm + 1).fill();
      fc(doc, isFirst ? C.white : C.textSec);
      doc.font("Helvetica-Bold").fontSize(7.5)
        .text((i + 1).toString(), M + S.sm, y + nsH / 2 - 4, { width: S.md + S.sm * 2, align: "center" });

      fc(doc, isFirst ? C.primary : C.text);
      doc.font(isFirst ? "Helvetica-Bold" : "Helvetica").fontSize(8.5)
        .text(stepText, M + S.xl + S.sm, y + 7, { width: CW - S.xl - S.xl });

      y += nsH + 4;
    });

    y += S.md;

    // CTA BOX
    fc(doc, C.primary);
    doc.roundedRect(M, y, CW, 72, 6).fill();
    fc(doc, C.white);
    doc.font("Helvetica-Bold").fontSize(13).text("Ready to start your cloud journey?", M + S.md, y + S.md, { width: CW - S.md * 2, align: "center" });
    fc(doc, [180, 210, 240] as RGB);
    doc.font("Helvetica").fontSize(9)
      .text("Our cloud consulting team is ready to guide you through every step of your migration.", M + S.md, y + 34, { width: CW - S.md * 2, align: "center" });
    fc(doc, C.white);
    doc.font("Helvetica-Bold").fontSize(9).text("support@klayytech.com", M + S.md, y + 52, { width: CW - S.md * 2, align: "center" });

    y += 88;

    // GENERAL DISCLAIMER
    fc(doc, C.bg);
    doc.roundedRect(M, y, CW, 56, 4).fill();
    sc(doc, C.border);
    doc.lineWidth(0.5).roundedRect(M, y, CW, 56, 4).stroke();
    fc(doc, C.textSec);
    doc.font("Helvetica-Bold").fontSize(7).text("IMPORTANT DISCLAIMER", M + S.sm, y + S.sm);
    doc.font("Helvetica").fontSize(7.5)
      .text("This assessment is intended for informational and planning purposes only. The findings, recommendations, architecture suggestions, timelines, and cost estimates presented in this report are based on the information provided during the assessment and may not reflect the full complexity of your environment. Final architecture, pricing, timelines, and security requirements may vary based on detailed discovery and implementation scope. KlayyTech recommends a formal technical discovery engagement before commencing any migration activities.", M + S.sm, y + 20, { width: CW - S.md });

    // PAGE FOOTER
    const fy = PH - 32;
    fc(doc, C.bg);
    doc.rect(0, fy, PW, 32).fill();
    sc(doc, C.border);
    doc.lineWidth(0.5).moveTo(0, fy).lineTo(PW, fy).stroke();
    fc(doc, C.textSec);
    doc.font("Helvetica").fontSize(7)
      .text(`${document.id}  ·  KlayyTech CloudReady  ·  Azure OpenAI powered  ·  CONFIDENTIAL`, M, fy + 12, { width: CW, align: "center" });

    doc.end();
  });
}