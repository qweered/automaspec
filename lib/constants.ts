// https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/node/reporters/json.ts
import type { JsonAssertionResult } from 'vitest/reporters'

import { CheckCircle, XCircle, Clock, MinusCircle, type LucideIcon } from 'lucide-react'

import type { SpecStatus } from './types'

export const TEST_FRAMEWORK = 'vitest'

export const IGNORED_TEST_FOLDERS = new Set(['__tests__', 'tests', 'test', 'e2e'])

export const FILE_UPLOAD = {
    ALLOWED_EXTENSIONS: ['.json'],
    ALLOWED_MIME_TYPES: ['application/json'],
    MAX_SIZE_BYTES: 10 * 1024 * 1024
} as const

export const IMPORT_TESTS_ERRORS = {
    PLAYWRIGHT_REPORT_NOT_SUPPORTED:
        'This looks like a Playwright JSON report. The importer supports Vitest JSON reporter output only.',
    NO_TEST_RESULTS_FOUND: 'No tests found in the report. Make sure this is a Vitest JSON reporter output.'
} as const

export const ORGANIZATION_PLANS = {
    free: 'free',
    pro: 'pro',
    enterprise: 'enterprise'
} as const

export const AI_PROVIDERS = {
    openrouter: 'openrouter',
    google: 'google'
} as const

export const AI_MODELS = {
    openrouter: 'kwaipilot/kat-coder-pro:free',
    google: 'gemini-2.5-flash'
} as const
export const AI_MAX_PROMPT_LENGTH = 2000
export const AI_BLOCKED_PATTERNS = [
    'ignore previous instructions',
    'disregard previous instructions',
    'disregard prior instructions',
    'drop database',
    'disable safety',
    'delete all data'
] as const
export const AI_RATE_LIMIT_WINDOW_MS = 60000
export const AI_RATE_LIMIT_MAX_REQUESTS = 30

export const AI_PROVIDER_LABELS = {
    openrouter: 'OpenRouter (free)',
    google: 'Gemini (Google)'
} as const

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
export const AI_ENV_KEYS = {
    openrouter: 'OPENROUTER_API_KEY',
    google: 'GEMINI_API_KEY'
} as const

export const MEMBER_ROLES = {
    owner: 'owner',
    admin: 'admin',
    member: 'member'
} as const

export type OrganizationPlan = keyof typeof ORGANIZATION_PLANS

export const TEST_STATUSES = {
    passed: 'passed',
    skipped: 'skipped',
    todo: 'todo',
    failed: 'failed',
    pending: 'pending',
    disabled: 'disabled',
    // THIS IS OUR SPECIFIC STATUS FOR TESTS THAT ARE MISSING IN REPORT
    missing: 'missing'
} as const satisfies { [K in JsonAssertionResult['status'] | 'missing']: string }

export const SPEC_STATUSES = {
    ...TEST_STATUSES,
    deactivated: 'deactivated',
    partial: 'partial'
} as const

export type StatusConfig = {
    icon: LucideIcon
    color: string
    label: string
    badgeClassName: string
    requirementClassName: string
}

export const STATUS_CONFIGS = {
    [TEST_STATUSES.missing]: {
        icon: MinusCircle,
        color: 'text-muted-foreground',
        label: 'Missing',
        badgeClassName: 'border-border bg-muted/50 text-muted-foreground hover:bg-muted',
        requirementClassName: ''
    },
    [TEST_STATUSES.passed]: {
        icon: CheckCircle,
        color: 'text-green-600',
        label: 'Passed',
        badgeClassName: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
        requirementClassName: ''
    },
    [TEST_STATUSES.failed]: {
        icon: XCircle,
        color: 'text-red-600',
        label: 'Failed',
        badgeClassName: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
        requirementClassName: ''
    },
    [TEST_STATUSES.pending]: {
        icon: Clock,
        color: 'text-yellow-600',
        label: 'Pending',
        badgeClassName: 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
        requirementClassName: ''
    },
    [TEST_STATUSES.skipped]: {
        icon: MinusCircle,
        color: 'text-muted-foreground',
        label: 'Skipped',
        badgeClassName: 'border-border bg-muted/50 text-muted-foreground hover:bg-muted',
        requirementClassName: ''
    },
    [TEST_STATUSES.todo]: {
        icon: MinusCircle,
        color: 'text-orange-600',
        label: 'Todo',
        badgeClassName: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100',
        requirementClassName: ''
    },
    [SPEC_STATUSES.partial]: {
        icon: MinusCircle,
        color: 'text-orange-600',
        label: 'Partial',
        badgeClassName: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100',
        requirementClassName: ''
    },
    [SPEC_STATUSES.deactivated]: {
        icon: MinusCircle,
        color: 'text-muted-foreground',
        label: 'Deactivated',
        badgeClassName: 'border-border bg-muted/50 text-muted-foreground hover:bg-muted',
        requirementClassName: ''
    },
    [TEST_STATUSES.disabled]: {
        icon: MinusCircle,
        color: 'text-muted-foreground',
        label: 'Disabled',
        badgeClassName: 'border-border bg-muted/50 text-muted-foreground hover:bg-muted',
        requirementClassName: ''
    }
} as const satisfies { [K in SpecStatus]: StatusConfig }

export const ANALYTICS_PERIODS = {
    '7d': 7,
    '30d': 30,
    '90d': 90
} as const

export const ERROR_PAGE_CONTENT = {
    notFound: {
        code: '404',
        title: 'Page not found',
        description: 'The page you are looking for does not exist or has been moved.',
        primaryActionLabel: 'Return home',
        primaryActionHref: '/',
        secondaryActionLabel: 'Open dashboard',
        secondaryActionHref: '/dashboard'
    },
    serverError: {
        code: '500',
        title: 'Something went wrong',
        description: 'An unexpected error occurred. Please try again or head back to the main page.',
        primaryActionLabel: 'Try again',
        secondaryActionLabel: 'Back home',
        secondaryActionHref: '/'
    },
    badRequest: {
        code: '400',
        title: 'Bad request',
        description: 'The request was invalid or cannot be processed.',
        primaryActionLabel: 'Try again',
        secondaryActionLabel: 'Back home',
        secondaryActionHref: '/'
    },
    unauthorized: {
        code: '401',
        title: 'Unauthorized',
        description: 'You need to be logged in to access this page.',
        primaryActionLabel: 'Log in',
        primaryActionHref: '/login',
        secondaryActionLabel: 'Back home',
        secondaryActionHref: '/'
    },
    forbidden: {
        code: '403',
        title: 'Forbidden',
        description: 'You do not have permission to access this page.',
        primaryActionLabel: 'Back home',
        primaryActionHref: '/',
        secondaryActionLabel: 'Open dashboard',
        secondaryActionHref: '/dashboard'
    }
} as const

export const NODE_ENVS = {
    production: 'production',
    development: 'development',
    test: 'test'
} as const

export const ORPC_ERROR_CODES = {
    badRequest: 'BAD_REQUEST',
    unauthorized: 'UNAUTHORIZED',
    forbidden: 'FORBIDDEN',
    notFound: 'NOT_FOUND',
    unprocessableContent: 'UNPROCESSABLE_CONTENT',
    tooManyRequests: 'TOO_MANY_REQUESTS',
    badGateway: 'BAD_GATEWAY',
    serviceUnavailable: 'SERVICE_UNAVAILABLE',
    internalServerError: 'INTERNAL_SERVER_ERROR'
} as const

export const WEBHOOK_TEST_API_KEY = 'TestApiKey'

export const PACKAGE_MANAGER_COMMANDS = {
    pnpm: 'pnpm vitest --reporter=json --outputFile=test-results.json',
    npm: 'npx vitest --reporter=json --outputFile=test-results.json',
    yarn: 'yarn vitest --reporter=json --outputFile=test-results.json',
    bun: 'bun vitest --reporter=json --outputFile=test-results.json'
} as const

export const SAMPLE_VITEST_REPORT = {
    numTotalTestSuites: 8,
    numPassedTestSuites: 5,
    numFailedTestSuites: 2,
    numPendingTestSuites: 1,
    numTotalTests: 20,
    numPassedTests: 15,
    numFailedTests: 3,
    numPendingTests: 2,
    numTodoTests: 0,
    success: false,
    startTime: Date.now(),
    testResults: [
        {
            name: 'auth/login.test.ts',
            assertionResults: [
                {
                    ancestorTitles: ['Login'],
                    fullName: 'Login should authenticate with valid credentials',
                    status: 'passed',
                    title: 'should authenticate with valid credentials',
                    duration: 45,
                    failureMessages: [],
                    meta: {}
                },
                {
                    ancestorTitles: ['Login'],
                    fullName: 'Login should reject invalid password',
                    status: 'passed',
                    title: 'should reject invalid password',
                    duration: 23,
                    failureMessages: [],
                    meta: {}
                },
                {
                    ancestorTitles: ['Login'],
                    fullName: 'Login should handle rate limiting',
                    status: 'passed',
                    title: 'should handle rate limiting',
                    duration: 67,
                    failureMessages: [],
                    meta: {}
                }
            ]
        },
        {
            name: 'auth/session.test.ts',
            assertionResults: [
                {
                    ancestorTitles: ['Session Management'],
                    fullName: 'Session Management should create new session on login',
                    status: 'passed',
                    title: 'should create new session on login',
                    duration: 34,
                    failureMessages: [],
                    meta: {}
                },
                {
                    ancestorTitles: ['Session Management'],
                    fullName: 'Session Management should handle session expiry',
                    status: 'failed',
                    title: 'should handle session expiry',
                    duration: 156,
                    failureMessages: ['Expected session to be null after expiry'],
                    meta: {}
                }
            ]
        },
        {
            name: 'api/users.test.ts',
            assertionResults: [
                {
                    ancestorTitles: ['User API'],
                    fullName: 'User API should create a new user',
                    status: 'passed',
                    title: 'should create a new user',
                    duration: 89,
                    failureMessages: [],
                    meta: {}
                },
                {
                    ancestorTitles: ['User API'],
                    fullName: 'User API should update user profile',
                    status: 'passed',
                    title: 'should update user profile',
                    duration: 67,
                    failureMessages: [],
                    meta: {}
                },
                {
                    ancestorTitles: ['User API'],
                    fullName: 'User API should delete user account',
                    status: 'pending',
                    title: 'should delete user account',
                    duration: 0,
                    failureMessages: [],
                    meta: {}
                }
            ]
        },
        {
            name: 'api/products.test.ts',
            assertionResults: [
                {
                    ancestorTitles: ['Product API'],
                    fullName: 'Product API should list all products',
                    status: 'passed',
                    title: 'should list all products',
                    duration: 45,
                    failureMessages: [],
                    meta: {}
                },
                {
                    ancestorTitles: ['Product API'],
                    fullName: 'Product API should filter products by category',
                    status: 'passed',
                    title: 'should filter products by category',
                    duration: 52,
                    failureMessages: [],
                    meta: {}
                },
                {
                    ancestorTitles: ['Product API'],
                    fullName: 'Product API should handle pagination',
                    status: 'failed',
                    title: 'should handle pagination',
                    duration: 78,
                    failureMessages: ['Expected page 2 to have 10 items'],
                    meta: {}
                }
            ]
        },
        {
            name: 'utils/validation.test.ts',
            assertionResults: [
                {
                    ancestorTitles: ['Validation Utils'],
                    fullName: 'Validation Utils should validate email format',
                    status: 'passed',
                    title: 'should validate email format',
                    duration: 12,
                    failureMessages: [],
                    meta: {}
                },
                {
                    ancestorTitles: ['Validation Utils'],
                    fullName: 'Validation Utils should validate password strength',
                    status: 'passed',
                    title: 'should validate password strength',
                    duration: 8,
                    failureMessages: [],
                    meta: {}
                }
            ]
        },
        {
            name: 'utils/formatting.test.ts',
            assertionResults: [
                {
                    ancestorTitles: ['Formatting Utils'],
                    fullName: 'Formatting Utils should format currency correctly',
                    status: 'passed',
                    title: 'should format currency correctly',
                    duration: 5,
                    failureMessages: [],
                    meta: {}
                },
                {
                    ancestorTitles: ['Formatting Utils'],
                    fullName: 'Formatting Utils should format dates in locale',
                    status: 'passed',
                    title: 'should format dates in locale',
                    duration: 7,
                    failureMessages: [],
                    meta: {}
                }
            ]
        },
        {
            name: 'components/Button.test.tsx',
            assertionResults: [
                {
                    ancestorTitles: ['Button Component'],
                    fullName: 'Button Component should render with correct text',
                    status: 'passed',
                    title: 'should render with correct text',
                    duration: 15,
                    failureMessages: [],
                    meta: {}
                },
                {
                    ancestorTitles: ['Button Component'],
                    fullName: 'Button Component should handle click events',
                    status: 'passed',
                    title: 'should handle click events',
                    duration: 18,
                    failureMessages: [],
                    meta: {}
                }
            ]
        },
        {
            name: 'components/Form.test.tsx',
            assertionResults: [
                {
                    ancestorTitles: ['Form Component'],
                    fullName: 'Form Component should validate required fields',
                    status: 'failed',
                    title: 'should validate required fields',
                    duration: 45,
                    failureMessages: ['Expected error message to be displayed'],
                    meta: {}
                },
                {
                    ancestorTitles: ['Form Component'],
                    fullName: 'Form Component should submit form data',
                    status: 'pending',
                    title: 'should submit form data',
                    duration: 0,
                    failureMessages: [],
                    meta: {}
                }
            ]
        }
    ]
} as const

export const DEMO_CREDENTIALS = {
    email: 'demo@automaspec.com',
    password: 'demo1234'
} as const

export const CI_CD = {
    WEBHOOK_PATH: '/api/webhook/sync-tests',
    GITHUB_ACTIONS: {
        WORKFLOW_FILE_NAME: 'automaspec-sync.yml',
        WORKFLOW_PATH: '.github/workflows/automaspec-sync.yml',
        SECRETS: {
            API_KEY: 'AUTOMASPEC_API_KEY',
            WEBHOOK_URL: 'AUTOMASPEC_WEBHOOK_URL'
        },
        WORKFLOW_TEMPLATE: `name: Sync Test Results to Automaspec

on:
  push:
    branches: [main, master, dev]
  pull_request:
    branches: [main, master, dev]

jobs:
  test-and-sync:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests (produce JSON report)
        id: tests
        run: pnpm test:json
        continue-on-error: true

      - name: Sync test results to Automaspec
        if: >-
          always() &&
          hashFiles('test-results.json') != ''
        run: |
          if [ ! -s test-results.json ]; then
            echo "test-results.json missing/empty; skipping sync."
            exit 0
          fi

          if [ -z "${'$'}{{ secrets.AUTOMASPEC_WEBHOOK_URL }}" ] || [ -z "${'$'}{{ secrets.AUTOMASPEC_API_KEY }}" ]; then
            echo "Automaspec secrets missing; skipping sync."
            exit 0
          fi

          curl -X POST \\
            --fail-with-body \\
            -H "Content-Type: application/json" \\
            -H "x-api-key: ${'$'}{{ secrets.AUTOMASPEC_API_KEY }}" \\
            -d @test-results.json \\
            "${'$'}{{ secrets.AUTOMASPEC_WEBHOOK_URL }}"

      - name: Fail job if tests failed
        if: steps.tests.outcome == 'failure'
        run: exit 1
`
    },
    UI: {
        TABS: {
            API_KEY: 'api-key',
            WORKFLOW: 'workflow',
            SECRETS: 'secrets'
        },
        DEFAULT_TAB: {
            ONBOARDING: 'api-key',
            SETTINGS: 'workflow'
        }
    }
} as const

export const DB_SCHEMA_DIAGRAM = {
    SNAPSHOT_DIR: 'db/migrations/meta',
    SNAPSHOT_SUFFIX: '_snapshot.json',
    OUTPUT_PATH: 'docs/db-schema.mmd'
} as const
