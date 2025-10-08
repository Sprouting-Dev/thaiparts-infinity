module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 10000), // Render uses PORT env var
  url: env('PUBLIC_URL'), // public URL (https) so Strapi knows external protocol
  proxy: true, // trust proxy (Render terminates TLS)
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});