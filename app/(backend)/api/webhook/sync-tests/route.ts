import { eq, and, inArray } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import type { TestStatus, SpecStatus, VitestTestResult } from '@/lib/types'

import { db } from '@/db'
import { testSpec, testRequirement, test, member } from '@/db/schema'
import { NODE_ENVS, SPEC_STATUSES, TEST_STATUSES, WEBHOOK_TEST_API_KEY } from '@/lib/constants'
import { createServerLogger } from '@/lib/server-logger'
import { auth } from '@/lib/shared/better-auth'

const logger = createServerLogger()

export async function POST(request: Request) {
    try {
        const apiKeyHeader = request.headers.get('x-api-key')

        if (!apiKeyHeader) {
            return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
        }

        let userId: string
        let organizationId: string

        if (apiKeyHeader === WEBHOOK_TEST_API_KEY) {
            if (process.env.NODE_ENV !== NODE_ENVS.test) {
                return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
            }
            const firstMembership = await db
                .select({ organizationId: member.organizationId, userId: member.userId })
                .from(member)
                .limit(1)

            if (!firstMembership || firstMembership.length === 0) {
                return NextResponse.json({ error: 'No organization found for test key' }, { status: 400 })
            }

            userId = firstMembership[0].userId
            organizationId = firstMembership[0].organizationId
        } else {
            const verifyResult = await auth.api.verifyApiKey({
                body: { key: apiKeyHeader }
            })

            if (!verifyResult.valid || !verifyResult.key) {
                return NextResponse.json({ error: verifyResult.error?.message || 'Invalid API key' }, { status: 401 })
            }

            userId = verifyResult.key.userId

            const userMembership = await db
                .select({ organizationId: member.organizationId })
                .from(member)
                .where(eq(member.userId, userId))
                .limit(1)

            if (!userMembership || userMembership.length === 0) {
                return NextResponse.json({ error: 'User has no organization' }, { status: 400 })
            }

            organizationId = userMembership[0].organizationId
        }

        const body = await request.json()

        const titleToStatus: Record<string, TestStatus> = {}
        const report = body

        if (report.testResults) {
            for (const result of report.testResults as VitestTestResult[]) {
                if (result.assertionResults) {
                    for (const assertion of result.assertionResults) {
                        if (assertion.title && assertion.status) {
                            titleToStatus[assertion.title.toLowerCase()] = assertion.status as TestStatus
                        }
                    }
                }
            }
        }

        const orgTests = await db
            .select({
                testId: test.id,
                testStatus: test.status,
                requirementName: testRequirement.name,
                specId: testSpec.id
            })
            .from(test)
            .innerJoin(testRequirement, eq(test.requirementId, testRequirement.id))
            .innerJoin(testSpec, eq(testRequirement.specId, testSpec.id))
            .where(eq(testSpec.organizationId, organizationId))

        const matchedIds: string[] = []
        const updatesByStatus: Record<TestStatus, string[]> = {
            passed: [],
            failed: [],
            skipped: [],
            todo: [],
            pending: [],
            disabled: [],
            missing: []
        }
        let updatedCount = 0

        for (const orgTest of orgTests) {
            const reportedStatus = titleToStatus[orgTest.requirementName.toLowerCase()]
            if (reportedStatus) {
                matchedIds.push(orgTest.testId)
                if (orgTest.testStatus !== reportedStatus) {
                    updatesByStatus[reportedStatus].push(orgTest.testId)
                    updatedCount++
                }
            }
        }

        const matchedSet = new Set(matchedIds)
        const missingIds: string[] = []
        for (const t of orgTests) {
            if (!matchedSet.has(t.testId)) {
                missingIds.push(t.testId)
            }
        }

        const updateTasks: Array<Promise<unknown>> = []
        for (const status of Object.keys(updatesByStatus) as TestStatus[]) {
            const ids = updatesByStatus[status]
            if (ids.length > 0) {
                updateTasks.push(db.update(test).set({ status }).where(inArray(test.id, ids)))
            }
        }
        if (updateTasks.length > 0) {
            await Promise.all(updateTasks)
        }

        if (missingIds.length > 0) {
            await db
                .update(test)
                .set({ status: TEST_STATUSES.missing as TestStatus })
                .where(inArray(test.id, missingIds))
        }

        const affectedSpecIdSet = new Set<string>()
        for (const t of orgTests) {
            affectedSpecIdSet.add(t.specId)
        }
        const affectedSpecIds = Array.from(affectedSpecIdSet)

        const allSpecTests =
            affectedSpecIds.length === 0
                ? []
                : await db
                      .select({
                          specId: testRequirement.specId,
                          status: test.status
                      })
                      .from(test)
                      .innerJoin(testRequirement, eq(test.requirementId, testRequirement.id))
                      .innerJoin(testSpec, eq(testRequirement.specId, testSpec.id))
                      .where(and(eq(testSpec.organizationId, organizationId), inArray(testSpec.id, affectedSpecIds)))

        const specData: Record<string, { counts: Record<SpecStatus, number>; total: number }> = {}

        for (const specId of affectedSpecIds) {
            const counts = {} as Record<SpecStatus, number>
            for (const status of Object.values(SPEC_STATUSES)) {
                counts[status as SpecStatus] = 0
            }
            specData[specId] = {
                counts,
                total: 0
            }
        }

        for (const t of allSpecTests) {
            if (specData[t.specId] && t.status in specData[t.specId].counts) {
                specData[t.specId].counts[t.status as SpecStatus]++
                specData[t.specId].total++
            }
        }

        if (affectedSpecIds.length > 0) {
            const specUpdateTasks: Array<Promise<unknown>> = []
            for (const sid of affectedSpecIds) {
                specUpdateTasks.push(
                    db
                        .update(testSpec)
                        .set({
                            statuses: specData[sid].counts as Record<SpecStatus, number>,
                            numberOfTests: specData[sid].total
                        })
                        .where(eq(testSpec.id, sid))
                )
            }
            await Promise.all(specUpdateTasks)
        }

        return NextResponse.json({ updated: updatedCount, missing: missingIds.length })
    } catch (error) {
        logger.error({ err: error }, 'Webhook error')
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}
