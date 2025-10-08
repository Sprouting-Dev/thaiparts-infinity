import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::chat-session.chat-session', ({ strapi }) => ({
  async create(ctx) {
    try {
      // สร้าง Session ID ที่ unique
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // สร้าง Session ใหม่
      const session = await strapi.entityService.create('api::chat-session.chat-session', {
        data: {
          sessionId,
          status: 'active',
          platform: 'web',
          userAgent: ctx.request.headers['user-agent'] || '',
          ipAddress: ctx.request.ip || '',
          startedAt: new Date(),
          lastMessageAt: new Date()
        }
      });

      return { sessionId: session.sessionId };
    } catch (error) {
      return ctx.badRequest('Failed to create session', { error: error.message });
    }
  },

  async findOne(ctx) {
    try {
      const { sessionId } = ctx.params;
      
      const session = await strapi.entityService.findMany('api::chat-session.chat-session', {
        filters: { sessionId },
        populate: {
          messages: {
            sort: { timestamp: 'asc' }
          }
        }
      });

      if (!session || session.length === 0) {
        return ctx.notFound('Session not found');
      }

      return {
        sessionId: session[0].sessionId,
        messages: session[0].messages || [],
        status: session[0].status,
        platform: session[0].platform
      };
    } catch (error) {
      return ctx.badRequest('Failed to load session', { error: error.message });
    }
  },

  async update(ctx) {
    try {
      const { sessionId } = ctx.params;
      const { status } = ctx.request.body;

      const session = await strapi.entityService.findMany('api::chat-session.chat-session', {
        filters: { sessionId }
      });

      if (!session || session.length === 0) {
        return ctx.notFound('Session not found');
      }

      const updateData: any = {};
      if (status === 'closed') {
        updateData.status = 'closed';
        updateData.endedAt = new Date();
      }

      await strapi.entityService.update('api::chat-session.chat-session', session[0].id, {
        data: updateData
      });

      return { success: true };
    } catch (error) {
      return ctx.badRequest('Failed to update session', { error: error.message });
    }
  }
}));
