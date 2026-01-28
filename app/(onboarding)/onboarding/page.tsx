'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import type { VitestReport } from '@/lib/types'

import { DashboardHeader } from '@/app/dashboard/components/header'
import { ImportTestsDialog } from '@/app/dashboard/components/import-tests-dialog'
import { CI_CD, SAMPLE_VITEST_REPORT } from '@/lib/constants'
import { safeClient } from '@/lib/orpc/orpc'
import { authClient } from '@/lib/shared/better-auth-client'

import { CiCdSetupModal } from './components/ci-cd-setup-modal'
import { OnboardingEmptyState } from './components/onboarding-empty-state'
import { SampleProjectModal } from './components/sample-project-modal'

export default function OnboardingPage() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [importDialogOpen, setImportDialogOpen] = useState(false)
    const [sampleModalOpen, setSampleModalOpen] = useState(false)
    const [ciCdModalOpen, setCiCdModalOpen] = useState(false)
    const { data: activeOrganization, isPending: isPendingActiveOrg } = authClient.useActiveOrganization()
    const { data: organizations, isPending: isPendingOrganizations } = authClient.useListOrganizations()

    useEffect(() => {
        if (isPendingActiveOrg || isPendingOrganizations) return

        if (!activeOrganization) {
            if (organizations && organizations.length > 0) {
                router.replace('/choose-organization')
            } else {
                router.replace('/create-organization')
            }
        }
    }, [activeOrganization, organizations, isPendingActiveOrg, isPendingOrganizations, router])

    const importSampleMutation = useMutation({
        mutationFn: async () => {
            const report: VitestReport = {
                ...SAMPLE_VITEST_REPORT,
                testResults: [...SAMPLE_VITEST_REPORT.testResults].map((r) => ({
                    ...r,
                    assertionResults: [...r.assertionResults]
                }))
            }
            const { data, error } = await safeClient.tests.importFromJson(report)
            if (error) throw error
            return data
        },
        onSuccess: async (result) => {
            toast.success(
                `Sample data loaded: ${result.foldersCreated} folders, ${result.specsCreated} specs, ${result.requirementsCreated} requirements, ${result.testsCreated} tests`
            )
            await queryClient.invalidateQueries({ queryKey: ['test-specs'] })
            await queryClient.invalidateQueries({ queryKey: ['test-folders'] })
            await queryClient.invalidateQueries({ queryKey: ['test-requirements'] })
            await queryClient.invalidateQueries({ queryKey: ['tests'] })
            setSampleModalOpen(false)
            setCiCdModalOpen(true)
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to load sample data')
        }
    })

    if (isPendingActiveOrg || isPendingOrganizations) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    if (!activeOrganization) {
        return null
    }

    const handleImportComplete = () => {
        void queryClient.invalidateQueries({ queryKey: ['test-specs'] })
        setCiCdModalOpen(true)
    }

    const handleOpenSampleModal = () => {
        setSampleModalOpen(true)
    }

    const handleConfirmSampleProject = () => {
        importSampleMutation.mutate()
    }

    return (
        <>
            <div className="flex h-screen flex-col bg-background">
                <DashboardHeader onImportClick={() => setImportDialogOpen(true)} />
                <OnboardingEmptyState
                    onImportClick={() => setImportDialogOpen(true)}
                    onStartFromScratch={handleOpenSampleModal}
                />
            </div>
            <ImportTestsDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                onImportComplete={handleImportComplete}
            />
            <SampleProjectModal
                open={sampleModalOpen}
                onOpenChange={setSampleModalOpen}
                onConfirm={handleConfirmSampleProject}
                isLoading={importSampleMutation.isPending}
            />
            <CiCdSetupModal
                open={ciCdModalOpen}
                onOpenChange={(open) => {
                    setCiCdModalOpen(open)
                    if (!open) {
                        router.replace('/dashboard')
                    }
                }}
                onContinue={() => router.replace('/dashboard')}
                defaultTab={CI_CD.UI.DEFAULT_TAB.ONBOARDING}
            />
        </>
    )
}
