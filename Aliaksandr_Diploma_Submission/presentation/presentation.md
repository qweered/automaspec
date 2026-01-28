---
marp: false
size: 16:9
paginate: true
backgroundColor: #ffffff
math: katex
style: |
  section {
    font-family: 'Inter', sans-serif;
    font-size: 24px;
    padding: 40px;
    color: #2d3748;
    background-color: #ffffff;
  }
  h1 { color: #1a202c; font-size: 1.8em; margin-bottom: 0.5em; }
  h2 { color: #2d3748; font-size: 1.4em; margin-bottom: 0.5em; }
  h3 { color: #4a5568; font-size: 1.1em; }
  strong { color: #3182ce; }
  ul { margin-bottom: 0.5em; padding-left: 1em; }
  li { margin-bottom: 0.3em; }
  p { margin-bottom: 0.6em; }
  img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  
  /* Pretty Blockquote */
  blockquote {
    background: #f7fafc;
    border-left: 6px solid #3182ce;
    margin: 1em 0;
    padding: 0.8em 1.2em;
    font-style: italic;
    color: #4a5568;
    border-radius: 4px;
  }

  /* Table Styling */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1em;
    font-size: 0.9em;
  }
  th {
    background: #edf2f7;
    color: #2d3748;
    font-weight: bold;
    text-align: left;
    padding: 12px;
    border-bottom: 2px solid #cbd5e0;
  }
  td {
    padding: 10px;
    border-bottom: 1px solid #e2e8f0;
  }
  tr:nth-child(even) { background-color: #f7fafc; }

  /* Title Slide */
  section.lead {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    text-align: left;
    background: linear-gradient(135deg, #ebf8ff 0%, #ffffff 100%);
  }
---
<!-- _class: lead -->

# **AutomaSpec**
## AI-Powered Test Specification Management System
<br>

**Student:** Aliaksandr Samatyia
**Group:** Js
**Supervisor:** Volha Kuznetsova
**Date:** 2026

---

# The Problem: Testing Fragmentation

**Who suffers?**
QA Engineers, Developers, and Product Managers in fast-paced teams.

**The Reality:**
- ❌ **Disconnected Workflows:** Requirements live in docs, tests live in code. Links are manual and fragile.
- ❌ **Visibility Black Holes:** Stakeholders cannot verify if a specific requirement is actually covered by a passing test.
- ❌ **Stale Documentation:** Test cases often lag behind code changes, leading to false confidence.
- ❌ **Manual & Slow:** Meaningful reporting requires manual spreadsheet updates.

> *"We don't know if we broke the feature until users tell us."*

---

# The Solution: Unified Test Lifecycle

**How AutomaSpec solves it:**
AutomaSpec acts as the **central nervous system** for quality assurance, syncing code, tests, and requirements.

**Key Capabilities:**
- 🔗 **Deep Integration:** Automatically syncs test results to requirements.
- 📋 **Live Traceability:** Requirement $\leftrightarrow$ Test Spec $\leftrightarrow$ Test Result. All linked.
- 🤖 **AI Assistant:** Chat with your test suite to generate cases or explain failures.

**Why it's different:**
Unlike erratic spreadsheets or siloed Jira plugins, AutomaSpec represents the **state of truth directly from CI/CD**.

---

# Demo: Main Dashboard

**Centralized Test Management:**
Organized view of projects, folders, and test specifications.

- **Hierarchical Structure:** Navigate through organizations and projects.
- **Quick Access:** Tree view of folders and test specs.
- **Status Overview:** Visual indicators for test execution status.

![w:100% center](../docs/assets/screenshots/prod-folder-components-desktop.png)

---

# Demo: AI Assistant

**What it does:**
Generate test cases, explain failures, and answer questions about requirements and coverage.

**Example flow:**
- Ask for missing cases by requirement or feature.
- Get suggested scenarios with acceptance criteria.
- Export to a test spec and link to the requirement.

> *"Generate edge cases for password reset and link them to requirement AUTH-12."*

---

# Demo: Settings

**Configuration Hub:**
Central place to manage user preferences, api keys, and settings.

- **Profile & Access:** Update user profile, roles, and permissions.
- **API Keys:** Manage API keys for CI/CD webhook integration.
- **Settings:** Choose theming, delete account, etc.

---

# High-Level Architecture

**Key Components:**

- **Frontend:** Next.js 16 (React 19), Tailwind CSS, Framer Motion.
- **Backend:** Serverless Functions via Vercel, ORPC for type-safe contracts.
- **Database:** Distributed SQLite (Turso) managed via Drizzle ORM.
- **AI Integration:** Vercel AI SDK into Google/OpenAI.

![bg right:55% fit](../docs/assets/diagrams/architecture.png)

---

# Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16** | Full-stack React framework with App Router |
| **Language** | **TypeScript** | Strict type safety across full stack |
| **Database** | **Turso (LibSQL)** | Edge-compatible distributed SQLite |
| **ORM** | **Drizzle ORM** | Type-safe SQL builder and schema management |
| **API** | **oRPC** | End-to-end type-safe API contracts with OpenAPI generation |
| **Testing** | **Vitest** | Unit testing framework |
| **AI** | **Vercel AI SDK** | Integration with LLM providers (Google Gemini/OpenRouter) |

---

# Results

**✅ Project Checklist**
- [x] **Core MVP:** Requirement management & Test syncing.
- [x] **Architecture:** Scalable Next.js 16 + Serverless setup.
- [x] **Quality:** CI/CD pipeline with 100% E2E critical flow coverage.
- [x] **Documentation:** Auto-generated API Reference.

![bg right:50% fit](../docs/assets/screenshots/prod-analytics-desktop.png)

---

<!-- _class: lead -->

# Q&A

**Production:** [automaspec.vercel.app](https://automaspec.vercel.app)
**Repository:** [github.com/qweered/automaspec](https://github.com/qweered/automaspec)
**Documentation:** `/rpc/docs` (Scalar)

<br>

## Thank You!

**Student:** Aliaksandr Samatyia
**Contact:** aliaksandr.samatyia@stud.esdc.lt

