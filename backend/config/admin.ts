export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    sessions: {
      maxRefreshTokenLifespan: env.int('ADMIN_AUTH_MAX_REFRESH_TOKEN_LIFESPAN', 30 * 24 * 60 * 60 * 1000), // 30 days in ms
      maxSessionLifespan: env.int('ADMIN_AUTH_MAX_SESSION_LIFESPAN', 7 * 24 * 60 * 60 * 1000), // 7 days in ms
    },
    // Cookie settings for admin sessions. Use ADMIN_COOKIE_DOMAIN to explicitly set the
    // cookie domain (recommended). COOKIE_SECURE should be true in production (HTTPS).
    cookie: {
      sameSite: env('ADMIN_COOKIE_SAMESITE', 'lax'),
      path: env('ADMIN_COOKIE_PATH', '/admin'),
      domain: env('ADMIN_COOKIE_DOMAIN', ''),
      secure: env.bool('ADMIN_COOKIE_SECURE', process.env.NODE_ENV === 'production'),
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
