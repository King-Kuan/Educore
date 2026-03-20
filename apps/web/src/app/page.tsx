import {
  BookOpen, BarChart3, Users, Calendar, FileText,
  Wifi, WifiOff, Shield, CheckCircle2, ArrowRight,
  GraduationCap, Smartphone, Star, ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Marks & Grading",
    desc: "Enter CA and exam scores per subject. Automatic grade calculation using Rwanda's 7-grade scale (A–F). Lock marks per term.",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Official Report Cards",
    desc: "Generate progressive and annual reports matching Ministry of Education format. Download as PDF, one student or bulk per class.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Student Management",
    desc: "Import students from CSV, manage enrolment, assign to classes, track status. Student IDs include academic year automatically.",
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Timetable Builder",
    desc: "Build weekly timetables visually. Assign subjects, teachers and rooms per slot. Manage all 3 terms separately.",
  },
  {
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: "Attendance Tracking",
    desc: "Record daily attendance per class. Teachers mark present, absent, late or excused. Attendance summaries on every report.",
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Offline Teacher App",
    desc: "Teachers install the PWA once. Works offline — marks and attendance saved locally, synced automatically when online.",
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: "All School Levels",
    desc: "Nursery (descriptors only), Lower Primary, Upper Primary, O-Level, A-Level. Custom levels with your own grading rules.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Role-Based Access",
    desc: "Superadmin → Principal → Deputy → Teacher hierarchy. Deputies get custom permissions chosen by the principal.",
  },
];

const STEPS = [
  { num: "01", title: "We create your school", desc: "Contact us and we set up your school account. Your principal gets a welcome email with login credentials instantly." },
  { num: "02", title: "Principal sets up school", desc: "Add teachers, create classes and levels, set subject maxima, build the timetable — all in the web dashboard." },
  { num: "03", title: "Teachers start working", desc: "Teachers log in to the app once. It installs on their phone. They enter marks and attendance even without internet." },
  { num: "04", title: "Generate reports", desc: "At end of term, principal locks marks and downloads report cards for every student in one click." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Rwanda flag stripe */}
      <div className="h-1 flex">
        <div className="flex-[2] bg-rw-green" style={{ background: "#20603D" }} />
        <div className="flex-1" style={{ background: "#FAD201" }} />
        <div className="flex-1" style={{ background: "#00A1DE" }} />
      </div>

      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1a3a2a" }}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">EduCore <span className="font-normal text-gray-400">RW</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
          <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#how" className="hover:text-gray-900 transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          <a href="#contact" className="hover:text-gray-900 transition-colors">Contact</a>
        </div>
        <a
          href={process.env.NEXT_PUBLIC_ADMIN_URL ?? "/login"}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg"
          style={{ background: "#1a3a2a" }}
        >
          Sign in →
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-medium text-green-700 mb-6">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Republic of Rwanda · Ministry of Education aligned
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-none mb-6">
          The school OS<br />
          <span style={{ color: "#1a3a2a" }}>Rwanda</span> deserves.
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          One platform for marks, official report cards, timetables, attendance, and teacher coordination.
          Works offline. Built for Rwandan schools.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href="#contact"
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: "#1a3a2a" }}
          >
            Get your school started <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#features"
            className="px-6 py-3 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            See all features
          </a>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { val: "3", label: "Terms per year" },
            { val: "7", label: "Grade levels (A–F)" },
            { val: "100%", label: "Offline capable" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-gray-900">{s.val}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Everything a school needs
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From the first day of Term 1 to downloading annual report cards — one system handles it all.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-white" style={{ background: "#1a3a2a" }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report card highlight */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#1a3a2a" }}>
              Official report cards
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-5">
              Progressive & annual<br />reports — MoE format.
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Report cards match Rwanda Ministry of Education layout exactly — CA + Exam columns, conduct out of 40,
              7-grade scale, class position, First Decision / Final Decision for annual reports.
              Generate one student or all 42 in one click.
            </p>
            <ul className="space-y-3">
              {[
                "A, B, C, D, E, S, F grading scale",
                "Separate CA and Exam columns",
                "Conduct out of 40 included in total",
                "Class ranking and position",
                "Nursery: descriptor-only, no numbers",
                "Annual: Promoted / 2nd Sitting / Repeat",
                "PDF download — one or bulk per class",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Report card preview mockup */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm text-xs">
              {/* Mini report header */}
              <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#1a3a2a" }}>
                <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-xs">GS</div>
                <div className="text-center flex-1">
                  <div className="text-white font-bold text-xs tracking-wide">GROUPE SCOLAIRE KACYIRU</div>
                  <div className="text-white/60 text-[10px]">PROGRESSIVE REPORT — TERM 2 · 2025–2026</div>
                </div>
              </div>
              {/* Student row */}
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-[10px] flex gap-6">
                <div><span className="text-gray-400">NAME: </span><span className="font-bold">KAMANZI Mugisha Eric</span></div>
                <div><span className="text-gray-400">CLASS: </span><span className="font-bold">P5 A</span></div>
              </div>
              {/* Marks table */}
              <table className="w-full text-[9px] border-collapse">
                <thead>
                  <tr style={{ background: "#1a3a2a" }}>
                    {["Subject","CA","Max","Exam","Max","Tot","Max","%","Gr"].map((h) => (
                      <th key={h} className="text-white/80 font-medium px-1.5 py-1 text-center">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Mathematics","26","30","60","70","86","100","86%","A"],
                    ["English","22","30","52","70","74","100","74%","B"],
                    ["Kinyarwanda","28","30","63","70","91","100","91%","A"],
                    ["SET","20","30","48","70","68","100","68%","B"],
                    ["Social Studies","24","30","55","70","79","100","79%","B"],
                  ].map(([subj, ...rest], i) => (
                    <tr key={subj} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-1.5 py-1 font-medium">{subj}</td>
                      {rest.map((v, j) => (
                        <td key={j} className={`px-1.5 py-1 text-center font-mono ${j === 7 ? (v === "A" ? "text-green-700 font-bold" : "text-blue-700 font-bold") : "text-gray-600"}`}>{v}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold border-t border-gray-200">
                    <td className="px-1.5 py-1">Total</td>
                    <td className="px-1.5 py-1 text-center font-mono">120</td>
                    <td className="px-1.5 py-1 text-center font-mono text-gray-400">150</td>
                    <td className="px-1.5 py-1 text-center font-mono">278</td>
                    <td className="px-1.5 py-1 text-center font-mono text-gray-400">350</td>
                    <td className="px-1.5 py-1 text-center font-mono">398</td>
                    <td className="px-1.5 py-1 text-center font-mono text-gray-400">500</td>
                    <td className="px-1.5 py-1 text-center font-mono text-green-700 font-bold">79.6%</td>
                    <td className="px-1.5 py-1 text-center font-bold text-blue-700">B</td>
                  </tr>
                </tbody>
              </table>
              {/* Summary */}
              <div className="px-4 py-2 flex gap-4 text-[9px]" style={{ background: "#1a3a2a" }}>
                <div className="text-center"><div className="text-white/50">TOTAL</div><div className="text-white font-bold">398/500</div></div>
                <div className="text-center"><div className="text-white/50">%</div><div className="font-bold" style={{ color: "#86efac" }}>79.6%</div></div>
                <div className="text-center"><div className="text-white/50">POSITION</div><div className="font-bold" style={{ color: "#fbbf24" }}>3/42</div></div>
                <div className="text-center"><div className="text-white/50">GRADE</div><div className="font-bold text-white">B</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offline PWA section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <WifiOff className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Works offline</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">
              Teachers work without<br />internet. Always.
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              The teacher app is a Progressive Web App. Install it once. All student lists,
              timetables and previous marks are cached on the device. Teachers enter marks
              and attendance offline — everything syncs automatically when they reconnect.
            </p>
            <ul className="space-y-3">
              {[
                "One-time login — never asked again",
                "Full student lists cached on device",
                "Marks saved locally, synced when online",
                "Attendance works 100% offline",
                "Installs like a native app on Android & iOS",
                "Works in low-bandwidth areas",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <Wifi className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Phone mockup */}
          <div className="flex justify-center">
            <div className="w-64 bg-gray-800 rounded-3xl p-3 border border-gray-700 shadow-2xl">
              <div className="bg-gray-900 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#1a3a2a" }}>
                  <span className="text-white font-bold text-sm">EduCore</span>
                  <span className="flex items-center gap-1 text-xs text-red-400"><WifiOff className="w-3 h-3" /> Offline</span>
                </div>
                <div className="p-3 space-y-2">
                  {[
                    { subj: "Mathematics", ca: "26", exam: "—", status: "pending" },
                    { subj: "English",     ca: "22", exam: "—", status: "pending" },
                    { subj: "Kinyarwanda", ca: "28", exam: "—", status: "saved"   },
                    { subj: "SET",         ca: "20", exam: "—", status: "saved"   },
                  ].map((row) => (
                    <div key={row.subj} className="bg-gray-800 rounded-lg p-2 flex items-center justify-between">
                      <span className="text-white text-xs font-medium">{row.subj}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-400">CA: {row.ca}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${row.status === "saved" ? "bg-amber-900 text-amber-400" : "bg-gray-700 text-gray-400"}`}>
                          {row.status === "saved" ? "⏳ queued" : "open"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mx-3 mb-3 py-2 text-center rounded-lg text-xs font-semibold text-white" style={{ background: "#1a3a2a" }}>
                  Save offline
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">How it works</h2>
          <p className="text-gray-500">From zero to fully operational in one day.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {STEPS.map((step) => (
            <div key={step.num} className="relative">
              <div className="text-5xl font-bold text-gray-100 mb-3">{step.num}</div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">{step.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Simple, Rwanda-first pricing
            </h2>
            <p className="text-gray-500">One annual payment. All features. No hidden fees.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-3">Standard</div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                170,000 <span className="text-xl text-gray-400 font-normal">Rwf</span>
              </div>
              <div className="text-sm text-gray-500 mb-6">per year · up to 300 students</div>
              <ul className="space-y-2.5 mb-8">
                {["All features included","Up to 300 students","Unlimited teachers","3 terms per year","Full PDF reports","Offline teacher app"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#contact" className="block text-center px-6 py-3 rounded-xl text-sm font-semibold border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors">
                Get started
              </a>
            </div>
            <div className="rounded-2xl p-8 border-2 text-white" style={{ background: "#1a3a2a", borderColor: "#1a3a2a" }}>
              <div className="text-xs font-mono text-white/50 uppercase tracking-widest mb-3">Growth</div>
              <div className="text-4xl font-bold text-white mb-1">
                700 <span className="text-xl font-normal text-white/60">Rwf</span>
              </div>
              <div className="text-sm text-white/60 mb-6">per student per year · above 300</div>
              <ul className="space-y-2.5 mb-8">
                {["Everything in Standard","Unlimited students","Scales with your school","Same per-student rate","Priority support","Custom school branding"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#contact" className="block text-center px-6 py-3 rounded-xl text-sm font-semibold bg-white hover:bg-gray-100 transition-colors" style={{ color: "#1a3a2a" }}>
                Get started
              </a>
            </div>
          </div>
          {/* Billing note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Example: 450 students → 450 × 700 = <strong>315,000 Rwf/year</strong>.
            Billing is annual. Contact us to get started.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
          Ready to get started?
        </h2>
        <p className="text-gray-500 mb-10">
          Contact us and we'll set up your school account, configure your levels, and invite your principal — same day.
        </p>
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">School Name</label>
                <input
                  type="text" required placeholder="Groupe Scolaire…"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ "--tw-ring-color": "#1a3a2a" } as React.CSSProperties}
                />
              </div>
              <div className="text-left">
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Your Name</label>
                <input
                  type="text" required placeholder="Principal / Director"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>
            <div className="text-left">
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email" required placeholder="principal@school.rw"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>
            <div className="text-left">
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Phone</label>
              <input
                type="tel" placeholder="+250 788 000 000"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>
            <div className="text-left">
              <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Approximate student count</label>
              <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none">
                <option>Under 100 students</option>
                <option>100 – 300 students</option>
                <option>300 – 500 students</option>
                <option>Over 500 students</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#1a3a2a" }}
            >
              Request school setup →
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "#1a3a2a" }}>
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">EduCore RW</span>
          </div>
          <div className="flex gap-6 text-xs text-gray-400">
            <a href="#features" className="hover:text-gray-600">Features</a>
            <a href="#pricing"  className="hover:text-gray-600">Pricing</a>
            <a href="#contact"  className="hover:text-gray-600">Contact</a>
            <a href={process.env.NEXT_PUBLIC_ADMIN_URL ?? "/login"} className="hover:text-gray-600">Sign in</a>
          </div>
          <div className="text-xs text-gray-400">
            © 2026 EduCore RW · Republic of Rwanda
          </div>
        </div>
      </footer>
    </div>
  );
}
