const DEV_BACKEND_ORIGIN = "http://localhost:3001";
const PROD_BACKEND_ORIGIN = "http://203.157.84.69:3001";

function getBackendOrigin(): string {
	return process.env.NODE_ENV === "development" ? DEV_BACKEND_ORIGIN : PROD_BACKEND_ORIGIN;
}

function buildBackendUrl(pathSegments: string[], search: string): string {
	const base = getBackendOrigin().replace(/\/+$/, "");
	const path = pathSegments.map(encodeURIComponent).join("/");
	const pathname = path.length > 0 ? `/api/download/${path}` : "/api/download";
	return `${base}${pathname}${search || ""}`;
}

function filterRequestHeaders(headers: Headers): Headers {
	const outgoing = new Headers(headers);
	outgoing.delete("host");
	outgoing.delete("connection");
	outgoing.delete("content-length");
	return outgoing;
}

function getCookieValue(cookieHeader: string, name: string): string | null {
	// Minimal cookie parsing (no decoding surprises).
	for (const part of cookieHeader.split(";")) {
		const trimmed = part.trim();
		if (!trimmed) continue;
		const eq = trimmed.indexOf("=");
		if (eq === -1) continue;
		const key = trimmed.slice(0, eq).trim();
		if (key !== name) continue;
		return trimmed.slice(eq + 1);
	}
	return null;
}

function filterResponseHeaders(headers: Headers): Headers {
	const outgoing = new Headers(headers);
	outgoing.delete("connection");
	outgoing.delete("transfer-encoding");
	return outgoing;
}

async function proxy(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
	const { path = [] } = await ctx.params;
	const search = new URL(request.url).search;
	const url = buildBackendUrl(path, search);

	const outgoingHeaders = filterRequestHeaders(request.headers);
	// If this request came from a plain navigation (e.g. window.open), it won't
	// include Authorization. Allow passing token via cookie and translate it.
	if (!outgoingHeaders.get("authorization")) {
		const cookie = outgoingHeaders.get("cookie") ?? "";
		const token = cookie ? getCookieValue(cookie, "token") : null;
		if (token) {
			try {
				outgoingHeaders.set("authorization", `Bearer ${decodeURIComponent(token)}`);
			} catch {
				outgoingHeaders.set("authorization", `Bearer ${token}`);
			}
		}
	}

	const init: RequestInit & { duplex?: "half" } = {
		method: request.method,
		headers: outgoingHeaders,
		redirect: "manual",
	};

	if (request.method !== "GET" && request.method !== "HEAD") {
		init.body = request.body;
		init.duplex = "half";
	}

	const upstream = await fetch(url, init);
	return new Response(upstream.body, {
		status: upstream.status,
		statusText: upstream.statusText,
		headers: filterResponseHeaders(upstream.headers),
	});
}

export async function POST(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
	return proxy(request, ctx);
}

export async function PUT(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
	return proxy(request, ctx);
}

export async function PATCH(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
	return proxy(request, ctx);
}

export async function DELETE(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
	return proxy(request, ctx);
}

export async function GET(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
	return proxy(request, ctx);
}

export async function OPTIONS(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
	return proxy(request, ctx);
}
