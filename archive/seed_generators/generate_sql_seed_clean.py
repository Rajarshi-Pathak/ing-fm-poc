import os
import glob
import pandas as pd

excel_file = "Structured_Data.xlsx"
if not os.path.exists(excel_file):
    matches = glob.glob("**/Structured_Data.xlsx", recursive=True) + glob.glob("../Structured_Data.xlsx")
    if matches:
        excel_file = matches[0]

print(f"Reading structured data from: {excel_file}")

def esc(val):
    if pd.isna(val) or val is None:
        return "NULL"
    s = str(val).replace("'", "''").strip()
    return f"'{s}'"

def num(val, default=0):
    if pd.isna(val) or val is None:
        return str(default)
    try:
        return str(float(val))
    except Exception:
        return str(default)

sql_lines = []
sql_lines.append("CREATE SCHEMA IF NOT EXISTS ca;\n")

# -------------------------------------------------------------------------
# 1. ca.client_master
# -------------------------------------------------------------------------
df_cm = pd.read_excel(excel_file, sheet_name="DT_Client_Master")
df_cov = pd.read_excel(excel_file, sheet_name="DT_Coverage")
cov_dict = df_cov.set_index("Client_ID")["Relationship_Manager"].to_dict()

for _, row in df_cm.iterrows():
    cid = str(row["Client_ID"]).strip()
    cname = str(row["Client_Name"]).strip()
    rm = cov_dict.get(cid, "Coverage Director")
    sql_lines.append(f"""
INSERT INTO ca.client_master (client_id, client_name, group_parent, industry_sector, hq_country, region, tier, base_ccy, rm_name)
VALUES ({esc(cid)}, {esc(cname)}, {esc(row.get('Group_Parent'))}, {esc(row.get('Industry_Sector'))}, {esc(row.get('Country'))}, {esc(row.get('Region'))}, {esc(row.get('Client_Tier', 'Tier 1'))}, {esc(row.get('Base_Ccy', 'EUR'))}, {esc(rm)})
ON CONFLICT (client_id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    group_parent = EXCLUDED.group_parent,
    industry_sector = EXCLUDED.industry_sector,
    hq_country = EXCLUDED.hq_country,
    tier = EXCLUDED.tier,
    rm_name = EXCLUDED.rm_name;
""")

# -------------------------------------------------------------------------
# 2. ca.ext_company_filings (No client_name column)
# -------------------------------------------------------------------------
sql_lines.append("TRUNCATE TABLE ca.ext_company_filings;\n")
df_filings = pd.read_excel(excel_file, sheet_name="CA_Ext_CompanyFilings")

for _, row in df_filings.iterrows():
    total_debt = float(row.get("Total_Debt_EUR_mm", 0) or 0)
    liq = round(total_debt * 0.24, 2)
    net_debt = round(total_debt - liq, 2)
    if "Enel" in str(row["Client_Name"]):
        net_debt, liq = 58500.0, 14200.0
    elif "BASF" in str(row["Client_Name"]):
        net_debt, liq = 16200.0, 7800.0

    fdate = str(row.get("Filing_Date", "2025-03-15"))[:10]
    sql_lines.append(f"""
INSERT INTO ca.ext_company_filings 
(client_id, reporting_period, filing_type, filing_date, reported_revenue_eur_m, net_debt_eur_m, liquidity_eur_m, debt_maturing_24m_eur_m, usd_exposure_eur_m, source)
VALUES ({esc(row['Client_ID'])}, 'FY2024 / Q2 2026', {esc(row.get('Filing_Type'))}, '{fdate}', {num(row.get('Reported_Revenue_EUR_mm'))}, {net_debt}, {liq}, {num(row.get('Debt_Maturing_24m_EUR_mm'))}, {num(row.get('USD_Exposure_EUR_mm'))}, {esc(row.get('Source'))});
""")

# -------------------------------------------------------------------------
# 3. ca.debt_maturity_schedule (No client_name column)
# -------------------------------------------------------------------------
sql_lines.append("TRUNCATE TABLE ca.debt_maturity_schedule;\n")
df_debt = pd.read_excel(excel_file, sheet_name="DT_Debt_Derivatives_Register")

for idx, row in df_debt.iterrows():
    mdate_val = row.get("Maturity_Date")
    mdate_str = str(mdate_val)[:10] if pd.notnull(mdate_val) else "2027-01-01"
    myear = mdate_str[:4] if len(mdate_str) >= 4 else "2027"
    sql_lines.append(f"""
INSERT INTO ca.debt_maturity_schedule 
(client_id, isin, instrument, maturity_year, maturity_date, amount_eur_m, coupon_rate, fixed_floating, status)
VALUES ({esc(row['Client_ID'])}, 'XS{200000000 + idx}', {esc(row.get('Instrument'))}, '{myear}', '{mdate_str}', {num(row.get('Notional_mm'))}, {esc(row.get('Rate_Or_Strike'))}, {esc(row.get('Fixed_Floating'))}, {esc(row.get('Status'))});
""")

# -------------------------------------------------------------------------
# 4. ca.ca_opportunity_scoring (No client_name column)
# -------------------------------------------------------------------------
sql_lines.append("TRUNCATE TABLE ca.ca_opportunity_scoring;\n")
df_opps = pd.read_excel(excel_file, sheet_name="CA_Opportunity_Scoring")

for _, row in df_opps.iterrows():
    sql_lines.append(f"""
INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg, feeds_to)
VALUES ({esc(row['Opportunity_ID'])}, {esc(row['Client_ID'])}, {esc(row.get('Opportunity_Type'))}, {esc(row.get('Trigger_Source'))}, {num(row.get('Est_Revenue_EUR_000'))}, {int(row.get('Propensity_Score', 70))}, {int(row.get('Value_Score', 80))}, {int(row.get('Priority_Score', 75))}, {int(row.get('Rank', 1))}, {esc(row.get('Next_Best_Action'))}, {esc(row.get('Why_Now_NLG'))}, {esc(row.get('Feeds_To'))});
""")

with open("seed_tables_clean.sql", "w", encoding="utf-8") as f:
    f.writelines(sql_lines)

print("seed_tables_clean.sql successfully generated.")
