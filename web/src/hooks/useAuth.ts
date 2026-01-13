import { useEffect, useState } from "react";

export interface User {
	id: string;
	email: string;
	createdAt: string;
}

export function useAuth() {
	const [loading, setLoading] = useState(true);
	const [authenticated, setAuthenticated] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const apiUrl = import.meta.env.VITE_API_URL;

	useEffect(() => {
		async function verifySession() {
			try {
				const res = await fetch(`${apiUrl}/users/me`, {
					credentials: "include", // important: send cookies
				});
				if (res.ok) {
					const data = await res.json();
					setUser(data); // store user data
					setAuthenticated(true); // mark authenticated
				} else {
					setUser(null);
					setAuthenticated(false);
				}
			} catch {
				setUser(null);
				setAuthenticated(false);
			} finally {
				setLoading(false);
			}
		}

		verifySession();
	}, []);

	return { loading, authenticated, user };
}
