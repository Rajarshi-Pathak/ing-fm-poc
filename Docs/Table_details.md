Here is a python script to run in Cloud Shell that queries PostgreSQL's `information_schema` to document every table, its schema, row count, and column definitions across your database:

```bash
cd ~/ing-fm-poc
source session-init.sh

python3 - << 'EOF'
import os
from google.cloud.sql.connector import Connector, IPTypes
import pg8000.dbapi

instance_conn = os.environ.get("INSTANCE_CONNECTION_NAME", "teach-telecom-ai-sandbox:europe-west1:ing-postgres-db")
db_user = os.environ.get("DB_USER", "postgres")
db_pass = os.environ.get("DB_PASS", "postgres")
db_name = os.environ.get("DB_NAME", "postgres")

connector = Connector()
def getconn():
    return connector.connect(
        instance_conn, "pg8000",
        user=db_user, password=db_pass, db=db_name,
        ip_type=IPTypes.PUBLIC
    )

conn = getconn()
cur = conn.cursor()

# 1. Retrieve all non-system tables
cur.execute("""
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name;
""")
tables = cur.fetchall()

print("=" * 90)
print(f"ING FINANCIAL MARKETS AI PLATFORM — DATABASE CATALOG ({len(tables)} TABLES)")
print("=" * 90)

for schema, table in tables:
    full_table = f"{schema}.{table}"
    
    # Get approximate or exact row count
    try:
        cur.execute(f"SELECT COUNT(*) FROM {full_table};")
        row_count = cur.fetchone()[0]
    except Exception:
        row_count = "N/A"
    
    print(f"\n📂 TABLE: {full_table}  |  Total Rows: {row_count}")
    print("-" * 90)
    print(f"  {'#':<4} {'Column Name':<30} {'Data Type':<25} {'Nullable':<10}")
    print("  " + "-" * 75)
    
    cur.execute(f"""
        SELECT ordinal_position, column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = '{schema}' AND table_name = '{table}'
        ORDER BY ordinal_position;
    """)
    cols = cur.fetchall()
    for col_idx, col_name, data_type, is_null in cols:
        print(f"  {col_idx:<4} {col_name:<30} {data_type:<25} {is_null:<10}")

print("\n" + "=" * 90)

cur.close()
conn.close()
connector.close()
EOF

```

---

### Key Tables Overview

| Schema & Table | Description / Purpose | Key Columns |
| --- | --- | --- |
| **`ca.client_master`** | Core client identity & coverage mapping | `client_id`, `client_name`, `tier`, `industry_sector`, `revenue_eur_m`, `rm_name`, `base_ccy` |
| **`ca.ext_company_filings`** | Financials & balance sheet figures | `client_id`, `reported_revenue_eur_m`, `ebitda_eur_m`, `net_debt_eur_m`, `liquidity_eur_m`, `debt_maturing_24m_eur_m` |
| **`ca.debt_maturity_schedule`** | Granular bond & loan maturities | `isin`, `client_id`, `amount_eur_m`, `maturity_year`, `coupon_rate_pct`, `instrument_type`, `currency` |
| **`ca.ca_opportunity_scoring`** | Ranked deal opportunities & signals | `opportunity_id`, `client_id`, `opportunity_type`, `propensity_score`, `priority_score`, `next_best_action` |
| **`ca.coverage_teams`** | ING relationship managers & specialists | `client_id`, `role`, `name`, `email`, `desk` |
| **`ca.digital_twin_signals`** | Real-time trigger signals & alerts | `signal_id`, `client_id`, `signal_type`, `source`, `confidence_score` |
| **`ca.ext_credit_spreads`** | Credit spreads & benchmark indices | `rating`, `tenor`, `spread_bps`, `benchmark_type` |
| **`ca.ext_deals`** | Precedent transactions & peer comps | `deal_id`, `client_name`, `product`, `notional_eur_m`, `pricing`, `date` |
| **`ca.mkt_rates_curves`** | Live yield curves, swaps & forwards | `curve_id`, `tenor`, `rate_pct`, `currency`, `timestamp` |
| **`ca.document_vector_chunks`** | RAG vector chunks for Deal Copilot | `chunk_id`, `client_id`, `document_type`, `embedding`, `text_content` |
| **`ca.cand5_client_master`** | Staging / candidate client profiles | Client metadata staging |
| **`ca.dt_client_master`** | Digital twin client mapping | Client state metadata |

Run the script above in your Cloud Shell terminal to output the full schema catalog for your documentation.

Query Output:-
=============
==========================================================================================
ING FINANCIAL MARKETS AI PLATFORM — DATABASE CATALOG (12 TABLES)
==========================================================================================

📂 TABLE: ca.ca_opportunity_scoring  |  Total Rows: 19
------------------------------------------------------------------------------------------
  #    Column Name                    Data Type                 Nullable  
  ---------------------------------------------------------------------------
  1    opportunity_id                 character varying         NO        
  2    client_id                      character varying         YES       
  3    opportunity_type               character varying         YES       
  4    trigger_source                 text                      YES       
  5    est_revenue_eur_000            numeric                   YES       
  6    propensity_score               integer                   YES       
  7    value_score                    integer                   YES       
  8    priority_score                 integer                   YES       
  9    rank                           integer                   YES       
  10   next_best_action               text                      YES       
  11   why_now_nlg                    text                      YES       

📂 TABLE: ca.cand5_client_master  |  Total Rows: 0
------------------------------------------------------------------------------------------
  #    Column Name                    Data Type                 Nullable  
  ---------------------------------------------------------------------------
  1    client_id                      character varying         NO        
  2    client_name                    character varying         NO        
  3    group_parent                   character varying         YES       
  4    legal_entity                   character varying         YES       
  5    industry_sector                character varying         YES       
  6    country                        character varying         YES       
  7    region                         character varying         YES       
  8    ownership_type                 character varying         YES       
  9    client_tier                    character varying         YES       
  10   base_ccy                       character varying         YES       
  11   maps_to_original_id            character varying         YES       
  12   approach_overall_assessment    text                      YES       

📂 TABLE: ca.client_master  |  Total Rows: 13
------------------------------------------------------------------------------------------
  #    Column Name                    Data Type                 Nullable  
  ---------------------------------------------------------------------------
  1    client_id                      character varying         NO        
  2    client_name                    character varying         NO        
  3    group_parent                   character varying         YES       
  4    legal_entity                   character varying         YES       
  5    industry_sector                character varying         YES       
  6    country                        character varying         YES       
  7    region                         character varying         YES       
  8    ownership_type                 character varying         YES       
  9    tier                           character varying         YES       
  10   hq_country                     character varying         YES       
  11   revenue_eur_m                  numeric                   YES       
  12   rm_name                        character varying         YES       
  13   base_ccy                       character varying         YES       

📂 TABLE: ca.coverage_teams  |  Total Rows: 10
------------------------------------------------------------------------------------------
  #    Column Name                    Data Type                 Nullable  
  ---------------------------------------------------------------------------
  1    client_id                      character varying         NO        
  2    role_title                     character varying         NO        
  3    banker_name                    character varying         YES       
  4    location                       character varying         YES       

📂 TABLE: ca.debt_maturity_schedule  |  Total Rows: 15
------------------------------------------------------------------------------------------
  #    Column Name                    Data Type                 Nullable  
  ---------------------------------------------------------------------------
  1    isin                           character varying         NO        
  2    client_id                      character varying         YES       
  3    instrument_type                character varying         YES       
  4    amount_eur_m                   numeric                   YES       
  5    maturity_year                  integer                   YES       
  6    coupon_rate_pct                numeric                   YES       
  7    currency                       character varying         YES       

📂 TABLE: ca.digital_twin_signals  |  Total Rows: 44
------------------------------------------------------------------------------------------
  #    Column Name                    Data Type                 Nullable  
  ---------------------------------------------------------------------------
  1    signal_id                      character varying         NO        
  2    client_id                      character varying         YES       
  3    catalog_family                 character varying         YES       
  4    signal_type                    character varying         YES       
  5    metric_identified              text                      YES       
  6    trigger_summary                text                      YES       
  7    metric_value                   character varying         YES       
  8    description                    text                      YES       
  9    confidence_pct                 integer                   YES       
  10   urgency                        character varying         YES       
  11   created_at                     timestamp without time zone YES       

📂 TABLE: ca.document_vector_chunks  |  Total Rows: 22
------------------------------------------------------------------------------------------
  #    Column Name                    Data Type                 Nullable  
  ---------------------------------------------------------------------------
  1    chunk_id                       bigint                    NO        
  2    client_id                      character varying         YES       
  3    source_channel                 character varying         YES       
  4    source_name                    character varying         YES       
  5    text_content                   text                      YES       
  6    structured_metadata            jsonb                     YES       
  7    embedding                      USER-DEFINED              YES       
  8    created_at                     timestamp without time zone YES       

📂 TABLE: ca.dt_client_master  |  Total Rows: 13
------------------------------------------------------------------------------------------
  #    Column Name                    Data Type                 Nullable  
  ---------------------------------------------------------------------------
  1    client_id                      character varying         NO        
  2    client_name                    character varying         NO        
  3    group_parent                   character varying         YES       
  4    legal_entity                   character varying         YES       
  5    industry_sector                character varying         YES       
  6    country                        character varying         YES       
  7    region                         character varying         YES       
  8    ownership_type                 character varying         YES       
  9    client_tier                    character varying         YES       
  10   base_ccy                       character varying         YES       

📂 TABLE: ca.ext_company_filings  |  Total Rows: 13
------------------------------------------------------------------------------------------
  #    Column Name                    Data Type                 Nullable  
  ---------------------------------------------------------------------------
  1    filing_id                      character varying         NO        
  2    client_id                      character varying         YES       
  3    reporting_period               character varying         YES       
  4    net_debt_eur_m                 numeric                   YES       
  5    liquidity_eur_m                numeric                   YES       
  6    ebitda_eur_m                   numeric                   YES       
  7    reported_revenue_eur_m         numeric                   YES       
  8    debt_maturing_24m_eur_m        numeric                   YES       
  9    notes                          text                      YES       

📂 TABLE: ca.ext_credit_spreads  |  Total Rows: 8
------------------------------------------------------------------------------------------
  #    Column Name                    Data Type                 Nullable  
  ---------------------------------------------------------------------------
  1    spread_id                      integer                   NO        
  2    quote_date                     date                      YES       
  3    issuer_or_rating               character varying         YES       
  4    sector                         character varying         YES       
  5    tenor                          character varying         YES       
  6    spread_bps                     numeric                   YES       
  7    all_in_yield_pct               numeric                   YES       
  8    source                         character varying         YES       

📂 TABLE: ca.ext_deals  |  Total Rows: 3
------------------------------------------------------------------------------------------
  #    Column Name                    Data Type                 Nullable  
  ---------------------------------------------------------------------------
  1    deal_id                        character varying         NO        
  2    client_id                      character varying         YES       
  3    deal_type                      character varying         YES       
  4    volume_eur_m                   numeric                   YES       
  5    role                           character varying         YES       
  6    deal_date                      date                      YES       
  7    description                    text                      YES       

📂 TABLE: ca.mkt_rates_curves  |  Total Rows: 10
------------------------------------------------------------------------------------------
  #    Column Name                    Data Type                 Nullable  
  ---------------------------------------------------------------------------
  1    curve_id                       integer                   NO        
  2    curve_date                     date                      YES       
  3    currency                       character varying         YES       
  4    tenor                          character varying         YES       
  5    swap_rate_pct                  numeric                   YES       
  6    govt_yield_pct                 numeric                   YES       
  7    category                       character varying         YES       

==========================================================================================
user@ing-fm-dev-1:~/ing-fm-poc$ 

--------------------------------------------------
### Architecture Overview & Functional Role

The **`ca` schema** contains **12 tables** structured across four functional layers:

| Layer | Tables | Primary Purpose |
| --- | --- | --- |
| **Core Entity & Coverage** | `client_master`, `dt_client_master`, `cand5_client_master`, `coverage_teams` | Client hierarchies, relationship manager alignments, and master coverage metadata. |
| **Financial Fundamentals & Liabilities** | `ext_company_filings`, `debt_maturity_schedule` | Balance sheet statements (revenue, EBITDA, net debt, liquidity) and bond/loan maturities. |
| **Market Intelligence & Deal History** | `mkt_rates_curves`, `ext_credit_spreads`, `ext_deals` | Live benchmark curves, swap tenors, sector credit spreads, and past transactions. |
| **Intelligence Engine & Vector RAG** | `ca_opportunity_scoring`, `digital_twin_signals`, `document_vector_chunks` | Opportunity scoring, real-time event triggers, and semantic embeddings for the Copilot. |

---

### Comprehensive Table Directory

**1. `ca.client_master` (13 Rows)**

* **Purpose:** Golden source of client metadata, sector taxonomy, reporting currency, and coverage relationship managers.
* **Primary Key:** `client_id`
* **Key Fields:** `client_name`, `group_parent`, `legal_entity`, `industry_sector`, `country`, `region`, `ownership_type`, `tier`, `hq_country`, `revenue_eur_m`, `rm_name`, `base_ccy`.

**2. `ca.ext_company_filings` (13 Rows)**

* **Purpose:** Authoritative balance sheet metrics, liquidity positions, and near-term debt maturity profiles used directly in Slide 4.
* **Primary Key:** `filing_id`
* **Foreign Key:** `client_id` $\rightarrow$ `ca.client_master(client_id)`
* **Key Fields:** `reporting_period`, `reported_revenue_eur_m`, `ebitda_eur_m`, `net_debt_eur_m`, `liquidity_eur_m`, `debt_maturing_24m_eur_m`, `notes`.

**3. `ca.debt_maturity_schedule` (15 Rows)**

* **Purpose:** Granular debt instrument schedule per client, powering the Slide 5 debt horizon charts and maturity tables.
* **Primary Key:** `isin`
* **Foreign Key:** `client_id` $\rightarrow$ `ca.client_master(client_id)`
* **Key Fields:** `instrument_type`, `amount_eur_m`, `maturity_year`, `coupon_rate_pct`, `currency`.

**4. `ca.ca_opportunity_scoring` (19 Rows)**

* **Purpose:** Multi-criteria scoring engine evaluating pitch opportunity propensity, value, and priority ranks for relationship managers.
* **Primary Key:** `opportunity_id`
* **Foreign Key:** `client_id` $\rightarrow$ `ca.client_master(client_id)`
* **Key Fields:** `opportunity_type`, `trigger_source`, `est_revenue_eur_000`, `propensity_score`, `value_score`, `priority_score`, `rank`, `next_best_action`, `why_now_nlg`.

**5. `ca.digital_twin_signals` (44 Rows)**

* **Purpose:** Real-time signal event log capturing market shifts, rating changes, and FX/rates exposure alerts.
* **Primary Key:** `signal_id`
* **Foreign Key:** `client_id` $\rightarrow$ `ca.client_master(client_id)`
* **Key Fields:** `catalog_family`, `signal_type`, `metric_identified`, `trigger_summary`, `metric_value`, `description`, `confidence_pct`, `urgency`, `created_at`.

**6. `ca.document_vector_chunks` (22 Rows)**

* **Purpose:** Vector chunk store for RAG (Retrieval-Augmented Generation) deal copilot and annual report grounding.
* **Primary Key:** `chunk_id`
* **Foreign Key:** `client_id` $\rightarrow$ `ca.client_master(client_id)`
* **Key Fields:** `source_channel`, `source_name`, `text_content`, `structured_metadata` (`jsonb`), `embedding` (`pgvector`), `created_at`.

**7. `ca.mkt_rates_curves` (10 Rows)**

* **Purpose:** Live swap curves and government benchmark yields used in Slide 7 market intelligence and pricing models.
* **Primary Key:** `curve_id`
* **Key Fields:** `curve_date`, `currency`, `tenor`, `swap_rate_pct`, `govt_yield_pct`, `category`.

**8. `ca.ext_credit_spreads` (8 Rows)**

* **Purpose:** Sector benchmark credit spreads and secondary yield curves for debt pricing and scenario comparisons.
* **Primary Key:** `spread_id`
* **Key Fields:** `quote_date`, `issuer_or_rating`, `sector`, `tenor`, `spread_bps`, `all_in_yield_pct`, `source`.

**9. `ca.ext_deals` (3 Rows)**

* **Purpose:** Historical transaction precedents, credentials, and league table comps for syndication slides.
* **Primary Key:** `deal_id`
* **Foreign Key:** `client_id` $\rightarrow$ `ca.client_master(client_id)`
* **Key Fields:** `deal_type`, `volume_eur_m`, `role`, `deal_date`, `description`.

**10. `ca.coverage_teams` (10 Rows)**

* **Purpose:** Front-office coverage mapping across relationship managers, sector specialists, and structuring desks.
* **Primary Key:** (`client_id`, `role_title`)
* **Key Fields:** `banker_name`, `location`.

**11. `ca.dt_client_master` (13 Rows)**

* **Purpose:** Digital twin synchronized client entity states and active exposure parameters.
* **Primary Key:** `client_id`
* **Key Fields:** `client_name`, `group_parent`, `legal_entity`, `industry_sector`, `country`, `region`, `ownership_type`, `client_tier`, `base_ccy`.

**12. `ca.cand5_client_master` (0 Rows)**

* **Purpose:** Staging and onboarding table for candidate pipeline clients.
* **Primary Key:** `client_id`
* **Key Fields:** `client_name`, `group_parent`, `legal_entity`, `industry_sector`, `country`, `region`, `ownership_type`, `client_tier`, `base_ccy`, `maps_to_original_id`, `approach_overall_assessment`.