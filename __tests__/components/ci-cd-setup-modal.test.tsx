import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import { CiCdSetupModal } from '@/app/(onboarding)/onboarding/components/ci-cd-setup-modal'
import { CI_CD } from '@/lib/constants'

describe('CiCdSetupModal', () => {
    it('renders CI/CD setup content when open', async () => {
        render(<CiCdSetupModal open={true} onOpenChange={vi.fn()} onContinue={vi.fn()} />)

        const user = userEvent.setup()

        expect(screen.getByText('Connect CI/CD (GitHub Actions)')).toBeDefined()
        await user.click(screen.getByRole('tab', { name: 'Workflow' }))
        expect(screen.getByText('.github/workflows/automaspec-sync.yml')).toBeDefined()
        await user.click(screen.getByRole('tab', { name: 'Secrets' }))
        expect(await screen.findByText(CI_CD.GITHUB_ACTIONS.SECRETS.API_KEY)).toBeDefined()
        expect(await screen.findByText(CI_CD.GITHUB_ACTIONS.SECRETS.WEBHOOK_URL)).toBeDefined()
        expect(screen.getByText('Continue to dashboard')).toBeDefined()
    })

    it('calls onContinue when continue button is clicked', () => {
        const onContinue = vi.fn()
        render(<CiCdSetupModal open={true} onOpenChange={vi.fn()} onContinue={onContinue} />)

        fireEvent.click(screen.getByText('Continue to dashboard'))
        expect(onContinue).toHaveBeenCalledTimes(1)
    })

    it('does not render content when closed', () => {
        render(<CiCdSetupModal open={false} onOpenChange={vi.fn()} onContinue={vi.fn()} />)

        expect(screen.queryByText('Connect CI/CD (GitHub Actions)')).toBeNull()
    })
})
