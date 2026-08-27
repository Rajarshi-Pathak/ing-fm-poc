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
    rate_scenario_lock: "3.60% (locked)",
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
      market_date: `Market Snapshot as of ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}, `
    }));
    
    setPreviewOpen(true);
    
    setChatMessages([
      {
        sender: "bot",
        text: `Hello! I am your Origination Copilot for **${opp.name}**.\n\nYou can ask questions, run regulatory audits, or instruct me to adjust parameters:\n• **"Run FINRA & MiFID II compliance check"**\n• **"In Slide 5, update iTraxx Main to 60 bps"**\n• **"In Slide 6, change rate to 4.50% instead of 4.55%"**\n• **"Adjust bond sizing to €800M and tenor to 10Y"**`,
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
                        <p>• <strong>2026 Maturities:</strong> €600M (Commodity & Fixed Notes)</p>
                        <p>• <strong>2027 Maturities:</strong> €3,000M (IRS Pre-Hedge Refinancing)</p>
                        <p>• <strong>2028 Maturities:</strong> €5,497M (Syndicated Term Loan)</p>
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

      case 5: // SLIDE 6: SENSITIVITY
        return (
          <div className="h-full flex flex-col justify-between bg-white p-5 rounded-lg border border-gray-200">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[9px] font-mono text-[#FF6200] uppercase font-bold tracking-wider">SENSITIVITY ANALYSIS</span>
                  <h2 className="text-base font-bold text-[#000066] mt-0.5">
                    {isFX ? "FX Scenario Analysis & Layered Collar Payoff" :
                     isGreen ? "Greenium vs Plain-Vanilla Cost Sensitivity" :
                     isRates ? "Rate Shift Sensitivity & Pre-Hedge Lock Analysis" : "Refinancing Scenario & Spread Sensitivity"}
                  </h2>
                </div>
                <img src="/assets/ing_logo_orange.png" alt="ING" className="h-6 object-contain" />
              </div>
              <div className="border border-gray-200 rounded overflow-hidden text-[10px]">
                <table className="w-full text-left">
                  <thead className="bg-[#000066] text-white">
                    <tr>
                      <th className="p-2">{isFX ? "Market Scenario" : isGreen ? "Issuance Format" : "Rate Scenario"}</th>
                      <th className="p-2">{isFX ? "Layered Collar Strategy" : isGreen ? "Indicative Yield / Spread" : "Refinance Today (Locked)"}</th>
                      <th className="p-2">{isFX ? "Unhedged Exposure" : isGreen ? "Annual Interest Savings" : "Wait 6 Months (Unhedged)"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {isFX ? (
                      <>
                        <tr className="bg-orange-50/40">
                          <td className="p-2 font-medium">EUR/USD +5% (USD Weakens)</td>
                          <td className="p-2 text-emerald-700 font-bold">Guaranteed Floor (1.0850)</td>
                          <td className="p-2 text-rose-600 font-bold">-$450M Revenue Impact</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="p-2 font-medium">Spot Unchanged (1.0650)</td>
                          <td className="p-2 font-bold">1.0650 Forward Rate</td>
                          <td className="p-2">1.0650 Spot Level</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">EUR/USD -5% (USD Strengthens)</td>
                          <td className="p-2 font-bold">Participate up to 1.0450</td>
                          <td className="p-2 text-emerald-700 font-bold">+$380M FX Gain</td>
                        </tr>
                      </>
                    ) : isGreen ? (
                      <>
                        <tr className="bg-emerald-50/40">
                          <td className="p-2 font-medium">Inaugural Green Bond (with Greenium)</td>
                          <td className="p-2 text-emerald-700 font-bold">Mid-Swap + 77 bps (-5 bps)</td>
                          <td className="p-2 text-emerald-700 font-bold">€375,000 / year savings</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="p-2 font-medium">Sustainability-Linked Bond (SLB)</td>
                          <td className="p-2 font-bold">Mid-Swap + 80 bps (-2 bps)</td>
                          <td className="p-2 font-bold">€150,000 / year savings</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">Plain-Vanilla Senior EMTN</td>
                          <td className="p-2">Mid-Swap + 82 bps (Flat)</td>
                          <td className="p-2 text-gray-500">Benchmark Baseline</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr className="bg-orange-50/40">
                          <td className="p-2 font-medium">Rates +100 bps</td>
                          <td className="p-2 text-emerald-700 font-bold">3.60% (locked)</td>
                          <td className="p-2 text-rose-600 font-bold">4.50% (+90 bps cost)</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="p-2 font-medium">Rates Unchanged</td>
                          <td className="p-2 font-bold">3.60% (locked)</td>
                          <td className="p-2">3.60% (locked)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">Rates −50 bps</td>
                          <td className="p-2 font-bold">3.60% (locked)</td>
                          <td className="p-2 text-emerald-700 font-bold">3.15%</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="text-center text-[9px] text-gray-400 border-t border-gray-100 pt-1.5">ING Wholesale Banking • Strictly Confidential</div>
          </div>
        );

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

      case 7: // SLIDE 8: TERM SHEET
        return (
          <div className="h-full flex flex-col justify-between bg-white p-5 rounded-lg border border-gray-200">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[9px] font-mono text-[#FF6200] uppercase font-bold tracking-wider">TRANSACTION STRUCTURING</span>
                  <h2 className="text-base font-bold text-[#000066] mt-0.5">
                    {isFX ? "Indicative FX Risk Management Term Sheet" :
                     isGreen ? "Indicative Green / Sustainability-Linked Term Sheet" :
                     isRates ? "Indicative Pre-Hedge Swap & EMTN Term Sheet" : "Indicative Debt Financing Term Sheet"}
                  </h2>
                </div>
                <img src="/assets/ing_logo_orange.png" alt="ING" className="h-6 object-contain" />
              </div>
              <div className="border border-gray-200 rounded overflow-hidden text-[10px]">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-gray-50"><td className="p-1.5 font-bold w-1/3">Issuer / Counterparty</td><td className="p-1.5">{clientName}</td></tr>
                    <tr><td className="p-1.5 font-bold">Instrument Format</td><td className="p-1.5">{isFX ? "Layered FX Forwards & Participating Collars" : isGreen ? "Senior Unsecured Green EMTN (ICMA Aligned)" : isRates ? "Forward-Starting IRS Overlay & Senior EMTN" : "Senior Unsecured Euro Medium Term Note (EMTN)"}</td></tr>
                    <tr className="bg-gray-50"><td className="p-1.5 font-bold">Notional Sizing</td><td className="p-1.5">{deckOverrides.notional_bond || (isFX ? "$1.5B - $3.0B Staged Programme" : isGreen ? "EUR 750,000,000" : "EUR 600,000,000")}</td></tr>
                    <tr><td className="p-1.5 font-bold">Tenor / Maturity</td><td className="p-1.5">{deckOverrides.tenor || (isFX ? "12 Months (Quarterly Tranches)" : isGreen ? "8 Years (Green Benchmark)" : "7 Years (Euro Benchmark)")}</td></tr>
                    <tr className="bg-gray-50"><td className="p-1.5 font-bold">Indicative Pricing</td><td className="p-1.5 font-bold text-orange-700">{deckOverrides.spread || (isFX ? "Zero Net Upfront Premium (Floor: 1.0850 / Cap: 1.0450)" : isGreen ? "Mid-Swap + 77 bps (Greenium: -5 bps)" : "Mid-Swap + 82 bps")}</td></tr>
                    <tr><td className="p-1.5 font-bold">Sole Structurer / Counterparty</td><td className="p-1.5 font-bold text-[#000066]">ING Bank N.V.</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[9px] text-gray-500 italic mt-1.5">{deckOverrides.spread_disclaimer}</p>
            </div>
            <div className="text-center text-[9px] text-gray-400 border-t border-gray-100 pt-1.5">ING Wholesale Banking • Strictly Confidential</div>
          </div>
        );

      case 8: // SLIDE 9: ROADMAP
        return (
          <div className="h-full flex flex-col justify-between bg-white p-5 rounded-lg border border-gray-200">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[9px] font-mono text-[#FF6200] uppercase font-bold tracking-wider">EXECUTION ROADMAP</span>
                  <h2 className="text-base font-bold text-[#000066] mt-0.5">
                    {isFX ? "Layered Roll Framework & Desk Execution" :
                     isGreen ? "Second-Party Opinion (SPO) & Syndicate Timeline" :
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
                  "T - 6 Weeks: Framework & SPO: Finalize Green Bond framework & Sustainalytics SPO",
                  "T - 3 Weeks: Investor Marketing: Dedicated ESG roadshow across European funds",
                  "T - 1 Week: Bookbuilding: Launch orderbook with greenium pricing tension",
                  "T-Day: Settlement & Allocation: Final settlement & annual impact reporting"
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
        <section className="bg-[#EEF2F6] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center space-x-8 text-xs overflow-x-auto whitespace-nowrap">
            <span className="font-extrabold text-gray-500 tracking-wider">
              LIVE SIGNAL FEED
            </span>
            {signals.length > 0 ? (
              signals.map((sig, idx) => (
                <div key={idx} className="flex items-center space-x-1.5 text-gray-700 font-medium">
                  <span className="font-bold text-[#000066]">{sig.type}</span>
                  <span>{sig.text}</span>
                  {sig.trend === "up" && <span className="text-emerald-600 font-bold">▲</span>}
                  {sig.trend === "down" && <span className="text-rose-600 font-bold">▼</span>}
                  {sig.trend === "neutral" && <span className="text-amber-600">◆</span>}
                </div>
              ))
            ) : (
              <span className="text-gray-400">No live signals at this time</span>
            )}
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

                        {/* 3-SEGMENT ENTERPRISE STRUCTURE */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 mb-4">
                          
                          {/* BOX 1: INTERNAL CLIENT SIGNALS */}
                          <div className="bg-[#F8FAFC] border border-gray-200/90 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
                            <div>
                              <div className="flex items-center justify-between pb-1.5 mb-2.5 border-b border-gray-200">
                                <span className="text-[10px] font-extrabold tracking-wider text-[#000066] uppercase">
                                  1. Internal Client Signals
                                </span>
                                <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-200/60">DB & RM Notes</span>
                              </div>
                              <div className="space-y-1.5 text-[11px]">
                                <div className="flex justify-between">
                                  <span className="text-gray-500 font-medium">Coverage RM:</span>
                                  <span className="font-semibold text-gray-900 truncate max-w-[120px]">{opp.rm_name || "Klaus Weber"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500 font-medium">Credit Rating:</span>
                                  <span className="font-semibold text-gray-900">{opp.tier || "Tier 1 (BBB+)"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500 font-medium">Net Debt:</span>
                                  <span className="font-semibold text-gray-900">{opp.net_debt_str || (opp.net_debt ? `€${Number(opp.net_debt).toLocaleString()}M` : "€16,200M")}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500 font-medium">Available Liquidity:</span>
                                  <span className="font-semibold text-emerald-700">{opp.liquidity_str || (opp.liquidity ? `€${Number(opp.liquidity).toLocaleString()}M` : "€7,800M")}</span>
                                </div>
                                <div className="flex justify-between pt-1.5 border-t border-gray-200/60">
                                  <span className="text-gray-700 font-bold">24M Maturity Wall:</span>
                                  <span className="font-extrabold text-[#FF6200]">{opp.debt_maturing_24m_str || "€3,000M"}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* BOX 2: MACRO & MARKET SIGNALS */}
                          <div className="bg-[#F8FAFC] border border-gray-200/90 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
                            <div>
                              <div className="flex items-center justify-between pb-1.5 mb-2.5 border-b border-gray-200">
                                <span className="text-[10px] font-extrabold tracking-wider text-[#000066] uppercase">
                                  2. Macro & Market Signals
                                </span>
                                <span className="text-[9px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md border border-purple-200/60">Live Fixings & Views</span>
                              </div>
                              <div className="space-y-1.5 text-[11px]">
                                {opp.id === "CLI102" || (opp.type && opp.type.includes("FX")) ? (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-medium">EUR/USD Spot:</span>
                                      <span className="font-bold text-[#000066]">1.0650</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-medium">1Y Forward Points:</span>
                                      <span className="font-semibold text-gray-900">+185 pts</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-medium">USD FX Exposure:</span>
                                      <span className="font-semibold text-amber-700">&gt;$12.0B (Unhedged)</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-medium">ECB / Fed Policy:</span>
                                      <span className="font-semibold text-gray-900">2.25% / 4.25%</span>
                                    </div>
                                  </>
                                ) : opp.id === "CLI101" || (opp.type && opp.type.includes("GREEN")) ? (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-medium">5Y EUR Swap:</span>
                                      <span className="font-bold text-[#000066]">2.62% (+4 bps)</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-medium">10Y German Bund:</span>
                                      <span className="font-semibold text-gray-900">2.61%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-medium">EUR Green Spread:</span>
                                      <span className="font-bold text-[#FF6200]">77 bps (-5 bps Greenium)</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-medium">iTraxx Europe Main:</span>
                                      <span className="font-semibold text-emerald-700">58 bps (Tightening)</span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-medium">5Y EUR Swap:</span>
                                      <span className="font-bold text-[#000066]">2.62% (+4 bps)</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-medium">10Y German Bund:</span>
                                      <span className="font-semibold text-gray-900">2.61%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-medium">iTraxx Europe Main:</span>
                                      <span className="font-semibold text-emerald-700">58 bps (Tightening)</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-medium">ECB Refi / Fed:</span>
                                      <span className="font-semibold text-gray-900">2.25% / 4.25%</span>
                                    </div>
                                  </>
                                )}
                                <div className="flex justify-between pt-1.5 border-t border-gray-200/60">
                                  <span className="text-gray-700 font-bold">Catalog Fit:</span>
                                  <span className="font-bold text-[#000066]">{opp.is_debt ? "DCM Benchmark" : "Treasury Derivatives"}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* BOX 3: ORIGINATION OPPORTUNITY */}
                          <div className="bg-gradient-to-br from-[#FFF8F3] via-white to-[#FFF3EB] border border-orange-200/90 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
                            <div>
                              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-orange-200/60">
                                <span className="text-[10px] font-extrabold tracking-wider text-[#FF6200] uppercase">
                                  3. Origination Opportunity
                                </span>
                                <span className="text-[9px] bg-[#FF6200] text-white font-bold px-2 py-0.5 rounded-md shadow-xs">
                                  Catalog Match
                                </span>
                              </div>
                              <div className="text-[11px] text-gray-800 leading-relaxed space-y-1.5">
                                {opp.id === "CLI103" || opp.id === "CLI010" || (opp.name && opp.name.includes("BASF")) ? (
                                  <>
                                    <p><b className="text-gray-900">Catalyst:</b> €3,000M debt rolling off over 24M into higher benchmark swap yields.</p>
                                    <p><b className="text-[#FF6200]">Deal Action:</b> €1.5B Dual-Tranche (5Y/10Y) Senior EMTN refinancing with immediate Forward Pre-Hedge Swap lock.</p>
                                  </>
                                ) : opp.id === "CLI101" || (opp.name && opp.name.includes("Enel")) ? (
                                  <>
                                    <p><b className="text-gray-900">Catalyst:</b> €10,127M maturity wall & €4.0B renewable capex authorization.</p>
                                    <p><b className="text-[#FF6200]">Deal Action:</b> €600M 8Y Inaugural Green EMTN (ICMA aligned) capturing -5 bps Greenium concession.</p>
                                  </>
                                ) : opp.id === "CLI102" || (opp.name && opp.name.includes("ASML")) ? (
                                  <>
                                    <p><b className="text-gray-900">Catalyst:</b> &gt;$12.0B unhedged USD cash flows exposed to EUR/USD spot swings.</p>
                                    <p><b className="text-[#FF6200]">Deal Action:</b> €1.2B 12M Layered Zero-Cost FX Collar with 10% upside participation.</p>
                                  </>
                                ) : (
                                  <p>{opp.callout || "Strategic catalyst detected across debt filings and swap curves. Recommended combined benchmark origination sequence."}</p>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-orange-100 flex items-center justify-between text-[10px]">
                              <span className="text-gray-500 font-semibold">Lineage: <span className="text-gray-700 font-normal">RSS • Teams • Context Fabric</span></span>
                              <span className="text-[#FF6200] font-bold">10-Slide Pitch Ready</span>
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
                            <span>Ingest News / Docs</span>
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

              <div className="flex border-b border-gray-200 bg-[#F8F9FA] px-6 text-xs font-semibold">
                <button
                  onClick={() => { setIngestTab("rss"); setIngestSuccessMsg(null); }}
                  className={`py-3 px-4 border-b-2 flex items-center space-x-1.5 ${
                    ingestTab === "rss" ? "border-[#FF6200] text-[#FF6200]" : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Rss size={13} />
                  <span>Live Google News RSS</span>
                </button>
                <button
                  onClick={() => { setIngestTab("upload"); setIngestSuccessMsg(null); }}
                  className={`py-3 px-4 border-b-2 flex items-center space-x-1.5 ${
                    ingestTab === "upload" ? "border-[#FF6200] text-[#FF6200]" : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <UploadCloud size={13} />
                  <span>House Views (Upload PDF / PPTX)</span>
                </button>
                <button
                  onClick={() => { setIngestTab("preset"); setIngestSuccessMsg(null); }}
                  className={`py-3 px-4 border-b-2 flex items-center space-x-1.5 ${
                    ingestTab === "preset" ? "border-[#FF6200] text-[#FF6200]" : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <FileText size={13} />
                  <span>Treasury Email / Teams / Context Fabric</span>
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

                {/* Presets Tab */}
                {ingestTab === "preset" && (
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCustomTextContent("TREASURY EMAIL:\nFrom: CFO Treasury <treasury@enel.com>\nTo: Sarah Bover <sarah.bover@ing.com>\nSubject: 2026/2027 Rollover & IRS Pre-Hedging Window\n\nHi Sarah,\nWe are reviewing our €3.0B 2026 maturity tranches. Given current 5Y EUR swap easing at 2.62%, we are keen to explore an indicative €800M 10Y Senior EMTN benchmark issuance combined with an ISDA pre-hedge swap overlay.")}
                        className="flex-1 p-2.5 rounded-lg border border-gray-200 bg-[#F8F9FA] hover:border-[#FF6200] text-left transition"
                      >
                        <div className="flex items-center space-x-1.5 font-bold text-gray-900 mb-0.5">
                          <Mail size={13} className="text-[#FF6200]" />
                          <span>Treasury Email Preset</span>
                        </div>
                        <p className="text-[10px] text-gray-500">Simulate incoming CFO email requesting €800M 10Y benchmark</p>
                      </button>

                      <button
                        onClick={() => setCustomTextContent("MS TEAMS TRANSCRIPT:\n[10:14] Giulia Romano: Enel Treasury flagged €2.5B hybrid maturity step-up approaching in Q4 2026.\n[10:15] Luca Moretti: Recommend pre-hedging the curve now while iTraxx Main is contained at 58 bps.\n[10:16] Sarah Bover: Preparing draft pitchbook with €600M EMTN + €400M swap pre-hedge.")}
                        className="flex-1 p-2.5 rounded-lg border border-gray-200 bg-[#F8F9FA] hover:border-[#FF6200] text-left transition"
                      >
                        <div className="flex items-center space-x-1.5 font-bold text-gray-900 mb-0.5">
                          <MessageSquare size={13} className="text-[#000066]" />
                          <span>MS Teams Transcript</span>
                        </div>
                        <p className="text-[10px] text-gray-500">Simulate internal syndicate and coverage team dialogue</p>
                      </button>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Editable Touchpoint Content:</label>
                      <textarea
                        rows={5}
                        value={customTextContent}
                        onChange={(e) => setCustomTextContent(e.target.value)}
                        placeholder="Paste meeting notes, email transcript, or raw text..."
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-[#FF6200]"
                      />
                    </div>

                    <button
                      onClick={() => handleIngestCustomText("Internal Touchpoint", "Meeting / Email Transcript")}
                      disabled={!customTextContent.trim() || ingestingAction}
                      className="w-full bg-[#000066] hover:bg-[#1A224D] text-white font-bold py-2.5 rounded-lg shadow-sm transition disabled:opacity-40"
                    >
                      {ingestingAction ? "Extracting Signals with LLM..." : "Ingest Touchpoint & Update Signals"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pitchbook Preview Modal */}
        {previewOpen && activeClient && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3">
            <div className="bg-white rounded-2xl max-w-[1360px] w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
              
              <div className="h-14 border-b border-gray-200 px-6 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center space-x-3">
                  <span className="bg-[#FF6200] text-white font-extrabold px-2 py-0.5 rounded text-xs">ING</span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      {activeClient.name} — Pitchbook & Deal Copilot
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRunComplianceAudit}
                    disabled={complianceAuditing}
                    className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition shadow-sm ${
                      complianceResult?.compliant
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : flaggedSlides.length > 0
                        ? "bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-300"
                        : "bg-white hover:bg-gray-50 text-[#000066] border-gray-300"
                    } disabled:opacity-50`}
                    title="Perform full-deck FINRA 2210 & MiFID II inspection"
                  >
                    {complianceAuditing ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-[#FF6200]" />
                        <span>Auditing Full Deck...</span>
                      </>
                    ) : complianceResult?.compliant ? (
                      <>
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>100% Compliant</span>
                      </>
                    ) : flaggedSlides.length > 0 ? (
                      <>
                        <AlertTriangle size={14} className="text-amber-600" />
                        <span>{flaggedSlides.length} Flags Identified</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={14} className="text-[#FF6200]" />
                        <span>Run Compliance Audit</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownloadDeck(activeClient.id)}
                    disabled={loadingClient === activeClient.id}
                    className="inline-flex items-center space-x-1.5 bg-[#FF6200] hover:bg-[#E55800] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    {loadingClient === activeClient.id ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Generating PPTX...</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>Download .PPTX Deck</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setPreviewOpen(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Left: Slide Navigation */}
                <div className="w-52 border-r border-gray-200 bg-[#F8F9FA] p-2.5 overflow-y-auto space-y-1 shrink-0">
                  <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider px-2 py-1">
                    Deck Slides (10)
                  </p>
                  {getDynamicSlideTitles(activeClient).map((title, idx) => {
                    const isFlagged = flaggedSlides.includes(idx + 1);

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium transition flex items-center justify-between ${
                          currentSlideIndex === idx
                            ? "bg-[#000066] text-white shadow-sm font-semibold"
                            : isFlagged
                            ? "bg-amber-50 text-amber-900 border border-amber-200"
                            : "text-gray-700 hover:bg-gray-200/70"
                        }`}
                      >
                        <span className="truncate">{title}</span>
                        <div className="flex items-center space-x-1">
                          {isFlagged && currentSlideIndex !== idx && (
                            <span className="w-2 h-2 rounded-full bg-amber-500" title="Compliance enhancement recommended"></span>
                          )}
                          {currentSlideIndex === idx && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6200]"></span>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Center: Slide Preview */}
                <div className="flex-1 bg-[#EEF2F6] p-4 flex flex-col justify-between overflow-y-auto border-r border-gray-200">
                  <div className="w-full h-[470px] shadow rounded-lg overflow-hidden bg-white">
                    {getSlideContent(currentSlideIndex, activeClient)}
                  </div>

                  <div className="flex items-center justify-between w-full pt-3">
                    <button
                      onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                      disabled={currentSlideIndex === 0}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded border border-gray-300 text-[11px] font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40"
                    >
                      <ChevronLeft size={12} />
                      <span>Previous</span>
                    </button>

                    <span className="text-[11px] font-medium text-gray-500">
                      Slide <b className="text-gray-900">{currentSlideIndex + 1}</b> of 10
                    </span>

                    <button
                      onClick={() => setCurrentSlideIndex(Math.min(9, currentSlideIndex + 1))}
                      disabled={currentSlideIndex === 9}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded border border-gray-300 text-[11px] font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40"
                    >
                      <span>Next</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Right: Copilot Chat */}
                <div className="w-96 bg-white flex flex-col overflow-hidden shrink-0">
                  <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-md bg-[#FF6200] text-white flex items-center justify-center">
                        <Sparkles size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Origination Deal Copilot</h4>
                        <p className="text-[10px] text-gray-500">Real-time deck editor & structuring</p>
                      </div>
                    </div>

                    {flaggedSlides.length > 0 && (
                      <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                        Action Needed
                      </span>
                    )}
                  </div>

                  <div className="p-2 border-b border-gray-100 bg-[#F9FAFB] flex flex-wrap gap-1.5">
                    {[
                      "Run Compliance Audit",
                      "Apply compliance recommendations",
                      "In Slide 5, update iTraxx Main to 60 bps"
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip)}
                        className="text-[10px] bg-white hover:bg-orange-50 hover:text-[#FF6200] hover:border-orange-200 text-gray-600 border border-gray-200 px-2 py-1 rounded-full transition"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#FDFDFD] text-xs">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="text-[9px] font-bold text-gray-400 uppercase">
                            {msg.sender === "user" ? "You" : "ING Copilot"}
                          </span>
                          <span className="text-[9px] text-gray-400">· {msg.time}</span>
                        </div>
                        <div
                          className={`p-3 rounded-xl max-w-[92%] leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-[#0C112B] text-white rounded-br-none"
                              : "bg-[#F3F4F6] text-gray-800 rounded-bl-none border border-gray-200"
                          }`}
                        >
                          <FormattedChatText content={msg.text} />

                          {msg.isComplianceCard && (
                            <div className="mt-3 pt-2.5 border-t border-gray-200">
                              <button
                                onClick={() => handleApplyRemediations(msg.remedies)}
                                className="w-full inline-flex items-center justify-center space-x-1.5 bg-[#000066] hover:bg-[#1A224D] text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-sm transition"
                              >
                                <Zap size={13} className="text-[#FF6200]" />
                                <span>Apply Compliance Remediations</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {copilotLoading && (
                      <div className="flex items-center space-x-2 text-gray-400 text-xs">
                        <Loader2 size={14} className="animate-spin text-[#FF6200]" />
                        <span>Copilot reasoning over pitchbook structure...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="p-2.5 border-t border-gray-200 bg-white">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="text"
                        value={inputQuery}
                        onChange={(e) => setInputQuery(e.target.value)}
                        placeholder={`Tell Copilot to edit or check ${activeClient.name} deck...`}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#FF6200]"
                      />
                      <button
                        type="submit"
                        disabled={!inputQuery.trim() || copilotLoading}
                        className="bg-[#0C112B] hover:bg-[#1A224D] text-white p-1.5 rounded-lg disabled:opacity-40 transition"
                      >
                        <Send size={14} />
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
