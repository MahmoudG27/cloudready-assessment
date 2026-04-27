import PDFDocument from "pdfkit";
import { AssessmentDocument } from "../types/assessment";

// ===== Design System =====
type RGB = [number, number, number];

const C = {
  primary: [24, 95, 165] as RGB,
  primaryLight: [230, 241, 251] as RGB,
  primaryDark: [12, 68, 124] as RGB,
  success: [39, 80, 10] as RGB,
  successLight: [234, 243, 222] as RGB,
  successBorder: [192, 221, 151] as RGB,
  warning: [99, 56, 6] as RGB,
  warningLight: [250, 238, 218] as RGB,
  warningBorder: [250, 199, 117] as RGB,
  danger: [121, 31, 31] as RGB,
  dangerLight: [252, 235, 235] as RGB,
  dangerBorder: [247, 193, 193] as RGB,
  text: [17, 24, 39] as RGB,
  textSec: [107, 114, 128] as RGB,
  textTer: [156, 163, 175] as RGB,
  border: [229, 231, 235] as RGB,
  bg: [249, 250, 251] as RGB,
  white: [255, 255, 255] as RGB,
};

const S = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

const T = {
  h1: { size: 28, font: "Helvetica-Bold" },
  h2: { size: 16, font: "Helvetica-Bold" },
  h3: { size: 12, font: "Helvetica-Bold" },
  h4: { size: 10, font: "Helvetica-Bold" },
  body: { size: 9, font: "Helvetica" },
  bodyBold: { size: 9, font: "Helvetica-Bold" },
  small: { size: 8, font: "Helvetica" },
  smallBold: { size: 8, font: "Helvetica-Bold" },
  label: { size: 7.5, font: "Helvetica-Bold" },
  micro: { size: 7, font: "Helvetica" },
};

// ===== Helpers =====
function fc(doc: PDFKit.PDFDocument, color: RGB) {
  doc.fillColor(color);
}

function sc(doc: PDFKit.PDFDocument, color: RGB) {
  doc.strokeColor(color);
}

function cs(doc: PDFKit.PDFDocument, spacing: number) {
  (doc as any).characterSpacing(spacing);
}

interface CardOptions {
  fill?: RGB;
  stroke?: RGB;
  radius?: number;
  leftBorder?: RGB;
}

function card(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number, h: number,
  opts: CardOptions = {}
) {
  const fill = opts.fill ?? C.white;
  const stroke = opts.stroke ?? C.border;
  const radius = opts.radius ?? 5;
  const leftBorder = opts.leftBorder ?? null;

  doc.save();
  fc(doc, fill);
  sc(doc, stroke);
  doc.lineWidth(0.5).roundedRect(x, y, w, h, radius).fillAndStroke();
  if (leftBorder) {
    fc(doc, leftBorder);
    doc.roundedRect(x, y, 3, h, 2).fill();
  }
  doc.restore();
}

function progressBar(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number, h: number,
  pct: number, color: RGB
) {
  doc.save();
  fc(doc, C.border);
  doc.roundedRect(x, y, w, h, h / 2).fill();
  if (pct > 0) {
    const fw = Math.max((w * pct) / 100, h);
    fc(doc, color);
    doc.roundedRect(x, y, fw, h, h / 2).fill();
  }
  doc.restore();
}

function getScoreColor(score: number): RGB {
  if (score >= 71) return C.success;
  if (score >= 41) return C.warning;
  return C.danger;
}

function iconShape(doc: PDFKit.PDFDocument, type: string, x: number, y: number, size = 10) {
  const r = size / 2;
  doc.save();
  switch (type) {
    case "risk-high":
      fc(doc, C.danger);
      doc.circle(x + r, y + r, r).fill();
      fc(doc, C.white);
      doc.font("Helvetica-Bold").fontSize(size * 0.7)
        .text("!", x, y + r * 0.2, { width: size, align: "center" });
      break;
    case "risk-medium":
      fc(doc, C.warning);
      doc.polygon([x + r, y], [x + size, y + size], [x, y + size]).fill();
      fc(doc, C.white);
      doc.font("Helvetica-Bold").fontSize(size * 0.65)
        .text("!", x, y + r * 0.6, { width: size, align: "center" });
      break;
    case "risk-low":
      fc(doc, C.success);
      doc.circle(x + r, y + r, r).fill();
      fc(doc, C.white);
      doc.font("Helvetica-Bold").fontSize(size * 0.7)
        .text("i", x, y + r * 0.2, { width: size, align: "center" });
      break;
    case "check":
      fc(doc, C.success);
      doc.circle(x + r, y + r, r).fill();
      fc(doc, C.white);
      doc.font("Helvetica-Bold").fontSize(size * 0.7)
        .text("v", x, y + r * 0.2, { width: size, align: "center" });
      break;
    case "warning":
      fc(doc, C.warning);
      doc.roundedRect(x, y, size, size, 2).fill();
      fc(doc, C.white);
      doc.font("Helvetica-Bold").fontSize(size * 0.7)
        .text("!", x, y + r * 0.25, { width: size, align: "center" });
      break;
  }
  doc.restore();
}

interface BadgeColors { bg: RGB; text: RGB; }

function badge(
  doc: PDFKit.PDFDocument,
  label: string, x: number, y: number,
  colors: BadgeColors,
  w?: number
) {
  doc.save();
  const bw = w ?? (doc.font(T.label.font).fontSize(T.label.size).widthOfString(label) + 14);
  fc(doc, colors.bg);
  doc.roundedRect(x, y, bw, 15, 3).fill();
  fc(doc, colors.text);
  doc.font(T.label.font).fontSize(T.label.size)
    .text(label.toUpperCase(), x, y + 4, { width: bw, align: "center" });
  doc.restore();
}

function sectionLabel(
  doc: PDFKit.PDFDocument,
  num: string, label: string,
  x: number, y: number, w: number
) {
  doc.save();
  fc(doc, C.primaryLight);
  doc.roundedRect(x, y, 20, 14, 3).fill();
  fc(doc, C.primary);
  doc.font(T.smallBold.font).fontSize(T.smallBold.size)
    .text(num, x, y + 3, { width: 20, align: "center" });
  fc(doc, C.textSec);
  cs(doc, 0.6);
  doc.font(T.label.font).fontSize(T.label.size)
    .text(label.toUpperCase(), x + 24, y + 3.5);
  cs(doc, 0);
  sc(doc, C.border);
  doc.lineWidth(0.5)
    .moveTo(x + 24 + 8 + doc.widthOfString(label.toUpperCase(), { characterSpacing: 0.6 }), y + 7)
    .lineTo(x + w, y + 7).stroke();
  doc.restore();
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
    const M = 40;
    const CW = PW - M * 2;

    const report = document.report.data!;
    const score = report.readinessScore.total;
    const scoreColor = getScoreColor(score);

    // ============================================================
    // PAGE 1
    // ============================================================

    // HEADER
    fc(doc, C.primary);
    doc.rect(0, 0, PW, 88).fill();
    fc(doc, C.primaryDark);
    doc.rect(0, 78, PW, 10).fill();

    doc.save();
    fc(doc, C.white);
    doc.font(T.h2.font).fontSize(T.h2.size).text("KlayyTech", M, 22);
    fc(doc, C.primaryLight);
    doc.font(T.body.font).fontSize(T.body.size).text("CloudReady", M + 90, 25);
    doc.restore();

    doc.save();
    fc(doc, C.white);
    doc.font(T.h3.font).fontSize(T.h3.size)
      .text(document.companyName, M, 18, { width: CW, align: "right" });
    fc(doc, [180, 210, 240] as RGB);
    doc.font(T.body.font).fontSize(8.5)
      .text(`${report.companyOverview.industry} · ${report.companyOverview.companySize} employees`, M, 34, { width: CW, align: "right" })
      .text(`${document.id}  ·  ${new Date(document.meta.generatedAt ?? "").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`, M, 48, { width: CW, align: "right" });
    fc(doc, C.primaryLight);
    doc.roundedRect(M, 62, 200, 16, 3).fill();
    fc(doc, [200, 220, 240] as RGB);
    doc.font(T.micro.font).fontSize(7)
      .text("Powered by Azure OpenAI  ·  Reviewed by KlayyTech Cloud Team", M + 6, 66.5);
    doc.restore();

    let y = 104;

    // SCORE HERO
    const heroH = 128;
    card(doc, M, y, CW, heroH, { stroke: [220, 230, 245] as RGB });

    doc.save();
    fc(doc, scoreColor);
    doc.font(T.h1.font).fontSize(52)
      .text(score.toString(), M + S.md, y + S.md, { width: 72, align: "center" });
    fc(doc, C.textSec);
    doc.font(T.small.font).fontSize(8).text("/ 100", M + S.md, y + 72, { width: 72, align: "center" });
    
    cs(doc, 0.5);
    doc.font(T.micro.font).fontSize(7)
      .text("YOUR SCORE", M + S.md, y + S.sm, { width: 72, align: "center" });
    cs(doc, 0);
    doc.restore();

    sc(doc, C.border);
    doc.lineWidth(0.5).moveTo(M + 96, y + S.md).lineTo(M + 96, y + heroH - S.md).stroke();

    const rxBase = M + 96 + S.md;
    const levelBadgeColors: BadgeColors = score >= 71
      ? { bg: C.successLight, text: C.success }
      : score >= 41 ? { bg: C.warningLight, text: C.warning }
      : { bg: C.dangerLight, text: C.danger };

    badge(doc, report.readinessScore.level, rxBase, y + S.md, levelBadgeColors);

    fc(doc, C.textSec);
    doc.font(T.body.font).fontSize(9)
      .text(report.cloudMaturityPosition, rxBase, y + S.md + S.xl, { width: CW - 112 });

    const barLabels = [
      { label: "Infrastructure", value: report.readinessScore.breakdown.infrastructure, color: C.primary },
      { label: "Security", value: report.readinessScore.breakdown.security, color: report.readinessScore.breakdown.security < 50 ? C.danger : C.primary },
      { label: "Team Readiness", value: report.readinessScore.breakdown.teamReadiness, color: C.success },
    ];

    const barSectionW = CW - 112;
    const barW = (barSectionW - S.md * 2) / 3;

    barLabels.forEach((b, i) => {
      const bx = rxBase + i * (barW + S.sm);
      const by = y + heroH - 38;
      fc(doc, C.textSec);
      cs(doc, 0.3);
      doc.font(T.micro.font).fontSize(7)
        .text(b.label.toUpperCase(), bx, by, { width: barW });
      cs(doc, 0);
      progressBar(doc, bx, by + S.sm, barW, 5, b.value, b.color);
      fc(doc, C.text);
      doc.font(T.bodyBold.font).fontSize(9).text(`${b.value}%`, bx, by + S.md + 2);
    });

    y += heroH + S.md;

    // 01 COMPANY OVERVIEW
    sectionLabel(doc, "01", "Company Overview", M, y, CW);
    y += S.md + 4;

    const ovH = 64;
    card(doc, M, y, ovH + 10, ovH);
    card(doc, M, y, CW, ovH);

    const ovItems = [
      { label: "Industry", value: report.companyOverview.industry },
      { label: "Company Size", value: report.companyOverview.companySize },
      { label: "IT Maturity", value: report.companyOverview.itMaturityLevel },
    ];
    const colW3 = (CW - S.md * 4) / 3;

    ovItems.forEach((item, i) => {
      const cx = M + S.md + i * (colW3 + S.md);
      fc(doc, C.textSec);
      cs(doc, 0.4);
      doc.font(T.micro.font).fontSize(7)
        .text(item.label.toUpperCase(), cx, y + S.sm);
      cs(doc, 0);
      const matColor = item.label === "IT Maturity"
        ? (item.value === "High" ? C.success : item.value === "Medium" ? C.warning : C.danger)
        : C.text;
      fc(doc, matColor);
      doc.font(T.h4.font).fontSize(10).text(item.value, cx, y + S.md + 4);
    });

    fc(doc, C.textSec);
    doc.font(T.body.font).fontSize(8.5)
      .text(report.companyOverview.itMaturityReason, M + S.md, y + 44, { width: CW - S.md * 2 });

    y += ovH + S.md;

    // 02 KEY FINDINGS
    sectionLabel(doc, "02", "Key Findings", M, y, CW);
    y += S.md + 4;

    report.keyFindings.forEach((f) => {
      const isRisk = f.type === "risk";
      const fColors = isRisk
        ? { bg: C.dangerLight, text: C.danger, border: C.dangerBorder }
        : { bg: C.successLight, text: C.success, border: C.successBorder };
      const iconType = isRisk ? (f.severity === "high" ? "risk-high" : "warning") : "check";

      const fH = 26;
      card(doc, M, y, CW, fH, { fill: fColors.bg, stroke: fColors.border });
      iconShape(doc, iconType, M + S.sm, y + 7, S.sm + 2);
      fc(doc, fColors.text);
      doc.font(T.body.font).fontSize(9)
        .text(f.text, M + S.xl + 2, y + 8, { width: CW - S.xl - S.md });

      y += fH + 4;
    });

    y += S.sm;

    // 03 RISK ASSESSMENT
    sectionLabel(doc, "03", "Risk Assessment — Business Impact", M, y, CW);
    y += S.md + 4;

    report.riskAssessment.forEach((r) => {
      const rColors = r.level === "High"
        ? { bg: C.dangerLight, text: C.danger, border: C.dangerBorder, left: C.danger }
        : r.level === "Medium"
        ? { bg: C.warningLight, text: C.warning, border: C.warningBorder, left: C.warning }
        : { bg: C.successLight, text: C.success, border: C.successBorder, left: C.success };
      const iconType = r.level === "High" ? "risk-high" : r.level === "Medium" ? "risk-medium" : "risk-low";

      const rH = 60;
      card(doc, M, y, CW, rH, { fill: rColors.bg, stroke: rColors.border, leftBorder: rColors.left });

      badge(doc, r.level, M + S.sm + 2, y + S.sm, { bg: rColors.text, text: C.white }, 36);
      iconShape(doc, iconType, M + S.sm + 2 + 40, y + S.sm, 13);

      fc(doc, rColors.text);
      doc.font(T.h4.font).fontSize(10)
        .text(r.risk, M + S.sm + 2 + 58, y + S.sm, { width: CW - 80 });

      fc(doc, C.text);
      doc.font(T.bodyBold.font).fontSize(8.5)
        .text(`Business impact: ${r.businessImpact}`, M + S.sm + 2, y + S.xl + 4, { width: CW - S.md * 2 });

      fc(doc, C.textSec);
      doc.font(T.body.font).fontSize(8)
        .text(`Mitigation: ${r.mitigation}`, M + S.sm + 2, y + S.xl + 18, { width: CW - S.md * 2 });

      y += rH + 6;
    });

    const roiH = 32;
    const col2W = CW / 2 - 4;

    fc(doc, C.dangerLight);
    doc.roundedRect(M, y, col2W, roiH, 4).fill();
    fc(doc, C.danger);
    cs(doc, 0.3);
    doc.font(T.micro.font).fontSize(7)
      .text("DOWNTIME RISK COST", M + S.sm, y + 5);
    cs(doc, 0)
    doc.font(T.h4.font).fontSize(10).text("$5K – $20K per incident", M + S.sm, y + 14);

    fc(doc, C.successLight);
    doc.roundedRect(M + col2W + S.sm, y, col2W, roiH, 4).fill();
    fc(doc, C.success);
    cs(doc, 0.3);
    doc.font(T.micro.font).fontSize(7)
      .text("OVERHEAD REDUCTION", M + col2W + S.sm + S.sm, y + 5);
    cs(doc, 0)
    doc.font(T.h4.font).fontSize(10)
      .text("~30% after migration", M + col2W + S.sm + S.sm, y + 14);

    y += roiH + S.md;

    // ============================================================
    // PAGE 2
    // ============================================================
    doc.addPage({ margin: 0, size: "A4" });
    y = M;

    // 04 RECOMMENDED SERVICES
    sectionLabel(doc, "04", "Recommended Azure Services", M, y, CW);
    y += S.md + 4;

    report.recommendedServices.forEach((svc) => {
      const svcH = 58;
      card(doc, M, y, CW, svcH);

      fc(doc, C.primaryLight);
      doc.roundedRect(M + S.sm, y + S.sm, 36, 36, 5).fill();
      fc(doc, C.primary);
      doc.font("Helvetica-Bold").fontSize(11)
        .text("Az", M + S.sm, y + S.sm + 10, { width: 36, align: "center" });

      fc(doc, C.primary);
      doc.font(T.h4.font).fontSize(10.5)
        .text(svc.service, M + S.xl + S.sm + 4, y + S.sm);

      fc(doc, C.text);
      doc.font(T.bodyBold.font).fontSize(9)
        .text(svc.outcome, M + S.xl + S.sm + 4, y + S.md + S.md, { width: CW - S.xl - S.md * 2 });

      fc(doc, C.textSec);
      doc.font(T.body.font).fontSize(8.5)
        .text(`Why it fits: ${svc.whyItFits}`, M + S.xl + S.sm + 4, y + S.md + S.xl + 4, { width: CW - S.xl - S.md * 2 });

      y += svcH + 6;
    });

    y += S.sm;

    // 05 ARCHITECTURE
    sectionLabel(doc, "05", "Architecture Suggestion", M, y, CW);
    y += S.md + 4;

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
      cs(doc, 0.5);
      doc.font(T.label.font).fontSize(7)
        .text(ld.name.toUpperCase(), M + S.sm, y + 5.5);
      cs(doc, 0)
      y += 18;

      items.forEach((item) => {
        const bw = 145;
        const rowH = 22;

        card(doc, M + S.sm, y + 4, bw, rowH, { radius: 4 });
        fc(doc, C.text);
        doc.font(T.body.font).fontSize(9)
          .text(item.component, M + S.sm, y + 10, { width: bw, align: "center" });

        const arrowX = M + S.sm + bw + S.sm;
        const arrowMidY = y + 4 + rowH / 2;
        sc(doc, C.textSec);
        doc.lineWidth(1).moveTo(arrowX, arrowMidY).lineTo(arrowX + 18, arrowMidY).stroke();
        fc(doc, C.textSec);
        doc.polygon([arrowX + 18, arrowMidY], [arrowX + 14, arrowMidY - 3], [arrowX + 14, arrowMidY + 3]).fill();

        const svcBx = arrowX + 22;
        fc(doc, C.primaryLight);
        doc.roundedRect(svcBx, y + 4, bw + 10, rowH, 4).fill();
        sc(doc, [180, 210, 240] as RGB);
        doc.lineWidth(0.5).roundedRect(svcBx, y + 4, bw + 10, rowH, 4).stroke();
        fc(doc, C.primary);
        doc.font(T.bodyBold.font).fontSize(9)
          .text(item.azureService, svcBx, y + 10, { width: bw + 10, align: "center" });

        y += rowH + 6;
      });

      y += S.sm;
    });

    y += S.sm;

    // 06 ROADMAP
    sectionLabel(doc, "06", "Migration Roadmap", M, y, CW);
    y += S.md + 4;

    const phaseColors: RGB[] = [C.primary, [29, 122, 107], [91, 62, 143]];

    report.migrationRoadmap.forEach((phase, i) => {
      const pc = phaseColors[i] ?? C.primary;
      const phH = 20 + phase.activities.length * 15 + S.sm;

      card(doc, M, y, CW, phH, { leftBorder: pc });

      fc(doc, pc);
      doc.font(T.h4.font).fontSize(10)
        .text(`Phase ${phase.phase}: ${phase.title}`, M + S.md + 2, y + S.sm, { width: CW - 110 });

      badge(doc, phase.estimatedDuration, PW - M - 90, y + 6, { bg: C.bg, text: C.textSec }, 82);

      phase.activities.forEach((act, j) => {
        fc(doc, C.textTer);
        doc.circle(M + S.md + 4, y + 26 + j * 15, 2).fill();
        fc(doc, C.textSec);
        doc.font(T.body.font).fontSize(8.5)
          .text(act, M + S.md + S.sm + 2, y + 20 + j * 15, { width: CW - S.xl - S.md });
      });

      y += phH + 6;
    });

    fc(doc, C.bg);
    doc.roundedRect(M, y, CW, 22, 4).fill();
    fc(doc, C.textSec);
    doc.font(T.body.font).fontSize(9).text("Estimated total migration timeline", M + S.sm, y + 6);
    fc(doc, C.text);
    doc.font(T.bodyBold.font).fontSize(9)
      .text("3–4 months", M, y + 6, { width: CW - S.sm, align: "right" });

    y += 22 + S.md;

    // 07 COST & ROI
    sectionLabel(doc, "07", "Estimated Cost & ROI", M, y, CW);
    y += S.md + 4;

    card(doc, M, y, CW, 82);

    fc(doc, C.text);
    doc.font(T.h1.font).fontSize(30)
      .text(`$${report.estimatedMonthlyCost.min} – $${report.estimatedMonthlyCost.max}`, M + S.md, y + S.md);
    fc(doc, C.textSec);
    doc.font(T.body.font).fontSize(10).text("/ month", M + S.md, y + 48);
    doc.font(T.body.font).fontSize(8)
      .text(report.estimatedMonthlyCost.notes, M + S.md, y + 60, { width: CW - S.md * 2 });

    y += 82 + S.sm;

    const roi2ColW = CW / 2 - 4;
    fc(doc, C.dangerLight);
    doc.roundedRect(M, y, roi2ColW, 34, 4).fill();
    fc(doc, C.danger);
    cs(doc, 0.3);
    doc.font(T.label.font).fontSize(7)
      .text("COST OF NOT MIGRATING", M + S.sm, y + 5);
    cs(doc, 0)
    doc.font(T.h4.font).fontSize(10).text("$5K – $20K per incident", M + S.sm, y + 15);

    fc(doc, C.successLight);
    doc.roundedRect(M + roi2ColW + S.sm, y, roi2ColW, 34, 4).fill();
    fc(doc, C.success);
    cs(doc, 0.3);
    doc.font(T.label.font).fontSize(7)
      .text("EXPECTED OVERHEAD REDUCTION", M + roi2ColW + S.sm + S.sm, y + 5);
    cs(doc, 0)
    doc.font(T.h4.font).fontSize(10)
      .text("~30% after full migration", M + roi2ColW + S.sm + S.sm, y + 15);

    y += 34 + S.md;

    // 08 NEXT STEPS
    sectionLabel(doc, "08", "Next Steps", M, y, CW);
    y += S.md + 4;

    report.nextSteps.forEach((step, i) => {
      const isFirst = i === 0;
      const nsH = 24;

      if (isFirst) {
        fc(doc, C.primaryLight);
        doc.roundedRect(M, y, CW, nsH, 4).fill();
        sc(doc, [180, 210, 240] as RGB);
        doc.lineWidth(0.5).roundedRect(M, y, CW, nsH, 4).stroke();
      } else {
        card(doc, M, y, CW, nsH);
      }

      fc(doc, isFirst ? C.primary : C.bg);
      doc.circle(M + S.md + S.sm, y + nsH / 2, S.sm + 1).fill();
      fc(doc, isFirst ? C.white : C.textSec);
      doc.font(T.smallBold.font).fontSize(7.5)
        .text((i + 1).toString(), M + S.sm, y + nsH / 2 - 4, { width: S.md + S.sm * 2, align: "center" });

      fc(doc, isFirst ? C.primary : C.text);
      doc.font(isFirst ? T.bodyBold.font : T.body.font).fontSize(9)
        .text(typeof step === "string" ? step : (step as any).step ?? "", M + S.xl + S.sm, y + 7, { width: CW - S.xl - S.xl });

      y += nsH + 4;
    });

    // FOOTER
    const fy = PH - 32;
    fc(doc, C.bg);
    doc.rect(0, fy, PW, 32).fill();
    sc(doc, C.border);
    doc.lineWidth(0.5).moveTo(0, fy).lineTo(PW, fy).stroke();
    fc(doc, C.textSec);
    doc.font(T.micro.font).fontSize(7)
      .text(
        `${document.id}  ·  KlayyTech CloudReady  ·  Azure OpenAI powered  ·  Confidence: ${document.meta.confidenceScore ?? 82}%  ·  Reviewed by KlayyTech Cloud Team`,
        M, fy + 12, { width: CW, align: "center" }
      );

    doc.end();
  });
}