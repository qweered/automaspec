'use client'

import {
    Upload,
    FileText,
    Copy,
    Check,
    CheckCircle2,
    FolderTree,
    ListChecks,
    TestTube,
    Terminal,
    FileUp,
    BarChart3,
    Users,
    Zap
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PACKAGE_MANAGER_COMMANDS } from '@/lib/constants'

interface OnboardingEmptyStateProps {
    onImportClick: () => void
    onStartFromScratch: () => void
}

interface PackageManagerConfig {
    name: string
    icon: string
    command: string
}

export function OnboardingEmptyState({ onImportClick, onStartFromScratch }: OnboardingEmptyStateProps) {
    const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
    const [selectedPm, setSelectedPm] = useState('pnpm')

    const packageManagers: PackageManagerConfig[] = [
        { name: 'pnpm', icon: '📦', command: PACKAGE_MANAGER_COMMANDS.pnpm },
        { name: 'npm', icon: '📦', command: PACKAGE_MANAGER_COMMANDS.npm },
        { name: 'yarn', icon: '🧶', command: PACKAGE_MANAGER_COMMANDS.yarn },
        { name: 'bun', icon: '🥟', command: PACKAGE_MANAGER_COMMANDS.bun }
    ]

    const selectedCommand = packageManagers.find((pm) => pm.name === selectedPm)?.command ?? ''

    async function handleCopyCommand() {
        try {
            await navigator.clipboard.writeText(selectedCommand)
            setCopiedCommand(selectedPm)
            toast.success('Command copied to clipboard')
            setTimeout(() => setCopiedCommand(null), 2000)
        } catch {
            toast.error('Failed to copy command')
        }
    }

    const steps = [
        { id: 1, title: 'Create organization', completed: true },
        { id: 2, title: 'Import tests', completed: false },
        { id: 3, title: 'Connect CI/CD', completed: false },
        { id: 4, title: 'View dashboard', completed: false }
    ]

    return (
        <div className="flex h-full">
            <div className="hidden w-64 shrink-0 border-r bg-muted/20 p-5 lg:block">
                <div className="mb-6">
                    <h2 className="font-semibold">Getting Started</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">Set up your workspace</p>
                </div>

                <div className="space-y-1">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`flex size-6 items-center justify-center rounded-full text-xs ${
                                        step.completed
                                            ? 'bg-green-500 text-white'
                                            : index === 1
                                              ? 'bg-primary text-primary-foreground'
                                              : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {step.completed ? <CheckCircle2 className="size-3.5" /> : step.id}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`my-1 h-5 w-px ${step.completed ? 'bg-green-500' : 'bg-border'}`} />
                                )}
                            </div>
                            <p
                                className={`pt-0.5 text-sm ${
                                    step.completed
                                        ? 'text-green-600 dark:text-green-400'
                                        : index === 1
                                          ? 'font-medium text-foreground'
                                          : 'text-muted-foreground'
                                }`}
                            >
                                {step.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-1 justify-center overflow-auto p-6 pt-12">
                <div className="w-full max-w-3xl">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                            <TestTube className="size-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Import your tests</h1>
                        <p className="mt-1 text-muted-foreground">Choose how to get started with Automaspec</p>
                    </div>

                    <div className="grid items-stretch gap-6 lg:grid-cols-2">
                        <Card className="flex flex-col border-2 transition-all hover:border-primary hover:shadow-lg">
                            <CardHeader>
                                <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                                    <Upload className="size-6 text-green-600 dark:text-green-400" />
                                </div>
                                <CardTitle>Import from Vitest</CardTitle>
                                <CardDescription>
                                    Import your existing test suite by uploading a Vitest JSON report
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col space-y-5">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                            1
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Terminal className="size-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">Generate JSON report</span>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5">
                                                {packageManagers.map((pm) => (
                                                    <button
                                                        type="button"
                                                        key={pm.name}
                                                        onClick={() => setSelectedPm(pm.name)}
                                                        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                                            selectedPm === pm.name
                                                                ? 'border-primary bg-primary/10 text-primary'
                                                                : 'border-border bg-background hover:border-primary/50'
                                                        }`}
                                                    >
                                                        <span>{pm.icon}</span>
                                                        {pm.name}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2.5">
                                                <code className="flex-1 text-xs text-foreground">
                                                    {selectedCommand}
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 shrink-0"
                                                    onClick={() => void handleCopyCommand()}
                                                >
                                                    {copiedCommand === selectedPm ? (
                                                        <Check className="size-3.5 text-green-600" />
                                                    ) : (
                                                        <Copy className="size-3.5" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                            2
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <FileUp className="size-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">
                                                    Upload test-results.json file
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button className="w-full" size="lg" onClick={onImportClick}>
                                    <Upload className="mr-2 size-4" />
                                    Import Tests
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="flex flex-col border-2 transition-all hover:border-primary hover:shadow-lg">
                            <CardHeader>
                                <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                                    <FileText className="size-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <CardTitle>Explore with Sample Data</CardTitle>
                                <CardDescription>
                                    Load a demo project to see how Automaspec works before importing your own tests
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col space-y-5">
                                <div className="flex-1 space-y-4">
                                    <div className="rounded-lg border bg-muted/40 p-4">
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Sample project includes
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2.5">
                                                <FolderTree className="size-4 text-blue-500" />
                                                <span className="text-sm">6 folders</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <FileText className="size-4 text-green-500" />
                                                <span className="text-sm">8 specs</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <ListChecks className="size-4 text-orange-500" />
                                                <span className="text-sm">20 requirements</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <TestTube className="size-4 text-purple-500" />
                                                <span className="text-sm">20 tests</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            What you'll explore
                                        </p>
                                        <div className="grid gap-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Zap className="size-3.5 text-yellow-500" />
                                                <span>Test organization & hierarchy</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <BarChart3 className="size-3.5 text-green-500" />
                                                <span>Analytics & coverage metrics</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Users className="size-3.5 text-blue-500" />
                                                <span>Team collaboration features</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full" size="lg" onClick={onStartFromScratch}>
                                    <FileText className="mr-2 size-4" />
                                    Load Sample Project
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
