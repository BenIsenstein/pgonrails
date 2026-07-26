// AI: Auth guard layout route. Protects all child routes under /_authed/*.
// Uses throw redirect() to send unauthenticated users to /signin with
// original-destination preserved in ?redirect search param.
// Returns narrowed user (non-null) so child routes get { user: AppUser } type.
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/signin',
        search: { redirect: location.href },
      })
    }
    // Return narrowed user — overrides context type for child routes
    return { user: context.user }
  },
})
