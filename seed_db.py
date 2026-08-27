import os
import pg8000
from google.cloud.sql.connector import Connector, IPTypes

INSTANCE_CONNECTION_NAME = os.environ.get(
    "INSTANCE_CONN", "teach-telecom-ai-sandbox:europe-west1:ing-postgres-db"
)
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASS = os.environ.get("DB_PASS", "password123$")
DB_NAME = os.environ.get("DB_NAME", "postgres")

print("============================================================")
print(" STEP 1: INITIALIZING CLOUD SQL POSTGRESQL SCHEMA (DDL)")
print("============================================================")
print(f"--> Target Instance: {INSTANCE_CONNECTION_NAME}")

connector = Connector()

try:
    conn = connector.connect(
        INSTANCE_CONNECTION_NAME,
        "pg8000",
        user=DB_USER,
        password=DB_PASS,
        db=DB_NAME,
        ip_type=IPTypes.PUBLIC,
    )
    cur = conn.cursor()

    print("--> Enabling extensions: vector, pgcrypto...")
    cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    cur.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    cur.execute("CREATE SCHEMA IF NOT EXISTS ca;")

    print("--> Creating/Verifying Master Relational & Vector Tables...")
    cur.execute("""
        -- 1. Client Master Golden Records
        CREATE TABLE IF NOT EXISTS ca.client_master (
            client_id VARCHAR(50) PRIMARY KEY,
            client_name VARCHAR(150) NOT NULL,
            group_parent VARCHAR(150),
            legal_entity VARCHAR(150),
            industry_sector VARCHAR(100),
            country VARCHAR(100),
            region VARCHAR(100),
            ownership_type VARCHAR(100),
            tier VARCHAR(50) DEFAULT 'Tier 1',
            hq_country VARCHAR(100),
            revenue_eur_m NUMERIC(12, 2),
            rm_name VARCHAR(150),
            base_ccy VARCHAR(10) DEFAULT 'EUR'
        );

        CREATE TABLE IF NOT EXISTS ca.dt_client_master (
            client_id VARCHAR(50) PRIMARY KEY,
            client_name VARCHAR(150) NOT NULL,
            group_parent VARCHAR(150),
            legal_entity VARCHAR(150),
            industry_sector VARCHAR(100),
            country VARCHAR(100),
            region VARCHAR(100),
            ownership_type VARCHAR(100),
            client_tier VARCHAR(50),
            base_ccy VARCHAR(10)
        );

        CREATE TABLE IF NOT EXISTS ca.cand5_client_master (
            client_id VARCHAR(50) PRIMARY KEY,
            client_name VARCHAR(150) NOT NULL,
            group_parent VARCHAR(150),
            legal_entity VARCHAR(150),
            industry_sector VARCHAR(100),
            country VARCHAR(100),
            region VARCHAR(100),
            ownership_type VARCHAR(100),
            client_tier VARCHAR(50),
            base_ccy VARCHAR(10),
            maps_to_original_id VARCHAR(50),
            approach_overall_assessment TEXT
        );

        -- 2. Document Vector Chunks (pgvector 768-dim)
        CREATE TABLE IF NOT EXISTS ca.document_vector_chunks (
            chunk_id BIGSERIAL PRIMARY KEY,
            client_id VARCHAR(50),
            source_channel VARCHAR(50),
            source_name VARCHAR(255),
            text_content TEXT,
            structured_metadata JSONB,
            embedding VECTOR(768),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- 3. Digital Twin Signals
        CREATE TABLE IF NOT EXISTS ca.digital_twin_signals (
            signal_id VARCHAR(50) PRIMARY KEY,
            client_id VARCHAR(50),
            catalog_family VARCHAR(100),
            signal_type VARCHAR(100),
            metric_identified TEXT,
            trigger_summary TEXT,
            metric_value VARCHAR(100),
            description TEXT,
            confidence_pct INT DEFAULT 90,
            urgency VARCHAR(20) DEFAULT 'High',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- 4. Balance Sheet Filings & Financials
        CREATE TABLE IF NOT EXISTS ca.ext_company_filings (
            filing_id VARCHAR(50) PRIMARY KEY,
            client_id VARCHAR(50),
            reporting_period VARCHAR(50),
            net_debt_eur_m NUMERIC(12, 2),
            liquidity_eur_m NUMERIC(12, 2),
            ebitda_eur_m NUMERIC(12, 2),
            reported_revenue_eur_m NUMERIC(12, 2),
            debt_maturing_24m_eur_m NUMERIC(12, 2),
            notes TEXT
        );

        -- 5. Debt Maturity & Derivatives Register
        CREATE TABLE IF NOT EXISTS ca.debt_maturity_schedule (
            isin VARCHAR(50) PRIMARY KEY,
            client_id VARCHAR(50),
            instrument_type VARCHAR(100),
            amount_eur_m NUMERIC(12, 2),
            maturity_year INT,
            coupon_rate_pct NUMERIC(6, 3),
            currency VARCHAR(10) DEFAULT 'EUR'
        );

        -- 6. External Deals Track Record
        CREATE TABLE IF NOT EXISTS ca.ext_deals (
            deal_id VARCHAR(50) PRIMARY KEY,
            client_id VARCHAR(50),
            deal_type VARCHAR(100),
            volume_eur_m NUMERIC(12, 2),
            role VARCHAR(100),
            deal_date DATE,
            description TEXT
        );

        -- 7. Market Rates, Curves & Credit Spreads
        CREATE TABLE IF NOT EXISTS ca.mkt_rates_curves (
            curve_id SERIAL PRIMARY KEY,
            curve_date DATE,
            currency VARCHAR(10),
            tenor VARCHAR(20),
            swap_rate_pct NUMERIC(6, 3),
            govt_yield_pct NUMERIC(6, 3),
            category VARCHAR(50)
        );

        CREATE TABLE IF NOT EXISTS ca.ext_credit_spreads (
            spread_id SERIAL PRIMARY KEY,
            quote_date DATE,
            issuer_or_rating VARCHAR(100),
            sector VARCHAR(100),
            tenor VARCHAR(20),
            spread_bps NUMERIC(8, 2),
            all_in_yield_pct NUMERIC(6, 3),
            source VARCHAR(100)
        );

        -- 8. Opportunity Scoring & Lifecycle
        CREATE TABLE IF NOT EXISTS ca.ca_opportunity_scoring (
            opportunity_id VARCHAR(50) PRIMARY KEY,
            client_id VARCHAR(50),
            opportunity_type VARCHAR(150),
            trigger_source TEXT,
            est_revenue_eur_000 NUMERIC(10, 2),
            propensity_score INT,
            value_score INT,
            priority_score INT,
            rank INT,
            next_best_action TEXT,
            why_now_nlg TEXT
        );
    """)

    conn.commit()
    print("✅ All master schema tables and vector extensions initialized successfully!")

    cur.close()
    conn.close()
    connector.close()

except Exception as e:
    print(f"❌ Error during schema initialization: {e}")
    if "connector" in locals():
        connector.close()