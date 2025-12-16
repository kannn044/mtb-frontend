import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {-
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next"
import { nextAuthOptions } from '@/app/api/auth/[...nextauth]/option';


const handler = NextAuth(nextAuthOptions)

export { handler as GET, handler as POST }
