import { createRouterClient } from '@orpc/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { router } from '@/orpc/routes'

const dbMocks = vi.hoisted(() => {
    let selectResults: unknown[] = []
    let deleteResults: unknown[] = []

    const selectChain = {
        from: () => selectChain,
        leftJoin: () => selectChain,
        where: () => {
            const value = selectResults.shift() ?? []
            const rows = Array.isArray(value) ? value : []
            return Object.assign(rows, { limit: async () => rows })
        }
    }

    const select = vi.fn(() => selectChain)
    const del = vi.fn(() => ({
        where: () => ({
            returning: async () => deleteResults.shift() ?? []
        })
    }))

    const setSelectResults = (results: unknown[]) => {
        selectResults = results
    }

    const setDeleteResults = (results: unknown[]) => {
        deleteResults = results
    }

    const reset = () => {
        select.mockClear()
        del.mockClear()
        selectResults = []
        deleteResults = []
    }

    return { select, del, setSelectResults, setDeleteResults, reset }
})

vi.mock('@/db', () => {
    return { db: { select: dbMocks.select, delete: dbMocks.del }, __esModule: true }
})

describe('account routes', () => {
    const ctx = {
        session: {
            session: {
                activeOrganizationId: 'org-1',
                userId: 'user-1'
            },
            user: { id: 'user-1' }
        }
    }
    const client = createRouterClient(router, { context: async () => ctx })

    beforeEach(() => {
        dbMocks.reset()
    })

    it('exports account data with memberships', async () => {
        const createdAt = new Date('2025-01-01T00:00:00.000Z')
        dbMocks.setSelectResults([
            [{ id: 'user-1', name: 'User', email: 'user@example.com', image: null, createdAt }],
            [{ organizationId: 'org-1', role: 'admin', organizationName: null }]
        ])

        const result = await client.account.export({ userId: 'user-1' })

        expect(result.user.id).toBe('user-1')
        expect(result.user.createdAt).toBe(createdAt.toISOString())
        expect(result.memberships.length).toBe(1)
        expect(result.memberships[0]?.organizationName).toBe('')
    })

    it('deletes account when user exists', async () => {
        dbMocks.setDeleteResults([[{ id: 'user-1' }]])

        const result = await client.account.delete({ userId: 'user-1' })

        expect(result).toEqual({ success: true })
    })

    it('throws when deleting missing user', async () => {
        dbMocks.setDeleteResults([[]])

        await expect(client.account.delete({ userId: 'user-1' })).rejects.toThrow('User not found')
    })
})
