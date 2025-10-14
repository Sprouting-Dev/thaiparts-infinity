import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function sendContactEmail(data: EmailData) {
  try {
    // ส่ง email ไปยัง admin
    const adminEmail = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: [process.env.ADMIN_EMAIL!],
      subject: `ข้อความใหม่จาก Contact Form - ${data.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Contact Details</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
          </div>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Message</h3>
            <p style="white-space: pre-wrap;">${data.message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This email was sent from the Thai Parts Infinity contact form.
            </p>
          </div>
        </div>
      `,
    });

    // ส่ง confirmation email กลับไปยัง user
    const userEmail = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: [data.email],
      subject: 'Thank you for contacting Thai Parts Infinity',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank you for contacting us!</h2>
          
          <p>Dear ${data.name},</p>
          
          <p>We have received your message and will get back to you within 24-48 hours.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Your Message Summary</h3>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 4px;">${data.message}</p>
          </div>
          
          <p>If you have any urgent inquiries, please call us at <strong>+66 2 123 4567</strong>.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              Thai Parts Infinity Team
            </p>
          </div>
        </div>
      `,
    });

    return {
      success: true,
      adminEmailId: adminEmail.data?.id,
      userEmailId: userEmail.data?.id,
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email. Please try again later.');
  }
}
