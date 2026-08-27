# Financial Markets Deal Origination Engine: Signals, Opportunities & Pitchbook Lifecycle

## 1. Executive Summary & Architectural Overview

Modern Wholesale Banking and Financial Markets (FM) origination requires continuous monitoring of corporate balance sheets, dynamic macro market curves, and real-time qualitative touchpoints. This platform employs a **two-stage hybrid architecture** combining deterministic financial logic with large language model (LLM) semantic intelligence.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       HYBRID INGESTION & ORIGINATION ENGINE                            │
├────────────────────────────────────────────────────┬───────────────────────────────────────────────────┤
│          UNSTRUCTURED DATA SOURCES                 │              STRUCTURED DATA SOURCES              │
│  • Google News RSS Feeds                           │  • Core Client Master (Ratings, Country, RM)      │
│  • Treasury Emails & Inbound Inquiries             │  • Balance Sheet & Debt Schedules (Maturity Wall) │
│  • MS Teams Coverage Transcripts                   │  • Live Market Fixings (EUR Swaps, Bunds, Spreads)│
│  • House Views (PDF / PPTX Research)               │  • Historical Pricing & Pre-hedging Models        │
└─────────────────────────┬──────────────────────────┴─────────────────────────┬─────────────────────────┘
                          │                                                    │
                          ▼                                                    ▼
             [ LLM Extraction (Vertex AI) ]                      [ Deterministic SQL & Logic ]
                          │                                                    │
                          └─────────────────────────┬──────────────────────────┘
                                                    │
                                                    ▼
                                  [ PostgreSQL Storage & Calibration ]
                                  • ca.digital_twin_signals
                                  • ca.ca_opportunity_scoring
                                                    │
                                                    ▼
                             ┌──────────────────────────────────────────────┐
                             │       DOWNSTREAM PRESENTATION LAYER          │
                             ├──────────────────────────────────────────────┤
                             │ 1. Live Horizontal Signal Feed               │
                             │ 2. Priority Today Flight-Deck (Top Mandates) │
                             │ 3. 13-Client Cohort Opportunity Feed         │
                             │ 4. Pitchbook Engine (Preview & Generated)    │
                             └──────────────────────────────────────────────┘

```

---

## 2. Signal Identification Pipeline

### Multi-Channel Ingestion Gateways

Unstructured corporate touchpoints flow into a single unified entry point in the application layer:

* **Live Google News RSS:** Real-time industry news feeds capturing corporate capex announcements, regulatory updates, or rating agency reviews.
* **Coverage Transcripts (MS Teams / Notes):** Internal dialogue between syndicate desks, relationship managers, and sector coverage heads.
* **Treasury Direct Inbound:** Formal requests, rollover dialogues, and funding intention notices from corporate CFOs or treasurers.
* **Institutional House Views (PDF / PPTX):** Ingestion of research slides and syndicate summaries parsed via `pypdf` and `python-pptx`.

### Semantic Extraction & Parameterization

Unstructured inputs are processed by **Gemini 2.5 Flash** on Vertex AI under a strict JSON extraction schema. The model extracts:

* **Catalog Family:** `Financing/Capital Markets`, `Interest Rate`, `Foreign Exchange`, or `Sustainable Finance`.
* **Signal Type & Urgency:** Categorization into `REFINANCING`, `LIQUIDITY`, `HEDGING`, `COVENANT`, or `M&A`, with an urgency flag (`High`, `Medium`, `Low`).
* **Metric Extraction:** Extraction of notional values (e.g., *€750M Green EMTN, €500M Pre-Hedge Overlay*), pricing concession spreads (e.g., *-5 bps Greenium*), and capex goals (*€4.0B capex*).

### Database Persistence

Extracted signals are committed to `ca.digital_twin_signals`:

```sql
INSERT INTO ca.digital_twin_signals (
    signal_id, client_id, catalog_family, signal_type,
    metric_identified, trigger_summary, metric_value,
    description, confidence_pct, urgency, created_at
) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW());

```

This write updates the horizontal **Live Signal Feed** across the application.

---

## 3. Opportunity Discovery & Prioritization Engine

### The Hybrid Discovery Method

Opportunity formulation is governed by deterministic business logic rather than pure LLM generation, ensuring mathematical accuracy and full regulatory compliance:

| Dimension | LLM Functionality | Deterministic Code / DB Functionality |
| --- | --- | --- |
| **Data Ingestion** | Extracts qualitative triggers from unstructured text. | Ingests structured balance sheets, debt walls, and CSA limits. |
| **Catalog Mapping** | Synthesizes deal narrative into "Why Now" rationales. | Matches verified debt schedules against approved FM products. |
| **Financial Math** | *Bypassed to prevent hallucinations.* | Computes exact maturity walls, floating exposure, and fee pools. |
| **Model Risk Governance** | Generates institutional text summaries. | Calculates auditable, deterministic priority scores ($0–100$). |

### Multi-Factor Priority Scoring

Each client opportunity is evaluated across three weighted dimensions to compute a single **Match Confidence Score**:

$$\text{Priority Score} = w_1 \cdot \text{Propensity Score} + w_2 \cdot \text{Value Score} + w_3 \cdot \text{Signal Urgency}$$

1. **Propensity Score ($0–100$):** Measures the structural likelihood of execution based on the proximity of debt maturity walls (e.g., $<24\text{ months}$ to rollover) or unhedged floating interest rate risk (e.g., hedge coverage $<60\%$).
2. **Value / Commercial Score ($0–100$):** Sizes the gross bank revenue opportunity (`est_revenue_eur_000`), benchmark notional, and strategic relationship tier.
3. **Signal Urgency & Market Window ($0–100$):** Incorporates real-time rate volatility, swap easing, credit spread compression (e.g., iTraxx Main at 58 bps), and new board approvals.

### Score Calibration & Priority Today Ranking

Scores update atomically in `ca.ca_opportunity_scoring`:

* **Score $\ge 85$ $\rightarrow$ High Priority** (e.g., **BASF SE at 92 | €4.2M Fee**, **Enel S.p.A. at 94 | €5.5M Fee**).
* **Score $70–84$ $\rightarrow$ Medium Priority** (e.g., secondary refinancings or medium-term pre-hedges).
* **Score $< 70$ $\rightarrow$ Low / Monitoring Priority**.

The **Priority Today** flight-deck dynamically groups and displays the top 4 distinct mandates to direct coverage and trading desk resources to high-conviction transactions.

---

## 4. Pitchbook Creation: UI Preview & Document Generation

The platform bridges commercial opportunity discovery directly into client-ready presentation materials through two synchronized modalities:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PITCHBOOK DATA AGGREGATION                      │
├──────────────────────────────────┬─────────────────────────────────────┤
│  Structured Balance Sheet Data   │  Unstructured Trigger Insights      │
│  • Total Debt & Maturity Wall    │  • Board Approval Transcripts       │
│  • Liquidity & Net Debt Profile  │  • ESG & Taxonomy Alignment Themes  │
│  • Live Swaps, Bunds, Spreads    │  • "Why Now" Treasury Rationale     │
└──────────────────────────────────┴─────────────────────────────────────┘
                                   │
                                   ▼
        ┌──────────────────────────────────────────────────────┐
        │ 1. Interactive UI Modal Preview (FastAPI + React)    │
        │    • 10-Slide Navigation & Real-Time Slide Rendering │
        │    • Deal Copilot Chat for Structuring Adjustments   │
        │    • One-Click FINRA 2210 & MiFID II Compliance Audit│
        ├──────────────────────────────────────────────────────┤
        │ 2. Production PowerPoint (.PPTX) Export              │
        │    • High-Fidelity Corporate Presentation Generation │
        │    • Slide-by-Slide Sensitivity & Term Sheet Tables  │
        │    • Embedded Regulatory Disclosures & Target Market │
        └──────────────────────────────────────────────────────┘

```

### Synthesis of Structured & Unstructured Data

The pitchbook engine combines data across both operational domains:

* **Structured Grounding:** Slide 4 (Balance Sheet Foundation) and Slide 5 (Debt Maturity Profile) render exact metrics directly from `ca.ext_company_filings` and `ca.debt_maturity_schedule` (e.g., *Net Debt: €58,500M*, *Available Liquidity: €14,200M*, *24M Maturity Wall: €10,127M*).


* **Unstructured Grounding:** Slide 1 (Title), Slide 2 (Sustainability Catalyst), and Slide 3 (Executive Summary) translate the ingested unstructured trigger text into institutional deal themes (e.g., *Inaugural Hybrid Green Bond capturing -5 bps Greenium concession for €4.0B capex*).


* **Dynamic Sensitivity & Term Sheet Structuring:** Slide 6 computes cost savings based on live spread differentials (e.g., *€375,000/year annual savings on €750M notional at -5 bps Greenium*), while Slide 8 outputs the final execution term sheet.



### Interactive UI Preview

Inside the web dashboard, clicking **Open draft pitchbook** launches an interactive workspace:

1. **Slide Navigation:** 10 structured slides displayed with live visual previews.


2. **Origination Deal Copilot:** An interactive LLM assistant capable of restructuring tranches, updating spread assumptions, and regenerating specific slide texts on demand.
3. **Automated Compliance Audit:** Inspects deck content against FINRA 2210, MiFID II, and ICMA guidelines to flag ungrounded performance claims or missing risk disclosures.



### Production `.PPTX` Generation

Clicking **Download .PPTX Deck** executes a server-side document generation script using `python-pptx`:

* Renders the complete 10-slide deck using standard corporate styling, typography, and color schemes.


* Formats institutional data tables, balance sheet callouts, execution roadmaps, and target market regulatory disclaimers.


* Generates an editable `.PPTX` file ready for Relationship Managers to present directly to corporate treasury teams.