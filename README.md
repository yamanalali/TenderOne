# TenderOne — منصة المناقصات الذكية

منصة SaaS عربية متعددة الشركات لتحليل المناقصات وتجهيز ملفاتها باحترافية، ومساعدة الشركات على:

- تصفح المناقصات وتصنيفها وتصفية حالتها
- تحليل دفاتر الشروط (PDF) بشكل مستقل مع Checklist
- إنشاء ملف تعريف الشركة بعدة قوالب ولغات
- شراء نماذج احترافية جاهزة
- الدفع عبر تحويل بنكي ثم تفعيل الخدمة بعد موافقة الإدارة

كل خدمة مستقلة في الاستخدام والصلاحيات (`entitlements`).

## التقنية

- Next.js (App Router) + TypeScript + Tailwind
- PostgreSQL عبر Neon / Vercel Postgres + Drizzle ORM
- Vercel Blob للرفع المباشر للملفات الكبيرة
- OpenAI Responses API لتحليل PDF
- استضافة مستهدفة: **Vercel**

## التشغيل المحلي

1. انسخ البيئة:

```bash
cp .env.example .env.local
```

2. عبّئ القيم:

- `DATABASE_URL`
- `AUTH_SECRET`
- `BLOB_READ_WRITE_TOKEN` (اختياري محلياً)
- `OPENAI_API_KEY` (اختياري؛ بدونها يعمل تحليل تجريبي)
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`

3. ثبّت الاعتماديات وطبّق المخطط:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

4. حساب المدير الافتراضي (من `.env`):

- البريد: `admin@tender-platform.local`
- كلمة المرور: `Admin123!`

## السكربتات

- `npm run dev` — تشغيل التطوير
- `npm run build` — بناء الإنتاج
- `npm run start` — تشغيل البناء
- `npm run lint` — فحص ESLint
- `npm run test` — اختبارات الوحدة
- `npm run db:push` — مزامنة المخطط مع قاعدة البيانات
- `npm run db:studio` — Drizzle Studio
- `npm run db:seed` — بيانات أولية (مدير + تصنيفات + منتجات)

## النشر على Vercel

1. ارفع المشروع إلى GitHub/GitLab.
2. أنشئ مشروع Vercel واربط المستودع.
3. أضف Neon/Vercel Postgres و Vercel Blob.
4. عيّن متغيرات البيئة من `.env.example`.
5. بعد أول نشر نفّذ:

```bash
npm run db:push
npm run db:seed
```

أو اربط أمر migrate في Pipeline الخاص بك.

## ملاحظات مهمة عن Vercel

- رفع الملفات يتم عبر **Client Uploads** إلى Vercel Blob لتجاوز حد 4.5MB على Functions.
- تحليل PDF يعمل عبر pipeline غير متزامن (`after`) مع `maxDuration` مرتفع لمسار المعالجة.
- بدون `OPENAI_API_KEY` يتم إرجاع استخراج تجريبي لتسهيل التجربة المحلية.
- النتائج المستخرجة مساعدة وتتطلب مراجعة بشرية قبل الاعتماد.

## هيكل الخدمات

- `/tenders` المناقصات
- `/analyses` تحليل دفتر الشروط
- `/company-profile` ملف الشركة
- `/templates` مكتبة النماذج
- `/payments` الدفع اليدوي
- `/admin` لوحة مدير النظام
