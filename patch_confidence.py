import re

# 1. Update app.py
with open("app.py", "r") as f:
    app_code = f.read()

signal_calc_code = """
        # Compute deterministic signal confidences from retrieved signals
        signal_confidences = [
            float(s.get("confidence", 85))
            for s in db_signals
            if s.get("confidence") is not None
        ]

        if signal_confidences:
            avg_conf = sum(signal_confidences) / len(signal_confidences)
            max_conf = max(signal_confidences)
        else:
            avg_conf = 85.0
            max_conf = 85.0

        # Priority: Model synthesis confidence -> average signal confidence
        opp_data["confidence_pct"] = round(
            float(opp_data.get("confidence_pct", avg_conf))
        )
        opp_data["avg_signal_confidence"] = round(avg_conf, 1)
        opp_data["max_signal_confidence"] = round(max_conf, 1)
        opp_data["signal_count"] = len(db_signals)
"""

if "avg_signal_confidence" not in app_code:
    idx = app_code.find('opp_data["opportunity_id"]')
    if idx != -1:
        app_code = app_code[:idx] + signal_calc_code + "\n        " + app_code[idx:]
        with open("app.py", "w") as f:
            f.write(app_code)
        print("✅ Patched app.py with confidence score calculations.")
else:
    print("ℹ️ app.py already contains confidence aggregation.")

# 2. Update gui.py Tab 2
with open("gui.py", "r") as f:
    gui_code = f.read()

tab2_start = gui_code.find("with tab2:")
tab3_start = gui_code.find("with tab3:")

new_tab2 = '''with tab2:

    st.subheader(
        "Opportunity Discovery & Wholesale Service Catalog Matching"
    )

    st.caption(
        "Matches structured Digital Twin signals with retrieved pgvector "
        "evidence and determines whether the result is a hypothesis, "
        "client-validated discovery or confirmed mandate."
    )

    col_t1, col_t2 = st.columns([3, 2])
    with col_t1:
        st.write(
            f"Target Counterparty: **{client_name}** (`{client_id}` → `{canonical_client_id}`)"
        )
    with col_t2:
        min_hurdle = st.slider(
            "🎯 Qualification Confidence Hurdle (%)",
            min_value=50,
            max_value=95,
            value=75,
            step=5,
            key=f"hurdle_slider_{client_id}",
            help="Opportunities with confidence below this hurdle require further discovery before pitchbook generation."
        )

    if st.button(
        "🔎 Discover & Prioritize Opportunities",
        type="primary",
        key=f"discover_opportunity_{client_id}",
    ):

        with st.spinner(
            "Retrieving relevant evidence from DB "
            "and running institutional opportunity reasoning..."
        ):

            try:
                opp, _ = backend_request(
                    "POST",
                    "/match-opportunity",
                    json={
                        "client_id": canonical_client_id
                    },
                )

                st.session_state[
                    "active_opportunity"
                ] = opp

                st.session_state.pop("compliance_result", None)
                st.session_state.pop(f"compliance_bullets_{client_id}", None)
                st.session_state.pop(f"pitchbook_bytes_{client_id}", None)

            except Exception as exc:
                st.error(str(exc))

    opp = st.session_state.get(
        "active_opportunity",
        {},
    )

    if opp:
        confidence = int(opp.get("confidence_pct", opp.get("avg_signal_confidence", 85)))
        score = opp.get("score", 0)
        source_count = opp.get("evidence_source_count", 0)

        st.markdown(
            "### 🏆 Primary Opportunity Assessment"
        )

        render_opportunity_status(
            opp.get(
                "opportunity_status",
                "Hypothesis",
            )
        )

        if confidence >= min_hurdle:
            st.success(
                f"🎯 **Institutional Opportunity Qualified**: "
                f"Confidence (**{confidence}%**) meets your **{min_hurdle}%** hurdle rate."
            )
        else:
            st.warning(
                f"⚠️ **Opportunity Below Qualification Hurdle**: "
                f"Confidence (**{confidence}%**) is below **{min_hurdle}%**. "
                f"Recommend pre-discovery before formal pitching."
            )

        col1, col2, col3, col4, col5 = st.columns(5)

        col1.metric(
            "Catalog Family",
            opp.get(
                "catalog_family",
                "N/A",
            ),
        )

        col2.metric(
            "Target Product",
            opp.get(
                "product",
                "N/A",
            ),
        )

        col3.metric(
            "Priority Score",
            f"{score}/100" if score is not None else "N/A",
        )

        col4.metric(
            "Confidence Score",
            f"{confidence}%",
            delta=f"{confidence - min_hurdle}% vs hurdle"
        )

        col5.metric(
            "Source Documents",
            source_count,
        )

        evidence_record_count = opp.get("evidence_record_count", 0)
        retrieval_mode = opp.get("retrieval_mode", "N/A")
        evidence_sources = opp.get("evidence_sources", [])

        st.caption(
            f"Evidence records retrieved: {evidence_record_count} · "
            f"Source documents: {source_count} · "
            f"Retrieval: `{retrieval_mode}`"
        )

        if evidence_sources:
            with st.expander(f"📚 Evidence Sources ({source_count})"):
                for source in evidence_sources:
                    if isinstance(source, dict):
                        source_channel = escape(source.get("source_channel", "Unknown"))
                        source_name = escape(source.get("source_name", "Unknown source"))
                        st.markdown(f"**{source_name}** `({source_channel})`")
                    else:
                        st.markdown(f"- {escape(source)}")

        rationale = opp.get("rationale", "N/A")
        trigger = opp.get("trigger_source", "N/A")
        urgency = opp.get("urgency", "Medium")
        validation_gap = opp.get("validation_gap", "N/A")

        st.markdown("---")
        st.markdown("#### 📋 Deal Rationale & Next Best Action")
        st.info(rationale)

        st.markdown(f"**Trigger Origin:** `{trigger}`")

        if urgency == "High":
            st.error(f"**Urgency:** {urgency}")
        elif urgency == "Medium":
            st.warning(f"**Urgency:** {urgency}")
        else:
            st.info(f"**Urgency:** {urgency}")

        st.markdown(f"**Validation Gap:** {validation_gap}")

        st.markdown(
            "### 🔄 Cross-Asset & Conditional Opportunity Discovery"
        )

        secs = opp.get("secondary_opportunities", [])

        if secs:
            for secondary in secs:
                if not isinstance(secondary, dict):
                    continue
                family = secondary.get("catalog_family", "N/A")
                product = secondary.get("product", "N/A")
                condition = secondary.get("condition", "N/A")

                with st.container():
                    col_left, col_right = st.columns([3, 1])
                    with col_left:
                        st.markdown(f"**• {family} → {product}**")
                    with col_right:
                        st.caption("Conditional Service")
                    st.markdown(f"**Qualification Requirement:** {condition}")
                    st.divider()
        else:
            st.info("No secondary or conditional opportunities were identified.")

        with st.expander("🔍 Opportunity JSON"):
            st.json(opp)

    else:
        st.info("Run opportunity discovery after ingesting one or more source signals.")

'''

if tab2_start != -1 and tab3_start != -1:
    gui_code = gui_code[:tab2_start] + new_tab2 + gui_code[tab3_start:]
    with open("gui.py", "w") as f:
        f.write(gui_code)
    print("✅ Patched gui.py Tab 2 with hurdle slider and 5-column metric display.")
