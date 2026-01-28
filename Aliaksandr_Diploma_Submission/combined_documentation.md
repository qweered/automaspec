# Abstract

**Automaspec: AI-Powered Test Specification and Automation Platform**

**Keywords:** *software testing, test automation, artificial intelligence, requirements management, CI/CD integration*

The object of this bachelor project is a platform for managing test specifications and automating software testing processes. The goal of the project is to create a unified system that centralizes test documentation, generates test code using artificial intelligence, and integrates with CI/CD pipelines to provide real-time test status visibility.

The main tasks include: development of hierarchical test organization structure, implementation of AI-powered test code generation for Vitest framework, creation of multi-tenant organization management with role-based access control, integration with GitHub Actions for automatic test result synchronization, and development of adaptive user interface for desktop, tablet, and mobile devices.

The subject of research encompasses AI-powered test automation, requirements traceability, and unification of test documentation and execution results. The methodology employs modern web development using Next.js 16 with React 19 and TypeScript, AI integration through Vercel AI SDK, type-safe architecture with oRPC and Drizzle ORM, responsive design with Tailwind CSS v4, and containerization using Docker.

A full-featured web application was developed that addresses test documentation fragmentation. The platform enables teams to manage test specifications, generate test code using AI assistance, and track execution status through automated CI/CD integration. The implementation demonstrates that a unified platform can reduce manual test creation overhead, improve test coverage visibility, and eliminate the disconnect between documentation and execution results.

\pagebreak

# Introduction

Modern software teams use many tools for planning and quality control: issue trackers, wikis, spreadsheets, CI/CD reports, and source-code repositories. In practice, test documentation and actual automated tests often live in different places: requirements are described in one system, checklists in another, test run results in CI, and test code in the repository. This fragmentation makes it hard to maintain a single source of truth, increases maintenance cost, and reduces visibility of test coverage.

The topic is relevant for QA engineers and developers who need a centralized structure for test specifications and mechanisms that speed up writing automated tests. Large language models (LLMs) further enable automation of routine work, including generating test code from requirements written in natural language.

The goal of the project is to develop Automaspec, a web platform for managing test specifications and accelerating automated test creation.

To achieve this goal, the following tasks were completed:
- analyze the domain, users, and existing solutions
- define functional and non-functional requirements
- design the data model and core entities: organization, folder, spec, requirement, test
- implement a UI for managing the hierarchy of test artifacts and their statuses
- implement the server-side API and organization-based authorization
- integrate AI-based Vitest test generation and store the produced test code
- implement analytics views (status summaries and reports)
- prepare the development environment, testing, and build pipeline

The object of the project is the process of creating and maintaining test documentation and automated tests in software development teams. The subject of the project is methods and software tools for centralized storage of test specifications, requirements, and tests, as well as AI integration to speed up test creation.

Methods and tools used: comparative analysis of existing solutions, relational data modeling, full-stack web development with Next.js, type-safe APIs with oRPC, ORM usage with Drizzle, unit/component testing with Vitest, and analysis of testing results.

\pagebreak

# Main Part

## 1. Analytical Part

### 1.1 Problem and Motivation

The core problem is the lack of a unified structure and a single place to store test specifications, requirements, and automated tests, and to connect them to actual execution results. When documentation is scattered, typical outcomes follow: duplicated requirements, outdated documents, limited coverage visibility, regression growth, and increased effort to keep tests and documentation consistent.

Automaspec addresses this by providing:
- a single workspace context per organization
- a hierarchy: folders → specs → requirements → tests
- status tracking and aggregation for quick progress assessment
- an AI assistant to generate tests and accelerate routine work

### 1.2 Analysis of Existing Solutions

Test management and documentation are commonly handled using a combination of tools rather than a single platform. The most typical setups include:
- issue trackers (requirements and acceptance criteria)
- documentation tools (test plans, checklists, knowledge bases)
- test runners and CI systems (execution results)
- source code repositories (automated tests)

This tool fragmentation has a clear benefit: each tool is optimized for its domain. However, it creates a structural gap between what should be tested (specifications and requirements) and what is actually tested (test code and CI results). When teams try to close this gap manually, they spend time on synchronization and still risk inconsistencies.

The test management market comprises several established commercial solutions. TestRail has strong market presence and extensive integrations but lacks AI generation capabilities and has cost scaling issues. Zephyr integrates well with the Jira ecosystem but has complex configuration requirements and legacy architecture. Xray offers deep Jira integration but requires Jira and has no standalone deployment option. qTest provides enterprise-grade scalability but has high total cost of ownership. Qase has a modern interface and API-first architecture but limited AI-assisted features.

Automaspec focuses on a narrower and more explicit scope: it provides an opinionated hierarchy for test artifacts and keeps the relationship between requirements and tests as a first-class concept. Instead of replacing issue trackers, it acts as a central workspace for test artifacts and their statuses, while providing optional AI assistance for generating initial test implementations.

### 1.3 Target Audience and Scenarios

Primary users:
- QA engineers: create specs, describe requirements, validate status, review tests
- developers: create tests, use AI-generated scaffolding, keep artifacts up to date
- team leads: review coverage state, manage organizations and access

Key scenarios:
- create a folder/spec structure for a project
- add requirements to a spec and attach tests
- generate tests from requirements and save the code
- view analytics: counts, status distribution, overall progress

### 1.4 System Requirements and Constraints

Functional requirements:
- user registration and authentication
- organizations and roles (Owner/Admin/Member)
- management of folders, specs, requirements, and tests
- storing test code and statuses
- analytics summaries per spec and per organization
- integration with external AI providers for test generation

Non-functional requirements:
- type-safe API contracts and boundary validation
- usable UI on desktop and mobile devices
- reproducible build and deployment (including containerization)
- unit/component tests for critical logic

Constraints and assumptions:
- the product is designed as a web application that must work in modern browsers
- the database layer should remain simple to operate in both local and hosted environments
- the API surface should be type-safe and testable
- the UI should be accessible and consistent, avoiding custom components that are hard to maintain
- integration tests that require a live database must be optional

## 2. Requirements Specification

### 2.1 Functional Requirements

**Authentication and organizations:**
- users can register and sign in with credentials
- a user can create multiple organizations
- organization membership defines access to all resources inside the organization
- roles define the permission level: Owner, Admin, Member
- owners can manage organization settings and members

**Test artifact management:**
- users can create folders and nested folders
- users can create specs inside folders
- users can define requirements inside a spec with ordering support
- users can attach one or more tests to a requirement
- each test has a framework identifier and a status

**AI-assisted workflows:**
- users can request AI generation of a test implementation from a requirement description
- generated test code is persisted and can be edited
- the system can support different providers via a unified API layer

**Analytics:**
- a spec provides an aggregated summary of its tests (status breakdown and total count)
- organization-level views provide summary metrics for dashboards
- analytics must reflect updates when tests or requirements change

### 2.2 Non-Functional Requirements

**Reliability and correctness:**
- input validation must be enforced on API boundaries
- test artifacts must remain consistent (no orphaned references)
- all destructive actions must be scoped to the active organization and role

**Performance:**

| Requirement | Target | Measurement Method |
|-------------|--------|-------------------|
| Page load time | < 2 seconds | Lighthouse |
| API response time | < 500ms (95th percentile) | Monitoring |
| AI generation time | < 60 seconds | User testing |
| Concurrent users | 50 per organization | Load testing |

**Security:**
- all sensitive operations must require an authenticated session
- organization boundaries must be enforced consistently
- secrets must not be stored in the repository and must be supplied via environment variables
- email/password authentication via Better Auth
- role-based access control (Owner, Admin, Member)
- HTTPS/TLS 1.3 for all data in transit
- bcrypt password hashing
- rate limiting (100 requests/min per user)
- SQL injection protection via parameterized queries

**Maintainability:**
- end-to-end type-safety across API contracts and consumers
- consistent code style and automated checks in hooks and CI
- modular structure that allows adding new features without large refactors

**Accessibility:**
- WCAG 2.1 Level AA compliance
- keyboard navigation support
- screen reader compatibility
- responsive design (mobile, tablet, desktop)

**Reliability targets:**

| Metric | Target |
|--------|--------|
| Uptime | 99% |
| Recovery time | < 4 hours |
| Data backup | Daily |

**Compatibility:**

| Platform/Browser | Minimum Version |
|------------------|-----------------|
| Chrome | Latest 2 versions |
| Firefox | Latest 2 versions |
| Safari | Latest 2 versions |
| Edge | Latest 2 versions |
| Mobile | iOS 15+ / Android 12+ |

## 3. Design Part

### 3.1 High-Level Architecture

Automaspec is implemented as a single full-stack Next.js application that serves both the UI and server APIs. The client communicates with the server via type-safe oRPC contracts and caches data via TanStack Query. Persistent storage is provided by libSQL (Turso) accessed through Drizzle ORM.

### 3.2 Component Decomposition

The system can be described using the following logical components:
- presentation layer: pages, forms, and interactive UI components
- application layer: feature-level orchestration (actions, commands, query/mutation flows)
- API layer: oRPC routers and contracts for type-safe client/server communication
- persistence layer: Drizzle schema and query functions targeting libSQL/Turso
- external integration layer: AI providers, authentication provider, and optional CI artifacts

The choice of a single Next.js project for both UI and API reduces deployment complexity. It also allows sharing types and validation schemas across server and client, which is critical for predictable behavior and faster iteration.

### 3.3 Data Model

The system includes user and organization entities and the following test-management entities:
- `testFolder`: hierarchical grouping with parent references for nesting
- `testSpec`: a test specification with aggregated statuses and counters
- `testRequirement`: a requirement inside a spec with ordering support
- `test`: an individual test with code, framework identifier, and status

The model supports multi-user access within an organization, and roles define permissions for managing resources.

### 3.4 Data Consistency and Aggregation

A key design decision is storing both raw artifacts (tests and their statuses) and aggregated values at the spec level. Aggregation provides fast summary views without scanning all tests on every page render. Typical aggregated fields include:
- total number of tests in a spec
- status breakdown (passed, failed, skipped, pending, etc.)

To keep aggregated values correct, mutations that modify tests or requirements must update the corresponding spec summaries. This approach reduces query complexity for the dashboard, at the cost of more careful mutation logic.

### 3.5 Security and Access Control

Authentication is implemented via Better Auth. Authorization is based on the active organization context and member role. Input validation is performed with Zod schemas at API boundaries.

## 4. Technology Stack

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| Frontend | React | 19.2.3 | Mature ecosystem, SSR-ready, great DX with hooks and concurrent features |
| UI Framework | Tailwind CSS + Radix UI | 4.1.18 / latest | Utility-first styling with accessible headless primitives |
| Framework | Next.js | 16.1.1 | Full-stack React framework: app router, SSR/ISR, file routing |
| Database | libSQL (Turso) | - | Lightweight, SQLite-compatible, serverless-friendly |
| ORM | Drizzle ORM | 0.45.1 | Type-safe SQL, lightweight migrations, excellent TS support |
| API | oRPC | 1.13.2 | Type-safe RPC with automatic OpenAPI generation |
| AI SDK | Vercel AI SDK | Latest | Clean abstractions for LLM integration with streaming support |
| Authentication | Better Auth | Latest | Session-based auth with organization support |
| Deployment | Docker + Docker Compose | - | Reproducible builds, parity across environments |
| CI/CD | GitHub Actions | - | Automated testing and deployment |
| Hosting | Vercel | - | Native Next.js optimization, zero-config deployment |

### 4.1 Key Technical Decisions

**Next.js as Full-Stack Framework:**
The decision to use Next.js (App Router) for both UI and server endpoints was driven by the need for a unified stack for SSR/ISR, API routes, and modern React features with strong production tooling. This provides first-class SSR/ISR and routing with minimal boilerplate, strong developer experience with fast refresh and built-in image/fonts handling, and seamless React 19 features and ecosystem support. The trade-off is that framework conventions and server actions have a learning curve, but the cohesive tooling and performance features outweigh this concern.

**Drizzle ORM + libSQL (Turso):**
The choice of Drizzle ORM with libSQL was driven by the need for a type-safe, lightweight relational layer that fits serverless-friendly workflows. This combination provides type-safe SQL with excellent TypeScript integration, simple explicit migrations via drizzle-kit, and low-operations hosting suitable for quick iteration. The trade-off is fewer advanced relational features than larger RDBMS systems, but the minimal overhead and fast local development compensate.

**oRPC for Type-Safe APIs:**
Using oRPC with Zod schemas for API contracts was driven by the need for type-safe API communication with automatic documentation generation. The approach provides end-to-end type safety from server to client, automatic OpenAPI 3.0 specification generation, and zero documentation drift between code and docs. The trade-off is requiring specific oRPC and Zod knowledge to extend, but the type safety and automatic docs justify this.

## 5. Implementation

### 5.1 Frontend Architecture

The frontend is built using Next.js 16 App Router with React 19 and TypeScript, providing a Single Page Application (SPA) experience with server-side optimization where needed.

**Key architectural decisions include:**
- Component-Based UI using Tailwind CSS v4 for styling and Radix UI primitives for accessible, reusable components
- Server State managed by TanStack Query to handle caching, synchronization, and optimistic updates
- Local UI State managed via React hooks (useState, useMemo, useRef)
- Auth/Organization State integrated using Better Auth client hooks
- API Integration utilizing oRPC for type-safe, end-to-end communication with safeClient for direct calls and orpc for reactive data fetching
- Form Management using TanStack Form with Zod validation for robust, type-safe form handling

**Project structure:**
```
app/
├── (organizations)/    # Organization selection and creation flows
├── ai/                 # AI Assistant page
├── analytics/          # Analytics dashboard with Recharts
├── dashboard/          # Main workspace for specs and folders
├── login/              # Authentication (Sign in / Sign up)
├── profile/            # User settings and API keys
├── layout.tsx          # Root layout with providers
└── providers.tsx       # Context providers (Query, Theme, Auth)
components/
├── ui/                 # Reusable Radix UI-based primitives (shadcn-like)
├── loader.tsx          # Shared loading component
└── theme-provider.tsx  # Dark/Light mode management
lib/
├── orpc/               # oRPC client configuration
├── query/              # TanStack Query client and utilities
├── shared/             # Shared auth and form logic
└── types.ts            # Shared TypeScript definitions
```

### 5.2 UI and Interaction Model

The application follows a workspace model: once a user selects an organization, all subsequent navigation and operations are scoped to it. The main workspace consists of:
- a left-side hierarchical tree for folders/specs navigation
- a main content area for spec details, requirements, and tests
- a header area for organization switching and user actions

The hierarchy tree enables quick navigation with minimal context switching. For mobile devices, the hierarchy is accessible via a drawer or alternative navigation patterns.

### 5.3 Adaptive UI Implementation

Automaspec provides a seamless user experience across a wide range of devices, including mobile phones, tablets, and desktops. The application features complex data visualizations, hierarchical test structures, and AI-driven interfaces that remain functional and accessible on all screen sizes.

A mobile-first, responsive design approach was adopted using Tailwind CSS v4 and Next.js. The layout dynamically adapts to screen size using Tailwind's breakpoint system (sm, md, lg, xl). Radix UI primitives are used for accessible components like sheets/drawers for mobile navigation and dialogs.

**Responsive breakpoints:**
- **Desktop (1024px+):** Multi-panel navigation with persistent sidebar. Supports 4K and Ultrawide displays with max-width containers.
- **Tablet (768px-1023px):** Collapsed sidebars and multi-column grids.
- **Mobile (375px-767px):** Single-column layouts with drawer-based navigation and bottom tab bars.

**Key implementation features:**
- Tailwind CSS v4 for utility-first styling with built-in responsive utilities and the size-* utility over separate width/height pairs
- Radix UI Primitives providing accessible components like sheets and drawers for mobile navigation
- next-themes package enabling system-aware light and dark mode support
- Flexible grid and flexbox layouts using relative units (rem, em, %) and Tailwind's responsive utilities
- Lucide React for scalable SVG icons that scale cleanly without quality loss on high-DPI screens

**Accessibility compliance:**
- WCAG 2.1 Level AA compliance
- Keyboard navigation support via Radix UI primitives
- Screen reader compatibility with proper ARIA roles
- Interactive element sizes at 44px minimum for touch targets
- Contrast ratios meeting the 4.5:1 minimum requirement

### 5.4 Test Hierarchy Management

The key functionality is managing a hierarchy of test artifacts. Users build a folder tree, place specs inside folders, create requirements within specs, and attach tests to requirements. Specs maintain aggregated statuses to quickly assess overall testing progress.

The hierarchical test organization uses four levels:
- **Folders** serve as top-level containers for organizing test suites by feature, module, or team, supporting nested folder structures, drag-and-drop reordering, and folder-level status aggregation
- **Specs** represent test specifications with rich text descriptions, status aggregation from contained requirements, and metadata tracking including created date, last updated, and owner
- **Requirements** contain detailed acceptance criteria with user story format support, priority and status tracking, requirement-level test linking, and ordering support for stable presentation
- **Tests** contain generated code linked to requirements with Vitest framework compatibility, code editing and review capabilities, export functionality, and status tracking (passed, failed, pending, skipped)

### 5.5 API Design and Data Flow

The API is designed around typed contracts using oRPC. Each operation defines input and output schemas, enabling:
- consistent validation rules for all clients
- predictable error handling
- reduced integration bugs when refactoring data structures

**API structure:**
```
orpc/
├── contracts/           # API Definitions (source of truth)
│   ├── tests.ts         # Test management contracts
│   ├── ai.ts            # AI assistant contracts
│   └── analytics.ts     # Organization metrics contracts
├── routes/              # Business logic implementation
└── middleware.ts        # Auth & Organization guards
app/
└── (backend)/rpc/       # RPC Entry point
    └── [...all]/route.ts # OpenAPIHandler & Scalar configuration
```

**API Documentation:**
- Interactive Documentation served at `/rpc/docs` using Scalar UI
- OpenAPI Specification automatically generated at `/rpc/spec`
- Type Safety with end-to-end type safety from Zod schemas to TypeScript types

The application follows a straightforward full-stack flow designed for predictable behavior and easy debugging:
- the UI triggers a query or mutation
- the client calls the typed API surface
- the server validates inputs, applies authorization, and executes domain logic
- the persistence layer reads/writes data through a single DB connection abstraction
- the server returns a typed result
- the client updates UI state and, when needed, invalidates caches

This flow is intentionally uniform across features. A consistent pattern reduces accidental security gaps and makes the project easier to extend.

**Client-side caching and synchronization:**
The client uses a query cache to reduce redundant network calls and keep the UI responsive. A typical pattern is:
- queries are keyed by organization and feature scope
- mutations update the server state
- after a successful mutation, affected queries are invalidated

This model prevents stale analytics summaries after changes to requirements or tests. It also avoids heavy "refetch everything" strategies by focusing on invalidating only the relevant cache keys.

### 5.6 AI-Based Test Generation

To accelerate automated test creation, the system integrates AI providers through the Vercel AI SDK. Users write a requirement, then the system generates Vitest test code and stores it. The generated code can be edited and used as a starting point for production-grade tests.

The generation flow can be described as:
- user selects a requirement and requests generation
- the server constructs a prompt based on requirement text and target framework (Vitest)
- the AI provider returns a candidate test implementation through streaming
- the system stores the code and sets an initial status for the test
- the spec aggregates are recalculated/updated

This workflow emphasizes practicality: the generated code is treated as scaffolding that reduces repetitive work, not as a fully trusted final artifact. Quality assurance includes prompt engineering for consistent output quality, rate limiting at 100 requests per minute per user, error handling and fallback mechanisms, and code validation before saving.

The architecture supports multiple AI providers including OpenRouter and Google Gemini, with provider fallback for reliability, streaming responses for real-time feedback, and configurable prompts for different test patterns.

### 5.7 Analytics and Reporting

The UI provides per-spec status summaries and organization-level aggregates. This allows teams to see which areas are covered, which parts are blocked, and which requirements need attention.

Real-time status tracking covers four status types: passed for successful execution shown in green, failed for execution failures shown in red, pending for tests not yet executed shown in yellow, and skipped for intentionally skipped tests shown in gray. Aggregation logic rolls up individual test statuses to requirement level, requirement statuses to spec level, and spec statuses to folder level, with organization-wide metrics available in the analytics dashboard.

The analytics layer is intentionally lightweight. It focuses on counts and status breakdowns that provide immediate project insight. Future analytics extensions can include:
- historical trends across test runs
- per-folder aggregates
- progress tracking over time

## 6. Database Design and Migrations

### 6.1 Design Principles

The database model is based on a small set of core principles:
- organizational isolation: every domain entity is scoped to an organization
- explicit hierarchy: folder → spec → requirement → test relationships are stored directly
- predictable ordering: requirements use an ordering field to keep stable presentation order
- minimal coupling: the schema avoids unnecessary cross-links that would complicate migrations

These principles are aligned with the main use case: fast navigation and consistent representation of testing artifacts in the UI.

### 6.2 Database Schema

The database uses Drizzle ORM with libSQL (Turso) for type-safe database operations. The schema is designed to support multi-tenancy, hierarchical organization, and efficient querying.

**Core tables:**
- **organizations** - stores organization data with isolation guarantees, supporting multiple organizations per user
- **users** - email/password authentication via Better Auth with password hashing handled by the authentication library
- **organization_members** - implements role-based access control with roles Owner, Admin, and Member
- **test_folders** - hierarchical structure via parent_id foreign key with unlimited nesting depth and order_index for drag-and-drop reordering
- **test_specs** - links to parent folder via folder_id, contains specification metadata and descriptions, with status field aggregating from child requirements
- **requirements** - detailed requirement definitions with acceptance criteria, linked to parent spec via spec_id, with ordering support
- **tests** - stores generated Vitest test code, links to parent requirement, with status tracking and code versioning through generated_at timestamp

### 6.3 Storage of Test Code and Status

Each test stores:
- a framework identifier, allowing future extension to other frameworks
- a status representing current execution or review state
- the generated or manually edited test code

This design allows the platform to act as a repository of test implementations that are directly connected to requirements. The code is not meant to replace the project's source repository, but rather to provide a structured and searchable storage for test artifacts and their current state.

### 6.4 Migration Workflow

The migration workflow ensures that the schema remains consistent across environments:
- schema changes are described in a type-safe manner
- migrations are generated and applied through scripts (drizzle-kit)
- local development uses the same migration sequence as production
- version-controlled migration files with rollback support

This reduces the risk of "works on my machine" differences and makes it easier for reviewers to reproduce the database state.

**Database features:**
- Type Safety: Drizzle ORM provides end-to-end type safety from schema to queries with TypeScript types automatically generated from schema definitions
- Data Integrity: Foreign key constraints ensure referential integrity with cascade delete rules for hierarchical data
- Performance: Indexed foreign keys for fast joins with composite indexes on frequently queried fields
- Multi-Tenancy: Organization-level data isolation with all queries scoped by organization_id

## 7. Security, Privacy, and Reliability

### 7.1 Threat Model Overview

The system operates in a multi-tenant mode where organizations share the same application deployment. The most critical security requirements are:
- authentication must be enforced for all non-public actions
- organization boundaries must prevent data leakage
- role permissions must be respected for all write operations

### 7.2 Enforcement Strategy

The enforcement strategy relies on:
- session-based authentication via Better Auth
- organization context attached to requests
- validation at the API boundary using Zod schemas
- consistent server-side authorization checks for organization-scoped resources

**Multi-tenant correctness** is achieved by enforcing organization scoping at multiple layers:
- the active organization is part of the session context
- server-side operations reject access when organization context is missing
- queries and mutations always filter by organization id

This reduces the risk of accidental cross-organization access even if new endpoints are added later.

### 7.3 User Roles

| Role | Permissions | Access Level |
|------|-------------|--------------|
| Owner | Full control: manage members, billing, delete org | Full |
| Admin | Create/edit/delete specs, folders, invite members | Full (except org deletion) |
| Member | View and edit test specs and requirements | Limited |

### 7.4 Reliability Considerations

Reliability is supported by:
- deterministic database migrations
- automated tests for key UI and logic paths
- strict linting and formatting checks to reduce accidental regressions

Optional integration tests are separated because they require external connectivity. This keeps the default test suite stable and fast.

## 8. Testing and Quality

### 8.1 Testing Strategy

The project uses Vitest and React Testing Library. The repository contains unit and component tests, and optional integration tests when a reachable database is available. Current test run summary: 53 test suites and 119 tests; all tests pass.

The testing strategy uses several layers:
- unit tests for pure logic and data transformations
- component tests for interactive UI behavior
- optional integration tests that require database connectivity
- optional end-to-end tests for critical user flows (Playwright)

This layered approach helps keep most tests fast and reliable while still allowing deeper validation when infrastructure is available.

### 8.2 What is Covered by Tests

The test suite focuses on validating behaviors that are most likely to regress:
- UI behavior for creating and editing test artifacts
- data flow and state synchronization after mutations
- correctness of aggregation logic for spec status summaries

The tests are designed to be deterministic and to minimize reliance on external services. Where database connectivity is required, integration tests are optional and can be enabled only when the environment is available.

### 8.3 Why Testing Matters for This Project

This project combines several sources of complexity:
- a hierarchical domain model
- organization and role-based authorization
- cache invalidation and UI synchronization
- AI-assisted generation that produces variable outputs

Automated tests provide evidence that core flows remain correct as new features are introduced and as the data model evolves.

### 8.4 Code Quality

Code quality is enforced with static analysis and formatting (Oxlint, Oxfmt) and git hooks (Lefthook) to run checks before commits.

- **Linting:** Oxlint with type-aware linting and deny warnings configuration
- **Formatting:** Oxfmt with 4 spaces indentation, no semicolons, single quotes
- **Type Checking:** TypeScript compiler in strict mode

## 9. CI/CD Integration

### 9.1 Pipeline Architecture

The CI/CD pipeline is implemented using GitHub Actions for orchestration and Vercel for deployment, supplemented by Docker for containerization references. The pipeline consists of five main jobs that run in a specific order:

1. **Security Audit** and **Quality Checks** run in parallel (no dependencies)
2. **E2E Tests** depends on both Security Audit and Quality Checks completing successfully
3. **Deploy Preview** runs after E2E Tests for Pull Requests to `dev` or `main`
4. **Deploy Production** runs after E2E Tests for pushes to `main`

**Pipeline jobs:**
- **Security Audit** - Runs `pnpm audit` to check for vulnerable dependencies
- **Quality Checks** - Runs typecheck, tests, lint, and format checks via `pnpm quality-checks`
- **E2E Tests** - Runs Playwright end-to-end tests
- **Deploy Preview** - Deploys to Vercel Preview on Pull Requests
- **Deploy Production** - Deploys to Vercel Production on pushes to `main`

### 9.2 Quality Gates

- Type Checking: TypeScript compilation check
- Unit Tests: Vitest with coverage reporting
- Linting: Oxlint for code quality
- Formatting: Oxfmt for code consistency
- E2E Tests: Playwright for integration testing
- Security Audit: Dependency vulnerability scanning

### 9.3 Deployment Strategy

| Environment | Trigger | URL Pattern |
|-------------|---------|-------------|
| Preview | Pull Request to dev/main | `automaspec-git-{branch}.vercel.app` |
| Production | Push to main branch | `automaspec.vercel.app` |
| Local | Manual start | `localhost:3000` |

The deployment process follows these steps: code pushed to repository triggers GitHub Actions workflow, quality gates execute, build process creates optimized Next.js standalone output, Vercel CLI deploys pre-built artifacts, zero-downtime atomic deployment swaps old and new versions, and health checks verify successful deployment.

### 9.4 Artifact Management

To facilitate troubleshooting and provide a permanent record of code quality, the pipeline captures and stores the following artifacts:

| Artifact Name | Job | Content | Retention |
|---------------|-----|---------|-----------|
| security-audit-report | Security Audit | JSON and text reports from pnpm audit | 90 days |
| coverage-report | Quality Checks | Vitest HTML coverage reports | 90 days |
| quality-checks-logs | Quality Checks | Console output from all checks | 90 days |
| playwright-report | E2E Tests | HTML report with test steps and logs | 30 days |
| e2e-test-results | E2E Tests | Traces, videos, and screenshots | 30 days |
| vercel-build-artifacts | Deploy | Build output and logs | 7-30 days |

## 10. Containerization

### 10.1 Docker Implementation

The application uses Docker with multi-stage builds for optimized container images:
- **Base Stage:** `node:24-alpine` base image
- **Deps Stage:** Dependency installation
- **Builder Stage:** Application build
- **Runner Stage:** Production-ready image with only necessary files

Key features include Alpine Linux for lightweight base image (~5MB), Next.js Standalone for reduced image size (~100MB vs ~1GB), non-root user for security (runs as `nextjs` user UID 1001), built-in health check endpoints, and volume support for persistent database files.

### 10.2 Docker Compose

Separate configurations exist for development and production environments.

**Development configuration** uses lower resource limits (0.5 CPU, 512MB RAM), volume mounts for hot-reload development, environment variables from .env.local, and no restart policies for manual control.

**Production configuration** uses higher resource limits (2 CPU, 2GB RAM), restart policy always for automatic recovery, health checks for container monitoring, resource constraints to prevent resource exhaustion, and optimized settings for production workloads.

**Key features:**
- Isolated network (automaspec-network) for container communication
- Persistent volumes for database files (/app/db)
- Environment variable injection via .env files
- Port mapping for external access (3000:3000)
- Health check endpoints for orchestration

### 10.3 Build Artifacts and Reproducibility

The build produces a standalone server bundle for production usage. This keeps deployments predictable and avoids differences between local and production runtime behavior.

Containerization is used to package the application consistently. The overall goal is to allow the reviewer (or a future maintainer) to reproduce the production environment with minimal manual steps.

### 10.4 Configuration and Secrets

The system relies on environment variables for configuration, including:
- database connection settings
- authentication-related values
- optional AI provider keys

This approach keeps secrets out of version control and makes it possible to run the same codebase in multiple environments without modifications.

## 11. User Guide

### 11.1 Getting Started

Users open the web application, sign up or sign in, create an organization, and build a folder/spec structure. For each spec, they add requirements and tests, and optionally generate tests with AI. A dedicated analytics section provides coverage and status summaries.

**System requirements:**

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Browser | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ | Latest version |
| Screen Resolution | 1280x720 | 1920x1080 |
| Internet | Required | Stable broadband |
| Device | Desktop, Tablet, or Mobile | Desktop for full experience |

**First launch steps:**
1. Registration/Login: Sign up with email and password or sign in with existing credentials
2. Organization Setup: Create or select an organization
3. Main Dashboard: Access folder tree, spec management, and AI features

### 11.2 Typical Workflow

- create an organization and invite members
- create folders for products/modules/features
- add specs as test plans for features
- define requirements and attach tests
- generate test scaffolding with AI when needed
- monitor analytics to understand coverage and gaps

### 11.3 Common Workflows

**Setting Up a New Test Suite:**
1. Create top-level folders for major features or modules
2. Define test specifications for each folder
3. Break down requirements with acceptance criteria
4. Generate tests using AI assistance
5. Export and integrate test code into project structure

**Daily Test Management:**
1. Review analytics dashboard for test health
2. Investigate failures by drilling down through hierarchy
3. Update test status manually or wait for CI/CD updates
4. Add new tests for new features using AI generation

**Team Collaboration:**
1. Invite team members with appropriate roles
2. Organize work using folders by sprint, feature, or team
3. Review and approve AI-generated tests
4. Track progress using analytics dashboards

## 12. Project Management and Process

### 12.1 Development Approach

The project was implemented iteratively, focusing on delivering a working vertical slice early and then expanding functionality:
- initial slice: authentication, organization context, and basic CRUD
- domain features: folder/spec/requirement/test hierarchy and editing flows
- AI features: generation of test code and storage in domain entities
- analytics: aggregated status views and counts for dashboards
- hardening: tests, hooks, and deployment scripts

This approach reduces delivery risk because each stage produces a testable system with clear boundaries.

### 12.2 Risks and Mitigation

Key risks and mitigations:
- authorization bugs: mitigated by enforcing organization context consistently and validating inputs
- inconsistent aggregates: mitigated by updating aggregates in the same mutation flow as raw entities
- variability of AI output: mitigated by treating generated tests as editable scaffolding
- time constraints: mitigated by prioritizing end-to-end completeness over niche features

## 13. Results and Evaluation

### 13.1 Achievement of Goals

The project goal was to build a web platform that centralizes test specifications and accelerates automated test creation. The implemented system achieves this goal by providing an organization-scoped workspace, a strict hierarchy of artifacts (folders → specs → requirements → tests), status aggregation for quick coverage visibility, and an AI-assisted workflow that generates Vitest test code from requirement descriptions.

From a reviewer perspective, the main result is a coherent end-to-end workflow that connects documentation and implementation artifacts. Requirements and tests are stored in a structured form, and dashboards provide summarized status information for both individual specs and organization-level overviews.

### 13.2 Key Deliverables

The diploma project produced the following deliverables:
- a production-ready full-stack web application implementing the core features
- a documented data model and database schema supporting organizations and test artifacts
- an AI integration layer that can work with multiple providers
- automated tests and a quality enforcement setup (linting/formatting/hooks)
- containerization and scripts for repeatable builds and deployments

### 13.3 Quality Evidence

Quality is supported by:
- type-safe API contracts and validation at boundaries
- automated tests that cover UI and application logic
- consistent formatting and linting enforced via hooks and scripts

At the time of preparing this documentation, the repository test run reports 53 test suites and 119 tests, all passing.

### 13.4 Technical Successes

- **Type-safe full-stack:** Using oRPC with Zod provided end-to-end type safety from database to UI, catching errors at compile time
- **Modern React patterns:** React 19 with Next.js App Router delivered excellent performance with Server Components
- **Drizzle ORM:** Type-safe SQL with simple migrations made database work predictable and maintainable
- **AI integration:** Vercel AI SDK provided clean abstractions for LLM integration with streaming support
- **Tailwind CSS v4:** Utility-first styling accelerated UI development significantly

### 13.5 Process Successes

- **Iterative development:** Building features incrementally allowed for continuous testing and refinement
- **Code quality automation:** Lefthook pre-commit hooks enforced linting/formatting consistently
- **Component-based architecture:** Reusable UI primitives (via Shadcn/Radix) sped up development
- **Documentation as code:** Keeping docs in Markdown alongside code improved maintainability

### 13.6 Challenges Encountered

1. **AI Generation Quality** - Initial AI-generated tests had inconsistent quality. Impact: Required multiple iterations of prompt engineering. Resolution: Developed refined prompts with context injection and example patterns.

2. **Database Migration Complexity** - Schema changes required careful migration handling with Turso. Impact: Some deployment delays during development. Resolution: Adopted stricter migration practices and testing workflow.

3. **Authentication Edge Cases** - Better Auth organization plugin had undocumented behaviors. Impact: Extra time debugging session handling. Resolution: Deep-dived into source code and created custom middleware.

### 13.7 Technical Debt and Known Issues

| ID | Issue | Severity | Description | Potential Fix |
|----|-------|----------|-------------|---------------|
| TD-001 | Large spec trees performance | Medium | Tree rendering slows with 100+ items | Implement virtualization (react-window) |
| TD-002 | No offline support | Low | App requires active connection | Add PWA features and offline caching |
| TD-003 | Limited test history | Low | Only current status stored | Add test run history table |
| TD-004 | No undo/redo | Low | Accidental deletions are permanent | Implement soft delete and undo system |

## 14. Limitations and Future Work

### 14.1 Current Limitations

The current implementation is intentionally scoped to remain feasible within the diploma timeframe. This results in several limitations:
- analytics focus on status aggregation and counts rather than historical trends across runs
- AI-generated tests are treated as scaffolding and require human review and adaptation
- integrations with external systems (issue trackers, CI providers) can be expanded but are not the primary focus
- large organizations with very deep hierarchies may require additional performance optimizations and pagination

### 14.2 What Did Not Go As Planned

| Planned | Actual Outcome | Cause | Impact |
|---------|---------------|-------|--------|
| Multi-framework support | Vitest only | Time constraints, complexity | Medium |
| Jira integration | Not implemented | Scope prioritization | Low |
| Advanced analytics | Basic metrics only | Feature prioritization | Low |
| Mobile native app | Responsive web only | Resource constraints | Low |

### 14.3 Future Improvements

**High Priority:**
1. **Multi-Framework Support** - Add Jest, Playwright, and Cypress code generation. Value: Broader user adoption, framework flexibility. Effort: Medium (2-3 weeks per framework).
2. **CI/CD Result Sync** - Automatic test status updates from GitHub Actions runs. Value: Real-time visibility without manual updates. Effort: Medium (webhook handling, parsing logic).

**Medium Priority:**
3. **Version History** - Track changes to specs and requirements over time. Value: Audit trail, ability to revert changes.
4. **Bulk Operations** - Select and move/copy multiple specs at once. Value: Improved efficiency for large reorganizations.

**Nice to Have:**
5. Custom report generation with PDF export
6. Integration with Jira/Linear for issue linking
7. Real-time collaborative editing (like Google Docs)
8. AI-powered test suggestions based on code changes

## 15. Lessons Learned

### 15.1 Technical Lessons

| Lesson | Context | Application |
|--------|---------|-------------|
| Start with type safety | oRPC caught many bugs at compile time | Always choose typed solutions over dynamic |
| Invest in dev experience | Lefthook, Drizzle Studio saved hours | Good tooling pays dividends quickly |
| AI prompts need iteration | First attempts at test generation were poor | Budget time for prompt engineering |
| Mobile-first is worth it | Responsive design was straightforward | Always start with smallest viewport |

### 15.2 Process Lessons

| Lesson | Context | Application |
|--------|---------|-------------|
| Scope ruthlessly | Many nice-to-haves were cut | Define MVP early and stick to it |
| Document decisions | ADR format proved valuable | Record why, not just what |
| Test early | Late-discovered bugs were costly | Write tests alongside features |

### 15.3 What Would Be Done Differently

| Area | Current Approach | What Would Change | Why |
|------|-----------------|-------------------|-----|
| Planning | Feature-based roadmap | More user story driven | Better alignment with actual needs |
| Database | Single SQLite database | Consider Postgres for scale | More features, better tooling |
| Testing | Manual + unit tests | More E2E tests earlier | Catch integration issues sooner |
| AI | Single provider | Multi-provider from start | Better fallback and cost optimization |

### 15.4 Personal Growth

Skills developed during the project:
- Next.js App Router: from beginner to advanced level
- AI/LLM Integration: from beginner to intermediate level
- Type-safe APIs (oRPC): from none to intermediate level
- Drizzle ORM: from beginner to advanced level
- Responsive Design: from intermediate to advanced level

# Conclusion

As part of the diploma project, Automaspec was developed as a platform for centralized test specification management and faster automated test creation. The system supports multi-user organization workspaces, hierarchical test artifacts, test storage and editing, AI-based test code generation, and analytics views. A reproducible development environment and quality checks were set up, and a test suite was implemented.

The implemented platform confirms that combining centralized documentation management, AI-powered test code generation, and automatic CI/CD synchronization can significantly improve testing process efficiency in development teams.

Key project conclusions:
- Type safety is critical for preventing development errors
- AI integration requires careful prompt engineering and quality validation
- Iterative development with MVP focus ships features faster than pursuing perfection
- Documenting architectural decisions maintains valuable context throughout development

Future improvements include multi-framework test support, expanded analytics (run history and trends), deeper CI/CD integration, and import/export of specifications.

The project is ready for use in real-world conditions and can be extended with additional features according to user needs.

\pagebreak
