# ING Financial Markets AI Agentic Platform — Operational Runbook

Session Restart Quick Start
This is the only block normally required after a new Cloud Shell session

cd ~/ing-fm-poc
source ./session-init.sh

Deployment: user@ing-fm-dev-1:~/ing-fm-poc$ 
cd ~/ing-fm-poc
gcloud run deploy ing-fm-poc-service \
    --source . \
    --region "$REGION" \
    --port 8080 \
    --add-cloudsql-instances "$INSTANCE_CONN" \
    --set-env-vars INSTANCE_CONNECTION_NAME="$INSTANCE_CONN",DB_USER="$DB_USER",DB_PASS="$DB_PASS",DB_NAME="$DB_NAME",GCP_PROJECT="$GCP_PROJECT",REGION="$REGION" \
    --clear-base-image \
    --allow-unauthenticated

Then check:

echo "$GCP_PROJECT"
echo "$REGION"
echo "$SQL_INSTANCE"
echo "$INSTANCE_CONN"
echo "$SERVICE_URL"

Then:

gcloud sql instances describe "$SQL_INSTANCE" \
    --format="value(state,settings.activationPolicy)"

If the database is stopped:

gcloud sql instances patch "$SQL_INSTANCE" \
    --activation-policy=ALWAYS

Then proceed with development/testing.

## 1. System Persistence Model

* **Cloud SQL Data & Schemas**: Persisted permanently in GCP managed storage (`ing-postgres-db`). Schemas and `pgvector` embeddings do not reset across sessions.
* **Cloud Run Service**: Deployed and managed permanently in Google Cloud (`ing-fm-poc-service`). Auto-scales to 0 instances when idle to minimize compute costs.
* **Cloud Shell Workspace**: Google Cloud Shell maintains a persistent `$HOME` disk (`~/ing-fm-poc`) across sessions for the authenticated account.
* **Session Scope**: Terminal environment variables such as `$INSTANCE_CONN` and `$SERVICE_URL` reset when a Cloud Shell session expires and must be re-exported.
* **Authentication Scope**: GCP credentials may remain stored in Cloud Shell while the active `gcloud` account selection can be lost. Session initialization therefore explicitly validates and restores the active account.

---

## 2. Session Initialization

Run this block whenever starting a new Cloud Shell session.

### 2.1 Authentication and Project Setup

```bash
# ============================================================
# 1. Navigate to persistent project workspace
# ============================================================

cd ~/ing-fm-poc

# ============================================================
# 2. Verify GCP credentials
# ============================================================

gcloud auth list

# ============================================================
# 3. Ensure the expected account is active
#
# If the account is already credentialed, this selects it.
# If the account is not listed, run:
#     gcloud auth login
# and then repeat this command.
# ============================================================

gcloud config set account rajarshipathak3008@gmail.com

# ============================================================
# 4. Set active GCP project and Cloud Run region
# ============================================================

gcloud config set project ing-fm-demo-2026
gcloud config set run/region europe-west1

# ============================================================
# 5. Verify active configuration
# ============================================================

echo "=============================================="
echo "Active GCP Account:"
gcloud config get-value account

echo "GCP Project:"
gcloud config get-value project

echo "Cloud Run Region:"
gcloud config get-value run/region
echo "=============================================="
```

> **Authentication recovery:** If `gcloud config set account` reports that the account is not available, run `gcloud auth login`, complete the browser authentication flow, and then repeat the account-selection command.

---

## 3. Session Environment Variables

After authentication and project configuration, run:

```bash
# ============================================================
# Environment Configuration
# ============================================================
export GCP_PROJECT=$(gcloud config get-value project)
export REGION="europe-west1"

export SQL_INSTANCE="ing-postgres-db"

export DB_USER="postgres"
export DB_PASS="SecureYourPassword123!"
export DB_NAME="postgres"

# Retrieve Cloud SQL connection name
export INSTANCE_CONN=$(gcloud sql instances describe "$SQL_INSTANCE" \
  --format="value(connectionName)")

# Retrieve Cloud Run service URL
export SERVICE_URL=$(gcloud run services describe ing-fm-poc-service \
  --region "$REGION" \
  --format="value(status.url)")
```

---

## 4. Session Preflight Validation

Run this before working with the application.

```bash
# ============================================================
# Cloud SQL status
# ============================================================

echo "Cloud SQL Status:"
gcloud sql instances describe "$SQL_INSTANCE" \
  --format="value(state,settings.activationPolicy)"

# ============================================================
# Cloud Run service status
# ============================================================

echo "Cloud Run Service:"
gcloud run services describe ing-fm-poc-service \
  --region "$REGION" \
  --format="value(status.url)"

# ============================================================
# Final Environment Banner
# ============================================================

echo "=============================================="
echo "ING Financial Markets AI Agentic Platform"
echo "=============================================="
echo "GCP Account     : $(gcloud config get-value account)"
echo "Project ID      : $GCP_PROJECT"
echo "Region          : $REGION"
echo "Cloud SQL Conn  : $INSTANCE_CONN"
echo "Cloud SQL State : $(gcloud sql instances describe "$SQL_INSTANCE" --format="value(state)")"
echo "Live Web URL    : $SERVICE_URL"
echo "=============================================="
```

Expected healthy Cloud SQL state:

```text
RUNNABLE    ALWAYS
```

If Cloud SQL is:

```text
RUNNABLE    NEVER
```

or:

```text
STOPPED     NEVER
```

follow the lifecycle instructions below.

---

## 5. Cloud SQL Lifecycle Management

This section is used for cost control.

### 5.1 Check Instance Status

```bash
gcloud sql instances describe "$SQL_INSTANCE" \
  --format="value(state,settings.activationPolicy)"
```

### 5.2 Start Cloud SQL

Use this before running demonstrations or application tests:

```bash
gcloud sql instances patch "$SQL_INSTANCE" \
  --activation-policy=ALWAYS
```

Wait until:

```text
RUNNABLE
```

before testing the application.

Check again:

```bash
gcloud sql instances describe "$SQL_INSTANCE" \
  --format="value(state,settings.activationPolicy)"
```

### 5.3 Stop Cloud SQL

When the POC is not being used:

```bash
gcloud sql instances patch "$SQL_INSTANCE" \
  --activation-policy=NEVER
```

Verify:

```bash
gcloud sql instances describe "$SQL_INSTANCE" \
  --format="value(state,settings.activationPolicy)"
```

> Cloud SQL data, schemas, and pgvector data remain persisted when the instance is stopped.

---

## 6. Source Code Update

The primary development workspace is:

```text
~/ing-fm-poc
```

Important application files include:

```text
app.py
gui.py
Dockerfile
requirements.txt
seed_db.py
seed_runner.py
runbook.md
```

Before replacing application code, create a quick rollback copy:

```bash
cd ~/ing-fm-poc

cp app.py app.py.backup
cp gui.py gui.py.backup
```

---

## 7. Python Syntax Validation

Before deploying modified Python code:

```bash
cd ~/ing-fm-poc

python3 -m py_compile app.py gui.py
```

Expected result:

```text
No output
```

If Python reports an error, **do not deploy**. Fix the syntax error first.

---

## 8. Code Update & Cloud Run Redeployment

Run this when modifying:

* `app.py`
* `gui.py`
* `Dockerfile`
* `requirements.txt`

First make sure Cloud SQL is running:

```bash
gcloud sql instances describe "$SQL_INSTANCE" \
  --format="value(state,settings.activationPolicy)"
```

Then deploy:

```bash
cd ~/ing-fm-poc

gcloud run deploy ing-fm-poc-service \
    --source . \
    --region "$REGION" \
    --port 8501 \
    --add-cloudsql-instances "$INSTANCE_CONN" \
    --set-env-vars INSTANCE_CONNECTION_NAME="$INSTANCE_CONN",DB_USER="$DB_USER",DB_PASS="$DB_PASS",DB_NAME="$DB_NAME",GCP_PROJECT="$GCP_PROJECT",REGION="$REGION" \
    --allow-unauthenticated
```

After deployment, refresh the Cloud Run URL:

```bash
export SERVICE_URL=$(gcloud run services describe ing-fm-poc-service \
  --region "$REGION" \
  --format="value(status.url)")
```

---

## 9. Application Health Validation

Before opening the UI, verify the backend health endpoint:

```bash
curl -i "$SERVICE_URL/health"
```

Expected response:

```json
{
  "status": "healthy"
}
```

If `/health` fails, do not proceed to functional testing. Check the Cloud Run logs:

```bash
gcloud run services logs read ing-fm-poc-service \
  --region "$REGION" \
  --limit 100
```

---

## 10. Live Application Access

### Front-End UI

```text
$SERVICE_URL
```

Example:

```text
https://ing-fm-poc-service-ij6tkrwsma-ew.a.run.app
```

### Backend Health

```text
$SERVICE_URL/health
```

### Current POC Flow

Test the application in this order:

```text
1. Open Streamlit UI
        ↓
2. Tab 1
   Omni-Channel Ingestion
        ↓
3. Ingest Enel/BASF signal
        ↓
4. Verify Cloud SQL persistence
        ↓
5. Tab 2
   Opportunity Discovery
        ↓
6. Verify pgvector evidence retrieval
        ↓
7. Tab 3
   Compliance Gateway
        ↓
8. Tab 4
   Pitchbook Generation
```

---

## 11. Cloud Run Logs

For application errors:

```bash
gcloud run services logs read ing-fm-poc-service \
  --region "$REGION" \
  --limit 100
```

For more recent logs:

```bash
gcloud run services logs read ing-fm-poc-service \
  --region "$REGION" \
  --limit 50
```

---

## 12. Session Restart Quick Start

For normal day-to-day development, the following sequence is sufficient:

```bash
cd ~/ing-fm-poc

gcloud config set account rajarshipathak3008@gmail.com
gcloud config set project ing-fm-demo-2026
gcloud config set run/region europe-west1

export GCP_PROJECT=$(gcloud config get-value project)
export REGION="europe-west1"
export SQL_INSTANCE="ing-postgres-db"
export DB_USER="postgres"
export DB_PASS="YourSecurePassword123!"
export DB_NAME="postgres"

export INSTANCE_CONN=$(gcloud sql instances describe "$SQL_INSTANCE" \
  --format="value(connectionName)")

export SERVICE_URL=$(gcloud run services describe ing-fm-poc-service \
  --region "$REGION" \
  --format="value(status.url)")

gcloud sql instances describe "$SQL_INSTANCE" \
  --format="value(state,settings.activationPolicy)"

echo "=============================================="
echo "Project ID     : $GCP_PROJECT"
echo "Cloud SQL Conn : $INSTANCE_CONN"
echo "Live Web URL   : $SERVICE_URL"
echo "=============================================="
```

If Cloud SQL is stopped:

```bash
gcloud sql instances patch "$SQL_INSTANCE" \
  --activation-policy=ALWAYS
```

Then wait for:

```text
RUNNABLE
```

before testing the application.

---

## 13. Cost-Control Shutdown

When finished with development or demonstrations:

```bash
gcloud sql instances patch "$SQL_INSTANCE" \
  --activation-policy=NEVER
```

Cloud Run can remain deployed because it scales to zero when idle.

Before ending the session, verify:

```bash
gcloud sql instances describe "$SQL_INSTANCE" \
  --format="value(state,settings.activationPolicy)"
```

The desired inactive state is:

```text
STOPPED    NEVER
```

---

## 14. Current Architecture

```text
                    Google Cloud
                         │
             ┌───────────┴───────────┐
             │                       │
         Cloud Run                Vertex AI
     ing-fm-poc-service        Gemini / Embeddings
             │
       ┌─────┴─────┐
       │           │
 Streamlit       Flask API
   :8501           :8080
       │           │
       └─────┬─────┘
             │
          Cloud SQL
     ing-postgres-db
             │
      PostgreSQL + pgvector
             │
       ┌─────┴─────────────┐
       │                   │
 Digital Twin       Vector Evidence
 Signals            document chunks
```

---

## 15. Operational Principle

The Cloud Shell environment is the **development workspace**.

Cloud Run is the **deployed application runtime**.

Cloud SQL is the **persistent system of record and context store**.

Vertex AI provides the **AI reasoning, signal extraction, and embedding capabilities**.

Source-code changes should be developed and validated in Cloud Shell before Cloud Run deployment.

Cloud SQL should be stopped when the POC is not being used to reduce unnecessary compute cost.
