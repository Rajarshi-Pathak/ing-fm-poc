
INSERT INTO ca.client_master 
(client_id, client_name, group_parent, legal_entity, industry_sector, country, region, ownership_type, tier, hq_country, revenue_eur_m, rm_name, base_ccy)
VALUES ('CLI001', 'Orsted A/S', 'Orsted A/S', 'Orsted Wind Power A/S', 'Energy Utilities', 'Denmark', 'Nordics', 'State-influenced Listed', 'Tier 1', 'Denmark', 0, 'Sarah Boyer', 'DKK')
ON CONFLICT (client_id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    group_parent = EXCLUDED.group_parent,
    legal_entity = EXCLUDED.legal_entity,
    industry_sector = EXCLUDED.industry_sector,
    country = EXCLUDED.country,
    region = EXCLUDED.region,
    ownership_type = EXCLUDED.ownership_type,
    tier = EXCLUDED.tier,
    hq_country = EXCLUDED.hq_country,
    rm_name = EXCLUDED.rm_name,
    base_ccy = EXCLUDED.base_ccy;

INSERT INTO ca.client_master 
(client_id, client_name, group_parent, legal_entity, industry_sector, country, region, ownership_type, tier, hq_country, revenue_eur_m, rm_name, base_ccy)
VALUES ('CLI002', 'ASML Holding N.V.', 'ASML Holding N.V.', 'ASML Netherlands B.V.', 'Semiconductors', 'Netherlands', 'Benelux', 'Listed', 'Tier 1', 'Netherlands', 0, 'Daan Visser', 'EUR')
ON CONFLICT (client_id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    group_parent = EXCLUDED.group_parent,
    legal_entity = EXCLUDED.legal_entity,
    industry_sector = EXCLUDED.industry_sector,
    country = EXCLUDED.country,
    region = EXCLUDED.region,
    ownership_type = EXCLUDED.ownership_type,
    tier = EXCLUDED.tier,
    hq_country = EXCLUDED.hq_country,
    rm_name = EXCLUDED.rm_name,
    base_ccy = EXCLUDED.base_ccy;

INSERT INTO ca.client_master 
(client_id, client_name, group_parent, legal_entity, industry_sector, country, region, ownership_type, tier, hq_country, revenue_eur_m, rm_name, base_ccy)
VALUES ('CLI003', 'Stellantis N.V.', 'Stellantis N.V.', 'Stellantis Finance B.V.', 'Automotive', 'Netherlands', 'Benelux', 'Listed', 'Tier 1', 'Netherlands', 0, 'Daan Visser', 'EUR')
ON CONFLICT (client_id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    group_parent = EXCLUDED.group_parent,
    legal_entity = EXCLUDED.legal_entity,
    industry_sector = EXCLUDED.industry_sector,
    country = EXCLUDED.country,
    region = EXCLUDED.region,
    ownership_type = EXCLUDED.ownership_type,
    tier = EXCLUDED.tier,
    hq_country = EXCLUDED.hq_country,
    rm_name = EXCLUDED.rm_name,
    base_ccy = EXCLUDED.base_ccy;

INSERT INTO ca.client_master 
(client_id, client_name, group_parent, legal_entity, industry_sector, country, region, ownership_type, tier, hq_country, revenue_eur_m, rm_name, base_ccy)
VALUES ('CLI004', 'SAP SE', 'SAP SE', 'SAP SE', 'Software', 'Germany', 'Germany', 'Listed', 'Tier 1', 'Germany', 0, 'Klaus Berger', 'EUR')
ON CONFLICT (client_id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    group_parent = EXCLUDED.group_parent,
    legal_entity = EXCLUDED.legal_entity,
    industry_sector = EXCLUDED.industry_sector,
    country = EXCLUDED.country,
    region = EXCLUDED.region,
    ownership_type = EXCLUDED.ownership_type,
    tier = EXCLUDED.tier,
    hq_country = EXCLUDED.hq_country,
    rm_name = EXCLUDED.rm_name,
    base_ccy = EXCLUDED.base_ccy;

INSERT INTO ca.client_master 
(client_id, client_name, group_parent, legal_entity, industry_sector, country, region, ownership_type, tier, hq_country, revenue_eur_m, rm_name, base_ccy)
VALUES ('CLI005', 'Vattenfall AB', 'Kingdom of Sweden', 'Vattenfall AB', 'Energy Utilities', 'Sweden', 'Nordics', 'State-owned', 'Tier 2', 'Sweden', 0, 'Sarah Boyer', 'SEK')
ON CONFLICT (client_id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    group_parent = EXCLUDED.group_parent,
    legal_entity = EXCLUDED.legal_entity,
    industry_sector = EXCLUDED.industry_sector,
    country = EXCLUDED.country,
    region = EXCLUDED.region,
    ownership_type = EXCLUDED.ownership_type,
    tier = EXCLUDED.tier,
    hq_country = EXCLUDED.hq_country,
    rm_name = EXCLUDED.rm_name,
    base_ccy = EXCLUDED.base_ccy;

INSERT INTO ca.client_master 
(client_id, client_name, group_parent, legal_entity, industry_sector, country, region, ownership_type, tier, hq_country, revenue_eur_m, rm_name, base_ccy)
VALUES ('CLI006', 'Koninklijke Philips N.V.', 'Koninklijke Philips N.V.', 'Philips International B.V.', 'Health Technology', 'Netherlands', 'Benelux', 'Listed', 'Tier 1', 'Netherlands', 0, 'Daan Visser', 'EUR')
ON CONFLICT (client_id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    group_parent = EXCLUDED.group_parent,
    legal_entity = EXCLUDED.legal_entity,
    industry_sector = EXCLUDED.industry_sector,
    country = EXCLUDED.country,
    region = EXCLUDED.region,
    ownership_type = EXCLUDED.ownership_type,
    tier = EXCLUDED.tier,
    hq_country = EXCLUDED.hq_country,
    rm_name = EXCLUDED.rm_name,
    base_ccy = EXCLUDED.base_ccy;

INSERT INTO ca.client_master 
(client_id, client_name, group_parent, legal_entity, industry_sector, country, region, ownership_type, tier, hq_country, revenue_eur_m, rm_name, base_ccy)
VALUES ('CLI007', 'Heineken N.V.', 'Heineken Holding N.V.', 'Heineken International B.V.', 'Beverages', 'Netherlands', 'Benelux', 'Listed', 'Tier 2', 'Netherlands', 0, 'Daan Visser', 'EUR')
ON CONFLICT (client_id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    group_parent = EXCLUDED.group_parent,
    legal_entity = EXCLUDED.legal_entity,
    industry_sector = EXCLUDED.industry_sector,
    country = EXCLUDED.country,
    region = EXCLUDED.region,
    ownership_type = EXCLUDED.ownership_type,
    tier = EXCLUDED.tier,
    hq_country = EXCLUDED.hq_country,
    rm_name = EXCLUDED.rm_name,
    base_ccy = EXCLUDED.base_ccy;

INSERT INTO ca.client_master 
(client_id, client_name, group_parent, legal_entity, industry_sector, country, region, ownership_type, tier, hq_country, revenue_eur_m, rm_name, base_ccy)
VALUES ('CLI008', 'A.P. Moller-Maersk A/S', 'A.P. Moller Holding', 'Maersk Line A/S', 'Shipping & Logistics', 'Denmark', 'Nordics', 'Family-controlled Listed', 'Tier 1', 'Denmark', 0, 'Sarah Boyer', 'DKK')
ON CONFLICT (client_id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    group_parent = EXCLUDED.group_parent,
    legal_entity = EXCLUDED.legal_entity,
    industry_sector = EXCLUDED.industry_sector,
    country = EXCLUDED.country,
    region = EXCLUDED.region,
    ownership_type = EXCLUDED.ownership_type,
    tier = EXCLUDED.tier,
    hq_country = EXCLUDED.hq_country,
    rm_name = EXCLUDED.rm_name,
    base_ccy = EXCLUDED.base_ccy;

INSERT INTO ca.client_master 
(client_id, client_name, group_parent, legal_entity, industry_sector, country, region, ownership_type, tier, hq_country, revenue_eur_m, rm_name, base_ccy)
VALUES ('CLI101', 'Enel S.p.A.', 'Enel S.p.A.', 'Enel Finance International N.V.', 'Electric Utilities', 'Italy', 'Southern Europe', 'State-influenced Listed', 'Tier 1', 'Italy', 0, 'Marco Bianchi', 'EUR')
ON CONFLICT (client_id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    group_parent = EXCLUDED.group_parent,
    legal_entity = EXCLUDED.legal_entity,
    industry_sector = EXCLUDED.industry_sector,
    country = EXCLUDED.country,
    region = EXCLUDED.region,
    ownership_type = EXCLUDED.ownership_type,
    tier = EXCLUDED.tier,
    hq_country = EXCLUDED.hq_country,
    rm_name = EXCLUDED.rm_name,
    base_ccy = EXCLUDED.base_ccy;

INSERT INTO ca.client_master 
(client_id, client_name, group_parent, legal_entity, industry_sector, country, region, ownership_type, tier, hq_country, revenue_eur_m, rm_name, base_ccy)
VALUES ('CLI102', 'ASML Holding N.V.', 'ASML Holding N.V.', 'ASML Netherlands B.V.', 'Semiconductors', 'Netherlands', 'Benelux', 'Listed', 'Tier 1', 'Netherlands', 0, 'Daan Visser', 'EUR')
ON CONFLICT (client_id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    group_parent = EXCLUDED.group_parent,
    legal_entity = EXCLUDED.legal_entity,
    industry_sector = EXCLUDED.industry_sector,
    country = EXCLUDED.country,
    region = EXCLUDED.region,
    ownership_type = EXCLUDED.ownership_type,
    tier = EXCLUDED.tier,
    hq_country = EXCLUDED.hq_country,
    rm_name = EXCLUDED.rm_name,
    base_ccy = EXCLUDED.base_ccy;

INSERT INTO ca.client_master 
(client_id, client_name, group_parent, legal_entity, industry_sector, country, region, ownership_type, tier, hq_country, revenue_eur_m, rm_name, base_ccy)
VALUES ('CLI103', 'BASF SE', 'BASF SE', 'BASF SE', 'Chemicals', 'Germany', 'Germany', 'Listed', 'Tier 1', 'Germany', 0, 'Klaus Weber', 'EUR')
ON CONFLICT (client_id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    group_parent = EXCLUDED.group_parent,
    legal_entity = EXCLUDED.legal_entity,
    industry_sector = EXCLUDED.industry_sector,
    country = EXCLUDED.country,
    region = EXCLUDED.region,
    ownership_type = EXCLUDED.ownership_type,
    tier = EXCLUDED.tier,
    hq_country = EXCLUDED.hq_country,
    rm_name = EXCLUDED.rm_name,
    base_ccy = EXCLUDED.base_ccy;

INSERT INTO ca.client_master 
(client_id, client_name, group_parent, legal_entity, industry_sector, country, region, ownership_type, tier, hq_country, revenue_eur_m, rm_name, base_ccy)
VALUES ('CLI104', 'Deutsche Lufthansa AG', 'Deutsche Lufthansa AG', 'Deutsche Lufthansa AG', 'Airlines', 'Germany', 'Germany', 'Listed', 'Tier 2', 'Germany', 0, 'Klaus Weber', 'EUR')
ON CONFLICT (client_id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    group_parent = EXCLUDED.group_parent,
    legal_entity = EXCLUDED.legal_entity,
    industry_sector = EXCLUDED.industry_sector,
    country = EXCLUDED.country,
    region = EXCLUDED.region,
    ownership_type = EXCLUDED.ownership_type,
    tier = EXCLUDED.tier,
    hq_country = EXCLUDED.hq_country,
    rm_name = EXCLUDED.rm_name,
    base_ccy = EXCLUDED.base_ccy;

INSERT INTO ca.client_master 
(client_id, client_name, group_parent, legal_entity, industry_sector, country, region, ownership_type, tier, hq_country, revenue_eur_m, rm_name, base_ccy)
VALUES ('CLI105', 'Bayer AG', 'Bayer AG', 'Bayer AG', 'Pharmaceuticals / Life Sciences', 'Germany', 'Germany', 'Listed', 'Tier 1', 'Germany', 0, 'Klaus Weber', 'EUR')
ON CONFLICT (client_id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    group_parent = EXCLUDED.group_parent,
    legal_entity = EXCLUDED.legal_entity,
    industry_sector = EXCLUDED.industry_sector,
    country = EXCLUDED.country,
    region = EXCLUDED.region,
    ownership_type = EXCLUDED.ownership_type,
    tier = EXCLUDED.tier,
    hq_country = EXCLUDED.hq_country,
    rm_name = EXCLUDED.rm_name,
    base_ccy = EXCLUDED.base_ccy;
TRUNCATE TABLE ca.ext_company_filings;

INSERT INTO ca.ext_company_filings 
(filing_id, client_id, reporting_period, net_debt_eur_m, liquidity_eur_m, ebitda_eur_m, reported_revenue_eur_m, debt_maturing_24m_eur_m, notes)
VALUES ('FIL-CLI001-1', 'CLI001', 'FY2024 / Q2 2026', 14060.0, 4440.0, 9240.0, 42000.0, 1500.0, 'Sourced from Company annual report (illustrative) (Annual Report 2024)');

INSERT INTO ca.ext_company_filings 
(filing_id, client_id, reporting_period, net_debt_eur_m, liquidity_eur_m, ebitda_eur_m, reported_revenue_eur_m, debt_maturing_24m_eur_m, notes)
VALUES ('FIL-CLI002-2', 'CLI002', 'FY2024 / Q2 2026', 3192.0, 1008.0, 6226.0, 28300.0, 0.0, 'Sourced from Company annual report (illustrative) (Annual Report 2024)');

INSERT INTO ca.ext_company_filings 
(filing_id, client_id, reporting_period, net_debt_eur_m, liquidity_eur_m, ebitda_eur_m, reported_revenue_eur_m, debt_maturing_24m_eur_m, notes)
VALUES ('FIL-CLI003-3', 'CLI003', 'FY2024 / Q2 2026', 16720.0, 5280.0, 41690.0, 189500.0, 4800.0, 'Sourced from Company annual report (illustrative) (Annual Report 2024)');

INSERT INTO ca.ext_company_filings 
(filing_id, client_id, reporting_period, net_debt_eur_m, liquidity_eur_m, ebitda_eur_m, reported_revenue_eur_m, debt_maturing_24m_eur_m, notes)
VALUES ('FIL-CLI004-4', 'CLI004', 'FY2024 / Q2 2026', 8208.0, 2592.0, 7524.0, 34200.0, 900.0, 'Sourced from Company annual report (illustrative) (Annual Report 2024)');

INSERT INTO ca.ext_company_filings 
(filing_id, client_id, reporting_period, net_debt_eur_m, liquidity_eur_m, ebitda_eur_m, reported_revenue_eur_m, debt_maturing_24m_eur_m, notes)
VALUES ('FIL-CLI005-5', 'CLI005', 'FY2024 / Q2 2026', 6916.0, 2184.0, 4972.0, 22600.0, 1200.0, 'Sourced from Company annual report (illustrative) (Annual Report 2024)');

INSERT INTO ca.ext_company_filings 
(filing_id, client_id, reporting_period, net_debt_eur_m, liquidity_eur_m, ebitda_eur_m, reported_revenue_eur_m, debt_maturing_24m_eur_m, notes)
VALUES ('FIL-CLI006-6', 'CLI006', 'FY2024 / Q2 2026', 5548.0, 1752.0, 4004.0, 18200.0, 850.0, 'Sourced from Company annual report (illustrative) (Annual Report 2024)');

INSERT INTO ca.ext_company_filings 
(filing_id, client_id, reporting_period, net_debt_eur_m, liquidity_eur_m, ebitda_eur_m, reported_revenue_eur_m, debt_maturing_24m_eur_m, notes)
VALUES ('FIL-CLI007-7', 'CLI007', 'FY2024 / Q2 2026', 11552.0, 3648.0, 6622.0, 30100.0, 1300.0, 'Sourced from Company annual report (illustrative) (Annual Report 2024)');

INSERT INTO ca.ext_company_filings 
(filing_id, client_id, reporting_period, net_debt_eur_m, liquidity_eur_m, ebitda_eur_m, reported_revenue_eur_m, debt_maturing_24m_eur_m, notes)
VALUES ('FIL-CLI008-8', 'CLI008', 'FY2024 / Q2 2026', 12464.0, 3936.0, 10714.0, 48700.0, 1600.0, 'Sourced from Company annual report (illustrative) (Annual Report 2024)');

INSERT INTO ca.ext_company_filings 
(filing_id, client_id, reporting_period, net_debt_eur_m, liquidity_eur_m, ebitda_eur_m, reported_revenue_eur_m, debt_maturing_24m_eur_m, notes)
VALUES ('FIL-CLI101-9', 'CLI101', 'FY2024 / Q2 2026', 58500.0, 14200.0, 20900.0, 95000.0, 10127.0, 'Sourced from Company annual report (illustrative) (Annual Report 2024)');

INSERT INTO ca.ext_company_filings 
(filing_id, client_id, reporting_period, net_debt_eur_m, liquidity_eur_m, ebitda_eur_m, reported_revenue_eur_m, debt_maturing_24m_eur_m, notes)
VALUES ('FIL-CLI102-10', 'CLI102', 'FY2024 / Q2 2026', 3192.0, 1008.0, 6226.0, 28300.0, 0.0, 'Sourced from Company annual report (illustrative) (Annual Report 2024)');

INSERT INTO ca.ext_company_filings 
(filing_id, client_id, reporting_period, net_debt_eur_m, liquidity_eur_m, ebitda_eur_m, reported_revenue_eur_m, debt_maturing_24m_eur_m, notes)
VALUES ('FIL-CLI103-11', 'CLI103', 'FY2024 / Q2 2026', 16200.0, 7800.0, 14300.0, 65000.0, 3000.0, 'Sourced from Company annual report (illustrative) (Annual Report 2024)');

INSERT INTO ca.ext_company_filings 
(filing_id, client_id, reporting_period, net_debt_eur_m, liquidity_eur_m, ebitda_eur_m, reported_revenue_eur_m, debt_maturing_24m_eur_m, notes)
VALUES ('FIL-CLI104-12', 'CLI104', 'FY2024 / Q2 2026', 6840.0, 2160.0, 8360.0, 38000.0, 2500.0, 'Sourced from Company annual report (illustrative) (Annual Report 2024)');

INSERT INTO ca.ext_company_filings 
(filing_id, client_id, reporting_period, net_debt_eur_m, liquidity_eur_m, ebitda_eur_m, reported_revenue_eur_m, debt_maturing_24m_eur_m, notes)
VALUES ('FIL-CLI105-13', 'CLI105', 'FY2024 / Q2 2026', 25566.4, 8073.6, 10340.0, 47000.0, 4000.0, 'Sourced from Company annual report (illustrative) (Annual Report 2024)');
TRUNCATE TABLE ca.debt_maturity_schedule;

INSERT INTO ca.debt_maturity_schedule 
(isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
VALUES ('XS200000000', 'CLI101', 'Bond', 3000.0, 2026, 1.2, 'EUR');

INSERT INTO ca.debt_maturity_schedule 
(isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
VALUES ('XS200000001', 'CLI101', 'Bond', 2500.0, 2027, 3.5, 'USD');

INSERT INTO ca.debt_maturity_schedule 
(isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
VALUES ('XS200000002', 'CLI101', 'Bond', 1600.0, 2026, 0.88, 'EUR');

INSERT INTO ca.debt_maturity_schedule 
(isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
VALUES ('XS200000003', 'CLI101', 'Swap', 4000.0, 2028, 2.1, 'EUR');

INSERT INTO ca.debt_maturity_schedule 
(isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
VALUES ('XS200000004', 'CLI102', 'Derivative', 6000.0, 2026, 1.085, 'USD');

INSERT INTO ca.debt_maturity_schedule 
(isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
VALUES ('XS200000005', 'CLI102', 'Derivative', 1000.0, 2026, 1.12, 'USD');

INSERT INTO ca.debt_maturity_schedule 
(isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
VALUES ('XS200000006', 'CLI103', 'Loan', 5497.0, 2028, 95.0, 'EUR');

INSERT INTO ca.debt_maturity_schedule 
(isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
VALUES ('XS200000007', 'CLI103', 'Swap', 3000.0, 2027, 2.35, 'EUR');

INSERT INTO ca.debt_maturity_schedule 
(isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
VALUES ('XS200000008', 'CLI103', 'Commodity', 600.0, 2026, 32.0, 'EUR');

INSERT INTO ca.debt_maturity_schedule 
(isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
VALUES ('XS200000009', 'CLI104', 'Commodity', 2200.0, 2026, 78.0, 'USD');

INSERT INTO ca.debt_maturity_schedule 
(isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
VALUES ('XS200000010', 'CLI104', 'Commodity', 800.0, 2026, 19.0, 'USD');

INSERT INTO ca.debt_maturity_schedule 
(isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
VALUES ('XS200000011', 'CLI104', 'Commodity', 1200.0, 2027, 74.0, 'USD');

INSERT INTO ca.debt_maturity_schedule 
(isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
VALUES ('XS200000012', 'CLI105', 'Bond', 5000.0, 2031, 5.1, 'USD');

INSERT INTO ca.debt_maturity_schedule 
(isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
VALUES ('XS200000013', 'CLI105', 'Facility', 3000.0, 2028, 120.0, 'USD');

INSERT INTO ca.debt_maturity_schedule 
(isin, client_id, instrument_type, amount_eur_m, maturity_year, coupon_rate_pct, currency)
VALUES ('XS200000014', 'CLI105', 'Swap', 2000.0, 2030, 4.2, 'USD');
TRUNCATE TABLE ca.ca_opportunity_scoring;

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA101', 'CLI002', 'FX hedging programme', 'FX exposure shift (hedge gap ~$6bn)', 850.0, 82, 90, 82, 1, 'Propose staged FX hedging programme to close ~$6bn gap', 'North America revenue mix jumped 22%->38%; USD exposure doubled to >$12bn while hedge stayed at ~50%.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA102', 'CLI003', 'Rates hedging (IRS)', 'Swap roll-off; fixed coverage 75%->45%', 700.0, 78, 88, 78, 2, 'Schedule rates-hedging review before EUR3bn swaps expire', 'EUR3bn swaps expire in 12m; +100bp = ~EUR80m extra cost.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA103', 'CLI001', 'DCM refi + rates hedge', '2028 bond maturity vs 4.5-5.0% refi', 1900.0, 60, 86, 76, 3, 'Open early refinancing dialogue and pre-hedge rate risk', 'EUR1.5bn 1.75% bond matures 2028 vs 4.5-5.0% refi; EUR4bn capex ahead.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA104', 'CLI008', 'Commodity + FX structured hedge', 'Combined bunker + freight USD exposure', 640.0, 72, 80, 72, 4, 'Pitch combined commodity/FX structured hedge', '+20% Brent implies ~EUR150m impact; partial hedge only.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA105', 'CLI004', 'Structured deposits / cash mgmt', 'Cash build EUR5bn->EUR9bn', 300.0, 70, 68, 64, 5, 'Propose structured deposit & MMF optimisation', 'Cash balances up EUR4bn; capacity for yield optimisation.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA106', 'CLI005', 'Sustainable finance + rates', 'Wallet ~30% of peer average', 550.0, 55, 72, 60, 6, 'Introduce SLL and rates structures to lift wallet share', 'Uses only FX forwards + basic lending vs peers'' broader toolkit.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA107', 'CLI007', 'EM FX hedging', 'Growing LatAm/APAC FX flows', 410.0, 58, 60, 55, 7, 'Propose EM FX hedging framework', 'Rising emerging-market currency flows, largely unhedged.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA108', 'CLI006', 'WC facility refinance', 'Stale pipeline; facility review', 380.0, 45, 55, 47, 8, 'Re-engage on working-capital facility refinance', 'Facility review overdue; relationship expansion opportunity.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA104', 'CLI101', 'DCM refi + sustainable liability mgmt', 'EUR10.127bn maturities + EUR12bn programme', 1900.0, 79, 88, 85, 9, 'Open early refinancing dialogue; test green/SLL structuring', 'EUR10.127bn matures 2026-27 vs 4.3% refi cost; board authorised EUR12bn; EUR4bn+ capex ahead.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA105', 'CLI102', 'FX hedging programme', 'FX exposure shift (hedge gap ~$8bn)', 900.0, 82, 90, 82, 10, 'Propose staged FX hedging programme to close ~$8bn gap', 'Revenue outlook EUR43-45bn; Korea/Taiwan mix up; USD-bloc exposure >$12bn while hedge ~50%.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA106', 'CLI103', 'Rates + commodity hedge review', 'Variable-rate exposure EUR3.4bn->EUR5.5bn', 750.0, 70, 80, 71, 12, 'Review floating-rate exposure vs policy; assess commodity hedging', 'Variable-rate exposure up ~63%; +100bp = -EUR34m pretax; validate vs designated hedges.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA107', 'CLI104', '2027 fuel + FX hedge', '2027 fuel ~50% vs policy; +EUR1.5bn fuel cost', 850.0, 80, 85, 79, 11, 'Build/recalibrate 2027 fuel hedge; manage Brent-gasoil-jet basis + EUR/USD', 'FY-26 ~81% hedged but 2027 ~50%; +EUR1.5bn YoY fuel cost; layered build resumed Q2.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA108', 'CLI105', 'Residual liability mgmt (verify)', 'July $5bn issue may have addressed need', 600.0, 45, 60, 50, 13, 'Verify residual need vs July issuance before pursuing', 'H1 FCF -EUR2.69bn, ND EUR33.6bn, but $5bn July bond + facility resize may have addressed it.');
TRUNCATE TABLE ca.mkt_rates_curves;

INSERT INTO ca.mkt_rates_curves 
(curve_id, curve_date, currency, tenor, swap_rate_pct, govt_yield_pct, category)
VALUES (1, '2026-07-31', 'EUR', '1Y', 2.35, 2.1, 'Rates curve');

INSERT INTO ca.mkt_rates_curves 
(curve_id, curve_date, currency, tenor, swap_rate_pct, govt_yield_pct, category)
VALUES (2, '2026-07-31', 'EUR', '2Y', 2.48, 2.22, 'Rates curve');

INSERT INTO ca.mkt_rates_curves 
(curve_id, curve_date, currency, tenor, swap_rate_pct, govt_yield_pct, category)
VALUES (3, '2026-07-31', 'EUR', '3Y', 2.55, 2.3, 'Rates curve');

INSERT INTO ca.mkt_rates_curves 
(curve_id, curve_date, currency, tenor, swap_rate_pct, govt_yield_pct, category)
VALUES (4, '2026-07-31', 'EUR', '5Y', 2.62, 2.38, 'Rates curve');

INSERT INTO ca.mkt_rates_curves 
(curve_id, curve_date, currency, tenor, swap_rate_pct, govt_yield_pct, category)
VALUES (5, '2026-07-31', 'EUR', '7Y', 2.74, 2.49, 'Rates curve');

INSERT INTO ca.mkt_rates_curves 
(curve_id, curve_date, currency, tenor, swap_rate_pct, govt_yield_pct, category)
VALUES (6, '2026-07-31', 'EUR', '10Y', 2.88, 2.61, 'Rates curve');

INSERT INTO ca.mkt_rates_curves 
(curve_id, curve_date, currency, tenor, swap_rate_pct, govt_yield_pct, category)
VALUES (7, '2026-07-31', 'USD', '1Y', 4.05, 4.2, 'Rates curve');

INSERT INTO ca.mkt_rates_curves 
(curve_id, curve_date, currency, tenor, swap_rate_pct, govt_yield_pct, category)
VALUES (8, '2026-07-31', 'USD', '2Y', 3.95, 4.05, 'Rates curve');

INSERT INTO ca.mkt_rates_curves 
(curve_id, curve_date, currency, tenor, swap_rate_pct, govt_yield_pct, category)
VALUES (9, '2026-07-31', 'USD', '5Y', 3.92, 3.98, 'Rates curve');

INSERT INTO ca.mkt_rates_curves 
(curve_id, curve_date, currency, tenor, swap_rate_pct, govt_yield_pct, category)
VALUES (10, '2026-07-31', 'USD', '10Y', 4.08, 4.1, 'Rates curve');
TRUNCATE TABLE ca.ext_credit_spreads;

INSERT INTO ca.ext_credit_spreads 
(spread_id, quote_date, issuer_or_rating, sector, tenor, spread_bps, all_in_yield_pct, source)
VALUES (1, '2026-07-31', 'Enel (BBB+)', 'Utilities', '5Y', 95.0, 3.57, 'Licensed (illustrative)');

INSERT INTO ca.ext_credit_spreads 
(spread_id, quote_date, issuer_or_rating, sector, tenor, spread_bps, all_in_yield_pct, source)
VALUES (2, '2026-07-31', 'Enel (BBB+)', 'Utilities', '10Y', 130.0, 4.18, 'Licensed (illustrative)');

INSERT INTO ca.ext_credit_spreads 
(spread_id, quote_date, issuer_or_rating, sector, tenor, spread_bps, all_in_yield_pct, source)
VALUES (3, '2026-07-31', 'BASF (A)', 'Chemicals', '5Y', 78.0, 3.4, 'Licensed (illustrative)');

INSERT INTO ca.ext_credit_spreads 
(spread_id, quote_date, issuer_or_rating, sector, tenor, spread_bps, all_in_yield_pct, source)
VALUES (4, '2026-07-31', 'Bayer (BBB)', 'Pharma', '5Y', 120.0, 3.82, 'Licensed (illustrative)');

INSERT INTO ca.ext_credit_spreads 
(spread_id, quote_date, issuer_or_rating, sector, tenor, spread_bps, all_in_yield_pct, source)
VALUES (5, '2026-07-31', 'Bayer (BBB)', 'Pharma', '10Y', 165.0, 4.53, 'Licensed (illustrative)');

INSERT INTO ca.ext_credit_spreads 
(spread_id, quote_date, issuer_or_rating, sector, tenor, spread_bps, all_in_yield_pct, source)
VALUES (6, '2026-07-31', 'Lufthansa (BBB-)', 'Airlines', '5Y', 175.0, 4.37, 'Licensed (illustrative)');

INSERT INTO ca.ext_credit_spreads 
(spread_id, quote_date, issuer_or_rating, sector, tenor, spread_bps, all_in_yield_pct, source)
VALUES (7, '2026-07-31', 'A rating curve', 'Benchmark', '5Y', 70.0, 3.32, 'Licensed (illustrative)');

INSERT INTO ca.ext_credit_spreads 
(spread_id, quote_date, issuer_or_rating, sector, tenor, spread_bps, all_in_yield_pct, source)
VALUES (8, '2026-07-31', 'BBB rating curve', 'Benchmark', '5Y', 115.0, 3.77, 'Licensed (illustrative)');
