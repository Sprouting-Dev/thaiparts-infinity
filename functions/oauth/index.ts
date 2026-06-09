/**
 * Decap CMS — GitHub OAuth proxy (start)
 *
 * Decap (loaded at /admin) opens this endpoint in a popup to begin login:
 *   GET /oauth?provider=github&scope=repo&site_id=...
 * We redirect to GitHub's authorize page. After the user approves, GitHub
 * redirects back to /oauth/callback which exchanges the code for a token.
 *
 * ENV (Cloudflare Pages → Settings → Variables):
 *   - OAUTH_GITHUB_CLIENT_ID      (from the GitHub OAuth App)
 *   - OAUTH_GITHUB_CLIENT_SECRET  (from the GitHub OAuth App, keep secret)
 */
interface Env {
  OAUTH_GITHUB_CLIENT_ID: string;
  OAUTH_GITHUB_CLIENT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.OAUTH_GITHUB_CLIENT_ID) {
    return new Response('OAuth is not configured (missing OAUTH_GITHUB_CLIENT_ID).', {
      status: 500,
    });
  }
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/oauth/callback`;

  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', env.OAUTH_GITHUB_CLIENT_ID);
  authorize.searchParams.set('redirect_uri', redirectUri);
  authorize.searchParams.set('scope', 'repo,user');
  authorize.searchParams.set('state', crypto.randomUUID());

  return Response.redirect(authorize.toString(), 302);
};
