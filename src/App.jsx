import { useState, useEffect, useMemo, useCallback } from "react";

function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(error);
        }
    }, [key, value]);

    return [value, setValue];
}


const DEFAULT_SALARY = 124748;
const MONTHS_LIST = [
    { key: "apr26", label: "Apr '26" }, { key: "may26", label: "May '26" },
    { key: "jun26", label: "Jun '26" }, { key: "jul26", label: "Jul '26" },
    { key: "aug26", label: "Aug '26" }, { key: "sep26", label: "Sep '26" },
    { key: "oct26", label: "Oct '26" }, { key: "nov26", label: "Nov '26" },
    { key: "dec26", label: "Dec '26" }, { key: "jan27", label: "Jan '27" },
    { key: "feb27", label: "Feb '27" }, { key: "mar27", label: "Mar '27" },
];
const INITIAL_FUNDS = [
    { id: "nifty50", name: "UTI Nifty 50 Index", shortName: "Nifty 50", type: "Large Cap Index", color: "#3b82f6", sipDate: "5th" },
    { id: "flexicap", name: "HDFC Flexi Cap", shortName: "Flexi Cap", type: "Flexi Cap", color: "#8b5cf6", sipDate: "6th" },
    { id: "gold", name: "SBI Gold Fund", shortName: "Gold", type: "Gold FoF", color: "#eab308", sipDate: "7th" },
];
const INITIAL_FUND_PCTS = { nifty50: 50, flexicap: 30, gold: 20 };
const FUND_COLORS = ["#3b82f6", "#8b5cf6", "#eab308", "#ef4444", "#06b664", "#f97316", "#ec4899", "#14b8a6"];
const fmt = (v) => "₹" + Math.round(v).toLocaleString("en-IN");
const fmtK = (v) => { v = Math.round(v); if (v >= 10000000) return "₹" + (v / 10000000).toFixed(2) + " Cr"; if (v >= 100000) return "₹" + (v / 100000).toFixed(1) + "L"; return fmt(v); };
const pct = (v, t) => t > 0 ? ((v / t) * 100).toFixed(1) + "%" : "0%";
const BG = "transparent", CARD = "var(--bg-card)", CARD2 = "var(--bg-card-hover)", BORDER = "var(--border-color)", TEXT = "var(--text-main)", MUTED = "var(--text-muted)", DIM = "var(--text-dim)";
const cs = { background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "12px 14px", marginBottom: 10, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", transition: "all 0.2s ease" };
const tabS = (a) => ({ padding: "7px 15px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none", background: a ? "#1d4ed8" : "transparent", color: a ? "#fff" : MUTED, transition: "all 0.2s" });

function PieChart({ data, size = 180, hideNums }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (!total) return <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", color: DIM, fontSize: 11 }}>No data</div>;
    let cum = 0;
    const slices = data.filter(d => d.value > 0).map(d => {
        const p = d.value / total, ang = p * 360;
        const s1 = (cum * Math.PI) / 180, s2 = ((cum + ang) * Math.PI) / 180;
        const r = size / 2 - 10, cx = size / 2, cy = size / 2;
        const path = p >= 0.9999 ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
            : `M ${cx} ${cy} L ${cx + r * Math.cos(s1 - Math.PI / 2)} ${cy + r * Math.sin(s1 - Math.PI / 2)} A ${r} ${r} 0 ${ang > 180 ? 1 : 0} 1 ${cx + r * Math.cos(s2 - Math.PI / 2)} ${cy + r * Math.sin(s2 - Math.PI / 2)} Z`;
        cum += ang;
        return { ...d, path, p };
    });
    const inner = size / 2 - 38;
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="#1e3a5f" strokeWidth={1.5} />)}
                <circle cx={size / 2} cy={size / 2} r={inner} fill="#162032" />
                <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fill="#e2e8f0" fontSize={size > 160 ? 15 : 12} fontWeight={800}>{hideNums ? "---" : fmtK(total)}</text>
                <text x={size / 2} y={size / 2 + 11} textAnchor="middle" fill="#64748b" fontSize={9}>/month</text>
            </svg>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 10px", justifyContent: "center", maxWidth: size + 40, marginTop: 4 }}>
                {slices.map((s, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: MUTED }}>
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: s.color, display: "inline-block", flexShrink: 0 }} />
                        {s.label} {Math.round(s.p * 100)}%
                    </span>
                ))}
            </div>
        </div>
    );
}

function Slider({ label, value, onChange, min = 0, max = 100000, step = 1000, color = "#3b82f6", sub, suffix, refTotal, hideNums, onRemove }) {
    const p = Math.min(100, ((value - min) / (max - min || 1)) * 100);
    return (
        <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>{label}</span>
                    {onRemove && <button onClick={onRemove} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12, padding: 0, fontWeight: 700 }}>×</button>}
                </div>
                {hideNums
                    ? <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{refTotal > 0 ? pct(value, refTotal) : "—"}</span>
                    : <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <span style={{ fontSize: 9, color: DIM }}>₹</span>
                        <input type="number" value={value} onChange={e => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
                            style={{ width: 70, background: "#0f2035", border: `1px solid ${BORDER}`, borderRadius: 5, color: TEXT, fontSize: 11, fontWeight: 700, padding: "2px 5px", textAlign: "right", outline: "none" }} />
                        {suffix && <span style={{ fontSize: 9, color: DIM }}>{suffix}</span>}
                    </div>
                }
            </div>
            {sub && <div style={{ fontSize: 9, color: DIM, marginBottom: 2 }}>{sub}</div>}
            <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseInt(e.target.value))}
                style={{ width: "100%", height: 4, appearance: "none", borderRadius: 2, cursor: "pointer", background: `linear-gradient(to right,${color} ${p}%,#1e3a5f ${p}%)`, outline: "none" }} />
        </div>
    );
}

function Bar({ value, max, color, h = 5 }) {
    return <div style={{ width: "100%", height: h, background: CARD2, borderRadius: h, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, (value / (max || 1)) * 100)}%`, height: "100%", background: color, borderRadius: h, transition: "width 0.3s" }} />
    </div>;
}

export default function FinancialPlanner() {
    const [salary, setSalary] = useLocalStorage("fp_salary", DEFAULT_SALARY);
    const [editSal, setEditSal] = useState(false);
    const [defSpends, setDefSpends] = useLocalStorage("fp_defSpends", 50000);
    const [defRD, setDefRD] = useLocalStorage("fp_defRD", 10000);
    const [defSIP, setDefSIP] = useLocalStorage("fp_defSIP", 20000);
    const [rdRate, setRdRate] = useLocalStorage("fp_rdRate", 7.0);
    const [efTarget, setEfTarget] = useLocalStorage("fp_efTarget", 200000);
    const [stepUp, setStepUp] = useLocalStorage("fp_stepUp", 10);
    const [projYrs, setProjYrs] = useLocalStorage("fp_projYrs", 10);
    const [cagr, setCagr] = useLocalStorage("fp_cagr", 12);
    const [overrides, setOverrides] = useLocalStorage("fp_overrides", {});
    const [selMonth, setSelMonth] = useState("__default");
    const [mainTab, setMainTab] = useState("overview");
    const [leftTab, setLeftTab] = useState("budget");
    const [hide, setHide] = useLocalStorage("fp_hide", false);
    const [funds, setFunds] = useLocalStorage("fp_funds", INITIAL_FUNDS);
    const [fundPcts, setFundPcts] = useLocalStorage("fp_fundPcts", INITIAL_FUND_PCTS);
    const [fundCagrs, setFundCagrs] = useLocalStorage("fp_fundCagrs", { nifty50: 12, flexicap: 14, gold: 10 });
    const [editFunds, setEditFunds] = useState(false);
    const [newFund, setNewFund] = useState({ name: "", shortName: "", type: "", cagr: 12 });
    const [defCustom, setDefCustom] = useLocalStorage("fp_defCustom", []);
    const [moCustom, setMoCustom] = useLocalStorage("fp_moCustom", {});
    const [showAdd, setShowAdd] = useState(false);
    const [newField, setNewField] = useState({ label: "", amount: 0 });
    const [sidebarOpen, setSidebarOpen] = useState(false);


    const isDefault = selMonth === "__default";
    const curCustom = isDefault ? defCustom : (moCustom[selMonth] || defCustom);
    const curCustomTotal = curCustom.reduce((s, f) => s + f.amount, 0);

    const getVal = useCallback((mk, f) => {
        if (overrides[mk]?.[f] !== undefined) return overrides[mk][f];
        return f === "spends" ? defSpends : f === "rd" ? defRD : defSIP;
    }, [overrides, defSpends, defRD, defSIP]);

    const getCustomTotal = useCallback((mk) => {
        const fields = moCustom[mk] || defCustom;
        return fields.reduce((s, f) => s + f.amount, 0);
    }, [moCustom, defCustom]);

    const curSpends = isDefault ? defSpends : getVal(selMonth, "spends");
    const curRD = isDefault ? defRD : getVal(selMonth, "rd");
    const curSIP = isDefault ? defSIP : getVal(selMonth, "sip");

    const handleField = (f, v) => {
        if (isDefault) { if (f === "spends") setDefSpends(v); else if (f === "rd") setDefRD(v); else setDefSIP(v); }
        else setOverrides(p => ({ ...p, [selMonth]: { ...(p[selMonth] || {}), [f]: v } }));
    };
    const clearOv = (mk) => { setOverrides(p => { const n = { ...p }; delete n[mk]; return n; }); setMoCustom(p => { const n = { ...p }; delete n[mk]; return n; }); };

    const setFundPct = useCallback((id, val) => {
        setFundPcts(prev => {
            const others = Object.entries(prev).filter(([k]) => k !== id);
            const ot = others.reduce((s, [, v]) => s + v, 0);
            const nv = Math.max(0, Math.min(100, val));
            if (ot + nv > 100) {
                const sc = (100 - nv) / (ot || 1); const nx = {};
                others.forEach(([k, v]) => { nx[k] = Math.round(v * sc); }); nx[id] = nv;
                const adj = 100 - Object.values(nx).reduce((s, v) => s + v, 0);
                const f = Object.keys(nx)[0]; if (f) nx[f] += adj; return nx;
            }
            return { ...prev, [id]: nv };
        });
    }, []);

    const addFund = () => {
        if (!newFund.name.trim()) return;
        const id = "fund_" + Date.now(), color = FUND_COLORS[funds.length % FUND_COLORS.length];
        setFunds(p => [...p, { id, name: newFund.name, shortName: newFund.shortName || newFund.name.split(" ").slice(0, 2).join(" "), type: newFund.type || "MF", color, sipDate: "5th" }]);
        setFundCagrs(p => ({ ...p, [id]: newFund.cagr || 12 }));
        setFundPcts(prev => {
            const np = Math.round(100 / (Object.keys(prev).length + 1));
            const mx = {}; Object.keys(prev).forEach(k => { mx[k] = np; }); mx[id] = 100 - np * Object.keys(prev).length; return mx;
        });
        setNewFund({ name: "", shortName: "", type: "", cagr: 12 });
    };

    const removeFund = (id) => {
        setFunds(p => p.filter(f => f.id !== id));
        setFundCagrs(p => { const n = { ...p }; delete n[id]; return n; });
        setFundPcts(prev => {
            const mx = { ...prev }; delete mx[id];
            const t = Object.values(mx).reduce((s, v) => s + v, 0);
            if (t > 0 && t !== 100) { const sc = 100 / t; Object.keys(mx).forEach(k => { mx[k] = Math.round(mx[k] * sc); }); const adj = 100 - Object.values(mx).reduce((s, v) => s + v, 0); const f = Object.keys(mx)[0]; if (f) mx[f] += adj; }
            return mx;
        });
    };

    const addCustom = () => {
        if (!newField.label.trim()) return;
        const field = { id: "cf_" + Date.now(), label: newField.label.trim(), amount: newField.amount || 0, color: FUND_COLORS[Math.floor(Math.random() * FUND_COLORS.length)] };
        if (isDefault) setDefCustom(p => [...p, field]);
        else setMoCustom(p => ({ ...p, [selMonth]: [...(p[selMonth] || defCustom), field] }));
        setNewField({ label: "", amount: 0 }); setShowAdd(false);
    };

    const timeline = useMemo(() => {
        let efAcc = 0;
        return MONTHS_LIST.map(m => {
            const spends = getVal(m.key, "spends"), rd = getVal(m.key, "rd"), sip = getVal(m.key, "sip");
            const customTotal = getCustomTotal(m.key);
            const extra = Math.max(0, salary - spends - rd - sip - customTotal);
            const efContrib = efAcc < efTarget ? Math.min(extra, efTarget - efAcc) : 0;
            efAcc += efContrib;
            const leftover = extra - efContrib;
            const isP2 = efAcc >= efTarget;
            const totalSIP = sip + (isP2 ? leftover : 0);
            const fundAllocs = funds.map(f => ({ ...f, amount: Math.round(totalSIP * (fundPcts[f.id] || 0) / 100) }));
            return { ...m, spends, rd, sip, customTotal, extra, efContrib, efAccum: efAcc, leftover, isP2, totalSIP, fundAllocs, overridden: !!overrides[m.key], phase: isP2 ? 2 : 1, overBudget: spends + rd + sip + customTotal > salary };
        });
    }, [getVal, getCustomTotal, efTarget, funds, fundPcts, overrides, salary]);

    const p1Rows = timeline.filter(r => r.phase === 1), p2Rows = timeline.filter(r => r.phase === 2);
    const p1AvgSIP = p1Rows.length ? Math.round(p1Rows.reduce((s, r) => s + r.totalSIP, 0) / p1Rows.length) : defSIP;
    const p2AvgSIP = p2Rows.length ? Math.round(p2Rows.reduce((s, r) => s + r.totalSIP, 0) / p2Rows.length) : defSIP;
    const avgSpends = Math.round(timeline.reduce((s, r) => s + r.spends, 0) / 12);
    const avgRD = Math.round(timeline.reduce((s, r) => s + r.rd, 0) / 12);
    const avgSIP = Math.round(timeline.reduce((s, r) => s + r.sip, 0) / 12);
    const avgCustom = Math.round(timeline.reduce((s, r) => s + r.customTotal, 0) / 12);
    const avgExtra = Math.max(0, salary - avgSpends - avgRD - avgSIP - avgCustom);
    const totalMF = timeline.reduce((s, r) => s + r.totalSIP, 0);
    const totalRD = timeline.reduce((s, r) => s + r.rd, 0);

    const rdMaturity = useMemo(() => {
        let t = 0; timeline.forEach((r, i) => { t += r.rd * (1 + rdRate / 100 / 4) ** ((12 - i) / 3); }); return Math.round(t);
    }, [timeline, rdRate]);

    const projection = useMemo(() => {
        const rows = []; let corpus = 0, monthly = p2AvgSIP || avgSIP;
        for (let yr = 1; yr <= projYrs; yr++) {
            for (let mo = 0; mo < 12; mo++) { const r = cagr / 100 / 12; corpus = corpus * (1 + r) + monthly; }
            rows.push({ yr, monthly: Math.round(monthly), corpus: Math.round(corpus) });
            monthly = Math.round(monthly * (1 + stepUp / 100));
        }
        return rows;
    }, [p2AvgSIP, avgSIP, stepUp, projYrs, cagr]);

    const milestones = [1, 3, 5, 7, 10].map(y => { const r = projection.find(p => p.yr === y); return { yr: y, corpus: r?.corpus || 0, sip: r?.monthly || 0 }; });
    const p2StartLabel = MONTHS_LIST[p1Rows.length]?.label || "After EF";
    const curOver = curSpends + curRD + curSIP + curCustomTotal > salary;
    const totalPct = Object.values(fundPcts).reduce((s, v) => s + v, 0);
    const selLabel = isDefault ? "Default (All Months)" : MONTHS_LIST.find(m => m.key === selMonth)?.label;

    const overallPie = [
        { label: "Personal Spends", value: avgSpends, color: "#f97316" },
        { label: "Mutual Funds", value: avgSIP, color: "#3b82f6" },
        { label: "RD", value: avgRD, color: "#22c55e" },
        ...(avgCustom > 0 ? [{ label: "Custom", value: avgCustom, color: "#ec4899" }] : []),
        { label: "Extra / EF", value: avgExtra, color: "#8b5cf6" },
    ];
    const p1MFPie = funds.map(f => ({ label: f.shortName, value: Math.round(p1AvgSIP * (fundPcts[f.id] || 0) / 100), color: f.color }));
    const p2MFPie = funds.map(f => ({ label: f.shortName, value: Math.round(p2AvgSIP * (fundPcts[f.id] || 0) / 100), color: f.color }));
    const p1Full = [{ label: "Spends", value: avgSpends, color: "#f97316" }, { label: "RD", value: avgRD, color: "#22c55e" }, ...p1MFPie, ...(avgCustom > 0 ? [{ label: "Custom", value: avgCustom, color: "#ec4899" }] : []), { label: "EF", value: avgExtra, color: "#8b5cf6" }];
    const p2Full = [{ label: "Spends", value: avgSpends, color: "#f97316" }, { label: "RD", value: avgRD, color: "#22c55e" }, ...p2MFPie, ...(avgCustom > 0 ? [{ label: "Custom", value: avgCustom, color: "#ec4899" }] : [])];

    const resetLeft = () => {
        if (leftTab === "budget") { setSalary(DEFAULT_SALARY); setDefSpends(50000); setDefRD(10000); setDefSIP(20000); setOverrides({}); setDefCustom([]); setMoCustom({}); }
        else if (leftTab === "funds") { setFunds(INITIAL_FUNDS); setFundPcts(INITIAL_FUND_PCTS); setFundCagrs({ nifty50: 12, flexicap: 14, gold: 10 }); }
        else { setStepUp(10); setProjYrs(10); setCagr(12); }
    };

    return (
        <div className="main-container" style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: BG, color: TEXT }}>
            
            {/* MOBILE HEADER */}
            <header className="mobile-header">
                <div>
                    <div style={{ fontSize: 14, fontWeight: 800, background: "linear-gradient(135deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Financial Planner</div>
                    <div style={{ fontSize: 8, color: DIM }}>Apr '26 → Mar '27</div>
                </div>
                <button 
                    onClick={() => setSidebarOpen(true)}
                    style={{ background: "#1d3a6b", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                >
                    ⚙️ Settings
                </button>
            </header>

            {/* LEFT / SIDEBAR */}
            <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
                <div style={{ padding: "12px", flex: 1, overflowY: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 800, background: "linear-gradient(135deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Settings</div>
                            <div style={{ fontSize: 9, color: DIM }}>Configure your plan</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setHide(h => !h)} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", border: `1px solid ${hide ? "#f59e0b" : BORDER}`, background: "transparent", color: hide ? "#f59e0b" : MUTED }}>
                                {hide ? "👁 Show" : "🙈 Hide"}
                            </button>
                            <button 
                                className="mobile-only"
                                onClick={() => setSidebarOpen(false)}
                                style={{ background: "none", border: "none", color: "#ef4444", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center" }}
                            >
                                ×
                            </button>
                        </div>
                    </div>

                {/* Salary */}
                <div style={{ ...cs, background: "linear-gradient(135deg,#0f2a4a,#1a1040)", textAlign: "center", padding: "10px 14px" }}>
                    <div style={{ fontSize: 8, color: MUTED, fontWeight: 700, letterSpacing: 1 }}>MONTHLY TAKE-HOME</div>
                    {editSal
                        ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginTop: 4 }}>
                            <span style={{ color: "#22c55e", fontSize: 18, fontWeight: 900 }}>₹</span>
                            <input type="number" value={salary} autoFocus onChange={e => setSalary(Math.max(0, parseInt(e.target.value) || 0))}
                                onBlur={() => setEditSal(false)} onKeyDown={e => e.key === "Enter" && setEditSal(false)}
                                style={{ width: 110, background: "transparent", border: "none", borderBottom: "2px solid #22c55e", color: "#22c55e", fontSize: 20, fontWeight: 900, padding: "2px 0", textAlign: "center", outline: "none" }} />
                        </div>
                        : <div onClick={() => setEditSal(true)} style={{ fontSize: 22, fontWeight: 900, color: "#22c55e", cursor: "pointer", marginTop: 4 }} title="Click to edit">
                            {hide ? "---" : fmt(salary)} <span style={{ fontSize: 9, color: DIM }}>✏</span>
                        </div>
                    }
                </div>

                {/* Month selector */}
                <div style={{ ...cs, padding: "10px 12px", background: "#101e33" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 0.8, marginBottom: 6 }}>📅 PLAN BY MONTH</div>
                    <select value={selMonth} onChange={e => setSelMonth(e.target.value)}
                        style={{ width: "100%", padding: "5px 8px", background: "#0a1628", border: `1px solid ${BORDER}`, color: TEXT, fontSize: 11, fontWeight: 700, cursor: "pointer", outline: "none", borderRadius: 6, marginBottom: 6 }}>
                        <option value="__default">⚙ Default (All Months)</option>
                        {MONTHS_LIST.map(m => <option key={m.key} value={m.key}>{m.label}{(overrides[m.key] || moCustom[m.key]) ? " 🔸" : ""}</option>)}
                    </select>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        {MONTHS_LIST.map(m => {
                            const ov = !!overrides[m.key] || !!moCustom[m.key];
                            return <button key={m.key} onClick={() => setSelMonth(m.key)} style={{ padding: "3px 5px", borderRadius: 4, fontSize: 9, fontWeight: 700, cursor: "pointer", border: selMonth === m.key ? "2px solid #3b82f6" : `1px solid ${ov ? "#f59e0b" : BORDER}`, background: selMonth === m.key ? "#1d3a6b" : "transparent", color: selMonth === m.key ? "#fff" : ov ? "#f59e0b" : DIM }}>{m.label.split("'")[0].trim()}</button>;
                        })}
                    </div>
                    {!isDefault && (overrides[selMonth] || moCustom[selMonth]) && (
                        <button onClick={() => clearOv(selMonth)} style={{ marginTop: 6, width: "100%", padding: "4px", borderRadius: 5, fontSize: 9, fontWeight: 700, cursor: "pointer", border: "1px solid #ef4444", background: "transparent", color: "#fca5a5" }}>Reset {selLabel} to Default</button>
                    )}
                    <div style={{ fontSize: 8, color: DIM, marginTop: 4 }}>{isDefault ? "Changes apply to all months without overrides." : `Editing ${selLabel} only.`}</div>
                </div>

                {curOver && <div style={{ background: "#450a0a", border: "1px solid #b91c1c", borderRadius: 8, padding: 8, marginBottom: 8, fontSize: 10, color: "#fca5a5", textAlign: "center" }}>⚠ Over budget by {fmt(curSpends + curRD + curSIP + curCustomTotal - salary)}</div>}

                <div style={{ display: "flex", gap: 3, marginBottom: 10, alignItems: "center" }}>
                    {[["budget", "💰 Budget"], ["funds", "📈 Funds"], ["proj", "🚀 Proj"]].map(([k, l]) => (
                        <button key={k} onClick={() => setLeftTab(k)} style={tabS(leftTab === k)}>{l}</button>
                    ))}
                    <button onClick={resetLeft} style={{ fontSize: 9, color: "#f87171", background: "none", border: "none", cursor: "pointer", fontWeight: 700, padding: "0 4px", marginLeft: "auto" }}>Reset</button>
                </div>

                {leftTab === "budget" && (
                    <div>
                        <Slider label="Personal Spends" sub="Rent + food + lifestyle" value={curSpends} onChange={v => handleField("spends", v)} min={0} max={salary} step={1000} color="#f97316" refTotal={salary} hideNums={hide} />
                        <Slider label="Recurring Deposit" sub={`HDFC @ ${rdRate}%`} value={curRD} onChange={v => handleField("rd", v)} min={0} max={50000} step={1000} color="#22c55e" refTotal={salary} hideNums={hide} />
                        <Slider label="Total MF SIP" sub={`${funds.length} funds`} value={curSIP} onChange={v => handleField("sip", v)} min={0} max={salary} step={1000} color="#3b82f6" refTotal={salary} hideNums={hide} />
                        {curCustom.map(cf => (
                            <Slider key={cf.id} label={cf.label} value={cf.amount} onChange={v => { const upd = l => l.map(f => f.id === cf.id ? { ...f, amount: v } : f); if (isDefault) setDefCustom(upd); else setMoCustom(p => ({ ...p, [selMonth]: upd(p[selMonth] || defCustom) })); }} min={0} max={salary} step={1000} color={cf.color} refTotal={salary} hideNums={hide} onRemove={() => { if (isDefault) setDefCustom(p => p.filter(f => f.id !== cf.id)); else setMoCustom(p => ({ ...p, [selMonth]: (p[selMonth] || defCustom).filter(f => f.id !== cf.id) })); }} />
                        ))}
                        {showAdd ? (
                            <div style={{ ...cs, padding: 10, border: `1px solid #3b82f6`, marginBottom: 8 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, marginBottom: 6 }}>New Budget Item</div>
                                <input placeholder="Label" value={newField.label} onChange={e => setNewField(p => ({ ...p, label: e.target.value }))}
                                    style={{ width: "100%", marginBottom: 5, boxSizing: "border-box", background: "#0a1628", border: `1px solid ${BORDER}`, color: TEXT, fontSize: 10, outline: "none", borderRadius: 5, padding: "4px 8px" }} />
                                <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 8 }}>
                                    <span style={{ fontSize: 9, color: DIM }}>₹</span>
                                    <input type="number" value={newField.amount || ""} onChange={e => setNewField(p => ({ ...p, amount: parseInt(e.target.value) || 0 }))}
                                        style={{ flex: 1, padding: "4px 6px", borderRadius: 5, background: "#0a1628", border: `1px solid ${BORDER}`, color: TEXT, fontSize: 10, outline: "none", textAlign: "right" }} />
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                    <button onClick={addCustom} style={{ flex: 1, padding: "5px", borderRadius: 5, fontSize: 10, fontWeight: 700, border: "none", background: "#1d4ed8", color: "#fff", cursor: "pointer" }}>+ Add</button>
                                    <button onClick={() => { setShowAdd(false); setNewField({ label: "", amount: 0 }); }} style={{ flex: 1, padding: "5px", borderRadius: 5, fontSize: 10, fontWeight: 700, border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, cursor: "pointer" }}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setShowAdd(true)} style={{ width: "100%", padding: "7px", borderRadius: 7, fontSize: 10, fontWeight: 700, border: `1px dashed ${BORDER}`, background: "transparent", color: "#60a5fa", cursor: "pointer", marginBottom: 10 }}>+ Add Budget Item</button>
                        )}
                        {isDefault && (
                            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 10, marginTop: 4 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 0.6, marginBottom: 8 }}>GLOBAL</div>
                                <div style={{ marginBottom: 8 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                        <span style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>RD Interest Rate</span>
                                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                            <input type="number" value={rdRate} step="0.1" min="4" max="9" onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setRdRate(Math.max(4, Math.min(9, v))); }}
                                                style={{ width: 44, background: "#0f2035", border: `1px solid ${BORDER}`, borderRadius: 5, color: TEXT, fontSize: 11, fontWeight: 700, padding: "2px 4px", textAlign: "right", outline: "none" }} />
                                            <span style={{ fontSize: 9, color: DIM }}>% p.a.</span>
                                        </div>
                                    </div>
                                    <input type="range" min={40} max={90} step={1} value={Math.round(rdRate * 10)} onChange={e => setRdRate(parseInt(e.target.value) / 10)}
                                        style={{ width: "100%", height: 4, appearance: "none", borderRadius: 2, cursor: "pointer", background: `linear-gradient(to right,#22c55e ${((rdRate - 4) / 5) * 100}%,#1e3a5f ${((rdRate - 4) / 5) * 100}%)`, outline: "none" }} />
                                </div>
                                <Slider label="EF Target" value={efTarget} onChange={setEfTarget} min={50000} max={500000} step={10000} color="#8b5cf6" refTotal={500000} hideNums={hide} />
                            </div>
                        )}
                        <div style={{ ...cs, background: "#101e33", padding: 12, marginTop: 4 }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 0.6, marginBottom: 8 }}>DEFAULT BREAKDOWN</div>
                            {[{ l: "Personal Spends", v: defSpends, c: "#f97316" }, { l: "Mutual Funds", v: defSIP, c: "#3b82f6" }, { l: "RD", v: defRD, c: "#22c55e" }, { l: "Extra Funds", v: Math.max(0, salary - defSpends - defSIP - defRD), c: "#8b5cf6" }].map(item => (
                                <div key={item.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: 2, background: item.c, display: "inline-block" }} />
                                        <span style={{ fontSize: 10, color: MUTED }}>{item.l}</span>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{hide ? pct(item.v, salary) : fmt(item.v)}</span>
                                </div>
                            ))}
                            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 6, marginTop: 2, display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: MUTED }}>Total</span>
                                <span style={{ fontSize: 12, fontWeight: 800, color: "#22c55e" }}>{hide ? "---" : fmt(salary)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {leftTab === "funds" && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <div style={{ fontSize: 10, color: DIM }}>SIP: <b style={{ color: "#3b82f6" }}>{hide ? "---" : fmt(defSIP)}</b>/mo</div>
                            <button onClick={() => setEditFunds(e => !e)} style={{ fontSize: 9, fontWeight: 700, color: editFunds ? "#f0bf24" : "#60a5fa", background: "none", border: "none", cursor: "pointer" }}>
                                {editFunds ? "✓ Done Editing" : "✏ Edit All"}
                            </button>
                        </div>
                        {funds.map(f => {
                            const fp = fundPcts[f.id] || 0;
                            return (
                                <div key={f.id} style={{ ...cs, padding: 10, position: "relative", marginBottom: 8 }}>
                                    {editFunds && <button onClick={() => removeFund(f.id)} style={{ position: "absolute", top: 6, right: 8, background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                        <div><div style={{ fontSize: 8, color: DIM }}>{f.type}</div><div style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.shortName}</div></div>
                                        <div style={{ textAlign: "right" }}><div style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{hide ? `${fp}%` : fmt(Math.round(defSIP * fp / 100))}</div></div>
                                    </div>
                                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                                        <input type="range" min={0} max={100} value={fp} onChange={e => setFundPct(f.id, parseInt(e.target.value))}
                                            style={{ flex: 1, height: 4, appearance: "none", borderRadius: 2, cursor: "pointer", background: `linear-gradient(to right,${f.color} ${fp}%,#1e3a5f ${fp}%)`, outline: "none" }} />
                                        <input type="number" value={fp} min={0} max={100} onChange={e => setFundPct(f.id, parseInt(e.target.value) || 0)}
                                            style={{ width: 36, background: "#0a1628", border: `1px solid ${BORDER}`, borderRadius: 4, color: f.color, fontSize: 10, fontWeight: 700, padding: "2px 3px", textAlign: "right", outline: "none" }} />
                                        <span style={{ fontSize: 9, color: DIM }}>%</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${BORDER}`, paddingTop: 6 }}>
                                        <span style={{ fontSize: 9, color: DIM }}>Expected CAGR</span>
                                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                            <input type="number" value={fundCagrs[f.id] || 12} min={0} max={30} onChange={e => setFundCagrs(p => ({ ...p, [f.id]: Math.max(0, Math.min(30, parseFloat(e.target.value) || 0)) }))}
                                                style={{ width: 40, background: "#0a1628", border: `1px solid ${BORDER}`, borderRadius: 4, color: f.color, fontSize: 10, fontWeight: 700, padding: "2px 3px", textAlign: "right", outline: "none" }} />
                                            <span style={{ fontSize: 9, color: DIM }}>%</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div style={{ textAlign: "center", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, marginBottom: 8, background: totalPct === 100 ? "#14532d" : "#451a03", color: totalPct === 100 ? "#22c55e" : "#f59e0b" }}>
                            {totalPct === 100 ? "✓ 100%" : `⚠ ${totalPct}%`}
                        </div>
                        {editFunds && (
                            <div style={{ ...cs, border: `1px solid #3b82f6`, padding: 10 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, marginBottom: 6 }}>Add New Fund</div>
                                {[["name", "Fund Name"], ["shortName", "Short Name"], ["type", "Type"]].map(([k, pl]) => (
                                    <input key={k} placeholder={pl} value={newFund[k] || ""} onChange={e => setNewFund(p => ({ ...p, [k]: e.target.value }))}
                                        style={{ width: "100%", marginBottom: 5, boxSizing: "border-box", background: "#0a1628", border: `1px solid ${BORDER}`, color: TEXT, fontSize: 10, outline: "none", borderRadius: 5, padding: "4px 7px" }} />
                                ))}
                                <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 6 }}>
                                    <span style={{ fontSize: 9, color: DIM }}>CAGR</span>
                                    <input type="number" value={newFund.cagr} min={0} max={30} onChange={e => setNewFund(p => ({ ...p, cagr: parseFloat(e.target.value) || 0 }))}
                                        style={{ width: 48, background: "#0a1628", border: `1px solid ${BORDER}`, borderRadius: 4, color: TEXT, fontSize: 10, padding: "2px 4px", textAlign: "right", outline: "none" }} />
                                    <span style={{ fontSize: 9, color: DIM }}>%</span>
                                </div>
                                <button onClick={addFund} style={{ width: "100%", padding: "5px", borderRadius: 5, fontSize: 10, fontWeight: 700, border: "none", background: "#1d4ed8", color: "#fff", cursor: "pointer" }}>+ Add Fund</button>
                            </div>
                        )}
                    </div>
                )}

                {leftTab === "proj" && (
                    <div>
                        <Slider label="Annual Step-Up" value={stepUp} onChange={setStepUp} min={0} max={30} step={1} color="#8b5cf6" suffix="%" hideNums={false} />
                        <Slider label="Years" value={projYrs} onChange={setProjYrs} min={1} max={25} step={1} color="#22c55e" suffix="yrs" hideNums={false} />
                        <Slider label="CAGR" value={cagr} onChange={setCagr} min={6} max={20} step={1} color="#3b82f6" suffix="%" hideNums={false} />
                    </div>
                )}

                {/* Mobile Close Indicator */}
                <button 
                    onClick={() => setSidebarOpen(false)}
                    style={{ width: "100%", padding: "12px", marginTop: "20px", borderRadius: 12, background: "linear-gradient(135deg,#1d4ed8,#1e3a8a)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
                    className="mobile-only"
                >
                    Apply & Close
                </button>
            </div>
            
            {/* RIGHT - MAIN CONTENT */}
            <div className="content-wrapper">
                <div className="tabs-scrollable" style={{ marginBottom: 16 }}>
                    {[["overview", "🗺 Overview"], ["allocation", "🥧 Allocation"], ["timeline", "📋 Timeline"], ["funds", "📊 Funds"], ["projection", "🚀 Projection"]].map(([k, l]) => (
                        <button key={k} onClick={() => setMainTab(k)} style={{ ...tabS(mainTab === k), padding: "10px 18px", fontSize: 13, borderRadius: 12, whiteSpace: "nowrap" }}>{l}</button>
                    ))}
                </div>

                {/* OVERVIEW */}
                {mainTab === "overview" && (
                    <div>
                        <div className="grid-cols-mobile" style={{ marginBottom: 16 }}>
                            {[
                                { t: "Avg SIP/mo", v: hide ? "---" : fmt(p2AvgSIP), c: "#60a5fa", sub: "Base" },
                                { t: "Phase 2 SIP", v: hide ? "---" : fmt(p2AvgSIP), c: "#a78bfa", sub: `From ${p2StartLabel}` },
                                { t: "Extra/mo", v: hide ? "---" : fmt(avgExtra), c: "#60a5fa", sub: "→ EF + SIP" },
                                { t: "RD Maturity", v: hide ? "---" : fmtK(rdMaturity), c: "#22c55e", sub: "Mar '27" },
                            ].map(({ t, v, c, sub }) => (
                                <div key={t} style={{ ...cs, textAlign: "center", padding: "16px 12px" }}>
                                    <div style={{ fontSize: 9, color: MUTED, fontWeight: 700, letterSpacing: 0.5 }}>{t}</div>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: c, margin: "6px 0 4px" }}>{v}</div>
                                    <div style={{ fontSize: 9, color: DIM }}>{sub}</div>
                                </div>
                            ))}
                        </div>

                        {/* Monthly budget map */}
                        <div style={{ ...cs, marginBottom: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Monthly Budget Map <span style={{ fontSize: 9, color: DIM, fontWeight: 400 }}>— scroll to see all</span></div>
                            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch" }}>
                                {timeline.map(r => (
                                    <div key={r.key} onClick={() => { setSelMonth(r.key); setLeftTab("budget"); setSidebarOpen(true); }} style={{ minWidth: 100, background: r.overridden ? CARD2 : CARD, borderRadius: 10, padding: "12px 8px", textAlign: "center", cursor: "pointer", border: `1px solid ${r.overridden ? "#3b82f6" : BORDER}`, flexShrink: 0 }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: r.overridden ? "#60a5fa" : MUTED }}>{r.label}</div>
                                        <div style={{ fontSize: 9, color: DIM, marginTop: 4 }}>SIP {fmtK(r.sip)}</div>
                                        <div style={{ fontSize: 9, fontWeight: 700, color: r.phase === 2 ? "#3b82f6" : "#22c55e", marginTop: 4 }}>{r.phase === 1 ? "Phase 1" : "Phase 2"}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Avg allocation */}
                        <div style={{ ...cs, marginBottom: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Avg Budget Allocation</div>
                            {[
                                { l: "Personal Spends", v: avgSpends, c: "#f97316" },
                                { l: "Mutual Funds", v: avgSIP, c: "#3b82f6" },
                                { l: "RD", v: avgRD, c: "#22c55e" },
                                ...(avgCustom > 0 ? [{ l: "Custom", v: avgCustom, c: "#ec4899" }] : []),
                                { l: "Extra/EF", v: avgExtra, c: "#8b5cf6" },
                            ].map(({ l, v, c }) => (
                                <div key={l} style={{ marginBottom: 8 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: MUTED, marginBottom: 3 }}>
                                        <span>{l}</span>
                                        <span style={{ color: TEXT, fontWeight: 700 }}>{hide ? pct(v, salary) : `${fmt(v)} (${pct(v, salary)})`}</span>
                                    </div>
                                    <div style={{ height: 6, background: CARD2, borderRadius: 3, overflow: "hidden" }}>
                                        <div style={{ width: pct(v, salary), height: "100%", background: c, borderRadius: 3 }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Emergency Fund */}
                        <div style={{ ...cs, marginBottom: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <div style={{ fontSize: 12, fontWeight: 700 }}>🏦 Emergency Fund Progress</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#8b5cf6" }}>Target: {hide ? "---" : fmtK(efTarget)}</div>
                            </div>
                            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10, WebkitOverflowScrolling: "touch" }}>
                                {timeline.map(r => {
                                    const done = r.efAccum >= efTarget;
                                    return (
                                        <div key={r.key} style={{ minWidth: 80, background: done ? "#14532d" : CARD2, borderRadius: 10, padding: "10px 8px", textAlign: "center", border: `1px solid ${done ? "#22c55e" : BORDER}`, flexShrink: 0 }}>
                                            <div style={{ fontSize: 9, color: done ? "#86efac" : MUTED, marginBottom: 4 }}>{r.label}</div>
                                            {done ? (
                                                <>
                                                    <div style={{ fontSize: 14, color: "#22c55e", fontWeight: 800 }}>✓</div>
                                                    <div style={{ fontSize: 9, fontWeight: 700, color: "#22c55e" }}>Full</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700 }}>{hide ? "---" : fmtK(r.efAccum)}</div>
                                                    <div style={{ fontSize: 8, color: DIM }}>+{hide ? "---" : fmtK(r.efContrib)}</div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Milestones */}
                        <div style={{ ...cs }}>
                            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>🚀 Milestones ({stepUp}% step-up, {cagr}% CAGR)</div>
                            <div className="grid-cols-mobile" style={{ gap: 10 }}>
                                {milestones.map(m => (
                                    <div key={m.yr} style={{ background: CARD2, borderRadius: 10, padding: "12px 8px", textAlign: "center", border: `1px solid ${BORDER}` }}>
                                        <div style={{ fontSize: 9, color: DIM }}>Yr {m.yr}</div>
                                        <div style={{ fontSize: 18, fontWeight: 900, color: m.corpus >= 10000000 ? "#f59e0b" : "#22c55e", marginTop: 4 }}>{hide ? "---" : fmtK(m.corpus)}</div>
                                        <div style={{ fontSize: 9, color: DIM, marginTop: 4 }}>{hide ? "---" : fmt(m.sip)}/mo</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 12, fontSize: 8, color: DIM, textAlign: "center" }}>⚠ Estimates only · Not financial advice</div>
                        </div>
                    </div>
                )}

                {/* ALLOCATION */}
                {mainTab === "allocation" && (
                    <div>
                        <div style={{ ...cs, marginBottom: 12, padding: "16px 20px" }}>
                            <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center", marginBottom: 3 }}>Salary Split</div>
                            <div style={{ fontSize: 9, color: MUTED, textAlign: "center", marginBottom: 12, letterSpacing: 0.5 }}>OVERALL AVG</div>
                            <div style={{ display: "flex", justifyContent: "center" }}><PieChart data={overallPie} size={220} hideNums={hide} /></div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 12 }}>
                            {[{ title: "Phase 1 — Building EF", sub: `Apr → ${MONTHS_LIST[Math.max(0, p1Rows.length - 1)]?.label || "Aug '26"}`, pie: p1Full, sip: p1AvgSIP }, { title: "Phase 2 — Full SIP", sub: `${p2StartLabel} → Mar '27`, pie: p2Full, sip: p2AvgSIP }].map(({ title, sub, pie, sip }) => (
                                <div key={title} style={{ ...cs, padding: "20px" }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: title.includes("1") ? "#3b82f6" : "#8b5cf6", textAlign: "center", marginBottom: 4 }}>{title}</div>
                                    <div style={{ fontSize: 10, color: DIM, textAlign: "center", marginBottom: 16 }}>{sub}</div>
                                    <div style={{ display: "flex", justifyContent: "center" }}><PieChart data={pie} size={window.innerWidth < 640 ? 160 : 180} hideNums={hide} /></div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                            {[{ title: `MF Phase 1 (${hide ? "---" : fmt(p1AvgSIP)})`, pie: p1MFPie, sip: p1AvgSIP }, { title: `MF Phase 2 (${hide ? "---" : fmt(p2AvgSIP)})`, pie: p2MFPie, sip: p2AvgSIP }].map(({ title, pie, sip }) => (
                                <div key={title} style={{ ...cs, padding: "20px" }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>{title}</div>
                                    <div style={{ display: "flex", justifyContent: "center" }}><PieChart data={pie} size={window.innerWidth < 640 ? 150 : 170} hideNums={hide} /></div>
                                    <div style={{ marginTop: 20, borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
                                        {funds.map(f => (
                                            <div key={f.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                                                <span style={{ color: f.color }}>{f.shortName}</span>
                                                <span style={{ color: TEXT, fontWeight: 700 }}>{hide ? `${fundPcts[f.id] || 0}%` : fmt(Math.round(sip * (fundPcts[f.id] || 0) / 100))}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 12, fontSize: 8, color: DIM, textAlign: "center" }}>⚠ Estimates only · MF subject to market risk · Not financial advice</div>
                    </div>
                )}

                {/* TIMELINE */}
                {mainTab === "timeline" && (
                    <div>
                        <div style={{ overflowX: "auto", marginBottom: 12, borderRadius: 12, border: `1px solid ${BORDER}` }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                                <thead>
                                    <tr style={{ background: "rgba(10, 22, 40, 0.8)" }}>
                                        {["Month", "Ph", "Spends", "RD", "Base SIP", "EF+", "EF Bal", "Actual SIP", ""].map(h => (
                                            <th key={h} style={{ padding: "12px 10px", textAlign: h === "Month" ? "left" : "right", color: MUTED, fontWeight: 700, borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeline.map(r => (
                                        <tr key={r.key} style={{ borderBottom: `1px solid ${BORDER}`, background: r.overridden ? "rgba(59, 130, 246, 0.1)" : "transparent" }}>
                                            <td style={{ padding: "12px 10px", fontWeight: 700, color: r.phase === 2 ? "#60a5fa" : "#86efac", whiteSpace: "nowrap" }}>{r.overridden && <span style={{ color: "#f59e0b", fontSize: 10 }}>★ </span>}{r.label}</td>
                                            <td style={{ padding: "12px 10px", textAlign: "right" }}><span style={{ background: r.phase === 2 ? "#1d4ed8" : "#15803d", color: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: 10 }}>P{r.phase}</span></td>
                                            <td style={{ padding: "12px 10px", textAlign: "right", color: "#f97316" }}>{hide ? "---" : fmt(r.spends)}</td>
                                            <td style={{ padding: "12px 10px", textAlign: "right", color: "#22c55e" }}>{hide ? "---" : fmt(r.rd)}</td>
                                            <td style={{ padding: "12px 10px", textAlign: "right", color: "#3b82f6" }}>{hide ? "---" : fmt(r.sip)}</td>
                                            <td style={{ padding: "12px 10px", textAlign: "right", color: "#a78bfa" }}>{r.efContrib > 0 ? (hide ? "---" : fmt(r.efContrib)) : "–"}</td>
                                            <td style={{ padding: "12px 10px", textAlign: "right", color: "#8b5cf6", minWidth: 100 }}>
                                                <Bar value={r.efAccum} max={efTarget} color="#8b5cf6" h={5} />
                                                <span style={{ fontSize: 9 }}>{hide ? "---" : fmtK(r.efAccum)}</span>
                                            </td>
                                            <td style={{ padding: "12px 10px", textAlign: "right", color: "#22c55e", fontWeight: 700 }}>{hide ? "---" : fmt(r.totalSIP)}</td>
                                            <td style={{ padding: "12px 10px" }}><button onClick={() => { setSelMonth(r.key); setLeftTab("budget"); setSidebarOpen(true); }} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, cursor: "pointer" }}>Edit</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ ...cs, marginBottom: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Fund-wise SIP Allocation</div>
                            <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${BORDER}` }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                                    <thead style={{ background: "rgba(10, 22, 40, 0.8)" }}>
                                        <tr>
                                            <th style={{ padding: "10px 12px", textAlign: "left", color: MUTED, fontWeight: 700, borderBottom: `1px solid ${BORDER}` }}>Month</th>
                                            {funds.map(f => <th key={f.id} style={{ padding: "10px 12px", textAlign: "right", color: f.color, fontWeight: 700, borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" }}>{f.shortName}</th>)}
                                            <th style={{ padding: "10px 12px", textAlign: "right", color: MUTED, fontWeight: 700, borderBottom: `1px solid ${BORDER}` }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timeline.map(r => (
                                            <tr key={r.key} style={{ borderBottom: `1px solid ${BORDER}` }}>
                                                <td style={{ padding: "10px 12px", color: MUTED, whiteSpace: "nowrap" }}>{r.label}</td>
                                                {funds.map(f => <td key={f.id} style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: TEXT }}>{hide ? "---" : fmt(r.fundAllocs.find(a => a.id === f.id)?.amount || 0)}</td>)}
                                                <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#3b82f6" }}>{hide ? "---" : fmt(r.totalSIP)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="grid-cols-mobile" style={{ gap: 12 }}>
                            {[["Total MF", totalMF, "#3b82f6"], ["Total RD", totalRD, "#22c55e"], ["Total Saved", totalMF + totalRD, "#f59e0b"]].map(([l, v, c]) => (
                                <div key={l} style={{ ...cs, textAlign: "center", padding: 20 }}>
                                    <div style={{ fontSize: 11, color: DIM, marginBottom: 8 }}>{l}</div>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: c }}>{hide ? "---" : fmtK(v)}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 10, fontSize: 8, color: DIM, textAlign: "center" }}>⚠ Estimates only · MF subject to market risk · Not financial advice</div>
                    </div>
                )}

                {/* FUNDS */}
                {mainTab === "funds" && (
                    <div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                            {funds.map(f => {
                                const fp = fundPcts[f.id] || 0, fc = fundCagrs[f.id] || 12;
                                const tif = timeline.reduce((s, r) => s + (r.fundAllocs.find(a => a.id === f.id)?.amount || 0), 0);
                                let ec = 0, mS = Math.round(p2AvgSIP * fp / 100); const fr = fc / 100 / 12;
                                for (let yr = 0; yr < projYrs; yr++) { for (let mo = 0; mo < 12; mo++) { ec = ec * (1 + fr) + mS; } mS = Math.round(mS * (1 + stepUp / 100)); }
                                return (
                                    <div key={f.id} style={{ ...cs, padding: 14 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                                            <span style={{ width: 10, height: 10, borderRadius: 3, background: f.color, display: "inline-block" }} />
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 800, color: f.color }}>{f.name}</div>
                                                <div style={{ fontSize: 9, color: DIM }}>{f.type} · {f.sipDate} · {fc}% CAGR</div>
                                            </div>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                                            <div style={{ background: CARD2, borderRadius: 7, padding: 8, textAlign: "center" }}>
                                                <div style={{ fontSize: 8, color: DIM }}>Phase 1</div>
                                                <div style={{ fontSize: 14, fontWeight: 800, color: f.color }}>{hide ? "---" : fmt(Math.round(p1AvgSIP * fp / 100))}</div>
                                            </div>
                                            <div style={{ background: CARD2, borderRadius: 7, padding: 8, textAlign: "center" }}>
                                                <div style={{ fontSize: 8, color: DIM }}>Phase 2</div>
                                                <div style={{ fontSize: 14, fontWeight: 800, color: f.color }}>{hide ? "---" : fmt(Math.round(p2AvgSIP * fp / 100))}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
                                            <span style={{ color: MUTED }}>12-mo invested</span><b style={{ color: TEXT }}>{hide ? "---" : fmtK(tif)}</b>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 5 }}>
                                            <span style={{ color: MUTED }}>Allocation</span><b style={{ color: f.color }}>{fp}%</b>
                                        </div>
                                        <Bar value={fp} max={100} color={f.color} />
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${BORDER}` }}>
                                            <span style={{ color: MUTED }}>Est. {projYrs}Y corpus @{fc}%</span>
                                            <b style={{ color: "#22c55e" }}>{hide ? "---" : fmtK(Math.round(ec))}</b>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* RD Card */}
                        <div style={{ ...cs, padding: 14, marginBottom: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 3, background: "#22c55e", display: "inline-block" }} />
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: "#22c55e" }}>HDFC RD</div>
                                    <div style={{ fontSize: 9, color: DIM }}>12 mo @ {rdRate}%</div>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                                {[["Avg/mo", avgRD], ["Total", totalRD], ["Maturity", rdMaturity]].map(([l, v]) => (
                                    <div key={l} style={{ background: CARD2, borderRadius: 7, padding: 8, textAlign: "center" }}>
                                        <div style={{ fontSize: 8, color: DIM }}>{l}</div>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: "#22c55e" }}>{hide ? "---" : fmtK(v)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ fontSize: 8, color: DIM, textAlign: "center" }}>⚠ Estimates only · MF subject to market risk · Not financial advice</div>
                    </div>
                )}

                {/* PROJECTION */}
                {mainTab === "projection" && (
                    <div>
                        <div className="grid-cols-mobile" style={{ gap: 12, marginBottom: 16 }}>
                            {[[5, "#3b82f6"], [10, "#a78bfa"]].map(([y, c]) => {
                                const r = projection.find(p => p.yr === y);
                                return <div key={y} style={{ ...cs, textAlign: "center", padding: "20px 16px" }}>
                                    <div style={{ fontSize: 10, color: MUTED, fontWeight: 700 }}>{y}Y Projected Corpus</div>
                                    <div style={{ fontSize: 28, fontWeight: 900, color: c, margin: "8px 0" }}>{hide ? "---" : fmtK(r?.corpus || 0)}</div>
                                    <div style={{ fontSize: 11, color: DIM }}>With SIP of {hide ? "---" : fmtK(r?.monthly || 0)}/mo</div>
                                </div>;
                            })}
                        </div>
                        <div style={{ ...cs, marginBottom: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Year-by-Year Growth Details</div>
                            <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${BORDER}` }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                                    <thead style={{ background: "rgba(10, 22, 40, 0.8)" }}>
                                        <tr>
                                            <th style={{ padding: "12px 14px", textAlign: "left", color: MUTED, borderBottom: `1px solid ${BORDER}` }}>Year</th>
                                            {["SIP/mo", "Annual Inv", "Corpus", "+Growth"].map(h => <th key={h} style={{ padding: "12px 14px", textAlign: "right", color: MUTED, borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" }}>{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projection.map((r, i) => (
                                            <tr key={r.yr} style={{ borderBottom: `1px solid ${BORDER}`, background: [4, 9, 14, 19, 24].includes(i) ? "rgba(59, 130, 246, 0.05)" : "transparent" }}>
                                                <td style={{ padding: "12px 14px", fontWeight: 700, whiteSpace: "nowrap" }}>Year {r.yr}</td>
                                                <td style={{ padding: "12px 14px", textAlign: "right", color: "#60a5fa" }}>{hide ? "---" : fmtK(r.monthly)}</td>
                                                <td style={{ padding: "12px 14px", textAlign: "right", color: MUTED }}>{hide ? "---" : fmtK(r.monthly * 12)}</td>
                                                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: r.corpus >= 10000000 ? "#f59e0b" : "#22c55e" }}>{hide ? "---" : fmtK(r.corpus)}</td>
                                                <td style={{ padding: "12px 14px", textAlign: "right", color: "#a78bfa", fontSize: 10 }}>+{hide ? "---" : fmtK(r.corpus - (i > 0 ? projection[i - 1].corpus : 0))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div style={{ ...cs, marginBottom: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Step-Up Impact Analysis ({projYrs} yrs)</div>
                            <div className="grid-cols-mobile" style={{ gap: 12 }}>
                                {[0, 5, 10, 15].map(su => {
                                    let c2 = 0, m = p2AvgSIP; const rate = cagr / 100 / 12;
                                    for (let yr = 0; yr < projYrs; yr++) { for (let mo = 0; mo < 12; mo++) { c2 = c2 * (1 + rate) + m; } m = Math.round(m * (1 + su / 100)); }
                                    return <div key={su} style={{ background: su === stepUp ? "rgba(139, 92, 246, 0.2)" : CARD2, borderRadius: 12, padding: 16, textAlign: "center", border: su === stepUp ? "2px solid #8b5cf6" : `1px solid ${BORDER}` }}>
                                        <div style={{ fontSize: 11, color: DIM, fontWeight: 700 }}>{su}% Step-up</div>
                                        <div style={{ fontSize: 20, fontWeight: 900, color: su === stepUp ? "#22c55e" : TEXT, marginTop: 4 }}>{hide ? "---" : fmtK(Math.round(c2))}</div>
                                    </div>;
                                })}
                            </div>
                        </div>
                        <div style={{ fontSize: 8, color: DIM, textAlign: "center" }}>⚠ Estimates only · MF subject to market risk · Not financial advice</div>
                    </div>
                )}
            </div>
        </div>
    );
}