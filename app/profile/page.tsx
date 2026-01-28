'use client'

import {
    ArrowLeft,
    Mail,
    Calendar,
    Building2,
    LogOut,
    AlertTriangle,
    Download,
    Github,
    Trash2,
    Key,
    Copy,
    Plus,
    Check,
    Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

import { CiCdSetupModal } from '@/app/(onboarding)/onboarding/components/ci-cd-setup-modal'
import { ModeToggle } from '@/components/theme-toggler'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CI_CD } from '@/lib/constants'
import { safeClient } from '@/lib/orpc/orpc'
import { authClient } from '@/lib/shared/better-auth-client'

type ApiKeyItem = {
    id: string
    name: string | null
    start: string | null
    createdAt: Date
}

export default function ProfilePage() {
    const router = useRouter()
    const { data: session } = authClient.useSession()
    const { data: activeOrganization } = authClient.useActiveOrganization()
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [newKeyName, setNewKeyName] = useState('')
    const [creatingKey, setCreatingKey] = useState(false)
    const [newKeyValue, setNewKeyValue] = useState<string | null>(null)
    const [copiedKey, setCopiedKey] = useState(false)
    const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null)
    const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([])
    const [loadingKeys, setLoadingKeys] = useState(true)
    const [ciCdSetupOpen, setCiCdSetupOpen] = useState(false)

    const fetchApiKeys = useCallback(async () => {
        setLoadingKeys(true)
        try {
            const { data, error } = await authClient.apiKey.list()
            if (error) throw error
            setApiKeys(data || [])
        } catch (error) {
            console.log('Failed to fetch API keys:', error)
        } finally {
            setLoadingKeys(false)
        }
    }, [])

    useEffect(() => {
        void fetchApiKeys()
    }, [fetchApiKeys, session, activeOrganization])

    const userName = session?.user.name || ''
    const userEmail = session?.user.email || ''
    let userInitials = ''
    if (userName) {
        const parts = userName.trim().split(' ')
        for (const p of parts) {
            if (p) userInitials += p[0]
            if (userInitials.length >= 2) break
        }
    }
    if (!userInitials) {
        userInitials = userEmail.slice(0, 2).toUpperCase()
    }
    const joinDate = session?.user.createdAt ? new Date(session.user.createdAt).toLocaleDateString() : ''

    const handleCreateApiKey = async () => {
        if (!newKeyName.trim()) {
            toast.error('Please enter a name for your API key')
            return
        }
        setCreatingKey(true)
        try {
            const { data, error } = await authClient.apiKey.create({
                name: newKeyName.trim()
            })
            if (error) throw error
            setNewKeyValue(data.key)
            setNewKeyName('')
            void fetchApiKeys()
            toast.success('API key created successfully')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create API key')
        } finally {
            setCreatingKey(false)
        }
    }

    const handleCopyKey = async () => {
        if (newKeyValue) {
            await navigator.clipboard.writeText(newKeyValue)
            setCopiedKey(true)
            toast.success('API key copied to clipboard')
            setTimeout(() => setCopiedKey(false), 2000)
        }
    }

    const handleDeleteApiKey = async (keyId: string) => {
        setDeletingKeyId(keyId)
        try {
            const { error } = await authClient.apiKey.delete({ keyId })
            if (error) throw error
            void fetchApiKeys()
            toast.success('API key deleted')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete API key')
        } finally {
            setDeletingKeyId(null)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-4xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 size-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                    <h1 className="mt-4 text-3xl font-bold">Profile</h1>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                            <Avatar className="size-24">
                                <AvatarImage src={session?.user.image || undefined} alt={userName} />
                                <AvatarFallback className="text-lg">{userInitials || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="font-bold text-2xl leading-tight">{userName || '—'}</h2>
                                </div>
                                <p className="text-muted-foreground">{userEmail || '—'}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex items-center text-muted-foreground text-sm">
                                <Mail className="mr-2 size-4" /> {userEmail || '—'}
                            </div>
                            <div className="flex items-center text-muted-foreground text-sm">
                                <Calendar className="mr-2 size-4" /> {joinDate || '—'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 grid gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Key className="size-5" />
                                    <CardTitle>API Keys</CardTitle>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => setCiCdSetupOpen(true)}>
                                    <Github className="mr-2 size-4" />
                                    CI/CD setup
                                </Button>
                            </div>
                            <CardDescription>Manage API keys for CI/CD webhook integration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {newKeyValue && (
                                <div className="rounded-lg border border-green-500 bg-green-50 dark:bg-green-950 p-4">
                                    <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                                        <strong>Save this key now!</strong> You won't be able to see it again.
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 rounded bg-green-100 dark:bg-green-900 px-2 py-1 text-sm font-mono break-all">
                                            {newKeyValue}
                                        </code>
                                        <Button size="sm" variant="outline" onClick={handleCopyKey}>
                                            {copiedKey ? <Check className="size-4" /> : <Copy className="size-4" />}
                                        </Button>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="mt-2"
                                        onClick={() => setNewKeyValue(null)}
                                    >
                                        Dismiss
                                    </Button>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Input
                                    placeholder="API key name (e.g., CI/CD Pipeline)"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    onKeyDown={async (e) => e.key === 'Enter' && handleCreateApiKey()}
                                />
                                <Button onClick={handleCreateApiKey} disabled={creatingKey}>
                                    {creatingKey ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <Plus className="mr-2 size-4" />
                                    )}
                                    Create
                                </Button>
                            </div>

                            {loadingKeys ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : apiKeys.length > 0 ? (
                                <div className="space-y-2">
                                    {apiKeys.map((key) => (
                                        <div
                                            key={key.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div>
                                                <div className="font-medium">{key.name || 'Unnamed key'}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {key.start ? `${key.start}...` : 'ams_...'} • Created{' '}
                                                    {new Date(key.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={async () => handleDeleteApiKey(key.id)}
                                                disabled={deletingKeyId === key.id}
                                            >
                                                {deletingKeyId === key.id ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="size-4" />
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No API keys yet. Create one to use with webhooks.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Building2 className="size-5" />
                                    <CardTitle>Organization</CardTitle>
                                </div>
                                <CardDescription>Active organization and plan</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="font-medium">{activeOrganization?.name || '—'}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Download className="size-5" />
                                    <CardTitle>Preferences & Data</CardTitle>
                                </div>
                                <CardDescription>Appearance and data access</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-base">Theme</div>
                                    <ModeToggle />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-base">Export my data (JSON)</div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={async () => {
                                            const { data, error } = await safeClient.account.export({
                                                userId: session?.user.id ?? ''
                                            })

                                            if (error) throw error
                                            const blob = new Blob([JSON.stringify(data, null, 2)], {
                                                type: 'application/json'
                                            })
                                            const url = URL.createObjectURL(blob)
                                            const a = document.createElement('a')
                                            a.href = url
                                            a.download = `automaspec-export-${new Date().toISOString().slice(0, 10)}.json`
                                            document.body.appendChild(a)
                                            a.click()
                                            a.remove()
                                            URL.revokeObjectURL(url)
                                        }}
                                    >
                                        <Download className="mr-2 size-4" /> Export
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <LogOut className="size-5" />
                                    <CardTitle>Session</CardTitle>
                                </div>
                                <CardDescription>Manage your current session</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="outline"
                                    onClick={async () => {
                                        await authClient.signOut()
                                        router.replace('/login')
                                    }}
                                >
                                    <LogOut className="mr-2 size-4" /> Sign out
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-red-200">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="size-5 text-red-600" />
                                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                                </div>
                                <CardDescription>Permanently remove your account and data</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
                                    <div>
                                        <div className="font-medium text-red-800">Delete Account</div>
                                        <div className="text-sm text-red-600">This action cannot be undone</div>
                                    </div>
                                    <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                                        <Trash2 className="mr-2 size-4" /> Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete account</AlertDialogTitle>
                            <AlertDialogDescription>
                                This removes your user and associated data. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                disabled={deleting}
                                onClick={async () => {
                                    if (deleting) return
                                    setDeleting(true)
                                    const { error } = await safeClient.account.delete({
                                        userId: session?.user.id ?? ''
                                    })
                                    if (error) {
                                        toast.error(error.message || 'Failed to delete account')
                                        setDeleting(false)
                                        return
                                    }
                                    await authClient.signOut()
                                    router.push('/login')
                                    setDeleting(false)
                                    setConfirmOpen(false)
                                }}
                            >
                                Confirm
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <CiCdSetupModal
                    open={ciCdSetupOpen}
                    onOpenChange={setCiCdSetupOpen}
                    onContinue={() => setCiCdSetupOpen(false)}
                    showSkip={false}
                    primaryActionLabel="Close"
                    defaultTab={CI_CD.UI.DEFAULT_TAB.SETTINGS}
                />
            </div>
        </div>
    )
}
