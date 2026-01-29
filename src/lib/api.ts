const API_URL: string = (() => {
	// Use the environment variable if it's set, otherwise default to localhost for development.
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
	// Remove any trailing slashes to prevent double slashes in API calls.
	return apiUrl.replace(/\/+$/, "");
})();

export default API_URL;
