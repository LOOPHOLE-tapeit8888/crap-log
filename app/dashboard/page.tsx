"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import OnboardingModal from "../components/OnboardingModal";
import {
  TrainFront,
  TrendingUp,
  TrendingDown,
  BellRing,
  Activity,
  AlertTriangle,
  Droplets,
  Plus,
  ChevronRight,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  calculateGutHealthScore,
} from "../lib/calculations";
import type { LogEntry } from "../lib/calculations";

/* ─── MTA Line Colors mapped to Bristol 1–7 ─── */
const bristolMTA = [
  { val: 1, label: "1", hex: "#EE352E", bg: "bg-[#EE352E]", tc: "text-white" },
  { val: 2, label: "2", hex: "#FF6319", bg: "bg-[#FF6319]", tc: "text-white" },
  { val: 3, label: "3", hex: "#FCCC0A", bg: "bg-[#FCCC0A]", tc: "text-black" },
  { val: 4, label: "4", hex: "#00933C", bg: "bg-[#00933C]", tc: "text-white" },
  { val: 5, label: "5", hex: "#0039A6", bg: "bg-[#0039A6]", tc: "text-white" },
  { val: 6, label: "6", hex: "#B933AD", bg: "bg-[#B933AD]", tc: "text-white" },
  { val: 7, label: "7", hex: "#996633", bg: "bg-[#996633]", tc: "text-white" },
];

/* ─── Helper: format a date string into a subway-style label ─── */
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return { day, time };
};

/* ─── Helper: station name from log data ─── */
/* ─── Component ─── */
export default function DashboardPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  /* Auth gate */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
      else fetchLogs(user.id);
    });
  }, [router]);

  const fetchLogs = async (uid: string) => {
    const { data } = await supabase
      .from("bowel_logs")
      .select("*")
      .eq("user_id", uid)
      .order("timestamp", { ascending: false });
    if (data) setLogs(data);
    setLoading(false);
  };

  /* ─── Derived data ─── */
  const score = calculateGutHealthScore(logs);

  // Trend: compare first-half vs second-half score of recent 30
  const halfLen = Math.floor(Math.min(logs.length, 30) / 2);
  const olderScore = halfLen > 6 ? calculateGutHealthScore(logs.slice(halfLen, halfLen * 2)) : score;
  const trend = score > olderScore ? "up" : score < olderScore ? "down" : "flat";

  /* 7-day frequency */
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    return {
      name: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      count: logs.filter((l) => l.timestamp?.startsWith(key)).length,
    };
  });

  /* Bristol pie */
  const bristolBuckets: Record<number, number> = {};
  logs.forEach((l) => {
    if (l.bristol_type) bristolBuckets[l.bristol_type] = (bristolBuckets[l.bristol_type] || 0) + 1;
  });
  const pieData = Object.entries(bristolBuckets).map(([k, v]) => ({
    name: `Type ${k}`,
    value: v,
    fill: bristolMTA.find((b) => b.val === Number(k))?.hex ?? "#555",
  }));

  /* Alerts */
  const alerts: { text: string; level: "red" | "yellow" | "green" }[] = [];
  if (logs.length > 0) {
    const latest = logs[0];
    if (latest.bristol_type && latest.bristol_type >= 6)
      alerts.push({ text: "TYPE 6/7 DETECTED — POSSIBLE DIARRHEA. HYDRATE IMMEDIATELY.", level: "red" });
    if (latest.bristol_type && latest.bristol_type <= 2)
      alerts.push({ text: "TYPE 1/2 DETECTED — CONSTIPATION ALERT. INCREASE FIBER.", level: "red" });
    if (latest.symptoms?.includes("Blood"))
      alerts.push({ text: "BLOOD IN STOOL REPORTED — CONSULT A PHYSICIAN.", level: "red" });
    if (latest.symptoms?.includes("Mucus"))
      alerts.push({ text: "MUCUS PRESENT — MONITOR CLOSELY.", level: "yellow" });
    if (latest.strain === "Severe")
      alerts.push({ text: "SEVERE STRAIN REPORTED — REVIEW DIET & HYDRATION.", level: "yellow" });
  }
  if (alerts.length === 0)
    alerts.push({ text: "ALL SYSTEMS NOMINAL. TRANSIT FLOW OPTIMIZED.", level: "green" });

  const recentLogs = logs.slice(0, 6);

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col gap-4 items-center justify-center">
        <TrainFront size={64} className="text-[#FFD100] animate-pulse" />
        <p className="text-white text-2xl font-extrabold tracking-[0.3em] uppercase">Entering Station…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white selection:bg-[#FFD100] selection:text-black" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <OnboardingModal />

      {/* ════════════════════════════════════════════════════════
          YELLOW CRAPCARD — MetroCard style hero
         ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#FFD100]">
        {/* Stripe curves */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 right-20 top-[110px] sm:top-[130px] bottom-0">
            <div className="absolute inset-0 border-t-[36px] sm:border-t-[48px] border-r-[36px] sm:border-r-[48px] border-[#009EDB] rounded-tr-[70px] sm:rounded-tr-[100px]" />
            <div className="absolute top-[36px] sm:top-[48px] right-[36px] sm:right-[48px] left-0 bottom-0 border-t-[36px] sm:border-t-[48px] border-r-[36px] sm:border-r-[48px] border-[#F47321] rounded-tr-[34px] sm:rounded-tr-[52px]" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-8 pb-0 flex flex-col">
          {/* Top bar: title + logo */}
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-5xl sm:text-7xl font-black text-black tracking-[-0.06em] leading-none">
              crap_log
            </h1>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-full flex items-center justify-center shrink-0 shadow-[0_0_0_5px_#FFD100]">
              <TrainFront className="text-white w-10 h-10 sm:w-12 sm:h-12" />
            </div>
          </div>

          {/* Score area */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 pb-8 sm:pb-10">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-lg sm:text-xl font-extrabold text-black/60 uppercase tracking-widest">Gut Health Score</span>
              <div className="flex items-end gap-4">
                <span className="text-[120px] sm:text-[180px] font-black text-black leading-none tracking-[-0.05em]">
                  {score}
                </span>
                <div className="mb-4 sm:mb-8">
                  {trend === "up" && <TrendingUp size={48} className="text-[#00933C]" strokeWidth={4} />}
                  {trend === "down" && <TrendingDown size={48} className="text-[#EE352E]" strokeWidth={4} />}
                  {trend === "flat" && <Activity size={48} className="text-black" strokeWidth={3} />}
                </div>
              </div>
              {logs.length < 7 && (
                <span className="text-sm font-bold text-black bg-white/70 px-3 py-1 uppercase tracking-wide -mt-2">
                  Log 7+ entries for full accuracy
                </span>
              )}
            </div>

            {/* Right-side indicator circle */}
            <div className="hidden sm:flex flex-col items-center gap-2 mb-6">
              <div className="w-36 h-36 rounded-full bg-black flex flex-col items-center justify-center border-[6px] border-black shadow-[0_0_0_6px_white]">
                <Activity size={40} className="text-[#FFD100] stroke-[3px] mb-1" />
                <span className="text-[#FFD100] text-4xl font-black">{score}</span>
              </div>
              <span className="text-xs font-extrabold text-black uppercase tracking-widest">Score</span>
            </div>
          </div>
        </div>

        {/* Black magnetic stripe */}
        <div className="bg-black w-full px-6 sm:px-10 py-4 flex items-center justify-between relative z-20">
          <span className="text-[#FFD100] font-extrabold text-lg sm:text-xl tracking-[0.4em] uppercase">
            {"<<<<<<<<"}
          </span>
          <button onClick={() => router.push("/log")} className="flex items-center gap-2 text-[#FFD100] font-extrabold text-lg sm:text-xl uppercase tracking-wider hover:text-white transition-colors">
            <Plus size={22} strokeWidth={4} /> New Log Entry
          </button>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          MAIN CONTENT GRID
         ════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

          {/* 7-Day Frequency Line Chart */}
          <div className="bg-black border-t-[10px] border-white p-6 sm:p-8 shadow-2xl min-h-[380px] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#009EDB] text-white flex items-center justify-center font-extrabold text-xl shrink-0">7</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase">Day Activity</h2>
            </div>
            <div className="flex-1 w-full min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last7}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#fff" tick={{ fill: "#fff", fontWeight: 700, fontSize: 14 }} />
                  <YAxis stroke="#555" tick={{ fill: "#888", fontWeight: 700 }} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "#FFD100", border: "4px solid black", fontWeight: 800, color: "black", textTransform: "uppercase" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#FFD100"
                    strokeWidth={4}
                    dot={{ fill: "#FFD100", stroke: "#000", strokeWidth: 3, r: 7 }}
                    activeDot={{ r: 10, fill: "#fff", stroke: "#FFD100", strokeWidth: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bristol Pie Chart */}
          <div className="bg-black border-t-[10px] border-white p-6 sm:p-8 shadow-2xl min-h-[380px] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#FF6319] text-white flex items-center justify-center font-extrabold text-xl shrink-0">B</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase">Bristol Types</h2>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-[260px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={55} paddingAngle={3} strokeWidth={0}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} stroke="#000" strokeWidth={4} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: "#000", border: "3px solid #fff", fontWeight: 800, color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-neutral-600 font-extrabold text-2xl uppercase tracking-widest border-4 border-dashed border-neutral-700 px-10 py-8 text-center">
                  No Data Yet
                </div>
              )}
            </div>
            {/* Legend row */}
            {pieData.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t-2 border-neutral-800">
                {bristolMTA.map((b) => (
                  <div key={b.val} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${b.bg} ${b.tc} text-xs font-bold flex items-center justify-center`}>{b.val}</div>
                    <span className="text-sm font-bold text-neutral-400">Type {b.val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Row: Alerts + Recent Logs ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-6 xl:gap-8">

          {/* Alerts Panel */}
          <div className="bg-black border-t-[10px] border-[#EE352E] p-6 sm:p-8 shadow-2xl flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <BellRing size={32} className="text-[#EE352E]" />
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase">Service Alerts</h2>
            </div>
            <div className="flex flex-col gap-4 flex-1">
              {alerts.map((a, i) => (
                <div
                  key={i}
                  className={`p-4 font-bold text-lg leading-snug tracking-wide border-l-[8px] ${
                    a.level === "red"
                      ? "border-[#EE352E] bg-[#EE352E]/10 text-[#EE352E]"
                      : a.level === "yellow"
                        ? "border-[#FCCC0A] bg-[#FCCC0A]/10 text-[#FCCC0A]"
                        : "border-[#00933C] bg-[#00933C]/10 text-[#00933C]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {a.level === "red" && <AlertTriangle size={22} className="shrink-0 mt-0.5" />}
                    {a.level === "yellow" && <Droplets size={22} className="shrink-0 mt-0.5" />}
                    {a.level === "green" && <Activity size={22} className="shrink-0 mt-0.5" />}
                    <span>{a.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Logs — Subway Station Panels */}
          <div className="flex flex-col gap-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TrainFront size={36} className="text-[#FFD100]" />
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase text-white">Recent Logs</h2>
              </div>
              {logs.length > 6 && (
                <button className="text-[#FCCC0A] text-sm font-extrabold uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
                  View All <ChevronRight size={16} strokeWidth={4} />
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="bg-black border-t-[10px] border-neutral-600 p-10 text-center">
                <p className="text-neutral-500 font-extrabold text-2xl uppercase tracking-widest">No Entries</p>
                <p className="text-neutral-600 font-bold mt-2">Tap + New Log Entry above to begin tracking.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {recentLogs.map((log, idx) => {
                  const bristolConf = bristolMTA.find((b) => b.val === log.bristol_type);
                  const { day, time } = fmtDate(log.timestamp || new Date().toISOString());
                  /* Alternate a thick white / thin grey border for visual variety */
                  const isThick = idx % 3 === 0;

                  return (
                    <div
                      key={log.id}
                      className={`bg-black p-5 sm:p-6 flex flex-col justify-end border-t-[${isThick ? "10" : "6"}px] ${
                        isThick ? "border-white" : "border-neutral-700"
                      } hover:bg-neutral-900 transition-colors cursor-default group`}
                      style={{ borderTopWidth: isThick ? 10 : 6 }}
                    >
                      {/* Station name */}
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] leading-tight mb-3 group-hover:text-[#FFD100] transition-colors">
                        {day} – {time}
                      </h3>

                      {/* Line circles */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Bristol circle */}
                        {bristolConf && (
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-lg shadow-md ${bristolConf.bg} ${bristolConf.tc}`}
                          >
                            {bristolConf.val}
                          </div>
                        )}

                        {/* Secondary info pills */}
                        {log.color && (
                          <div className="h-10 rounded-full bg-white text-black font-bold px-4 flex items-center text-sm uppercase tracking-wider border-[3px] border-black">
                            {log.color}
                          </div>
                        )}
                        {log.size && (
                          <div className="h-10 rounded-full bg-neutral-800 text-white font-bold px-4 flex items-center text-sm uppercase tracking-wider border-[3px] border-neutral-600">
                            {log.size}
                          </div>
                        )}
                        {log.duration_minutes !== undefined && log.duration_minutes !== null && log.duration_minutes > 0 && (
                          <div className="h-10 rounded-full bg-neutral-800 text-white font-bold px-4 flex items-center text-sm uppercase tracking-wider border-[3px] border-neutral-600">
                            {log.duration_minutes}m
                          </div>
                        )}
                        {log.strain && log.strain !== "None" && (
                          <div className={`h-10 rounded-full font-bold px-4 flex items-center text-sm uppercase tracking-wider border-[3px] ${
                            log.strain === "Severe" ? "bg-[#EE352E]/20 text-[#EE352E] border-[#EE352E]" : "bg-[#FCCC0A]/20 text-[#FCCC0A] border-[#FCCC0A]"
                          }`}>
                            {log.strain}
                          </div>
                        )}
                        {log.symptoms && log.symptoms.length > 0 && (
                          <div className="w-10 h-10 rounded-full bg-[#EE352E] text-white flex items-center justify-center font-extrabold text-base shadow-md">
                            S!
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer stripe */}
      <div className="bg-black border-t-4 border-neutral-800 py-6 text-center">
        <span className="text-neutral-600 font-extrabold text-sm uppercase tracking-[0.5em]">
          {"<<<<<<<< CRAP_LOG TRANSIT AUTHORITY <<<<<<<<"}
        </span>
      </div>
    </div>
  );
}
