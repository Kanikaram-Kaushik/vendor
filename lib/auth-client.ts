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
  signIn: {
    email: async () => ({ data: null, error: null }),
    phoneNumber: async () => ({ data: null, error: null })
  },
  signUp: {
    email: async () => ({ data: null, error: null })
  },
  signOut: async () => {}
}
