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
  signIn: {
    email: async () => ({ data: null, error: null }),
    phoneNumber: async () => ({ data: null, error: null })
  },
  signUp: {
    email: async () => ({ data: null, error: null })
  },
  signOut: async () => {}
}
