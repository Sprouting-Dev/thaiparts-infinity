'use strict';

// Configure the upload plugin to use the Supabase provider when SUPABASE_* envs are present.
module.exports = ({ env }) => ({
  // ...other plugin configs
  upload: {
    enabled: true,
    config: {
      provider: 'strapi-provider-upload-supabase',
      providerOptions: {
        url: env('SUPABASE_URL'),
        apiKey: env('SUPABASE_SERVICE_ROLE_KEY'), // Use the service role key on server side only
        bucket: env('SUPABASE_BUCKET', 'uploads'),
        public: true,
      },
    },
  },
});
