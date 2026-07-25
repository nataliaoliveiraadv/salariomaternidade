import React, { useState, useEffect, useMemo, useRef, useId } from "react";
import {
  Baby, FileCheck, FileX, Clock, Scale, TrendingUp, Plus, Pencil,
  Trash2, X, Search, LayoutDashboard, ClipboardList, CalendarClock,
  Wallet, ChevronRight, Save, Loader2, Download, LogOut, Menu,
  Calendar, Users, Folder, HeartPulse, Armchair, AlertTriangle, Briefcase,
  CalendarPlus, RotateCcw, Landmark, Hourglass, History, Star, Accessibility,
  HandCoins, User, Heart, ShieldAlert, PieChart, Stethoscope, ClipboardCheck,
  MessageCircle, FileText, Handshake, Settings2, Settings, BarChart3,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell
} from "recharts";
import { supabase } from "./supabaseClient";
import { useSupabaseTable } from "./useSupabaseTable";
import { beneficioToDb, beneficioFromDb, partoToDb, partoFromDb, clienteToDb, clienteFromDb } from "./mapping";
import Auth from "./Auth";
import {
  INK, INK_LIGHT, PAPER, CARD, ROSE, ROSE_DEEP, ROSE_TEXT, SAGE, SAGE_TEXT,
  AMBER, AMBER_TEXT, CRIMSON, CRIMSON_TEXT, SLATE, BORDER,
  GLOBAL_STYLES, btnPrimary, btnGhost, iconBtn,
} from "./theme";

const SITUACOES = ["Em Análise", "Concedido", "Negado", "Finalizado"];
const STATUS_OPTS = ["-", "Rec. Administrativo", "Processo Judicial"];
const TIPOS = ["SM Urbano", "SM Rural"];
const SITU_COLOR = { "Em Análise": AMBER_TEXT, "Concedido": SAGE_TEXT, "Negado": CRIMSON_TEXT, "Finalizado": INK_LIGHT };
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/* =========================================================
   Árvore de navegação
   kind: "dashboard" | "beneficios" | "partos" | "section" (só agrupa,
   não é clicável como página) | "placeholder" (ainda em construção)
========================================================= */
const NAV_TREE = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, kind: "dashboard" },
  { id: "agenda", label: "Agenda", icon: Calendar, kind: "placeholder" },
  { id: "clientes", label: "Clientes", icon: Users, kind: "clientes" },
  {
    id: "controle-beneficios", label: "Controle de Benefícios", icon: Folder, kind: "section",
    children: [
      {
        id: "salario-maternidade", label: "Salário-Maternidade", icon: Baby, kind: "beneficios",
        children: [
          { id: "partos-futuros", label: "Partos Futuros", icon: CalendarClock, kind: "partos" },
        ],
      },
      {
        id: "beneficios-incapacidade", label: "Benefícios por Incapacidade", icon: HeartPulse, kind: "section",
        children: [
          { id: "auxilio-incapacidade-temporaria", label: "Auxílio por Incapacidade Temporária", icon: Clock, kind: "placeholder" },
          { id: "aposentadoria-incapacidade-permanente", label: "Aposentadoria por Incapacidade Permanente", icon: Armchair, kind: "placeholder" },
          { id: "auxilio-acidente", label: "Auxílio-Acidente", icon: AlertTriangle, kind: "placeholder" },
          { id: "reabilitacao-profissional", label: "Reabilitação Profissional", icon: Briefcase, kind: "placeholder" },
          { id: "prorrogacao-beneficio", label: "Prorrogação de Benefício", icon: CalendarPlus, kind: "placeholder" },
          { id: "restabelecimento-beneficio", label: "Restabelecimento de Benefício", icon: RotateCcw, kind: "placeholder" },
        ],
      },
      {
        id: "aposentadorias", label: "Aposentadorias", icon: Landmark, kind: "section",
        children: [
          { id: "aposentadoria-idade", label: "Aposentadoria por Idade", icon: Hourglass, kind: "placeholder" },
          { id: "aposentadoria-tempo-contribuicao", label: "Aposentadoria por Tempo de Contribuição", icon: History, kind: "placeholder" },
          { id: "aposentadoria-especial", label: "Aposentadoria Especial", icon: Star, kind: "placeholder" },
          { id: "aposentadoria-pcd", label: "Aposentadoria da Pessoa com Deficiência", icon: Accessibility, kind: "placeholder" },
        ],
      },
      {
        id: "beneficios-assistenciais", label: "Benefícios Assistenciais", icon: HandCoins, kind: "section",
        children: [
          { id: "bpc-idoso", label: "BPC/LOAS - Pessoa Idosa", icon: User, kind: "placeholder" },
          { id: "bpc-pcd", label: "BPC/LOAS - Pessoa com Deficiência", icon: Accessibility, kind: "placeholder" },
          { id: "restabelecimento-bpc", label: "Restabelecimento do BPC", icon: RotateCcw, kind: "placeholder" },
        ],
      },
      {
        id: "beneficios-dependentes", label: "Benefícios para Dependentes", icon: Users, kind: "section",
        children: [
          { id: "pensao-morte", label: "Pensão por Morte", icon: Heart, kind: "placeholder" },
          { id: "auxilio-reclusao", label: "Auxílio-Reclusão", icon: ShieldAlert, kind: "placeholder" },
          { id: "pensao-feminicidio", label: "Pensão Especial - Feminicídio", icon: Scale, kind: "placeholder" },
          { id: "rateio-pensao", label: "Rateio de Pensão", icon: PieChart, kind: "placeholder" },
        ],
      },
    ],
  },
  {
    id: "pericias", label: "Perícias", icon: Stethoscope, kind: "section",
    children: [
      { id: "pericia-medica", label: "Perícia Médica", icon: ClipboardCheck, kind: "placeholder" },
      { id: "pericia-social", label: "Perícia Social", icon: MessageCircle, kind: "placeholder" },
    ],
  },
  { id: "cumprimento-exigencias", label: "Cumprimento de Exigências", icon: ClipboardList, kind: "placeholder" },
  { id: "recursos-administrativos", label: "Recursos Administrativos", icon: FileText, kind: "placeholder" },
  { id: "processos-judiciais", label: "Processos Judiciais", icon: Scale, kind: "placeholder" },
  { id: "parcerias", label: "Parcerias", icon: Handshake, kind: "placeholder" },
  { id: "financeiro", label: "Financeiro", icon: Wallet, kind: "placeholder" },
  { id: "operacional", label: "Operacional", icon: Settings2, kind: "placeholder" },
  { id: "relatorios", label: "Relatórios", icon: BarChart3, kind: "placeholder" },
  { id: "configuracoes", label: "Configurações", icon: Settings, kind: "placeholder" },
];

function flattenTree(items, map = {}) {
  items.forEach((item) => {
    map[item.id] = item;
    if (item.children) flattenTree(item.children, map);
  });
  return map;
}
const NAV_MAP = flattenTree(NAV_TREE);
const DEFAULT_EXPANDED = new Set(["controle-beneficios", "salario-maternidade"]);

function formatBRL(v) {
  const n = Number(v) || 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("pt-BR");
}
function daysUntil(d) {
  if (!d) return null;
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((dt - today) / 86400000);
}
function exportToCSV(rows, columns, filename) {
  const escape = (v) => {
    const s = v === undefined || v === null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => escape(c.label)).join(";");
  const body = rows.map((r) => columns.map((c) => escape(r[c.key])).join(";")).join("\n");
  const csv = "\uFEFF" + header + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function Pill({ color, children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999,
      fontSize: 12, fontWeight: 600, color, background: `${color}1A`, border: `1px solid ${color}40`,
      whiteSpace: "nowrap", fontFamily: "Inter, sans-serif",
    }}>
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
      {children}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, accent, sub }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: SLATE }}>{label}</span>
        <div aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: `${accent}17` }}>
          <Icon size={16} color={accent} />
        </div>
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 26, fontWeight: 600, color: INK, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: SLATE }}>{sub}</div>}
    </div>
  );
}

function TextField({ label, style, id, ...props }) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <label htmlFor={inputId} style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: "Inter, sans-serif" }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: SLATE }}>{label}</span>
      <input id={inputId} {...props} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", fontSize: 13.5, fontFamily: "Inter, sans-serif", color: INK, background: "#FCFBF9", ...style }} />
    </label>
  );
}
function SelectField({ label, options, id, ...props }) {
  const autoId = useId();
  const selectId = id || autoId;
  return (
    <label htmlFor={selectId} style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: "Inter, sans-serif" }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: SLATE }}>{label}</span>
      <select id={selectId} {...props} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", fontSize: 13.5, fontFamily: "Inter, sans-serif", color: INK, background: "#FCFBF9" }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Modal({ title, onClose, children, wide }) {
  const titleId = useId();
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,37,65,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{ background: CARD, borderRadius: 16, width: "100%", maxWidth: wide ? 720 : 480, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(28,37,65,0.35)", outline: "none" }}
      >
        <div style={{ position: "sticky", top: 0, background: CARD, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: `1px solid ${BORDER}` }}>
          <h3 id={titleId} style={{ fontFamily: "Fraunces, serif", fontSize: 19, fontWeight: 600, color: INK, margin: 0 }}>{title}</h3>
          <button onClick={onClose} aria-label="Fechar" style={{ border: "none", background: "transparent", cursor: "pointer", width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} color={SLATE} aria-hidden="true" />
          </button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Placeholder (categorias ainda em construção) ---------------- */
function Placeholder({ item }) {
  const Icon = item.icon;
  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "48px 24px",
      textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
    }}>
      <div aria-hidden="true" style={{ width: 56, height: 56, borderRadius: 14, background: `${ROSE}17`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={26} color={ROSE_DEEP} />
      </div>
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 18, color: INK, margin: 0 }}>{item.label}</h2>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: SLATE, maxWidth: 420, margin: 0 }}>
        Essa seção ainda está em construção. Em breve você vai poder gerenciar {item.label.toLowerCase()} por aqui.
      </p>
    </div>
  );
}

/* ---------------- Menu em árvore (usado no desktop e na gaveta mobile) ---------------- */
function NavTree({ items, depth = 0, activeId, expanded, onToggle, onSelect }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((item) => {
        const hasChildren = !!(item.children && item.children.length);
        const isOpen = expanded.has(item.id);
        const isSection = item.kind === "section";
        const isActive = !isSection && activeId === item.id;
        const Icon = item.icon;

        const handleClick = () => {
          if (!isSection) onSelect(item.id);
          if (hasChildren) onToggle(item.id);
        };

        return (
          <li key={item.id}>
            <button
              onClick={handleClick}
              aria-expanded={hasChildren ? isOpen : undefined}
              aria-current={isActive ? "page" : undefined}
              style={{
                display: "flex", alignItems: "center", gap: 9, width: "100%",
                padding: `8px 10px 8px ${12 + depth * 16}px`, borderRadius: 8, border: "none",
                cursor: "pointer", textAlign: "left", fontFamily: "Inter, sans-serif",
                fontSize: depth === 0 ? 13.3 : 12.6, fontWeight: depth === 0 ? 600 : 500,
                background: isActive ? INK_LIGHT : "transparent",
                color: isActive ? "#fff" : "#B8C0D6",
              }}
            >
              <Icon size={depth === 0 ? 16 : 14} aria-hidden="true" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
              {hasChildren && (
                <ChevronRight
                  size={13} aria-hidden="true" className="nav-chevron"
                  style={{ flexShrink: 0, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 150ms" }}
                />
              )}
            </button>
            {hasChildren && isOpen && (
              <NavTree items={item.children} depth={depth + 1} activeId={activeId} expanded={expanded} onToggle={onToggle} onSelect={onSelect} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ beneficios, partos }) {
  const total = beneficios.length;
  const concedidos = beneficios.filter((b) => b.situacao === "Concedido");
  const negados = beneficios.filter((b) => b.situacao === "Negado");
  const emAnalise = beneficios.filter((b) => b.situacao === "Em Análise");
  const finalizados = beneficios.filter((b) => b.situacao === "Finalizado");
  const recAdm = beneficios.filter((b) => b.status === "Rec. Administrativo");
  const judicial = beneficios.filter((b) => b.status === "Processo Judicial");
  const rural = beneficios.filter((b) => b.tipo === "SM Rural");
  const urbano = beneficios.filter((b) => b.tipo === "SM Urbano");
  const taxaConversao = (concedidos.length + negados.length) > 0 ? Math.round((concedidos.length / (concedidos.length + negados.length)) * 100) : 0;
  const honorariosRecebidos = concedidos.reduce((s, b) => s + (Number(b.valorHonorarios) || 0), 0);
  const futurosHonorarios = emAnalise.reduce((s, b) => s + (Number(b.valorHonorarios) || 0), 0);

  const porMes = useMemo(() => {
    const buckets = MESES.map((m) => ({ mes: m, concessoes: 0 }));
    concedidos.forEach((b) => {
      if (!b.dataConcessao) return;
      const d = new Date(b.dataConcessao + "T00:00:00");
      if (isNaN(d.getTime())) return;
      buckets[d.getMonth()].concessoes += 1;
    });
    return buckets;
  }, [concedidos]);

  const pieData = [
    { name: "Concedido", value: concedidos.length, color: SAGE },
    { name: "Em Análise", value: emAnalise.length, color: AMBER },
    { name: "Negado", value: negados.length, color: CRIMSON },
    { name: "Finalizado", value: finalizados.length, color: INK_LIGHT },
  ].filter((d) => d.value > 0);

  const proximosPartos = partos
    .map((p) => ({ ...p, dias: daysUntil(p.dpp) }))
    .filter((p) => p.dias !== null && p.dias >= 0)
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 4);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div className="kpi-grid">
        <KpiCard icon={ClipboardList} label="Total de Processos" value={total} accent={INK} />
        <KpiCard icon={FileCheck} label="Benefícios Concedidos" value={concedidos.length} accent={SAGE} />
        <KpiCard icon={Clock} label="Em Análise" value={emAnalise.length} accent={AMBER} />
        <KpiCard icon={FileX} label="Negados" value={negados.length} accent={CRIMSON} />
        <KpiCard icon={Scale} label="Recurso Administrativo" value={recAdm.length} accent={ROSE_DEEP} />
        <KpiCard icon={Scale} label="Processos Judiciais" value={judicial.length} accent={ROSE_DEEP} />
        <KpiCard icon={Baby} label="SM Urbano / Rural" value={`${urbano.length} / ${rural.length}`} accent={INK_LIGHT} />
        <KpiCard icon={TrendingUp} label="Taxa de Conversão" value={`${taxaConversao}%`} accent={SAGE} sub={`${concedidos.length} concedidos de ${concedidos.length + negados.length} decididos`} />
        <KpiCard icon={Wallet} label="Honorários Recebidos" value={formatBRL(honorariosRecebidos)} accent={SAGE} />
        <KpiCard icon={Wallet} label="Honorários em Potencial" value={formatBRL(futurosHonorarios)} accent={AMBER} sub="Casos ainda em análise" />
      </div>

      <div className="dash-charts">
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: INK, margin: "0 0 14px" }}>Concessões por mês</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={porMes} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fontFamily: "Inter, sans-serif", fill: SLATE }} axisLine={{ stroke: BORDER }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fontFamily: "Inter, sans-serif", fill: SLATE }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontFamily: "Inter, sans-serif", fontSize: 12, borderRadius: 8, border: `1px solid ${BORDER}` }} />
              <Bar dataKey="concessoes" fill={ROSE} radius={[5, 5, 0, 0]} name="Concessões" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: INK, margin: "0 0 14px" }}>Situação da carteira</h2>
          {pieData.length === 0 ? (
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: SLATE }}>Sem registros ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <RePieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: "Inter, sans-serif", fontSize: 12, borderRadius: 8, border: `1px solid ${BORDER}` }} />
              </RePieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {pieData.map((d) => <Pill key={d.name} color={SITU_COLOR[d.name] || INK_LIGHT}>{d.name} · {d.value}</Pill>)}
          </div>
        </div>
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
        <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: INK, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarClock size={17} color={ROSE_DEEP} aria-hidden="true" /> Próximos partos previstos
        </h2>
        {proximosPartos.length === 0 ? (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: SLATE }}>Nenhum parto futuro cadastrado.</p>
        ) : (
          <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", margin: 0, padding: 0 }}>
            {proximosPartos.map((p) => (
              <li key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: PAPER }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Baby size={16} color={ROSE_DEEP} aria-hidden="true" />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, fontWeight: 600, color: INK }}>{p.nome}</span>
                  <Pill color={ROSE_TEXT}>{p.tipo}</Pill>
                </div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: ROSE_TEXT, fontWeight: 600 }}>
                  {p.dias === 0 ? "É hoje" : `Faltam ${p.dias} dias`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------- Beneficio form ---------------- */
function emptyBeneficio() {
  return { clienteId: "", situacao: "Em Análise", status: "-", tipo: "SM Urbano", nome: "", cpf: "", dataParto: "", dataDER: "", dataConcessao: "", dataInicioPagamento: "", diaUtilPagamento: "", dataCessacao: "", qtdParcelas: "", valorBeneficio: "", valorHonorarios: "", dataPagamento: "", observacoes: "" };
}

/* ---------------- Vínculo com cliente cadastrada (reutilizado nos formulários) ---------------- */
function ClienteSelect({ clientes, value, onSelect }) {
  const id = useId();
  const ordenados = [...clientes].sort((a, b) => a.nome.localeCompare(b.nome));
  return (
    <label htmlFor={id} style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: "Inter, sans-serif" }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: SLATE }}>Vincular a uma cliente cadastrada (opcional)</span>
      <select
        id={id} value={value || ""}
        onChange={(e) => {
          const c = ordenados.find((cl) => cl.id === e.target.value);
          onSelect(c || null);
        }}
        style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", fontSize: 13.5, fontFamily: "Inter, sans-serif", color: INK, background: "#FCFBF9" }}
      >
        <option value="">— Nenhuma / preencher manualmente —</option>
        {ordenados.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.cpf ? ` — ${c.cpf}` : ""}</option>)}
      </select>
      <span style={{ fontSize: 11, color: SLATE }}>Selecionar uma cliente preenche o nome e o CPF automaticamente.</span>
    </label>
  );
}

function BeneficioForm({ initial, onSave, onCancel, saving, clientes }) {
  const [f, setF] = useState(initial);
  const [touched, setTouched] = useState(false);
  const errorId = useId();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const nomeValido = f.nome && f.nome.trim().length > 0;
  const showError = touched && !nomeValido;

  const handleSave = () => {
    setTouched(true);
    if (!nomeValido) return;
    onSave(f);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ClienteSelect
        clientes={clientes} value={f.clienteId}
        onSelect={(c) => setF(c ? { ...f, clienteId: c.id, nome: c.nome, cpf: c.cpf || f.cpf } : { ...f, clienteId: "" })}
      />
      <div className="form-grid-2">
        <div>
          <TextField
            label="Nome da cliente *" value={f.nome} onChange={set("nome")}
            style={showError ? { borderColor: CRIMSON } : undefined}
            aria-invalid={showError} aria-describedby={showError ? errorId : undefined}
          />
          {showError && <span id={errorId} role="alert" style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: CRIMSON }}>Informe o nome da cliente para salvar.</span>}
        </div>
        <TextField label="CPF" value={f.cpf} onChange={set("cpf")} />
      </div>
      <div className="form-grid-3">
        <SelectField label="Situação" options={SITUACOES} value={f.situacao} onChange={set("situacao")} />
        <SelectField label="Status / fase" options={STATUS_OPTS} value={f.status} onChange={set("status")} />
        <SelectField label="Tipo" options={TIPOS} value={f.tipo} onChange={set("tipo")} />
      </div>
      <div className="form-grid-3">
        <TextField label="Data do parto" type="date" value={f.dataParto} onChange={set("dataParto")} />
        <TextField label="Entrada (DER)" type="date" value={f.dataDER} onChange={set("dataDER")} />
        <TextField label="Data da concessão" type="date" value={f.dataConcessao} onChange={set("dataConcessao")} />
      </div>
      <div className="form-grid-3">
        <TextField label="Início do pagamento" type="date" value={f.dataInicioPagamento} onChange={set("dataInicioPagamento")} />
        <TextField label="Dia útil do pagamento" type="number" min="1" max="31" value={f.diaUtilPagamento} onChange={set("diaUtilPagamento")} />
        <TextField label="Data de cessação" type="date" value={f.dataCessacao} onChange={set("dataCessacao")} />
      </div>
      <div className="form-grid-4">
        <TextField label="Qtd. parcelas" type="number" min="0" value={f.qtdParcelas} onChange={set("qtdParcelas")} />
        <TextField label="Valor do benefício (R$)" type="number" step="0.01" min="0" value={f.valorBeneficio} onChange={set("valorBeneficio")} />
        <TextField label="Valor dos honorários (R$)" type="number" step="0.01" min="0" value={f.valorHonorarios} onChange={set("valorHonorarios")} />
        <TextField label="Data do pagamento" type="date" value={f.dataPagamento} onChange={set("dataPagamento")} />
      </div>
      <label style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: "Inter, sans-serif" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: SLATE }}>Observações</span>
        <textarea rows={3} value={f.observacoes} onChange={set("observacoes")} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", fontSize: 13.5, fontFamily: "Inter, sans-serif", color: INK, resize: "vertical", background: "#FCFBF9" }} />
      </label>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
        <button type="button" onClick={onCancel} style={btnGhost}>Cancelar</button>
        <button type="button" onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
          {saving ? <Loader2 size={15} className="spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />} Salvar registro
        </button>
      </div>
    </div>
  );
}

function emptyParto() {
  return { clienteId: "", nome: "", contato: "", tipo: "SM Urbano", status: "Lead", dpp: "", situacao: "Pré-parto", observacao: "" };
}

function PartoForm({ initial, onSave, onCancel, saving, clientes }) {
  const [f, setF] = useState(initial);
  const [touched, setTouched] = useState(false);
  const errorId = useId();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const nomeValido = f.nome && f.nome.trim().length > 0;
  const showError = touched && !nomeValido;

  const handleSave = () => {
    setTouched(true);
    if (!nomeValido) return;
    onSave(f);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ClienteSelect
        clientes={clientes} value={f.clienteId}
        onSelect={(c) => setF(c ? { ...f, clienteId: c.id, nome: c.nome, contato: c.telefone || c.whatsapp || f.contato } : { ...f, clienteId: "" })}
      />
      <div className="form-grid-2">
        <div>
          <TextField
            label="Nome da cliente *" value={f.nome} onChange={set("nome")}
            style={showError ? { borderColor: CRIMSON } : undefined}
            aria-invalid={showError} aria-describedby={showError ? errorId : undefined}
          />
          {showError && <span id={errorId} role="alert" style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: CRIMSON }}>Informe o nome da cliente para salvar.</span>}
        </div>
        <TextField label="Contato" value={f.contato} onChange={set("contato")} />
      </div>
      <div className="form-grid-3">
        <SelectField label="Tipo" options={TIPOS} value={f.tipo} onChange={set("tipo")} />
        <SelectField label="Status" options={["Lead", "Cliente"]} value={f.status} onChange={set("status")} />
        <SelectField label="Situação" options={["Pré-parto", "Pós-parto"]} value={f.situacao} onChange={set("situacao")} />
      </div>
      <TextField label="Data prevista do parto (DPP)" type="date" value={f.dpp} onChange={set("dpp")} />
      <label style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: "Inter, sans-serif" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: SLATE }}>Observação</span>
        <textarea rows={3} value={f.observacao} onChange={set("observacao")} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", fontSize: 13.5, fontFamily: "Inter, sans-serif", color: INK, resize: "vertical", background: "#FCFBF9" }} />
      </label>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
        <button type="button" onClick={onCancel} style={btnGhost}>Cancelar</button>
        <button type="button" onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
          {saving ? <Loader2 size={15} className="spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />} Salvar registro
        </button>
      </div>
    </div>
  );
}

/* ---------------- Controle de Benefícios ---------------- */
function ControleBeneficios({ api, clientesApi }) {
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filtroSituacao, setFiltroSituacao] = useState("Todas");
  const [busca, setBusca] = useState("");
  const beneficios = api.items || [];
  const clientes = clientesApi.items || [];
  const searchId = useId();
  const filterId = useId();

  const filtrados = beneficios.filter((b) => {
    if (filtroSituacao !== "Todas" && b.situacao !== filtroSituacao) return false;
    if (busca && !b.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const save = async (rec) => {
    setSaving(true);
    const ok = modal === "new" ? await api.insert(rec) : await api.update(modal.id, rec);
    setSaving(false);
    if (ok) setModal(null);
  };
  const remove = (b) => { if (confirm(`Excluir o registro de ${b.nome}? Essa ação não pode ser desfeita.`)) api.remove(b.id); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="toolbar">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <label htmlFor={searchId} className="sr-only">Buscar por nome</label>
            <Search size={14} color={SLATE} aria-hidden="true" style={{ position: "absolute", left: 10, top: 10 }} />
            <input id={searchId} placeholder="Buscar por nome" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ border: `1px solid ${BORDER}`, borderRadius: 9, padding: "8px 12px 8px 30px", fontFamily: "Inter, sans-serif", fontSize: 13, minWidth: 200, background: CARD }} />
          </div>
          <label htmlFor={filterId} className="sr-only">Filtrar por situação</label>
          <select id={filterId} value={filtroSituacao} onChange={(e) => setFiltroSituacao(e.target.value)} style={{ border: `1px solid ${BORDER}`, borderRadius: 9, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 13, background: CARD }}>
            {["Todas", ...SITUACOES].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={btnGhost} onClick={() => exportToCSV(beneficios, [
            { key: "situacao", label: "Situação" }, { key: "status", label: "Status" }, { key: "tipo", label: "Tipo" },
            { key: "nome", label: "Nome da Cliente" }, { key: "cpf", label: "CPF" }, { key: "dataParto", label: "Data do Parto" },
            { key: "dataDER", label: "Entrada (DER)" }, { key: "dataConcessao", label: "Data da Concessão" },
            { key: "dataInicioPagamento", label: "Início do Pagamento" }, { key: "diaUtilPagamento", label: "Dia útil do pagamento" },
            { key: "dataCessacao", label: "Data de Cessação" }, { key: "qtdParcelas", label: "Qtd. Parcelas" },
            { key: "valorBeneficio", label: "Valor do Benefício (R$)" }, { key: "valorHonorarios", label: "Valor dos Honorários (R$)" },
            { key: "dataPagamento", label: "Data do Pagamento" }, { key: "observacoes", label: "Observações" },
          ], "controle-de-beneficios.csv")}><Download size={15} aria-hidden="true" /> Exportar CSV</button>
          <button style={btnPrimary} onClick={() => setModal("new")}><Plus size={15} aria-hidden="true" /> Novo registro</button>
        </div>
      </div>

      {api.error && <div role="alert" style={{ color: CRIMSON_TEXT, fontSize: 13, fontFamily: "Inter, sans-serif" }}>{api.error}</div>}

      <div className="table-scroll" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, sans-serif" }} aria-label="Lista de benefícios cadastrados">
          <thead>
            <tr style={{ background: PAPER }}>
              {["Cliente", "Situação", "Fase", "Tipo", "DER", "Concessão", "Benefício", "Honorários", "Ações"].map((h) => (
                <th key={h} scope="col" style={{ textAlign: "left", padding: "11px 14px", fontSize: 11.5, fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
                  {h === "Ações" ? <span className="sr-only">{h}</span> : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {api.loading && (
              <tr><td colSpan={9} role="status" style={{ padding: "26px 14px", textAlign: "center", color: SLATE, fontSize: 13 }}><Loader2 size={14} className="spin" aria-hidden="true" /> Carregando…</td></tr>
            )}
            {!api.loading && filtrados.length === 0 && (
              <tr><td colSpan={9} style={{ padding: "26px 14px", textAlign: "center", color: SLATE, fontSize: 13 }}>Nenhum registro encontrado. Cadastre o primeiro caso com "Novo registro".</td></tr>
            )}
            {filtrados.map((b) => (
              <tr key={b.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                <td style={{ padding: "11px 14px", fontSize: 13.5, color: INK, fontWeight: 600 }}>{b.nome || "—"}</td>
                <td style={{ padding: "11px 14px" }}><Pill color={SITU_COLOR[b.situacao] || SLATE}>{b.situacao}</Pill></td>
                <td style={{ padding: "11px 14px", fontSize: 13, color: SLATE }}>{b.status}</td>
                <td style={{ padding: "11px 14px", fontSize: 13, color: SLATE }}>{b.tipo}</td>
                <td style={{ padding: "11px 14px", fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", color: SLATE }}>{formatDate(b.dataDER)}</td>
                <td style={{ padding: "11px 14px", fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", color: SLATE }}>{formatDate(b.dataConcessao)}</td>
                <td style={{ padding: "11px 14px", fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", color: INK }}>{formatBRL(b.valorBeneficio)}</td>
                <td style={{ padding: "11px 14px", fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", color: ROSE_TEXT }}>{formatBRL(b.valorHonorarios)}</td>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button onClick={() => setModal(b)} className="icon-btn" style={iconBtn} aria-label={`Editar registro de ${b.nome}`}><Pencil size={14} color={SLATE} aria-hidden="true" /></button>
                    <button onClick={() => remove(b)} className="icon-btn" style={iconBtn} aria-label={`Excluir registro de ${b.nome}`}><Trash2 size={14} color={CRIMSON_TEXT} aria-hidden="true" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === "new" ? "Novo registro" : "Editar registro"} onClose={() => setModal(null)} wide>
          <BeneficioForm initial={modal === "new" ? emptyBeneficio() : modal} onSave={save} onCancel={() => setModal(null)} saving={saving} clientes={clientes} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Partos Futuros ---------------- */
function PartosFuturos({ api, clientesApi }) {
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const partos = api.items || [];
  const clientes = clientesApi.items || [];

  const save = async (rec) => {
    setSaving(true);
    const ok = modal === "new" ? await api.insert(rec) : await api.update(modal.id, rec);
    setSaving(false);
    if (ok) setModal(null);
  };
  const remove = (p) => { if (confirm(`Excluir o registro de ${p.nome}? Essa ação não pode ser desfeita.`)) api.remove(p.id); };

  const ordenados = [...partos].sort((a, b) => (a.dpp || "9999").localeCompare(b.dpp || "9999"));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button style={btnGhost} onClick={() => exportToCSV(partos, [
          { key: "nome", label: "Nome da Cliente" }, { key: "contato", label: "Contato" },
          { key: "tipo", label: "Tipo de Salário Maternidade" }, { key: "status", label: "Status" },
          { key: "dpp", label: "Data Prevista do Parto (DPP)" }, { key: "situacao", label: "Situação" },
          { key: "observacao", label: "Observação" },
        ], "partos-futuros.csv")}><Download size={15} aria-hidden="true" /> Exportar CSV</button>
        <button style={btnPrimary} onClick={() => setModal("new")}><Plus size={15} aria-hidden="true" /> Nova cliente</button>
      </div>

      {api.error && <div role="alert" style={{ color: CRIMSON_TEXT, fontSize: 13, fontFamily: "Inter, sans-serif" }}>{api.error}</div>}

      <div className="partos-grid">
        {api.loading && <p role="status" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: SLATE }}><Loader2 size={14} className="spin" aria-hidden="true" /> Carregando…</p>}
        {!api.loading && ordenados.length === 0 && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: SLATE }}>Nenhuma gestante cadastrada ainda.</p>}
        {ordenados.map((p) => {
          const dias = daysUntil(p.dpp);
          return (
            <div key={p.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 16, color: INK }}>{p.nome || "—"}</div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: SLATE }}>{p.contato || "Sem contato"}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setModal(p)} className="icon-btn" style={iconBtn} aria-label={`Editar registro de ${p.nome}`}><Pencil size={13} color={SLATE} aria-hidden="true" /></button>
                  <button onClick={() => remove(p)} className="icon-btn" style={iconBtn} aria-label={`Excluir registro de ${p.nome}`}><Trash2 size={13} color={CRIMSON_TEXT} aria-hidden="true" /></button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Pill color={ROSE_TEXT}>{p.tipo}</Pill>
                <Pill color={p.status === "Cliente" ? SAGE_TEXT : AMBER_TEXT}>{p.status}</Pill>
                <Pill color={INK_LIGHT}>{p.situacao}</Pill>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: PAPER, borderRadius: 9, padding: "9px 12px", marginTop: 2 }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: SLATE }}>DPP {formatDate(p.dpp)}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, fontWeight: 600, color: dias >= 0 ? ROSE_TEXT : SLATE }}>
                  {dias === null ? "—" : dias >= 0 ? `Faltam ${dias}d` : `Há ${Math.abs(dias)}d`}
                </span>
              </div>
              {p.observacao && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: SLATE, margin: 0 }}>{p.observacao}</p>}
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal === "new" ? "Nova cliente / lead" : "Editar registro"} onClose={() => setModal(null)}>
          <PartoForm initial={modal === "new" ? emptyParto() : modal} onSave={save} onCancel={() => setModal(null)} saving={saving} clientes={clientes} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Clientes ---------------- */
function emptyCliente() {
  return { nome: "", cpf: "", telefone: "", whatsapp: "", email: "", cidade: "", estado: "", status: "Lead", observacoes: "" };
}
const CLIENTE_STATUS = ["Lead", "Ativo", "Inativo"];
const CLIENTE_STATUS_COLOR = { "Lead": AMBER_TEXT, "Ativo": SAGE_TEXT, "Inativo": SLATE };

function ClienteForm({ initial, onSave, onCancel, saving }) {
  const [f, setF] = useState(initial);
  const [touched, setTouched] = useState(false);
  const errorId = useId();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const nomeValido = f.nome && f.nome.trim().length > 0;
  const showError = touched && !nomeValido;

  const handleSave = () => {
    setTouched(true);
    if (!nomeValido) return;
    onSave(f);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="form-grid-2">
        <div>
          <TextField
            label="Nome *" value={f.nome} onChange={set("nome")}
            style={showError ? { borderColor: CRIMSON } : undefined}
            aria-invalid={showError} aria-describedby={showError ? errorId : undefined}
          />
          {showError && <span id={errorId} role="alert" style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: CRIMSON }}>Informe o nome da cliente para salvar.</span>}
        </div>
        <TextField label="CPF" value={f.cpf} onChange={set("cpf")} />
      </div>
      <div className="form-grid-3">
        <TextField label="Telefone" value={f.telefone} onChange={set("telefone")} />
        <TextField label="WhatsApp" value={f.whatsapp} onChange={set("whatsapp")} />
        <TextField label="E-mail" type="email" value={f.email} onChange={set("email")} />
      </div>
      <div className="form-grid-3">
        <TextField label="Cidade" value={f.cidade} onChange={set("cidade")} />
        <TextField label="Estado (UF)" maxLength={2} value={f.estado} onChange={set("estado")} />
        <SelectField label="Status" options={CLIENTE_STATUS} value={f.status} onChange={set("status")} />
      </div>
      <label style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: "Inter, sans-serif" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: SLATE }}>Observações</span>
        <textarea rows={3} value={f.observacoes} onChange={set("observacoes")} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", fontSize: 13.5, fontFamily: "Inter, sans-serif", color: INK, resize: "vertical", background: "#FCFBF9" }} />
      </label>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
        <button type="button" onClick={onCancel} style={btnGhost}>Cancelar</button>
        <button type="button" onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
          {saving ? <Loader2 size={15} className="spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />} Salvar cliente
        </button>
      </div>
    </div>
  );
}

function ClienteDetalhe({ cliente, beneficios, partos }) {
  const bens = beneficios.filter((b) => b.clienteId === cliente.id);
  const parts = partos.filter((p) => p.clienteId === cliente.id);
  const semVinculos = bens.length === 0 && parts.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="form-grid-3" style={{ fontFamily: "Inter, sans-serif", fontSize: 13 }}>
        <div><span style={{ color: SLATE, fontSize: 11.5 }}>CPF</span><div style={{ color: INK, fontWeight: 600 }}>{cliente.cpf || "—"}</div></div>
        <div><span style={{ color: SLATE, fontSize: 11.5 }}>Telefone / WhatsApp</span><div style={{ color: INK, fontWeight: 600 }}>{cliente.telefone || cliente.whatsapp || "—"}</div></div>
        <div><span style={{ color: SLATE, fontSize: 11.5 }}>E-mail</span><div style={{ color: INK, fontWeight: 600 }}>{cliente.email || "—"}</div></div>
        <div><span style={{ color: SLATE, fontSize: 11.5 }}>Cidade / UF</span><div style={{ color: INK, fontWeight: 600 }}>{[cliente.cidade, cliente.estado].filter(Boolean).join(" / ") || "—"}</div></div>
        <div><span style={{ color: SLATE, fontSize: 11.5 }}>Status</span><div><Pill color={CLIENTE_STATUS_COLOR[cliente.status] || SLATE}>{cliente.status}</Pill></div></div>
      </div>
      {cliente.observacoes && (
        <div style={{ background: PAPER, borderRadius: 10, padding: "10px 12px", fontFamily: "Inter, sans-serif", fontSize: 12.5, color: SLATE }}>{cliente.observacoes}</div>
      )}

      <div>
        <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 15, color: INK, margin: "0 0 10px" }}>Benefícios vinculados</h3>
        {bens.length === 0 ? (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: SLATE, margin: 0 }}>Nenhum benefício vinculado a essa cliente ainda.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {bens.map((b) => (
              <li key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: PAPER, borderRadius: 9, padding: "9px 12px" }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: INK }}>{b.tipo} · {formatBRL(b.valorBeneficio)}</span>
                <Pill color={SITU_COLOR[b.situacao] || SLATE}>{b.situacao}</Pill>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 15, color: INK, margin: "0 0 10px" }}>Partos futuros vinculados</h3>
        {parts.length === 0 ? (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: SLATE, margin: 0 }}>Nenhum parto futuro vinculado a essa cliente ainda.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {parts.map((p) => (
              <li key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: PAPER, borderRadius: 9, padding: "9px 12px" }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: INK }}>DPP {formatDate(p.dpp)}</span>
                <Pill color={INK_LIGHT}>{p.situacao}</Pill>
              </li>
            ))}
          </ul>
        )}
      </div>

      {semVinculos && (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: SLATE, margin: 0 }}>
          Dica: ao cadastrar um novo benefício ou parto futuro, use o campo "Vincular a uma cliente cadastrada" para conectar aqui automaticamente.
        </p>
      )}
    </div>
  );
}

function ClientesScreen({ api, beneficiosApi, partosApi }) {
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const clientes = api.items || [];
  const beneficios = beneficiosApi.items || [];
  const partos = partosApi.items || [];
  const searchId = useId();
  const filterId = useId();

  const filtrados = clientes.filter((c) => {
    if (filtroStatus !== "Todos" && c.status !== filtroStatus) return false;
    if (busca && !c.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const totalAtivos = clientes.filter((c) => c.status === "Ativo").length;
  const totalLeads = clientes.filter((c) => c.status === "Lead").length;
  const comBeneficioAndamento = clientes.filter((c) => beneficios.some((b) => b.clienteId === c.id && b.situacao === "Em Análise")).length;

  const vinculosCount = (clienteId) => beneficios.filter((b) => b.clienteId === clienteId).length + partos.filter((p) => p.clienteId === clienteId).length;

  const save = async (rec) => {
    setSaving(true);
    const ok = modal === "new" ? await api.insert(rec) : await api.update(modal.id, rec);
    setSaving(false);
    if (ok) setModal(null);
  };
  const remove = (c) => { if (confirm(`Excluir a cliente ${c.nome}? Essa ação não pode ser desfeita.`)) api.remove(c.id); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="kpi-grid">
        <KpiCard icon={Users} label="Total de Clientes" value={clientes.length} accent={INK} />
        <KpiCard icon={FileCheck} label="Clientes Ativos" value={totalAtivos} accent={SAGE} />
        <KpiCard icon={Clock} label="Leads" value={totalLeads} accent={AMBER} />
        <KpiCard icon={TrendingUp} label="Com Benefício em Andamento" value={comBeneficioAndamento} accent={ROSE_DEEP} />
      </div>

      <div className="toolbar">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <label htmlFor={searchId} className="sr-only">Buscar por nome</label>
            <Search size={14} color={SLATE} aria-hidden="true" style={{ position: "absolute", left: 10, top: 10 }} />
            <input id={searchId} placeholder="Buscar por nome" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ border: `1px solid ${BORDER}`, borderRadius: 9, padding: "8px 12px 8px 30px", fontFamily: "Inter, sans-serif", fontSize: 13, minWidth: 200, background: CARD }} />
          </div>
          <label htmlFor={filterId} className="sr-only">Filtrar por status</label>
          <select id={filterId} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={{ border: `1px solid ${BORDER}`, borderRadius: 9, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 13, background: CARD }}>
            {["Todos", ...CLIENTE_STATUS].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={btnGhost} onClick={() => exportToCSV(clientes, [
            { key: "nome", label: "Nome" }, { key: "cpf", label: "CPF" }, { key: "telefone", label: "Telefone" },
            { key: "whatsapp", label: "WhatsApp" }, { key: "email", label: "E-mail" }, { key: "cidade", label: "Cidade" },
            { key: "estado", label: "Estado" }, { key: "status", label: "Status" }, { key: "observacoes", label: "Observações" },
          ], "clientes.csv")}><Download size={15} aria-hidden="true" /> Exportar CSV</button>
          <button style={btnPrimary} onClick={() => setModal("new")}><Plus size={15} aria-hidden="true" /> Novo cliente</button>
        </div>
      </div>

      {api.error && <div role="alert" style={{ color: CRIMSON_TEXT, fontSize: 13, fontFamily: "Inter, sans-serif" }}>{api.error}</div>}

      <div className="table-scroll" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, sans-serif" }} aria-label="Lista de clientes cadastradas">
          <thead>
            <tr style={{ background: PAPER }}>
              {["Nome", "Status", "Telefone/WhatsApp", "Cidade/UF", "Processos vinculados", "Ações"].map((h) => (
                <th key={h} scope="col" style={{ textAlign: "left", padding: "11px 14px", fontSize: 11.5, fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
                  {h === "Ações" ? <span className="sr-only">{h}</span> : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {api.loading && (
              <tr><td colSpan={6} role="status" style={{ padding: "26px 14px", textAlign: "center", color: SLATE, fontSize: 13 }}><Loader2 size={14} className="spin" aria-hidden="true" /> Carregando…</td></tr>
            )}
            {!api.loading && filtrados.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "26px 14px", textAlign: "center", color: SLATE, fontSize: 13 }}>Nenhuma cliente encontrada. Cadastre a primeira com "Novo cliente".</td></tr>
            )}
            {filtrados.map((c) => (
              <tr key={c.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                <td style={{ padding: "11px 14px" }}>
                  <button onClick={() => setDetail(c)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13.5, color: INK, fontWeight: 600, textDecoration: "underline", textDecorationColor: BORDER, fontFamily: "Inter, sans-serif" }}>
                    {c.nome}
                  </button>
                </td>
                <td style={{ padding: "11px 14px" }}><Pill color={CLIENTE_STATUS_COLOR[c.status] || SLATE}>{c.status}</Pill></td>
                <td style={{ padding: "11px 14px", fontSize: 13, color: SLATE }}>{c.telefone || c.whatsapp || "—"}</td>
                <td style={{ padding: "11px 14px", fontSize: 13, color: SLATE }}>{[c.cidade, c.estado].filter(Boolean).join("/") || "—"}</td>
                <td style={{ padding: "11px 14px", fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", color: INK }}>{vinculosCount(c.id)}</td>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button onClick={() => setModal(c)} className="icon-btn" style={iconBtn} aria-label={`Editar cliente ${c.nome}`}><Pencil size={14} color={SLATE} aria-hidden="true" /></button>
                    <button onClick={() => remove(c)} className="icon-btn" style={iconBtn} aria-label={`Excluir cliente ${c.nome}`}><Trash2 size={14} color={CRIMSON_TEXT} aria-hidden="true" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === "new" ? "Novo cliente" : "Editar cliente"} onClose={() => setModal(null)} wide>
          <ClienteForm initial={modal === "new" ? emptyCliente() : modal} onSave={save} onCancel={() => setModal(null)} saving={saving} />
        </Modal>
      )}

      {detail && (
        <Modal title={detail.nome} onClose={() => setDetail(null)} wide>
          <ClienteDetalhe cliente={detail} beneficios={beneficios} partos={partos} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Cabeçalho da marca (reaproveitado no sidebar e na gaveta) ---------------- */
function BrandHeader() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px" }}>
      <div aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 9, background: ROSE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Baby size={18} color="#fff" /></div>
      <div>
        <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 15.5, letterSpacing: "0.01em", color: "#fff" }}>Jusystem</div>
        <div style={{ fontSize: 10.5, color: "#B8C0D6", letterSpacing: "0.02em" }}>Gestão Previdenciária</div>
      </div>
    </div>
  );
}

function SidebarFooter({ session }) {
  return (
    <div className="sidebar-footer">
      <div style={{ marginBottom: 8, wordBreak: "break-all" }}>{session.user.email}</div>
      <button onClick={() => supabase.auth.signOut()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#B8C0D6", cursor: "pointer", fontSize: 11.5, padding: 0 }}>
        <LogOut size={13} aria-hidden="true" /> Sair da conta
      </button>
      <div className="sidebar-footer-copyright">Jusystem © 2026</div>
    </div>
  );
}

/* ---------------- App shell ---------------- */
function MainApp({ session }) {
  const [activeId, setActiveId] = useState("dashboard");
  const [expanded, setExpanded] = useState(DEFAULT_EXPANDED);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  const clientesApi = useSupabaseTable("clientes", clienteToDb, clienteFromDb, session.user.id);
  const beneficiosApi = useSupabaseTable("beneficios", beneficioToDb, beneficioFromDb, session.user.id);
  const partosApi = useSupabaseTable("partos_futuros", partoToDb, partoFromDb, session.user.id);
  const loading = clientesApi.items === null || beneficiosApi.items === null || partosApi.items === null;
  const activeItem = NAV_MAP[activeId] || NAV_MAP.dashboard;

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectItem = (id) => {
    setActiveId(id);
    setDrawerOpen(false);
  };

  useEffect(() => {
    if (!drawerOpen) return;
    drawerRef.current?.focus();
    const handler = (e) => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [drawerOpen]);

  return (
    <div className="app-shell" style={{ background: PAPER, fontFamily: "Inter, sans-serif" }}>
      <style>{GLOBAL_STYLES}</style>
      <a href="#main-content" style={{ position: "absolute", left: -9999, top: 0 }} onFocus={(e) => { e.target.style.left = "10px"; e.target.style.top = "10px"; e.target.style.zIndex = 999; e.target.style.background = "#fff"; e.target.style.padding = "8px 14px"; e.target.style.borderRadius = "8px"; }} onBlur={(e) => { e.target.style.left = "-9999px"; }}>
        Pular para o conteúdo principal
      </a>

      {/* Barra superior (só aparece em telas estreitas) */}
      <div className="mobile-topbar" style={{ background: INK }}>
        <BrandHeader />
        <div style={{ flex: 1 }} />
        <button onClick={() => setDrawerOpen(true)} aria-label="Abrir menu de navegação" style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", padding: 6 }}>
          <Menu size={22} />
        </button>
      </div>

      {/* Sidebar (desktop) */}
      <aside className="sidebar" style={{ background: INK, color: "#fff" }}>
        <BrandHeader />
        <nav className="sidebar-nav" aria-label="Navegação principal">
          <NavTree items={NAV_TREE} activeId={activeId} expanded={expanded} onToggle={toggleExpand} onSelect={selectItem} />
        </nav>
        <SidebarFooter session={session} />
      </aside>

      {/* Gaveta de navegação (mobile) */}
      {drawerOpen && (
        <>
          <div className="nav-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <div
            ref={drawerRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Menu de navegação"
            className="nav-drawer-panel" style={{ background: INK, color: "#fff", outline: "none" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <BrandHeader />
              <button onClick={() => setDrawerOpen(false)} aria-label="Fechar menu" style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 6 }}>
                <X size={20} />
              </button>
            </div>
            <nav aria-label="Navegação principal" style={{ flex: 1, overflowY: "auto" }}>
              <NavTree items={NAV_TREE} activeId={activeId} expanded={expanded} onToggle={toggleExpand} onSelect={selectItem} />
            </nav>
            <SidebarFooter session={session} />
          </div>
        </>
      )}

      <main id="main-content" className="main-content">
        <header style={{ marginBottom: 22 }}>
          <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 25, fontWeight: 600, color: INK, margin: 0 }}>{activeItem.label}</h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: SLATE, margin: "4px 0 0" }}>
            {activeItem.kind === "dashboard" && "Gestão estratégica e financeira dos casos acompanhados."}
            {activeItem.kind === "clientes" && "Todas as clientes do escritório, com os processos vinculados a cada uma."}
            {activeItem.kind === "beneficios" && "Cada solicitação, do requerimento à concessão, em um só lugar."}
            {activeItem.kind === "partos" && "Gestantes e leads acompanhados até a data prevista do parto."}
            {activeItem.kind === "placeholder" && "Em desenvolvimento — mais uma frente do escritório sendo digitalizada."}
          </p>
        </header>

        {loading ? (
          <div role="status" style={{ display: "flex", alignItems: "center", gap: 8, color: SLATE, fontSize: 13 }}><Loader2 size={15} className="spin" aria-hidden="true" /> Carregando dados…</div>
        ) : (
          <>
            {activeItem.kind === "dashboard" && <Dashboard beneficios={beneficiosApi.items} partos={partosApi.items} />}
            {activeItem.kind === "clientes" && <ClientesScreen api={clientesApi} beneficiosApi={beneficiosApi} partosApi={partosApi} />}
            {activeItem.kind === "beneficios" && <ControleBeneficios api={beneficiosApi} clientesApi={clientesApi} />}
            {activeItem.kind === "partos" && <PartosFuturos api={partosApi} clientesApi={clientesApi} />}
            {activeItem.kind === "placeholder" && <Placeholder item={activeItem} />}
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = ainda checando, null = deslogado

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div role="status" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: PAPER }}>
        <style>{GLOBAL_STYLES}</style>
        <Loader2 size={20} color={INK} className="spin" aria-hidden="true" />
        <span className="sr-only">Carregando…</span>
      </div>
    );
  }

  return session ? <MainApp session={session} /> : <Auth />;
}
