import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  ArrowUpRight, 
  ShieldAlert, 
  ShieldCheck, 
  Loader2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  RefreshCw, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  Zap, 
  Rss, 
  UploadCloud, 
  FileText, 
  Mail, 
  MessageSquare, 
  CheckCircle2
} from "lucide-react";

// =============================================================================
// FormattedChatText Component - Handles markdown-like formatting
// =============================================================================

function FormattedChatText({ content }) {
  if (!content) return null;

  const renderFormattedLine = (line, lineIdx) => {
    let cleanLine = line.trim();
    if (!cleanLine) return null;

    const isBullet = cleanLine.startsWith("• ") || cleanLine.startsWith("* ") || cleanLine.startsWith("- ");
    if (isBullet) {
      cleanLine = cleanLine.substring(2).trim();
    }

    const tokens = cleanLine.split(/(\*\*.*?\*\*|\*".*?"\*|`.*?`|\*.*?\*)/g);

    const formattedSpans = tokens.map((part, pIdx) => {
      if (!part) return null;
      
      // Bold: **text**
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={pIdx} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      
      // Bold quoted: *"text"*
      if (part.startsWith('*\"') && part.endsWith('\"*')) {
        return <strong key={pIdx} className="font-bold text-gray-900">"{part.slice(2, -2)}"</strong>;
      }
      
      // Code: `text`
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={pIdx} className="bg-gray-200/80 px-1 py-0.5 rounded text-[11px] font-mono text-[#000066]">{part.slice(1, -1)}</code>;
      }
      
      // Italic: *text*
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2 && !part.startsWith("**")) {
        return <em key={pIdx} className="text-gray-700 italic">{part.slice(1, -1)}</em>;
      }
      
      return part;
    });

    if (isBullet) {
      return (
        <li key={lineIdx} className="ml-4 list-disc leading-relaxed text-gray-800">
          {formattedSpans}
        </li>
      );
    }

    return (
      <p key={lineIdx} className="leading-relaxed mb-1 last:mb-0">
        {formattedSpans}
      </p>
    );
  };

  const lines = content.split("\n");
  const isBulletList = lines.some(line => line.trim().startsWith("• ") || line.trim().startsWith("* ") || line.trim().startsWith("- "));

  if (isBulletList) {
    return <ul className="space-y-1">{lines.map((l, idx) => renderFormattedLine(l, idx))}</ul>;
  }

  return <div className="space-y-1">{lines.map((l, idx) => renderFormattedLine(l, idx))}</div>;
}

// =============================================================================
// Error Boundary Component
// =============================================================================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md w-full text-center shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-4">{this.state.error?.message || "An unexpected error occurred"}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#FF6200] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#E05500] transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// =============================================================================
// Main App Component
// =============================================================================

export default function App() {
  const [opportunities, setOpportunities] = useState([]);
  const [signals, setSignals] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loadingClient, setLoadingClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeClient, setActiveClient] = useState(null);
  const [clientMaturities, setClientMaturities] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Ingestion Gateway Modal States
  const [ingestModalOpen, setIngestModalOpen] = useState(false);
  const [ingestClient, setIngestClient] = useState(null);
  const [ingestTab, setIngestTab] = useState("rss");
  const [rssArticles, setRssArticles] = useState([]);
  const [rssLoading, setRssLoading] = useState(false);
  const [ingestingAction, setIngestingAction] = useState(false);
  const [ingestSuccessMsg, setIngestSuccessMsg] = useState(null);
  const [customTextContent, setCustomTextContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Compliance Audit States
  const [complianceAuditing, setComplianceAuditing] = useState(false);
  const [complianceResult, setComplianceResult] = useState(null);
  const [flaggedSlides, setFlaggedSlides] = useState([]);

  // Deck Overrides
  const [deckOverrides, setDeckOverrides] = useState({
    maturity_wall_str: null,
    notional_bond: "EUR 600,000,000",
    notional_swap: "EUR 400,000,000",
    tenor: "7 Years (T + 7Y)",
    // spread dynamically set by client/copilot override
    market_date: "Market Snapshot as of 22 August 2026 ",
    spread_disclaimer: "*Indicative pricing subject to market conditions, bookbuilding depth, and credit approval.*",
    swap_5y: "2.62%",
    iboxx_bbb: "115 bps",
    bund_10y: "2.61%",
    itraxx_main: "58 bps",
    ecb_rate: "2.25%",
    fed_rate: "4.00–4.25%",
    boe_rate: "3.75%",
    rate_scenario_up: "4.55%",
    rate_scenario_lock: "3.44% (locked)",
    rate_scenario_down: "3.15%",
    disclaimers: [
      "This document is prepared for illustrative and discussion purposes only and does not constitute an offer, solicitation, or recommendation to enter into any transaction.",
      "FOR PROFESSIONAL CLIENTS AND ELIGIBLE COUNTERPARTIES ONLY: Target market under MiFID II / UK MiFIR is eligible counterparties and professional clients only (all distribution channels).",
      "This material has not been prepared in accordance with legal requirements designed to promote the independence of investment research.",
      "All rates, levels, spreads, and indicative terms shown are subject to change without notice and are not tradeable prices."
    ]
  });

  const [chatMessages, setChatMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Data Fetching
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [oppRes, signalsRes, metricsRes] = await Promise.all([
        fetch("/api/opportunities"),
        fetch("/api/signals"),
        fetch("/api/metrics")
      ]);

      if (!oppRes.ok) throw new Error("Failed to fetch opportunities");
      if (!signalsRes.ok) throw new Error("Failed to fetch signals");
      if (!metricsRes.ok) throw new Error("Failed to fetch metrics");

      const oppData = await oppRes.json();
      const signalsData = await signalsRes.json();
      const metricsData = await metricsRes.json();

      setOpportunities(oppData);
      setSignals(signalsData);
      setMetrics(metricsData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleOpenIngestModal = async (opp) => {
    setIngestClient(opp);
    setIngestModalOpen(true);
    setIngestTab("rss");
    setIngestSuccessMsg(null);
    setCustomTextContent("");
    setSelectedFile(null);
    setRssLoading(true);

    try {
      const res = await fetch(`/api/rss/feed?client_id=${opp.id}`);
      const data = await res.json();
      setRssArticles(data.articles || []);
    } catch (e) {
      console.error("Failed to fetch RSS feed:", e);
      setRssArticles([]);
    } finally {
      setRssLoading(false);
    }
  };

  const handleIngestArticle = async (article) => {
    if (!ingestClient || ingestingAction) return;
    setIngestingAction(true);
    setIngestSuccessMsg(null);

    try {
      const res = await fetch("/api/ingest/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: ingestClient.id,
          source_channel: "Live RSS News",
          source_name: article.title,
          text_content: `${article.title}\n${article.summary}`
        })
      });
      const data = await res.json();
      setIngestSuccessMsg(`✅ Signal extracted: ${data.extracted_signal?.signal_headline || "Market trigger recorded"}`);
      fetchDashboardData();
    } catch (err) {
      console.error("Ingest error:", err);
      setIngestSuccessMsg("❌ Failed to ingest RSS article. Please retry.");
    } finally {
      setIngestingAction(false);
    }
  };

  const handleIngestCustomText = async (channel, name) => {
    if (!ingestClient || !customTextContent.trim() || ingestingAction) return;
    setIngestingAction(true);
    setIngestSuccessMsg(null);

    try {
      const res = await fetch("/api/ingest/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: ingestClient.id,
          source_channel: channel,
          source_name: name,
          text_content: customTextContent
        })
      });
      const data = await res.json();
      setIngestSuccessMsg(`✅ Touchpoint ingested: ${data.extracted_signal?.signal_headline || "Signal processed"}`);
      fetchDashboardData();
    } catch (err) {
      console.error("Ingest error:", err);
      setIngestSuccessMsg("❌ Failed to ingest touchpoint. Please retry.");
    } finally {
      setIngestingAction(false);
    }
  };

  const handleIngestFileUpload = async () => {
    if (!ingestClient || !selectedFile || ingestingAction) return;
    setIngestingAction(true);
    setIngestSuccessMsg(null);

    const formData = new FormData();
    formData.append("client_id", ingestClient.id);
    formData.append("source_channel", "Document Upload");
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/ingest/file", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setIngestSuccessMsg(`✅ Document processed: ${data.extracted_signal?.signal_headline || "File vector chunk created"}`);
      fetchDashboardData();
    } catch (err) {
      console.error("File upload error:", err);
      setIngestSuccessMsg("❌ File upload ingestion failed. Please retry.");
    } finally {
      setIngestingAction(false);
    }
  };

  const handleOpenPreview = async (opp) => {
    setActiveClient(opp);
    setCurrentSlideIndex(0);
    setComplianceResult(null);
    setFlaggedSlides([]);
    
    setDeckOverrides(prev => ({
      ...prev,
      market_date: `Market Snapshot as of ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} `
    }));
    
    setPreviewOpen(true);
    
    setChatMessages([
      {
        sender: "bot",
        text: `Hello! I am your Origination Copilot for **${opp.name}**.\n\nYou can ask questions, run regulatory audits, or instruct me to adjust parameters:\n• **"Run FINRA & MiFID II compliance check"**\n• **"In Slide 7, update iTraxx Main to 60 bps"**\n• **"In Slide 6, change rate to 4.50% instead of 4.55%"**\n• **"Adjust bond sizing to €800M and tenor to 10Y"**`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);

    try {
      const res = await fetch(`/api/client/${opp.id}/maturities`);
      const data = await res.json();
      setClientMaturities(data);
    } catch (e) {
      console.error("Failed to fetch maturities:", e);
      setClientMaturities([]);
    }
  };

  const handleRunComplianceAudit = async () => {
    if (!activeClient || complianceAuditing) return;
    setComplianceAuditing(true);

    const auditUserMsg = {
      sender: "user",
      text: "Run FINRA Rule 2210 & MiFID II compliance audit on entire pitchbook",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages(prev => [...prev, auditUserMsg]);

    try {
      const res = await fetch("/api/check-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: activeClient.id,
          overrides: deckOverrides
        })
      });

      const auditData = await res.json();
      setComplianceResult(auditData);
      setFlaggedSlides(auditData.flagged_slides || []);

      const flagBullets = (auditData.flags || []).map(f => `• **Slide ${f.slide_number} (${f.rule})**: ${f.issue}`).join("\n");
      const botAuditReply = `🛡️ **Full-Deck Compliance Audit Results:**\n\n**Overall Risk Assessment:** ${auditData.overall_risk_assessment || "MEDIUM"} ⚠️\n\n${auditData.compliance_summary || "Audit completed across all 10 slides."}\n\n**Flagged Items:**\n${flagBullets || "No major flags identified."}\n\n*Click below or type "Apply compliance recommendations" to automatically remediate all slides.*`;

      setChatMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: botAuditReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isComplianceCard: true,
          remedies: auditData.recommended_overrides
        }
      ]);
    } catch (err) {
      console.error("Compliance audit error:", err);
      setChatMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Compliance audit service encountered an issue. Please retry.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setComplianceAuditing(false);
    }
  };

  const handleApplyRemediations = async (remediesObj) => {
    if (!activeClient) return;
    const activeClientId = activeClient.id || activeClient.client_id || "CLI102";
    const clientName = activeClient.name || activeClient.client_name || "Corporate Client";
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: activeClientId,
          prompt: "Apply compliance recommendations and certify full deck",
          history: chatMessages.map(m => ({ role: m.sender === "bot" ? "assistant" : "user", text: m.text })),
          overrides: deckOverrides
        })
      });
      const data = await res.json();
      
      if (data.overrides) {
        setDeckOverrides(prev => ({ ...prev, ...data.overrides }));
      }
      setFlaggedSlides([]);
      setComplianceResult({ compliant: true, overall_risk_assessment: "LOW" });

      const replyText = data.reply || `✅ **Pitchbook Remediated & Certified for ${clientName}:**

• **Market Capture & Timestamps**: Verified as of current market close.
• **Indicative Terms & Sizing**: Qualified with non-binding execution caveats.
• **Regulatory Disclosures**: MiFID II, EMIR, and Target Market notices active.

*All 10 slides in the preview canvas and PowerPoint deck are now 100% compliant.*`;

      setChatMessages(prev => [
        ...prev,
        {
          sender: "user",
          text: "Apply compliance recommendations",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        },
        {
          sender: "bot",
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.error("Compliance remediation call failed:", err);
    }
  };

  const handleSendMessage = useCallback(async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || !activeClient) return;

    if (textToSend.toLowerCase().includes("compliance") && textToSend.toLowerCase().includes("check")) {
      handleRunComplianceAudit();
      setInputQuery("");
      return;
    }

    if (textToSend.toLowerCase().includes("remediat") || textToSend.toLowerCase().includes("apply compliance")) {
      handleApplyRemediations();
      setInputQuery("");
      return;
    }

    const userMsg = {
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    setInputQuery("");
    setCopilotLoading(true);

    try {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: activeClient.id,
          prompt: textToSend,
          history: updatedHistory,
          current_overrides: deckOverrides
        })
      });

      const data = await res.json();
      
      if (data.overrides) {
        setDeckOverrides(prev => ({ ...prev, ...data.overrides }));
        if (textToSend.toLowerCase().includes("remediat") || textToSend.toLowerCase().includes("compliance")) {
          setFlaggedSlides([]);
          setComplianceResult({ compliant: true, overall_risk_assessment: "LOW" });
        }
      }

      setChatMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: data.reply || "I have processed your request. How can I assist further?",
          time: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (e) {
      console.error("Copilot error:", e);
      setChatMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Error communicating with the AI Copilot. Please check service connection.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setCopilotLoading(false);
    }
  }, [activeClient, chatMessages, deckOverrides, inputQuery]);

  const handleDownloadDeck = async (clientId) => {
    setLoadingClient(clientId);
    try {
      const response = await fetch("/api/pitchbook/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          overrides: {
            ...deckOverrides,
            client_name: activeClient?.name || activeClient?.client_name,
            rm_name: deckOverrides.rm_name || activeClient?.rm_name,
            product_family: activeClient?.opportunity_type?.includes("FX") ? "FX_HEDGE" :
                            activeClient?.opportunity_type?.includes("Rate") || activeClient?.name?.includes("BASF") ? "RATES_HEDGE" :
                            activeClient?.opportunity_type?.includes("Green") || activeClient?.name?.includes("Enel") ? "GREEN_ESG" : "DCM_REFI",
            revenue_str: deckOverrides.revenue_str || (activeClient?.revenue_eur_m ? `€${Number(activeClient.revenue_eur_m).toLocaleString()}M` : undefined),
            ebitda_str: deckOverrides.ebitda_str || (activeClient?.ebitda_eur_m ? `€${Number(activeClient.ebitda_eur_m).toLocaleString()}M` : undefined),
            net_debt_str: deckOverrides.net_debt_str || (activeClient?.net_debt ? `€${(activeClient.net_debt/1000).toFixed(1)}B` : undefined),
            liquidity_str: deckOverrides.liquidity_str || (activeClient?.liquidity ? `€${(activeClient.liquidity/1000).toFixed(1)}B` : undefined),
          }
        })
      });
      
      if (!response.ok) throw new Error("Failed to generate deck");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ING_${clientId}_Pitchbook.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Error downloading pitchbook. Please retry.");
    } finally {
      setLoadingClient(null);
    }
  };

  const getSlideContent = (index, opp) => {
    if (!opp) return null;
    const clientName = deckOverrides.client_name || opp.name || opp.client_name || "Corporate Client";
    const pType = (opp.opportunity_type || opp.type || opp.product_family || "").toLowerCase();
    const cName = (clientName + " " + (opp.client_id || "")).toLowerCase();
    const isFX = pType.includes("fx") || pType.includes("currency") || cName.includes("asml") || cName.includes("cli102");
    const isGreen = pType.includes("green") || pType.includes("sustainable") || cName.includes("enel") || cName.includes("cli101");
    const isRates = pType.includes("rate") || pType.includes("irs") || cName.includes("basf") || cName.includes("cli103");
    const pFamily = isFX ? "FX_HEDGE" : isGreen ? "GREEN_ESG" : isRates ? "RATES_HEDGE" : "DCM_REFI";

    // Client and Product-Aware Defaults from Database
    const defaultNetDebt = isGreen ? "€58,500M" : isRates ? "€16,200M" : "€3,192M";
    const defaultLiquidity = isGreen ? "€14,200M" : isRates ? "€7,800M" : "€1,008M";
    const defaultRevenue = isGreen ? "€95,000M" : isRates ? "€65,000M" : "€28,300M";
    const defaultEbitda = isGreen ? "€20,900M" : isRates ? "€14,300M" : "€6,226M";
    const defaultMatWall = isGreen ? "€10,127M" : isRates ? "€3,000M" : "€0M";
    const defaultRM = isGreen ? "Marco Bianchi" : isRates ? "Klaus Weber" : "Daan Visser";

    const netDebtVal = deckOverrides.net_debt_str || deckOverrides.net_debt || opp.net_debt_str || (opp.net_debt ? `€${Number(opp.net_debt).toLocaleString()}M` : defaultNetDebt);
    const liquidityVal = deckOverrides.liquidity_str || deckOverrides.liquidity || opp.liquidity_str || (opp.liquidity ? `€${Number(opp.liquidity).toLocaleString()}M` : defaultLiquidity);
    const revenueVal = deckOverrides.revenue_str || deckOverrides.revenue || opp.revenue_str || (opp.revenue_eur_m ? `€${Number(opp.revenue_eur_m).toLocaleString()}M` : defaultRevenue);
    const ebitdaVal = deckOverrides.ebitda_str || deckOverrides.ebitda || opp.ebitda_str || (opp.ebitda_eur_m ? `€${Number(opp.ebitda_eur_m).toLocaleString()}M` : defaultEbitda);
    const maturityVal = deckOverrides.maturity_wall_str || deckOverrides.maturity_wall || opp.debt_maturing_24m_str || defaultMatWall;
    const unhedgedGapVal = deckOverrides.unhedged_gap_str || deckOverrides.unhedged_gap || deckOverrides.unhedged_usd_commercial_gap || "$8.0B";
    const tierVal = deckOverrides.tier || deckOverrides.rating || opp.tier || "Tier 1 (Investment Grade)";
    const rmName = deckOverrides.rm_name || opp.rm_name || defaultRM;

    const kickerText = deckOverrides.kicker || (
      isFX ? "FX & COMMODITY RISK ADVISORY" :
      isGreen ? "SUSTAINABLE & ESG CAPITAL STRUCTURING" :
      isRates ? "RATES RISK & LIABILITY MANAGEMENT" : "DCM CAPITAL STRUCTURING"
    );

    const subtitleText = deckOverrides.subtitle || (
      isFX ? "Strategic FX Exposure Risk & Layered Hedging Programme" :
      isGreen ? "Inaugural Hybrid Green Bond & Sustainability Framework" :
      isRates ? "Pre-Hedge Swap Overlay & Rate Sensitivity Immunisation" : "Refinancing & Capital Markets Execution Framework"
    );

    switch (index) {
      case 0: // COVER
        return (
          <div className="h-full flex flex-col justify-between bg-[#0C112B] text-white p-8 rounded-lg relative overflow-hidden border-l-8 border-[#FF6200]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-mono tracking-widest text-[#FF6200] uppercase font-bold">
                  {kickerText}
                </span>
                <h1 className="text-3xl font-bold tracking-tight mt-1 text-white">{clientName}</h1>
                <p className="text-sm text-gray-300 mt-1 font-medium">{subtitleText}</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <img src="/assets/ing_logo_white.png" alt="ING" className="h-7 object-contain mb-1" />
                <span className="text-[10px] text-gray-400 font-medium tracking-wide">Financial Markets Origination</span>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-4 flex justify-between items-end text-[11px] text-gray-400">
              <div>
                <p className="font-semibold text-gray-200">Prepared by: {rmName}</p>
                <p className="text-gray-400 text-[10px]">Global Sector Coverage & Capital Markets Desk</p>
              </div>
              <div className="text-gray-400 text-[10px]">{deckOverrides.market_date || "Market Snapshot as of 26 August 2026 "}</div>
            </div>
          </div>
        );

      case 1: // STRATEGIC CATALYST
        return (
          <div className="h-full flex flex-col justify-between bg-white p-6 rounded-lg border border-gray-200">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[9px] font-mono text-[#FF6200] uppercase font-bold tracking-wider">
                    {isFX ? "FX RISK CATALYST" : isGreen ? "SUSTAINABILITY CATALYST" : isRates ? "RATE RISK CATALYST" : "STRATEGIC CATALYST"}
                  </span>
                  <h2 className="text-lg font-bold text-[#000066] mt-0.5">
                    {isFX ? "Currency Exposure & Market Catalyst" :
                     isGreen ? "ESG Capital Strategy & Decarbonization Catalyst" :
                     isRates ? "Rate Path Volatility & IRS Pre-Hedge Catalyst" : "Executive Context & Opportunity Rationale"}
                  </h2>
                </div>
                <img src="/assets/ing_logo_orange.png" alt="ING" className="h-6 object-contain" />
              </div>
              <div className="grid grid-cols-3 gap-3 text-[11px]">
                <div className="p-3 bg-orange-50/60 rounded border border-orange-200">
                  <p className="font-bold text-orange-800 mb-1">Primary Market Trigger</p>
                  <p className="text-gray-700 text-[10px] leading-relaxed">
                    {deckOverrides.trigger || (
                      isFX ? "Commercial inflow shift: North American expansion increased USD revenue to >$12B against 50% hedge ratio (~$8bn gap)." :
                      isGreen ? "EU Taxonomy alignment: €3.5B eligible renewable & decarbonization CapEx pipeline ready for green financing." :
                      isRates ? "Upcoming €3.2B debt maturities face repricing risk amid benchmark curve fluctuations." :
                      "Balance sheet shift & refinancing window identified."
                    )}
                  </p>
                </div>
                <div className="p-3 bg-blue-50/60 rounded border border-blue-200">
                  <p className="font-bold text-[#000066] mb-1">Window of Opportunity</p>
                  <p className="text-gray-700 text-[10px] leading-relaxed">
                    {deckOverrides.window || (
                      isFX ? "EUR/USD forward points offer structural hedging pickup; volatility corridor allows zero-cost collar structuring." :
                      isGreen ? "Strong ESG investor liquidity generating 3-7 bps greenium pricing concession across European green bonds." :
                      isRates ? "Current 5Y EUR swap easing at 2.62% provides attractive entry window for forward-starting IRS." :
                      "Favorable benchmark credit spreads across European issuance windows."
                    )}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded border border-emerald-200">
                  <p className="font-bold text-emerald-800 mb-1">Recommended Action</p>
                  <p className="text-gray-700 text-[10px] leading-relaxed">
                    {deckOverrides.action || (
                      isFX ? "Propose staged 12M–24M layered FX hedging programme with zero-cost collar overlays to close ~$8bn gap." :
                      isGreen ? "Establish inaugural Green Bond / Hybrid Framework with second-party SPO verification." :
                      isRates ? "Execute €400M pre-hedge IRS overlay to lock in current base yield before debt issuance." :
                      "Propose capital structuring dialogue and benchmark EMTN roadshow."
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center text-[9px] text-gray-400 border-t border-gray-100 pt-1.5">ING Wholesale Banking • Strictly Confidential</div>
          </div>
        );

      case 2: // EXECUTIVE SUMMARY
        return (
          <div className="h-full flex flex-col justify-between bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 h-full">
              <div className="col-span-5 bg-[#FF6200] p-6 text-white flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-1">Executive Summary</h2>
                  <div className="w-8 h-0.5 bg-white mb-3"></div>
                  <p className="text-xs font-semibold mb-2">
                    {isFX ? "Strategic FX Architecture" : isGreen ? "Sustainable Finance Framework" : isRates ? "Rate Risk Immunisation" : "Proactive Capital Structuring"}
                  </p>
                  <p className="text-[10px] text-white/90 leading-relaxed">
                    Customized execution roadmap for {clientName} based on group treasury requirements and live market backdrop.
                  </p>
                </div>
                
              </div>
              <div className="col-span-7 p-5 flex flex-col justify-between text-[11px] space-y-2 relative">
                <div className="flex justify-end mb-1">
                  <img src="/assets/ing_logo_orange.png" alt="ING" className="h-5 object-contain" />
                </div>
                {(
                  isFX ? [
                    { t: "Exposure-led Architecture", d: `Addressing the ${unhedgedGapVal} USD hedge gap from commercial revenue expansion.` },
                    { t: "Multi-Tenor Layered Corridors", d: "Rolling 12M–24M zero-cost participating collars protecting gross margins." },
                    { t: "Electronic Desk Execution", d: "Automated liquidity sourcing through ING global FX electronic trading desk." },
                    { t: "Dedicated Coverage", d: `Sector coverage led by ${rmName} with IFRS 9 hedge accounting support.` }
                  ] : isGreen ? [
                    { t: "Green Framework Alignment", d: "Alignment with ICMA Green Bond Principles and EU Taxonomy standards." },
                    { t: "Use of Proceeds Pool", d: "Ring-fenced eligible asset pool with annual impact & allocation verification." },
                    { t: "Greenium Advantage", d: "Capturing 3-7 bps new-issue concession advantage from dedicated ESG funds." },
                    { t: "Sole ESG Structurer", d: "ING leading SPO documentation, investor roadshow, and syndicate execution." }
                  ] : isRates ? [
                    { t: "Rate Risk Assessment", d: `Quantifying interest rate repricing risk across the ${maturityVal} debt horizon.` },
                    { t: "Pre-Hedge Swap Overlay", d: "Forward-starting IRS and swaptions to lock in current benchmark yield curve." },
                    { t: "Hedge Policy Alignment", d: "Optimizing treasury fixed vs floating debt ratio target." },
                    { t: "Syndicate Distribution", d: "Full balance sheet underwriting and rating agency advisory." }
                  ] : [
                    { t: "Maturity-Led Sizing", d: `Addressing the upcoming ${maturityVal} maturity profile proactively.` },
                    { t: "Right-Sized Structure", d: `Tailored combination of ${deckOverrides.notional_bond} benchmark bond.` },
                    { t: "Syndicate Distribution", d: "Direct distribution across European institutional investor accounts." },
                    { t: "Balance Sheet Support", d: "Committed credit facilities and ongoing treasury advisory." }
                  ]
                ).map((p, i) => (
                  <div key={i} className="flex space-x-2 items-start">
                    <div className="w-4 h-4 rounded-full bg-[#FF6200] text-white flex items-center justify-center font-bold text-[9px] shrink-0">{i + 1}</div>
                    <div>
                      <p className="font-bold text-[#FF6200] text-[11px]">{p.t}</p>
                      <p className="text-gray-600 text-[10px]">{p.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // BALANCE SHEET
        return (
          <div className="h-full flex flex-col justify-between bg-white p-5 rounded-lg border border-gray-200">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[9px] font-mono text-[#FF6200] uppercase font-bold tracking-wider">
                    {isGreen ? "ESG BALANCE SHEET FOUNDATION" : "BALANCE SHEET FOUNDATION"}
                  </span>
                  <h2 className="text-base font-bold text-[#000066] mt-0.5">
                    {isFX ? "Corporate Liquidity & Currency Inflow Profile" :
                     isGreen ? "Balance Sheet Capacity & Green CapEx Profile" :
                     isRates ? "Capital Structure & Liquidity Snapshot" : "Capital Structure & Treasury Health Profile"}
                  </h2>
                </div>
                <img src="/assets/ing_logo_orange.png" alt="ING" className="h-6 object-contain" />
              </div>
              <div className="grid grid-cols-4 gap-3 text-center mb-3">
                <div className="p-2.5 bg-gray-50 rounded border border-gray-200">
                  <p className="text-[10px] text-gray-500 font-semibold">Net Debt</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{netDebtVal}</p>
                </div>
                <div className="p-2.5 bg-gray-50 rounded border border-gray-200">
                  <p className="text-[10px] text-gray-500 font-semibold">Available Liquidity</p>
                  <p className="text-sm font-bold text-emerald-700 mt-0.5">{liquidityVal}</p>
                </div>
                <div className="p-2.5 bg-gray-50 rounded border border-gray-200">
                  <p className="text-[10px] text-gray-500 font-semibold">{isFX ? "Unhedged FX Gap" : isGreen ? "Eligible Green CapEx" : "24M Maturity Wall"}</p>
                  <p className="text-sm font-bold text-orange-600 mt-0.5">{isFX ? unhedgedGapVal : isGreen ? "€3.5B" : maturityVal}</p>
                </div>
                <div className="p-2.5 bg-gray-50 rounded border border-gray-200">
                  <p className="text-[10px] text-gray-500 font-semibold">Credit Rating / Tier</p>
                  <p className="text-sm font-bold text-[#000066] mt-0.5">{tierVal}</p>
                </div>
              </div>
              <div className="p-3 bg-blue-50/50 rounded border border-blue-200 text-[10px] text-gray-700 space-y-1">
                <p className="font-bold text-[#000066]">Corporate Financial Standing & Balance Sheet Capacity</p>
                <p>• Annual Group Revenue of {revenueVal} supported by EBITDA of {ebitdaVal}.</p>
                <p>• Robust liquidity buffer of {liquidityVal} provides substantial capacity to execute structured financing and risk management operations.</p>
              </div>
            </div>
            <div className="text-center text-[9px] text-gray-400 border-t border-gray-100 pt-1.5">ING Wholesale Banking • Strictly Confidential</div>
          </div>
        );

                  case 4: // SLIDE 5: EXPOSURE / MATURITY / GREEN ASSET POOL
        return (
          <div className="h-full flex flex-col justify-between bg-white p-5 rounded-lg border border-gray-200">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[9px] font-mono text-[#FF6200] uppercase font-bold tracking-wider">
                    {isFX ? "CURRENCY EXPOSURE PROFILE" : isGreen ? "USE OF PROCEEDS" : isRates ? "MATURITY & SWAP SCHEDULE" : "MATURITY SCHEDULE"}
                  </span>
                  <h2 className="text-base font-bold text-[#000066] mt-0.5">
                    {isFX ? "FX Currency Breakdown & Hedging Gap" :
                     isGreen ? "Eligible Green Asset Pool & Use of Proceeds" :
                     isRates ? "Debt Maturity Profile & Swap Refinancing Horizon" : "Debt Maturity Profile & Refinancing Horizon"}
                  </h2>
                </div>
                <img src="/assets/ing_logo_orange.png" alt="ING" className="h-6 object-contain" />
              </div>
              <div className="grid grid-cols-2 gap-4 my-auto">
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="font-bold text-[#000066] text-xs mb-2">
                    {isFX ? "Commercial Currency Exposure Flow" : isGreen ? "Eligible Green Asset & CapEx Pool" : "Tranche Maturity Breakdown"}
                  </p>
                  <div className="text-[10px] space-y-1.5 text-gray-700">
                    {isFX ? (
                      <>
                        <p>• <strong>USD Gross Inflows:</strong> $18.5B / year (Export billing)</p>
                        <p>• <strong>EUR Cost Base:</strong> €14.2B / year (R&D, manufacturing)</p>
                        <p>• <strong>Layered Coverage:</strong> 42% covered across 12M</p>
                        <p className="font-bold text-orange-600 pt-1">Total Unhedged USD Gap: {unhedgedGapVal}</p>
                      </>
                    ) : isGreen ? (
                      <>
                        <p>• <strong>Renewable Generation:</strong> €1,850M (Solar & Wind)</p>
                        <p>• <strong>Grid Modernization:</strong> €1,100M (Smart Metering)</p>
                        <p>• <strong>Energy Storage:</strong> €550M (Battery Systems)</p>
                        <p className="font-bold text-orange-600 pt-1">Total Eligible Pool: €3,500M</p>
                      </>
                    ) : (
                      <>
                        {clientMaturities && clientMaturities.length > 0 ? (
                          clientMaturities.slice(0, 3).map((m, idx) => (
                            <p key={idx}>• <strong>{m.year || m.maturity_year || `Tranche ${idx+1}`}:</strong> {m.amount_str || `€${m.amount_eur_m || m.amount}M`} ({m.description || m.facility_type || "Senior Debt"})</p>
                          ))
                        ) : (
                          <>
                            <p>• <strong>2026 Maturities:</strong> €600M (Commodity & Fixed Notes)</p>
                            <p>• <strong>2027 Maturities:</strong> €3,000M (IRS Pre-Hedge Refinancing)</p>
                            <p>• <strong>2028 Maturities:</strong> €5,497M (Syndicated Term Loan)</p>
                          </>
                        )}
                        <p className="font-bold text-orange-600 pt-1">Total 24M Maturity Wall: {maturityVal}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-blue-50/50 rounded border border-blue-200">
                  <p className="font-bold text-[#000066] text-xs mb-2">
                    {isFX ? "Layered Collar Execution Architecture" : isGreen ? "Green Framework & SPO Structuring" : isRates ? "Pre-Hedge Overlay Sizing" : "Refinancing Wall Rationale"}
                  </p>
                  <p className="text-[10px] text-gray-700 leading-relaxed">
                    {isFX ? `Customized rolling 12M–24M FX hedging corridor for ${clientName}. Protects operating margin floor while retaining upside participation up to cap limits without upfront option premium.` :
                     isGreen ? `Inaugural Green Financing Framework aligned with ICMA Green Bond Principles and EU Taxonomy. Supported by second-party opinion (SPO) provider to capture 3-7 bps ESG greenium pricing advantage.` :
                     isRates ? `Upcoming maturities cluster in near-term windows. Locking in forward-starting swap rates eliminates repricing uncertainty ahead of primary debt issuance.` :
                     `Upcoming debt maturities of ${maturityVal} cluster in near-term windows. Proactive capital structuring and benchmark EMTN roadshows ensure optimal tenor extension and liquidity resilience.`}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center text-[9px] text-gray-400 border-t border-gray-100 pt-1.5">ING Wholesale Banking • Strictly Confidential</div>
          </div>
        );

              case 5: { // SLIDE 6: SENSITIVITY & STRATEGIC RATIONALE
          const s6_refiPct = Number(deckOverrides?.refi_bond_pct || 60);
          const s6_prehedgePct = Number(deckOverrides?.prehedge_swap_pct || (100 - s6_refiPct));
          
          // Parse only the first integer to prevent '7 Years (T + 7Y)' turning into 77
          const s6_rawTenor = String(deckOverrides?.tenor || "7");
          const s6_tenorYears = parseInt(s6_rawTenor.match(/\d+/)?.[0] || "7", 10) || 7;
          
          const s6_rawSpread = String(deckOverrides?.spread || "82");
          const s6_spreadBps = parseInt(s6_rawSpread.match(/\d+/)?.[0] || "82", 10) || 82;
          
          const s6_rawSwap = String(deckOverrides?.swap_5y || "2.62");
          const s6_swapRate = parseFloat(s6_rawSwap.match(/\d+(\.\d+)?/)?.[0] || "2.62") || 2.62;
          
          const s6_calcAllIn = (s6_swapRate + (s6_spreadBps / 100)).toFixed(2);
          const s6_allInStr = deckOverrides?.indicative_all_in_rate ? `${deckOverrides.indicative_all_in_rate}%` : `${s6_calcAllIn}%`;
          const s6_allInNum = parseFloat(s6_calcAllIn);

          const s6_rateLock = (deckOverrides?.rate_scenario_lock && !deckOverrides.rate_scenario_lock.includes("3.60")) ? deckOverrides.rate_scenario_lock : `${s6_allInStr} (locked)`;
          const s6_rateUp = deckOverrides?.rate_scenario_up || `${(s6_allInNum + 1.00).toFixed(2)}%`;
          const s6_rateUnchanged = deckOverrides?.rate_scenario_unchanged || s6_allInStr;
          const s6_rateDown = deckOverrides?.rate_scenario_down || `${(s6_allInNum - 0.50).toFixed(2)}%`;

          const s6_clientRating = activeClient?.rating || "BBB+";
          const s6_clientWall = deckOverrides?.maturity_wall_str || activeClient?.debtMaturing24M || "€3,000M";

          return (
            <div className="h-full flex flex-col justify-between bg-white p-5 rounded-lg border border-gray-200">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[9px] font-mono text-[#FF6200] uppercase font-bold tracking-wider">STRATEGIC RATIONALE & SCENARIO ANALYSIS</span>
                    <h2 className="text-base font-bold text-[#000066] mt-0.5">
                      {isFX ? "Rationale of our Proposal & FX Corridor Analysis" :
                       isGreen ? "Rationale of our Proposal & Greenium Advantage" :
                       isRates ? "Rationale of our Proposal & Rate Sensitivity" : "Rationale of our Proposal & Refinancing Analysis"}
                    </h2>
                  </div>
                  <img src="/assets/ing_logo_orange.png" alt="ING" className="h-6 object-contain" />
                </div>

                <div className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-5 bg-white border border-gray-200 rounded p-3 text-[10px] space-y-3">
                    <div>
                      <h4 className="font-bold text-[#FF6200] uppercase tracking-wide text-[10px] mb-1">Scenario</h4>
                      <p className="text-gray-700 leading-relaxed text-[9.5px]">
                        {deckOverrides?.scenario_text || (
                          isFX ? `A corporate treasury with expanding commercial operations in North America has unhedged USD exposures. Fluctuations in EUR/USD spot risk compressing operating margins. Treasury seeks certainty on downside floor while retaining upside participation.` :
                          isGreen ? `A leading corporate issuer is evaluating its inaugural sustainable finance framework. Dedicated ESG funds offer pricing tension. Treasury seeks to capture the 3-5 bps greenium benefit while establishing market leadership in EU taxonomy alignment.` :
                          `A ${s6_clientRating} rated issuer has a ${s6_clientWall} debt maturity wall upcoming. Current swap-plus-spread levels imply higher refinancing costs. Treasury wants to lock in funding cost ahead of maturity while managing execution risk.`
                        )}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                      <h4 className="font-bold text-[#FF6200] uppercase tracking-wide text-[10px] mb-1">Recommended Structure</h4>
                      <ul className="space-y-1 text-gray-700 text-[9.5px]">
                        {isFX ? (
                          <>
                            <li className="flex items-start gap-1.5"><span className="text-[#FF6200] font-bold">•</span><span><strong>{s6_refiPct}% hedged</strong> via layered forward contracts locking core budget rate.</span></li>
                            <li className="flex items-start gap-1.5"><span className="text-[#FF6200] font-bold">•</span><span><strong>{s6_prehedgePct}% structured</strong> in zero-cost participating collars ({deckOverrides?.fx_collar_floor || "1.0850"} floor / {deckOverrides?.fx_collar_cap || "1.0450"} cap).</span></li>
                            <li className="flex items-start gap-1.5"><span className="text-[#FF6200] font-bold">•</span><span>Staggered quarterly roll balances certainty with liquidity.</span></li>
                          </>
                        ) : isGreen ? (
                          <>
                            <li className="flex items-start gap-1.5"><span className="text-[#FF6200] font-bold">•</span><span><strong>{s6_refiPct}% Green Benchmark EMTN</strong>, capturing {deckOverrides?.greenium_bps || 5} bps greenium pricing advantage.</span></li>
                            <li className="flex items-start gap-1.5"><span className="text-[#FF6200] font-bold">•</span><span><strong>{s6_prehedgePct}% Sustainability-Linked Tranche</strong> tied to verified Scope 1/2 reduction SPTs.</span></li>
                            <li className="flex items-start gap-1.5"><span className="text-[#FF6200] font-bold">•</span><span>Ring-fenced eligible asset pool aligned with ICMA Green Bond Principles.</span></li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start gap-1.5"><span className="text-[#FF6200] font-bold">•</span><span><strong>{s6_refiPct}% refinanced</strong> via a new {s6_tenorYears}-year vanilla bond, indicatively priced at swap + {s6_spreadBps}bps (~{s6_allInStr} all-in).</span></li>
                            <li className="flex items-start gap-1.5"><span className="text-[#FF6200] font-bold">•</span><span><strong>{s6_prehedgePct}% pre-hedged</strong> via forward-starting IRS, locking current benchmark rate.</span></li>
                            <li className="flex items-start gap-1.5"><span className="text-[#FF6200] font-bold">•</span><span>Staggered approach balances rate-lock certainty with sizing flexibility.</span></li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="col-span-7 bg-gray-50 border border-gray-200 rounded p-3 space-y-2">
                    <h4 className="text-center font-bold text-[#FF6200] uppercase tracking-wide text-[10px]">
                      {isFX ? "Illustrative FX Margin Impact by Scenario" : isGreen ? "Cost Comparison vs Conventional Issuance" : "Illustrative All-In Cost by Scenario"}
                    </h4>
                    <div className="border border-gray-200 rounded overflow-hidden text-[9.5px] bg-white">
                      <table className="w-full text-left">
                        <thead className="bg-[#FF6200] text-white font-semibold">
                          <tr>
                            <th className="p-1.5">{isFX ? "FX Scenario" : isGreen ? "Issuance Format" : "Rate Scenario"}</th>
                            <th className="p-1.5 text-center">{isFX ? "Layered Collar Strategy" : isGreen ? "Indicative Spread" : "Refinance Today"}</th>
                            <th className="p-1.5 text-center">{isFX ? "Unhedged Exposure" : isGreen ? "Annual Savings" : "Wait 6 months"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-700">
                          {isFX ? (
                            <>
                              <tr className="bg-orange-50/40"><td className="p-1.5 font-medium">EUR/USD +5% (USD Weakens)</td><td className="p-1.5 text-center text-emerald-700 font-bold">{deckOverrides?.fx_collar_floor || "1.0850"} Floor Protected</td><td className="p-1.5 text-center text-rose-600 font-bold">{deckOverrides?.fx_scen_up_unhedged || "-$450M Impact"}</td></tr>
                              <tr className="bg-gray-50"><td className="p-1.5 font-medium">Spot Unchanged ({deckOverrides?.spot_rate || "1.0650"})</td><td className="p-1.5 text-center font-bold">{deckOverrides?.spot_rate || "1.0650"} Locked</td><td className="p-1.5 text-center font-bold">{deckOverrides?.spot_rate || "1.0650"} Spot</td></tr>
                              <tr><td className="p-1.5 font-medium">EUR/USD -5% (USD Strengthens)</td><td className="p-1.5 text-center text-emerald-700 font-bold">Participate to {deckOverrides?.fx_collar_cap || "1.0450"}</td><td className="p-1.5 text-center text-emerald-700 font-bold">+$380M Gain</td></tr>
                            </>
                          ) : isGreen ? (
                            <>
                              <tr className="bg-emerald-50/40"><td className="p-1.5 font-medium">Inaugural Green Bond (with Greenium)</td><td className="p-1.5 text-center text-emerald-700 font-bold">Mid-Swap + {s6_spreadBps - (deckOverrides?.greenium_bps || 5)} bps (-{deckOverrides?.greenium_bps || 5} bps)</td><td className="p-1.5 text-center text-emerald-700 font-bold">€375,000 / yr</td></tr>
                              <tr className="bg-gray-50"><td className="p-1.5 font-medium">Sustainability-Linked Bond (SLB)</td><td className="p-1.5 text-center font-bold">Mid-Swap + {s6_spreadBps - 2} bps (-2 bps)</td><td className="p-1.5 text-center font-bold">€150,000 / yr</td></tr>
                              <tr><td className="p-1.5 font-medium">Plain-Vanilla Senior EMTN</td><td className="p-1.5 text-center text-gray-500">Mid-Swap + {s6_spreadBps} bps (Flat)</td><td className="p-1.5 text-center text-gray-400">Baseline</td></tr>
                            </>
                          ) : (
                            <>
                              <tr className="bg-orange-50/40"><td className="p-1.5 font-medium">Rates +100bp</td><td className="p-1.5 text-center text-emerald-700 font-bold">{s6_rateLock}</td><td className="p-1.5 text-center text-rose-600 font-bold">{s6_rateUp}</td></tr>
                              <tr className="bg-gray-50"><td className="p-1.5 font-medium">Unchanged</td><td className="p-1.5 text-center text-gray-700 font-bold">{s6_rateLock}</td><td className="p-1.5 text-center text-gray-700 font-bold">{s6_rateUnchanged}</td></tr>
                              <tr><td className="p-1.5 font-medium">Rates -50bp</td><td className="p-1.5 text-center text-gray-700 font-bold">{s6_rateLock}</td><td className="p-1.5 text-center text-emerald-600 font-bold">{s6_rateDown}</td></tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-2 bg-blue-50/50 rounded border border-blue-100 text-[9px] text-gray-700 leading-tight">
                      <strong className="text-[#000066] block mb-0.5">Reading the table:</strong>
                      {isFX ? `A zero-cost collar provides a hard floor at ${deckOverrides?.fx_collar_floor || "1.0850"} against adverse currency moves while allowing upside participation up to ${deckOverrides?.fx_collar_cap || "1.0450"}, eliminating upfront premium expense while protecting operating margin.` :
                       isGreen ? `Issuing in Green format attracts dedicated sustainability orderbooks, driving tighter execution pricing (~${deckOverrides?.greenium_bps || 5} bps greenium) and expanding investor diversification across European ESG accounts.` :
                       `Refinancing today removes exposure to rate rises but forgoes the benefit if rates fall — the pre-hedge on ${s6_prehedgePct}% of the notional narrows that trade-off versus refinancing the full amount unhedged.`}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center text-[9px] text-gray-400 border-t border-gray-100 pt-1.5">ING Wholesale Banking • Strictly Confidential</div>
            </div>
          );
        }
        case 6: // SLIDE 7: MARKET INTELLIGENCE
        return (
          <div className="h-full flex flex-col justify-between bg-white p-5 rounded-lg border border-gray-200">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[9px] font-mono text-[#FF6200] uppercase font-bold tracking-wider">MARKET INTELLIGENCE</span>
                  <h2 className="text-base font-bold text-[#000066] mt-0.5">
                    {isFX ? "Central Bank Differentials & FX Forward Points" :
                     isGreen ? "ESG Credit Spreads & Green Bond Index Backdrop" :
                     isRates ? "Benchmark Yields & Swap Curve Backdrop" : "Benchmark Yields & Credit Spread Backdrop"}
                  </h2>
                </div>
                <img src="/assets/ing_logo_orange.png" alt="ING" className="h-6 object-contain" />
              </div>
              <div className="grid grid-cols-4 gap-2.5 text-center mb-2">
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-[9px] text-gray-500 font-semibold">{isFX ? "EUR/USD Spot" : isGreen ? "EUR Green Spread" : "5Y EUR Swap"}</p>
                  <p className="text-xs font-bold text-[#000066] mt-0.5">{isFX ? (deckOverrides.spot_fx || "1.0650") : isGreen ? "77 bps" : (deckOverrides.swap_5y || "2.62%")}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-[9px] text-gray-500 font-semibold">{isFX ? "12M Forward Pts" : isGreen ? "Greenium Concession" : "10Y Bund"}</p>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">{isFX ? (deckOverrides.forward_points || "+185 pts") : isGreen ? "-5 bps" : (deckOverrides.bund_10y || "2.61%")}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-[9px] text-gray-500 font-semibold">ECB Refi Rate</p>
                  <p className="text-xs font-bold text-orange-600 mt-0.5">{deckOverrides.ecb_rate || "2.25%"}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-[9px] text-gray-500 font-semibold">{isFX ? "Fed Funds Target" : "iTraxx Main"}</p>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">{isFX ? (deckOverrides.fed_rate || "4.00–4.25%") : (deckOverrides.itraxx_main || "58 bps")}</p>
                </div>
              </div>
              <div className="p-3 bg-blue-50/40 rounded border border-blue-100 text-[10px] text-gray-700 space-y-1">
                <p className="font-bold text-[#000066]">Macro & Market Context</p>
                <p>• Central Bank Policy: ECB Refinancing Rate at {deckOverrides.ecb_rate || "2.25%"}; Fed Funds Target at {deckOverrides.fed_rate || "4.00–4.25%"}.</p>
                <p>• {isFX ? "Positive EUR/USD forward carry (+185 pts) enhances layered forward hedging." : isGreen ? "High ESG subscription ratios (3.8x book cover) provide attractive new-issue pricing compression." : "Tightening European investment grade credit spreads support attractive execution windows."}</p>
              </div>
            </div>
            <div className="text-center text-[9px] text-gray-400 border-t border-gray-100 pt-1.5">ING Wholesale Banking • Strictly Confidential</div>
          </div>
        );

              case 7: { // SLIDE 8: PROPOSAL FEATURES (2-LEG TERM SHEET)
          const s8_rawTenor = String(deckOverrides?.tenor || "7");
          const s8_tenorYears = parseInt(s8_rawTenor.match(/\d+/)?.[0] || "7", 10) || 7;
          
          const s8_rawSpread = String(deckOverrides?.spread || "82");
          const s8_spreadBps = parseInt(s8_rawSpread.match(/\d+/)?.[0] || "82", 10) || 82;

          const s8_leg1Title = isFX ? "Leg 1 — USD Bond Tranche" :
                              isGreen ? "Leg 1 — Green Bond Tranche" :
                              isRates ? "Leg 1 — New Benchmark Bond" : "Leg 1 — Senior EMTN Tranche";

          const s8_leg2Title = isFX ? "Leg 2 — Cross-Currency Swap" :
                              isGreen ? "Leg 2 — Sustainability Overlay" :
                              isRates ? "Leg 2 — Pre-Hedge Swap" : "Leg 2 — Liquidity RCF / CP";

          const s8_notionalLeg1 = deckOverrides?.notional_bond || (isFX ? "USD 600,000,000" : isGreen ? "EUR 500,000,000" : "EUR 600,000,000");
          const s8_notionalLeg2 = deckOverrides?.notional_swap || (isFX ? "EUR 550,000,000 eq." : isGreen ? "EUR 250,000,000" : "EUR 400,000,000");

          const s8_tenorLeg1 = deckOverrides?.tenor ? (deckOverrides.tenor.includes("Year") ? deckOverrides.tenor : `${s8_tenorYears} Years (T + ${s8_tenorYears}Y)`) : `${s8_tenorYears} Years (T + ${s8_tenorYears}Y)`;
          const s8_tenorLeg2 = isFX ? `Matches bond maturity (${s8_tenorYears}Y)` :
                              isGreen ? "Annual SPT verification window" :
                              isRates ? "Terminates at bond pricing" : "3–5 Years Revolving";

          const s8_benchLeg1 = isFX ? `${s8_tenorYears}Y US Treasury / SOFR` : `${s8_tenorYears}Y EUR mid-swap`;
          const s8_benchLeg2 = isFX ? "EUR/USD Cross-Currency Basis" :
                              isGreen ? "Scope 1 & 2 Decarbonisation KPI" :
                              isRates ? `${s8_tenorYears}Y EUR swap rate` : "EURIBOR / €STR";

          const s8_spreadLeg1 = deckOverrides?.spread ? (deckOverrides.spread.includes("bps") ? deckOverrides.spread : `Mid-swap + ${s8_spreadBps} bps (indicative)`) : (
            isFX ? `SOFR + ${s8_spreadBps} bps (indicative)` :
            isGreen ? `Mid-swap + ${s8_spreadBps - (deckOverrides?.greenium_bps || 5)} bps (Greenium: -${deckOverrides?.greenium_bps || 5} bps)` :
            `Mid-swap + ${s8_spreadBps} bps (indicative)`
          );

          const s8_spreadLeg2 = isFX ? "EURIBOR + 32 bps (synthetic EUR funding)" :
                              isGreen ? "+/- 5 bps SPT step-up / step-down" :
                              isRates ? `Current ${s8_tenorYears}Y swap rate (indicative)` : "EURIBOR + 45 bps (undrawn 15 bps)";

          const s8_feesLeg1 = "Underwriting fee per mandate letter";
          const s8_feesLeg2 = isFX ? "Nil (embedded in CCY swap rate)" :
                             isGreen ? "Second-Party Opinion (SPO) advisory" :
                             isRates ? "Nil (embedded in swap rate)" : "Commitment fee per facility agreement";

          const s8_settleLeg1 = isFX ? "T+5 standard for USD benchmark bonds" : "T+5 standard for EUR benchmark bonds";
          const s8_settleLeg2 = isFX ? "Simultaneous with bond closing (T+5)" :
                              isGreen ? "Annual impact & allocation verification" :
                              isRates ? "Physical / cash-settled at unwind" : "Available upon documentation execution";

          const s8_docLeg1 = isFX ? "144A / Reg S Prospectus" :
                            isGreen ? "Green Bond Framework / EMTN Prospectus" : "EMTN Programme / Prospectus";
          const s8_docLeg2 = isFX ? "ISDA Master Agreement + CSA" :
                            isGreen ? "ICMA Green Bond Principles + SPO" :
                            isRates ? "ISDA Master Agreement + CSA" : "LMA Standard Facility Agreement";

          return (
            <div className="h-full flex flex-col justify-between bg-white p-5 rounded-lg border border-gray-200">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[9px] font-mono text-[#FF6200] uppercase font-bold tracking-wider">PROPOSAL FEATURES</span>
                    <h2 className="text-base font-bold text-[#000066] mt-0.5">Proposal features</h2>
                  </div>
                  <img src="/assets/ing_logo_orange.png" alt="ING" className="h-6 object-contain" />
                </div>
                
                <div className="border border-gray-200 rounded overflow-hidden text-[9.5px]">
                  <table className="w-full text-left">
                    <thead className="bg-[#FF6200] text-white font-semibold">
                      <tr>
                        <th className="p-2 w-1/4">Term</th>
                        <th className="p-2 w-[38%]">{s8_leg1Title}</th>
                        <th className="p-2 w-[37%]">{s8_leg2Title}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-800">
                      <tr className="bg-orange-50/20">
                        <td className="p-1.5 font-bold text-gray-900">Notional</td>
                        <td className="p-1.5">{s8_notionalLeg1}</td>
                        <td className="p-1.5">{s8_notionalLeg2}</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-bold text-gray-900">Trade / pricing date</td>
                        <td className="p-1.5">Indicative — T</td>
                        <td className="p-1.5">Indicative — T</td>
                      </tr>
                      <tr className="bg-orange-50/20">
                        <td className="p-1.5 font-bold text-gray-900">Tenor / maturity</td>
                        <td className="p-1.5">{s8_tenorLeg1}</td>
                        <td className="p-1.5">{s8_tenorLeg2}</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-bold text-gray-900">Reference benchmark</td>
                        <td className="p-1.5">{s8_benchLeg1}</td>
                        <td className="p-1.5">{s8_benchLeg2}</td>
                      </tr>
                      <tr className="bg-orange-50/20">
                        <td className="p-1.5 font-bold text-gray-900">Spread / rate</td>
                        <td className="p-1.5 font-bold text-orange-700">{s8_spreadLeg1}</td>
                        <td className="p-1.5 font-bold text-orange-700">{s8_spreadLeg2}</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-bold text-gray-900">Fees</td>
                        <td className="p-1.5">{s8_feesLeg1}</td>
                        <td className="p-1.5">{s8_feesLeg2}</td>
                      </tr>
                      <tr className="bg-orange-50/20">
                        <td className="p-1.5 font-bold text-gray-900">Settlement</td>
                        <td className="p-1.5">{s8_settleLeg1}</td>
                        <td className="p-1.5">{s8_settleLeg2}</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-bold text-gray-900">Governing documentation</td>
                        <td className="p-1.5">{s8_docLeg1}</td>
                        <td className="p-1.5">{s8_docLeg2}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[8.5px] italic text-slate-500 mt-2">
                  Indicative terms for discussion purposes only. Subject to internal credit approvals, KYC/AML, and market conditions at pricing.
                </p>
              </div>
              <div className="text-center text-[9px] text-gray-400 border-t border-gray-100 pt-1.5">ING Wholesale Banking • Strictly Confidential</div>
            </div>
          );
        }
        case 8: // SLIDE 9: ROADMAP
        return (
          <div className="h-full flex flex-col justify-between bg-white p-5 rounded-lg border border-gray-200">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[9px] font-mono text-[#FF6200] uppercase font-bold tracking-wider">EXECUTION ROADMAP</span>
                  <h2 className="text-base font-bold text-[#000066] mt-0.5">
                    {isFX ? "Layered Roll Framework & Desk Execution" :
                     isGreen ? "Green Bond Framework & Issuance Timetable" :
                     isRates ? "ISDA Schedule, CSA & Execution Timeline" : "Roadmap & Syndicate Timeline"}
                  </h2>
                </div>
                <img src="/assets/ing_logo_orange.png" alt="ING" className="h-6 object-contain" />
              </div>
              <div className="grid grid-cols-4 gap-2 text-[10px] text-center">
                {(isFX ? [
                  "T - 2 Weeks: Exposure Calibration: Reconcile commercial USD inflows",
                  "T - 1 Week: Strike Setting: Calibrate 1.0850 floor / 1.0450 cap",
                  "T-Day: Electronic Execution: Execute Tranche 1 via ING FX desk",
                  "Post-Trade: Roll Schedule: Quarterly roll & IFRS 9 hedge accounting"
                ] : isGreen ? [
                  "T - 6 Weeks: Framework Drafting: Establish Green Financing Framework aligned with EU Taxonomy & ICMA.",
                  "T - 4 Weeks: SPO Verification: Engage ISS ESG / Sustainalytics for Second Party Opinion review.",
                  "T - 1 Week: ESG Roadshow: Dedicated European SRI investor marketing calls & ESG presentation.",
                  "T-Day: Syndicate Pricing: Bookbuilding, greenium spread tightening, and orderbook allocation."
                ] : isRates ? [
                  "T - 4 Weeks: Exposure Sizing: Quantify repricing gap across upcoming debt tranches",
                  "T - 2 Weeks: Pre-Hedge Execution: Execute forward-starting IRS overlay swap",
                  "T - 1 Week: Global Roadshow: Syndicate investor marketing meetings",
                  "T-Day: Pricing & Settlement: Final syndicate pricing, book allocation & closing"
                ] : [
                  "T - 4 Weeks: Documentation: Confirm EMTN base prospectus & swap schedules",
                  "T - 2 Weeks: Pre-Hedge Execution: Execute treasury pre-hedge overlay swap",
                  "T - 1 Week: Global Roadshow: Syndicate investor bookbuilding meetings",
                  "T-Day: Pricing & Settlement: Final syndicate pricing, book allocation & closing"
                ]).map((st, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="w-5 h-5 mx-auto rounded-full bg-[#FF6200] text-white flex items-center justify-center font-bold text-[10px] mb-1.5">{idx + 1}</div>
                    <p className="font-bold text-gray-900">{st.split(":")[0]}</p>
                    <p className="text-orange-700 font-semibold text-[9.5px] mt-0.5">{st.split(":")[1]}</p>
                    <p className="text-gray-500 text-[8.5px] mt-0.5">{st.split(":")[2]}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center text-[9px] text-gray-400 border-t border-gray-100 pt-1.5">ING Wholesale Banking • Strictly Confidential</div>
          </div>
        );

      case 9: // SLIDE 10: REGULATORY DISCLOSURES
        return (
          <div className="h-full flex flex-col justify-between bg-white p-5 rounded-lg border border-gray-200">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[9px] font-mono text-[#FF6200] uppercase font-bold tracking-wider">REGULATORY DISCLOSURES</span>
                  <h2 className="text-base font-bold text-[#000066] mt-0.5">
                    {isFX || isRates ? "Target Market Notice & EMIR Derivative Disclosures" :
                     isGreen ? "ICMA Green Bond Principles & Target Market Notice" :
                     "Regulatory Notices & Target Market Classification"}
                  </h2>
                </div>
                <img src="/assets/ing_logo_orange.png" alt="ING" className="h-6 object-contain" />
              </div>
              <div className="bg-gray-50 p-3 rounded border border-gray-200 text-[9px] space-y-1.5 text-gray-600">
                {deckOverrides.disclaimers.map((disc, idx) => (
                  <p key={idx} className="leading-relaxed"><strong className="text-gray-900">•</strong> {disc}</p>
                ))}
              </div>
            </div>
            <div className="text-center text-[9px] text-gray-400 border-t border-gray-100 pt-1.5">ING Wholesale Banking • Strictly Confidential</div>
          </div>
        );

      default:
        return null;
    }
  };

  const getDynamicSlideTitles = (opp) => {
    if (!opp) return [
      "01. Cover Slide", "02. Strategic Catalyst", "03. Executive Summary", 
      "04. Balance Sheet", "05. Exposure / Maturity", "06. Sensitivity Analysis", 
      "07. Market Backdrop", "08. Term Sheet", "09. Execution Roadmap", "10. Disclosures"
    ];
    const pType = (opp.opportunity_type || opp.type || opp.product_family || "").toLowerCase();
    const cName = (opp.name || opp.client_name || "").toLowerCase();
    const isFX = pType.includes("fx") || pType.includes("currency") || cName.includes("asml");
    const isGreen = pType.includes("green") || pType.includes("sustainable") || cName.includes("enel");
    const isRates = pType.includes("rate") || pType.includes("irs") || cName.includes("basf");

    if (isFX) {
      return [
        "01. Cover Slide", "02. Strategic Catalyst", "03. Executive Summary", 
        "04. Balance Sheet & Inflows", "05. FX Sizing & Hedge Gap", "06. Collar Payoff Matrix", 
        "07. Forward Points & Rates", "08. FX Advisory Term Sheet", "09. Layered Roll Schedule", "10. EMIR Disclosures"
      ];
    } else if (isGreen) {
      return [
        "01. Cover Slide", "02. Decarbonization Catalyst", "03. Executive Summary", 
        "04. ESG Balance Sheet", "05. Use of Proceeds Pool", "06. Greenium Sensitivity", 
        "07. ESG Market Backdrop", "08. Green Bond Term Sheet", "09. SPO & Syndicate Plan", "10. ICMA Disclosures"
      ];
    } else if (isRates) {
      return [
        "01. Cover Slide", "02. Rate Risk Catalyst", "03. Executive Summary", 
        "04. Capital Structure Snapshot", "05. Debt & Swap Horizon", "06. Rate Shift Sensitivity", 
        "07. Swap Curve Backdrop", "08. Pre-Hedge Term Sheet", "09. Execution Roadmap", "10. Regulatory Disclosures"
      ];
    } else {
      return [
        "01. Cover Slide", "02. Strategic Catalyst", "03. Executive Summary", 
        "04. Balance Sheet Foundation", "05. Debt Maturity Profile", "06. Refinancing Sensitivity", 
        "07. Credit Spread Backdrop", "08. EMTN Term Sheet", "09. Syndicate Timeline", "10. Regulatory Disclosures"
      ];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF6200] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading ING Financial Markets platform...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-[#FF6200] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#E05500] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] antialiased">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="bg-[#FF6200] text-white font-extrabold px-2.5 py-1 rounded text-sm tracking-wider">
                ING
              </span>
              <span className="text-[#000066] font-bold text-lg tracking-tight">
                Financial Markets Insights
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={fetchDashboardData} 
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                title="Refresh database records"
                disabled={isLoading}
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              </button>
              <div className="text-right text-xs text-gray-500 leading-tight">
                <span className="font-semibold text-gray-700">
                  {new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <br />
                {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} CET
              </div>
              <div className="w-9 h-9 rounded-full bg-[#0C112B] text-white flex items-center justify-center font-bold text-xs tracking-wider">
                SB
              </div>
              <div className="text-left text-xs leading-tight">
                <p className="font-bold text-gray-900">Sarah Bover</p>
                <p className="text-gray-500 text-[11px]">Director Financial Markets</p>
              </div>
            </div>
          </div>
        </header>

        {/* Signal Feed Banner */}
        <section className="bg-slate-900 border-b border-slate-800 text-white shadow-inner">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center space-x-5 text-xs overflow-x-auto whitespace-nowrap scrollbar-none">
            
            {/* Live Indicator */}
            <div className="flex items-center space-x-2 shrink-0 pr-4 border-r border-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-extrabold text-slate-300 tracking-wider text-[11px] uppercase">
                LIVE SIGNAL FEED
              </span>
            </div>

            {/* Clickable Signals - Continuous Marquee */}
            <div className="overflow-hidden whitespace-nowrap w-full relative group">
              <div className="animate-marquee flex items-center space-x-3 py-0.5">
                {signals && signals.length > 0 ? (
                  [...signals, ...signals].map((sig, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const el = document.getElementById(`client-${sig.client_id}`) || document.getElementById(sig.client_id);
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "center" });
                          el.classList.add("ring-2", "ring-orange-500", "transition-all", "duration-500");
                          setTimeout(() => el.classList.remove("ring-2", "ring-orange-500"), 3000);
                        }
                      }}
                      className="flex items-center space-x-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-750 hover:border-orange-500/60 rounded-lg px-3 py-1 transition-all text-slate-200 cursor-pointer text-left shrink-0 group"
                      title="Click to focus client opportunity"
                    >
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        (sig.type || "").includes("ESG") || (sig.type || "").includes("SUSTAINABLE") 
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-700/50" 
                          : (sig.type || "").includes("FX") 
                          ? "bg-indigo-950 text-indigo-300 border border-indigo-700/50" 
                          : "bg-blue-950 text-blue-300 border border-blue-700/50"
                      }`}>
                        {sig.type}
                      </span>
                      
                      <span className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                        {sig.client_name || sig.client_id || "Client"}:
                      </span>

                      <span className="text-slate-300 font-normal max-w-xs md:max-w-md truncate">
                        {sig.headline || sig.text || sig.trigger}
                      </span>
                    </button>
                  ))
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="mb-6">
              <p className="text-[11px] font-extrabold text-emerald-700 tracking-wider uppercase mb-1">
                Today's Cohort Matches
              </p>
              <h1 className="text-3xl font-serif font-bold text-[#0C112B] mb-2">
                {opportunities.length} opportunities surfaced
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                Each match combines live market rates curves and internal corporate debt schedules from database into pre-drafted pitchbooks.
              </p>
            </div>

            <div className="space-y-6">
              {opportunities.length > 0 ? (
                opportunities.map((opp) => {
                  const isDebt = opp.is_debt;

                  return (
                    <div
                      key={opp.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-gray-300 hover:shadow-md transition duration-150"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isDebt
                              ? "bg-[#FFF0E6] text-[#FF6200]"
                              : "bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          {opp.type}
                        </span>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-medium">Match confidence</p>
                          <p className="text-xs font-bold text-amber-800">{opp.score}</p>
                        </div>
                      </div>

                      <h2 className="text-xl font-bold text-gray-900">{opp.name}</h2>
                      <p className="text-xs text-gray-500 italic mb-3">{opp.subtitle}</p>

                        {/* 4-SEGMENT 2X2 ENTERPRISE GRID (100% DB DRIVEN) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5 items-stretch">
                          
                          {/* SEGMENT 1: CLIENT DATA */}
                          <div className="bg-[#F8FAFC] border border-gray-200/90 rounded-lg p-3 flex flex-col justify-between shadow-2xs">
                            <div>
                              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-gray-200">
                                <span className="text-[10px] font-extrabold tracking-wider text-[#000066] uppercase">
                                  Segment 1: Client Data
                                </span>
                                <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">Static</span>
                              </div>
                              <div className="space-y-1.5 text-[11px]">
                                <div className="flex justify-between">
                                  <span className="text-gray-500 font-medium">Coverage RM:</span>
                                  <span className="font-semibold text-gray-900 truncate max-w-[140px]">{opp.rm_name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500 font-medium">Credit Rating:</span>
                                  <span className="font-semibold text-gray-900">{opp.tier}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500 font-medium">Net Debt:</span>
                                  <span className="font-semibold text-gray-900">{opp.net_debt_str}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500 font-medium">Available Liquidity:</span>
                                  <span className="font-semibold text-emerald-700">{opp.liquidity_str}</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-gray-100">
                                  <span className="text-gray-600 font-bold">24M Maturity Wall:</span>
                                  <span className="font-extrabold text-[#FF6200]">{opp.debt_maturing_24m_str}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SEGMENT 2: MARKET DATA */}
                          <div className="bg-[#F8FAFC] border border-gray-200/90 rounded-lg p-3 flex flex-col justify-between shadow-2xs">
                            <div>
                              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-gray-200">
                                <span className="text-[10px] font-extrabold tracking-wider text-[#000066] uppercase">
                                  Segment 2: Market Data
                                </span>
                                <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">Market DB</span>
                              </div>
                              <div className="space-y-1.5 text-[11px]">
                                <div className="flex justify-between">
                                  <span className="text-gray-500 font-medium">5Y EUR Swap:</span>
                                  <span className="font-bold text-[#000066]">{opp.eur_5y_swap || "2.62%"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500 font-medium">10Y German Bund:</span>
                                  <span className="font-semibold text-gray-900">{opp.eur_10y_bund || "2.61%"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500 font-medium">{opp.spread_label || "5Y Credit Spread"}:</span>
                                  <span className="font-bold text-emerald-700">{opp.client_spread_bps || "78 bps"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500 font-medium">All-In Benchmark Yield:</span>
                                  <span className="font-bold text-[#FF6200]">{opp.client_yield || "3.40%"}</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-gray-100">
                                  <span className="text-gray-600 font-bold">5Y USD Swap Benchmark:</span>
                                  <span className="font-semibold text-gray-900">{opp.usd_5y_swap || "3.92%"}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SEGMENT 3: CONTEXT FABRIC */}
                          <div className="bg-[#F8FAFC] border border-blue-200/90 rounded-lg p-3 flex flex-col justify-between shadow-2xs">
                            <div>
                              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-blue-100">
                                <span className="text-[10px] font-extrabold tracking-wider text-[#000066] uppercase flex items-center gap-1">
                                  <span>🧠</span> Segment 3: Context Fabric
                                </span>
                                <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.5 rounded border border-blue-200">Fabric AI</span>
                              </div>

                              {/* Dynamic Ingestion Badges */}
                              <div className="flex flex-wrap gap-1 mb-2">
                                {(opp.ingestion_channels || ["NEWS_RSS", "ANALYST_NOTE"]).map((ch, idx) => (
                                  <span key={idx} className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                                    {ch === "NEWS_RSS" ? "🌐 RSS" : (ch === "CLIENT_EMAIL" ? "✉️ Email" : (ch === "TEAMS_CHAT" ? "💬 Teams" : "📄 Notes"))}
                                  </span>
                                ))}
                              </div>

                              {/* Hoverable Context Fabric Signal */}
                              <div 
                                className="text-[10.5px] text-gray-700 leading-snug line-clamp-3 mb-2 bg-white p-2 rounded border border-gray-200 shadow-2xs cursor-help hover:border-blue-400 hover:shadow-xs transition-all"
                                title={opp.cf_description}
                              >
                                <span className="font-bold text-gray-900">Signal: </span>
                                {opp.cf_description}
                              </div>

                              {/* Hoverable Latent Opportunity */}
                              <div 
                                className="text-[10px] bg-blue-50/80 border border-blue-200/90 rounded p-1.5 text-blue-950 cursor-help hover:bg-blue-100/90 transition-all"
                                title={opp.cf_latent}
                              >
                                <div className="font-extrabold text-[9px] uppercase tracking-wider text-blue-800 flex items-center gap-1">
                                  <span>🎯</span> Latent Opportunity
                                </div>
                                <div className="font-semibold line-clamp-1 mt-0.5">
                                  {opp.cf_latent}
                                </div>
                              </div>
                            </div>

                            {/* Working Note Attribution */}
                            <div className="mt-2 pt-1.5 border-t border-gray-200 text-[9.5px] text-gray-500 truncate flex items-center justify-between">
                              <span className="truncate" title={opp.attribution_author}>
                                📋 {opp.attribution_author}
                              </span>
                            </div>
                          </div>

                          {/* SEGMENT 4: MANDATE & ACTION */}
                          <div className="bg-gradient-to-br from-orange-50/90 via-white to-orange-50/40 border border-orange-200/90 rounded-lg p-3 flex flex-col justify-between shadow-2xs">
                            <div>
                              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-orange-200/70">
                                <span className="text-[10px] font-extrabold tracking-wider text-[#FF6200] uppercase flex items-center gap-1">
                                  <span>⚡</span> Segment 4: Mandate
                                </span>
                                <span className="text-[9px] bg-[#FFF0E6] text-[#FF6200] font-extrabold px-1.5 py-0.5 rounded border border-orange-200">LLM Synthesis</span>
                              </div>

                              <div className="space-y-1.5 text-[10.5px]">
                                <div 
                                  className="cursor-help bg-white/60 p-1.5 rounded border border-orange-100 hover:border-orange-300 transition-colors"
                                  title={opp.why_now}
                                >
                                  <span className="font-bold text-orange-950 block text-[9.5px] uppercase tracking-wider">Catalyst Rationale:</span>
                                  <p className="text-gray-800 font-medium leading-snug line-clamp-2 mt-0.5">
                                    {opp.why_now}
                                  </p>
                                </div>

                                <div 
                                  className="pt-1.5 border-t border-orange-100/80 cursor-help bg-white/60 p-1.5 rounded border border-orange-100 hover:border-orange-300 transition-colors"
                                  title={opp.action}
                                >
                                  <span className="font-bold text-orange-950 block text-[9.5px] uppercase tracking-wider">Proposed Execution:</span>
                                  <p className="text-gray-900 font-semibold leading-snug line-clamp-2 mt-0.5">
                                    {opp.action}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-2 pt-1.5 border-t border-orange-100 text-[10px] text-orange-900 font-semibold flex items-center justify-between">
                              <span className="flex items-center gap-1"><span>⚡</span> Instant Pitch Ready</span>
                              <span className="text-gray-500 font-bold">10 Slides</span>
                            </div>
                          </div>

                        </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          <span className="font-semibold text-gray-700">Draft ready</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenIngestModal(opp)}
                            className="inline-flex items-center space-x-1.5 bg-[#FFF0E6] hover:bg-[#FFE0CC] text-[#FF6200] text-xs font-bold px-3 py-2 rounded-lg transition"
                            title="Ingest live RSS news, emails, or documents"
                          >
                            <Rss size={13} />
                            <span>Ingestion Engine</span>
                          </button>

                          <button
                            onClick={() => handleOpenPreview(opp)}
                            className="inline-flex items-center space-x-1.5 bg-[#0C112B] hover:bg-[#1A224D] text-white text-xs font-semibold px-4 py-2 rounded-lg transition duration-150"
                          >
                            <span>Open draft pitchbook</span>
                            <ArrowUpRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No opportunities found</h3>
                  <p className="text-sm text-gray-500">Ingest client signals to discover opportunities</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div>
              <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-3">
                This Week
              </p>
              {metrics ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-2xl font-bold text-gray-900">{metrics.active_drafts?.value || 0}</p>
                    <p className="text-[11px] font-semibold text-emerald-600 mb-1">{metrics.active_drafts?.change || "+12%"}</p>
                    <p className="text-xs text-gray-500 leading-tight">{metrics.active_drafts?.label || "Active drafts in progress"}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-2xl font-bold text-gray-900">{metrics.avg_time?.value || "3.2d"}</p>
                    <p className="text-[11px] font-semibold text-emerald-600 mb-1">{metrics.avg_time?.change || "-18%"}</p>
                    <p className="text-xs text-gray-500 leading-tight">{metrics.avg_time?.label || "Avg. time to first draft"}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-2xl font-bold text-gray-900">{metrics.pending_review?.value || 11}</p>
                    <p className="text-[11px] font-semibold text-gray-400 mb-1">{metrics.pending_review?.change || "steady"}</p>
                    <p className="text-xs text-gray-500 leading-tight">{metrics.pending_review?.label || "Deals pending review"}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-2xl font-bold text-gray-900">{metrics.cohort_matches?.value || 6}</p>
                    <p className="text-[11px] font-semibold text-emerald-600 mb-1">{metrics.cohort_matches?.change || "+2 this week"}</p>
                    <p className="text-xs text-gray-500 leading-tight">{metrics.cohort_matches?.label || "Cohort matches this month"}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading metrics...</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-3">
                Priority Today
              </p>
              {metrics?.priorities && metrics.priorities.length > 0 ? (
                <div className="space-y-3">
                  {metrics.priorities.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        // Find matching client or build complete opportunity object from priority record
                        let match = opportunities.find(o => 
                          o.name?.toLowerCase().includes(item.title?.toLowerCase()) || 
                          item.title?.toLowerCase().includes(o.name?.toLowerCase()) ||
                          o.id === item.client_id ||
                          o.id === item.id
                        );
                        if (!match) {
                          match = {
                            id: item.client_id || item.id || 'CLI101',
                            name: item.title || item.name,
                            sector: item.sector || 'Wholesale',
                            country: item.country || 'Europe',
                            rm_name: item.rm_name || 'Coverage Director',
                            net_debt: item.net_debt || 0,
                            liquidity: item.liquidity || 0,
                            debt_maturing_24m: item.debt_maturing_24m || 0,
                            score: item.score || 85,
                            type: item.opportunity_type || item.type || 'Risk Advisory',
                            callout: item.desc || item.why_now || 'High-priority exposure identified.',
                            chips: item.chips || ['Priority', `Score: ${item.score || 85}`]
                          };
                        }
                        handleOpenPreview(match);
                      }}
                      className="bg-white hover:bg-orange-50/40 transition-all border border-gray-200 hover:border-orange-300 rounded-xl p-4 shadow-sm cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1 text-orange-700 text-[10px] font-extrabold uppercase tracking-wider">
                          <ShieldAlert size={12} className="text-[#FF6200]" />
                          <span>{item.badge}</span>
                        </div>
                        {item.fee_estimate && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            Fee: {item.fee_estimate}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-[#0C112B] group-hover:text-[#FF6200] transition-colors mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>
                      {item.action && (
                        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                          <span className="text-gray-500 font-medium truncate max-w-[200px]">
                            <strong className="text-[#000066]">Action:</strong> {item.action}
                          </span>
                          <span className="text-[#FF6200] font-bold text-[10px] group-hover:translate-x-0.5 transition-transform">
                            Open Pitchbook →
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400">
                  <p className="text-sm">No priority items</p>
                </div>
              )}
            </div>
          </aside>
        </main>

        {/* Ingestion Gateway Modal */}
        {ingestModalOpen && ingestClient && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-[850px] w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
              <div className="h-14 border-b border-gray-200 px-6 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center space-x-2.5">
                  <span className="bg-[#FF6200] text-white font-extrabold px-2 py-0.5 rounded text-xs">INGEST</span>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Signal Ingestion Gateway — {ingestClient.name}
                  </h3>
                </div>
                <button
                  onClick={() => setIngestModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex border-b border-gray-200 bg-[#F8F9FA] px-6 text-xs font-semibold overflow-x-auto">
                <button
                  onClick={() => { setIngestTab("rss"); setIngestSuccessMsg(null); }}
                  className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 shrink-0 ${
                    ingestTab === "rss" ? "border-[#FF6200] text-[#FF6200]" : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Rss size={13} />
                  <span>Live News RSS</span>
                </button>
                <button
                  onClick={() => { setIngestTab("upload"); setIngestSuccessMsg(null); }}
                  className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 shrink-0 ${
                    ingestTab === "upload" ? "border-[#FF6200] text-[#FF6200]" : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <UploadCloud size={13} />
                  <span>Upload Houseviews (PDF / PPTX)</span>
                </button>
                <button
                  onClick={() => { setIngestTab("touchpoint"); setIngestSuccessMsg(null); }}
                  className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 shrink-0 ${
                    ingestTab === "touchpoint" || ingestTab === "preset" ? "border-[#FF6200] text-[#FF6200]" : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Mail size={13} />
                  <span>Treasury Email & Teams</span>
                </button>
                <button
                  onClick={() => { setIngestTab("context_fabric"); setIngestSuccessMsg(null); }}
                  className={`py-3 px-3.5 border-b-2 flex items-center space-x-1.5 shrink-0 ${
                    ingestTab === "context_fabric" ? "border-[#000066] text-[#000066] font-bold" : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <span className="text-sm">🧠</span>
                  <span>WorkFabric Context Memo</span>
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
                {ingestSuccessMsg && (
                  <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                    ingestSuccessMsg.startsWith("✅") 
                      ? "bg-emerald-50 border border-emerald-300 text-emerald-900" 
                      : "bg-red-50 border border-red-300 text-red-900"
                  }`}>
                    <CheckCircle2 size={16} className={`shrink-0 ${
                      ingestSuccessMsg.startsWith("✅") ? "text-emerald-600" : "text-red-600"
                    }`} />
                    <span className="font-semibold">{ingestSuccessMsg}</span>
                  </div>
                )}

                {/* RSS Tab */}
                {ingestTab === "rss" && (
                  <div className="space-y-3">
                    <p className="text-gray-600 font-medium">
                      Live market news fetched for <b>{ingestClient.name}</b>. Ingesting any article extracts triggers via LLM and recalculates opportunity rankings:
                    </p>
                    {rssLoading ? (
                      <div className="py-12 flex flex-col items-center justify-center space-y-2 text-gray-400">
                        <Loader2 size={20} className="animate-spin text-[#FF6200]" />
                        <span>Fetching live Google News RSS articles...</span>
                      </div>
                    ) : rssArticles.length > 0 ? (
                      <div className="space-y-2.5">
                        {rssArticles.map((art, idx) => (
                          <div key={idx} className="bg-[#F8F9FA] p-3 rounded-lg border border-gray-200 flex items-start justify-between space-x-4">
                            <div className="flex-1 min-w-0">
                              <a href={art.link} target="_blank" rel="noreferrer" className="font-bold text-gray-900 hover:text-[#FF6200] text-xs block truncate">
                                {art.title}
                              </a>
                              <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-2">{art.summary}</p>
                              <span className="text-[10px] text-gray-400 mt-1 block">{art.published}</span>
                            </div>
                            <button
                              onClick={() => handleIngestArticle(art)}
                              disabled={ingestingAction}
                              className="bg-[#000066] hover:bg-[#1A224D] text-white text-[11px] font-bold px-3 py-1.5 rounded-md shrink-0 transition disabled:opacity-50"
                            >
                              {ingestingAction ? <Loader2 size={12} className="animate-spin" /> : "Ingest & Re-evaluate"}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Rss className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>No RSS articles available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Tab */}
                {ingestTab === "upload" && (
                  <div className="space-y-4">
                    <p className="text-gray-600 font-medium">
                      Upload corporate presentation or financial report (.PDF or .PPTX) to extract debt maturity structures and covenants:
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100/50 transition">
                      <input
                        type="file"
                        accept=".pdf,.pptx,.txt"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#000066] file:text-white hover:file:bg-[#1A224D]"
                      />
                      {selectedFile && (
                        <p className="mt-2 text-xs font-bold text-gray-800">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleIngestFileUpload}
                      disabled={!selectedFile || ingestingAction}
                      className="w-full bg-[#FF6200] hover:bg-[#E55800] text-white font-bold py-2.5 rounded-lg shadow-sm transition disabled:opacity-40"
                    >
                      {ingestingAction ? "Extracting Embeddings & Signals..." : "Ingest Document & Re-evaluate"}
                    </button>
                  </div>
                )}

                {/* Treasury Email & Teams Tab */}
                {(ingestTab === "touchpoint" || ingestTab === "preset") && (
                  <div className="space-y-4">
                    <p className="text-gray-600 font-medium">
                      Simulate direct inbound client communications or internal desk transcripts:
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCustomTextContent("TREASURY EMAIL:\nFrom: CFO Treasury <treasury@" + (ingestClient.name.toLowerCase().includes("enel") ? "enel.com" : "basf.com") + ">\nTo: Wholesale Coverage Director\nSubject: 2026/2027 Rollover & Pre-Hedging Request\n\nWe are reviewing upcoming debt maturities. Given 5Y EUR swap easing, we want to evaluate an indicative €800M benchmark issuance combined with an ISDA pre-hedge overlay.")}
                        className="flex-1 p-2.5 rounded-lg border border-gray-200 bg-[#F8F9FA] hover:border-[#FF6200] text-left transition shadow-2xs"
                      >
                        <div className="flex items-center space-x-1.5 font-bold text-gray-900 mb-0.5">
                          <Mail size={13} className="text-[#FF6200]" />
                          <span>Treasury Email Preset</span>
                        </div>
                        <p className="text-[10px] text-gray-500">Incoming CFO email requesting €800M benchmark quote</p>
                      </button>

                      <button
                        onClick={() => setCustomTextContent("MS TEAMS TRANSCRIPT:\n[10:14] Giulia Romano (RM): Treasury flagged debt maturity step-up approaching.\n[10:15] Luca Moretti (DCM): Recommend pre-hedging the curve now while credit spreads remain tight.\n[10:16] Rates Desk: Structuring 6Y EMTN benchmark + pre-hedge overlay.")}
                        className="flex-1 p-2.5 rounded-lg border border-gray-200 bg-[#F8F9FA] hover:border-[#000066] text-left transition shadow-2xs"
                      >
                        <div className="flex items-center space-x-1.5 font-bold text-gray-900 mb-0.5">
                          <MessageSquare size={13} className="text-[#000066]" />
                          <span>MS Teams Transcript</span>
                        </div>
                        <p className="text-[10px] text-gray-500">Internal syndicate and coverage working group chat</p>
                      </button>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1.5 text-xs">Editable Touchpoint Content:</label>
                      <textarea
                        value={customTextContent}
                        onChange={(e) => setCustomTextContent(e.target.value)}
                        placeholder="Paste meeting notes, email transcript, or raw text..."
                        rows={5}
                        className="w-full p-3 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#FF6200] focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={() => handleIngestCustomText("CLIENT_EMAIL", "Client Inbound Touchpoint")}
                      disabled={!customTextContent.trim() || ingestingAction}
                      className="w-full bg-[#000066] hover:bg-[#1A224D] text-white font-bold py-2.5 rounded-lg shadow-sm transition disabled:opacity-40"
                    >
                      {ingestingAction ? "Ingesting & Recalibrating Digital Twin..." : "Ingest Touchpoint & Update Signals"}
                    </button>
                  </div>
                )}

                {/* WorkFabric Context Memo Tab (Dedicated 4th Channel) */}
                {ingestTab === "context_fabric" && (
                  <div className="space-y-4">
                    {/* Header Banner */}
                    <div className="bg-[#000066]/5 border border-[#000066]/20 rounded-xl p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">🧠</span>
                          <span className="font-extrabold text-[#000066] text-xs uppercase tracking-wider">
                            WorkFabric Context Engine — Systems of Work
                          </span>
                        </div>
                        <span className="text-[10px] bg-[#000066] text-white font-bold px-2 py-0.5 rounded shadow-2xs">
                          Tacit Desk Intelligence
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-700 mt-1 leading-relaxed font-medium">
                        Captures unannounced corporate catalysts, pre-deal memos, and multi-product structuring opportunities across wholesale banking desks.
                      </p>
                    </div>

                    {/* 4 Multi-Product Family Selectors */}
                    <div>
                      <label className="block text-gray-700 font-bold mb-1.5 text-[11px] uppercase tracking-wider">
                        Select Product Family Preset:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {/* 1. DCM Refinancing */}
                        <button
                          type="button"
                          onClick={() => setCustomTextContent(
                            "WORKFABRIC CONTEXT MEMO [DCM & REFINANCING]:\n" +
                            "Client: " + ingestClient.name + "\n" +
                            "Author: Luca Moretti (DCM Origination Desk)\n" +
                            "Desk Signal: Executive Committee approved debt rollover plan. Public materials show recent capital markets access, but capex should not be equated with funding gap. Residual 2026-2027 debt maturities remain sizable.\n" +
                            "Latent Opportunity: Structure a €1.5B 7Y Senior EMTN benchmark issuance to term out short-term bank facilities and capture favorable credit spread tightening."
                          )}
                          className="p-2.5 rounded-lg border border-gray-200 bg-[#F8F9FA] hover:border-[#FF6200] hover:bg-orange-50/30 text-left transition group shadow-2xs"
                        >
                          <div className="font-bold text-[#000066] text-xs group-hover:text-[#FF6200] flex items-center gap-1 mb-0.5">
                            <span>🏛️</span> DCM
                          </div>
                          <p className="text-[9.5px] text-gray-500 line-clamp-2">CapEx & debt rollover sequencing</p>
                        </button>

                        {/* 2. Rates & Pre-Hedging */}
                        <button
                          type="button"
                          onClick={() => setCustomTextContent(
                            "WORKFABRIC CONTEXT MEMO [INTEREST RATE HEDGING]:\n" +
                            "Client: " + ingestClient.name + "\n" +
                            "Author: Roman Weiss (Rates Structuring Specialist)\n" +
                            "Desk Signal: Treasury risk committee authorized fixed-rate pre-hedging ahead of upcoming central bank rate decisions. Floating-rate liability ratio currently exceeds policy ceiling by 18%.\n" +
                            "Latent Opportunity: Execute €800M 5Y to 7Y Fixed-to-Floating Pre-Hedge Interest Rate Swap (IRS) overlay at 2.58% to lock in swap curve discount."
                          )}
                          className="p-2.5 rounded-lg border border-gray-200 bg-[#F8F9FA] hover:border-[#000066] hover:bg-blue-50/40 text-left transition group shadow-2xs"
                        >
                          <div className="font-bold text-[#000066] text-xs group-hover:text-blue-800 flex items-center gap-1 mb-0.5">
                            <span>📈</span> Rates Pre-Hedge
                          </div>
                          <p className="text-[9.5px] text-gray-500 line-clamp-2">ISDA swap pre-hedge ahead of ECB rate cycle</p>
                        </button>

                        {/* 3. Green / ESG Financing */}
                        <button
                          type="button"
                          onClick={() => setCustomTextContent(
                            "WORKFABRIC CONTEXT MEMO [GREEN & SUSTAINABLE FINANCE]:\n" +
                            "Client: " + ingestClient.name + "\n" +
                            "Author: Elena Rossi (Sustainable Finance Advisory)\n" +
                            "Desk Signal: Treasury confirmed €1.2B green transition CapEx pipeline (EU Taxonomy aligned) ready for debt allocation. Strong institutional ESG investor demand detected in Nordic and Benelux books.\n" +
                            "Latent Opportunity: Structure a €600M 8Y Green Senior EMTN tranche with 12 bps 'greenium' pricing benefit and ESG KPI framework verification."
                          )}
                          className="p-2.5 rounded-lg border border-gray-200 bg-[#F8F9FA] hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition group shadow-2xs"
                        >
                          <div className="font-bold text-emerald-800 text-xs flex items-center gap-1 mb-0.5">
                            <span>🌿</span> Green / ESG
                          </div>
                          <p className="text-[9.5px] text-gray-500 line-clamp-2">EU taxonomy CapEx & greenium bond tranche</p>
                        </button>

                        {/* 4. FX & Cross-Currency */}
                        <button
                          type="button"
                          onClick={() => setCustomTextContent(
                            "WORKFABRIC CONTEXT MEMO [FX RISK MANAGEMENT]:\n" +
                            "Client: " + ingestClient.name + "\n" +
                            "Author: Markus Becker (FX & Cross-Currency Structuring)\n" +
                            "Desk Signal: Corporate Treasury flagged substantial unhedged USD revenue receivables from North American operations against EUR debt servicing obligations for FY2026/27.\n" +
                            "Latent Opportunity: Propose a €450M 3Y USD/EUR Cross-Currency Swap (XCS) corridor with structured forward collar to insulate operating cash flows from FX volatility."
                          )}
                          className="p-2.5 rounded-lg border border-gray-200 bg-[#F8F9FA] hover:border-purple-600 hover:bg-purple-50/40 text-left transition group shadow-2xs"
                        >
                          <div className="font-bold text-purple-800 text-xs flex items-center gap-1 mb-0.5">
                            <span>💱</span> FX & Cross-Ccy
                          </div>
                          <p className="text-[9.5px] text-gray-500 line-clamp-2">USD/EUR Cross-Currency Swap overlay</p>
                        </button>
                      </div>
                    </div>

                    {/* Editable Structured Content */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-gray-700 font-bold text-xs">
                          WorkFabric Context Content (Editable):
                        </label>
                        <span className="text-[10px] text-gray-400">Writes to ca.document_vector_chunks & ca.digital_twin_signals</span>
                      </div>
                      <textarea
                        value={customTextContent}
                        onChange={(e) => setCustomTextContent(e.target.value)}
                        placeholder="Click a preset above or type custom tacit desk intelligence, origination memo, or cross-product structuring notes..."
                        rows={6}
                        className="w-full p-3 border border-blue-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#000066] focus:border-transparent bg-[#FAFCFF] leading-relaxed"
                      />
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => handleIngestCustomText("CONTEXT_FABRIC", "WorkFabric Context Engine")}
                      disabled={!customTextContent.trim() || ingestingAction}
                      className="w-full bg-[#000066] hover:bg-[#1A224D] text-white font-bold py-2.5 rounded-lg shadow-sm transition disabled:opacity-40 flex items-center justify-center space-x-2"
                    >
                      {ingestingAction ? (
                        <span>Recalibrating Digital Twin & Opportunity Scoring...</span>
                      ) : (
                        <>
                          <span>🧠 Ingest to WorkFabric & Recalibrate Digital Twin</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pitchbook Interactive Slide Deck & Copilot Modal */}
        {previewOpen && activeClient && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
            <div className="bg-[#0C112B] border border-gray-800 rounded-2xl w-full max-w-[1420px] h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
              
              {/* Header Bar */}
              <div className="h-14 border-b border-gray-800 px-6 flex items-center justify-between shrink-0 bg-[#0C112B]">
                <div className="flex items-center space-x-3">
                  <span className="bg-[#FF6200] text-white font-extrabold px-2 py-0.5 rounded text-xs tracking-wider">PITCHBOOK PREVIEW</span>
                  <h3 className="font-bold text-white text-sm truncate">
                    {activeClient.name || activeClient.client_name || "Corporate Client"} — Instant Deal Deck (10 Slides)
                  </h3>
                  <span className="text-xs text-gray-400 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded">
                    Slide {currentSlideIndex + 1} of 10
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAuditCompliance()}
                    disabled={complianceAuditing}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#000066] hover:bg-[#1A224D] border border-blue-600/50 text-blue-200 transition"
                  >
                    <span>🛡️</span>
                    <span>{complianceAuditing ? "Auditing MiFID II / FINRA..." : "Run Compliance Audit"}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadDeck(activeClient.client_id || activeClient.id || "CLI101")}
                    disabled={loadingClient}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF6200] hover:bg-[#E55800] text-white transition shadow-sm"
                  >
                    <span>📥</span>
                    <span>{loadingClient ? "Exporting PPTX..." : "Export PPTX"}</span>
                  </button>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Main Split Body: Slide Canvas (Left) + Copilot Sidebar (Right) */}
              <div className="flex-1 flex overflow-hidden">
                
                {/* Left Area: Slide View & Bottom Thumbnails */}
                <div className="flex-1 flex flex-col p-4 bg-gray-950 overflow-y-auto">
                  {/* Slide Container */}
                  <div className="flex-1 flex items-center justify-center min-h-[460px]">
                    <div className="w-full max-w-[940px] aspect-[16/9] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-800 text-gray-900 flex flex-col">
                      {getSlideContent(currentSlideIndex, activeClient)}
                    </div>
                  </div>

                  {/* Bottom Navigation & 10 Slide Buttons */}
                  <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentSlideIndex === 0}
                        className="px-3 py-1 text-xs font-bold rounded bg-gray-900 hover:bg-gray-800 border border-gray-800 disabled:opacity-30"
                      >
                        ◀ Prev
                      </button>
                      <button
                        onClick={() => setCurrentSlideIndex((prev) => Math.min(9, prev + 1))}
                        disabled={currentSlideIndex === 9}
                        className="px-3 py-1 text-xs font-bold rounded bg-gray-900 hover:bg-gray-800 border border-gray-800 disabled:opacity-30"
                      >
                        Next ▶
                      </button>
                    </div>

                    {/* 10-Slide List */}
                    <div className="flex space-x-1.5 overflow-x-auto pb-1">
                      {[
                        "1. Summary",
                        "2. Profile",
                        "3. Maturities",
                        "4. Macro/Rates",
                        "5. Mandate",
                        "6. Scenario",
                        "7. Pricing",
                        "8. ESG / Desk",
                        "9. Timeline",
                        "10. ING Team"
                      ].map((title, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition border ${
                            currentSlideIndex === idx
                              ? "bg-[#FF6200] text-white border-[#FF6200]"
                              : "bg-gray-900 text-gray-400 hover:text-gray-200 border-gray-800 hover:border-gray-700"
                          }`}
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Area: Origination Copilot Sidebar */}
                <div className="w-[410px] border-l border-gray-800 bg-[#0E1535] flex flex-col shrink-0">
                  <div className="h-12 border-b border-gray-800 px-4 flex items-center justify-between bg-[#0C112B]">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">🤖</span>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-white">Origination Copilot</span>
                    </div>
                    <span className="text-[10px] bg-blue-950 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-900">
                      Gemini Pro · Vertex AI
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                    {chatMessages.length === 0 ? (
                      <div className="text-gray-400 space-y-3">
                        <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800">
                          <p className="font-bold text-white mb-1">👋 Welcome to Origination Copilot</p>
                          <p className="text-[11px] leading-relaxed">
                            Interact directly with the pitchbook parameters, audit regulatory compliance, or calibrate rate sensitivity:
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Quick Actions</p>
                          <button
                            onClick={() => handleAuditCompliance()}
                            className="w-full text-left p-2 rounded bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-[11px] text-blue-300 transition"
                          >
                            🛡️ Run FINRA Rule 2210 & MiFID II Audit
                          </button>
                          <button
                            onClick={() => handleSendMessage("Update Slide 7 with 5Y Swap 2.62% and spread 115 bps")}
                            className="w-full text-left p-2 rounded bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-[11px] text-orange-300 transition"
                          >
                            📊 Recalibrate Slide 7 with latest Swap Rates
                          </button>
                          <button
                            onClick={() => handleSendMessage("Apply compliance recommendations and certify full deck")}
                            className="w-full text-left p-2 rounded bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-[11px] text-emerald-300 transition"
                          >
                            ✅ Auto-apply mandatory MiFID II disclosures
                          </button>
                        </div>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg text-xs leading-relaxed ${
                            msg.role === "user"
                              ? "bg-[#FF6200]/20 border border-[#FF6200]/40 text-orange-100 ml-4"
                              : "bg-gray-900 border border-gray-800 text-gray-200 mr-2"
                          }`}
                        >
                          <div className="font-bold text-[10px] uppercase text-gray-400 mb-1">
                            {msg.role === "user" ? "You" : "Origination Copilot"}
                          </div>
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                      ))
                    )}
                    {copilotLoading && (
                      <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 text-gray-400 text-xs flex items-center space-x-2">
                        <span className="animate-spin text-sm">⏳</span>
                        <span>Reasoning over market curves & regulatory rules...</span>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 border-t border-gray-800 bg-[#0C112B]">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (inputQuery?.trim()) {
                          handleSendMessage(inputQuery);
                          setInputQuery("");
                        }
                      }}
                      className="flex space-x-2"
                    >
                      <input
                        type="text"
                        value={inputQuery || ""}
                        onChange={(e) => setInputQuery(e.target.value)}
                        placeholder="Instruct Copilot (e.g. adjust bond size, run audit)..."
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6200]"
                      />
                      <button
                        type="submit"
                        disabled={copilotLoading || !inputQuery?.trim()}
                        className="bg-[#FF6200] hover:bg-[#E55800] text-white px-3 py-2 rounded-lg text-xs font-bold transition disabled:opacity-40"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </ErrorBoundary>
  );
}
