const DEV_BACKEND_ORIGIN = "http://localhost:3001";
const PROD_BACKEND_ORIGIN = "http://10.1.1.171:3001";

function getBackendOrigin(): string {
	return process.env.NODE_ENV === "development" ? DEV_BACKEND_ORIGIN : PROD_BACKEND_ORIGIN;
}

function buildBackendUrl(pathSegments: string[], search: string): string {
	const base = getBackendOrigin().replace(/\/+$/, "");
	const path = pathSegments.map(encodeURIComponent).join("/");
	const pathname = path.length > 0 ? `/api/upload/${path}` : "/api/upload";
	return `${base}${pathname}${search || ""}`;
}

function filterRequestHeaders(headers: Headers): Headers {
	const outgoing = new Headers(headers);
	// These headers are either hop-by-hop or should be set by fetch.
	outgoing.delete("host");
	outgoing.delete("connection");
	outgoing.delete("content-length");
	return outgoing;
}

function filterResponseHeaders(headers: Headers): Headers {
	const outgoing = new Headers(headers);
	// Hop-by-hop headers should not be forwarded.
	outgoing.delete("connection");
	outgoing.delete("transfer-encoding");
	return outgoing;
}

async function proxy(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
	const { path = [] } = await ctx.params;
	const search = new URL(request.url).search;
	const url = buildBackendUrl(path, search);

	const init: RequestInit & { duplex?: "half" } = {
		method: request.method,
		headers: filterRequestHeaders(request.headers),
		redirect: "manual",
	};

	// Stream the request body through for non-GET/HEAD.
	if (request.method !== "GET" && request.method !== "HEAD") {
		init.body = request.body;
		// Required by Node.js fetch when streaming a request body.
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
