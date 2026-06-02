# Deploy — Thai Parts Infinity (Static → Cloudflare Pages)

เว็บถูกแปลงเป็น **static export** แล้ว (`next build` → โฟลเดอร์ `out/`) ไม่ต้องใช้ droplet/Strapi/รันไทม์ใดๆ
เอกสารนี้คือขั้นตอนเอาขึ้น **Cloudflare Pages** ให้เว็บกลับมาออนไลน์ (ทำในหน้าเว็บ Cloudflare ล้วนๆ ไม่ต้อง CLI)

> ของสำคัญทั้งหมดอยู่ภายนอก droplet แล้ว: เนื้อหา/รูป → Supabase, โค้ด → GitHub
> เนื้อหาที่ export แล้วอยู่ใน `content/*.json`; รูปอ้างไปที่ Supabase storage (public URL)

---

## 0) เตรียม branch
สถาปัตยกรรม static อยู่ใน PR #17 (branch `claude/static-migration-plan`)
- **แนะนำ:** merge PR #17 เข้า `main` ก่อน แล้วให้ Cloudflare build จาก `main`
- หรือจะตั้ง Cloudflare ให้ build จาก branch `claude/static-migration-plan` ก็ได้ (ตั้ง Production branch เป็น branch นั้น)

## 1) สร้าง Cloudflare Pages project (เชื่อม GitHub)
1. เข้า https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. อนุญาต Cloudflare เข้าถึง GitHub แล้วเลือก repo **`Sprouting-Dev/thaiparts-infinity`**
3. ตั้งค่า build:
   | ช่อง | ค่า |
   |---|---|
   | Production branch | `main` (หรือ `claude/static-migration-plan`) |
   | Framework preset | **None** (อย่าเลือก Next.js แบบ SSR) |
   | Build command | `npm run build` |
   | Build output directory | `out` |
4. **Environment variables** (Production *และ* Preview):
   | ชื่อ | ค่า | ใช้ทำอะไร |
   |---|---|---|
   | `NODE_VERSION` | `20` | ให้ build ใช้ Node 20 (มี `.nvmrc` ด้วยแล้ว) |
   | `NEXT_PUBLIC_METADATA_BASE` | `https://thaipartsinfinity.com` | canonical/OG URL ตอน build |
   | `RESEND_API_KEY` | *(คีย์ Resend)* | ฟอร์มติดต่อ (Pages Function) |
   | `RESEND_FROM_EMAIL` | *(อีเมลผู้ส่งที่ verify ใน Resend)* | ฟอร์มติดต่อ |
   | `ADMIN_EMAIL` | *(อีเมลผู้รับแจ้งเตือน)* | ฟอร์มติดต่อ |
5. กด **Save and Deploy** → รอ build เสร็จ จะได้ URL ชั่วคราว `https://<project>.pages.dev`

> **ฟอร์มติดต่อ:** ไฟล์ `functions/api/send-email.ts` คือ Cloudflare Pages Function — Cloudflare จะ detect โฟลเดอร์ `functions/` อัตโนมัติ ให้บริการที่ `POST /api/send-email` (ฟอร์มเดิมยิงมาที่ path นี้ ไม่ต้องแก้) ต้องตั้ง ENV 3 ตัวข้างบนให้ครบ

## 2) ทดสอบบน URL ชั่วคราว (.pages.dev)
- เปิดทุกหน้า: หน้าแรก, /products (+ กดเข้า product), /services/system-design, /articles, /about-us, /contact-us
- ทดสอบส่งฟอร์มติดต่อ → เช็กว่าอีเมลเข้า `ADMIN_EMAIL`
- เช็กรูปขึ้นครบ (โหลดจาก Supabase storage)

## 3) ชี้โดเมน thaipartsinfinity.com มา Cloudflare Pages
1. ในโปรเจกต์ Pages → **Custom domains** → **Set up a custom domain** → ใส่ `thaipartsinfinity.com` (และ `www`)
2. ทำตามที่ Cloudflare บอก:
   - ถ้าโดเมนใช้ Cloudflare เป็น DNS อยู่แล้ว → เพิ่ม record ให้อัตโนมัติ
   - ถ้า DNS อยู่ที่อื่น → เพิ่ม CNAME ตามที่ Cloudflare ระบุ (หรือย้าย nameserver มา Cloudflare)
3. รอ SSL ออก (ปกติไม่กี่นาที) → เปิด `https://thaipartsinfinity.com` ได้

→ **ถึงตรงนี้เว็บกลับมาออนไลน์โดยไม่ใช้ droplet แล้ว** ✅ ปิด/ลบ droplet ได้

## 4) (ทีหลัง) เปิดให้ลูกค้าแก้เนื้อหาเองผ่าน Decap CMS — `/admin`
> ยังไม่จำเป็นต่อการทำให้เว็บออนไลน์ ทำเป็นสเต็ปถัดไปได้
- ต้องปรับ `public/admin/config.yml` ให้ field ตรงกับโครงสร้าง `content/` (ตอนนี้ยังเป็น draft)
- ต้องตั้ง **GitHub OAuth proxy** (Cloudflare Worker) เพราะ Decap + GitHub backend ต้องมีตัวกลาง OAuth:
  1. สร้าง **GitHub OAuth App** (Settings → Developer settings → OAuth Apps), callback ชี้ไป Worker
  2. deploy Worker OAuth proxy (เช่น `https://github.com/sterlingwes/decap-proxy` หรือเทียบเท่า) ใส่ `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`
  3. เอา URL ของ Worker ไปใส่ `backend.base_url` ใน `config.yml`
  4. เพิ่มลูกค้าเป็น **collaborator** ของ repo (เพื่อ login แก้เนื้อหาได้)

## หมายเหตุ / แก้ปัญหา
- ถ้า build บน Cloudflare ล้มเพราะ `--turbopack` → เปลี่ยน Build command เป็น `next build` (ไม่มี turbopack) ชั่วคราวได้
- รูปทั้งหมดยังโหลดจาก Supabase storage (public) — ตราบใดที่ Supabase project ยังอยู่ รูปจะขึ้นปกติ ถ้าต้องการตัด Supabase ออก 100% ค่อยดาวน์โหลดรูปลง `public/uploads/` แล้วแก้ URL ในภายหลัง
