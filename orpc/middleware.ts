import { ORPCError, os } from '@orpc/server'

import type { Session } from '@/lib/types'

export const authMiddleware = os.$context<{ session?: Session }>().middleware(async ({ context, next }) => {
    if (!context.session) {
        throw new ORPCError('Session not found')
    }

    return await next({
        context: { session: context.session }
    })
})

export const organizationMiddleware = os.$context<{ session?: Session }>().middleware(async ({ context, next }) => {
    if (!context.session?.session.activeOrganizationId) {
        throw new ORPCError('User has no active organization')
    }

    return await next({
        context: { session: context.session, organizationId: context.session.session.activeOrganizationId }
    })
})
