import React, { useState } from "react";
import { Baby, Loader2 } from "lucide-react";
import { supabase } from "./supabaseClient";
import { INK, ROSE, ROSE_DEEP, PAPER, CARD, SLATE, BORDER, FONT_IMPORT, btnPrimary } from "./theme";

export default function Auth() {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setMessage("Conta criada! Verifique seu e-mail para confirmar o acesso, depois faça login.");
      }
    } catch (err) {
      setError(err.message || "Não foi possível autenticar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: PAPER, display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "Inter, sans-serif", padding: 20,
    }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ width: "100%", maxWidth: 380, background: CARD, borderRadius: 16, padding: 32, border: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: ROSE, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Baby size={19} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 17, color: INK }}>Jusystem</div>
            <div style={{ fontSize: 11, color: SLATE }}>Controle de Salário Maternidade</div>
          </div>
        </div>

        <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 20, color: INK, margin: "0 0 6px" }}>
          {mode === "signin" ? "Entrar na sua conta" : "Criar uma conta"}
        </h2>
        <p style={{ fontSize: 13, color: SLATE, margin: "0 0 20px" }}>
          {mode === "signin" ? "Seus dados são privados e ficam isolados dos de outros escritórios." : "Leva menos de um minuto."}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: SLATE }}>E-mail</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 11px", fontSize: 13.5 }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: SLATE }}>Senha</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 11px", fontSize: 13.5 }} />
          </label>

          {error && <div style={{ fontSize: 12.5, color: "#B5484F" }}>{error}</div>}
          {message && <div style={{ fontSize: 12.5, color: "#5C8374" }}>{message}</div>}

          <button type="submit" disabled={loading} style={{ ...btnPrimary, justifyContent: "center", marginTop: 4, opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader2 size={15} className="spin" /> : null}
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setMessage(null); }}
          style={{ background: "none", border: "none", color: ROSE_DEEP, fontSize: 12.5, marginTop: 16, cursor: "pointer", width: "100%", textAlign: "center" }}
        >
          {mode === "signin" ? "Ainda não tem conta? Criar uma agora" : "Já tem conta? Entrar"}
        </button>
      </div>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
