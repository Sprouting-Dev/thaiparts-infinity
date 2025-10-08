import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::faq.faq', ({ strapi }) => ({
  async searchFAQs(keyword: string) {
    return await strapi.entityService.findMany('api::faq.faq', {
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
  },

  async getActiveFAQs() {
    return await strapi.entityService.findMany('api::faq.faq', {
      filters: { isActive: true },
      sort: { priority: 'desc', createdAt: 'desc' }
    });
  },

  async getFAQsByCategory(category: string) {
    return await strapi.entityService.findMany('api::faq.faq', {
      filters: { 
        isActive: true,
        category 
      },
      sort: { priority: 'desc' }
    });
  }
}));
