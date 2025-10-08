import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::faq.faq', ({ strapi }) => ({
  async find(ctx) {
    try {
      const { query } = ctx;
      
      // ค้นหา FAQ ที่ active
      const faqs = await strapi.entityService.findMany('api::faq.faq', {
        filters: { 
          isActive: true,
          ...query.filters
        },
        sort: query.sort || { priority: 'desc', createdAt: 'desc' }
      });

      return faqs;
    } catch (error) {
      return ctx.badRequest('Failed to load FAQs', { error: error.message });
    }
  },

  async search(ctx) {
    try {
      const { keyword } = ctx.query;
      
      if (!keyword) {
        return ctx.badRequest('Keyword is required');
      }

      const faqs = await strapi.entityService.findMany('api::faq.faq', {
        filters: { 
          isActive: true,
          $or: [
            { question: { $containsi: keyword } },
            { answer: { $containsi: keyword } },
            { keywords: { $containsi: keyword } }
          ]
        },
        sort: { priority: 'desc' }
      });

      return faqs;
    } catch (error) {
      return ctx.badRequest('Failed to search FAQs', { error: error.message });
    }
  }
}));
