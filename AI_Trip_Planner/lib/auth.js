import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'traveler@example.com' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        isSignUp: { label: 'isSignUp', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error('Email is required')
        }

        const email = credentials.email.toLowerCase().trim()
        const isSignUp = credentials.isSignUp === 'true'

        let user = await prisma.user.findUnique({
          where: { email },
        })

        if (isSignUp) {
          if (user) {
            throw new Error('An account with this email already exists.')
          }

          const hashedPassword = credentials.password
            ? await bcrypt.hash(credentials.password, 10)
            : null

          user = await prisma.user.create({
            data: {
              email,
              name: credentials.name || email.split('@')[0],
              password: hashedPassword,
            },
          })
          return { id: user.id, email: user.email, name: user.name }
        }

        // Login flow
        if (!user) {
          // Auto-create user for demo ease if password provided
          const hashedPassword = credentials.password
            ? await bcrypt.hash(credentials.password, 10)
            : null

          user = await prisma.user.create({
            data: {
              email,
              name: credentials.name || email.split('@')[0],
              password: hashedPassword,
            },
          })
          return { id: user.id, email: user.email, name: user.name }
        }

        if (user.password && credentials.password) {
          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) {
            throw new Error('Invalid password. Please check your credentials.')
          }
        }

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'ai_travel_planner_auth_secret_key_2026',
  pages: {
    signIn: '/login',
  },
}
