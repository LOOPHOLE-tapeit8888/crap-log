"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrainFront,
  Clock,
  Ruler,
  AlertTriangle,
  Zap,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";

const STORAGE_KEY = "crap_log_onboarded";

const bristolTypes = [
  { val: 1, hex: "#EE352E", tc: "text-white", label: "Separate hard lumps", tip: "Severe constipation" },
  { val: 2, hex: "#FF6319", tc: "text-white", label: "Lumpy sausage", tip: "Mild constipation" },
  { val: 3, hex: "#FCCC0A", tc: "text-black", label: "Cracked sausage", tip: "Normal, slightly dry" },
  { val: 4, hex: "#00933C", tc: "text-white", label: "Smooth sausage", tip: "✅ Ideal" },
  { val: 5, hex: "#0039A6", tc: "text-white", label: "Soft blobs", tip: "Lacking fiber" },
  { val: 6, hex: "#B933AD", tc: "text-white", label: "Fluffy ragged", tip: "Mild diarrhea" },
  { val: 7, hex: "#996633", tc: "text-white", label: "Entirely liquid", tip: "Severe diarrhea" },
];

const colorMeanings = [
  { color: "#8B6914", label: "Brown", meaning: "Normal — healthy gut bacteria" },
  { color: "#FCCC0A", label: "Yellow", meaning: "Excess fat — possible malabsorption" },
  { color: "#1a7a1a", label: "Green", meaning: "Fast transit or lots of leafy greens" },
  { color: "#EE352E", label: "Red", meaning: "Fresh blood — consult a doctor" },
  { color: "#111111", border: "#555", label: "Black", meaning: "Old blood or iron supplements" },
  { color: "#f0e6d3", border: "#888", label: "Pale/Clay", meaning: "Bile duct issue — see a doctor" },
];

const strainLevels = [
  { label: "None", color: "#00933C", desc: "Effortless exit. Ideal." },
  { label: "Mild", color: "#FCCC0A", desc: "Slight push needed." },
  { label: "Moderate", color: "#FF6319", desc: "Noticeable effort required." },
  { label: "Severe", color: "#EE352E", desc: "Significant straining. Monitor closely." },
];

const symptomList = [
  { name: "Bloating", icon: "💨", tip: "Can signal food intolerance or slow transit." },
  { name: "Cramps", icon: "⚡", tip: "Often precede or accompany bowel movements." },
  { name: "Blood", icon: "🔴", tip: "Always worth tracking and reporting to a doctor." },
  { name: "Mucus", icon: "💧", tip: "Small amounts can be normal; large amounts, less so." },
  { name: "Nausea", icon: "🤢", tip: "May indicate gut inflammation or infection." },
  { name: "Pain", icon: "😣", tip: "Log the location and intensity over time." },
];

const slides = [
  "welcome",
  "bristol",
  "colors",
  "strain",
  "symptoms",
  "ready",
];

export default function OnboardingModal() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Check localStorage first (instant, no DB round-trip)
    const alreadyOnboarded = localStorage.getItem(STORAGE_KEY);
    if (!alreadyOnboarded) {
      // Small delay so dashboard renders first
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const markOnboarded = () => {
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const next = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setSlide((s) => Math.min(s + 1, slides.length - 1));
      setAnimating(false);
    }, 150);
  };

  const prev = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setSlide((s) => Math.max(s - 1, 0));
      setAnimating(false);
    }, 150);
  };

  const dismiss = () => {
    markOnboarded();
    setVisible(false);
  };

  const finish = () => {
    markOnboarded();
    setVisible(false);
    router.push("/log");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl bg-black border-t-[10px] border-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        {/* Header bar */}
        <div className="bg-black border-b-[4px] border-neutral-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <TrainFront size={28} className="text-[#FFD100]" />
            <span className="text-[#FFD100] font-extrabold text-lg uppercase tracking-widest">
              crap_log Transit Authority
            </span>
          </div>
          <button
            onClick={dismiss}
            className="text-neutral-500 hover:text-white transition-colors p-1"
          >
            <X size={22} />
          </button>
        </div>

        {/* Slide progress dots */}
        <div className="flex gap-2 px-6 pt-5 shrink-0">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-[4px] flex-1 transition-colors ${
                i <= slide ? "bg-[#FFD100]" : "bg-neutral-700"
              }`}
            />
          ))}
        </div>

        {/* Slide content */}
        <div
          className={`flex-1 overflow-y-auto px-6 py-8 transition-opacity duration-150 ${animating ? "opacity-0" : "opacity-100"}`}
        >
          {/* ── SLIDE 0: Welcome ── */}
          {slide === 0 && (
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-24 h-24 bg-[#FFD100] rounded-full flex items-center justify-center shadow-[0_0_0_8px_rgba(255,209,0,0.15)]">
                <TrainFront size={52} className="text-black" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-tight mb-4">
                  Welcome to<br />
                  <span className="text-[#FFD100]">crap_log</span> 🚇
                </h1>
                <p className="text-xl text-neutral-300 font-bold leading-relaxed">
                  Your private bowel movement tracker.
                </p>
              </div>
              <div className="bg-neutral-900 border-l-[6px] border-[#FFD100] p-5 text-left w-full">
                <p className="text-white font-bold text-lg leading-relaxed">
                  Log your movements quickly and get smart insights on your gut health.
                </p>
                <p className="text-neutral-400 font-bold text-sm mt-2 uppercase tracking-widest">
                  This quick guide explains each field so you log with confidence.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 w-full">
                {["🕑 30 sec to log", "📊 Smart scoring", "🔒 100% private"].map((t) => (
                  <div key={t} className="bg-neutral-900 border-[3px] border-neutral-700 p-3 text-center font-bold text-sm text-white">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SLIDE 1: Bristol Scale ── */}
          {slide === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-1">
                  Bristol Stool Scale
                </h2>
                <p className="text-neutral-400 font-bold text-sm uppercase tracking-wider">
                  The global medical standard for stool classification
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {bristolTypes.map((b) => (
                  <div key={b.val} className="flex items-center gap-4 bg-neutral-900 p-3 border-l-[4px]" style={{ borderLeftColor: b.hex }}>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl shrink-0 ${b.tc}`}
                      style={{ backgroundColor: b.hex }}
                    >
                      {b.val}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-extrabold text-base">{b.label}</p>
                      <p className="text-neutral-400 font-bold text-sm">{b.tip}</p>
                    </div>
                    {b.val === 4 && (
                      <CheckCircle2 size={22} className="text-[#00933C] shrink-0" />
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-[#00933C]/15 border-l-[6px] border-[#00933C] p-4">
                <p className="text-[#00933C] font-bold text-sm">
                  🎯 <strong>Target:</strong> Types 3–4 indicate a healthy, well-hydrated gut. Aim to stay in the green zone.
                </p>
              </div>
            </div>
          )}

          {/* ── SLIDE 2: Colors ── */}
          {slide === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-1">
                  Color Guide
                </h2>
                <p className="text-neutral-400 font-bold text-sm uppercase tracking-wider">
                  Color can be an early warning indicator
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {colorMeanings.map((c) => (
                  <div key={c.label} className="flex items-center gap-4 bg-neutral-900 p-4 border-[3px] border-neutral-800">
                    <div
                      className="w-10 h-10 rounded-full shrink-0 border-[3px]"
                      style={{ backgroundColor: c.color, borderColor: c.border || c.color }}
                    />
                    <div>
                      <p className="text-white font-extrabold">{c.label}</p>
                      <p className="text-neutral-400 font-bold text-sm">{c.meaning}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#EE352E]/15 border-l-[6px] border-[#EE352E] p-4">
                <p className="text-[#EE352E] font-bold text-sm">
                  ⚠️ <strong>Red or black stool?</strong> These can indicate bleeding. Consult a healthcare provider if persistent.
                </p>
              </div>
            </div>
          )}

          {/* ── SLIDE 3: Strain, Urgency, Duration ── */}
          {slide === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-1">
                  Strain, Urgency & Duration
                </h2>
                <p className="text-neutral-400 font-bold text-sm uppercase tracking-wider">
                  Effort metrics reveal transit health
                </p>
              </div>

              {/* Strain */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={20} className="text-[#FCCC0A]" />
                  <h3 className="text-xl font-extrabold text-white uppercase tracking-wide">Strain</h3>
                </div>
                <div className="flex flex-col gap-2">
                  {strainLevels.map((s) => (
                    <div key={s.label} className="flex items-center gap-3 bg-neutral-900 p-3 border-l-[4px]" style={{ borderLeftColor: s.color }}>
                      <span className="font-extrabold text-white text-base w-24 shrink-0">{s.label}</span>
                      <span className="text-neutral-400 font-bold text-sm">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Urgency */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={20} className="text-[#FF6319]" />
                  <h3 className="text-xl font-extrabold text-white uppercase tracking-wide">Urgency</h3>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { l: "Normal", d: "You could wait comfortably." },
                    { l: "Rushed", d: "Needed to go fairly quickly." },
                    { l: "Emergency", d: "Had to go immediately. Track patterns." },
                  ].map((u) => (
                    <div key={u.l} className="flex gap-3 bg-neutral-900 p-3 border-l-[4px] border-[#FF6319]">
                      <span className="font-extrabold text-white w-24 shrink-0">{u.l}</span>
                      <span className="text-neutral-400 font-bold text-sm">{u.d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration + Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-900 border-[3px] border-neutral-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={18} className="text-[#009EDB]" />
                    <h3 className="text-white font-extrabold uppercase tracking-wide">Duration</h3>
                  </div>
                  <p className="text-neutral-400 font-bold text-sm">
                    Log time in minutes. Over 10 min regularly can indicate constipation or phone distraction 📱
                  </p>
                </div>
                <div className="bg-neutral-900 border-[3px] border-neutral-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler size={18} className="text-[#B933AD]" />
                    <h3 className="text-white font-extrabold uppercase tracking-wide">Size</h3>
                  </div>
                  <p className="text-neutral-400 font-bold text-sm">
                    Small → Large → Huge. Track output volume to spot changes in diet or hydration.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── SLIDE 4: Symptoms ── */}
          {slide === 4 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-1">
                  Symptoms
                </h2>
                <p className="text-neutral-400 font-bold text-sm uppercase tracking-wider">
                  Select all that apply — patterns matter more than one-offs
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {symptomList.map((s) => (
                  <div key={s.name} className="bg-neutral-900 border-[3px] border-neutral-700 p-4 flex gap-3 items-start">
                    <span className="text-2xl shrink-0">{s.icon}</span>
                    <div>
                      <p className="text-white font-extrabold text-base">{s.name}</p>
                      <p className="text-neutral-400 font-bold text-sm">{s.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#0039A6]/20 border-l-[6px] border-[#0039A6] p-4">
                <p className="text-[#009EDB] font-bold text-sm">
                  💡 <strong>Pro tip:</strong> Even if a symptom seems minor, logging it consistently helps spot patterns your gut health score uses to alert you.
                </p>
              </div>
            </div>
          )}

          {/* ── SLIDE 5: Ready ── */}
          {slide === 5 && (
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-24 h-24 bg-[#00933C] rounded-full flex items-center justify-center shadow-[0_0_0_8px_rgba(0,147,60,0.15)]">
                <CheckCircle2 size={52} className="text-white" />
              </div>
              <div>
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-tight mb-4">
                  You&apos;re all set!
                </h2>
                <p className="text-xl text-neutral-300 font-bold leading-relaxed">
                  Start logging and your Gut Health Score will update automatically after 7+ entries.
                </p>
              </div>
              <div className="w-full flex flex-col gap-3">
                {[
                  "🎯 Type 4 Bristol is your north star",
                  "💧 Pale or black stool = see a doctor",
                  "⏱️ Under 10 min duration is healthy",
                  "📊 7-day frequency reveals your baseline",
                ].map((tip) => (
                  <div key={tip} className="bg-neutral-900 border-l-[6px] border-[#FCCC0A] px-4 py-3 text-left">
                    <p className="text-white font-bold">{tip}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={finish}
                className="w-full bg-[#FFD100] text-black font-black text-xl sm:text-2xl py-5 uppercase tracking-widest flex items-center justify-center gap-3 border-[4px] border-[#FFD100] hover:bg-white hover:border-white transition-colors mt-2"
              >
                <TrainFront size={28} />
                Got it — Log My First Movement!
              </button>
            </div>
          )}
        </div>

        {/* Navigation footer */}
        <div className="bg-black border-t-[4px] border-neutral-800 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            onClick={prev}
            disabled={slide === 0}
            className="flex items-center gap-2 text-neutral-400 hover:text-white font-bold uppercase tracking-widest text-sm disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={20} strokeWidth={3} /> Back
          </button>

          <span className="text-neutral-600 font-bold text-sm uppercase tracking-widest">
            {slide + 1} / {slides.length}
          </span>

          {slide < slides.length - 1 ? (
            <button
              onClick={next}
              className="flex items-center gap-2 text-[#FFD100] hover:text-white font-extrabold uppercase tracking-widest text-sm transition-colors"
            >
              Next <ChevronRight size={20} strokeWidth={3} />
            </button>
          ) : (
            <button
              onClick={dismiss}
              className="flex items-center gap-2 text-neutral-400 hover:text-white font-bold uppercase tracking-widest text-sm transition-colors"
            >
              Skip <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
