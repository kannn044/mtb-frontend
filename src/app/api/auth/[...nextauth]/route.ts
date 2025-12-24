import NextAuth from 'next-auth';
import { nextAuthOptions } from '@/app/api/auth/[...nextauth]/option';


const { handlers } = NextAuth(nextAuthOptions);
export const { GET, POST } = handlers;
