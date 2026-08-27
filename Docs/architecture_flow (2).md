
---

## 1. High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         ING Financial Markets AI Platform                          │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │                         Frontend (gui.py)                                      │ │
│  │                         Streamlit UI                                          │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │                         Backend (app.py)                                       │ │
│  │                         Flask API Server                                       │ │
│  │                                                                                 │ │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐                  │ │
│  │  │   TAB 1   │  │   TAB 2   │  │   TAB 3   │  │   TAB 4   │                  │ │
│  │  │  /ingest  │  │ /match-   │  │ /check-   │  │ /generate-│                  │ │
│  │  │           │  │opportunity│  │compliance │  │ pitchbook │                  │ │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘                  │ │
│  │        │              │              │              │                         │ │
│  └────────┼──────────────┼──────────────┼──────────────┼─────────────────────────┘ │
│           │              │              │              │                           │
│           ▼              ▼              ▼              ▼                           │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │                         External Services                                      │ │
│  │                                                                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │ │
│  │  │   Gemini    │  │   Gemini    │  │   Gemini    │  │     Cloud SQL        │   │ │
│  │  │    Flash    │  │     Pro     │  │    Flash    │  │     pgvector         │   │ │
│  │  │  (Extract)  │  │  (Reason)   │  │ (Compliance)│  │  (Vector Database)   │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tab 1: Signal Ingestion Flow (`/ingest`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        TAB 1: Omni-Channel Signal Ingestion                        │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  INPUT: User uploads document OR selects demo preset                           │ │
│  │  • client_id, source_channel, source_name, text_content                       │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 1: Generate Embedding                                                    │ │
│  │  • embedding_model.get_embeddings(text)                                       │ │
│  │  • Creates 768-dim dense vector                                               │ │
│  │  • vector_str = str(list(embeddings[0].values))                              │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 2: 🧠 Gemini Flash - Signal Extraction                                   │ │
│  │  • flash_model.generate_content(extraction_prompt)                            │ │
│  │  • Extracts: executive_summary, detected_signals                              │ │
│  │  • Each signal: signal_type, catalog_family, urgency, confidence_pct          │ │
│  │  • evidence_status: Fact | Derived Signal | Hypothesis | Client-Validated    │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 3: Validate & Normalize                                                  │ │
│  │  • validate_extracted_metadata()                                              │ │
│  │  • Check catalog_family against SERVICE_CATALOG                               │ │
│  │  • Validate urgency (High|Medium|Low)                                         │ │
│  │  • Validate confidence (0-100)                                                │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 4: Persist to Cloud SQL (pgvector)                                       │ │
│  │  • INSERT INTO ca.document_vector_chunks                                      │ │
│  │    (chunk_id, client_id, source_channel, source_name, text_content,           │ │
│  │     structured_metadata, embedding)                                           │ │
│  │  • INSERT INTO ca.digital_twin_signals                                        │ │
│  │    (signal_id, client_id, signal_type, metric_value, description)             │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  OUTPUT: Return to Frontend                                                    │ │
│  │  • chunk_id, source_name, extracted_metadata, detected_signals                │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tab 2: Opportunity Discovery Flow (`/match-opportunity`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                     TAB 2: Opportunity Discovery                                    │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  INPUT: client_id                                                              │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 1: Retrieve Digital Twin Signals from DB                                 │ │
│  │  • SELECT signal_type, metric_value, description                               │ │
│  │  • FROM ca.digital_twin_signals WHERE client_id = %s                          │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 2: Retrieve Client Master Data                                           │ │
│  │  • SELECT client_name, industry_sector, country, region                        │ │
│  │  • FROM ca.dt_client_master                                                   │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 3: Build Retrieval Query                                                 │ │
│  │  • Combine: client info + signals + evidence                                  │ │
│  │  • Generate embedding of query                                                │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 4: pgvector Evidence Retrieval                                           │ │
│  │  • SELECT source_channel, source_name, text_content, embedding <=> %s::vector  │ │
│  │  • ORDER BY embedding <=> %s::vector LIMIT 10                                  │ │
│  │  • Returns: evidence_record_count, evidence_source_count                       │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 5: 🧠 Gemini Pro - Opportunity Reasoning                                 │ │
│  │  • pro_model.generate_content(reasoning_prompt)                               │ │
│  │  • Analyzes: signals + evidence + 45+ reasoning rules                         │ │
│  │  • Outputs:                                                                   │ │
│  │    - catalog_family (primary opportunity)                                     │ │
│  │    - product (specific solution)                                              │ │
│  │    - score (0-100 priority)                                                   │ │
│  │    - opportunity_status (Hypothesis|Discovery|Mandate)                       │ │
│  │    - rationale (evidence-grounded explanation)                                │ │
│  │    - validation_gap (what's missing)                                          │ │
│  │    - secondary_opportunities (up to 3)                                        │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 6: Validate Output                                                       │ │
│  │  • validate_opportunity()                                                     │ │
│  │  • Check catalog_family in SERVICE_CATALOG                                    │ │
│  │  • Validate score (0-100), urgency, status                                    │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  OUTPUT: Return to Frontend                                                    │ │
│  │  • opportunity_id, catalog_family, product, score, urgency                    │ │
│  │  • opportunity_status, rationale, validation_gap                              │ │
│  │  • secondary_opportunities, evidence_sources                                  │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Tab 3: Compliance Check Flow (`/check-compliance`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    TAB 3: Regulatory Compliance Gateway                             │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  INPUT: product, bullets (pitchbook narrative)                                 │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 1: Deterministic Rule Check                                              │ │
│  │  • Scan for promissory language patterns                                       │ │
│  │  • Patterns: guarantee, risk-free, eliminate all risk, no risk, etc.          │ │
│  │  • Uses: PROMISSORY_PATTERNS list                                             │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 2: 🧠 Gemini Flash - Compliance Screening                                │ │
│  │  • flash_model.generate_content(compliance_prompt)                            │ │
│  │  • Checks for:                                                                 │ │
│  │    - Promissory statements                                                     │ │
│  │    - Omission of material risks                                                │ │
│  │    - Unsubstantiated claims                                                    │ │
│  │    - Certainty of market outcomes                                              │ │
│  │  • Returns: compliant (boolean), flags, required_risk_bullet                  │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 3: Combine Results                                                       │ │
│  │  • Combine deterministic_flags + model_flags                                  │ │
│  │  • compliant = model_compliant AND no deterministic_flags                     │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  OUTPUT: Return to Frontend                                                    │ │
│  │  • compliant (True/False)                                                     │ │
│  │  • flags (list of issues found)                                               │ │
│  │  • required_risk_bullet (suggested risk warning)                              │ │
│  │  • mandatory_disclaimer (MiFID II disclaimer)                                 │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Tab 4: Pitchbook Generation Flow (`/generate-pitchbook`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                 TAB 4: Pitchbook Presentation Rendering                             │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  INPUT: Full opportunity data from Tab 2                                       │ │
│  │  • client_name, client_id, title, bullets                                     │ │
│  │  • product, score, catalog_family, opportunity_status                         │ │
│  │  • rationale, validation_gap, urgency                                         │ │
│  │  • evidence_sources, secondary_opportunities                                  │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 1: Smart Text Processing (NO AI - Deterministic)                         │ │
│  │  • smart_truncate() - truncate text at natural break points                   │ │
│  │  • smart_wrap() - wrap text at word boundaries                                │ │
│  │  • create_bullet_text() - format bullets with proper indentation              │ │
│  │  • Dynamic font sizing based on line count                                    │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 2: Slide Generation (python-pptx)                                       │ │
│  │                                                                                 │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  SLIDE 1: Title Slide                                                   │   │ │
│  │  │  • ING Financial Markets                                               │   │ │
│  │  │  • Client: Title                                                       │   │ │
│  │  │  • Date, ING Orange branding                                           │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘   │ │
│  │                                      │                                           │ │
│  │                                      ▼                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  SLIDE 2: Section Divider (Orange Background)                          │   │ │
│  │  │  • "01" + catalog_family + ": Opportunity Assessment"                  │   │ │
│  │  │  • Status: {status} • Urgency: {urgency} • Score: {score}/100          │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘   │ │
│  │                                      │                                           │ │
│  │                                      ▼                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  SLIDE 3: Chart + Bullets                                              │   │ │
│  │  │  • Priority Score: {score}/100 (custom label)                          │   │ │
│  │  │  • Bar Chart: Evidence, Validation, Execution                          │   │ │
│  │  │  • Bullets: Client, Product, Catalog, Status, Urgency, Score           │   │ │
│  │  │  • Evidence Sources, Evidence Records, Rationale                       │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘   │ │
│  │                                      │                                           │ │
│  │                                      ▼                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  SLIDE 4: Detailed Assessment Table                                    │   │ │
│  │  │  • Metrics: Client, Status, Catalog, Product, Score, Urgency           │   │ │
│  │  │  • Validation Gap, Evidence Sources                                    │   │ │
│  │  │  • Status indicators: ✓ or ⏳                                          │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘   │ │
│  │                                      │                                           │ │
│  │                                      ▼                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  SLIDE 5: Three Columns                                               │   │ │
│  │  │  • Column 1: Current Status                                            │   │ │
│  │  │  • Column 2: Validation Required                                       │   │ │
│  │  │  • Column 3: Next Steps (Secondary Opportunities)                     │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘   │ │
│  │                                      │                                           │ │
│  │                                      ▼                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  SLIDE 6: Section Divider (Orange Background)                          │   │ │
│  │  │  • "02" + "ING Financial Markets"                                      │   │ │
│  │  │  • "Your Strategic Partner for Financial Markets Solutions"            │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘   │ │
│  │                                      │                                           │ │
│  │                                      ▼                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  SLIDE 7: Value Proposition (Three Columns)                            │   │ │
│  │  │  • Execution Excellence                                                │   │ │
│  │  │  • Integrated Solutions                                                │   │ │
│  │  │  • Sustainable Finance                                                 │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  STEP 3: Add ING Branding                                                     │ │
│  │  • add_ing_logo() - Lion logo (top-right)                                     │ │
│  │  • add_ing_footer() - "ING Financial Markets • Confidential"                  │ │
│  │  • ING Orange (#FF6200) on all slides                                         │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  OUTPUT: Return PPTX to Frontend                                              │ │
│  │  • Bytes of .pptx file                                                        │ │
│  │  • Content-Type: application/vnd.openxmlformats-officedocument...            │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. End-to-End User Journey Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE USER JOURNEY                                       │
│                                                                                     │
│  Step 1: User uploads document (PDF/PPTX) or selects demo                          │
│          ─────────────────────────────────────────────────────────────────────────   │
│          Client clicks "🚀 Ingest Signal" in Tab 1                                │
│                                      │                                               │
│                                      ▼                                               │
│  Step 2: Backend processes document                                                │
│          ─────────────────────────────────────────────────────────────────────────   │
│          • Generates embedding (pgvector)                                          │
│          • 🧠 Gemini Flash extracts signals                                        │
│          • Stores in Cloud SQL                                                     │
│                                      │                                               │
│                                      ▼                                               │
│  Step 3: User discovers opportunity                                               │
│          ─────────────────────────────────────────────────────────────────────────   │
│          Client clicks "🔎 Discover & Prioritize Opportunities" in Tab 2           │
│                                      │                                               │
│                                      ▼                                               │
│  Step 4: Backend analyzes opportunity                                             │
│          ─────────────────────────────────────────────────────────────────────────   │
│          • Retrieves signals from DB                                              │
│          • Retrieves evidence from pgvector                                       │
│          • 🧠 Gemini Pro reasons with 45+ rules                                   │
│          • Returns: opportunity + score + rationale                               │
│                                      │                                               │
│                                      ▼                                               │
│  Step 5: User checks compliance                                                   │
│          ─────────────────────────────────────────────────────────────────────────   │
│          Client clicks "🛡️ Run Compliance Audit" in Tab 3                         │
│                                      │                                               │
│                                      ▼                                               │
│  Step 6: Backend screens for risk                                                 │
│          ─────────────────────────────────────────────────────────────────────────   │
│          • 🧠 Gemini Flash checks for promissory language                         │
│          • Returns compliance status + flags                                      │
│                                      │                                               │
│                                      ▼                                               │
│  Step 7: User generates pitchbook                                                 │
│          ─────────────────────────────────────────────────────────────────────────   │
│          Client clicks "📊 Generate ING Branded PowerPoint Pitchbook" in Tab 4    │
│                                      │                                               │
│                                      ▼                                               │
│  Step 8: Backend generates professional deck                                      │
│          ─────────────────────────────────────────────────────────────────────────   │
│          • NO AI calls (deterministic)                                            │
│          • python-pptx creates 7 slides                                           │
│          • Smart truncation + wrapping                                            │
│          • ING branding + logo                                                    │
│                                      │                                               │
│                                      ▼                                               │
│  Step 9: User downloads pitchbook                                                 │
│          ─────────────────────────────────────────────────────────────────────────   │
│          Client clicks "📥 Download ING Deck (.pptx)"                             │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Key Components Summary

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         KEY COMPONENTS SUMMARY                                      │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  🧠 AI MODELS                                                                  │ │
│  │                                                                                 │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │ │
│  │  │  Gemini Flash   │  │  Gemini Pro     │  │  Text Embedding │                │ │
│  │  │  (Flash Model)  │  │  (Pro Model)    │  │  (Embedding)    │                │ │
│  │  │                 │  │                 │  │                 │                │ │
│  │  │  • Signal       │  │  • Opportunity  │  │  • 768-dim      │                │ │
│  │  │    Extraction   │  │    Discovery    │  │    Vectors      │                │ │
│  │  │  • Compliance   │  │  • Complex      │  │  • Semantic     │                │ │
│  │  │    Checks       │  │    Reasoning    │  │    Search       │                │ │
│  │  │  • Fast & Cheap │  │  • 45+ Rules    │  │                 │                │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘                │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  💾 DATABASE (Cloud SQL with pgvector)                                         │ │
│  │                                                                                 │ │
│  │  ┌─────────────────────────────────┐  ┌─────────────────────────────────────┐   │ │
│  │  │  ca.document_vector_chunks      │  │  ca.digital_twin_signals            │   │ │
│  │  │  • chunk_id, client_id          │  │  • signal_id, client_id             │   │ │
│  │  │  • source_channel, source_name  │  │  • signal_type, metric_value        │   │ │
│  │  │  • text_content                 │  │  • description                      │   │ │
│  │  │  • structured_metadata          │  │                                     │   │ │
│  │  │  • embedding (vector)           │  │                                     │   │ │
│  │  └─────────────────────────────────┘  └─────────────────────────────────────┘   │ │
│  │                                                                                 │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  ca.dt_client_master                                                        │ │ │
│  │  │  • client_id, client_name, industry_sector, country, region                │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  📊 PPTX GENERATION (python-pptx)                                              │ │
│  │                                                                                 │ │
│  │  • add_ing_logo() - Lion logo (top-right)                                     │ │
│  │  • add_ing_footer() - Footer text                                             │ │
│  │  • smart_truncate() - Text truncation                                         │ │
│  │  • smart_wrap() - Text wrapping                                               │ │
│  │  • create_bullet_text() - Bullet formatting                                   │ │
│  │  • Dynamic font sizing - Based on line count                                  │ │
│  │  • Fixed positioning - Inches based                                           │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Data Flow Between Components

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW DIAGRAM                                           │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  INPUT                                                                         │ │
│  │  • PDF/PPTX files                                                              │ │
│  │  • News/RSS feeds                                                              │ │
│  │  • Teams discussions                                                           │ │
│  │  • Treasury emails                                                             │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  TEXT EXTRACTION                                                               │ │
│  │  • PyPDF - PDF extraction                                                     │ │
│  │  • python-pptx - PPTX extraction                                              │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  🧠 GEMINI FLASH - SIGNAL EXTRACTION                                          │ │
│  │  INPUT: text_content                                                          │ │
│  │  OUTPUT: executive_summary, detected_signals                                  │ │
│  │  EACH SIGNAL: signal_type, catalog_family, urgency, confidence_pct            │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  💾 CLOUD SQL (pgvector)                                                       │ │
│  │  • Store: document_vector_chunks (with embedding)                             │ │
│  │  • Store: digital_twin_signals                                                │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  🔍 VECTOR SEARCH                                                              │ │
│  │  • embedding <=> %s::vector ORDER BY LIMIT 10                                 │ │
│  │  • Returns: evidence_record_count, evidence_source_count                      │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  🧠 GEMINI PRO - OPPORTUNITY DISCOVERY                                         │ │
│  │  INPUT: signals + evidence + 45+ rules                                        │ │
│  │  OUTPUT: catalog_family, product, score, opportunity_status, rationale        │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  🧠 GEMINI FLASH - COMPLIANCE CHECK                                            │ │
│  │  INPUT: bullets (pitchbook narrative)                                         │ │
│  │  OUTPUT: compliant, flags, required_risk_bullet                               │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                               │
│                                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  📊 PPTX GENERATION (NO AI - Deterministic)                                    │ │
│  │  INPUT: opportunity data                                                       │ │
│  │  PROCESS: smart_truncate, smart_wrap, bullet formatting, fixed positioning    │ │
│  │  OUTPUT: ING-branded 7-slide pitchbook                                        │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. API Endpoints Summary

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         API ENDPOINTS SUMMARY                                       │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  GET /health                                                                    │ │
│  │  Description: Health check                                                     │ │
│  │  Response: {status, service, project, region}                                  │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  POST /ingest                                                                   │ │
│  │  Description: Tab 1 - Signal Ingestion                                          │ │
│  │  Request: {client_id, source_channel, source_name, text}                       │ │
│  │  Process: Embedding → Gemini Flash → Cloud SQL                                │ │
│  │  Response: {chunk_id, extracted_metadata, detected_signals}                    │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  POST /match-opportunity                                                        │ │
│  │  Description: Tab 2 - Opportunity Discovery                                     │ │
│  │  Request: {client_id}                                                          │ │
│  │  Process: pgvector search → Gemini Pro reasoning                              │ │
│  │  Response: {catalog_family, product, score, opportunity_status, ...}           │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  POST /check-compliance                                                         │ │
│  │  Description: Tab 3 - Compliance Gateway                                        │ │
│  │  Request: {product, bullets}                                                   │ │
│  │  Process: Deterministic check → Gemini Flash                                  │ │
│  │  Response: {compliant, flags, required_risk_bullet}                            │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  POST /generate-pitchbook                                                       │ │
│  │  Description: Tab 4 - Pitchbook Generation                                      │ │
│  │  Request: {client_name, title, bullets, product, score, ...}                   │ │
│  │  Process: Deterministic python-pptx (NO AI)                                    │ │
│  │  Response: PPTX file (bytes)                                                   │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Key Design Patterns

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         KEY DESIGN PATTERNS                                         │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  1. Hybrid AI Architecture                                                     │ │
│  │     ─────────────────────────────────────────────────────────────────────────   │ │
│  │     • Gemini Flash: Fast, cheap extraction & compliance                       │ │
│  │     • Gemini Pro: Complex reasoning & discovery                               │ │
│  │     • Deterministic: PPTX generation (NO AI)                                  │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  2. RAG (Retrieval-Augmented Generation)                                       │ │
│  │     ─────────────────────────────────────────────────────────────────────────   │ │
│  │     • Documents → Embeddings → pgvector                                       │ │
│  │     • Query → Similarity search → Evidence                                    │ │
│  │     • Evidence → Gemini → Opportunity                                         │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  3. Smart Text Processing                                                      │ │
│  │     ─────────────────────────────────────────────────────────────────────────   │ │
│  │     • smart_truncate() - Natural break points                                 │ │
│  │     • smart_wrap() - Word boundaries                                          │ │
│  │     • Dynamic font sizing - Line count based                                  │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │  4. Brand Consistency                                                          │ │
│  │     ─────────────────────────────────────────────────────────────────────────   │ │
│  │     • Fixed ING Orange (#FF6200)                                               │ │
│  │     • Lion logo on all slides                                                 │ │
│  │     • Consistent footer                                                       │ │
│  │     • Arial typography                                                        │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---
The key takeaway is the **hybrid approach**:

- **Gemini for Intelligence** (Tabs 1-3): Signal extraction, opportunity discovery, compliance
- **Deterministic Template Engine** (Tab 4): PPTX generation with python-pptx, no AI costs or latency