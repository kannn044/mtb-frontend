const API_URL: string = (() => {
	const isDev = process.env.NODE_ENV === "development";
	const configured = process.env.NEXT_PUBLIC_API_URL;

	// In dev, prefer same-origin requests ("/api/..."), and let Next.js `rewrites()`
	// proxy them to `http://localhost:3001` to avoid browser CORS.
	const fallback = isDev ? "" : "/mtbcluster";
	const apiUrl = (configured || fallback).replace(/\/+$/, "");
	return apiUrl;
})();

export default API_URL;
