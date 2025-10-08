import { factories } from '@strapi/strapi';
import { Client } from '@line/bot-sdk';

export default factories.createCoreService('api::line-webhook.line-webhook', ({ strapi }) => ({
  createLineClient() {
    return new Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
      channelSecret: process.env.LINE_CHANNEL_SECRET || '',
    });
  },

  async sendMessage(userId: string, message: string) {
    try {
      const client = this.createLineClient();
      return await client.pushMessage(userId, {
        type: 'text',
        text: message
      });
    } catch (error) {
      console.error('Error sending Line message:', error);
      throw error;
    }
  },

  async sendRichMessage(userId: string, richMessage: any) {
    try {
      const client = this.createLineClient();
      return await client.pushMessage(userId, richMessage);
    } catch (error) {
      console.error('Error sending rich Line message:', error);
      throw error;
    }
  },

  async broadcastMessage(message: string) {
    try {
      const client = this.createLineClient();
      return await client.broadcast({
        type: 'text',
        text: message
      });
    } catch (error) {
      console.error('Error broadcasting Line message:', error);
      throw error;
    }
  }
}));
