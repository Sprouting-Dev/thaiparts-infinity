export default {
  routes: [
    {
      method: 'POST',
      path: '/line/webhook',
      handler: 'line-webhook.webhook',
      config: {
        policies: [],
        middlewares: [],
      },
    }
  ],
};
