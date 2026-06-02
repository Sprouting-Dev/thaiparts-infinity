/**
 * Cloudflare Pages Function — แทนที่ Next.js API route `/api/send-email`
 * เมื่อเว็บเป็น static export แล้ว API route ของ Next ใช้ไม่ได้ จึงย้ายฟอร์มติดต่อมาที่นี่
 *
 * Path: functions/api/send-email.ts  →  ให้บริการที่ POST /api/send-email
 * (ฟอร์ม src/components/forms/ContactForm.tsx ยิงมาที่ /api/send-email เหมือนเดิม ไม่ต้องแก้)
 *
 * ENV ที่ต้องตั้งใน Cloudflare Pages → Settings → Environment variables:
 *   - RESEND_API_KEY
 *   - RESEND_FROM_EMAIL
 *   - ADMIN_EMAIL
 */

interface Env {
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  ADMIN_EMAIL: string;
}

interface ContactBody {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

async function sendViaResend(
  env: Env,
  payload: { from: string; to: string[]; subject: string; html: string }
) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend API error ${res.status}: ${detail}`);
  }
  return (await res.json()) as { id?: string };
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || !env.ADMIN_EMAIL) {
      return json({ error: 'Email service is not configured' }, 500);
    }

    const body = (await request.json()) as ContactBody;
    const name = body.name?.trim() || '';
    const email = body.email?.trim() || '';
    const message = body.message?.trim() || '';
    const phone = body.phone?.trim() || '';
    const subject = (body.subject || 'Contact Form Inquiry').trim();

    if (!name || !email || !message) {
      return json({ error: 'Missing required fields' }, 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ error: 'Invalid email format' }, 400);
    }

    // อีเมลแจ้ง admin
    const adminEmail = await sendViaResend(env, {
      from: env.RESEND_FROM_EMAIL,
      to: [env.ADMIN_EMAIL],
      subject: `[ผู้ติดต่อรายใหม่] ${name}${subject ? ` — ${subject}` : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Contact Details</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          </div>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Message</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This email was sent from the Thai Parts Infinity contact form.
            </p>
          </div>
        </div>
      `,
    });

    // อีเมลตอบกลับลูกค้า
    const userEmail = await sendViaResend(env, {
      from: env.RESEND_FROM_EMAIL,
      to: [email],
      subject: 'Thank you for contacting Thai Parts Infinity',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank you for contacting us!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you within 24-48 hours.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Your Message Summary</h3>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 4px;">${message}</p>
          </div>
          <p>If you have any urgent inquiries, please call us at <strong>(+66)92-424-2144</strong>.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              Thai Parts Infinity Team
            </p>
          </div>
        </div>
      `,
    });

    return json({
      success: true,
      message: 'Email sent successfully',
      data: { adminEmailId: adminEmail.id, userEmailId: userEmail.id },
    });
  } catch (err) {
    return json(
      {
        error: 'Internal server error',
        message: 'Failed to send email. Please try again later.',
        detail: err instanceof Error ? err.message : String(err),
      },
      500
    );
  }
};

// หมายเหตุ: เมื่อมีเฉพาะ onRequestPost, Cloudflare Pages จะคืน 405 ให้เองสำหรับ method อื่น
