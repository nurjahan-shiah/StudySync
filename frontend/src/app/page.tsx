export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-lg font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
          StudySync
        </div>
        <div className="flex gap-2">
          <a href="/login">
            <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              Log in
            </button>
          </a>
          <a href="/signup">
            <button className="px-4 py-2 text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg hover:bg-emerald-100 transition">
              Sign up
            </button>
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-xl mx-auto text-center px-6 pt-20 pb-12">
        <span className="inline-flex items-center gap-2 text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Built for university students
        </span>
        <h1 className="text-4xl font-medium leading-tight tracking-tight text-gray-900 mb-4">
          Study better,<br />together<span className="text-emerald-600"> .</span>
        </h1>
        <p className="text-gray-500 text-base leading-relaxed mb-8">
          Create or join study groups for your courses, organize sessions,
          share notes, and collaborate - All in One place.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="/signup">
            <button className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition">
              Get started free
            </button>
          </a>
          <a href="/login">
            <button className="px-6 py-2.5 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
              Log in to your account
            </button>
          </a>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-2xl mx-auto px-6 pb-16 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: "👥", title: "Study groups", desc: "Create or join groups by course and interest." },
          { icon: "📅", title: "Session scheduling", desc: "Leaders organize sessions with ease." },
          { icon: "📁", title: "Resource sharing", desc: "Share notes and slides in your group." },
          { icon: "✨", title: "Recommendations", desc: "Find groups that match your courses." },
        ].map((f) => (
          <div key={f.title} className="bg-gray-50 rounded-xl p-4">
            <div className="text-xl mb-2">{f.icon}</div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">{f.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-8 py-4 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-400">StudySync</span>
        <span className="text-xs text-gray-300">Group 4 · York University · 2026</span>
      </div>

    </div>
  );
}