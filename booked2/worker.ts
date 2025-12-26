/**
 * Cloudflare Worker for Booky App
 * Handles API routes and SPA routing through Cloudflare's assets handling
 */

export interface Env {
  NEAR_NETWORK?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle API routes
    if (path.startsWith('/api/')) {
      return handleApiRoute(request);
    }

    // Health check endpoint
    if (path === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        network: env.NEAR_NETWORK || 'testnet'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return 404 for all other routes
    // Cloudflare's assets with not_found_handling: "single-page-application"
    // will automatically serve index.html for SPA routing
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;

/**
 * Handle API routes
 */
async function handleApiRoute(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // API endpoints
  if (path === '/api/health' && method === 'GET') {
    return new Response(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  if (path === '/api/books' && method === 'GET') {
    const accountId = url.searchParams.get('account_id');
    if (!accountId) {
      return new Response(JSON.stringify({ error: 'account_id required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    return new Response(JSON.stringify({
      books: [],
      account_id: accountId,
      total: 0
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  if (path === '/api/books' && method === 'POST') {
    try {
      const body = await request.json();
      return new Response(JSON.stringify({
        success: true,
        message: 'Book added successfully',
        book: {
          ...body,
          added_at: new Date().toISOString()
        }
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  // Unknown API route
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
