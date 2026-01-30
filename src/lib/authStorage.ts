export function clearClientAuthStorage(): void {
	if (typeof window === "undefined") return;

	try {
		// User explicitly asked to clear both storages on logout.
		localStorage.clear();
	} catch {
		// ignore
	}

	try {
		sessionStorage.clear();
	} catch {
		// ignore
	}

	try {
		// Expire token cookie used for report/download auth.
		document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
	} catch {
		// ignore
	}
}
