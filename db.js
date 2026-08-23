import { supabase } from "./supabaseClient";

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id;
}

/* ---------------- QARZDORLAR ---------------- */
export const getDebtors = () =>
  supabase.from("debtors").select("*").order("created_at", { ascending: false });

export const addDebtor = (name, phone, amount) =>
  supabase.from("debtors").insert({ name, phone, amount }).select().single();

export const updateDebtorAmount = (id, amount) =>
  supabase.from("debtors").update({ amount }).eq("id", id).select().single();

export const deleteDebtor = (id) => supabase.from("debtors").delete().eq("id", id);

/* ---------------- MENING QARZIM ---------------- */
export const getDebts = () =>
  supabase.from("debts").select("*").order("created_at", { ascending: false });

export const addDebt = (name, phone, amount) =>
  supabase.from("debts").insert({ name, phone, amount }).select().single();

export const updateDebtAmount = (id, amount) =>
  supabase.from("debts").update({ amount }).eq("id", id).select().single();

export const deleteDebt = (id) => supabase.from("debts").delete().eq("id", id);

/* ---------------- ESLATMALAR ---------------- */
export const getReminders = () =>
  supabase.from("reminders").select("*").order("created_at", { ascending: false });

export const addReminder = (text) =>
  supabase.from("reminders").insert({ text }).select().single();

export const deleteReminder = (id) => supabase.from("reminders").delete().eq("id", id);

/* ---------------- DAROMAD ---------------- */
export const getIncomeDays = () =>
  supabase.from("income_days").select("*").order("date", { ascending: false }).limit(31);

export const getCurrentDay = () =>
  supabase.from("income_current").select("*").maybeSingle();

export const startCurrentDay = async (date) => {
  const uid = await currentUserId();
  return supabase
    .from("income_current")
    .upsert({ user_id: uid, date, products: [] }, { onConflict: "user_id" })
    .select()
    .single();
};

export const updateCurrentDayProducts = async (products) => {
  const uid = await currentUserId();
  return supabase
    .from("income_current")
    .update({ products, updated_at: new Date().toISOString() })
    .eq("user_id", uid)
    .select()
    .single();
};

export const clearCurrentDay = async () => {
  const uid = await currentUserId();
  return supabase.from("income_current").delete().eq("user_id", uid);
};

// Kunni yakunlaydi, tarixga yozadi va oxirgi 31 kunlik oynani ushlab turadi
export const finalizeIncomeDay = async (date, products) => {
  const daromad = products.reduce((s, p) => s + Number(p.sale), 0);
  const foyda = products.reduce((s, p) => s + (Number(p.sale) - Number(p.cost)), 0);

  const { data, error } = await supabase
    .from("income_days")
    .insert({ date, products, daromad, foyda })
    .select()
    .single();
  if (error) throw error;

  await clearCurrentDay();

  const { data: all } = await supabase
    .from("income_days")
    .select("id, date")
    .order("date", { ascending: false });

  if (all && all.length > 31) {
    const excessIds = all.slice(31).map((r) => r.id);
    await supabase.from("income_days").delete().in("id", excessIds);
  }

  return data;
};
