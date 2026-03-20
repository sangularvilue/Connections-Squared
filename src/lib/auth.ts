import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),
    // Simple credentials provider for development
    Credentials({
      name: 'Guest',
      credentials: {
        name: { label: 'Display Name', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.name) return null;
        return {
          id: `guest-${(credentials.name as string).toLowerCase().replace(/\s/g, '-')}`,
          name: credentials.name as string,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
