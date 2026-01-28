const API_URL: string = (() => {
	const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
	const isDev = !appEnv || appEnv === "development";

	const configuredUrl = isDev
		? process.env.NEXT_PUBLIC_API_URL_DEV
		: process.env.NEXT_PUBLIC_API_URL_PROD;

	const fallbackUrl = isDev ? "http://localhost:3001" : "";
	const finalUrl = configuredUrl || fallbackUrl;
	return finalUrl.replace(/\/+$/, "");
})();

export default API_URL;
