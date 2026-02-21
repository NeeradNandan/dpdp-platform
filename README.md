# Yojak — Compliance, Connected.

> योजक (Yojak) — Sanskrit for "connector". Connecting Indian businesses to DPDP Act compliance.

## Privacy-as-a-Service Compliance Platform

Automated DPDP Act 2023 compliance for Indian businesses. Consent management, data mapping, grievance redressal, and readiness scoring.

## Architecture

```
dpdp-platform/
├── src/                        # Next.js application
│   ├── app/
│   │   ├── (auth)/             # Login, signup pages
│   │   ├── (dashboard)/        # Protected dashboard pages
│   │   │   ├── dashboard/      # Overview with stats
│   │   │   ├── consent/        # Consent management
│   │   │   ├── data-mapping/   # PII discovery & mapping
│   │   │   ├── grievances/     # Grievance redressal
│   │   │   └── settings/       # Org settings, widget config
│   │   ├── (public)/           # Public PLG tools
│   │   │   └── tools/
│   │   │       ├── policy-generator/
│   │   │       ├── cookie-scanner/
│   │   │       └── readiness-score/
│   │   └── api/                # API routes
│   │       ├── consent/        # Consent lifecycle CRUD
│   │       ├── grievances/     # Grievance management
│   │       ├── data-mapping/   # Data map CRUD
│   │       └── tools/          # PLG tool APIs
│   ├── components/             # Reusable UI components
│   ├── i18n/                   # 22 Indian language support
│   ├── lib/                    # Supabase clients, utilities
│   └── types/                  # TypeScript type definitions
├── consent-widget/             # Embeddable consent banner (<10KB)
├── grievance-bot/              # Python FastAPI AI microservice
└── supabase/                   # Database schema with RLS
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes + Supabase Edge Functions |
| Database | Supabase (PostgreSQL) with Row-Level Security |
| Auth | Supabase Auth (MFA, RBAC, org management) |
| AI/NLP | Python FastAPI microservice for grievance classification |
| Consent Widget | Vanilla TypeScript, <10KB gzipped, zero dependencies |
| Hosting | Vercel (frontend) + AWS/Azure (data pipeline) |

## Getting Started

### Prerequisites

- Node.js >= 20.9.0
- Python >= 3.12 (for grievance bot)
- Supabase account (free tier works)

### 1. Next.js Application

```bash
cd dpdp-platform
cp .env.local.example .env.local  # Add your Supabase credentials
npm install
npm run dev
```

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Copy your project URL and anon key into `.env.local`
3. Run the schema in Supabase SQL Editor:

```bash
# Or use Supabase CLI
supabase db push < supabase/schema.sql
```

### 3. Consent Widget

```bash
cd consent-widget
npm install
npm run build
# Open demo.html to test locally
```

Embed on any website:
```html
<script
  src="https://cdn.yojak.ai/widget.js"
  data-org-id="your_org_id"
  data-api-endpoint="https://your-app.com/api/consent">
</script>
```

### 4. Grievance Bot (Python)

```bash
cd grievance-bot
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Or with Docker:
```bash
docker build -t grievance-bot .
docker run -p 8000:8000 grievance-bot
```

API docs available at http://localhost:8000/docs

## Features

### Consent Management
- Granular, purpose-specific consent collection per MeitY BRD
- Consent artifact generation (user ID, purpose ID, session ID, timestamp)
- Real-time validation API for consent status checks
- Immutable audit trail with 7-year retention
- Embeddable widget with dark mode and 22-language support

### Data Mapping
- Automated PII discovery across databases, APIs, and cloud storage
- Sensitivity classification (low/medium/high/critical)
- Encryption status tracking
- Data flow visualization
- Export compliance reports

### Grievance Redressal
- AI-powered classification (access, correction, erasure, portability, objection)
- Auto-generated DPDP Act-compliant responses (citing Sections 11, 12)
- 90-day SLA tracking with escalation alerts
- Unique case ID generation (GRV-2026-XXXXX)
- Bulk classification for high-volume platforms

### PLG Tools (Public, No Auth Required)
- **Privacy Policy Generator**: 4-step wizard generating DPDP-compliant policies
- **Cookie Scanner**: Simulated website scan with compliance scoring
- **Readiness Score**: 17-question assessment across 6 compliance categories

### Localization
- 22 scheduled Indian languages + English
- RTL support for Urdu, Sindhi, Kashmiri
- Translations for consent banners, privacy notices, and grievance forms

## DPDP Act Compliance

This platform addresses the key obligations under the Digital Personal Data Protection Act, 2023:

| Obligation | Feature |
|-----------|---------|
| Verifiable Consent (Section 6) | Consent widget + audit trail |
| Purpose Limitation (Section 5) | Purpose-specific consent management |
| Data Minimization | Data mapping with retention policies |
| Breach Notification (72 hours) | Alerting system + notification settings |
| Grievance Redressal (90 days) | AI bot + SLA tracking |
| Children's Data (Section 9) | Age verification + parental consent |
| 22 Language Notices | i18n system with all scheduled languages |
| Data Principal Rights (Section 11) | Self-service portal for access/erasure/correction |

## Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| Hook | Rs 999/mo | Consent banner, policy generator |
| Core | Rs 15,000/mo | Data mapping, PII discovery, consent |
| Scale | Rs 50,000/mo | AI grievance bot, full automation |

## License

Proprietary - All rights reserved.
