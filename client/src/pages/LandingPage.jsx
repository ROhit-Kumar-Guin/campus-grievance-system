import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1E1B4B] text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center border border-white/20">
            <span className="text-sm">🎓</span>
          </div>
          <span className="font-semibold text-sm">CampusGrieve</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-white/60 text-sm hidden sm:block cursor-pointer hover:text-white">Features</span>
          <span className="text-white/60 text-sm hidden sm:block cursor-pointer hover:text-white">About</span>
          <button
            onClick={() => navigate('/login')}
            className="border border-white/30 text-white text-sm px-4 py-2 rounded-lg hover:bg-white/10 transition"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-indigo-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-16">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs text-white/70 mb-6"
        >
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          Now live at Vinoba Bhave University
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl font-semibold leading-tight mb-4 max-w-xl"
        >
          Your university complaints,<br />tracked & resolved — fast.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/60 text-sm leading-relaxed max-w-lg mb-8"
        >
          A modern grievance redressal platform for students. Submit issues, track
          progress in real time, access study materials, and stay connected with campus life.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 flex-wrap"
        >
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 bg-white text-indigo-900 font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-white/90 transition"
          >
            🎓 Submit a grievance
          </button>
          <button className="flex items-center gap-2 border border-white/30 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-white/10 transition">
            ▶ See how it works
          </button>
          <span className="text-white/40 text-xs">No signup needed to explore</span>
        </motion.div>

        {/* Mini app preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 border border-white/15 rounded-2xl overflow-hidden bg-white/5"
        >
          {/* Browser bar */}
          <div className="bg-white/8 px-4 py-2.5 border-b border-white/10 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-white/30 text-xs ml-3">campusgrieve.vbu.ac.in</span>
          </div>
          <div className="p-4 grid grid-cols-4 gap-3">
            {/* Sidebar */}
            <div className="bg-white/5 rounded-lg p-3 col-span-1">
              <div className="text-[9px] text-white/30 uppercase mb-2">Navigation</div>
              {['Dashboard', 'Issues', 'Resources', 'Alerts'].map((item, i) => (
                <div
                  key={item}
                  className={`text-[10px] px-2 py-1 rounded mb-1 ${
                    i === 0 ? 'bg-white/15 text-white' : 'text-white/40'
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
            {/* Main */}
            <div className="col-span-3 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Issues', value: '12', color: 'text-indigo-300' },
                  { label: 'Resolved', value: '9', color: 'text-emerald-300' },
                  { label: 'Pending', value: '2', color: 'text-amber-300' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/6 rounded-lg p-2.5 text-center">
                    <div className={`text-base font-semibold ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] text-white/40">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white/6 rounded-lg p-3">
                <div className="text-[9px] text-white/40 mb-2">Recent grievances</div>
                {[
                  { title: 'Exam schedule delayed', status: 'In Progress', color: 'bg-violet-500/30 text-violet-300' },
                  { title: 'Lab projector broken', status: 'Pending', color: 'bg-amber-500/30 text-amber-300' },
                ].map((g) => (
                  <div key={g.title} className="flex items-center justify-between py-1">
                    <span className="text-[10px] text-white/70">{g.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${g.color}`}>{g.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="bg-white/5 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-3 gap-4">
          {[
            { value: '1,200+', label: 'Issues resolved', color: 'text-indigo-300' },
            { value: '4.2 days', label: 'Avg. resolution time', color: 'text-emerald-300' },
            { value: '3,400+', label: 'Students registered', color: 'text-violet-300' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={`text-2xl font-semibold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-white/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-6">
          Platform Features
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '📋', title: 'Grievance tracking', desc: 'Submit issues and watch them move through a clear, transparent workflow with real-time status updates.' },
            { icon: '⏰', title: 'Deadline accountability', desc: 'Every issue gets a visible deadline. Admins are notified automatically. No more complaints going cold.' },
            { icon: '📚', title: 'Study resources', desc: 'Notes, previous year papers — organized by department and subject, uploaded by verified admins.' },
            { icon: '🔔', title: 'Smart notifications', desc: 'Get notified when your issue status changes, an admin comments, or a deadline is approaching.' },
            { icon: '📰', title: 'Stories & events', desc: 'A LinkedIn-style campus feed for achievements, placements, events, and department announcements.' },
            { icon: '📊', title: 'Analytics dashboard', desc: 'Admins get charts, heatmaps, and resolution stats to spot trends and improve response times.' },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition">
              <div className="text-2xl mb-3">{f.icon}</div>
              <div className="text-sm font-medium text-white mb-2">{f.title}</div>
              <div className="text-xs text-white/50 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white/5 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-8">
            How it works
          </div>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-px bg-white/10 hidden sm:block" />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 relative z-10">
              {[
                { n: 1, title: 'Submit', desc: 'File an issue with details', color: 'bg-indigo-500/20 border-indigo-400 text-indigo-300' },
                { n: 2, title: 'Review', desc: 'Admin assigns it', color: 'bg-sky-500/20 border-sky-400 text-sky-300' },
                { n: 3, title: 'Act', desc: 'Department takes action', color: 'bg-violet-500/20 border-violet-400 text-violet-300' },
                { n: 4, title: 'Resolve', desc: 'Issue marked resolved', color: 'bg-emerald-500/20 border-emerald-400 text-emerald-300' },
                { n: 5, title: 'Close', desc: 'Student confirms & closes', color: 'bg-white/10 border-white/20 text-white/50' },
              ].map((s) => (
                <div key={s.n} className="flex flex-col items-center gap-2 text-center">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${s.color}`}>
                    {s.n}
                  </div>
                  <div className="text-xs font-medium text-white">{s.title}</div>
                  <div className="text-[10px] text-white/40">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-6">
          What students say
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { quote: '"My exam grievance was resolved in 3 days. Before, I\'d submit written applications and hear nothing for weeks. This is a completely different experience."', name: 'Ananya K.', sub: 'CSE, Semester 6', initials: 'AK' },
            { quote: '"The resources section alone saved me so much time. All PYQs in one place, filtered by subject. No more hunting in WhatsApp groups at midnight."', name: 'Rahul M.', sub: 'ECE, Semester 4', initials: 'RM' },
          ].map((t) => (
            <div key={t.name} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-xs">★</span>
                ))}
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-4">{t.quote}</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs font-medium text-indigo-300">
                  {t.initials}
                </div>
                <div>
                  <div className="text-xs font-medium text-white">{t.name}</div>
                  <div className="text-[10px] text-white/40">{t.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Footer */}
      <div className="bg-white/5 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-14 text-center">
          <h2 className="text-2xl font-semibold mb-3">Ready to make your voice heard?</h2>
          <p className="text-white/50 text-sm mb-6">
            Join thousands of VBU students already using CampusGrieve.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-indigo-900 font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-white/90 transition"
            >
              🎓 Create student account
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border border-white/30 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-white/10 transition"
            >
              🛡️ Admin login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;