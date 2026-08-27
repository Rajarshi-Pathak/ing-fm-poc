Existing `architecture.md` contains several **critical architectural drifts** that no longer reflect the production implementation:

1. **Tab 4 Slide Structure (Outdated 7-Slide Layout vs. 8-Module Institutional Library)**:
* *Outdated in Doc:* Describes generic slides (Slide 2 Section Divider, Slide 3 Bar Chart, Slide 5 Three Columns).
* *Actual Implementation:* Uses the **Wholesale Master Slide Library** (`CORE-01` Dark Slate Cover $\rightarrow$ `CORE-02` Situation Update $\rightarrow$ `CORE-04` Corporate Overview $\rightarrow$ `DEBT-01` Spread Profile $\rightarrow$ `DEBT-04` Refinancing Economics Table $\rightarrow$ `CORE-09` Why ING Credentials $\rightarrow$ `CORE-10` Next Steps Roadmap $\rightarrow$ `CORE-11` Regulatory Disclaimers).


2. **Database Schema & Relational Grounding (Missing Financial Multi-Table Joins)**:
* *Outdated in Doc:* Lists only `ca.document_vector_chunks`, `ca.digital_twin_signals`, and `ca.dt_client_master`.
* *Actual Implementation:* Queries `ca.client_master`, `ca.ext_company_filings`, `ca.debt_maturity_schedule`, and `ca.ext_deals` via `LEFT JOIN LATERAL` to supply audited revenue, net debt, and legacy coupon metrics without hardcoding.


3. **Tab 4 Delivery Architecture (Buffer Reset & `send_file`)**:
* *Outdated in Doc:* Omits the binary stream handling (`io.BytesIO`, `out.seek(0)`, `send_file`, and Streamlit session state scoping per `client_id`).



---

### Clean, Fully-Updated `architecture.md`

Replace your current `architecture.md` with this synchronized, production-accurate specification:

```markdown
# Architecture Specification: ING Financial Markets AI Platform

---

## 1. High-Level System Overview


```

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          ING Financial Markets AI Platform                             │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                               Frontend (gui.py)                                  │  │
│  │                      Streamlit Multi-Tab Workspace                               │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                               Backend (app.py)                                   │  │
│  │                           Flask REST Microservice                                │  │
│  │                                                                                  │  │
│  │  ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌─────────────────────────┐  │  │
│  │  │   TAB 1    │   │   TAB 2    │   │   TAB 3    │   │          TAB 4          │  │  │
│  │  │  /ingest   │   │  /match-   │   │  /check-   │   │   /generate-pitchbook   │  │  │
│  │  │            │   │opportunity │   │ compliance │   │  (Relational + Master)  │  │  │
│  │  └────────────┘   └────────────┘   └────────────┘   └─────────────────────────┘  │  │
│  │         │               │                │                       │               │  │
│  └─────────┼───────────────┼────────────────┼───────────────────────┼───────────────┘  │
│            │               │                │                       │                  │
│            ▼               ▼                ▼                       ▼                  │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                               External Services                                  │  │
│  │                                                                                  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │  │
│  │  │ Gemini Flash │  │  Gemini Pro  │  │ Gemini Flash │  │   Cloud SQL Postgres │  │  │
│  │  │ (Extraction) │  │ (Reasoning)  │  │ (Compliance) │  │ (pgvector + Tables)  │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘

```

---

## 2. Tab 1: Omni-Channel Signal Ingestion Flow (`/ingest`)


```

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          TAB 1: Omni-Channel Signal Ingestion                          │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ INPUT: Touchpoint Selection (Document / RSS Wire / Teams / Treasury Email)       │  │
│  │ • client_id, source_channel, source_name, text_content                           │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ STEP 1: Dense Vectorization                                                      │  │
│  │ • text-embedding-004 generates 768-dim dense embedding vector                    │  │
│  │ • Formats array as string for PostgreSQL: `'[-0.014, 0.038, ...]'`               │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ STEP 2: Gemini 2.5 Flash Structured Signal Extraction                            │  │
│  │ • Extracts: executive_summary, detected_signals array                            │  │
│  │ • Per-Signal Attributes: catalog_family, signal_type, trigger, metric_identified,│  │
│  │   confidence_pct, urgency (High|Medium|Low), evidence_type                       │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ STEP 3: Catalog & Schema Normalization                                           │  │
│  │ • Validates catalog_family against official 11 Wholesale Service Families        │  │
│  │ • Enforces JSON schema constraints and sanitizes output                          │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ STEP 4: Dual Cloud SQL Persistence                                               │  │
│  │ • INSERT INTO ca.document_vector_chunks (chunk_id, client_id, embedding, ...)     │  │
│  │ • INSERT INTO ca.digital_twin_signals (client_id, catalog_family, metric, ...)   │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ OUTPUT: Returns chunk_id, extraction metadata, and visual signal cards to UI     │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘

```

---

## 3. Tab 2: Opportunity Discovery & Catalog Matching (`/match-opportunity`)


```

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               TAB 2: Opportunity Discovery                             │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ INPUT: client_id                                                                 │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ STEP 1: Context Fabric Retrieval                                                 │  │
│  │ • Queries ca.digital_twin_signals for grounded exposure metrics                  │  │
│  │ • Queries ca.client_master for client legal entity, sector, tier, HQ             │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ STEP 2: pgvector Cosine Similarity Search                                        │  │
│  │ • Embeds composite query and runs: `embedding <=> query_vector::vector LIMIT 10`  │  │
│  │ • Retrieves top corroborating evidence chunks across all ingested touchpoints     │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ STEP 3: Gemini 2.5 Pro Institutional Reasoning Engine                            │  │
│  │ • Evaluates cumulative evidence against 45+ Wholesale Banking Decision Rules     │  │
│  │ • Identifies Primary Opportunity (catalog_family, product, priority score 0-100) │  │
│  │ • Classifies Lifecycle Status: Hypothesis | Client-Validated Discovery | Mandate │  │
│  │ • Formulates Deal Rationale, Discovery Gaps, and Secondary Cross-Asset Plays     │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ OUTPUT: Opportunity Assessment Payload returned to Streamlit Session State       │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘

```

---

## 4. Tab 3: Regulatory Compliance Gateway (`/check-compliance`)


```

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TAB 3: Regulatory Compliance Gateway                            │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ INPUT: client_id, product, editable narrative bullets array                      │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ STEP 1: Deterministic Pattern Inspection                                         │  │
│  │ • Scans for absolute/promissory phrasing ("guarantee", "risk-free", "zero risk") │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ STEP 2: Gemini 2.5 Flash FINRA Rule 2210 & MiFID II Screening                     │  │
│  │ • Audits commercial narrative for non-compliant claims & unhedged risk omissions │  │
│  │ • Generates side-by-side suggested replacements (Original vs. Compliant)         │  │
│  │ • Formulates required product-specific risk warnings                             │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ STEP 3: Auto-Remediation & Presentation Locking                                  │  │
│  │ • One-click replacement applies AI edits directly to active bullet array         │  │
│  │ • User locks vetted bullets into `pitchbook_bullets_{client_id}` session state   │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘

```

---

## 5. Tab 4: Institutional Pitchbook Assembly (`/generate-pitchbook`)


```

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TAB 4: Master Pitchbook Rendering                               │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ INPUT: client_id, title, locked compliance bullets, product opportunity context  │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ STEP 1: Dynamic Relational Multi-Table SQL Join (Zero Hardcoding)                │  │
│  │ • ca.client_master: Client name, franchise tier, headquarters, RM name           │  │
│  │ • ca.ext_company_filings (LATERAL): Audited revenue, net debt, liquidity scale   │  │
│  │ • ca.debt_maturity_schedule (LATERAL): Maturing debt wall (€M) & legacy coupon % │  │
│  │ • ca.digital_twin_signals (LATERAL): Grounded trigger synthesis from live wires  │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ STEP 2: Master Slide Library Construction (16:9 Widescreen python-pptx)          │  │
│  │                                                                                  │  │
│  │  [CORE-01] Cover Slide        -> Dark Slate (#0C112B), Title, Domicile, Date     │  │
│  │  [CORE-02] Situation Update   -> Rationale, Discovery Gaps, 3 Key KPI Cards     │  │
│  │  [CORE-04] Company Overview   -> Reported Revenue, Franchise Tier, HQ, Moats    │  │
│  │  [DEBT-01] Spread Profile     -> Secondary Spreads, 2026/2027 Refi Step-Up Cards │  │
│  │  [DEBT-04] Refi Economics     -> Baseline vs. Stressed Table (-€ P&L Impact/Yr)  │  │
│  │  [GREEN-01] ESG Framework     -> (Conditional) Greenium & Taxonomy Eligibility   │  │
│  │  [CORE-09] Why ING            -> Sector Track Record & Dedicated Coverage Matrix │  │
│  │  [CORE-10] Next Steps         -> 3-Phase Milestone Implementation Roadmap        │  │
│  │  [CORE-11] Disclaimer         -> FINRA/MiFID II Mandatory Marketing Notice       │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ STEP 3: Brand Geometry & Binary Streaming Delivery                               │  │
│  │ • Proportional logo scaling (`width=Inches(0.85)`) without aspect distortion     │  │
│  │ • In-Memory Buffer Finalization (`prs.save(out)` -> `out.seek(0)`)               │  │
│  │ • Flask `send_file()` streams binary attachment to Streamlit Session State       │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘

```

---

## 6. Cloud SQL Relational & Vector Schema


```

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                            CLOUD SQL POSTGRESQL SCHEMA (ca)                            │
│                                                                                        │
│  ┌─────────────────────────────────┐   ┌────────────────────────────────────────────┐  │
│  │ ca.document_vector_chunks       │   │ ca.digital_twin_signals                    │  │
│  │ • chunk_id (PK, BIGSERIAL)      │   │ • signal_id (PK, VARCHAR)                  │  │
│  │ • client_id (VARCHAR)           │   │ • client_id (VARCHAR)                      │  │
│  │ • source_channel (VARCHAR)      │   │ • catalog_family (VARCHAR)                 │  │
│  │ • source_name (VARCHAR)         │   │ • signal_type (VARCHAR)                    │  │
│  │ • text_content (TEXT)           │   │ • metric_identified (TEXT)                 │  │
│  │ • structured_metadata (JSONB)   │   │ • trigger_summary (TEXT)                   │  │
│  │ • embedding (VECTOR(768))       │   │ • confidence_pct (INT)                     │  │
│  └─────────────────────────────────┘   └────────────────────────────────────────────┘  │
│                                                                                        │
│  ┌─────────────────────────────────┐   ┌────────────────────────────────────────────┐  │
│  │ ca.client_master                │   │ ca.debt_maturity_schedule                  │  │
│  │ • client_id (PK, VARCHAR)       │   │ • isin (PK, VARCHAR)                       │  │
│  │ • client_name (VARCHAR)         │   │ • client_id (VARCHAR)                      │  │
│  │ • tier (VARCHAR)                │   │ • instrument_type (VARCHAR)                │  │
│  │ • hq_country (VARCHAR)          │   │ • amount_eur_m (NUMERIC)                   │  │
│  │ • revenue_eur_m (NUMERIC)       │   │ • maturity_year (INT)                      │  │
│  │ • rm_name (VARCHAR)             │   │ • coupon_rate_pct (NUMERIC)                │  │
│  └─────────────────────────────────┘   └────────────────────────────────────────────┘  │
│                                                                                        │
│  ┌─────────────────────────────────┐   ┌────────────────────────────────────────────┐  │
│  │ ca.ext_company_filings          │   │ ca.ext_deals                               │  │
│  │ • filing_id (PK, VARCHAR)       │   │ • deal_id (PK, VARCHAR)                    │  │
│  │ • client_id (VARCHAR)           │   │ • client_id (VARCHAR)                      │  │
│  │ • reporting_period (VARCHAR)    │   │ • deal_type (VARCHAR)                      │  │
│  │ • net_debt_eur_m (NUMERIC)      │   │ • volume_eur_m (NUMERIC)                   │  │
│  │ • liquidity_eur_m (NUMERIC)     │   │ • role (VARCHAR)                           │  │
│  └─────────────────────────────────┘   └────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘

```

---

## 7. Core Technical Design Principles

1. **Deterministic Relational Grounding:** Audited financial metrics (reported revenues, ISIN debt schedules, coupons, and client tiering) are retrieved dynamically via SQL from Cloud SQL reference tables. LLMs are never used to guess balance sheet scale.
2. **Deterministic PPTX Compilation (Zero AI Latency in Tab 4):** Presentation compilation is executed directly via `python-pptx` without LLM calls, ensuring sub-second rendering, consistent formatting, and no runtime API costs.
3. **Strict Client State Isolation:** Front-end widgets and session state buffers (`pitchbook_bytes_{client_id}`) are dynamically keyed per active counterparty, eliminating cross-client cache collisions and expired download streams.
4. **Defensive Compliance Gateway:** All front-office marketing pitches pass automated inspection against FINRA Rule 2210 and MiFID II guidelines to eliminate promissory language prior to slide deck compilation.

```