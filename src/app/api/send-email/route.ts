import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail, EmailData } from '@/lib/email';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, email, message } = body;
    const subject = body.subject || 'Contact Form Inquiry'; // ใช้ default subject ถ้าไม่มี

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Prepare email data
    const emailData: EmailData = {
      name: name.trim(),
      email: email.trim(),
      phone: body.phone?.trim() || '',
      subject: subject.trim(),
      message: message.trim(),
    };

    // Send emails
    const result = await sendContactEmail(emailData);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: result,
    });
  } catch (error) {
    logger.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to send email. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
