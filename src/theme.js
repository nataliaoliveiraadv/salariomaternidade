export const INK = "#1C2541";
export const INK_LIGHT = "#2E3A5C";
export const PAPER = "#F1EFE9";
export const CARD = "#FFFFFF";
export const ROSE = "#C97B84";
export const ROSE_DEEP = "#A85B67";
export const SAGE = "#5C8374";
export const AMBER = "#C08A3E";
export const CRIMSON = "#B5484F";
export const SLATE = "#6B7280";
export const BORDER = "#E4DFD6";

export const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

export const btnPrimary = {
  display: "flex", alignItems: "center", gap: 7, background: INK, color: "#fff",
  border: "none", borderRadius: 9, padding: "9px 16px", fontFamily: "Inter, sans-serif",
  fontSize: 13.5, fontWeight: 600, cursor: "pointer",
};
export const btnGhost = {
  background: "transparent", color: SLATE, border: `1px solid ${BORDER}`, borderRadius: 9,
  padding: "9px 16px", fontFamily: "Inter, sans-serif", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
};
export const iconBtn = {
  width: 28, height: 28, borderRadius: 7, border: `1px solid ${BORDER}`, background: CARD,
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};
