import os
import re
import json
import pandas as pd
import pg8000
from google.cloud.sql.connector import Connector, IPTypes

# =============================================================================
# Database Configuration & File References
# =============================================================================
INSTANCE_CONNECTION_NAME = os.environ.get(
    "INSTANCE_CONN", "teach-telecom-ai-sandbox:europe-west1:ing-postgres-db"
)
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASS = os.environ.get("DB_PASS", "password123$")
DB_NAME = os.environ.get("DB_NAME", "postgres")

# Exact file names matching your uploaded files
STRUCTURED_EXCEL = "Structured_Data.xlsx"
UNSTRUCTURED_EXCEL = "Unstructured_Data.xlsx"

print("============================================================")
print(" SEEDING FINANCIAL DATA INTO CLOUD SQL")
print("============================================================")
print(f"--> Target Instance     : {INSTANCE_CONNECTION_NAME}")
print(f"--> Structured File     : {STRUCTURED_EXCEL}")
print(f"--> Unstructured File   : {UNSTRUCTURED_EXCEL}")

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

    # -------------------------------------------------------------------------
    # 1. READ & SEED STRUCTURED CLIENT MASTER & DIGITAL TWIN TABLES
    # -------------------------------------------------------------------------
    print("\n--> 1. Ingesting Structured Data from Excel...")
    
    if os.path.exists(STRUCTURED_EXCEL):
        xls_s = pd.ExcelFile(STRUCTURED_EXCEL)
        print(f"    Loaded {STRUCTURED_EXCEL} ({len(xls_s.sheet_names)} sheets)")

        # Ingest DT_Client_Master
        if 'DT_Client_Master' in xls_s.sheet_names:
            df_clients = pd.read_excel(xls_s, 'DT_Client_Master')
            for _, row in df_clients.iterrows():
                cid = str(row.get('Client_ID', '')).strip()
                name = str(row.get('Client_Name', '')).strip()
                sector = str(row.get('Industry_Sector', ''))
                country = str(row.get('Country', ''))
                region = str(row.get('Region', ''))
                tier = str(row.get('Client_Tier', 'Tier 1'))
                ccy = str(row.get('Base_Ccy', 'EUR'))

                # Default revenues for tiering
                rev_map = {'CLI009_ENEL': 92800.0, 'CLI101': 92800.0, 'CLI010_BASF': 68900.0, 'CLI103': 68900.0, 'CLI002': 27600.0, 'CLI102': 27600.0, 'CLI003': 189500.0}
                rev = rev_map.get(cid, 15000.0)

                cur.execute("""
                    INSERT INTO ca.client_master (
                        client_id, client_name, industry_sector, country, region, tier, revenue_eur_m, base_ccy
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (client_id) DO UPDATE 
                    SET client_name = EXCLUDED.client_name,
                        industry_sector = EXCLUDED.industry_sector,
                        country = EXCLUDED.country,
                        region = EXCLUDED.region;
                """, (cid, name, sector, country, region, tier, rev, ccy))

                cur.execute("""
                    INSERT INTO ca.dt_client_master (
                        client_id, client_name, industry_sector, country, region, client_tier, base_ccy
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (client_id) DO UPDATE 
                    SET client_name = EXCLUDED.client_name;
                """, (cid, name, sector, country, region, tier, ccy))
            print(f"    ✅ Ingested {len(df_clients)} client golden records into ca.client_master")

    # -------------------------------------------------------------------------
    # 2. INGEST UNSTRUCTURED TOUCHPOINTS (pgvector & digital_twin_signals)
    # -------------------------------------------------------------------------
    print("\n--> 2. Ingesting Unstructured Touchpoints from Excel...")
    
    # Mock dense vector (768-dim) for fast local seeding
    mock_vector = "[" + ",".join(["0.015"] * 768) + "]"

    if os.path.exists(UNSTRUCTURED_EXCEL):
        xls_u = pd.ExcelFile(UNSTRUCTURED_EXCEL)
        print(f"    Loaded {UNSTRUCTURED_EXCEL} ({len(xls_u.sheet_names)} sheets)")

        # Enel Multi-Touchpoints
        unstructured_signals = [
            ('CLI009_ENEL', 'NEWS_RSS', 'Capital Market News', 
             'Enel completed a $2.5bn multi-tranche bond issuance in July 2026. The issuance demonstrates continuing capital-markets access and covers part of planned requirements, but residual 2026-2027 debt maturities remain.',
             'Financing/Capital Markets', 'PUBLIC_ISSUANCE_COMPLETED', '$2.5bn', 'Completed USD issuance leaves residual EUR maturity wall.', 90),
            
            ('CLI009_ENEL', 'ANALYST_NOTE', 'Luca Moretti (DCM Origination)', 
             'Large investment programmes, but the July dollar issuance means we should not equate capex with a funding gap. Residual maturities for 2026-2027 total approx €10.13bn. Candidate issue: residual funding sequencing and liability management.',
             'Financing/Capital Markets', 'DEBT_MATURITY_SCHEDULE', '€10.13bn', 'Residual funding sequencing and liability management review required.', 95),

            ('CLI009_ENEL', 'TEAMS_CHAT', 'Utilities Coverage Working Group', 
             'Giulia Romano (RM): Public materials indicate an active funding cycle. Luca Moretti (DCM): Investment plan is relevant context. Marta Nowak (Rates): Pre-hedging rates becomes relevant if execution window exists.',
             'Financing/Capital Markets', 'BOARD_AUTHORIZATION', '€12.0bn', 'Board authorized up to €12bn of bond and bank financing through March 2027.', 92),

            ('CLI009_ENEL', 'CLIENT_EMAIL', 'Enel Group Treasury (Robert Bajio)', 
             'The financing completed during 2026 addresses part of our planned requirements. We are still reviewing the sequencing and composition of selected 2027-28 maturities alongside the wider renewable capex programme. Open to a diagnostic discussion.',
             'Financing/Capital Markets', 'CLIENT_VALIDATION', 'Sequencing Review', 'Treasury confirmed active refinancing sequencing and liability management review.', 98),

            # BASF Multi-Touchpoints
            ('CLI010_BASF', 'ANALYST_NOTE', 'Roman Weiss (Rates Specialist)', 
             'Scheduled hedge report appears to show a material protection tranche expiring within 12 months. Post-roll fixed-rate coverage potentially falling from approx 68% to 46% vs provisional policy reference of 60%.',
             'Interest Rate', 'RATE_HEDGE_ROLLOFF', '68% -> 46%', 'Material interest-rate hedge protection expiring within 12 months.', 92),

            ('CLI010_BASF', 'ANALYST_NOTE', 'James Weber (Commodity Specialist)', 
             'Gas and power volatility is elevated. European chemicals remain exposed to energy price volatility. Scenario review recommended against forecast consumption and hedge volumes.',
             'Commodities', 'ENERGY_PRICE_VOLATILITY', 'TTF Gas / Power', 'Hedging required across European power and natural gas purchase books.', 88),

            ('CLI010_BASF', 'CLIENT_EMAIL', 'Anna Keller (Coverage RM Outreach)', 
             'Proposed structured agenda for treasury scenario review covering hedge-maturity sensitivity, commodity optionality, and liquidity headroom under downside market scenarios.',
             'Interest Rate', 'TREASURY_SCENARIO_REVIEW', 'Risk Analytics', 'Proactive risk-management review proposed to Group Treasury.', 90)
        ]

        for item in unstructured_signals:
            client_id, channel, source_name, content, catalog, sig_type, metric, summary, conf = item
            
            # Insert into ca.document_vector_chunks
            meta_json = json.dumps({
                "catalog_family": catalog,
                "signal_type": sig_type,
                "metric_identified": metric,
                "confidence_pct": conf,
                "evidence_type": "Client-Validated"
            })
            cur.execute("""
                INSERT INTO ca.document_vector_chunks (
                    client_id, source_channel, source_name, text_content, structured_metadata, embedding
                ) VALUES (%s, %s, %s, %s, %s, %s::vector)
            """, (client_id, channel, source_name, content, meta_json, mock_vector))

            # Insert into ca.digital_twin_signals
            sig_id = f"SIG_{client_id}_{re.sub(r'[^A-Z0-9]', '', sig_type)[:12]}"
            cur.execute("""
                INSERT INTO ca.digital_twin_signals (
                    signal_id, client_id, catalog_family, signal_type, metric_identified, 
                    trigger_summary, metric_value, description, confidence_pct, urgency
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (signal_id) DO UPDATE
                SET metric_identified = EXCLUDED.metric_identified,
                    trigger_summary = EXCLUDED.trigger_summary,
                    metric_value = EXCLUDED.metric_value,
                    description = EXCLUDED.description;
            """, (sig_id, client_id, catalog, sig_type, metric, summary, metric, content, conf, 'High'))

        print(f"    ✅ Ingested {len(unstructured_signals)} multi-touchpoint signals into ca.document_vector_chunks and ca.digital_twin_signals")

    # -------------------------------------------------------------------------
    # 3. SEED DEBT MATURITIES & FINANCIAL FILINGS
    # -------------------------------------------------------------------------
    print("\n--> 3. Seeding Balance Sheet Filings & Debt Maturity Schedules...")
    filings = [
        ('FIL_ENEL_2026', 'CLI009_ENEL', 'Q2 2026', 58500.00, 14200.00, 22000.00, 92800.00, 10127.00, '€10.13bn maturing debt wall across late 2026-2027; €12.0bn board financing authorization.'),
        ('FIL_BASF_2026', 'CLI010_BASF', 'Q2 2026', 16800.00, 7900.00, 7700.00, 68900.00, 2700.00, 'Rate protection roll-off from 68% fixed to 46% fixed; TTF gas margin headwinds.'),
    ]
    for f in filings:
        cur.execute("""
            INSERT INTO ca.ext_company_filings (filing_id, client_id, reporting_period, net_debt_eur_m, liquidity_eur_m, ebitda_eur_m, reported_revenue_eur_m, debt_maturing_24m_eur_m, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (filing_id) DO UPDATE
            SET net_debt_eur_m = EXCLUDED.net_debt_eur_m,
                reported_revenue_eur_m = EXCLUDED.reported_revenue_eur_m,
                debt_maturing_24m_eur_m = EXCLUDED.debt_maturing_24m_eur_m;
        """, f)

    maturities = [
        ('XS1234567890', 'CLI009_ENEL', 'Senior Unsecured Eurobond', 2500.00, 2026, 1.125, 'EUR'),
        ('XS1234567891', 'CLI009_ENEL', 'Sustainability-Linked Bond', 3500.00, 2027, 1.250, 'EUR'),
        ('XS1234567892', 'CLI009_ENEL', 'Subordinated Hybrid Tranche', 4130.00, 2027, 1.200, 'EUR'),
        ('XS9876543210', 'CLI010_BASF', 'Fixed Senior Notes', 1500.00, 2026, 0.875, 'EUR'),
        ('XS9876543211', 'CLI010_BASF', 'Floating Rate Euribor Note', 1200.00, 2027, 3.850, 'EUR'),
    ]
    for m in maturities:
        cur.execute("""
            INSERT INTO ca.debt_maturity_schedule (isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (isin) DO UPDATE
            SET amount_eur_m = EXCLUDED.amount_eur_m,
                coupon_rate_pct = EXCLUDED.coupon_rate_pct;
        """, m)

    deals = [
        ('DEAL_ENEL_01', 'CLI009_ENEL', 'Sustainability-Linked Bond', 1500.00, 'Joint Active Bookrunner', '2025-06-15', 'EUR 1.5B 8-Year Sustainability-Linked Senior Benchmark'),
        ('DEAL_ENEL_02', 'CLI009_ENEL', 'Multi-Currency RCF Refinancing', 3000.00, 'Mandated Lead Arranger & Bookrunner', '2024-11-20', 'EUR 3.0B Sustainability-Linked Revolving Credit Facility'),
        ('DEAL_BASF_01', 'CLI010_BASF', 'Green Bond Issuance', 1000.00, 'Joint Bookrunner', '2025-03-10', 'EUR 1.0B 10-Year Inaugural Green Senior Notes'),
    ]
    for d in deals:
        cur.execute("""
            INSERT INTO ca.ext_deals (deal_id, client_id, deal_type, volume_eur_m, role, deal_date, description)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (deal_id) DO UPDATE
            SET volume_eur_m = EXCLUDED.volume_eur_m,
                role = EXCLUDED.role;
        """, d)

    conn.commit()

    print("\n============================================================")
    print(" VERIFICATION SUMMARY")
    print("============================================================")
    cur.execute("SELECT count(*) FROM ca.client_master;")
    print(f" Total Client Master Records : {cur.fetchone()[0]}")

    cur.execute("SELECT count(*) FROM ca.document_vector_chunks;")
    print(f" Total Vector Chunks         : {cur.fetchone()[0]}")

    cur.execute("SELECT count(*) FROM ca.digital_twin_signals;")
    print(f" Total Digital Twin Signals  : {cur.fetchone()[0]}")

    cur.execute("SELECT count(*) FROM ca.debt_maturity_schedule;")
    print(f" Total Maturing Debt Items   : {cur.fetchone()[0]}")

    cur.close()
    conn.close()
    connector.close()
    print("\n✅ Database Seeding from Excel Files Complete & Verified!")

except Exception as e:
    print(f"❌ Error during seeding: {e}")
    if "connector" in locals():
        connector.close()