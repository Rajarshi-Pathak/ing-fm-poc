
---

# ING Financial Markets Deal Intelligence & Origination Platform

## Comprehensive Architecture & Technical Specification (`architecture.md`)

---

## 1. Executive Summary & Architectural Evolution

The ING Financial Markets Deal Intelligence Platform has transitioned from a legacy multi-tab Streamlit prototype into an enterprise-grade, single-pane-of-glass origination workspace.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            ING Financial Markets Deal Intelligence Platform                                 │
│                                                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                        Frontend Workspace (React 18 + Vite + Tailwind CSS)                            │  │
│  │                                                                                                       │  │
│  │  • Infinite Live Signal Marquee (Pause-on-hover & Smooth Click-to-Focus Card Highlighting)            │  │
│  │  • Deal Pipeline Dashboard (Client Data | Market Fixings | Live Match Scoring 0-100)                  │  │
│  │  • Interactive 10-Slide Pitchbook Canvas (Dynamic React Component Hierarchy, 1:1 PPTX Parity)         │  │
│  │  • Real-Time ING Copilot Sidebar (Context Memory, Natural Language State Mutations, MiFID II Audits)  │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                     │                                                       │
│                                                     ▼ (REST JSON API / Binary Streams)                      │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                        Backend Application Tier (FastAPI / Uvicorn Engine)                            │  │
│  │                                                                                                       │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │  │
│  │  │   /api/ingest   │  │/api/opportunities│ │/api/copilot/chat│  │ /api/compliance │  │/api/pitchbook/│ │  │
│  │  │  (Tri-Channel)  │  │ & Pipeline Sync │  │  (State Engine) │  │  /audit (MiFID) │  │ generate/pptx │ │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └───────────────┘ │  │
│  │           │                    │                    │                    │                   │           │  │
│  └───────────┼────────────────────┼────────────────────┼────────────────────┼───────────────────┼───────────┘  │
│              │                    │                    │                    │                   │              │
│              ▼                    ▼                    ▼                    ▼                   ▼              │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                Infrastructure, AI & Database Tier                                     │  │
│  │                                                                                                       │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────────────────┐  │  │
│  │  │   Gemini Pro    │  │  Gemini Flash   │  │   Python-PPTX   │  │    GCP Cloud SQL (PostgreSQL     │  │  │
│  │  │(Copilot Canvas  │  │(Signal Parser & │  │ (Deterministic  │  │     with pgvector extension)     │  │  │
│  │  │ & Structuring)  │  │  Rules Audit)   │  │  Deck Builder)  │  │                                  │  │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └──────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

---

## 2. Omni-Channel Ingestion & Signal Extraction Subsystem

The platform ingests unstructured data continuously from three corporate channels: Microsoft Teams Deal Channels, Corporate Treasury/DCM Inbound Emails, and Market News RSS feeds.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               Tri-Channel Ingestion & Processing Pipeline                                   │
│                                                                                                             │
│  ┌────────────────────────┐      ┌────────────────────────┐      ┌──────────────────────────────────────┐   │
│  │ Microsoft Teams Chats  │      │ Treasury Client Emails │      │  Financial & Regulatory RSS Feeds    │   │
│  └────────────────────────┘      └────────────────────────┘      └──────────────────────────────────────┘   │
│               │                               │                                     │                       │
│               └───────────────────────────────┼─────────────────────────────────────┘                       │
│                                               ▼                                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  STEP 1: Document Parsing & Text Normalization                                                        │  │
│  │  • PyPDF / python-docx / RFC 822 MIME parsers extract text content and communication metadata         │  │
│  │  • Chunking: Recursive character text splitting (Chunk size: 1000 chars, Overlap: 150 chars)          │  │
│  │  • Embeddings: Vertex AI / Gemini Embeddings generate 768-dimensional dense vector embeddings[cite: 1]        │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                               │                                                             │
│                                               ▼                                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  STEP 2: 🧠 Gemini Flash - Entity Recognition & Signal Extraction[cite: 1]                                     │  │
│  │  • Prompt: System extracts corporate client, catalyst trigger, financial urgency, and confidence[cite: 1]    │  │
│  │  • Output Schema:                                                                                     │  │
│  │    {                                                                                                  │  │
│  │      "client_id": "BASF",                                                                             │  │
│  │      "signal_type": "RATES_RISK",                                                                     │  │
│  │      "catalog_family": "DCM_REFI",                                                                    │  │
│  │      "urgency": "HIGH",                                                                               │  │
│  │      "confidence_pct": 94,                                                                            │  │
│  │      "headline": "Upcoming €3.2B debt maturities face repricing risk",                                │  │
│  │      "evidence_status": "Derived Signal"                                                              │  │
│  │    }                                                                                                  │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                               │                                                             │
│                                               ▼                                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  STEP 3: Database Storage & Ingestion Persistence (Cloud SQL pgvector)[cite: 1]                               │  │
│  │  • INSERT INTO ca.document_vector_chunks (chunk_id, client_id, source_channel, embedding, metadata)[cite: 1]   │  │
│  │  • INSERT INTO ca.digital_twin_signals (signal_id, client_id, signal_type, headline, confidence)[cite: 1]    │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                               │                                                             │
│                                               ▼                                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  STEP 4: Real-Time UI Broadcast (Continuous Live Feed Marquee)                                        │  │
│  │  • Signal automatically prepends to the live marquee feed at the top bar                             │  │
│  │  • Auto-calculates client opportunity priority score (0-100)                                          │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

---

## 3. Database Schema & Zero-Fabrication Data Engine

All presentation values are computed deterministically from PostgreSQL. Mock placeholders and artificial random numbers have been completely removed.

### 3.1 Primary Database Tables (Schema: `ca`)

#### 1. Client Master Data (`ca.dt_client_master`)



```sql
CREATE TABLE ca.dt_client_master (
    client_id VARCHAR(50) PRIMARY KEY,
    client_name VARCHAR(150) NOT NULL,
    industry_sector VARCHAR(100),
    country VARCHAR(50),
    credit_rating VARCHAR(20),      -- e.g. "Tier 1 (BBB+)"
    rm_name VARCHAR(100),            -- Relationship Manager e.g. "G. Romano"
    revenue NUMERIC(15,2),           -- in Millions (e.g. 65000.00 -> €65,000M)
    ebitda NUMERIC(15,2),            -- in Millions (e.g. 14300.00 -> €14,300M)
    net_debt NUMERIC(15,2),          -- in Millions (e.g. 16200.00 -> €16,200M)
    available_liquidity NUMERIC(15,2)-- in Millions (e.g. 7800.00  -> €7,800M)
);

```

#### 2. Corporate Debt Schedules (`ca.corporate_debt_schedules`)

```sql
CREATE TABLE ca.corporate_debt_schedules (
    tranche_id VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) REFERENCES ca.dt_client_master(client_id),
    instrument_type VARCHAR(50),    -- Senior Unsecured, EMTN, Revolver, Term Loan
    notional NUMERIC(15,2),          -- in Millions (e.g. 3000.00 -> €3,000M)
    currency VARCHAR(10) DEFAULT 'EUR',
    coupon_rate NUMERIC(5,3),        -- e.g. 1.750%
    maturity_date DATE NOT NULL,     -- e.g. 2027-06-15
    is_maturing_24m BOOLEAN DEFAULT TRUE,
    coupon_type VARCHAR(20)          -- Fixed vs Floating
);

```

#### 3. Live Market Fixings (`ca.market_fixings_live`)

```sql
CREATE TABLE ca.market_fixings_live (
    fixing_date DATE PRIMARY KEY,
    eur_swap_5y NUMERIC(5,3),        -- e.g. 2.620 (%)
    bund_yield_10y NUMERIC(5,3),     -- e.g. 2.610 (%)
    itraxx_europe_main NUMERIC(6,2), -- e.g. 58.00 (bps)
    eurusd_spot NUMERIC(6,4),        -- e.g. 1.0850
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

#### 4. Document Vector Chunks & Embeddings (`ca.document_vector_chunks`)



```sql
CREATE TABLE ca.document_vector_chunks (
    chunk_id VARCHAR(100) PRIMARY KEY,
    client_id VARCHAR(50) REFERENCES ca.dt_client_master(client_id),
    source_channel VARCHAR(50),     -- Teams, Email, RSS, PDF[cite: 1]
    source_name VARCHAR(200),[cite: 1]
    text_content TEXT NOT NULL,[cite: 1]
    structured_metadata JSONB,[cite: 1]
    embedding vector(768)           -- pgvector dense vector[cite: 1]
);

```

---

## 4. Opportunity Matching & Priority Scoring Algorithm

The matching engine dynamically cross-references active debt schedules against market fixing movements:

$$\text{Priority Score} = w_1 \cdot S_{\text{mat}} + w_2 \cdot S_{\text{curve}} + w_3 \cdot S_{\text{lev}} + w_4 \cdot S_{\text{sig}}$$

Where:

* **$S_{\text{mat}}$ (Maturity Proximity Score, 35%)**: Ratio of debt maturing in 24 months relative to total net debt.
* **$S_{\text{curve}}$ (Curve Opportunity Score, 25%)**: Historical spread of the 5Y EUR swap vs. its 12-month rolling mean.
* **$S_{\text{lev}}$ (Leverage Room, 20%)**: $\frac{\text{Net Debt}}{\text{EBITDA}}$. Ratios between $1.0\times$ and $2.5\times$ score highest for benchmark DCM issuances.
* **$S_{\text{sig}}$ (Signal Urgency Score, 20%)**: Ingested signal confidence percentage multiplied by urgency weight ($\text{High}=1.0, \text{Medium}=0.6, \text{Low}=0.3$).

---

## 5. Real-Time Deal Copilot: Context Hydration & State Mutation Protocol

To eliminate hallucinations and prevent cross-slide slippage, the `/api/copilot/chat` endpoint utilizes **Full Active Canvas Hydration**:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Copilot State Hydration & Dispatch Loop                                   │
│                                                                                                             │
│  User Request (e.g. "In Slide 4, change €3,000M to €1,000M")                                                │
│                                      │                                                                      │
│                                      ▼                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  BACKEND PAYLOAD HYDRATION (`main.py`)                                                                │  │
│  │  Constructs `active_deck_slides` dictionary containing exact live strings on screen:                  │  │
│  │  • slide_1_cover: { client_name, kicker, subtitle, rm_name, market_date }                             │  │
│  │  • slide_2_catalyst: { primary_market_trigger, window_of_opportunity, recommended_action }             │  │
│  │  • slide_4_financial_snapshot: { revenue, ebitda, net_debt, liquidity, maturity_wall_24m }           │  │
│  │  • slide_7_macro_backdrop: { swap_5y, bund_10y, itraxx_main }                                         │  │
│  │  • slide_8_term_sheet: { notional, spread, tenor }                                                    │  │
│  │  • current_deck_overrides: { ... } (any active session mutations)                                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                                                      │
│                                      ▼                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  🧠 GEMINI PRO - REASONING & STRUCTURED JSON EMISSION                                                 │  │
│  │                                                                                                       │  │
│  │  Evaluates request against active slides and generates response conforming to strict JSON contract:   │  │
│  │  {                                                                                                    │  │
│  │    "reply": "Updated the 24-month maturity wall on Slide 4 to €1,000M...",                            │  │
│  │    "overrides": {                                                                                     │  │
│  │      "maturity_wall_str": "€1,000M",                                                                  │  │
│  │      "debt_maturing_24m_str": "€1,000M"                                                               │  │
│  │    }                                                                                                  │  │
│  │  }                                                                                                    │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                                                      │
│                                      ▼                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  FRONTEND SYNCHRONIZATION REDUCER                                                                     │  │
│  │  1. React merges new `overrides` into `deckOverrides` state.                                          │  │
│  │  2. Active Slide 4 re-renders with €1,000M in real time.                                              │  │
│  │  3. `deckOverrides` are forwarded to `/api/pitchbook/export` ensuring the exported PPTX matches.      │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

---

## 6. Deterministic 10-Slide Pitchbook Specification (1:1 Canvas & PPTX Parity)

| Slide # | Slide Name | Screen & Slide Layout Structure | Data Source Key |
| --- | --- | --- | --- |
| **01** | **Cover Slide** | Dark blue header, ING Lion logo, deal category, client name, RM contact, CET date | `dt_client_master` |
| **02** | **Rate Risk Catalyst** | 3 Distinct Cards: Primary Market Trigger, Window of Opportunity, Recommended Action | `digital_twin_signals` |
| **03** | **Executive Summary** | 3 Strategic Columns: Rationale, Financing Window, Execution Benefits | Deal Synthesis Engine |
| **04** | **Capital Structure Snapshot** | 5 Key Financial Metric Cards: Revenue, EBITDA, Net Debt, Available Liquidity, 24M Maturity Wall | `corporate_debt_schedules` |
| **05** | **Debt & Swap Horizon** | Maturity Profile by tranche year (2026–2033), Fixed vs Floating debt composition | `corporate_debt_schedules` |
| **06** | **Rate Shift Sensitivity** | Payoff Corridor Matrix: $\pm 50\text{ bps}$ and $\pm 100\text{ bps}$ unhedged vs hedged cash interest cost | Financial Model |
| **07** | **Swap Curve Backdrop** | Macro benchmark cards: 5Y EUR Swap (2.62%), 10Y Bund (2.61%), iTraxx Europe Main (58 bps) | `market_fixings_live` |
| **08** | **Pre-Hedge Term Sheet** | Key Terms Grid: Issuer, Format, Notional (EUR 600M), Tenor (7Y), Indicative Pricing (Mid-Swap + 82 bps) | Deal Structuring Model |
| **09** | **Execution Roadmap** | 4-Stage Syndication Timeline: Structuring, Credit Approval, Bookbuilding, Settlement | Execution Engine |
| **10** | **Regulatory Disclosures** | Mandatory MiFID II & FINRA disclosures, Target Market classification, Indicative Caveats | Compliance Engine |

---

## 7. Regulatory & Compliance Architecture (`/api/compliance/audit`)

The compliance engine guarantees all client-facing materials satisfy **MiFID II (Directive 2014/65/EU)** and **FINRA Rule 2210**:

1. **Deterministic Promissory Pattern Screening**:
* Scans all slide copy against a restricted lexicon: `guarantee`, `risk-free`, `certain gain`, `eliminate risk`, `zero downside`.


2. **AI Regulatory Context Screening (Gemini Flash)**:


* Validates target market classification (Eligible Counterparties & Professional Clients only).
* Verifies required disclaimers for derivative overlays (Pre-Hedge IRS mark-to-market and break-cost risks).
* Checks market pricing validity stamps (ensures indicative spreads cite live market conditions).


3. **Automated One-Click Remediation**:
* If a disclaimer is missing, clicking **"Apply compliance recommendations"** injects mandatory MiFID II risk warnings into `deckOverrides.disclaimers`, updating both the canvas and the downloadable `.pptx`.



---

## 8. Complete API Endpoints Specification

| Method | Endpoint | Description | Request Payload | Response / Status |
| --- | --- | --- | --- | --- |
| `GET` | `/health` | Service health & Cloud SQL connectivity check

 | *None* | `{"status": "healthy", "region": "europe-west1"}`<br> |
| `POST` | `/api/ingest` | Multi-channel ingestion (Teams, Email, RSS, PDF)

 | `{"client_id": "...", "source_channel": "...", "text": "..."}`<br> | `{"chunk_id": "...", "detected_signals": [...]}`<br> |
| `GET` | `/api/signals/live` | Stream of live market & client signals for top marquee | *None* | `[{"id": 1, "type": "RATES", "headline": "..."}]` |
| `GET` | `/api/opportunities` | Surfaced pipeline opportunities with priority scores | `?sector=...&status=...` | `[{"id": "BASF", "score": 94, "name": "BASF SE"}]` |
| `GET` | `/api/pitchbook/bundle` | Complete 10-slide data payload for active client | `?client_id=BASF` | `{"client_name": "...", "slides": {...}}` |
| `POST` | `/api/copilot/chat` | Context-grounded Copilot chat & state mutator | `{"client_id": "...", "prompt": "...", "active_deck_slides": {...}}` | `{"reply": "...", "overrides": {...}}` |
| `POST` | `/api/compliance/audit` | Comprehensive MiFID II & FINRA compliance audit | `{"client_id": "...", "deck_state": {...}}` | `{"compliant": false, "flags": [...], "remediation": {...}}` |
| `POST` | `/api/pitchbook/export` | Generates deterministic PowerPoint presentation | `{"client_id": "...", "overrides": {...}}` | Binary `.pptx` stream

 |

---

## 9. Cloud-Native Deployment & Infrastructure Architecture

```
                                          Google Cloud Platform (europe-west1)
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                                                 │
 │   User Request                                                                                                  │
 │        │                                                                                                        │
 │        ▼                                                                                                        │
 │   ┌────────────────────────┐                                                                                    │
 │   │ Cloud Run Load Balancer│                                                                                    │
 │   └────────────────────────┘                                                                                    │
 │                │                                                                                                │
 │                ▼                                                                                                │
 │   ┌─────────────────────────────────────────────────────────────────────────┐                                   │
 │   │ Cloud Run Container Instance (2 vCPU, 2 GiB RAM, Port 8080)             │                                   │
 │   │                                                                         │                                   │
 │   │  ┌──────────────────────────────────┐ ┌──────────────────────────────┐  │                                   │
 │   │  │ Frontend Engine: Nginx / Vite    │ │ Backend Engine: FastAPI      │  │                                   │
 │   │  │ Static assets, React 18 Canvas   │ │ Uvicorn async workers        │  │                                   │
 │   │  └──────────────────────────────────┘ └──────────────────────────────┘  │                                   │
 │   └─────────────────────────────────────────────────────────────────────────┘                                   │
 │                     │                                            │                                              │
 │                     ▼ (Unix Domain Socket Proxy)                 ▼ (Google GenAI SDK)                           │
 │   ┌─────────────────────────────────────────┐     ┌──────────────────────────────────────────────────┐          │
 │   │ GCP Cloud SQL (PostgreSQL 15 + pgvector)│     │ Vertex AI / Gemini API Tier                      │          │
 │   │ • dt_client_master                      │     │ • Gemini 1.5 Pro: Structuring & Copilot Chat     │          │
 │   │ • corporate_debt_schedules              │     │ • Gemini 1.5 Flash: Signal Ingestion & MiFID     │          │
 │   │ • market_fixings_live                   │     │ • Text-Embedding-004: 768-dim Vector Search[cite: 1]    │          │
 │   └─────────────────────────────────────────┘     └──────────────────────────────────────────────────┘          │
 │                                                                                                                 │
 └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

---

### Key Takeaway

This updated specification fully captures the current codebase:

* **Hybrid Intelligence Engine**: Gemini Flash for rapid signal parsing and regulatory screening; Gemini Pro for structuring analysis and natural language state mutations; Python-PPTX for deterministic deck generation without hallucination.


* **Strict State Parity**: Complete synchronization across the PostgreSQL data layer, the interactive React preview canvas, the Copilot context memory, and the downloadable PowerPoint presentation.
 |

---

## 10. Key Architectural Principles

1. **Deterministic Data Parity (Zero Mock Data)**: Every balance sheet metric, debt tranche maturity, swap fix, and credit spread is sourced directly from PostgreSQL. The interactive frontend preview and backend PowerPoint generator share the exact same underlying calculations and state overrides.
2. **Context-Grounded Copilot with State Mutation**: By injecting the complete `active_deck_slides` dictionary into the LLM context, Copilot eliminates hallucination and conversational drift. It serves dual functions: explaining complex corporate finance mechanics and deterministically mutating the presentation state via structured JSON outputs.
3. **Embedded Regulatory Compliance by Design**: Compliance is not an afterthought; MiFID II suitability, FINRA communications standards, and mandatory risk disclosures are baked into the core structuring and export workflow.
4. **Resilient Cloud-Native Deployment**: Containerized multi-stage Docker builds on **GCP Cloud Run** (`europe-west1`) paired with **Cloud SQL** (PostgreSQL with `pgvector`), ensuring low-latency execution and high availability for enterprise banking workloads.