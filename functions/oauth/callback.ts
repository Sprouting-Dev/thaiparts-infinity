/**
 * Decap CMS — GitHub OAuth proxy (callback)
 *
 * GitHub redirects here with `?code=...`. We exchange the code for an access
 * token, then hand it back to the Decap window via the postMessage handshake
 * that Decap expects.
 */
interface Env {
  OAUTH_GITHUB_CLIENT_ID: string;
  OAUTH_GITHUB_CLIENT_SECRET: string;
}

const PROVIDER = 'github';

function page(content: string) {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"></head><body><script>${content}</script></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) {
    return new Response('Missing ?code from GitHub.', { status: 400 });
  }

  let payload: string;
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: env.OAUTH_GITHUB_CLIENT_ID,
        client_secret: env.OAUTH_GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (data.access_token) {
      payload = `authorization:${PROVIDER}:success:${JSON.stringify({
        token: data.access_token,
        provider: PROVIDER,
      })}`;
    } else {
      payload = `authorization:${PROVIDER}:error:${JSON.stringify({
        message: data.error_description || data.error || 'token exchange failed',
      })}`;
    }
  } catch (err) {
    payload = `authorization:${PROVIDER}:error:${JSON.stringify({
      message: err instanceof Error ? err.message : String(err),
    })}`;
  }

  // Decap handshake: announce, wait for the CMS window to ack, then send result.
  return page(`
    (function () {
      function send(message) {
        if (window.opener) window.opener.postMessage(message, '*');
      }
      window.addEventListener('message', function () {
        send(${JSON.stringify(payload)});
      }, false);
      send('authorizing:${PROVIDER}');
    })();
  `);
};
