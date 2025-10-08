export default {
  routes: [
    {
      method: 'POST',
      path: '/chat-sessions',
      handler: 'chat-session.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/chat-sessions/:sessionId',
      handler: 'chat-session.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/chat-sessions/:sessionId',
      handler: 'chat-session.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/chat-sessions',
      handler: 'chat-session.find',
      config: {
        policies: [],
        middlewares: [],
      },
    }
  ],
};
