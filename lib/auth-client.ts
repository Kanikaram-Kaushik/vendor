export const authClient = {
  $Infer: {
    Session: null as { user: { firstName?: string; lastName?: string; email?: string } | null }
  },
  signIn: {
    email: async () => ({ data: null, error: null }),
    phoneNumber: async () => ({ data: null, error: null })
  },
  signUp: {
    email: async () => ({ data: null, error: null })
  },
  signOut: async () => {}
}
