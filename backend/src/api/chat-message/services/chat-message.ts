import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::chat-message.chat-message', ({ strapi }) => ({
  async createMessage(data: any) {
    return await strapi.entityService.create('api::chat-message.chat-message', {
      data: {
        ...data,
        timestamp: new Date()
      }
    });
  },

  async getMessagesBySession(sessionId: string) {
    return await strapi.entityService.findMany('api::chat-message.chat-message', {
      filters: { session: sessionId },
      sort: { timestamp: 'asc' }
    });
  },

  async updateLastMessageTime(sessionId: string) {
    const sessions = await strapi.entityService.findMany('api::chat-session.chat-session', {
      filters: { sessionId }
    });

    if (sessions.length > 0) {
      return await strapi.entityService.update('api::chat-session.chat-session', sessions[0].id, {
        data: { lastMessageAt: new Date() }
      });
    }
  }
}));
