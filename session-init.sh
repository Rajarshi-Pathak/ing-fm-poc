#!/bin/bash

set -u

# =============================================================================
# Configuration Defaults (Override via environment variables if desired)
# =============================================================================
PROJECT_ID="teach-telecom-ai-sandbox"
REGION_ID="${REGION:-europe-west1}"
SQL_INSTANCE_ID="${SQL_INSTANCE:-ing-postgres-db}"
CLOUD_RUN_SERVICE="${CLOUD_RUN_SERVICE:-ing-fm-poc-service}"

echo
echo "============================================================"
echo " ING Financial Markets AI Agentic Platform"
echo " Cloud Shell Session Initialization"
echo "============================================================"
echo

# ------------------------------------------------------------------
# 1. Check & Auto-Detect GCP Authentication
# ------------------------------------------------------------------
echo "[1/7] Checking GCP authentication..."

# Auto-detect currently active gcloud account if not explicitly set
DETECTED_ACCOUNT="$(gcloud config get-value account 2>/dev/null)"
ACCOUNT_ID="${ACCOUNT_ID:-$DETECTED_ACCOUNT}"

if ! gcloud auth print-access-token >/dev/null 2>&1; then
    echo
    echo "GCP credentials unavailable or expired."
    if [ -n "$ACCOUNT_ID" ]; then
        echo "Starting authentication for: $ACCOUNT_ID"
        gcloud auth login "$ACCOUNT_ID"
    else
        echo "Starting standard GCP authentication..."
        gcloud auth login
    fi

    if ! gcloud auth print-access-token >/dev/null 2>&1; then
        echo
        echo "ERROR: GCP authentication failed."
        echo "Run: gcloud auth login"
        echo
        return 1 2>/dev/null || exit 1
    fi
fi

# Refresh detected account post-auth
ACCOUNT_ID="$(gcloud config get-value account 2>/dev/null)"

# ------------------------------------------------------------------
# 2. Set Active GCP Account
# ------------------------------------------------------------------
echo "[2/7] Confirming active GCP account ($ACCOUNT_ID)..."
if [ -n "$ACCOUNT_ID" ]; then
    gcloud config set account "$ACCOUNT_ID" >/dev/null 2>&1
fi

# ------------------------------------------------------------------
# 3. Select Project
# ------------------------------------------------------------------
echo "[3/7] Selecting GCP project ($PROJECT_ID)..."
gcloud config set project "$PROJECT_ID" >/dev/null

# ------------------------------------------------------------------
# 4. Select Cloud Run Region
# ------------------------------------------------------------------
echo "[4/7] Selecting Cloud Run region ($REGION_ID)..."
gcloud config set run/region "$REGION_ID" >/dev/null

# ------------------------------------------------------------------
# 5. Restore Session Environment Variables
# ------------------------------------------------------------------
echo "[5/7] Restoring environment variables..."

export GCP_PROJECT="$PROJECT_ID"
export REGION="$REGION_ID"
export SQL_INSTANCE="$SQL_INSTANCE_ID"

export DB_USER="${DB_USER:-postgres}"
export DB_NAME="${DB_NAME:-postgres}"

if [ -z "${DB_PASS:-}" ]; then
    echo
    read -rsp "Enter DB_PASS: " DB_PASS
    echo
    export DB_PASS
fi

# ------------------------------------------------------------------
# 6. Retrieve Persistent GCP Resource Identifiers
# ------------------------------------------------------------------
echo "[6/7] Retrieving Cloud SQL and Cloud Run identifiers..."

INSTANCE_CONN_RESULT="$(
    gcloud sql instances describe "$SQL_INSTANCE" \
        --project="$GCP_PROJECT" \
        --format="value(connectionName)" 2>/dev/null
)"

if [ -z "$INSTANCE_CONN_RESULT" ]; then
    echo
    echo "WARNING: Could not retrieve Cloud SQL connection name for '$SQL_INSTANCE'."
    echo "Verify database instance name and project permissions."
    export INSTANCE_CONN=""
else
    export INSTANCE_CONN="$INSTANCE_CONN_RESULT"
fi

SERVICE_URL_RESULT="$(
    gcloud run services describe "$CLOUD_RUN_SERVICE" \
        --project="$GCP_PROJECT" \
        --region="$REGION" \
        --format="value(status.url)" \
        2>/dev/null
)"

if [ -n "$SERVICE_URL_RESULT" ]; then
    export SERVICE_URL="$SERVICE_URL_RESULT"
else
    export SERVICE_URL=""
fi

# ------------------------------------------------------------------
# 7. Display Configuration
# ------------------------------------------------------------------
echo "[7/7] Session initialized."
echo

echo "============================================================"
echo " Active Configuration"
echo "============================================================"
echo "Account       : $(gcloud config get-value account)"
echo "Project       : $GCP_PROJECT"
echo "Region        : $REGION"
echo "SQL Instance  : $SQL_INSTANCE"
echo "SQL Conn      : ${INSTANCE_CONN:-NOT AVAILABLE}"
echo "Cloud Run     : $CLOUD_RUN_SERVICE"
echo "Service URL   : ${SERVICE_URL:-NOT DEPLOYED YET}"
echo "DB User       : $DB_USER"
echo "DB Name       : $DB_NAME"
echo "============================================================"
echo

# ------------------------------------------------------------------
# Cloud SQL Status Check
# ------------------------------------------------------------------
if [ -n "$INSTANCE_CONN" ]; then
    echo "Cloud SQL status:"
    gcloud sql instances describe "$SQL_INSTANCE" \
        --project="$GCP_PROJECT" \
        --format="value(state,settings.activationPolicy)" 2>/dev/null
fi

echo
echo "Session initialization complete. Run 'source session-init.sh' whenever starting a new shell."
echo