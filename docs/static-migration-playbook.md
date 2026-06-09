# Playbook: ย้ายเว็บ Next.js (SSR + CMS + DB + server) → Static + Git-CMS (ฟรีบน Cloudflare Pages)

> **เอกสารนี้คืออะไร:** บันทึก "วิธีที่เราทำจริง" ตอนย้ายเว็บ **Thai Parts Infinity** จากสถาปัตยกรรมที่มี
> server/database (มีบิล + ล่มได้) ให้กลายเป็น **เว็บ static 100%** ที่โฮสต์ฟรี แต่ลูกค้ายังแก้เนื้อหาเองได้
> เขียนแบบ generalize เพื่อให้ Agent อื่นเอาไป **ทำซ้ำกับเว็บลูกค้าเจ้าอื่น** ที่หน้าตาสถาปัตยกรรมคล้ายกันได้
>
> **กลุ่มเป้าหมายของเอกสาร:** AI agent / dev ที่จะลงมือทำ — มีทั้งหลักการ, ลำดับขั้น, และโค้ด/ไฟล์ตัวอย่างจริง

---

## 0. สรุปผลลัพธ์ (ทำไมต้องย้าย)

| ก่อน (Before) | หลัง (After) |
|---|---|
| Next.js 15 App Router แบบ **SSR** (`force-dynamic`) | Next.js 15 **static export** (`output: 'export'`) |
| CMS = **Strapi** (รันบน server) | CMS = **Decap CMS** (Git-based, ไม่มี server) |
| Database/Storage = **Supabase** | เนื้อหา = ไฟล์ JSON ใน repo / รูป = `public/uploads` (หรือ storage ชั่วคราว) |
| โฮสต์บน **DigitalOcean droplet** ($/เดือน) | โฮสต์บน **Cloudflare Pages** (ฟรี) |
| ฟอร์มติดต่อ = Next API route `/api/send-email` | ฟอร์มติดต่อ = **Cloudflare Pages Function** (path เดิม) |
| **มีบิล → ค้างจ่าย → เว็บล่ม / DB โดน pause** | **ไม่มี server, ไม่มี DB → ไม่มีบิลให้ล่ม** เหลือจ่ายแค่โดเมน |

**หัวใจของการย้าย:** ย้าย "เนื้อหา" ออกจาก runtime database ไปอยู่ใน **Git repo** แล้วทำให้ทุกหน้า
ถูก pre-render เป็น HTML ตอน build → คนเข้าเว็บโหลดไฟล์นิ่งล้วน ไม่มี backend ให้ดับ ส่วนการแก้เนื้อหา
ของลูกค้าเปลี่ยนไปใช้ Git-CMS ที่ commit ลง repo แล้ว trigger build ใหม่อัตโนมัติ

---

## 1. สถาปัตยกรรมเป้าหมาย

```
ลูกค้าแก้เนื้อหา
   │  (เปิดหน้า /admin — Decap CMS, login ด้วย GitHub OAuth)
   ▼
commit ลง GitHub repo  ──(push webhook)──►  Cloudflare Pages build
   │                                              │  npm run build → next export → out/
   │                                              ▼
   │                                   เว็บ static บน Cloudflare CDN (ฟรี, ไม่ล่ม)
   │                                              ▲
ผู้เข้าชม ─────────── โหลด HTML/CSS/JS/รูป นิ่งๆ ──┘
ฟอร์มติดต่อ ──► POST /api/send-email ──► Cloudflare Pages Function ──► Resend (อีเมล)
```

- **เนื้อหา + รูป** อยู่ใน git repo (ไม่ใช่ Strapi/DB อีกต่อไป)
- **ผู้เข้าชม** ได้ไฟล์ static ล้วน → ไม่มี backend ให้ดับ
- **ลูกค้าแก้เอง** ผ่าน `/admin` (login ผ่าน GitHub OAuth — ไม่ต้องรู้จัก Git)
- **ฟอร์ม / dynamic เล็กๆ น้อยๆ** ใช้ serverless function ของ Cloudflare (ฟรี)

---

## 2. การตัดสินใจหลัก (Decisions) + เหตุผล

| หัวข้อ | เลือก | เหตุผล |
|---|---|---|
| Git-CMS | **Decap CMS** | ฟรี opensource, ไม่จำกัดผู้ใช้, commit เป็นไฟล์ลง repo ตรงๆ |
| โฮสต์ | **Cloudflare Pages** | ฟรี, CDN เร็ว, มี Pages Functions (serverless) ในตัว, custom domain ฟรี |
| ฟอร์มติดต่อ | **Cloudflare Pages Function** + Resend | คงผู้ให้บริการอีเมลเดิม (Resend) ไว้, ฟรี, ไม่ต้องมี server |
| เก็บรูป | **commit ลง repo** (`public/uploads`) | ง่ายสุด, ไม่มี dependency ภายนอก; ถ้า repo ใหญ่มากค่อยย้าย Cloudflare R2 |
| Image optimization | `images.unoptimized: true` | static export ไม่มี image server; บีบอัดรูปตอนเตรียมแทน |
| Login ของลูกค้า | **GitHub OAuth** ผ่าน Pages Functions เอง | ลูกค้าเป็น collaborator ของ repo; ไม่ต้องพึ่ง OAuth proxy ของบุคคลที่สาม |

---

## 3. Content Model — ออกแบบให้ลูกค้าแก้ได้ "เท่าเดิม"

หลักการ: ดูว่าเดิม CMS (Strapi) มี collection/field อะไรบ้าง แล้วจำลองให้ครบใน Git-CMS
โดยเก็บเป็น **ไฟล์ JSON หนึ่งไฟล์ต่อหนึ่งรายการ** ในโฟลเดอร์ `content/<collection>/`
(รูปแบบที่ Decap "folder collection" สร้างให้พอดี)

```
content/
├── products/        # folder collection — 1 ไฟล์ = 1 สินค้า (เช่น bearing-roller.json)
├── articles/        # folder collection — 1 ไฟล์ = 1 บทความ
├── pages/           # หน้าเนื้อหา (about-us, contact-us …)
└── settings/        # singleton — layout.json (logo/footer/ติดต่อ/social), about.json
public/uploads/      # รูปที่อัปผ่าน CMS จะ commit มาที่นี่
```

**เคล็ดสำคัญ:** ให้ JSON ที่ export ออกมา **มี shape เดียวกับที่ REST API เดิม (Strapi) เคยคืน**
จะได้แก้โค้ดฝั่ง render น้อยที่สุด ตัวอย่างไฟล์สินค้าจริง:

```json
{
  "title": "Bearing & Roller",
  "slug": "bearing-roller",
  "main_title": "ตลับลูกปืน …",
  "tag": "Mechanical & Power Transmission Systems",
  "description": "<p>…HTML…</p>",
  "image": "https://…/storage/…/Bearing&Roller.png",
  "order": 1
}
```

---

## 4. รายการสิ่งที่ต้องแก้ (server-dependent → static-friendly)

นี่คือ checklist หลักของงานวิศวกรรม — ไล่แก้ทีละข้อ:

| # | ปัญหา (จุดที่ผูกกับ server) | วิธีแก้ |
|---|---|---|
| 1 | `export const dynamic = 'force-dynamic'` (มักอยู่ใน `layout.tsx`) | **เอาออก** — เปลี่ยนเป็นอ่านข้อมูลตอน build |
| 2 | ดึงข้อมูลจาก CMS/DB ตอน runtime (`src/lib/strapi.ts`, `cms.ts`) | เปลี่ยนเป็น **อ่านไฟล์ใน `content/` ตอน build** (build-time loader) |
| 3 | route `[slug]` ไม่มี `generateStaticParams()` | เพิ่ม `generateStaticParams()` + `export const dynamicParams = false` เพื่อ pre-render ทุกหน้า |
| 4 | pagination แบบ client fetch ไป API | build ไฟล์ JSON รวม (`public/data/*.json`) ไว้ก่อน แล้ว paginate ฝั่ง client |
| 5 | API route `/api/send-email` (Resend) | ย้ายไป **Cloudflare Pages Function** `functions/api/send-email.ts` (path เดิม) |
| 6 | keepalive / health endpoint ที่คุย DB | ลบทิ้ง (หรือดู §7 เรื่องรูปบน storage) |
| 7 | `next/image` optimization (ต้องมี server) | `images: { unoptimized: true }` + บีบอัดรูปตอนเตรียม |
| 8 | Google Fonts ผ่าน `next/font` (fetch ตอน build/runtime) | **self-host ฟอนต์** (เช่น `@fontsource/<font>`) ลง repo |
| 9 | `next.config` มี `remotePatterns` ของ CMS/DB | เปลี่ยนเป็น `output: 'export'`, เอา remote patterns ออก |

### โค้ดจริงที่ใช้ (อ้างอิงได้)

**`next.config.ts`** — แค่ 2 บรรทัดหลัก:
```ts
const nextConfig: NextConfig = {
  output: 'export',            // static export → โฟลเดอร์ out/
  images: { unoptimized: true }, // ไม่มี image server ใน static
};
```

**`src/lib/content.ts`** — build-time loader (อ่าน JSON จาก `content/`, มี cache):
```ts
const CONTENT_DIR = path.join(process.cwd(), 'content');
// readContent('settings/layout.json')  → object เดียว
// readContentDir('products')           → array ของทุกไฟล์ .json ในโฟลเดอร์
```
> ทั้งสองฟังก์ชันถูกเรียกใน Server Component / `generateStaticParams` ตอน build เท่านั้น

**`src/app/products/[slug]/page.tsx`** — pre-render ทุก slug:
```ts
export const dynamicParams = false;          // slug นอกลิสต์ = 404 (ไม่ต้องมี server)
export function generateStaticParams() {
  return readContentDir('products').map((p) => ({ slug: p.slug }));
}
```

**`scripts/build-products-json.mjs`** + `"prebuild"` ใน package.json — รวมไฟล์ย่อยเป็น
`public/data/products.json` ให้หน้า list ฝั่ง client โหลดทีเดียวแล้ว paginate เอง:
```json
// package.json
"scripts": { "prebuild": "node scripts/build-products-json.mjs", "build": "next build" }
```
> `prebuild` รันอัตโนมัติก่อน `build` เสมอ — ทำให้ข้อมูล client-side sync กับ `content/` ทุกครั้ง

---

## 5. ฟอร์มติดต่อ → Cloudflare Pages Function

static export ทำให้ Next API route ใช้ไม่ได้ ย้าย logic ไป `functions/` (Cloudflare detect อัตโนมัติ):

```
functions/
└── api/
    └── send-email.ts   →  ให้บริการที่ POST /api/send-email  (path เดิม → ฟอร์มไม่ต้องแก้)
```
- ไฟล์ export `onRequestPost` (Pages Functions API), เรียก Resend ผ่าน `fetch`
- ENV ที่ตั้งบน Cloudflare: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`
- **เคล็ด:** คง path `/api/send-email` ไว้เป๊ะ ฝั่ง frontend (`ContactForm.tsx`) จะได้ไม่ต้องแตะเลย

---

## 6. Decap CMS — ให้ลูกค้าแก้เนื้อหาเองที่ `/admin`

### 6.1 ไฟล์ที่ต้องมี
```
public/admin/
├── index.html      # โหลดสคริปต์ Decap CMS
└── config.yml      # นิยาม backend + collections (field ต้องตรงกับ content/)
functions/oauth/
├── index.ts        # เริ่ม GitHub OAuth (redirect ไป github authorize)
└── callback.ts     # แลก code → access token
```

### 6.2 `config.yml` ส่วนสำคัญ
```yaml
backend:
  name: github
  repo: <org>/<repo>
  branch: main
  base_url: https://<your-domain>      # โดเมนเว็บนี้ (OAuth proxy รันที่นี่เอง)
  auth_endpoint: oauth

media_folder: "public/uploads"   # ที่เก็บรูปจริงใน repo
public_folder: "/uploads"        # path ที่เว็บใช้อ้างรูป

collections:
  - name: products
    folder: "content/products"
    extension: "json"
    format: "json"        # ⚠️ ต้องระบุทั้ง extension และ format ให้เป็น json
    create: true
    slug: "{{slug}}"
    fields: [ … ตรงกับ field ใน content model … ]
```
> **บทเรียน:** ถ้า field ใน `config.yml` ไม่ตรงกับ key ใน JSON จริง การ save จะเขียนทับข้อมูลเพี้ยน —
> ออกแบบ collection ให้ map 1:1 กับ content model ใน §3

### 6.3 GitHub OAuth (ทำเอง ไม่พึ่ง proxy ภายนอก)
1. สร้าง **GitHub OAuth App** (Settings → Developer settings → OAuth Apps)
   - Authorization callback URL → `https://<your-domain>/oauth/callback`
2. ใส่ ENV บน Cloudflare Pages: `OAUTH_GITHUB_CLIENT_ID`, `OAUTH_GITHUB_CLIENT_SECRET`
3. `functions/oauth/index.ts` redirect ไป `github.com/login/oauth/authorize` (scope `repo,user`)
   → `callback.ts` แลก token แล้ว `postMessage` กลับให้ Decb popup
4. เพิ่มลูกค้าเป็น **collaborator** ของ repo → ลูกค้า login ด้วยบัญชี GitHub ตัวเองแก้เนื้อหาได้
> ข้อดี: ไม่ต้อง deploy Worker proxy แยก — Pages Functions ในเว็บนี้ทำหน้าที่ OAuth proxy ในตัว

---

## 7. รูปภาพ: กลยุทธ์แบบทยอย (interim → ถาวร)

ตอนเริ่มเรายัง **ปล่อยให้รูปโหลดจาก storage เดิม (Supabase)** ก่อน เพื่อให้เว็บกลับมาออนไลน์เร็ว
แล้วค่อยทยอยย้ายรูปลง repo:

- **ระยะ interim:** URL รูปใน JSON ยังชี้ไป Supabase storage (public URL) → เว็บใช้งานได้ทันที
  - ความเสี่ยง: Supabase free plan **auto-pause หลังไม่มี activity ~7 วัน** → รูปหาย
  - แก้ด้วย **GitHub Action keepalive** ยิง REST request ตรงไป Supabase ทุก 3 วัน (กัน pause):
    ```yaml
    # .github/workflows/supabase-keepalive.yml
    on:
      schedule: [{ cron: "0 3 */3 * *" }]   # ทุก 3 วัน
    # curl ไป $SUPABASE_URL/rest/v1/<table>?select=id&limit=1 ด้วย anon key
    ```
- **ระยะถาวร (แนะนำให้จบ):** ดาวน์โหลดรูปทั้งหมดลง `public/uploads/` → แก้ URL ใน `content/*.json`
  จาก `https://…supabase…/…` เป็น `/uploads/…` → **ลบ Supabase + ลบ workflow keepalive** ได้เลย
  → ตัด dependency ภายนอกตัวสุดท้ายออก เหลือแค่ repo + Cloudflare จริงๆ

> **บทเรียน:** การปล่อยรูปไว้บน storage เดิมชั่วคราวช่วยให้ "กู้เว็บกลับมาออนไลน์" ได้โดยไม่ต้องรอย้ายรูปครบ —
> แต่ต้องมี keepalive กันลืม และต้องมีแผนปิดให้ขาดภายหลัง ไม่งั้นยังเหลือจุดที่ล่มได้

---

## 8. Deploy บน Cloudflare Pages

1. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git** → เลือก repo
2. ตั้งค่า build:
   | ช่อง | ค่า |
   |---|---|
   | Production branch | `main` |
   | Framework preset | **None** (อย่าเลือก Next.js SSR) |
   | Build command | `npm run build` |
   | Build output directory | `out` |
3. **Environment variables** (ตั้งทั้ง Production และ Preview):
   | ชื่อ | ใช้ทำอะไร |
   |---|---|
   | `NODE_VERSION` = `20` | ล็อก Node version (มี `.nvmrc` ด้วย) |
   | `NEXT_PUBLIC_METADATA_BASE` | canonical/OG URL ตอน build |
   | `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `ADMIN_EMAIL` | ฟอร์มติดต่อ |
   | `OAUTH_GITHUB_CLIENT_ID` / `OAUTH_GITHUB_CLIENT_SECRET` | Decap login |
4. Save & Deploy → ได้ URL ชั่วคราว `https://<project>.pages.dev` → **ทดสอบบน URL นี้ก่อน**
5. ทดสอบครบ: ทุกหน้า + กดเข้า detail page + ส่งฟอร์ม (เช็กอีเมลเข้า) + รูปขึ้นครบ + login `/admin`
6. **Custom domain:** Pages → Custom domains → ใส่โดเมน → รอ SSL → เว็บออนไลน์บนโดเมนจริง

> **gotcha:** ถ้า build ล้มเพราะ `--turbopack` ให้เปลี่ยน build command เป็น `next build` เฉยๆ

---

## 9. ลำดับเฟส (ทำโดยไม่ทำเว็บจริงล่มระหว่างทาง)

> ทำบน branch แยก + deploy ขึ้น `.pages.dev` (URL ชั่วคราว) จนกว่าจะพร้อมค่อยสับโดเมน

| Phase | ทำอะไร |
|---|---|
| **0 — กู้เว็บ** | ถ้าเว็บเดิมล่มอยู่ จ่ายบิล/เปิด server ให้กลับมาก่อน (จะได้ export ข้อมูลได้) |
| **1 — Export เนื้อหา** | ดึงข้อมูล + รูปทั้งหมดจาก CMS/DB เดิม → แปลงเป็นไฟล์ใน `content/` (+ รูป) |
| **2 — Refactor การอ่าน** | เปลี่ยน `src/lib` ให้อ่านไฟล์ตอน build + เพิ่ม `generateStaticParams()` ทุก `[slug]` |
| **3 — Static build** | `output: 'export'`, แก้ image/fonts, ลบ keepalive เดิม, ย้ายฟอร์ม → `next build` ผ่านเป็น static |
| **4 — Decap CMS** | เพิ่ม `/admin` + config collections + GitHub OAuth (Pages Functions) |
| **5 — Cloudflare Pages** | ต่อ repo → build → URL ชั่วคราว → ทดสอบลูกค้าแก้เนื้อหา + ฟอร์ม |
| **6 — Cutover** | ชี้โดเมนมา Cloudflare → **ปิด server + DB เดิม** → เหลือจ่ายแค่โดเมน |
| **7 — ส่งมอบ** | โอน repo ให้บัญชีลูกค้า + คู่มือแก้เนื้อหา (Thai, step-by-step) |

**ข้อควรระวัง:** อย่าปิด server/DB เดิมจนกว่า Phase 6 จะเสร็จและทดสอบครบ — โดยเฉพาะถ้ารูปยังโหลดจาก storage เดิม (§7)

---

## 10. Checklist สำหรับเอาไปทำเว็บลูกค้าเจ้าใหม่

ก่อนเริ่ม สำรวจเว็บเดิมให้ครบ แล้วไล่ติ๊ก:

- [ ] เว็บเดิมเป็น **Next.js App Router** ไหม? (ถ้าใช่ playbook นี้ตรงเป๊ะ; ถ้าเป็น framework อื่นปรับ §4)
- [ ] หา runtime data fetch ทั้งหมด (`force-dynamic`, fetch ไป CMS/DB) → ลิสต์ออกมาให้ครบ
- [ ] map **content model เดิม → folder collections ของ Decap** (§3) ให้ field ครบทุกอัน
- [ ] export ข้อมูลจริงจาก CMS/DB → `content/*.json` (shape ตรงกับที่โค้ด render คาดหวัง)
- [ ] เพิ่ม `generateStaticParams()` + `dynamicParams = false` ให้ทุก dynamic route
- [ ] `output: 'export'` + `images.unoptimized` + self-host fonts + เอา remotePatterns ออก
- [ ] ย้าย API routes ทุกตัว → `functions/` (Cloudflare Pages Functions)
- [ ] ตั้ง Decap `/admin` + `config.yml` + GitHub OAuth (`functions/oauth/*`)
- [ ] วางแผนรูป: interim บน storage เดิม (+keepalive) หรือย้ายเข้า `public/uploads` เลย
- [ ] Cloudflare Pages: Framework **None**, output `out`, ตั้ง ENV ครบ
- [ ] ทดสอบบน `.pages.dev` ครบทุกหน้า/ฟอร์ม/login → ค่อยสับโดเมน
- [ ] ปิด server + DB เดิม → เหลือจ่ายแค่โดเมน → ส่งมอบ repo + คู่มือ

---

## 11. สิ่งที่ "ต้องปรับต่อเว็บ" (ไม่เหมือนกันทุกเจ้า)

- **Content model** — แต่ละเว็บมี collection/field ต่างกัน → ออกแบบ `content/` + `config.yml` ใหม่ทุกครั้ง
- **ENV** — คีย์อีเมล/OAuth/โดเมน เป็นของแต่ละลูกค้า
- **ผู้ให้บริการอีเมล** — เราใช้ Resend; เจ้าอื่นอาจใช้ตัวอื่น (ปรับใน `functions/api/send-email.ts`)
- **storage รูปเดิม** — Supabase/Strapi/S3 ฯลฯ ต่างกัน → ขั้น export/ย้ายรูปปรับตามจริง
- **framework** — ถ้าไม่ใช่ Next.js (เช่น Nuxt/Astro/CRA) หลักการ §1–3, §5–10 ใช้ได้เหมือนกัน
  แต่รายละเอียด §4 (`generateStaticParams`, `output: export`) ต้องแปลงเป็นของ framework นั้น

---

## 12. ไฟล์อ้างอิงในโปรเจกต์นี้ (ของจริง ใช้เป็นตัวอย่างได้)

| ไฟล์ | คืออะไร |
|---|---|
| `next.config.ts` | static export config |
| `src/lib/content.ts` | build-time content loader |
| `src/app/*/[slug]/page.tsx` | ตัวอย่าง `generateStaticParams()` |
| `scripts/build-products-json.mjs` + `package.json` (`prebuild`) | สร้าง JSON รวมสำหรับ client pagination |
| `functions/api/send-email.ts` | ฟอร์มติดต่อ (Pages Function) |
| `functions/oauth/{index,callback}.ts` | GitHub OAuth proxy ในตัว |
| `public/admin/config.yml` | นิยาม Decap collections |
| `content/{products,articles,pages,settings}/` | content model จริง |
| `.github/workflows/supabase-keepalive.yml` | keepalive รูปบน storage เดิม (interim) |
| `docs/static-migration-plan.md` | แผนต้นฉบับ (รายละเอียด decision เพิ่มเติม) |
| `docs/deploy-cloudflare.md` | runbook deploy แบบละเอียด |
| `docs/คู่มือแก้ไขเนื้อหา-ลูกค้า.md` | คู่มือลูกค้า (ตัวอย่างเอกสารส่งมอบ) |
