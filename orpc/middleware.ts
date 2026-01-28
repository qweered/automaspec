import { ORPCError, os } from '@orpc/server'

import type { Session } from '@/lib/types'

import { ORPC_ERROR_CODES } from '@/lib/constants'

export const authMiddleware = os.$context<{ session?: Session }>().middleware(async ({ context, next }) => {
    if (!context.session) {
        throw new ORPCError(ORPC_ERROR_CODES.unauthorized, { message: 'Session not found' })
    }

    return await next({
        context: { session: context.session }
    })
})

export const organizationMiddleware = os.$context<{ session?: Session }>().middleware(async ({ context, next }) => {
    if (!context.session?.session.activeOrganizationId) {
        throw new ORPCError(ORPC_ERROR_CODES.forbidden, { message: 'User has no active organization' })
    }

    return await next({
        context: { session: context.session, organizationId: context.session.session.activeOrganizationId }
    })
})
