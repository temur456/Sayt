import React, { useState } from "react";
import { Mail, Lock, BookOpen } from "lucide-react";
import { supabase } from "./supabaseClient";

const C = {
  paper: "#F3EEE0",
  card: "#FBF8EF",
  ink: "#2B2620",
  inkSoft: "#7A7060",
  line: "#DCD3B8",
  indigo: "#35507A",
};

const inputStyle = {
  width: "100%",
  background: C.paper,
  border: `1px solid ${C.line}`,
  borderRadius: 10,
  padding: "11px 12px 11px 38px",
  fontSize: 15,
  color: C.ink,
  outline: "none",
};

export default function AuthScreen() {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email.trim() || password.length < 6) {
      setError("Email kiriting va parol kamida 6 belgidan iborat bo'lsin.");
      return;
    }
    setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("Kirishda xatolik: email yoki parol noto'g'ri.");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError("Ro'yxatdan o'tishda xatolik: " + error.message);
      } else {
        setInfo("Hisob yaratildi. Emailingizni tasdiqlab, so'ng kiring.");
      }
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: C.paper, fontFamily: "'Manrope', sans-serif" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-7">
          <div
            className="rounded-2xl flex items-center justify-center mb-3"
            style={{ width: 56, height: 56, background: C.indigo }}
          >
            <BookOpen size={26} color="#fff" strokeWidth={1.8} />
          </div>
          <div className="flex items-baseline gap-1">
            <span style={{ fontFamily: "'Kalam', cursive", fontWeight: 700, fontSize: 28, color: C.ink }}>
              Daftar
            </span>
            <span style={{ fontFamily: "'Kalam', cursive", fontWeight: 700, fontSize: 28, color: C.indigo }}>
              .uz
            </span>
          </div>
          <p style={{ color: C.inkSoft, fontSize: 13 }} className="mt-1">
            Qarzlar, eslatmalar va daromad — bir joyda
          </p>
        </div>

        <div
          className="rounded-2xl p-5"
          style={{ background: C.card, border: `1px solid ${C.line}` }}
        >
          <div
            className="flex rounded-xl p-1 mb-4"
            style={{ background: C.paper }}
          >
            <button
              onClick={() => { setMode("login"); setError(""); setInfo(""); }}
              className="flex-1 py-2 rounded-lg text-sm"
              style={{
                background: mode === "login" ? C.card : "transparent",
                color: mode === "login" ? C.ink : C.inkSoft,
                fontWeight: 700,
              }}
            >
              Kirish
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); setInfo(""); }}
              className="flex-1 py-2 rounded-lg text-sm"
              style={{
                background: mode === "signup" ? C.card : "transparent",
                color: mode === "signup" ? C.ink : C.inkSoft,
                fontWeight: 700,
              }}
            >
              Ro'yxatdan o'tish
            </button>
          </div>

          <form onSubmit={submit}>
            <div className="relative mb-3">
              <Mail size={16} color={C.inkSoft} className="absolute" style={{ left: 12, top: 13 }} />
              <input
                style={inputStyle}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
              />
            </div>
            <div className="relative mb-4">
              <Lock size={16} color={C.inkSoft} className="absolute" style={{ left: 12, top: 13 }} />
              <input
                style={inputStyle}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parol (kamida 6 belgi)"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <p style={{ color: "#A6462B", fontSize: 12.5 }} className="mb-3">{error}</p>
            )}
            {info && (
              <p style={{ color: "#2F6B4F", fontSize: 12.5 }} className="mb-3">{info}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3"
              style={{
                background: C.indigo,
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Kutilmoqda..." : mode === "login" ? "Kirish" : "Hisob yaratish"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
