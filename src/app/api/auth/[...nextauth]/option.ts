import API_URL from '@/lib/api';
import type { NextAuthConfig } from 'next-auth';

import CredentialsProvider from 'next-auth/providers/credentials';

export const nextAuthOptions: NextAuthConfig = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const res = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" }
                });
                const user = await res.json();

                if (res.ok && user) {
                    return { ...user, username: credentials?.username };
                }
                return null;
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }) {
            return { ...token, ...user };
        },
        async session({ session, token }) {
            session.user = {
                ...session.user, // Keep existing properties in session.user
                id: (token.id || '') as string,
                username: token.username as string | undefined,
                email: (token.email || '') as string,
                name: (token.name || '') as string,
                image: (token.image || '') as string,
                emailVerified: (token.emailVerified || null) as Date | null,
            };
            return session;
        }
    },
    pages: {
        signIn: '/login',
    }
};
