# Windows-da Ishga Tushirish - To'liq Qo'llanma

## 📥 1-QADAM: O'rnatish (Birinchi marta)

### A) Node.js o'rnatish
1. https://nodejs.org/ ga boring
2. **LTS** versiyasini yuklab olish (Long Term Support)
3. O'rnatish (Next, Next, Install, Finish)
4. Terminal-da tekshirish:
```bash
node --version
npm --version
```

### B) PostgreSQL o'rnatish
1. https://www.postgresql.org/download/windows/ ga boringiz
2. "PostgreSQL 15" (yoki yangi versiya) yuklab olish
3. O'rnatish:
   - Password: `12345` (yoki o'zingizning parolini)
   - Port: `5432` (default)
   - Finish

---

## 📂 2-QADAM: Proyektni sozlash

### C) Zip faylni oching
- `store.zip` ni Desktop-da yoki Documents-da oching

### D) Terminal ochish
1. Proyekta papkasiga kiring
2. Papkada sag-click → "Open in Terminal" yoki "Open PowerShell here"
3. Yoki CMD-ni ochib: `cd path/to/project`

### E) Dependencies o'rnatish
Terminal-da yozish:
```bash
npm install
```
(Kutish - 2-3 minut)

---

## 🔐 3-QADAM: Telegram Bot Token

### F) BotFather-dan token olish
1. Telegram-ni ochish
2. "@BotFather" izlash va bosish
3. "/newbot" yozish
4. Bot nomi berish: `My Store Bot`
5. Username berish: `mystorebot123` (o'zingizning nomi)
6. **Shuning so'ng TOKEN keladi** - **NUSXA OLISH!**

Masalan:
```
123456789:ABCDEfgh...
```

---

## 🔧 4-QADAM: .env faylini yaratish

### G) .env faylini yaratish
1. Proyekta root (ildiz) papkasida faylni yaratish
2. Nomi: `.env` (nuqta bilan)
3. Ichiga yozish:

```
DATABASE_URL=postgresql://postgres:12345@localhost:5432/store
TELEGRAM_BOT_TOKEN=123456789:ABCDEfgh...
VITE_API_URL=http://localhost:5173
```

**MUHIM:**
- `TELEGRAM_BOT_TOKEN` o'rniga BotFather-dan olgan tokenni yozish!
- Password `12345` o'rniga PostgreSQL o'rnatishda bergan parolni yozish (agar boshqasi bo'lsa)

---

## 🗄️ 5-QADAM: Database yaratish (1 marta)

### H) PostgreSQL-ni ishga tushirish
Windows-da PgAdmin ochish:
- Start Menu → "pgAdmin 4" izlash va bosish
- Browser-da ochildi

### I) Database yaratish
1. pgAdmin-da sag-click "Databases"
2. "Create" → "Database..."
3. Nomi: `store`
4. Create

---

## 🚀 6-QADAM: Ishga tushirish

### J) Proyektni ishga tushirish
Terminal-da:
```bash
npm run dev
```

Kutish 30 sekundga qadar.

Korinish kerak:
```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
```

---

## 📱 7-QADAM: Brauzer-da ochish

### K) Brauzer-da kirish
1. Chrome/Edge/Firefox ochish
2. Address bar-ga yozish: `http://localhost:5173`
3. Enter

**Ko'rinish kerak:**
- ✅ Do'kon (Shop)
- ✅ Admin panel (/admin)
- ✅ Kuryer app (/courier)
- ✅ Telegram bot (avtomatik ishlaydi!)

---

## ✅ TEST QILISH

### L) Hammasini test qilish

1. **Do'konni test qilish:**
   - http://localhost:5173 da mahsulot ko'rish
   - Savatga qo'shish

2. **Admin-ni test qilish:**
   - http://localhost:5173/admin ga kirish
   - Mahsulot qo'shish/tahrirlash

3. **Kuryer-ni test qilish:**
   - http://localhost:5173/courier ga kirish
   - Buyurtmalarni ko'rish

4. **Telegram Bot-ni test qilish:**
   - Telegram-da o'zingizning botni izlash (@mystorebot123)
   - Bot-ga /start yozish
   - "Do'kon", "Admin", "Kuryer" tugmalarini ko'rish

---

## 🐛 MUAMMOLAR BO'LSA

### Xatolik 1: "Cannot find module"
```bash
npm install
```

### Xatolik 2: "Port 5173 already in use"
```bash
# Terminal-ni yopib, yana ochish
npm run dev
```

### Xatolik 3: "Database connection failed"
- PostgreSQL ishlayotganmi?
- `.env` faylida DATABASE_URL to'g'rimi?
- Password to'g'rimi?

### Xatolik 4: "Bot ishlamaydi"
- `.env` faylida TELEGRAM_BOT_TOKEN to'g'rimi?
- Token to'liq nusxa olindimi?
- Terminal-da xatolik logga chiqmadimi?

---

## 💾 SAVOL: Har safar qilish kerakmi?

### ILK MARTA:
- Node.js o'rnatish (1 marta)
- PostgreSQL o'rnatish (1 marta)
- .env yaratish (1 marta)

### HOZIR VA BUNAQA:
- Terminal-da `npm run dev`
- Browser-da `http://localhost:5173`
- TUGADI! ✅

---

## 🎯 QOSH SOVLA

**Kompyuteri o'charsam bot ishlaymi?**
- Yo'q. Kompyuteri yoq bo'lsa, bot ishlamaydi.
- Bot har doim online bo'lsa - **Replit-da publish qilish** kerak.

**Dostlarni qanday qilib kiritaman?**
- Replit-da publish qiling
- URL yuborish: `myapp.replit.dev`

---

✅ **HAMMASIGA TAYYOR!** Boshlashni xohlaysizmi? 🚀
