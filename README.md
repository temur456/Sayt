# Daftar.uz

Qarzdorlar, qarzlar, eslatmalar va kunlik daromadni yuritish uchun mobil-birinchi veb ilova. Har bir foydalanuvchi ro'yxatdan o'tadi va faqat o'zining ma'lumotlarini ko'radi (Supabase Auth + Row Level Security).

## 1. Supabase sozlash

1. https://supabase.com — bepul hisob oching, **New project** yarating.
2. Loyiha ochilgach, chap menyudan **SQL Editor** ga o'ting.
3. `supabase/schema.sql` faylidagi kodni to'liq nusxalab, **Run** tugmasini bosing.
4. **Authentication → Providers** bo'limida Email provider yoqilganini tekshiring (odatda default yoqilgan).
   - Tezroq test qilish uchun **Authentication → Providers → Email** ichida "Confirm email" ni vaqtincha o'chirib qo'yishingiz mumkin (keyin qayta yoqasiz).
5. **Project Settings → API** bo'limidan `Project URL` va `anon public` kalitni nusxalang.

## 2. Loyihani sozlash

```bash
npm install
cp .env.example .env
```

`.env` faylini oching va Supabase’dan olgan qiymatlarni joylashtiring:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Local muhitda tekshirish:

```bash
npm run dev
```

## 3. Netlify’ga chiqarish

**Variant A — GitHub orqali (tavsiya etiladi):**
1. Bu papkani GitHub’ga yuklang.
2. Netlify’da **Add new site → Import an existing project** → GitHub repo’ni tanlang.
3. Build command: `npm run build`, Publish directory: `dist` (netlify.toml bu sozlamani avtomatik oladi).
4. **Site settings → Environment variables** bo'limiga `VITE_SUPABASE_URL` va `VITE_SUPABASE_ANON_KEY` ni qo'shing.
5. Deploy qiling.

**Variant B — Netlify CLI orqali:**
```bash
npm install -g netlify-cli
netlify deploy --build --prod
```
(Environment o'zgaruvchilarni Netlify saytida yoki `netlify env:set` orqali qo'shing.)

## 4. Ishlash tamoyili

- Har bir foydalanuvchi email + parol bilan ro'yxatdan o'tadi.
- Barcha jadvallarda Row Level Security yoqilgan: `auth.uid() = user_id` — demak, boshqa foydalanuvchining ma'lumotini hech kim ko'ra olmaydi, hatto bazaga to'g'ridan-to'g'ri so'rov yuborilsa ham.
- "Daromad" bo'limida oxirgi 31 kun saqlanadi; 31-kundan keyin eng eskisi avtomatik o'chiriladi.

## 5. Play Market / App Store haqida

Bu — veb ilova (PWA sifatida ham ishlaydi: telefonda brauzerdan ochib, "Bosh ekranga qo'shish" orqali ilova kabi ishlatsa bo'ladi). Haqiqiy native ilova sifatida do'konlarga chiqarish uchun buni React Native/Expo asosida qayta qurish kerak bo'ladi — bu keyingi qadam.
