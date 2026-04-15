"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Camera, Check, PlaySquare, Square } from "lucide-react";

// MTA Style Bristol Scale mapping
const brisolScaleMTA = [
  { val: 1, bg: "bg-[#EE352E]", text: "text-white" }, // Red (1,2,3)
  { val: 2, bg: "bg-[#FF6319]", text: "text-white" }, // Orange (B,D,F,M)
  { val: 3, bg: "bg-[#FCCC0A]", text: "text-black" }, // Yellow (N,Q,R,W)
  { val: 4, bg: "bg-[#00933C]", text: "text-white" }, // Green (4,5,6)
  { val: 5, bg: "bg-[#0039A6]", text: "text-white" }, // Blue (A,C,E)
  { val: 6, bg: "bg-[#B933AD]", text: "text-white" }, // Purple (7)
  { val: 7, bg: "bg-[#996633]", text: "text-white" }, // Brown (J,Z)
];

const symptomList = ["Bloating", "Cramps", "Nausea", "Bleeding", "Pain", "Mucus", "Incomplete", "Tenemus"];

export default function LogPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  // Form Field State
  const [bristol, setBristol] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [duration, setDuration] = useState<number>(0);
  const [strain, setStrain] = useState("");
  const [urgency, setUrgency] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // UX State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
      else setUserId(user.id);
    });

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setTimestamp(now.toISOString().slice(0, 16));
  }, [router]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 60000); // 1 minute ticks
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const toggleSymptom = (sym: string) => {
    setSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    // Form Validation
    if (!bristol) {
      alert("Please select a Bristol Rating.");
      return;
    }
    if (!color) {
      alert("Please select a Color.");
      return;
    }
    if (!size) {
      alert("Please select a Size Volume.");
      return;
    }
    if (!strain) {
      alert("Please select a Strain Level.");
      return;
    }
    if (!urgency) {
      alert("Please select an Urgency level.");
      return;
    }

    setLoading(true);

    try {
      // Create record
      const { error } = await supabase.from("bowel_logs").insert({
        user_id: userId,
        timestamp: new Date(timestamp).toISOString(),
        bristol_type: bristol,
        color: color || null,
        size: size || null,
        duration_minutes: duration,
        strain: strain || null,
        urgency: urgency || null,
        symptoms: symptoms,
        notes: notes || null,
      });

      if (error) throw error;
      
      // Note: We skip actual Storage upload here because a bucket was not specified in the SQL schema setup. 
      // If a 'photos' bucket exists, you would upload the file here:
      // if (file) await supabase.storage.from('photos').upload(`${userId}/${Date.now()}_${file.name}`, file);

      alert("Log Entry Submitted successfully!");
      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      alert("Error submitting log: " + message);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white text-3xl font-bold uppercase tracking-widest">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-300 pb-12 sm:p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Main Station Header */}
        <div className="bg-black text-white p-6 sm:p-10 border-t-[12px] border-white shadow-2xl flex flex-col justify-end min-h-[160px] relative">
          <div className="absolute top-4 right-4 flex gap-2">
            {[4, 5, 6].map(num => (
              <div key={num} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#00933C] text-white flex items-center justify-center font-bold text-lg sm:text-xl shrink-0">
                {num}
              </div>
            ))}
          </div>
          <h1 
            className="text-5xl sm:text-7xl font-extrabold tracking-tighter"
            style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: '-0.04em' }}
          >
            33 St - Log Entry
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 px-4 sm:px-0">
          
          {/* Bristol Scale Section */}
          <div className="bg-black text-white p-6 sm:p-8 border-t-[8px] border-white shadow-xl">
            <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-tighter mb-8 flex justify-between items-center">
              Bristol Rating
            </h2>
            <div className="flex justify-between items-center bg-neutral-900 rounded-full sm:px-6 py-6 sm:py-8 border-4 border-neutral-800">
              {brisolScaleMTA.map((item) => {
                const isSelected = bristol === item.val;
                return (
                  <button
                    type="button"
                    key={item.val}
                    onClick={() => setBristol(item.val)}
                    className={`relative rounded-full aspect-square w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center font-extrabold text-2xl sm:text-4xl transition-all shrink-0
                      ${item.bg} ${item.text} 
                      ${isSelected ? 'ring-[6px] ring-white scale-125 z-10' : 'opacity-80 hover:opacity-100'}
                    `}
                  >
                    {item.val}
                    {isSelected && (
                      <div className="absolute -bottom-2 -right-2 bg-white text-black rounded-full border-2 border-black p-0.5 z-20">
                        <Check size={16} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Timestamp & Timer */}
            <div className="bg-black text-white p-6 sm:p-8 border-t-[8px] border-white shadow-xl flex flex-col gap-6">
              <div>
                <label className="block text-xl font-bold uppercase tracking-wide mb-2 text-neutral-300">Time of Arrival</label>
                <input 
                  type="datetime-local" 
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full bg-white text-black font-bold text-xl p-4 border-[4px] border-neutral-400 focus:outline-none focus:border-[#FCCC0A]" 
                  required
                />
              </div>

              <div>
                <label className="block text-xl font-bold uppercase tracking-wide mb-2 text-neutral-300">Transit Duration</label>
                <div className="flex items-center gap-4 bg-neutral-800 p-4 border-[4px] border-neutral-600">
                  <div className="flex-1 font-mono text-5xl font-extrabold tracking-tighter">
                    {duration} <span className="text-2xl">MIN</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="p-3 bg-neutral-600 hover:bg-neutral-500 rounded-full text-white" onClick={() => setDuration(Math.max(0, duration - 1))}>-</button>
                    <button type="button" className="p-3 bg-neutral-600 hover:bg-neutral-500 rounded-full text-white" onClick={() => setDuration(duration + 1)}>+</button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`mt-4 w-full p-4 flex items-center justify-center gap-2 font-bold text-xl uppercase border-4 transition-colors ${
                    isTimerRunning 
                      ? 'bg-[#EE352E] text-white border-[#EE352E] hover:bg-white hover:text-[#EE352E]' 
                      : 'bg-white text-black border-white hover:bg-neutral-200'
                  }`}
                >
                  {isTimerRunning ? <Square fill="currentColor" /> : <PlaySquare fill="currentColor" />}
                  {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
                </button>
              </div>
            </div>

            {/* Properties Dropdowns */}
            <div className="bg-black text-white p-6 sm:p-8 border-t-[8px] border-white shadow-xl flex flex-col gap-6">
              
              <div>
                <label className="block text-xl font-bold uppercase tracking-wide mb-2 text-neutral-300">Color</label>
                <select 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full bg-white text-black font-bold text-xl p-4 border-[4px] border-neutral-400 focus:outline-none focus:border-[#0039A6]"
                >
                  <option value="">-- SELECT --</option>
                  <option value="Brown">BROWN</option>
                  <option value="Green">GREEN</option>
                  <option value="Yellow">YELLOW</option>
                  <option value="Black">BLACK</option>
                  <option value="Red">RED</option>
                  <option value="Pale/Clay">PALE/CLAY</option>
                </select>
              </div>

              <div>
                <label className="block text-xl font-bold uppercase tracking-wide mb-2 text-neutral-300">Size Volume</label>
                <select 
                  value={size} 
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-white text-black font-bold text-xl p-4 border-[4px] border-neutral-400 focus:outline-none focus:border-[#FF6319]"
                >
                  <option value="">-- SELECT --</option>
                  <option value="Small">SMALL</option>
                  <option value="Medium">MEDIUM</option>
                  <option value="Large">LARGE</option>
                  <option value="Huge">HUGE</option>
                </select>
              </div>
              
            </div>

          </div>

          {/* Strain and Urgency */}
          <div className="bg-black text-white p-6 sm:p-8 border-t-[8px] border-white shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
               <label className="block text-xl font-bold uppercase tracking-wide mb-2 text-neutral-300">Strain Level</label>
                <select 
                  value={strain} 
                  onChange={(e) => setStrain(e.target.value)}
                  className="w-full bg-black text-white border-[4px] border-white font-bold text-xl p-4 uppercase focus:outline-none focus:bg-white focus:text-black transition-colors"
                >
                  <option value="">-- SELECT --</option>
                  <option value="None">None</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
            </div>
            <div>
               <label className="block text-xl font-bold uppercase tracking-wide mb-2 text-neutral-300">Urgency</label>
                <select 
                  value={urgency} 
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full bg-black text-white border-[4px] border-white font-bold text-xl p-4 uppercase focus:outline-none focus:bg-white focus:text-black transition-colors"
                >
                  <option value="">-- SELECT --</option>
                  <option value="Normal">Normal</option>
                  <option value="Rushed">Rushed</option>
                  <option value="Emergency">Emergency</option>
                </select>
            </div>
          </div>

          {/* Symptoms */}
          <div className="bg-black text-white p-6 sm:p-8 border-t-[8px] border-white shadow-xl">
            <label className="block text-2xl font-bold uppercase tracking-wide mb-4 text-white">Symptoms</label>
            <div className="flex flex-wrap gap-3">
              {symptomList.map(sym => {
                const isActive = symptoms.includes(sym);
                return (
                  <button
                    type="button"
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`px-5 py-3 border-[4px] text-lg sm:text-xl font-extrabold uppercase transition-colors
                      ${isActive ? 'bg-[#EE352E] text-white border-[#EE352E]' : 'bg-black text-white border-white hover:bg-neutral-800'}
                    `}
                  >
                    {sym}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes & Photo */}
          <div className="bg-black text-white p-6 sm:p-8 border-t-[8px] border-white shadow-xl space-y-6">
            <div>
              <label className="block text-xl font-bold uppercase tracking-wide mb-2 text-neutral-300">Incident Notes</label>
              <textarea 
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ANY ADDITIONAL DETAILS..."
                className="w-full bg-neutral-900 border-[4px] border-neutral-600 text-white font-bold p-4 text-xl placeholder:text-neutral-500 focus:outline-none focus:border-white focus:bg-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-xl font-bold uppercase tracking-wide mb-2 text-neutral-300 flex items-center gap-2">
                <Camera size={24} /> Attach Evidence (Photo)
              </label>
              <div className="w-full border-[4px] border-dashed border-neutral-600 p-6 flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 transition-colors relative cursor-pointer group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="font-bold text-xl uppercase tracking-widest text-[#FCCC0A] group-hover:text-white">
                  {file ? file.name : "Tap to Upload"}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button (MetroCard Style) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFD100] text-black font-extrabold text-2xl sm:text-3xl p-6 flex justify-center items-center gap-4 uppercase tracking-widest border-[6px] border-black hover:bg-white transition-colors disabled:opacity-50 shadow-[8px_8px_0_rgba(0,0,0,1)] hover:translate-y-[4px] hover:shadow-[4px_4px_0_rgba(0,0,0,1)] active:translate-y-[8px] active:shadow-none"
          >
             <span className="tracking-[0.2em] sm:tracking-[0.4em]">{`<<<<<<<<`}</span>
             <span className="shrink-0">Submit Entry</span>
          </button>
          <div className="h-4"></div>
        </form>

      </div>
    </div>
  );
}
