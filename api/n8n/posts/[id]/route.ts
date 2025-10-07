import { NextRequest, NextResponse } from 'next/server';

export const config = { runtime: "edge" };

// Ajuste para o seu Railway:
const RAILWAY_BASE = "https://primary-production-e91c.up.railway.app";

// Aplica headers CORS à resposta
function withCORS(resp: Response, origin: string | null, acrh?: string | null, acrm?: string | null) {
  const h = new Headers(resp.headers);

  // Universal (sem cookies)
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Methods", acrm || "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS");
  h.set("Access-Control-Allow-Headers", acrh || "Authorization, Content-Type, Accept, Origin, Cache-Control, Pragma, Expires, X-Requested-With");
  h.set("Access-Control-Max-Age", "86400");
  // "*" em Expose nem todo browser honra; mantemos a lista também.
  h.set("Access-Control-Expose-Headers", "Content-Type,Content-Length,ETag,Location,Link,Content-Range");
  h.set("Vary", "Origin, Access-Control-Request-Method, Access-Control-Request-Headers");

  return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers: h });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const origin = req.headers.get("origin");
    const acrh = req.headers.get("access-control-request-headers");
    const acrm = req.headers.get("access-control-request-method");

    // Preflight universal
    if (req.method === "OPTIONS") {
      return withCORS(new Response(null, { status: 204 }), origin, acrh, acrm);
    }

    const id = params.id;
    const url = `${RAILWAY_BASE}/webhook/posts/${encodeURIComponent(id)}`;

    const headers: Record<string, string> = { 
      Accept: 'application/json',
      'Cache-Control': 'no-store'
    };
    
    const auth = req.headers.get('authorization');
    if (auth) headers.Authorization = auth;

    const res = await fetch(url, { 
      method: 'GET', 
      headers, 
      cache: 'no-store' 
    });
    
    const body = await res.text();

    const response = new NextResponse(body, {
      status: res.status,
      headers: { 
        'content-type': res.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'no-store'
      }
    });

    return withCORS(response, origin, acrh, acrm);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const errorResp = new NextResponse(JSON.stringify({ error: "Proxy error", message: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
    return withCORS(errorResp, req.headers.get("origin"));
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const acrh = req.headers.get("access-control-request-headers");
  const acrm = req.headers.get("access-control-request-method");
  
  return withCORS(new Response(null, { status: 204 }), origin, acrh, acrm);
}
