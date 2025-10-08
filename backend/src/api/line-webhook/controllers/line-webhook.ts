import { Client, WebhookEvent, MessageEvent, TextEventMessage } from '@line/bot-sdk';

// Initialize Line Bot Client
const lineClient = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
});

export default {
  async webhook(ctx) {
    try {
      const { events } = ctx.request.body;
      
      for (const event of events) {
        if (event.type === 'message' && event.message.type === 'text') {
          await this.handleTextMessage(event as MessageEvent<TextEventMessage>);
        }
      }
      
      ctx.body = 'OK';
    } catch (error) {
      console.error('Line webhook error:', error);
      ctx.status = 500;
      ctx.body = 'Internal Server Error';
    }
  },

  async handleTextMessage(event: MessageEvent<TextEventMessage>) {
    const { replyToken, source, message } = event;
    const userId = source.userId;
    const userMessage = message.text;

    try {
      // 1. หา Session ที่มีอยู่หรือสร้างใหม่
      let session = await this.findOrCreateSession(userId, 'line');

      // 2. เก็บข้อความผู้ใช้
      await strapi.entityService.create('api::chat-message.chat-message', {
        data: {
          session: session.id,
          sender: 'user',
          content: userMessage,
          platform: 'line',
          lineUserId: userId,
          timestamp: new Date()
        }
      });

      // 3. ประมวลผลและสร้างคำตอบ
      const botResponse = await this.generateBotResponse(userMessage);

      // 4. ตอบกลับไปยัง Line
      await lineClient.replyMessage(replyToken, {
        type: 'text',
        text: botResponse
      });

      // 5. เก็บคำตอบจาก Bot
      await strapi.entityService.create('api::chat-message.chat-message', {
        data: {
          session: session.id,
          sender: 'bot',
          content: botResponse,
          platform: 'line',
          messageType: 'auto-reply',
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Error handling text message:', error);
      
      // ส่งข้อความ error กลับไปยัง Line
      try {
        await lineClient.replyMessage(replyToken, {
          type: 'text',
          text: 'ขออภัยครับ ระบบมีปัญหาเล็กน้อย กรุณาลองใหม่อีกครั้ง'
        });
      } catch (replyError) {
        console.error('Error sending error reply:', replyError);
      }
    }
  },

  async findOrCreateSession(userId: string, platform: string) {
    // ค้นหา Session ที่มีอยู่
    const existingSessions = await strapi.entityService.findMany('api::chat-session.chat-session', {
      filters: { 
        platform,
        status: 'active'
      }
    });

    // ถ้ามี Session ที่ active อยู่ ให้ใช้ Session นั้น
    const activeSession = existingSessions.find(session => {
      // ตรวจสอบว่า Session นี้มีข้อความจาก user นี้หรือไม่
      return session.messages?.some(msg => 
        msg.lineUserId === userId && msg.sender === 'user'
      );
    });

    if (activeSession) {
      return activeSession;
    }

    // สร้าง Session ใหม่
    const sessionId = `line_${userId}_${Date.now()}`;
    const newSession = await strapi.entityService.create('api::chat-session.chat-session', {
      data: {
        sessionId,
        status: 'active',
        platform,
        startedAt: new Date(),
        lastMessageAt: new Date()
      }
    });

    return newSession;
  },

  async generateBotResponse(message: string) {
    try {
      // ค้นหาใน FAQ Database
      const faqs = await strapi.entityService.findMany('api::faq.faq', {
        filters: { 
          isActive: true,
          $or: [
            { question: { $containsi: message } },
            { keywords: { $containsi: message } }
          ]
        },
        sort: { priority: 'desc' }
      });

      if (faqs && faqs.length > 0) {
        return faqs[0].answer;
      }

      // ถ้าไม่เจอใน FAQ ให้ตอบกลับทั่วไป
      const defaultResponses = [
        'สวัสดีครับ! ยินดีต้อนรับสู่ ThaiParts มีอะไรให้ช่วยไหมครับ?',
        'ขอบคุณสำหรับข้อความครับ! ทีมงานจะตอบกลับให้เร็วที่สุด',
        'สวัสดีครับ! มีคำถามอะไรไหมครับ?',
        'ยินดีต้อนรับครับ! มีอะไรให้ช่วยเหลือไหมครับ?'
      ];

      return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    } catch (error) {
      console.error('Error generating bot response:', error);
      return 'ขออภัยครับ ระบบมีปัญหาเล็กน้อย กรุณาลองใหม่อีกครั้ง';
    }
  }
};
