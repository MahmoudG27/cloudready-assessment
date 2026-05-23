import { ReportData } from "../../types/assessment";
import { C, S, PAGE, PHASE_COLORS, LAYER_COLORS, getScoreColor, getRiskColors } from "./constants";
import { fc, sc, hline, safeText } from "./helpers";
import { card, filledBox, outlinedBox, layerHeader } from "./components/layout";
import { badge, riskBadge, levelBadge } from "./components/badges";
import { progressBar, scoreBar, confidenceBar } from "./components/progress";
import { sectionLabel, bodyText } from "./components/typography";
import { PageManager } from "./pageManager";

const { margin: M, contentWidth: CW } = PAGE;

// ================================================================
// 01 — EXECUTIVE SUMMARY
// ================================================================
export function renderExecutiveSummary(
  doc: PDFKit.PDFDocument,
  page: PageManager,
  report: ReportData,
  companyName: string,
  score: number,
  confidenceScore: number
) {
  const topRisk    = report.riskAssessment.find(r => r.level === "High")?.risk ?? "infrastructure modernization";
  const topStrength = report.keyFindings.find(f => f.type === "strength")?.text ?? "";
  const levelText  = score >= 71 ? "strong cloud readiness" : score >= 41 ? "moderate cloud readiness" : "early-stage cloud readiness";

  const bodyTxt = topStrength
    ? `The assessment identified key gaps in ${topRisk.toLowerCase()} requiring attention before migration. The organisation shows strength in ${topStrength.substring(0, 72).toLowerCase()}.`
    : `The assessment identified key gaps in ${topRisk.toLowerCase()} that require attention before migration can begin.`;

  const titleH    = doc.heightOfString(`${companyName} demonstrates ${levelText} with a score of ${score}/100.`, { width: CW - 24, lineGap: 2 });
  const bodyH     = doc.heightOfString(bodyTxt, { width: CW - 24, lineGap: 2 });
  const priH      = report.nextSteps.slice(0, 3).reduce((acc, step) => {
    return acc + doc.heightOfString(safeText(step), { width: CW - 36, lineGap: 2 }) + 2;
  }, 0);
  const summaryH  = Math.max(106, titleH + bodyH + priH + 52);
  page.ensureSpace(summaryH + 50);

  sectionLabel(doc, "01", "Executive Summary", M, page.y, CW);
  page.addSpacing(22);

  // Summary card
  fc(doc, C.bg);
  doc.roundedRect(M, page.y, CW, summaryH, 5).fill();
  sc(doc, C.border);
  doc.lineWidth(0.5).roundedRect(M, page.y, CW, summaryH, 5).stroke();
  fc(doc, C.primary);
  doc.rect(M, page.y, 4, summaryH).fill();

  fc(doc, C.text);
  doc.font("Helvetica-Bold").fontSize(10)
    .text(`${companyName} demonstrates ${levelText} with a score of ${score}/100.`,
      M + 16, page.y + 12, { width: CW - 24, lineGap: 2 });

  fc(doc, C.textSec);
  doc.font("Helvetica").fontSize(9)
    .text(bodyTxt, M + 16, page.y + 32, { width: CW - 24, lineGap: 2 });

  fc(doc, C.primary);
  doc.font("Helvetica-Bold").fontSize(9).text("Key priorities:", M + 16, page.y + 68);
  report.nextSteps.slice(0, 3).forEach((step, i) => {
    fc(doc, C.textSec);
    doc.font("Helvetica").fontSize(8.5)
      .text(`${i + 1}.  ${safeText(step)}`, M + 26, page.y + 80 + i * 11, { width: CW - 36 });
  });

  page.addSpacing(summaryH + 10);

  // Pills
  const pills = [
    { label: "READINESS LEVEL",   value: report.readinessScore.level },
    { label: "EST. TIMELINE",     value: "3–4 months" },
    { label: "EST. MONTHLY COST", value: `$${report.estimatedMonthlyCost.min}–$${report.estimatedMonthlyCost.max}` },
  ];
  page.ensureSpace(40);
  pills.forEach((p, i) => {
    const px = M + i * (CW / 3 + 2), pw = CW / 3 - 3;
    outlinedBox(doc, px, page.y, pw, 36, C.white, C.border);
    fc(doc, C.textTer);
    doc.font("Helvetica").fontSize(7.5).text(p.label, px + S.sm, page.y + 7);
    fc(doc, C.text);
    doc.font("Helvetica-Bold").fontSize(10).text(p.value, px + S.sm, page.y + 19);
  });
  page.addSpacing(46);
}

// ================================================================
// 02 — SCORE
// ================================================================
export function renderScore(
  doc: PDFKit.PDFDocument,
  page: PageManager,
  report: ReportData,
  confidenceScore: number
) {
  const score      = report.readinessScore.total;
  const scoreColor = getScoreColor(score);

  page.ensureSpace(140);
  sectionLabel(doc, "02", "Cloud Readiness Score", M, page.y, CW);
  page.addSpacing(22);

  page.ensureSpace(112);
  outlinedBox(doc, M, page.y, CW, 108, C.white, C.border, 5);

  // Score number
  fc(doc, scoreColor);
  doc.font("Helvetica-Bold").fontSize(48)
    .text(score.toString(), M + S.md, page.y + 30, { width: 72, align: "center" });
  fc(doc, C.textSec);
  doc.font("Helvetica").fontSize(8).text("/ 100", M + S.md, page.y + 80, { width: 72, align: "center" });
  doc.font("Helvetica").fontSize(7).text("READINESS SCORE", M + S.md, page.y + 16, { width: 72, align: "center" });

  sc(doc, C.border);
  doc.lineWidth(0.5).moveTo(M + 98, page.y + S.md).lineTo(M + 98, page.y + 108 - S.md).stroke();

  // Level badge
  const lbFill = score >= 71 ? C.successLight : score >= 41 ? C.warningLight : C.dangerLight;
  const lbText = score >= 71 ? C.success       : score >= 41 ? C.warning       : C.danger;
  levelBadge(doc, M + 98 + S.md, page.y + S.md, report.readinessScore.level, lbFill, lbText);

  fc(doc, C.textSec);
  doc.font("Helvetica").fontSize(9)
    .text(report.cloudMaturityPosition, M + 98 + S.md, page.y + 36, { width: CW - 122, lineGap: 2 });

  confidenceBar(doc, M + 98 + S.md, page.y + 78, confidenceScore);

  // Breakdown bars
  const bW = (CW - 122 - S.md) / 3 - 5;
  const breakdown = [
    { label: "Infrastructure", value: report.readinessScore.breakdown.infrastructure, color: C.primary },
    { label: "Security",       value: report.readinessScore.breakdown.security,       color: report.readinessScore.breakdown.security < 50 ? C.danger : C.primary },
    { label: "Team Readiness", value: report.readinessScore.breakdown.teamReadiness,  color: C.success },
  ];
  breakdown.forEach((b, i) => {
    scoreBar(doc, M + 98 + S.md + i * (bW + 5), page.y + 90, bW, b.label, b.value, b.color);
  });

  page.addSpacing(118);
}

// ================================================================
// 03 — KEY FINDINGS
// ================================================================
export function renderKeyFindings(
  doc: PDFKit.PDFDocument,
  page: PageManager,
  report: ReportData
) {
  page.ensureSpace(40);
  sectionLabel(doc, "03", "Key Findings", M, page.y, CW);
  page.addSpacing(22);

  report.keyFindings.forEach((f) => {
    const isRisk  = f.type === "risk";
    const fBg     = isRisk ? C.dangerLight  : C.successLight;
    const fText   = isRisk ? C.danger       : C.success;
    const fBorder = isRisk ? C.dangerBorder : C.successBorder;
    const txtH    = doc.heightOfString(f.text, { width: CW - S.xl - S.sm, lineGap: 2 });
    const fH      = Math.max(30, txtH + 18);

    page.ensureSpace(fH + 6);
    outlinedBox(doc, M, page.y, CW, fH, fBg, fBorder);
    fc(doc, fText);
    doc.circle(M + S.md, page.y + fH / 2, 3.5).fill();
    doc.font("Helvetica").fontSize(9)
      .text(f.text, M + S.xl - 2, page.y + 9, { width: CW - S.xl - S.sm, lineGap: 2 });
    page.addSpacing(fH + 6);
  });

  page.addSpacing(S.sm);
}

// ================================================================
// 04 — RISK ASSESSMENT
// ================================================================
export function renderRiskAssessment(
  doc: PDFKit.PDFDocument,
  page: PageManager,
  report: ReportData
) {
  page.ensureSpace(40);
  sectionLabel(doc, "04", "Business Risk Assessment", M, page.y, CW);
  page.addSpacing(22);

  report.riskAssessment.forEach((r) => {
    const rc   = getRiskColors(r.level);
    const impH = doc.heightOfString(`Business impact: ${r.businessImpact}`, { width: CW - 60, lineGap: 1 });
    const mitH = doc.heightOfString(`Recommended action: ${r.mitigation}`,  { width: CW - 60, lineGap: 1 });
    const rH   = Math.max(64, 30 + impH + mitH + 14);

    page.ensureSpace(rH + 8);
    outlinedBox(doc, M, page.y, CW, rH, rc.bg, rc.border);
    fc(doc, rc.bar);
    doc.rect(M, page.y, 4, rH).fill();

    riskBadge(doc, M + 10, page.y + S.sm, r.level, rc.text);

    fc(doc, rc.text);
    doc.font("Helvetica-Bold").fontSize(10).text(r.risk, M + 56, page.y + S.sm, { width: CW - 66 });
    fc(doc, C.text);
    doc.font("Helvetica-Bold").fontSize(9)
      .text(`Business impact: ${r.businessImpact}`, M + 56, page.y + 30, { width: CW - 66, lineGap: 1 });
    fc(doc, C.textSec);
    doc.font("Helvetica").fontSize(8.5)
      .text(`Recommended action: ${r.mitigation}`, M + 56, page.y + 30 + impH + 6, { width: CW - 66, lineGap: 1 });

    page.addSpacing(rH + 8);
  });
}

// ================================================================
// 05 — RECOMMENDED SERVICES
// ================================================================
export function renderServices(
  doc: PDFKit.PDFDocument,
  page: PageManager,
  report: ReportData
) {
  page.ensureSpace(40);
  sectionLabel(doc, "05", "Recommended Azure Services", M, page.y, CW);
  page.addSpacing(22);

  report.recommendedServices.forEach((svc) => {
    const outcomeH = doc.heightOfString(svc.outcome,                     { width: CW - 60, lineGap: 1 });
    const whyH     = doc.heightOfString(`Why it fits: ${svc.whyItFits}`, { width: CW - 60, lineGap: 1 });
    const sH       = Math.max(56, 22 + outcomeH + whyH + 16);

    page.ensureSpace(sH + 6);
    outlinedBox(doc, M, page.y, CW, sH, C.white, C.border);

    filledBox(doc, M + S.sm, page.y + S.sm, 34, 34, C.primaryLight, 5);
    fc(doc, C.primary);
    doc.font("Helvetica-Bold").fontSize(10)
      .text("Az", M + S.sm, page.y + S.sm + 9, { width: 34, align: "center" });

    fc(doc, C.primary);
    doc.font("Helvetica-Bold").fontSize(10.5).text(svc.service, M + 52, page.y + S.sm);
    fc(doc, C.text);
    doc.font("Helvetica-Bold").fontSize(9)
      .text(svc.outcome, M + 52, page.y + 28, { width: CW - 62, lineGap: 1 });
    fc(doc, C.textSec);
    doc.font("Helvetica").fontSize(8.5)
      .text(`Why it fits: ${svc.whyItFits}`, M + 52, page.y + 28 + outcomeH + 4, { width: CW - 62, lineGap: 1 });

    page.addSpacing(sH + 6);
  });

  page.addSpacing(S.sm);
}

// ================================================================
// 06 — ARCHITECTURE
// ================================================================
// export function renderArchitecture(
//   doc: PDFKit.PDFDocument,
//   page: PageManager,
//   report: ReportData
// ) {
//   page.ensureSpace(40);
//   sectionLabel(doc, "06", "Architecture Suggestion", M, page.y, CW);
//   page.addSpacing(22);

//   (["App", "Data", "Security"] as const).forEach((layer) => {
//     const items = report.architectureSuggestion.filter(a => a.layer === layer);
//     if (!items.length) return;

//     const color = LAYER_COLORS[layer];
//     page.ensureSpace(20 + items.length * 30);

//     layerHeader(doc, M, page.y, CW, `${layer} Layer`, color);
//     page.addSpacing(20);

//     items.forEach(item => {
//       const bw = 144, rowH = 24;
//       page.ensureSpace(rowH + 6);

//       outlinedBox(doc, M + S.sm, page.y + 3, bw, rowH, C.white, C.border, 3);
//       fc(doc, C.text);
//       doc.font("Helvetica").fontSize(9)
//         .text(item.component, M + S.sm, page.y + 10, { width: bw, align: "center" });

//       const arrowX = M + S.sm + bw + S.sm, arrowMid = page.y + 3 + rowH / 2;
//       sc(doc, C.textTer);
//       doc.lineWidth(1).moveTo(arrowX, arrowMid).lineTo(arrowX + 18, arrowMid).stroke();
//       fc(doc, C.textTer);
//       doc.polygon([arrowX + 18, arrowMid], [arrowX + 13, arrowMid - 3.5], [arrowX + 13, arrowMid + 3.5]).fill();

//       const svcX = arrowX + 22;
//       filledBox(doc, svcX, page.y + 3, bw + 14, rowH, C.primaryLight, 3);
//       sc(doc, [180, 210, 240] as [number,number,number]);
//       doc.lineWidth(0.5).roundedRect(svcX, page.y + 3, bw + 14, rowH, 3).stroke();
//       fc(doc, C.primary);
//       doc.font("Helvetica-Bold").fontSize(9)
//         .text(item.azureService, svcX, page.y + 10, { width: bw + 14, align: "center" });

//       page.addSpacing(rowH + 6);
//     });
//     page.addSpacing(S.sm);
//   });

//   page.addSpacing(S.sm);
// }

// ================================================================
// 07 — ROADMAP
// ================================================================
export function renderRoadmap(
  doc: PDFKit.PDFDocument,
  page: PageManager,
  report: ReportData
) {
  page.ensureSpace(40);
  sectionLabel(doc, "07", "Migration Roadmap", M, page.y, CW);
  page.addSpacing(22);

  report.migrationRoadmap.forEach((phase, i) => {
    const pc  = PHASE_COLORS[i] ?? C.primary;
    const phH = 24 + phase.activities.length * 15 + S.sm;

    page.ensureSpace(phH + 8);
    outlinedBox(doc, M, page.y, CW, phH, C.white, C.border);
    fc(doc, pc);
    doc.rect(M, page.y, 4, phH).fill();

    fc(doc, pc);
    doc.font("Helvetica-Bold").fontSize(10)
      .text(`Phase ${phase.phase}: ${phase.title}`, M + S.md, page.y + 10, { width: CW - 106 });

    filledBox(doc, PAGE.width - M - 90, page.y + 6, 82, 15, C.bg, 3);
    fc(doc, C.textSec);
    doc.font("Helvetica").fontSize(8)
      .text(phase.estimatedDuration, PAGE.width - M - 90, page.y + 9.5, { width: 82, align: "center" });

    phase.activities.forEach((act, j) => {
      fc(doc, C.textTer);
      doc.circle(M + S.md + 4, page.y + 29 + j * 16, 2.5).fill();
      fc(doc, C.textSec);
      doc.font("Helvetica").fontSize(8.5)
        .text(act, M + S.md + 12, page.y + 24 + j * 16, { width: CW - S.xl - S.md, lineGap: 1 });
    });

    page.addSpacing(phH + 8);
  });

  // Timeline summary
  page.ensureSpace(28);
  filledBox(doc, M, page.y, CW, 22, C.bg, 3);
  fc(doc, C.textSec);
  doc.font("Helvetica").fontSize(9).text("Estimated total migration timeline", M + S.sm, page.y + 6.5);
  fc(doc, C.text);
  doc.font("Helvetica-Bold").fontSize(9)
    .text("3–4 months", M, page.y + 6.5, { width: CW - S.sm, align: "right" });
  page.addSpacing(32);
}

// ================================================================
// 08 — COST & ROI
// ================================================================
export function renderCost(
  doc: PDFKit.PDFDocument,
  page: PageManager,
  report: ReportData
) {
  page.ensureSpace(40);
  sectionLabel(doc, "08", "Estimated Cost & ROI", M, page.y, CW);
  page.addSpacing(22);

  // Main cost card
  page.ensureSpace(84);
  outlinedBox(doc, M, page.y, CW, 80, C.white, C.border, 5);
  fc(doc, C.text);
  doc.font("Helvetica-Bold").fontSize(30)
    .text(`$${report.estimatedMonthlyCost.min} – $${report.estimatedMonthlyCost.max}`, M + S.md, page.y + S.md);
  fc(doc, C.textSec);
  doc.font("Helvetica").fontSize(11).text("/ month", M + S.md, page.y + 50);
  doc.font("Helvetica").fontSize(8.5)
    .text(report.estimatedMonthlyCost.notes, M + S.md, page.y + 62, { width: CW - S.md * 2, lineGap: 1 });
  page.addSpacing(90);

  // ROI boxes
  const roiW = CW / 2 - 4;
  page.ensureSpace(42);

  outlinedBox(doc, M, page.y, roiW, 36, C.dangerLight, C.dangerBorder);
  fc(doc, C.danger);
  doc.font("Helvetica").fontSize(8).text("COST OF NOT MIGRATING", M + S.sm, page.y + S.sm);
  doc.font("Helvetica-Bold").fontSize(11).text("$5K – $20K per incident", M + S.sm, page.y + 18);

  outlinedBox(doc, M + roiW + S.sm, page.y, roiW, 36, C.successLight, C.successBorder);
  fc(doc, C.success);
  doc.font("Helvetica").fontSize(8).text("EXPECTED OVERHEAD REDUCTION", M + roiW + S.sm + S.sm, page.y + S.sm);
  doc.font("Helvetica-Bold").fontSize(11).text("~30% after full migration", M + roiW + S.sm + S.sm, page.y + 18);
  page.addSpacing(48);

  // Cost disclaimer
  page.ensureSpace(56);
  outlinedBox(doc, M, page.y, CW, 50, C.bg, C.border);
  fc(doc, C.textSec);
  doc.font("Helvetica-Bold").fontSize(8).text("COST DISCLAIMER", M + S.sm, page.y + S.sm);
  doc.font("Helvetica").fontSize(8.5)
    .text("Cost estimates are indicative only and based on selected Azure services and company size. Final pricing may vary based on actual usage patterns, data volumes, storage requirements, licensing, and implementation scope. A detailed cost analysis will be provided during the architecture scoping phase.",
      M + S.sm, page.y + 22, { width: CW - S.md, lineGap: 1 });
  page.addSpacing(62);
}

// ================================================================
// 09 — NEXT STEPS
// ================================================================
export function renderNextSteps(
  doc: PDFKit.PDFDocument,
  page: PageManager,
  report: ReportData
) {
  page.ensureSpace(40);
  sectionLabel(doc, "09", "Recommended Next Steps", M, page.y, CW);
  page.addSpacing(22);

  report.nextSteps.forEach((step, i) => {
    const txt     = safeText(step);
    const isFirst = i === 0;
    const txtH    = doc.heightOfString(txt, { width: CW - S.xl - S.xl, lineGap: 1 });
    const nsH     = Math.max(28, txtH + 18);

    page.ensureSpace(nsH + 5);

    if (isFirst) {
      outlinedBox(doc, M, page.y, CW, nsH, C.primaryLight, [180, 210, 240] as [number,number,number]);
    } else {
      outlinedBox(doc, M, page.y, CW, nsH, C.white, C.border);
    }

    fc(doc, isFirst ? C.primary : C.bg);
    doc.circle(M + S.md + S.sm, page.y + nsH / 2, S.sm + 1).fill();
    fc(doc, isFirst ? C.white : C.textSec);
    doc.font("Helvetica-Bold").fontSize(8)
      .text((i + 1).toString(), M + S.sm, page.y + nsH / 2 - 4.5,
        { width: S.md + S.sm * 2, align: "center" });

    fc(doc, isFirst ? C.primary : C.text);
    doc.font(isFirst ? "Helvetica-Bold" : "Helvetica").fontSize(9)
      .text(txt, M + S.xl + S.sm, page.y + (nsH - txtH) / 2,
        { width: CW - S.xl - S.xl, lineGap: 1 });

    page.addSpacing(nsH + 5);
  });

  page.addSpacing(S.md);
}

// ================================================================
// CTA BOX
// ================================================================
export function renderCTA(
  doc: PDFKit.PDFDocument,
  page: PageManager
) {
  page.ensureSpace(92);
  filledBox(doc, M, page.y, CW, 88, C.primary, 6);
  fc(doc, C.white);
  doc.font("Helvetica-Bold").fontSize(14)
    .text("Ready to start your cloud journey?", M + S.md, page.y + S.md,
      { width: CW - S.md * 2, align: "center" });
  doc.save();
  doc.fillOpacity(0.75);
  fc(doc, C.white);
  doc.font("Helvetica").fontSize(9.5)
    .text("Our cloud consulting team is ready to guide you through every step of your migration.",
      M + S.md, page.y + 38, { width: CW - S.md * 2, align: "center", lineGap: 1 });
  doc.restore();
  fc(doc, C.white);
  doc.font("Helvetica-Bold").fontSize(9.5)
    .text("support@klayytech.com", M + S.md, page.y + 62,
      { width: CW - S.md * 2, align: "center" });
  page.addSpacing(100);
}

// ================================================================
// DISCLAIMER
// ================================================================
export function renderDisclaimer(
  doc: PDFKit.PDFDocument,
  page: PageManager
) {
  page.ensureSpace(70);
  outlinedBox(doc, M, page.y, CW, 66, C.bg, C.border);
  fc(doc, C.textSec);
  doc.font("Helvetica-Bold").fontSize(8).text("IMPORTANT DISCLAIMER", M + S.sm, page.y + S.sm);
  doc.font("Helvetica").fontSize(8.5)
    .text("This assessment is intended for informational and planning purposes only. The findings, recommendations, architecture suggestions, timelines, and cost estimates are based on information provided during the assessment and may not reflect the full complexity of your environment. Final architecture, pricing, timelines, and security requirements may vary based on detailed discovery and implementation scope. KlayyTech recommends a formal technical discovery engagement before commencing any migration activities.",
      M + S.sm, page.y + 22, { width: CW - S.md, lineGap: 1 });
  page.addSpacing(72);
}