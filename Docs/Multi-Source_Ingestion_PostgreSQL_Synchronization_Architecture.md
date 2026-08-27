### Multi-Source Ingestion & PostgreSQL Synchronization Architecture

Our platform utilizes a unified, two-stage hybrid pipeline to capture unstructured data from multiple channels and persist it into Cloud SQL PostgreSQL.

---

### 1. Unified Entry Point Pattern

Regardless of the ingestion source, all touchpoints funnel into a centralized ingestion handler:

* **Live Google News RSS:** Headline, snippet, and article summaries are dispatched via HTTP POST to `/api/ingest/text`.
* **MS Teams & Treasury Emails:** Internal communication transcripts and client email threads pass through `/api/ingest/text`.
* **Context Fabric / Notes:** Coverage notes and relationship manager (RM) memos route to `/api/ingest/text`.
* **House Views & Decks (PDF / PPTX):** Binary files are received by `/api/ingest/file`, parsed into raw text strings via `pypdf`/`python-pptx`, and forwarded directly to the core `ingest_text_signal` function.

```
[ Google News RSS ] ───────┐
[ MS Teams Dialogues ] ────┼──► /api/ingest/text ──┐
[ Treasury Emails ] ───────┤                       │
[ Context Fabric Memos ] ──┘                       │
                                                   ▼
[ PDF / PPTX Uploads ] ────► /api/ingest/file ────► [ Gemini 2.5 Flash Parsing ]
                                                           │
                                                           ▼
                                               [ Atomic PostgreSQL Transaction ]
                                               ├── 1. INSERT: ca.digital_twin_signals
                                               ├── 2. UPDATE: ca.ca_opportunity_scoring
                                               └── 3. COMMIT: conn.commit()

```

---

### 2. Semantic Extraction & Parameterization

When raw text reaches `ingest_text_signal`, it is processed by **Gemini 2.5 Flash** on Vertex AI with a strict JSON schema contract. The model extracts:

* **Signal Classification:** `signal_type` (*REFINANCING, HEDGING, LIQUIDITY, M&A*) and `catalog_family`.
* **Institutional Metrics:** Precise notional figures (e.g., *€750M EMTN, €500M IRS pre-hedge*), rate basis spreads, and urgency ratings (*High/Medium/Low*).
* **Deal Structuring Rationale:** Suggested `next_best_action`, corporate trigger summary (`why_now_nlg`), estimated fee pool (`est_revenue_eur_000`), and recalculated `priority_score` (e.g., **94**).

---

### 3. Atomic Database Insertion & Update Execution

Once extracted, a single database connection executes an atomic two-table synchronization:

**Step A: Signal Registration (`ca.digital_twin_signals`)**

```sql
INSERT INTO ca.digital_twin_signals (
    signal_id, client_id, catalog_family, signal_type,
    metric_identified, trigger_summary, metric_value,
    description, confidence_pct, urgency, created_at
) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW());

```

* Generates a unique traceable signal identifier (e.g., `SIG-2243E208`).
* Feeds the live horizontal **Signal Feed** banner across the UI.

**Step B: Opportunity Recalibration (`ca.ca_opportunity_scoring`)**

```sql
UPDATE ca.ca_opportunity_scoring
SET next_best_action = %s,
    why_now_nlg = %s,
    est_revenue_eur_000 = %s,
    priority_score = %s,
    opportunity_type = %s
WHERE client_id = %s OR client_id LIKE %s;

```

* Dynamically updates the client's deal mandate, fee pool (e.g., **€5.5M**), and confidence score.
* Calls **`conn.commit()`** explicitly before closing the cursor and pool connector to guarantee immediate ACID persistence.

---

### 4. Downstream Real-Time Reflection

Because the database write is committed immediately, all downstream views refresh synchronously:

1. **Live Signal Feed:** Highlights the new catalyst with confidence metrics and urgency indicators.
2. **Cohort Cards (13 Clients):** Updates the corporate trigger and deal action lines.
3. **Priority Today Sidebar:** Dynamically re-ranks the top mandates based on updated score and fee metrics.
4. **Deal Pitchbook Deck:** Re-generates slide terms (notional, tenor, Greenium pricing, sensitivity tables) aligned with the newly persisted data.