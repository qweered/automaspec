import { implement, ORPCError } from '@orpc/server'
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { user, member, organization } from '@/db/schema/auth'
import { accountContract } from '@/orpc/contracts/account'
import { authMiddleware, organizationMiddleware } from '@/orpc/middleware'

const os = implement(accountContract).use(authMiddleware).use(organizationMiddleware)

const exportAccount = os.account.export.handler(async ({ input, context }) => {
    const { userId } = input
    if (userId !== context.session.user.id) {
        throw new ORPCError('Access denied')
    }

    const userData = await db
        .select({ id: user.id, name: user.name, email: user.email, image: user.image, createdAt: user.createdAt })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1)

    const rawMemberships = await db
        .select({ organizationId: member.organizationId, role: member.role, organizationName: organization.name })
        .from(member)
        .leftJoin(organization, eq(member.organizationId, organization.id))
        .where(eq(member.userId, userId))

    return {
        user: {
            id: userData[0].id,
            name: userData[0].name,
            email: userData[0].email,
            image: userData[0].image,
            createdAt: new Date(userData[0].createdAt).toISOString()
        },
        memberships: rawMemberships.map((m) => ({
            organizationId: m.organizationId,
            organizationName: m.organizationName ?? '',
            role: m.role
        }))
    }
})

const deleteAccount = os.account.delete.handler(async ({ input, context }) => {
    const { userId } = input
    if (userId !== context.session.user.id) {
        throw new ORPCError('Access denied')
    }

    const result = await db.delete(user).where(eq(user.id, userId)).returning()

    if (result.length === 0) {
        throw new ORPCError('User not found')
    }

    return { success: true }
})

export const accountRouter = os.router({ account: { export: exportAccount, delete: deleteAccount } })
