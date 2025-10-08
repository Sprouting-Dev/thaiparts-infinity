import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::chat-session.chat-session', ({ strapi }) => ({
  async generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  async createSession(data: any) {
    const sessionId = await this.generateSessionId();
    
    const session = await strapi.entityService.create('api::chat-session.chat-session', {
      data: {
        sessionId,
        ...data,
        startedAt: new Date(),
        lastMessageAt: new Date()
      }
    });

    return session;
  },

  async findSessionBySessionId(sessionId: string) {
    const sessions = await strapi.entityService.findMany('api::chat-session.chat-session', {
      filters: { sessionId },
      populate: {
        messages: {
          sort: { timestamp: 'asc' }
        }
      }
    });

    return sessions.length > 0 ? sessions[0] : null;
  },

  async updateSessionStatus(sessionId: string, status: string) {
    const sessions = await strapi.entityService.findMany('api::chat-session.chat-session', {
      filters: { sessionId }
    });

    if (sessions.length > 0) {
      const updateData: any = { status };
      if (status === 'closed') {
        updateData.endedAt = new Date();
      }

      return await strapi.entityService.update('api::chat-session.chat-session', sessions[0].id, {
        data: updateData
      });
    }

    return null;
  }
}));
