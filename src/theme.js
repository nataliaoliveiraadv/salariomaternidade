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

// Variantes mais escuras dos tons de destaque, usadas sempre que a cor
// aparece como TEXTO (badges de status, valores, contadores). As versões
// originais acima continuam servindo para ícones e fundos decorativos.
// Isso garante contraste >= 4.5:1 contra fundos claros (WCAG AA).
export const AMBER_TEXT = "#8A5F22";
export const SAGE_TEXT = "#3F6656";
export const CRIMSON_TEXT = "#8E3239";
export const ROSE_TEXT = "#7A3945";

export const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

// Estilos globais: responsividade (sidebar vira barra superior em telas
// estreitas, grids reduzem colunas), foco visível para teclado, e respeito
// a "prefers-reduced-motion" para quem tem sensibilidade a animações.
export const GLOBAL_STYLES = `
${FONT_IMPORT}

* { box-sizing: border-box; }

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

/* Foco visível em qualquer elemento interativo, para navegação por teclado */
button:focus-visible, a:focus-visible, input:focus-visible,
select:focus-visible, textarea:focus-visible, [tabindex]:focus-visible {
  outline: 3px solid ${ROSE_DEEP};
  outline-offset: 2px;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  .spin { animation: none; }
  * { scroll-behavior: auto !important; }
}

.app-shell { display: flex; min-height: 100vh; }
.sidebar {
  width: 232px; flex-shrink: 0; display: flex; flex-direction: column;
  padding: 24px 16px; gap: 26px;
}
.sidebar-nav { display: flex; flex-direction: column; gap: 3px; }
.sidebar-nav-btn { flex: 1; white-space: nowrap; }
.sidebar-footer { margin-top: auto; padding: 12px 6px; font-size: 11px; color: #8895B8; line-height: 1.5; }
.sidebar-footer-copyright { margin-top: 8px; opacity: 0.8; }

.main-content { flex: 1; padding: 28px 32px; overflow-y: auto; min-width: 0; }

.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
.dash-charts { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; }
.partos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 14px; }
.table-scroll { overflow-x: auto; }
.toolbar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: space-between; }

.form-grid-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; }
.form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.form-grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }

.icon-btn {
  width: 28px; height: 28px; border-radius: 7px; background: ${CARD};
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}

/* Tablets e celulares grandes: sidebar vira uma barra superior */
@media (max-width: 860px) {
  .app-shell { flex-direction: column; }
  .sidebar {
    width: 100%; flex-direction: row; align-items: center;
    padding: 12px 16px; gap: 14px; flex-wrap: nowrap;
  }
  .sidebar-nav { flex-direction: row; overflow-x: auto; flex: 1; gap: 6px; }
  .sidebar-nav-btn { flex: 0 0 auto; }
  .sidebar-footer {
    margin-top: 0; margin-left: auto; padding: 0; display: flex;
    align-items: center; gap: 8px; white-space: nowrap;
  }
  .sidebar-footer-email, .sidebar-footer-copyright { display: none; }
  .main-content { padding: 18px 16px; }
  .dash-charts { grid-template-columns: 1fr; }
}

/* Celulares */
@media (max-width: 640px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .form-grid-3, .form-grid-4 { grid-template-columns: 1fr 1fr; }
  .icon-btn { width: 36px; height: 36px; }
}

@media (max-width: 420px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .form-grid-2, .form-grid-3, .form-grid-4 { grid-template-columns: 1fr; }
}
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
  border: `1px solid ${BORDER}`,
};
