module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 10000), // Render uses PORT env var
  url: env('PUBLIC_URL'), // public URL (https) so Strapi knows external protocol
  // Ensure Koa trusts the reverse proxy and uses X-Forwarded-* headers (X-Forwarded-Proto)
  // This helps Strapi know the original request protocol so it can set secure cookies.
  // Prefer the explicit koa proxy shape which is required for some deployments.
  proxy: { koa: true }, // trust proxy (Render/NGINX/Caddy terminates TLS)
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});