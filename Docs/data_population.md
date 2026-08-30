### 1. The 4-Segment Opportunity Card Lineage

Every element rendered across the 4-segment dashboard card connects directly to relational tables in the **`ca` schema** of your PostgreSQL database.

| UI Segment & Field | Database Table (`ca.*`) | Exact Column(s) / Query Logic | Grounding & Transformation Rules |
| --- | --- | --- | --- |
| **Segment 1: Client Data** |  |  |  |
| • Client Name & Ticker | `client_master` | `client_name`, `ticker` | Primary key identity resolution. |
| • Coverage RM | `client_master` | `rm_name` | Assigned coverage director. |
| • Credit Rating | `client_master` | `tier` | Credit tiering (e.g., `Tier 1 (A)`). |
| • Net Debt | `ext_company_filings` | `net_debt_eur_m` | Latest reporting period: `ORDER BY reporting_period DESC LIMIT 1`. |
| • Available Liquidity | `ext_company_filings` | `liquidity_eur_m` | Cash and committed credit facilities. |
| • 24M Maturity Wall | `debt_maturity_schedule` | `amount_eur_m`, `maturity_year` | `COALESCE(SUM(amount_eur_m), 0) WHERE maturity_year IN ('2026', '2027')`. |
| **Segment 2: Market Data** |  |  |  |
| • 5Y EUR Swap Benchmark | `mkt_rates_curves` | `rate_pct WHERE curve_name = 'EUR_SWAP_5Y'` | Base swap curve reading (**2.62%**). |
| • 10Y German Bund | `mkt_rates_curves` | `rate_pct WHERE curve_name = 'BUND_10Y'` | Sovereign reference benchmark (**2.61%**). |
| • 5Y Credit Spread | `ext_credit_spreads` | `spread_bps WHERE index_name = 'ITRAXX_EUROPE_MAIN_5Y'` | Client issuer-specific or benchmark credit spread (**78 bps**). |
| • All-In Benchmark Yield | `ca_opportunity_scoring` / Derived | Calculated field | Base Swap Rate + Spread bps = **3.40%**. |
| • 5Y USD Swap Benchmark | `mkt_rates_curves` | `rate_pct WHERE curve_name = 'USD_SOFR_5Y'` | Cross-currency swap reference (**3.92%**). |
| **Segment 3: Context Fabric** |  |  |  |
| • Ingestion Badges | `document_vector_chunks` | `source_channel` | Channel tags (`NEWS_RSS`, `ANALYST_NOTE`, `CLIENT_EMAIL`, `TEAMS_CHAT`). |
| • Signal Memo | `digital_twin_signals` | `description` | Real-time structured market signal memo with confidence attribution. |
| • Latent Opportunity | `digital_twin_signals` | `trigger_summary` | Identified financing window or debt rollover catalyst. |
| • Attribution / Source | `document_vector_chunks` | `source_name` | Underlying source document, filing, or analyst note. |
| **Segment 4: Mandate & Action** |  |  |  |
| • Catalyst Rationale | `ca_opportunity_scoring` | `why_now_nlg` | Natural language justification for immediate execution. |
| • Proposed Execution | `ca_opportunity_scoring` | `next_best_action` | Actionable transaction structure (e.g., *EUR 2.0B 6Y Senior EMTN + EUR 1.2B IRS*). |
| • Score & Tier | `ca_opportunity_scoring` | `priority_score`, `rank` | Prioritization score (**94**) driving sorting order. |

---

### 2. Grounding Parity: Web Preview Canvas vs. Generated PPTX

To prevent discrepancies between what an RM sees on screen and what gets exported to the client, the **Web Preview Canvas (`App.jsx`)** and the **Generated PPTX (`pitchbook_builder.py`)** consume the exact same normalized JSON state object emitted by `main.py`.

```
                ┌────────────────────────────────────────────────────────┐
                │        Cloud SQL PostgreSQL (ca.* Database)            │
                └───────────────────────────┬────────────────────────────┘
                                            │
                                            ▼
                ┌────────────────────────────────────────────────────────┐
                │          FastAPI Orchestrator (main.py API)            │
                │        - get_pitchbook_content(client_id, overrides)   │
                └─────────────┬────────────────────────────┬─────────────┘
                              │                            │
             [Live JSON State + Overrides]       [Live JSON State + Overrides]
                              ▼                            ▼
  ┌───────────────────────────────────────────┐ ┌───────────────────────────────────────────┐
  │         1. Web Preview Canvas             │ │         2. Generated PPTX Engine          │
  │               (App.jsx)                   │ │          (pitchbook_builder.py)           │
  │ • React 16:9 DOM Canvas Container         │ │ • python-pptx 16:9 Presentation Canvas    │
  │ • Tailwind CSS Light Theme Palette        │ │ • Exact RGB Hex Matching                  │
  │ • Live State Overrides from Copilot       │ │ • python-pptx Table & Shape Coordinates   │
  │ • Real-time Deterministic Calculations    │ │ • Direct Export to .pptx Attachment       │
  └───────────────────────────────────────────┘ └───────────────────────────────────────────┘

```

---

### 3. Exact 1:1 Parity Enforcement Across Output Modalities

**Data State Synchronization**

* When an RM opens a pitchbook, `fetchPitchbookData(client_id)` fetches the 10-slide deck model generated from `ca.ca_opportunity_scoring`, `ca.debt_maturity_schedule`, and `ca.mkt_rates_curves`.
* When an RM adjusts a rate via the Origination Copilot (e.g., shifting the 5Y EUR swap from **2.62%** to **2.75%** or applying a credit spread adjustment), the updated numeric parameters update the React state while simultaneously sending the payload over `/api/opportunities/{id}/export-pptx`.

**Visual & Typography Mapping**

* **Aspect Ratio**: Fixed at **16:9** widescreen (`13.333 inches × 7.5 inches` in `python-pptx`, exactly matched by `aspect-[16/9]` in Tailwind CSS).
* **Color Palette**:
* Primary Corporate Blue: `#000066` (`RGBColor(0, 0, 102)`)
* ING Accent Orange: `#FF6200` (`RGBColor(255, 98, 0)`)
* Background Canvas: `#FFFFFF` (`RGBColor(255, 255, 255)`)
* Card Fill: `#F8FAFC` (`RGBColor(248, 250, 252)`)


* **Tables & Grid Formatting**:
* The debt maturity profile on Slide 3 queries `ca.debt_maturity_schedule` grouped by `maturity_year`.
* The web canvas renders a 4-column table (`Maturity Year | ISIN / Instrument | Currency & Amount | Coupon / Benchmark`).
* `pitchbook_builder.py` constructs a `python-pptx` table shape with the exact same cell widths, column headers, right-aligned monetary values, and bold total rows.



Both the web preview and the downloaded `.pptx` reflect identical numbers, calculations, table counts, and institutional formatting without divergence.