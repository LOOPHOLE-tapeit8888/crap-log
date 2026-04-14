import { Activity, TrainFront, ShieldAlert, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto space-y-8">
      <header className="mb-12">
        <h1 className="text-6xl tracking-tighter uppercase mb-4 flex items-center gap-4">
          <TrainFront size={56} className="text-white" />
          Crap Log
        </h1>
        <p className="text-xl text-gray-400 font-normal">A robust developer log on the rails.</p>
      </header>

      <section className="grid gap-6">
        <div className="subway-sign subway-line-a text-2xl">
          <Activity size={32} />
          <span>System Status: Operational</span>
        </div>

        <div className="subway-sign subway-line-1 items-start">
          <Zap size={32} className="shrink-0 mt-1" />
          <div>
            <div className="text-xl mb-2">Notice: Track Work</div>
            <div className="text-sm font-normal text-gray-300">
              Weekend work is expected on the frontend line.
              Please expect delays.
            </div>
          </div>
        </div>
        
        <div className="subway-sign subway-line-n text-xl">
          <ShieldAlert size={28} />
          <span>Security Notice: Ensure to lock terminal payload doors</span>
        </div>
      </section>
    </main>
  );
}
