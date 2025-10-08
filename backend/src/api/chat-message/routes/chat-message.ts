export default {
  routes: [
    {
      method: 'POST',
      path: '/chat-messages',
      handler: 'chat-message.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/chat-messages/session/:sessionId',
      handler: 'chat-message.findBySession',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/chat-messages',
      handler: 'chat-message.find',
      config: {
        policies: [],
        middlewares: [],
      },
    }
  ],
};
