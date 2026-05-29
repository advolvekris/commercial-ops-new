import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Building2, ChevronLeft, Lock, Mail, Loader2 } from "lucide-react";
import { getResponsaveis } from "@/mocks/handlers";
import { useAppStore } from "@/store/app-store";
import { AmbientOrbs } from "./AmbientOrbs";

type View = "main" | "google" | "sso";

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

export function LoginScreen() {
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  const [view, setView] = useState<View>("main");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function clearError() {
    if (error) setError("");
  }

  async function authenticate(emailToUse: string) {
    setLoading(true);
    setError("");
    const list = await getResponsaveis();
    const user = list.find((r) => r.email.toLowerCase() === emailToUse.trim().toLowerCase());
    setLoading(false);
    if (user) {
      setCurrentUser(user);
    } else {
      setError("E-mail não encontrado. Verifique suas credenciais.");
    }
  }

  function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    void authenticate(email);
  }

  function handleSubLogin(e: FormEvent) {
    e.preventDefault();
    if (!subEmail.trim()) return;
    void authenticate(subEmail);
  }

  function goBack() {
    setView("main");
    setSubEmail("");
    setError("");
  }

  if (view === "google" || view === "sso") {
    const isGoogle = view === "google";
    return (
      <div className="LS-screen" id="login-screen">
        <AmbientOrbs />
        <div className="LS-panel">
          <button type="button" className="LS-back-btn" onClick={goBack}>
            <ChevronLeft size={15} strokeWidth={2.5} />
            Voltar
          </button>

          <div className="LS-sub-icon">
            {isGoogle ? <GoogleLogo /> : <Building2 size={22} strokeWidth={1.8} />}
          </div>

          <h2 className="LS-heading" style={{ fontSize: 22, marginBottom: 6 }}>
            {isGoogle ? "Entrar com Google" : "Login corporativo (SSO)"}
          </h2>
          <p className="LS-sub" style={{ marginBottom: 24 }}>
            {isGoogle
              ? "Use sua conta Google corporativa Advolve"
              : "Insira seu e-mail corporativo para continuar"}
          </p>

          <form onSubmit={handleSubLogin} className="LS-field-group">
            <label className="LS-field-label">
              E-mail corporativo
              <div className="LS-input-wrap">
                <Mail size={14} className="LS-input-icon" />
                <input
                  className="LS-input LS-input--icon"
                  type="email"
                  placeholder={isGoogle ? "nome@advolve.ai" : "nome@advolve.ai"}
                  value={subEmail}
                  onChange={(e) => { setSubEmail(e.target.value); clearError(); }}
                  autoFocus
                  required
                />
              </div>
            </label>

            {error && <p className="LS-error">{error}</p>}

            <button
              type="submit"
              className="LS-enter-btn"
              disabled={!subEmail.trim() || loading}
            >
              {loading ? (
                <Loader2 size={16} className="LS-spin" />
              ) : (
                <>
                  {isGoogle ? "Continuar com Google" : "Continuar via SSO"}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="LS-screen" id="login-screen">
      <AmbientOrbs />
      <div className="LS-panel">
        <div className="LS-logo">
          <img src="/advolve-logo.png" alt="advolve" className="LS-logo-img" />
        </div>

        <h2 className="LS-heading">
          Bem-vindo<br />
          de <em>volta</em>
        </h2>
        <p className="LS-sub">Acesse sua conta Advolve para continuar.</p>

        <div className="LS-divider" />

        {/* Social / SSO */}
        <div className="LS-social-row">
          <button
            type="button"
            className="LS-social-btn LS-social-btn--google"
            onClick={() => { setError(""); setView("google"); }}
          >
            <GoogleLogo />
            Continuar com Google
          </button>
          <button
            type="button"
            className="LS-social-btn LS-social-btn--sso"
            onClick={() => { setError(""); setView("sso"); }}
          >
            <Building2 size={16} strokeWidth={2} />
            Entrar com SSO
          </button>
        </div>

        <div className="LS-or-row">
          <span className="LS-or-line" />
          <span className="LS-or-label">ou entre com e-mail</span>
          <span className="LS-or-line" />
        </div>

        {/* Email + password */}
        <form onSubmit={handleEmailLogin} className="LS-field-group">
          <label className="LS-field-label">
            E-mail
            <div className="LS-input-wrap">
              <Mail size={14} className="LS-input-icon" />
              <input
                className="LS-input LS-input--icon"
                type="email"
                placeholder="nome@advolve.ai"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                autoComplete="email"
              />
            </div>
          </label>

          <label className="LS-field-label">
            Senha
            <div className="LS-input-wrap">
              <Lock size={14} className="LS-input-icon" />
              <input
                className="LS-input LS-input--icon"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                autoComplete="current-password"
              />
            </div>
          </label>

          {error && <p className="LS-error">{error}</p>}

          <button
            type="submit"
            className="LS-enter-btn"
            disabled={!email.trim() || !password.trim() || loading}
          >
            {loading ? (
              <Loader2 size={16} className="LS-spin" />
            ) : (
              <>
                Entrar
                <ArrowRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
