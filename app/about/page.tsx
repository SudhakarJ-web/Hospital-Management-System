import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="max-w-5xl mx-auto py-16 px-6">
        <h1 className="text-3xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-4">About Gavane Hospital</h1>
        <p className="text-slate-300 leading-relaxed mb-6">
          Gavane Hospital & Research Centre is a premier multi-specialty medical center providing integrated, accessible, and high-quality patient care.
        </p>
        <div className="grid md:grid-cols-2 gap-8 my-10">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <h2 className="text-xl font-bold text-cyan-400 mb-2">Our Mission</h2>
            <p className="text-xs text-slate-400">To deliver compassionate, ethical, and world-class healthcare solutions to every patient.</p>
          </div>
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <h2 className="text-xl font-bold text-cyan-400 mb-2">Our Vision</h2>
            <p className="text-xs text-slate-400">To lead clinical excellence through continuous medical innovation and community service.</p>
          </div>
        </div>
      </div>
    </div>
  );
}