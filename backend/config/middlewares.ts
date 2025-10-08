export default ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  // Configure CORS so that the browser can send credentials (cookies) to the backend.
  // Use PUBLIC_URL as the allowed origin in production. Adjust or add additional
  // origins (e.g. local dev) as needed.
  {
    name: 'strapi::cors',
    config: {
      origin: [env('PUBLIC_URL', 'https://thaiparts-infinity-backend.onrender.com')],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
