import main

conn, connector = main.get_db_connection()
if conn:
    cur = conn.cursor()
    
    # 1. Print exact columns of ca.ca_opportunity_scoring
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'ca' AND table_name = 'ca_opportunity_scoring';
    """)
    cols = cur.fetchall()
    print("=" * 80)
    print("SCHEMA FOR ca.ca_opportunity_scoring:")
    print("=" * 80)
    for c in cols:
        print(f"  • {c[0]} ({c[1]})")

    # 2. Query ASML Opportunity record dynamically
    print("\n" + "=" * 80)
    print("ASML OPPORTUNITY RECORD (ca.ca_opportunity_scoring):")
    print("=" * 80)
    cur.execute("SELECT * FROM ca.ca_opportunity_scoring WHERE client_id = 'CLI102';")
    col_names = [desc[0] for desc in cur.description]
    row = cur.fetchone()
    if row:
        for name, val in zip(col_names, row):
            print(f"  {name:25s}: {val}")
    else:
        print("  No scoring row found for CLI102.")

    # 3. Query ASML Signals
    print("\n" + "=" * 80)
    print("ASML LATEST SIGNALS (ca.digital_twin_signals):")
    print("=" * 80)
    cur.execute("""
        SELECT signal_id, signal_type, trigger_summary, confidence_pct, urgency, created_at 
        FROM ca.digital_twin_signals 
        WHERE client_id = 'CLI102' 
        ORDER BY created_at DESC 
        LIMIT 5;
    """)
    sig_rows = cur.fetchall()
    if sig_rows:
        for r in sig_rows:
            print(f"[{r[0]}] {r[1]} | Urgency: {r[4]} | Conf: {r[3]}% | {r[5]}")
            print(f"  Summary: {r[2]}\n")
    else:
        print("  No signals found for CLI102.")

    cur.close()
    conn.close()
    if connector:
        connector.close()
