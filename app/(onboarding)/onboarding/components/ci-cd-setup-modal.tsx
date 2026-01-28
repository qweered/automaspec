'use client'

import { Check, Copy, Download, ExternalLink, Github, KeyRound, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CI_CD } from '@/lib/constants'

interface CiCdSetupModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onContinue: () => void
    onSkip?: () => void
    primaryActionLabel?: string
    showSkip?: boolean
    defaultTab?: string
}

type CopyTarget = 'workflow' | 'webhookUrl' | 'apiKeySecret' | 'webhookSecret'

export function CiCdSetupModal({
    open,
    onOpenChange,
    onContinue,
    onSkip,
    primaryActionLabel,
    showSkip = true,
    defaultTab
}: CiCdSetupModalProps) {
    const [copiedTarget, setCopiedTarget] = useState<CopyTarget | null>(null)

    const webhookUrl = useMemo(() => {
        if (typeof window === 'undefined') return CI_CD.WEBHOOK_PATH
        const origin = window.location?.origin ?? ''
        if (!origin) return CI_CD.WEBHOOK_PATH
        return `${origin}${CI_CD.WEBHOOK_PATH}`
    }, [])

    async function copyToClipboard(target: CopyTarget) {
        let value = ''
        if (target === 'workflow') value = CI_CD.GITHUB_ACTIONS.WORKFLOW_TEMPLATE
        if (target === 'webhookUrl') value = webhookUrl
        if (target === 'apiKeySecret') value = CI_CD.GITHUB_ACTIONS.SECRETS.API_KEY
        if (target === 'webhookSecret') value = CI_CD.GITHUB_ACTIONS.SECRETS.WEBHOOK_URL

        if (!value) return

        await navigator.clipboard.writeText(value)
        setCopiedTarget(target)
        setTimeout(() => setCopiedTarget(null), 2000)
    }

    function downloadWorkflow() {
        const blob = new Blob([CI_CD.GITHUB_ACTIONS.WORKFLOW_TEMPLATE], { type: 'text/yaml;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = CI_CD.GITHUB_ACTIONS.WORKFLOW_FILE_NAME
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Github className="size-5 text-primary" />
                        Connect CI/CD (GitHub Actions)
                    </DialogTitle>
                    <DialogDescription>
                        Add our GitHub Actions workflow and secrets once, then Automaspec will sync test results after
                        every run. You can skip this step and come back later in Profile → API Keys.
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    defaultValue={
                        defaultTab === CI_CD.UI.TABS.API_KEY ||
                        defaultTab === CI_CD.UI.TABS.WORKFLOW ||
                        defaultTab === CI_CD.UI.TABS.SECRETS
                            ? defaultTab
                            : CI_CD.UI.DEFAULT_TAB.ONBOARDING
                    }
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value={CI_CD.UI.TABS.API_KEY} className="gap-2">
                            <KeyRound className="size-4" />
                            API key
                        </TabsTrigger>
                        <TabsTrigger value={CI_CD.UI.TABS.WORKFLOW} className="gap-2">
                            <Download className="size-4" />
                            Workflow
                        </TabsTrigger>
                        <TabsTrigger value={CI_CD.UI.TABS.SECRETS} className="gap-2">
                            <LinkIcon className="size-4" />
                            Secrets
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={CI_CD.UI.TABS.API_KEY} className="mt-4">
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                    <div className="text-sm font-medium">Create an Automaspec API key</div>
                                    <div className="text-sm text-muted-foreground">
                                        Open Profile → API keys, create a new key, and copy it.
                                    </div>
                                </div>
                                <Button asChild variant="outline" className="shrink-0">
                                    <Link href="/profile">
                                        <ExternalLink className="mr-2 size-4" />
                                        Open API keys
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value={CI_CD.UI.TABS.WORKFLOW} className="mt-4 space-y-3">
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                    <div className="text-sm font-medium">Add the workflow to your repo</div>
                                    <div className="text-sm text-muted-foreground">Save this file at:</div>
                                    <div className="rounded-md border bg-background px-3 py-2 font-mono text-xs">
                                        {CI_CD.GITHUB_ACTIONS.WORKFLOW_PATH}
                                    </div>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <Button onClick={downloadWorkflow} variant="outline">
                                        <Download className="mr-2 size-4" />
                                        Download
                                    </Button>
                                    <Button onClick={() => void copyToClipboard('workflow')} variant="outline">
                                        {copiedTarget === 'workflow' ? (
                                            <Check className="mr-2 size-4 text-green-600" />
                                        ) : (
                                            <Copy className="mr-2 size-4" />
                                        )}
                                        Copy YAML
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <details className="rounded-lg border bg-slate-950/95">
                            <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-slate-50">
                                Preview workflow YAML
                            </summary>
                            <div className="border-t border-slate-800 p-3 font-mono text-slate-50 text-xs sm:p-4">
                                <pre className="whitespace-pre-wrap wrap-break-words">
                                    {CI_CD.GITHUB_ACTIONS.WORKFLOW_TEMPLATE}
                                </pre>
                            </div>
                        </details>
                    </TabsContent>

                    <TabsContent value={CI_CD.UI.TABS.SECRETS} className="mt-4 space-y-3">
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <div className="text-sm font-medium">Add repository secrets in GitHub</div>
                            <div className="mt-1 text-sm text-muted-foreground">
                                Repo → Settings → Secrets and variables → Actions
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-lg border bg-background p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Secret name
                                        </div>
                                        <div className="mt-1 truncate font-mono text-xs">
                                            {CI_CD.GITHUB_ACTIONS.SECRETS.API_KEY}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 shrink-0"
                                        onClick={() => void copyToClipboard('apiKeySecret')}
                                    >
                                        {copiedTarget === 'apiKeySecret' ? (
                                            <Check className="size-4 text-green-600" />
                                        ) : (
                                            <Copy className="size-4" />
                                        )}
                                    </Button>
                                </div>
                                <div className="mt-3 text-sm text-muted-foreground">
                                    Value: paste the API key you created in Automaspec.
                                </div>
                            </div>

                            <div className="rounded-lg border bg-background p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Secret name
                                        </div>
                                        <div className="mt-1 truncate font-mono text-xs">
                                            {CI_CD.GITHUB_ACTIONS.SECRETS.WEBHOOK_URL}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 shrink-0"
                                        onClick={() => void copyToClipboard('webhookSecret')}
                                    >
                                        {copiedTarget === 'webhookSecret' ? (
                                            <Check className="size-4 text-green-600" />
                                        ) : (
                                            <Copy className="size-4" />
                                        )}
                                    </Button>
                                </div>

                                <div className="mt-3 flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Value
                                        </div>
                                        <div className="mt-1 truncate font-mono text-xs">{webhookUrl}</div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 shrink-0"
                                        onClick={() => void copyToClipboard('webhookUrl')}
                                    >
                                        {copiedTarget === 'webhookUrl' ? (
                                            <Check className="size-4 text-green-600" />
                                        ) : (
                                            <Copy className="size-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between sm:space-x-0">
                    {showSkip ? (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                const handler = onSkip ?? (() => onOpenChange(false))
                                handler()
                            }}
                        >
                            Skip for now
                        </Button>
                    ) : (
                        <div />
                    )}
                    <Button onClick={onContinue}>{primaryActionLabel ?? 'Continue to dashboard'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
