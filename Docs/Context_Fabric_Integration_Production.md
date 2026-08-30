Let me break down how to connect a production client-side agent like **Context Fabric** to your backend without over-engineering the architecture.

In production, client tools installed on RM (Relationship Manager) or DCM specialist workstations act as **edge collectors**. They observe local work activity (emails, meeting transcripts, deal memos) and summarize operational intent locally.

Here is the straightforward, enterprise-standard way to pipe that feed into your Digital Twin engine.

---

### The Logical Production Architecture

Instead of building custom polling daemons or complex socket networks, you expose a secure **Webhook Ingestion API** that the Context Fabric desktop agent calls whenever it synthesizes a new signal.

```
┌────────────────────────────────────────────────────────┐
│  RM Workstation (Client Side)                          │
│  Context Fabric Desktop Agent                          │
│  • Captures tacit notes / Outlook / Teams              │
│  • Summarizes deal intent locally                      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ HTTPS POST (Signed Webhook + Bearer Token)
                           ▼
┌────────────────────────────────────────────────────────┐
│  ING Digital Twin Ingestion Endpoint                   │
│  POST /api/v1/webhooks/context-fabric                  │
│  • Validates API key / HMAC signature                  │
│  • Maps Client LEI / ISIN / Entity ID                  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Gemini Pro Extraction & Reconciliation Engine         │
│  • Reconciles note against live market curve & DB      │
│  • Updates ca.digital_twin_signals                     │
│  • Triggers ca.ca_opportunity_scoring re-rank          │
└────────────────────────────────────────────────────────┘

```

---

### Step-by-Step Production Implementation

#### 1. Context Fabric Webhook Payload Format

Context Fabric exports structured event payloads over standard HTTPS. You configure Context Fabric's outbound webhook setting to deliver this standard JSON:

```json
{
  "event_id": "evt_9823410a",
  "timestamp": "2026-08-30T10:15:30Z",
  "source_agent": {
    "user_id": "rm_klaus_weber",
    "user_name": "Klaus Weber",
    "desk": "DCM Origination Germany",
    "application_source": "WorkFabric Desktop v2.4"
  },
  "entity": {
    "client_id": "BASF_SE",
    "lei": "52990021RFURJ1U72T14"
  },
  "context_memo": {
    "product_family": "INTEREST_RATE_HEDGING",
    "raw_text": "Executive Committee approved accelerated debt rollover. Mandate requires EUR 2.0B 6Y Senior EMTN benchmark with immediate EUR 1.2B Fixed-to-Floating IRS pre-hedge.",
    "priority": "HIGH",
    "confidence_score": 0.95
  }
}

```

---

#### 2. Backend Webhook Receiver Endpoint (`main.py`)

You add a single dedicated webhook endpoint to your FastAPI service:

```python
from fastapi import Header, HTTPException, Security
from pydantic import BaseModel

class ContextFabricWebhookPayload(BaseModel):
    event_id: str
    timestamp: str
    source_agent: dict
    entity: dict
    context_memo: dict

@app.post("/api/v1/webhooks/context-fabric")
async def receive_context_fabric_feed(
    payload: ContextFabricWebhookPayload,
    authorization: str = Header(None)
):
    # 1. Basic Token / Signature Authentication
    expected_token = os.getenv("CONTEXT_FABRIC_API_KEY", "ing_live_secret_key")
    if not authorization or authorization != f"Bearer {expected_token}":
        raise HTTPException(status_code=401, detail="Unauthorized WorkFabric feed")

    # 2. Extract Client and Content
    cid = payload.entity.get("client_id")
    raw_text = payload.context_memo.get("raw_text", "")
    author = f"{payload.source_agent.get('user_name', 'RM')} ({payload.source_agent.get('desk', 'Coverage')})"

    # 3. Call Existing Ingestion Service
    req = TextIngestRequest(
        client_id=cid,
        source_channel="CONTEXT_FABRIC",
        source_name=author,
        text_content=raw_text
    )
    result = ingest_text_signal(req)
    
    return {
        "status": "PROCESSED",
        "event_id": payload.event_id,
        "client_id": cid,
        "digital_twin_recalculated": True
    }

```

---

### 3. Real-Time Frontend Sync via SSE (Server-Sent Events)

When the RM enters a note in Context Fabric on their laptop, how does their browser screen update without refreshing?

* **Use Server-Sent Events (SSE)** or a simple **5-second polling interval** on the frontend for `/api/signals/{client_id}`.
* When the webhook inserts a new row into `ca.digital_twin_signals`, the browser fetches the refreshed signals and re-renders **Segment 3 (Context Fabric)** and **Segment 4 (Mandate)** automatically.

---

### Summary for Leadership

1. **Zero Client Disruption**: RMs do not manually copy-paste into the web portal; Context Fabric pushes synthesized memos automatically via background HTTPS webhooks.
2. **Standard API Gateway**: The integration uses a single secure endpoint (`/api/v1/webhooks/context-fabric`) secured with enterprise Bearer tokens / HMAC headers.
3. **Reuses Existing Logic**: The webhook simply calls our existing `ingest_text_signal` pipeline—reconciling text with Gemini, saving vectors to Cloud SQL, and updating the Pitchbook in real time.