import React, { useState, useEffect } from "react";
import {
  Users, Wallet, Bell, TrendingUp, Plus, Search, X, Check,
  Minus, ChevronRight, Trash2, ArrowLeft, Phone, Calendar,
  Package, ClipboardList, LogOut,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import AuthScreen from "./AuthScreen";
import * as db from "./db";

/* ---------------------------------- THEME ---------------------------------- */
const C = {
  paper: "#F3EEE0",
  paperDark: "#EAE3CE",
  card: "#FBF8EF",
  ink: "#2B2620",
  inkSoft: "#7A7060",
  line: "#DCD3B8",
  green: "#2F6B4F",
  greenSoft: "#DEEAE2",
  rust: "#A6462B",
  rustSoft: "#F1DDD4",
  amber: "#B4842A",
  amberSoft: "#F2E6CC",
  indigo: "#35507A",
  indigoSoft: "#DCE3EE",
};

/* ---------------------------------- HELPERS ---------------------------------- */
function fmt(n) {
  const num = Math.round(Number(n) || 0);
  return num.toLocaleString("ru-RU").replace(/,/g, " ");
}
function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function fmtDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const months = ["yan","fev","mar","apr","may","iyun","iyul","avg","sen","okt","noy","dek"];
  return `${parseInt(d,10)} ${months[parseInt(m,10)-1]} ${y}`;
}

/* ---------------------------------- SMALL UI PIECES ---------------------------------- */
function Screw({ style }) {
  return (
    <div style={{ width: 9, height: 9, borderRadius: "50%", background: C.paper,
      border: `2px solid ${C.line}`, boxShadow: "inset 0 1px 2px rgba(0,0,0,0.15)", ...style }} />
  );
}
function TopBinding() {
  return (
    <div className="flex justify-between px-6 pt-3 pb-1">
      {new Array(9).fill(0).map((_, i) => <Screw key={i} />)}
    </div>
  );
}
function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="rounded-full flex items-center justify-center mb-4" style={{ width: 64, height: 64, background: C.paperDark }}>
        <Icon size={26} color={C.inkSoft} strokeWidth={1.6} />
      </div>
      <p style={{ color: C.ink, fontWeight: 700 }} className="mb-1">{title}</p>
      <p style={{ color: C.inkSoft, fontSize: 13 }}>{subtitle}</p>
    </div>
  );
}
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="flex items-center gap-2 rounded-xl px-3 mb-3" style={{ background: C.card, border: `1px solid ${C.line}`, height: 42 }}>
      <Search size={16} color={C.inkSoft} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm" style={{ color: C.ink }} />
      {value && <button onClick={() => onChange("")}><X size={15} color={C.inkSoft} /></button>}
    </div>
  );
}
function FAB({ onClick, color }) {
  return (
    <button onClick={onClick}
      className="fixed rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      style={{ width: 54, height: 54, background: color, bottom: 84, right: "50%", marginRight: -204,
        boxShadow: "0 6px 16px rgba(0,0,0,0.25)" }}>
      <Plus size={24} color="#fff" strokeWidth={2.4} />
    </button>
  );
}
function Sheet({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0" style={{ background: "rgba(43,38,32,0.45)" }} onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-t-3xl px-5 pt-4 pb-6 z-10" style={{ background: C.card, maxHeight: "88vh", overflowY: "auto" }}>
        <div className="mx-auto mb-3 rounded-full" style={{ width: 40, height: 4, background: C.line }} />
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ color: C.ink, fontWeight: 800, fontSize: 17 }}>{title}</h3>
          <button onClick={onClose}><X size={20} color={C.inkSoft} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block mb-1" style={{ color: C.inkSoft, fontSize: 12, fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}
const inputStyle = {
  width: "100%", background: C.paper, border: `1px solid ${C.line}`, borderRadius: 10,
  padding: "10px 12px", fontSize: 15, color: C.ink, outline: "none",
};
function PrimaryButton({ children, onClick, color, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full rounded-xl py-3 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      style={{ background: disabled ? C.line : color, color: "#fff", fontWeight: 700, fontSize: 15, opacity: disabled ? 0.7 : 1 }}>
      {children}
    </button>
  );
}

/* ---------------------------------- PERSON CARD ---------------------------------- */
function PersonCard({ person, accent, settleLabel, onSettle, onSubtract }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");
  const submit = () => {
    const n = Number(val);
    if (!n || n <= 0) return;
    onSubtract(person, n);
    setVal(""); setOpen(false);
  };
  return (
    <div className="rounded-2xl mb-3 overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p style={{ color: C.ink, fontWeight: 700, fontSize: 15.5 }} className="truncate">{person.name}</p>
          {person.phone && (
            <div className="flex items-center gap-1 mt-0.5">
              <Phone size={11} color={C.inkSoft} />
              <span style={{ color: C.inkSoft, fontSize: 12.5 }}>{person.phone}</span>
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <p style={{ fontFamily: "'Kalam', cursive", color: accent, fontWeight: 700, fontSize: 20, lineHeight: 1 }}>
            {fmt(person.amount)}
          </p>
          <span style={{ color: C.inkSoft, fontSize: 11 }}>so'm</span>
        </div>
      </div>
      {open && (
        <div className="px-4 pb-3 flex items-center gap-2">
          <input autoFocus inputMode="numeric" value={val}
            onChange={(e) => setVal(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Summa" style={{ ...inputStyle, padding: "8px 10px", fontSize: 14 }} />
          <button onClick={submit} className="rounded-lg px-3 py-2 shrink-0" style={{ background: accent, color: "#fff", fontWeight: 700, fontSize: 13 }}>Ayir</button>
          <button onClick={() => { setOpen(false); setVal(""); }} className="rounded-lg px-2.5 py-2 shrink-0" style={{ background: C.paperDark }}>
            <X size={15} color={C.inkSoft} />
          </button>
        </div>
      )}
      <div className="flex items-stretch" style={{ borderTop: `1px dashed ${C.line}` }}>
        <button onClick={() => setOpen((o) => !o)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5" style={{ color: accent, fontWeight: 600, fontSize: 13 }}>
          <Minus size={14} /> Ayirish
        </button>
        <div style={{ width: 1, background: C.line }} />
        <button onClick={() => onSettle(person.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5" style={{ color: C.green, fontWeight: 700, fontSize: 13 }}>
          <Check size={14} /> {settleLabel}
        </button>
      </div>
    </div>
  );
}

function AddPersonSheet({ title, accent, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!name.trim() || !amount) return;
    setSaving(true);
    await onAdd(name.trim(), phone.trim(), Number(amount));
    setSaving(false);
    onClose();
  };
  return (
    <Sheet title={title} onClose={onClose}>
      <Field label="Ism va familiya">
        <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Aziz Karimov" />
      </Field>
      <Field label="Telefon raqami">
        <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" inputMode="tel" />
      </Field>
      <Field label="Summa (so'm)">
        <input style={inputStyle} value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" inputMode="numeric" />
      </Field>
      <div className="mt-4">
        <PrimaryButton onClick={submit} color={accent} disabled={!name.trim() || !amount || saving}>
          <Plus size={17} /> {saving ? "Saqlanmoqda..." : "Qo'shish"}
        </PrimaryButton>
      </div>
    </Sheet>
  );
}

/* ---------------------------------- SCREEN: DEBTORS / DEBTS ---------------------------------- */
function PeopleScreen({ subtitle, icon: Icon, accent, accentSoft, people, reload, add, updateAmount, remove, settleLabel, emptyTitle, emptySubtitle, addLabel }) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async (name, phone, amount) => {
    const { data, error } = await add(name, phone, amount);
    if (!error) reload();
  };
  const settle = async (id) => {
    const { error } = await remove(id);
    if (!error) reload();
  };
  const subtract = async (person, n) => {
    const nextAmount = Math.max(0, person.amount - n);
    if (nextAmount === 0) {
      await remove(person.id);
    } else {
      await updateAmount(person.id, nextAmount);
    }
    reload();
  };

  const filtered = people.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const total = people.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="pt-2">
      <div className="rounded-2xl p-4 mb-4 flex items-center justify-between" style={{ background: accentSoft }}>
        <div>
          <p style={{ color: accent, fontSize: 12.5, fontWeight: 700 }}>{subtitle}</p>
          <p style={{ fontFamily: "'Kalam', cursive", color: accent, fontWeight: 700, fontSize: 26, lineHeight: 1.1 }}>
            {fmt(total)} <span style={{ fontSize: 13, fontFamily: "'Manrope', sans-serif" }}>so'm</span>
          </p>
        </div>
        <Icon size={30} color={accent} strokeWidth={1.6} />
      </div>

      {people.length > 0 && <SearchBar value={search} onChange={setSearch} placeholder="Ism bo'yicha qidirish..." />}

      {people.length === 0 ? (
        <EmptyState icon={Icon} title={emptyTitle} subtitle={emptySubtitle} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Topilmadi" subtitle="Bunday ism bilan hech kim yo'q" />
      ) : (
        filtered.map((p) => (
          <PersonCard key={p.id} person={p} accent={accent} settleLabel={settleLabel} onSettle={settle} onSubtract={subtract} />
        ))
      )}

      <div style={{ height: 70 }} />
      <FAB onClick={() => setShowAdd(true)} color={accent} />
      {showAdd && <AddPersonSheet title={addLabel} accent={accent} onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}

/* ---------------------------------- SCREEN: REMINDERS ---------------------------------- */
function RemindersScreen({ reminders, reload }) {
  const [text, setText] = useState("");
  const add = async () => {
    if (!text.trim()) return;
    const t = text.trim();
    setText("");
    const { error } = await db.addReminder(t);
    if (!error) reload();
  };
  const done = async (id) => {
    const { error } = await db.deleteReminder(id);
    if (!error) reload();
  };
  return (
    <div className="pt-2">
      <div className="rounded-2xl p-4 mb-4 flex items-center gap-2" style={{ background: C.amberSoft }}>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Eslatma yozing..." className="flex-1 bg-transparent outline-none text-sm" style={{ color: C.ink }} />
        <button onClick={add} disabled={!text.trim()} className="rounded-full flex items-center justify-center shrink-0"
          style={{ width: 34, height: 34, background: C.amber, opacity: text.trim() ? 1 : 0.5 }}>
          <Plus size={18} color="#fff" />
        </button>
      </div>
      {reminders.length === 0 ? (
        <EmptyState icon={Bell} title="Eslatmalar yo'q" subtitle="Nimanidir eslab qolish kerakmi? Yozib qo'ying." />
      ) : (
        reminders.map((r) => (
          <div key={r.id} className="rounded-2xl mb-2.5 p-4 flex items-center justify-between gap-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <p style={{ color: C.ink, fontSize: 14.5, fontWeight: 500 }} className="flex-1">{r.text}</p>
            <button onClick={() => done(r.id)} className="rounded-full flex items-center justify-center shrink-0" style={{ width: 30, height: 30, background: C.greenSoft }}>
              <Check size={16} color={C.green} strokeWidth={2.5} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------------------------------- SCREEN: INCOME ---------------------------------- */
function IncomeScreen({ incomeDays, currentDay, reload }) {
  const [date, setDate] = useState(todayISO());
  const [pname, setPname] = useState("");
  const [pcost, setPcost] = useState("");
  const [psale, setPsale] = useState("");
  const [viewingId, setViewingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const startDay = async () => {
    setBusy(true);
    await db.startCurrentDay(date);
    setBusy(false);
    reload();
  };
  const addProduct = async () => {
    if (!pname.trim() || !psale) return;
    setBusy(true);
    const next = [...currentDay.products, { id: crypto.randomUUID(), name: pname.trim(), cost: Number(pcost) || 0, sale: Number(psale) || 0 }];
    await db.updateCurrentDayProducts(next);
    setPname(""); setPcost(""); setPsale("");
    setBusy(false);
    reload();
  };
  const removeProduct = async (id) => {
    setBusy(true);
    await db.updateCurrentDayProducts(currentDay.products.filter((p) => p.id !== id));
    setBusy(false);
    reload();
  };
  const finalizeDay = async () => {
    setBusy(true);
    await db.finalizeIncomeDay(currentDay.date, currentDay.products);
    setBusy(false);
    reload();
  };

  const monthlyTotal = incomeDays.reduce((s, d) => s + Number(d.daromad), 0);
  const monthlyFoyda = incomeDays.reduce((s, d) => s + Number(d.foyda), 0);

  if (viewingId) {
    const day = incomeDays.find((d) => d.id === viewingId);
    if (!day) { setViewingId(null); return null; }
    return (
      <div className="pt-2">
        <button onClick={() => setViewingId(null)} className="flex items-center gap-1 mb-3" style={{ color: C.indigo, fontWeight: 600, fontSize: 13.5 }}>
          <ArrowLeft size={16} /> Ortga
        </button>
        <p style={{ color: C.ink, fontWeight: 800, fontSize: 17 }} className="mb-3">{fmtDate(day.date)}</p>
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="rounded-xl p-3" style={{ background: C.indigoSoft }}>
            <p style={{ color: C.indigo, fontSize: 11, fontWeight: 700 }}>DAROMAD</p>
            <p style={{ fontFamily: "'Kalam', cursive", color: C.indigo, fontWeight: 700, fontSize: 19 }}>{fmt(day.daromad)}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: C.greenSoft }}>
            <p style={{ color: C.green, fontSize: 11, fontWeight: 700 }}>FOYDA</p>
            <p style={{ fontFamily: "'Kalam', cursive", color: C.green, fontWeight: 700, fontSize: 19 }}>{fmt(day.foyda)}</p>
          </div>
        </div>
        <p style={{ color: C.inkSoft, fontSize: 12, fontWeight: 700 }} className="mb-2">SOTILGAN MAHSULOTLAR</p>
        {day.products.map((p) => (
          <div key={p.id} className="rounded-xl mb-2 p-3 flex items-center justify-between" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div>
              <p style={{ color: C.ink, fontWeight: 600, fontSize: 14 }}>{p.name}</p>
              <p style={{ color: C.inkSoft, fontSize: 11.5 }}>tan narx: {fmt(p.cost)} so'm</p>
            </div>
            <p style={{ fontFamily: "'Kalam', cursive", color: C.indigo, fontWeight: 700, fontSize: 16 }}>{fmt(p.sale)}</p>
          </div>
        ))}
      </div>
    );
  }

  if (currentDay) {
    const daySale = currentDay.products.reduce((s, p) => s + p.sale, 0);
    return (
      <div className="pt-2">
        <div className="rounded-2xl p-4 mb-4" style={{ background: C.indigoSoft }}>
          <div className="flex items-center justify-between mb-1">
            <p style={{ color: C.indigo, fontSize: 12.5, fontWeight: 700 }}>BUGUNGI KUN</p>
            <p style={{ color: C.indigo, fontSize: 12.5, fontWeight: 700 }}>{fmtDate(currentDay.date)}</p>
          </div>
          <p style={{ fontFamily: "'Kalam', cursive", color: C.indigo, fontWeight: 700, fontSize: 24 }}>
            {fmt(daySale)} <span style={{ fontSize: 12, fontFamily: "'Manrope', sans-serif" }}>so'm</span>
          </p>
        </div>

        <div className="rounded-2xl p-4 mb-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <p style={{ color: C.ink, fontWeight: 700, fontSize: 14 }} className="mb-3 flex items-center gap-1.5">
            <Package size={15} color={C.indigo} /> Mahsulot qo'shish
          </p>
          <Field label="Mahsulot nomi">
            <input style={inputStyle} value={pname} onChange={(e) => setPname(e.target.value)} placeholder="Masalan: Non" />
          </Field>
          <div className="flex gap-2">
            <Field label="Asl narxi">
              <input style={inputStyle} inputMode="numeric" value={pcost} onChange={(e) => setPcost(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" />
            </Field>
            <Field label="Sotgan narxi">
              <input style={inputStyle} inputMode="numeric" value={psale} onChange={(e) => setPsale(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" />
            </Field>
          </div>
          <PrimaryButton onClick={addProduct} color={C.indigo} disabled={!pname.trim() || !psale || busy}>
            <Plus size={16} /> Qo'shish
          </PrimaryButton>
        </div>

        {currentDay.products.length > 0 && (
          <div className="mb-4">
            <p style={{ color: C.inkSoft, fontSize: 12, fontWeight: 700 }} className="mb-2">BUGUN QO'SHILGANLAR</p>
            {currentDay.products.map((p) => (
              <div key={p.id} className="rounded-xl mb-2 p-3 flex items-center justify-between" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <div>
                  <p style={{ color: C.ink, fontWeight: 600, fontSize: 14 }}>{p.name}</p>
                  <p style={{ color: C.inkSoft, fontSize: 11.5 }}>tan narx: {fmt(p.cost)} so'm</p>
                </div>
                <div className="flex items-center gap-2">
                  <p style={{ fontFamily: "'Kalam', cursive", color: C.indigo, fontWeight: 700, fontSize: 16 }}>{fmt(p.sale)}</p>
                  <button onClick={() => removeProduct(p.id)}><Trash2 size={15} color={C.rust} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <PrimaryButton onClick={finalizeDay} color={C.rust} disabled={currentDay.products.length === 0 || busy}>
          <ClipboardList size={17} /> Kunni yakunlash
        </PrimaryButton>
        <div style={{ height: 30 }} />
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="rounded-2xl p-4 mb-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <p style={{ color: C.ink, fontWeight: 700, fontSize: 14.5 }} className="mb-3 flex items-center gap-1.5">
          <Calendar size={16} color={C.indigo} /> Kunni boshlash
        </p>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} className="mb-3" />
        <PrimaryButton onClick={startDay} color={C.indigo} disabled={busy}>
          <Plus size={16} /> Boshlash
        </PrimaryButton>
      </div>

      <div className="rounded-2xl p-4 mb-4 flex items-center justify-between" style={{ background: C.indigoSoft }}>
        <div>
          <p style={{ color: C.indigo, fontSize: 12.5, fontWeight: 700 }}>OYLIK DAROMAD</p>
          <p style={{ fontFamily: "'Kalam', cursive", color: C.indigo, fontWeight: 700, fontSize: 22 }}>{fmt(monthlyTotal)} so'm</p>
          <p style={{ color: C.indigo, fontSize: 12, fontWeight: 600, opacity: 0.75 }}>Foyda: {fmt(monthlyFoyda)} so'm</p>
        </div>
        <TrendingUp size={28} color={C.indigo} strokeWidth={1.6} />
      </div>

      {incomeDays.length === 0 ? (
        <EmptyState icon={TrendingUp} title="Hali kunlar yo'q" subtitle="Birinchi kuningizni boshlang va yakunlang" />
      ) : (
        <>
          <p style={{ color: C.inkSoft, fontSize: 12, fontWeight: 700 }} className="mb-2">KUNLAR TARIXI</p>
          {incomeDays.map((d) => (
            <button key={d.id} onClick={() => setViewingId(d.id)} className="w-full rounded-xl mb-2 p-3.5 flex items-center justify-between" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="text-left">
                <p style={{ color: C.ink, fontWeight: 700, fontSize: 14 }}>{fmtDate(d.date)}</p>
                <p style={{ color: C.inkSoft, fontSize: 11.5 }}>{d.products.length} ta mahsulot • foyda {fmt(d.foyda)}</p>
              </div>
              <div className="flex items-center gap-2">
                <p style={{ fontFamily: "'Kalam', cursive", color: C.indigo, fontWeight: 700, fontSize: 17 }}>{fmt(d.daromad)}</p>
                <ChevronRight size={16} color={C.inkSoft} />
              </div>
            </button>
          ))}
        </>
      )}
      <div style={{ height: 20 }} />
    </div>
  );
}

/* ---------------------------------- NAV ---------------------------------- */
const TABS = [
  { id: "debtors", label: "Qarzdorlar", icon: Users, color: C.green },
  { id: "debts", label: "Mening qarzim", icon: Wallet, color: C.rust },
  { id: "reminders", label: "Eslatma", icon: Bell, color: C.amber },
  { id: "income", label: "Daromad", icon: TrendingUp, color: C.indigo },
];

function BottomNav({ active, setActive }) {
  return (
    <div className="w-full max-w-sm mx-auto fixed bottom-0 left-0 right-0 flex" style={{ background: C.card, borderTop: `1px solid ${C.line}` }}>
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => setActive(t.id)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5">
            <Icon size={20} color={isActive ? t.color : C.inkSoft} strokeWidth={isActive ? 2.3 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? t.color : C.inkSoft }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------- APP ---------------------------------- */
export default function App() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState("debtors");

  const [debtors, setDebtors] = useState([]);
  const [debts, setDebts] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [incomeDays, setIncomeDays] = useState([]);
  const [currentDay, setCurrentDay] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadAll = async () => {
    const [d1, d2, d3, d4, d5] = await Promise.all([
      db.getDebtors(), db.getDebts(), db.getReminders(), db.getIncomeDays(), db.getCurrentDay(),
    ]);
    setDebtors(d1.data || []);
    setDebts(d2.data || []);
    setReminders(d3.data || []);
    setIncomeDays(d4.data || []);
    setCurrentDay(d5.data || null);
    setReady(true);
  };

  useEffect(() => {
    if (session) loadAll();
  }, [session]);

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.paper }}>
        <p style={{ fontFamily: "'Kalam', cursive", color: C.ink, fontSize: 20 }}>Yuklanmoqda...</p>
      </div>
    );
  }
  if (!session) return <AuthScreen />;

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.paper }}>
        <p style={{ fontFamily: "'Kalam', cursive", color: C.ink, fontSize: 20 }}>Daftar yuklanmoqda...</p>
      </div>
    );
  }

  const activeTab = TABS.find((t) => t.id === active);

  return (
    <div className="min-h-screen" style={{ background: C.paper, fontFamily: "'Manrope', sans-serif" }}>
      <div className="max-w-sm mx-auto relative" style={{ minHeight: "100vh", background: C.paper }}>
        <div style={{ background: C.card, borderBottom: `1px solid ${C.line}` }}>
          <TopBinding />
          <div className="px-5 pb-4 pt-1 flex items-start justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span style={{ fontFamily: "'Kalam', cursive", fontWeight: 700, fontSize: 26, color: C.ink }}>Daftar</span>
                <span style={{ fontFamily: "'Kalam', cursive", fontWeight: 700, fontSize: 26, color: activeTab.color }}>.uz</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <activeTab.icon size={13} color={activeTab.color} />
                <span style={{ color: C.inkSoft, fontSize: 12.5, fontWeight: 600 }}>{activeTab.label}</span>
              </div>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5" style={{ background: C.paperDark }}>
              <LogOut size={13} color={C.inkSoft} />
              <span style={{ color: C.inkSoft, fontSize: 11.5, fontWeight: 600 }}>Chiqish</span>
            </button>
          </div>
        </div>

        <div className="px-4 pb-28" style={{ minHeight: "60vh" }}>
          {active === "debtors" && (
            <PeopleScreen
              subtitle="SIZGA QARZ" icon={Users} accent={C.green} accentSoft={C.greenSoft}
              people={debtors} reload={loadAll}
              add={db.addDebtor} updateAmount={db.updateDebtorAmount} remove={db.deleteDebtor}
              settleLabel="Berildi" emptyTitle="Qarzdorlar yo'q" emptySubtitle="Sizdan qarz olgan odamni qo'shing" addLabel="Qarzdor qo'shish"
            />
          )}
          {active === "debts" && (
            <PeopleScreen
              subtitle="SIZNING QARZINGIZ" icon={Wallet} accent={C.rust} accentSoft={C.rustSoft}
              people={debts} reload={loadAll}
              add={db.addDebt} updateAmount={db.updateDebtAmount} remove={db.deleteDebt}
              settleLabel="Berdim" emptyTitle="Qarzingiz yo'q" emptySubtitle="Kimdandir qarz olgan bo'lsangiz, shu yerga qo'shing" addLabel="Qarz qo'shish"
            />
          )}
          {active === "reminders" && <RemindersScreen reminders={reminders} reload={loadAll} />}
          {active === "income" && <IncomeScreen incomeDays={incomeDays} currentDay={currentDay} reload={loadAll} />}
        </div>

        <BottomNav active={active} setActive={setActive} />
      </div>
    </div>
  );
}
