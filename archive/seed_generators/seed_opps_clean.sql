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
VALUES ('OPPCA104_CLI101', 'CLI101', 'DCM refi + sustainable liability mgmt', 'EUR10.127bn maturities + EUR12bn programme', 1900.0, 79, 88, 85, 9, 'Open early refinancing dialogue; test green/SLL structuring', 'EUR10.127bn matures 2026-27 vs 4.3% refi cost; board authorised EUR12bn; EUR4bn+ capex ahead.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA105_CLI102', 'CLI102', 'FX hedging programme', 'FX exposure shift (hedge gap ~$8bn)', 900.0, 82, 90, 82, 10, 'Propose staged FX hedging programme to close ~$8bn gap', 'Revenue outlook EUR43-45bn; Korea/Taiwan mix up; USD-bloc exposure >$12bn while hedge ~50%.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA106_CLI103', 'CLI103', 'Rates + commodity hedge review', 'Variable-rate exposure EUR3.4bn->EUR5.5bn', 750.0, 70, 80, 71, 12, 'Review floating-rate exposure vs policy; assess commodity hedging', 'Variable-rate exposure up ~63%; +100bp = -EUR34m pretax; validate vs designated hedges.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA107_CLI104', 'CLI104', '2027 fuel + FX hedge', '2027 fuel ~50% vs policy; +EUR1.5bn fuel cost', 850.0, 80, 85, 79, 11, 'Build/recalibrate 2027 fuel hedge; manage Brent-gasoil-jet basis + EUR/USD', 'FY-26 ~81% hedged but 2027 ~50%; +EUR1.5bn YoY fuel cost; layered build resumed Q2.');

INSERT INTO ca.ca_opportunity_scoring 
(opportunity_id, client_id, opportunity_type, trigger_source, est_revenue_eur_000, propensity_score, value_score, priority_score, rank, next_best_action, why_now_nlg)
VALUES ('OPPCA108_CLI105', 'CLI105', 'Residual liability mgmt (verify)', 'July $5bn issue may have addressed need', 600.0, 45, 60, 50, 13, 'Verify residual need vs July issuance before pursuing', 'H1 FCF -EUR2.69bn, ND EUR33.6bn, but $5bn July bond + facility resize may have addressed it.');
