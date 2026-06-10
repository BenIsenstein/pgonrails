// AI: Shared types used across the app.

/** User shape returned by fetchUser in __root.tsx and available via route context. */
export type AppUser = {
  id: string
  email: string
  fullName: string
  avatarImgName: string
  avatarImgCb: string
}
