import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::chat-message.chat-message', ({ strapi }) => ({
  async create(ctx) {
    try {
      const { sessionId, content, platform, lineUserId, webSessionId } = ctx.request.body;

      if (!sessionId || !content || !platform) {
        return ctx.badRequest('Missing required fields: sessionId, content, platform');
      }

      // เก็บข้อความผู้ใช้
      const userMessage = await strapi.entityService.create('api::chat-message.chat-message', {
        data: {
          session: sessionId,
          sender: 'user',
          content,
          platform,
          lineUserId,
          webSessionId,
          timestamp: new Date()
        }
      });

      // อัพเดท lastMessageAt ใน session
      await strapi.entityService.update('api::chat-session.chat-session', sessionId, {
        data: { lastMessageAt: new Date() }
      });

      // ประมวลผลและสร้างคำตอบ
      const botResponse = await this.generateBotResponse(content);

      // เก็บคำตอบจาก Bot
      const botMessage = await strapi.entityService.create('api::chat-message.chat-message', {
        data: {
          session: sessionId,
          sender: 'bot',
          content: botResponse,
          platform,
          messageType: 'auto-reply',
          timestamp: new Date()
        }
      });

      return { 
        content: botResponse,
        messageId: botMessage.id,
        timestamp: botMessage.timestamp
      };
    } catch (error) {
      return ctx.badRequest('Failed to send message', { error: error.message });
    }
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
        'ขอบคุณสำหรับข้อความครับ! ทีมงานจะตอบกลับให้เร็วที่สุด',
        'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ?',
        'ขอบคุณที่ติดต่อมา เราจะช่วยเหลือคุณครับ',
        'ยินดีต้อนรับครับ! มีคำถามอะไรไหมครับ?'
      ];

      return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    } catch (error) {
      console.error('Error generating bot response:', error);
      return 'ขออภัยครับ ระบบมีปัญหาเล็กน้อย กรุณาลองใหม่อีกครั้ง';
    }
  },

  async findBySession(ctx) {
    try {
      const { sessionId } = ctx.params;
      
      const messages = await strapi.entityService.findMany('api::chat-message.chat-message', {
        filters: { session: sessionId },
        sort: { timestamp: 'asc' }
      });

      return messages;
    } catch (error) {
      return ctx.badRequest('Failed to load messages', { error: error.message });
    }
  }
}));
