import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string; // Make id optional in User interface
    username?: string; // Add username as a custom field
    emailVerified?: Date | null; // Make emailVerified optional
  }

  interface Session {
    user: User & {
      username?: string; // Add username if it's a custom field
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    email?: string;
    name?: string;
    image?: string;
    emailVerified?: Date | null;
  }
}
