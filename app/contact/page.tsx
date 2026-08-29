import Navbar from "../../../components/Navbar";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="max-w-4xl mx-auto py-16 px-6">
        <h1 className="text-3xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-4">Contact & Appointments</h1>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="Full Name" className="bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm text-white w-full" />
              <input type="email" placeholder="Email Address" className="bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm text-white w-full" />
            </div>
            <input type="tel" placeholder="Phone Number" className="bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm text-white w-full" />
            <textarea placeholder="Your Message or Preferred Appointment Details" rows={4} className="bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm text-white w-full" />
            <button className="px-6 py-3 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition w-full">
              Submit Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}