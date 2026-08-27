import os
import glob
import re
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

def num(val, default=0.0):
    if pd.isna(val) or val is None:
        return str(default)
    try:
        clean_str = re.sub(r'[^\d.-]', '', str(val)).strip()
        return str(float(clean_str)) if clean_str else str(default)
    except Exception:
        return str(default)

sql_lines = []

# -------------------------------------------------------------------------
# 1. ca.ca_opportunity_scoring (Deduplicated Primary Keys)
# -------------------------------------------------------------------------
sql_lines.append("TRUNCATE TABLE ca.ca_opportunity_scoring;\n")
df_opps = pd.read_excel(excel_file, sheet_name="CA_Opportunity_Scoring")

seen_keys = set()
for _, row in df_opps.iterrows():
    raw_oid = str(row['Opportunity_ID']).strip()
    cid = str(row['Client_ID']).strip()
    
    # Prefix candidate 5 duplicates to ensure unique primary keys
    if raw_oid in seen_keys:
        oid = f"{raw_oid}_{cid}"
    else:
        oid = raw_oid
    seen_keys.add(oid)

    sql_lines.append(f"""
INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ({esc(oid)}, {esc(cid)}, {esc(row.get('Opportunity_Type'))}, {esc(row.get('Trigger_Source'))}, {num(row.get('Est_Revenue_EUR_000'))}, {int(row.get('Propensity_Score', 70))}, {int(row.get('Value_Score', 80))}, {int(row.get('Priority_Score', 75))}, {int(row.get('Rank', 1))}, {esc(row.get('Next_Best_Action'))}, {esc(row.get('Why_Now_NLG'))});
""")

with open("seed_opps_clean.sql", "w", encoding="utf-8") as f:
    f.writelines(sql_lines)

print("seed_opps_clean.sql generated successfully.")
