export const authClient = {
  $Infer: {
    Session: null as {
      user: {
        id?: string
        name?: string
        firstName?: string
        lastName?: string
        email?: string
        phoneNumber?: string
        image?: string
      } | null
    }
  },
  useSession: () => ({
    data: null as any,
    isPending: false,
    error: null,
    refetch: async () => {}
  }),
  emailOtp: {
    sendVerificationOtp: async (_opts?: any) => ({ data: null, error: null }),
    verifyEmail: async (_opts?: any) => ({ data: null, error: null })
  },
  phoneNumber: {
    sendOtp: async (_opts?: any) => ({ data: null, error: null }),
    verify: async (_opts?: any) => ({ data: null, error: null })
  },
  updateUser: async (_opts?: any) => ({ data: null, error: null }),
  signIn: {
    email: async (_opts?: any) => ({ data: null, error: null }),
    emailOtp: async (_opts?: any) => ({ data: null, error: null }),
    phoneNumber: async (_opts?: any) => ({ data: null, error: null })
  },
  signUp: {
    email: async (_opts?: any) => ({ data: null, error: null })
  },
  signOut: async () => {}
}
