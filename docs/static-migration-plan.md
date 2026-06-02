# แผนย้ายเว็บเป็น Static + Git-CMS (Thai Parts Infinity)

> เป้าหมาย: เปลี่ยนเว็บจาก **Next.js (SSR) + Strapi + Supabase + droplet** ให้เป็น
> **เว็บ static** ที่ลูกค้ายังแก้เนื้อหาเองได้ผ่าน **Git-based CMS** และโฮสต์ฟรีบน **Cloudflare Pages**
>
> ผลลัพธ์: **ไม่ต้องมี server, ไม่ต้องมี database** → ไม่มีบิลให้ค้าง (เหมือนเคส DigitalOcean ถูกระงับ),
> ไม่มี Supabase pause, ไม่มี Strapi ล่ม — เหลือค่าใช้จ่ายแค่ **โดเมน** และส่งมอบลูกค้าได้ง่าย

---

## 1. สถาปัตยกรรมเป้าหมาย

```
ลูกค้าแก้เนื้อหา → หน้า /admin (Decap CMS) → commit ลง GitHub
                                                      │ (push trigger)
                                                      ▼
                                        Cloudflare Pages build (next build → static)
                                                      │
                                                      ▼
                                   เว็บ static บน Cloudflare CDN (ฟรี, ไม่ล่ม, ไม่ pause)
```

- **เนื้อหา + รูป** อยู่ใน 깃 repo (ไม่ใช่ Strapi/Supabase อีกต่อไป)
- **คนเข้าชมเว็บ** โหลดไฟล์ static ล้วน → ไม่มี backend ให้ดับ
- **ลูกค้าแก้เอง** ผ่านหน้า admin (login ด้วย email ผ่าน GitHub OAuth — ไม่ต้องรู้จัก Git)

---

## 2. การตัดสินใจ

### ยืนยันแล้ว ✅
| หัวข้อ | สรุป |
|---|---|
| Git-CMS | **Decap CMS** — ฟรี opensource ไม่จำกัดผู้ใช้ |
| ฟอร์มติดต่อ | **Cloudflare Pages Function** (คง Resend ไว้, ฟรี) |
| เก็บรูป | commit ลง repo (เพียงพอ + บีบอัดแล้ว) |
| Image optimization | `images.unoptimized` + บีบอัดตอน build |

### รอยืนยัน ⏳ — โฮสต์ + วิธี login ของลูกค้า (สำคัญ)
ข้อจำกัดจริง: "ลูกค้า login ด้วย email โดยไม่ต้องมีบัญชี GitHub" ทำได้ผ่าน **Netlify Identity + Git Gateway** เท่านั้น (ฟีเจอร์ของ Netlify) — บน Cloudflare Pages ทำแบบนั้นไม่ได้

| ตัวเลือก | ลูกค้า login ยังไง | หมายเหตุ |
|---|---|---|
| **A) Netlify + Identity + Git Gateway** (แนะนำ) | **email/password — ไม่ต้องมีบัญชี GitHub** | ตรงกับที่อยากได้ที่สุด, ฟรีพอสำหรับเว็บโชว์ (100GB/เดือน) |
| B) Cloudflare Pages + GitHub OAuth | ต้องมี **บัญชี GitHub** (เป็น collaborator) | bandwidth ไม่จำกัด แต่ลูกค้าต้องมี GitHub |

> **Default ที่จะใช้: A) Netlify** เพื่อให้ลูกค้า login ง่ายแบบ email ไม่ต้องรู้จัก GitHub (ถ้าน๊อฟฟี่อยากได้ Cloudflare แทน บอกได้)

---

## 3. โครงสร้างเนื้อหา (Content Model) ที่ Git-CMS ต้องมี

ออกแบบให้ลูกค้าแก้ได้ "เท่าเดิม" กับที่แก้ใน Strapi ตอนนี้

### Collections (เนื้อหาหลายรายการ)
- **Products** — name, slug, image, thumbnail, description, specifications, category, tag, price, inStock, main_title
- **Articles** — title, slug, publishedAt, image, content (rich text), subtitle, read_time
- **Services** — title, slug, subtitle, content, image, cover_image, highlights, features, process_steps, faqs, details, technology, customer_receive, safety_and_standard
- **Pages** — slug (about-us / contact-us), quote, hero_image, button_1, button_2, isShowButton, seo

### Singletons (รายการเดียว)
- **Layout** — logo/image, prefooter_image, banner, address (โทร 1/2, email, map_url, ชื่อบริษัท), social_media, navbar CTAs
- **Home** — บล็อกเลือก products/services/articles ที่โชว์หน้าแรก + title/description
- **About** — about, vision, mission, Team (image+desc), Warehouse (image+desc), Standards (รูปหลายไฟล์)

> รูปแบบเก็บ: แต่ละ collection = ไฟล์ Markdown/JSON ในโฟลเดอร์ `content/<collection>/` + รูปใน `public/uploads/`

---

## 4. สิ่งที่ต้องแก้ (server-dependent → static-friendly)

| # | ปัญหา (ไฟล์) | วิธีแก้ |
|---|---|---|
| 1 | `dynamic = 'force-dynamic'` ใน `src/app/layout.tsx` | เอาออก, อ่านข้อมูลตอน build แทน |
| 2 | ดึงข้อมูลจาก Strapi runtime (`src/lib/strapi.ts`, `src/lib/cms.ts`) | อ่านจากไฟล์เนื้อหาใน repo ตอน build |
| 3 | `[slug]` ไม่มี `generateStaticParams()` (products/articles/services) | เพิ่ม `generateStaticParams()` ให้ pre-render ทุกหน้า |
| 4 | pagination แบบ client fetch | โหลด JSON ที่ build ไว้แล้ว paginate ฝั่ง client |
| 5 | `/api/send-email` (Resend) | ย้ายไป **Cloudflare Pages Function** (หรือ Formspree) |
| 6 | `/api/ops/keepalive` | **ลบทิ้ง** (ไม่มี Supabase แล้ว ไม่ต้อง keepalive) |
| 7 | `next/image` optimization (ต้องมี server) | ตั้ง `images.unoptimized: true` + บีบอัดรูปตอน build |
| 8 | Google Fonts (Kanit) ผ่าน `next/font` ตอน runtime | self-host ฟอนต์ Kanit ลง repo |
| 9 | `next.config.ts` remotePatterns (Strapi/Supabase) | เปลี่ยนเป็น `output: 'export'`, ลบ remote patterns |

---

## 5. ขั้นตอนทำแบบทยอย (ไม่กระทบเว็บจริงระหว่างทำ)

> ทำบน branch แยก + deploy ขึ้น Cloudflare Pages เป็น URL ชั่วคราว จนกว่าจะพร้อมค่อยสับโดเมน

- **Phase 0 — กู้เว็บปัจจุบัน:** จ่ายบิล DigitalOcean $30.48 → เว็บกลับมา (ทำวันนี้)
- **Phase 1 — ดึงเนื้อหาออกจาก Strapi:** export ข้อมูล + รูปทั้งหมดจาก Strapi → แปลงเป็นไฟล์ใน `content/` + `public/uploads/`
- **Phase 2 — refactor การอ่านข้อมูล:** เปลี่ยน `src/lib` ให้อ่านจากไฟล์ในเครื่อง (build-time) + เพิ่ม `generateStaticParams()`
- **Phase 3 — static build:** ตั้ง `output: 'export'`, แก้ image/fonts, ลบ keepalive, ย้ายฟอร์มติดต่อ → `next build` ผ่านเป็น static
- **Phase 4 — ติดตั้ง Decap CMS:** เพิ่ม `/admin` + config collections ตามข้อ 3 + ต่อ GitHub OAuth (ลูกค้า login ด้วย email)
- **Phase 5 — Cloudflare Pages:** ต่อ repo → build → ได้ URL ชั่วคราว → ทดสอบลูกค้าแก้เนื้อหา + ฟอร์ม
- **Phase 6 — Cutover:** ชี้โดเมนมา Cloudflare Pages → ปิด droplet + Supabase → เหลือจ่ายแค่โดเมน
- **Phase 7 — ส่งมอบ:** โอน repo ให้บัญชีลูกค้า + คู่มือการแก้เนื้อหา

---

## 6. ความเสี่ยง / ข้อควรระวัง
- **อย่าปิด droplet/Supabase** จนกว่า Phase 6 จะเสร็จและทดสอบครบ
- รูปจำนวนมากในอนาคต: ถ้า repo ใหญ่เกินไปค่อยย้ายไป Cloudflare R2 (ยังฟรี)
- ฟอร์มติดต่อ: ต้องทดสอบส่งอีเมลจริงหลังย้าย
- ลูกค้าต้องเรียนหน้า admin ใหม่เล็กน้อย → เตรียมคู่มือสั้นๆ ตอนส่งมอบ

---

## 7. ผลลัพธ์หลังย้ายเสร็จ
- ✅ ไม่มี server (droplet) — ไม่มีบิลให้ค้าง, เว็บล่มแบบเคสนี้เกิดไม่ได้
- ✅ ไม่มี database (Supabase) — ไม่มี pause
- ✅ ฟรีถาวรบน Cloudflare Pages — เหลือจ่ายแค่โดเมน
- ✅ ลูกค้าแก้เนื้อหา/รูปเองได้ผ่านหน้า admin (ไม่ต้องรู้ Git)
- ✅ ส่งมอบง่าย: โอน repo + free hosting ให้ลูกค้าตอนหมดสัญญา
