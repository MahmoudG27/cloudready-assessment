// ===== Types =====
export type RGB = [number, number, number];

// ===== Colors =====
export const C = {
  primary:       [24, 95, 165]   as RGB,
  primaryDark:   [12, 68, 124]   as RGB,
  primaryLight:  [230, 241, 251] as RGB,
  success:       [39, 80, 10]    as RGB,
  successLight:  [234, 243, 222] as RGB,
  successBorder: [192, 221, 151] as RGB,
  warning:       [99, 56, 6]     as RGB,
  warningLight:  [250, 238, 218] as RGB,
  warningBorder: [250, 199, 117] as RGB,
  danger:        [121, 31, 31]   as RGB,
  dangerLight:   [252, 235, 235] as RGB,
  dangerBorder:  [247, 193, 193] as RGB,
  text:          [17, 24, 39]    as RGB,
  textSec:       [75, 85, 99]    as RGB,
  textTer:       [156, 163, 175] as RGB,
  border:        [226, 232, 240] as RGB,
  bg:            [248, 250, 252] as RGB,
  white:         [255, 255, 255] as RGB,
} as const;

// ===== Score Colors =====
export function getScoreColor(score: number): RGB {
  return score >= 71 ? C.success : score >= 41 ? C.warning : C.danger;
}
export function getScoreLight(score: number): RGB {
  return score >= 71 ? C.successLight : score >= 41 ? C.warningLight : C.dangerLight;
}
export function getScoreBorder(score: number): RGB {
  return score >= 71 ? C.successBorder : score >= 41 ? C.warningBorder : C.dangerBorder;
}
export function getScoreLabel(score: number): string {
  return score >= 71 ? "Advanced" : score >= 41 ? "Developing" : "Beginner";
}

// ===== Risk Colors =====
export function getRiskColors(level: string) {
  if (level === "High")   return { bg: C.dangerLight,  text: C.danger,  border: C.dangerBorder,  bar: C.danger  };
  if (level === "Medium") return { bg: C.warningLight, text: C.warning, border: C.warningBorder, bar: C.warning };
  return                         { bg: C.successLight, text: C.success, border: C.successBorder, bar: C.success };
}

// ===== Spacing Scale (8px base) =====
export const S = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

// ===== Font Sizes =====
export const F = {
  micro:     7,
  small:     8,
  smallBold: 8,
  body:      9,
  bodyBold:  9,
  label:     8.5,
  sub:       10,
  h4:        11,
  h3:        13,
  h2:        16,
  h1:        24,
  display:   34,
  score:     48,
} as const;

// ===== Page Dimensions =====
export const PAGE = {
  width:         595,
  height:        842,
  margin:        44,
  headerHeight:  52,
  footerHeight:  36,
  contentTop:    66,   // headerHeight + 14
  contentBottom: 800,  // height - footerHeight
  get contentWidth() { return this.width - this.margin * 2; },
} as const;

// ===== Phase Colors =====
export const PHASE_COLORS: RGB[] = [
  [24, 95, 165],   // primary
  [29, 122, 107],  // teal
  [91, 62, 143],   // purple
];

// ===== Layer Colors =====
export const LAYER_COLORS: Record<string, RGB> = {
  App:      [24, 95, 165]  as RGB,
  Data:     [29, 122, 107] as RGB,
  Security: [91, 62, 143]  as RGB,
};