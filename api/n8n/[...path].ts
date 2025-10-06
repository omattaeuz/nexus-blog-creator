export const config = { runtime: "edge" };

// Ajuste para o seu Railway:
const RAILWAY_BASE = "https://primary-production-e91c.up.railway.app/webhook";

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

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const origin = req.headers.get("origin");
    const acrh = req.headers.get("access-control-request-headers");
    const acrm = req.headers.get("access-control-request-method");

    // caminho depois de /api/n8n
    const path = url.pathname.replace(/^\/api\/n8n/, "");
    const target = `${RAILWAY_BASE}${path}${url.search}`;

    // Preflight universal
    if (req.method === "OPTIONS") {
      return withCORS(new Response(null, { status: 204 }), origin, acrh, acrm);
    }

    // Copiar headers úteis
    const forwardHeaders = new Headers(req.headers);
    ["host", "connection", "content-length", "transfer-encoding"].forEach((k) => forwardHeaders.delete(k));

    const init: RequestInit = {
      method: req.method,
      headers: forwardHeaders,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body
    };

    const upstream = await fetch(target, init);

    const resp = new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers
    });

    return withCORS(resp, origin, acrh, acrm);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const errorResp = new Response(JSON.stringify({ error: "Proxy error", message: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
    return withCORS(errorResp, req.headers.get("origin"));
  }
}