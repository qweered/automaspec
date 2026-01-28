import { createRouterClient } from '@orpc/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_SPEC_STATUSES } from '@/db/schema'
import { SPEC_STATUSES, TEST_STATUSES } from '@/lib/constants'
import { router } from '@/orpc/routes'

const dbMocks = vi.hoisted(() => {
    let selectResults: unknown[] = []
    let insertResults: unknown[] = []
    let updateResults: unknown[] = []
    let deleteResults: unknown[] = []

    const selectChain = {
        from: () => selectChain,
        innerJoin: () => selectChain,
        leftJoin: () => selectChain,
        where: () => {
            const value = selectResults.shift() ?? []
            const rows = Array.isArray(value) ? value : []
            return Object.assign(rows, { limit: async () => rows, orderBy: async () => rows })
        }
    }

    const select = vi.fn(() => selectChain)

    const insert = vi.fn(() => {
        const chain = {
            values: () => chain,
            onConflictDoUpdate: () => chain,
            returning: async () => insertResults.shift() ?? []
        }
        return chain
    })

    const update = vi.fn(() => {
        const set = () => updateChain
        const where = () => {
            const value = updateResults.shift() ?? []
            return { returning: async () => value }
        }
        const updateChain = { set, where }
        return updateChain
    })

    const del = vi.fn(() => {
        const where = () => {
            const value = deleteResults.shift() ?? []
            return { returning: async () => value }
        }
        return { where }
    })

    const setSelectResults = (results: unknown[]) => {
        selectResults = results
    }

    const setInsertResults = (results: unknown[]) => {
        insertResults = results
    }

    const setUpdateResults = (results: unknown[]) => {
        updateResults = results
    }

    const setDeleteResults = (results: unknown[]) => {
        deleteResults = results
    }

    const reset = () => {
        select.mockClear()
        insert.mockClear()
        update.mockClear()
        del.mockClear()
        selectResults = []
        insertResults = []
        updateResults = []
        deleteResults = []
    }

    return {
        select,
        insert,
        update,
        del,
        reset,
        setSelectResults,
        setInsertResults,
        setUpdateResults,
        setDeleteResults
    }
})

vi.mock('@/db', () => {
    return {
        db: { select: dbMocks.select, insert: dbMocks.insert, update: dbMocks.update, delete: dbMocks.del },
        __esModule: true
    }
})

describe('tests routes', () => {
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

    const createFolder = (id: string, name: string) => {
        return {
            id,
            name,
            description: null,
            parentFolderId: null,
            organizationId: 'org-1',
            order: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }

    const createSpec = (id: string, name: string) => {
        return {
            id,
            name,
            fileName: null,
            description: null,
            statuses: DEFAULT_SPEC_STATUSES,
            numberOfTests: 0,
            folderId: null,
            organizationId: 'org-1',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }

    const createRequirement = (id: string, specId: string, name: string) => {
        return {
            id,
            name,
            description: null,
            order: 0,
            specId,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }

    const createTest = (id: string, requirementId: string, status: string) => {
        return {
            id,
            status,
            framework: 'vitest',
            code: null,
            requirementId,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }

    beforeEach(() => {
        dbMocks.reset()
    })

    it('gets a folder and rejects missing folders', async () => {
        dbMocks.setSelectResults([[createFolder('folder-1', 'Folder')]])
        const folder = await client.testFolders.get({ id: 'folder-1' })
        expect(folder.id).toBe('folder-1')

        dbMocks.setSelectResults([[]])
        await expect(client.testFolders.get({ id: 'missing' })).rejects.toThrow('Folder not found')
    })

    it('lists folders with parent filters', async () => {
        dbMocks.setSelectResults([[createFolder('folder-1', 'Any')]])
        const all = await client.testFolders.list({})
        expect(all.length).toBe(1)

        dbMocks.setSelectResults([[createFolder('folder-2', 'Root')]])
        const root = await client.testFolders.list({ parentFolderId: null })
        expect(root[0]?.id).toBe('folder-2')

        dbMocks.setSelectResults([[createFolder('folder-3', 'Nested')]])
        const nested = await client.testFolders.list({ parentFolderId: 'folder-1' })
        expect(nested[0]?.id).toBe('folder-3')
    })

    it('lists folder children with depth', async () => {
        dbMocks.setSelectResults([[{ id: 'folder-1', name: 'Folder 1' }], [{ id: 'spec-1', name: 'Spec 1' }]])

        const result = await client.testFolders.getChildren({ folderId: 'root' })

        expect(result.length).toBe(2)
        const first = result[0]
        expect(first?.type).toBe('folder')
        expect(first?.children).toBeUndefined()
    })

    it('lists folder children for a nested folder', async () => {
        dbMocks.setSelectResults([[{ id: 'folder-2', name: 'Folder 2' }], [{ id: 'spec-2', name: 'Spec 2' }]])

        const result = await client.testFolders.getChildren({ folderId: 'folder-1' })

        expect(result.length).toBe(2)
        expect(result[0]?.type).toBe('folder')
        expect(result[1]?.type).toBe('spec')
    })

    it('finds folders by name or returns null', async () => {
        dbMocks.setSelectResults([[]])
        const missing = await client.testFolders.findByName({ name: 'Missing' })
        expect(missing).toBeNull()

        dbMocks.setSelectResults([[createFolder('folder-1', 'A')]])
        const found = await client.testFolders.findByName({ name: 'A' })
        expect(found?.id).toBe('folder-1')
    })

    it('upserts folders and enforces access control', async () => {
        dbMocks.setSelectResults([[{ id: 'folder-1', organizationId: 'other-org' }]])
        await expect(
            client.testFolders.upsert({
                id: 'folder-1',
                name: 'X',
                description: null,
                parentFolderId: null,
                order: 0,
                organizationId: 'org-1'
            })
        ).rejects.toThrow('Folder not found or access denied')

        dbMocks.setInsertResults([[createFolder('folder-2', 'Created')]])
        const created = await client.testFolders.upsert({
            id: 'folder-2',
            name: 'Created',
            description: null,
            parentFolderId: null,
            order: 0,
            organizationId: 'org-1'
        })
        expect(created.id).toBe('folder-2')
    })

    it('edits and deletes folders', async () => {
        dbMocks.setUpdateResults([[createFolder('folder-1', 'Updated')]])
        const updated = await client.testFolders.edit({
            id: 'folder-1',
            name: 'Updated',
            description: null,
            parentFolderId: null,
            order: 0
        })
        expect(updated.id).toBe('folder-1')

        dbMocks.setUpdateResults([[]])
        await expect(
            client.testFolders.edit({ id: 'missing', name: 'X', description: null, parentFolderId: null, order: 0 })
        ).rejects.toThrow('Folder not found')

        dbMocks.setDeleteResults([[]])
        const notDeleted = await client.testFolders.delete({ id: 'missing' })
        expect(notDeleted).toEqual({ success: false })

        dbMocks.setDeleteResults([[{ id: 'folder-1' }]])
        const deleted = await client.testFolders.delete({ id: 'folder-1' })
        expect(deleted).toEqual({ success: true })
    })

    it('gets and upserts specs', async () => {
        dbMocks.setSelectResults([[]])
        const missing = await client.testSpecs.get({ id: 'missing' })
        expect(missing).toBeNull()

        dbMocks.setSelectResults([[createSpec('spec-1', 'Spec')]])
        const found = await client.testSpecs.get({ id: 'spec-1' })
        expect(found?.id).toBe('spec-1')

        dbMocks.setSelectResults([[{ id: 'spec-1', organizationId: 'other-org' }]])
        await expect(
            client.testSpecs.upsert({
                id: 'spec-1',
                name: 'X',
                description: null,
                fileName: null,
                folderId: null,
                organizationId: 'org-1'
            })
        ).rejects.toThrow('Spec not found or access denied')

        dbMocks.setInsertResults([[createSpec('spec-2', 'Created')]])
        const created = await client.testSpecs.upsert({
            id: 'spec-2',
            name: 'Created',
            description: null,
            fileName: null,
            folderId: null,
            organizationId: 'org-1'
        })
        expect(created.id).toBe('spec-2')
    })

    it('lists specs with folder filters', async () => {
        dbMocks.setSelectResults([[createSpec('spec-1', 'Any')]])
        const all = await client.testSpecs.list({})
        expect(all.length).toBe(1)

        dbMocks.setSelectResults([[createSpec('spec-2', 'Root')]])
        const root = await client.testSpecs.list({ folderId: null })
        expect(root[0]?.id).toBe('spec-2')

        dbMocks.setSelectResults([[createSpec('spec-3', 'Nested')]])
        const nested = await client.testSpecs.list({ folderId: 'folder-1' })
        expect(nested[0]?.id).toBe('spec-3')
    })

    it('deletes specs and enforces access control', async () => {
        dbMocks.setSelectResults([[{ id: 'spec-1', organizationId: 'other-org' }]])
        await expect(client.testSpecs.delete({ id: 'spec-1' })).rejects.toThrow('Spec not found or access denied')

        dbMocks.setSelectResults([[{ id: 'spec-1', organizationId: 'org-1' }]])
        const result = await client.testSpecs.delete({ id: 'spec-1' })
        expect(result).toEqual({ success: true })
    })

    it('replaces requirements for a spec and updates counts', async () => {
        dbMocks.setSelectResults([
            [{ id: 'spec-1' }],
            [{ id: 'req-1', specId: 'spec-1' }],
            [{ status: SPEC_STATUSES.passed }, { status: SPEC_STATUSES.failed }, { status: 'unknown' }],
            [createRequirement('req-1', 'spec-1', 'Req 1')]
        ])

        const result = await client.testRequirements.replaceForSpec({
            specId: 'spec-1',
            requirements: [{ id: 'req-1', name: 'Req 1', description: null, order: 0 }]
        })

        expect(Array.isArray(result)).toBe(true)
        expect(dbMocks.insert).toHaveBeenCalled()
        expect(dbMocks.del).toHaveBeenCalled()
        expect(dbMocks.update).toHaveBeenCalled()
    })

    it('upserts requirements and enforces access control', async () => {
        dbMocks.setSelectResults([[{ id: 'spec-1', organizationId: 'other-org' }]])
        await expect(
            client.testRequirements.upsert({ id: 'req-1', name: 'Req', description: null, order: 0, specId: 'spec-1' })
        ).rejects.toThrow('Spec not found or access denied')

        dbMocks.setSelectResults([[{ id: 'spec-1', organizationId: 'org-1' }]])
        dbMocks.setInsertResults([[createRequirement('req-1', 'spec-1', 'Req')]])
        const created = await client.testRequirements.upsert({
            id: 'req-1',
            name: 'Req',
            description: null,
            order: 0,
            specId: 'spec-1'
        })
        expect(created.id).toBe('req-1')
    })

    it('deletes requirements and enforces access control', async () => {
        dbMocks.setSelectResults([[]])
        await expect(client.testRequirements.delete({ id: 'req-1' })).rejects.toThrow(
            'Requirement not found or access denied'
        )

        dbMocks.setSelectResults([[{ id: 'req-1', specId: 'spec-1' }]])
        const result = await client.testRequirements.delete({ id: 'req-1' })
        expect(result).toEqual({ success: true })
    })

    it('replaces requirements with an empty list', async () => {
        dbMocks.setSelectResults([[{ id: 'spec-1' }], [], []])

        const result = await client.testRequirements.replaceForSpec({
            specId: 'spec-1',
            requirements: []
        })

        expect(result).toEqual([])
        expect(dbMocks.del).toHaveBeenCalled()
        expect(dbMocks.update).toHaveBeenCalled()
    })

    it('rejects requirements that belong to another spec', async () => {
        dbMocks.setSelectResults([[{ id: 'spec-1' }], [{ id: 'req-1', specId: 'other-spec' }]])

        await expect(
            client.testRequirements.replaceForSpec({
                specId: 'spec-1',
                requirements: [{ id: 'req-1', name: 'Req 1', description: null, order: 0 }]
            })
        ).rejects.toThrow('Requirement does not belong to the selected spec')
    })

    it('syncs report status mapping and returns report data', async () => {
        dbMocks.setSelectResults([[createTest('t1', 'req-1', TEST_STATUSES.passed)]])
        const tests = await client.tests.list({})
        expect(tests.length).toBe(1)

        dbMocks.setSelectResults([[createTest('t2', 'req-2', TEST_STATUSES.failed)]])
        const filtered = await client.tests.list({ requirementId: 'req-2' })
        expect(filtered.length).toBe(1)

        dbMocks.setSelectResults([[{ id: 'req-1' }]])
        dbMocks.setUpdateResults([[createTest('t1', 'req-1', TEST_STATUSES.passed)]])
        const upserted = await client.tests.upsert({
            id: 't1',
            status: TEST_STATUSES.passed,
            framework: 'vitest',
            code: null,
            requirementId: 'req-1'
        })
        expect(upserted.id).toBe('t1')

        dbMocks.setSelectResults([
            [
                {
                    testId: 'A',
                    testStatus: TEST_STATUSES.failed,
                    requirementName: 'Req A',
                    specId: 'spec-1'
                }
            ],
            [{ specId: 'spec-1', status: TEST_STATUSES.failed }]
        ])
        dbMocks.setUpdateResults([[], []])
        const synced = await client.tests.syncReport({
            testResults: [{ assertionResults: [{ title: 'Req A', status: TEST_STATUSES.passed }] }]
        })
        expect(synced.updated).toBe(1)
    })
})
