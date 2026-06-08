import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { 
  Code2, GitBranch, Star, Users, ExternalLink, Zap, Clock,
  GitFork, Activity, Signal, Cpu, Globe, Mail, MapPin,
  Twitter, Github, Calendar, ArrowUpRight, Database, Terminal
} from 'lucide-react';

// --- TYPES ---
interface GitHubUser {
  login: string; avatar_url: string; bio: string; public_repos: number;
  followers: number; following: number; html_url: string; name: string;
  location: string; twitter_username: string; email: string; created_at: string;
  public_gists: number;
}
interface GitHubRepo {
  id: number; name: string; description: string; html_url: string;
  stargazers_count: number; forks_count: number; language: string;
  updated_at: string; topics: string[];
}
interface GitHubEvent {
  id: string; type: string; repo: { name: string };
  created_at: string; payload: { commits?: { message: string }[] };
  public: boolean;
}
interface LangData { name: string; value: number; color: string; }

// --- FALLBACK DATA ---
const FALLBACK_USER: GitHubUser = {
  login: 'abir2afridi', avatar_url: 'https://avatars.githubusercontent.com/u/101010101?v=4',
  bio: 'Full-stack architect & creative technologist. Building the future one commit at a time.',
  public_repos: 47, followers: 89, following: 42, html_url: 'https://github.com/abir2afridi',
  name: 'Abir Hasan Siam', location: 'Dhaka, Bangladesh', twitter_username: 'abir2afridi',
  email: '', created_at: '2020-01-01T00:00:00Z', public_gists: 12
};
const FALLBACK_REPOS: GitHubRepo[] = Array.from({ length: 6 }, (_, i) => ({
  id: i, name: `project-${String.fromCharCode(97 + i)}-core`, description: 'A next-generation full-stack application with real-time capabilities and microservices architecture.',
  html_url: 'https://github.com/abir2afridi', stargazers_count: 42 + i * 15,
  forks_count: 8 + i * 3, language: ['TypeScript', 'Rust', 'Python', 'Go', 'Solidity', 'C++'][i],
  updated_at: new Date(Date.now() - i * 86400000).toISOString(), topics: ['react', 'node', 'typescript', 'rust']
}));
const FALLBACK_EVENTS: GitHubEvent[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i), type: ['PushEvent', 'CreateEvent', 'PullRequestEvent', 'IssuesEvent', 'WatchEvent', 'ForkEvent'][i % 6],
  repo: { name: `abir2afridi/${['nexus-core', 'quantum-flow', 'rust-engine', 'solidity-dapps', 'ml-pipeline', 'devops-toolkit'][i % 6]}` },
  created_at: new Date(Date.now() - i * 3600000).toISOString(),
  payload: { commits: [{ message: ['feat: add real-time sync', 'fix: resolve memory leak', 'refactor: optimize queries', 'docs: update README', 'feat: add dark mode', 'test: add e2e tests'][i % 6] }] },
  public: true
}));
const FALLBACK_LANGS: LangData[] = [
  { name: 'TypeScript', value: 35, color: '#3178C6' },
  { name: 'Rust', value: 22, color: '#DEA584' },
  { name: 'Python', value: 18, color: '#3572A5' },
  { name: 'Go', value: 12, color: '#00ADD8' },
  { name: 'Solidity', value: 8, color: '#363636' },
  { name: 'C++', value: 5, color: '#F34B7D' },
];

// --- UTILITY ---
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// --- COMPONENT ---
const DeveloperPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [userData, setUserData] = useState<GitHubUser>(FALLBACK_USER);
  const [reposData, setReposData] = useState<GitHubRepo[]>(FALLBACK_REPOS);
  const [eventsData, setEventsData] = useState<GitHubEvent[]>(FALLBACK_EVENTS);
  const [langData, setLangData] = useState<LangData[]>(FALLBACK_LANGS);
  const [stats, setStats] = useState({ totalStars: 0, totalForks: 0, topLang: '' });
  const [fetched, setFetched] = useState(false);
  const signalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const GITHUB_USER = 'abir2afridi';
    const headers = { Accept: 'application/vnd.github.v3+json' };
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const [userRes, reposRes, eventsRes, allReposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers }),
          fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=6`, { headers }),
          fetch(`https://api.github.com/users/${GITHUB_USER}/events?per_page=12`, { headers }),
          fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`, { headers }),
        ]);

        if (!userRes.ok || !reposRes.ok) throw new Error('API limit');

        const user: GitHubUser = await userRes.json();
        const repos: GitHubRepo[] = await reposRes.json();
        const allRepos: GitHubRepo[] = await allReposRes.json();

        let events: GitHubEvent[] = [];
        if (eventsRes.ok) {
          events = await eventsRes.json();
        }

        if (cancelled) return;

        setUserData(user);
        setReposData(repos.length >= 2 ? repos : FALLBACK_REPOS);
        setEventsData(events.length >= 2 ? events : FALLBACK_EVENTS);

        // Calculate language distribution from all repos
        const langMap: Record<string, number> = {};
        allRepos.forEach(r => { if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1; });
        const sorted = Object.entries(langMap).sort((a, b) => b[1] - a[1]);
        const COLORS = ['#3178C6', '#DEA584', '#3572A5', '#00ADD8', '#363636', '#F34B7D', '#2b7489', '#f1e05a'];
        const langData: LangData[] = sorted.slice(0, 6).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
        if (langData.length > 0) setLangData(langData);

        // Aggregate stats
        const totalStars = allRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
        const totalForks = allRepos.reduce((sum, r) => sum + r.forks_count, 0);
        setStats({ totalStars, totalForks, topLang: sorted[0]?.[0] || 'N/A' });
        setFetched(true);
      } catch {
        if (!cancelled) setFetched(true);
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, []);

  // Heatmap data
  const heatmapData = Array.from({ length: 7 }, () =>
    Array.from({ length: 12 }, () => Math.floor(Math.random() * 5))
  );

  const eventIcons: Record<string, React.ReactNode> = {
    PushEvent: <GitBranch size={12} />, CreateEvent: <Database size={12} />,
    PullRequestEvent: <GitFork size={12} />, IssuesEvent: <Activity size={12} />,
    WatchEvent: <Star size={12} />, ForkEvent: <GitFork size={12} />,
  };
  const eventLabels: Record<string, string> = {
    PushEvent: 'Pushed to', CreateEvent: 'Created',
    PullRequestEvent: 'PR opened', IssuesEvent: 'Issue',
    WatchEvent: 'Starred', ForkEvent: 'Forked',
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-[#0A0A0A] text-white" style={{ borderRadius: 0 }}>

      {/* GLOBAL STYLES */}
      <style>{`
        * { border-radius: 0 !important; }
        .scanline {
          animation: scan 3s linear infinite;
          background: linear-gradient(transparent 0%, rgba(0,102,255,0.15) 50%, transparent 100%);
          pointer-events: none;
        }
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker-track { animation: ticker-scroll 20s linear infinite; }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 5px rgba(0,102,255,0.3); } 50% { box-shadow: 0 0 25px rgba(0,102,255,0.8); } }
        .glow-pulse { animation: pulse-glow 2s ease-in-out infinite; }
        @keyframes marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
        .marquee-track { animation: marquee-scroll 30s linear infinite; }
        .signal-feed { mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%); }
      `}</style>

      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url(data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)"/%3E%3C/svg%3E)' }} />

      {/* TICKER */}
      <div className="fixed top-16 left-0 right-0 z-50 h-8 bg-[#0A0A0A] border-b border-[#0066FF]/20 flex items-center overflow-hidden text-[11px] font-mono tracking-wider uppercase">
        <div className="marquee-track flex gap-16 whitespace-nowrap px-4">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="flex items-center gap-4 text-slate-500">
              <span className="text-[#0066FF]">Core_Heat</span>
              <span>{(72 + Math.floor(Math.random() * 5))}°C</span>
              <span className="text-slate-700">|</span>
              <span className="text-[#0066FF]">Neural_Load</span>
              <span>{Math.floor(Math.random() * 30 + 40)}%</span>
              <span className="text-slate-700">|</span>
              <span className="text-[#0066FF]">Ping</span>
              <span>{Math.floor(Math.random() * 20 + 5)}ms</span>
              <span className="text-slate-700">|</span>
              <span className="text-[#0066FF]">Memory</span>
              <span>{(Math.random() * 4 + 2).toFixed(1)}GB</span>
              <span className="text-slate-700">|</span>
              <span className="text-[#0066FF]">Uptime</span>
              <span>{Math.floor(Math.random() * 72 + 24)}h</span>
              <span className="text-slate-700">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 pt-20 pb-32 px-6 md:px-12 lg:px-20">

        {/* HERO */}
        <div className="xl:grid xl:grid-cols-12 gap-8 mb-20">
          <div className="xl:col-span-5 mb-8 xl:mb-0">
            <div className="relative inline-block mb-6 group">
              <div className="w-48 h-48 md:w-56 md:h-56 overflow-hidden border-2 border-[#0066FF]/40 relative">
                <div className="scanline absolute inset-0 z-10" />
                <img src={userData.avatar_url} alt={userData.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-full h-full border-2 border-[#0066FF]/20 -z-10" />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-mono text-[#0066FF] tracking-[0.2em] uppercase">Full-Stack Architect</p>
              <h1 className="font-['Syne'] font-black uppercase tracking-[-0.05em] leading-none text-5xl md:text-7xl xl:text-[12rem] xl:leading-[0.8]">
                {userData.name?.split(' ')[0] || 'Abir'}
              </h1>
              {userData.name?.split(' ').length > 1 && (
                <h1 className="font-['Syne'] font-black uppercase tracking-[-0.05em] leading-none text-4xl md:text-6xl xl:text-[10rem] xl:leading-[0.8] text-slate-700">
                  {userData.name.split(' ').slice(1).join(' ')}
                </h1>
              )}
              <p className="text-sm text-slate-400 font-mono max-w-lg leading-relaxed pt-4">
                {userData.bio || FALLBACK_USER.bio}
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                <a href={userData.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 bg-[#0066FF] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#0052CC] transition-all glow-pulse">
                  <Github size={16} /> View Profile <ArrowUpRight size={14} />
                </a>
                <button onClick={onClose} className="flex items-center gap-2 px-5 py-3 border border-slate-700 text-slate-300 font-mono text-xs font-bold uppercase tracking-wider hover:border-[#0066FF] hover:text-[#0066FF] transition-all">
                  <Code2 size={16} /> Back to SpinMaster
                </button>
              </div>
              {userData.location && (
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 pt-2">
                  <MapPin size={12} className="text-[#0066FF]" /> {userData.location}
                  {userData.twitter_username && <><span className="text-slate-700">/</span><Twitter size={12} className="text-[#0066FF]" /> @{userData.twitter_username}</>}
                  <span className="text-slate-700">/</span>
                  <Calendar size={12} className="text-[#0066FF]" /> Joined {fmtDate(userData.created_at)}
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-7 space-y-6">
            {/* PERFORMANCE HUB */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Star Impact', value: stats.totalStars || userData.public_repos * 15, icon: <Star size={18} />, accent: '#0066FF' },
                { label: 'Fork Density', value: stats.totalForks || userData.public_repos * 3, icon: <GitFork size={18} />, accent: '#00FF88' },
                { label: 'Repos Node', value: userData.public_repos, icon: <Database size={18} />, accent: '#FF6B35' },
                { label: 'Followers', value: userData.followers, icon: <Users size={18} />, accent: '#FFD700' },
              ].map(card => (
                <div key={card.label} className="group p-5 backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] hover:scale-105 transition-all duration-300 cursor-default relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: card.accent }} />
                  <div className="text-[#0066FF] mb-3">{card.icon}</div>
                  <div className="font-['JetBrains_Mono'] text-2xl font-bold">{card.value}</div>
                  <div className="font-['JetBrains_Mono'] text-[10px] text-slate-500 uppercase tracking-[0.15em] mt-1">{card.label}</div>
                </div>
              ))}
            </div>

            {/* LANGUAGE DISTRIBUTION + CONTRIBUTION PULSE */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* DONUT */}
              <div className="p-5 backdrop-blur-xl bg-white/[0.03] border border-white/[0.06]">
                <h3 className="font-['Syne'] font-black uppercase text-xs tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                  <Signal size={14} className="text-[#0066FF]" /> Visual Intelligence
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={langData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" stroke="none">
                          {langData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {langData.slice(0, 5).map(l => (
                      <div key={l.name} className="flex items-center gap-2 font-['JetBrains_Mono'] text-xs">
                        <span className="w-2 h-2" style={{ background: l.color }} />
                        <span className="text-slate-400 flex-1">{l.name}</span>
                        <span className="text-white font-bold">{l.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* HEATMAP */}
              <div className="p-5 backdrop-blur-xl bg-white/[0.03] border border-white/[0.06]">
                <h3 className="font-['Syne'] font-black uppercase text-xs tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                  <Activity size={14} className="text-[#0066FF]" /> Contribution Pulse
                </h3>
                <div className="space-y-1">
                  {heatmapData.map((row, ri) => (
                    <div key={ri} className="flex gap-1">
                      {row.map((val, ci) => (
                        <div key={ci} className="w-full aspect-[1] transition-all duration-200 hover:scale-150"
                          style={{ background: val === 0 ? '#1a1a1a' : `rgba(0,102,255,${0.15 + val * 0.2})` }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 font-['JetBrains_Mono'] text-[10px] text-slate-600">
                  <span>Less</span>
                  {[0, 1, 2, 3, 4].map(v => <div key={v} className="w-3 h-3" style={{ background: v === 0 ? '#1a1a1a' : `rgba(0,102,255,${0.15 + v * 0.2})` }} />)}
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GRID SECTION: REPOS + SIGNAL */}
        <div className="xl:grid xl:grid-cols-12 gap-8 mb-20">
          {/* REPO GRID */}
          <div className="xl:col-span-7 mb-8 xl:mb-0">
            <h2 className="font-['Syne'] font-black uppercase text-sm tracking-[0.25em] text-slate-500 mb-6 flex items-center gap-3">
              <span className="w-4 h-[1px] bg-[#0066FF]" /> Repository_Matrix
            </h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {reposData.slice(0, 6).map((repo, i) => (
                <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer"
                  className="group p-4 backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#0066FF]/40 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-[10px] font-['JetBrains_Mono'] text-[#0066FF] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    MODULE_{String(i + 1).padStart(2, '0')} <ExternalLink size={10} />
                  </div>
                  <h3 className="font-['JetBrains_Mono'] text-xs font-bold text-white mb-2 truncate pr-12">{repo.name}</h3>
                  <p className="text-[11px] text-slate-500 font-['JetBrains_Mono'] line-clamp-2 mb-3 leading-relaxed">
                    {repo.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] font-['JetBrains_Mono'] text-slate-600">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#0066FF' }} />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Star size={10} /> {repo.stargazers_count}</span>
                    <span className="flex items-center gap-1"><GitFork size={10} /> {repo.forks_count}</span>
                  </div>
                  {repo.topics?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {repo.topics.slice(0, 3).map(t => (
                        <span key={t} className="px-1.5 py-0.5 text-[9px] font-['JetBrains_Mono'] bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20">{t}</span>
                      ))}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* LIVE SIGNAL FEED */}
          <div className="xl:col-span-5">
            <h2 className="font-['Syne'] font-black uppercase text-sm tracking-[0.25em] text-slate-500 mb-6 flex items-center gap-3">
              <span className="w-4 h-[1px] bg-[#0066FF]" /> Live_Signal_Feed
            </h2>
            <div ref={signalRef} className="h-[420px] overflow-y-auto backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] p-4 signal-feed">
              <div className="space-y-0">
                {eventsData.slice(0, 12).map((ev, i) => (
                  <div key={ev.id || i} className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] font-['JetBrains_Mono'] text-xs group hover:bg-white/[0.02] transition-colors px-2">
                    <div className="mt-0.5 text-[#0066FF] flex-shrink-0">
                      {eventIcons[ev.type] || <Activity size={12} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-[#0066FF] font-bold">{eventLabels[ev.type] || ev.type}</span>
                        <span className="truncate text-slate-500">{ev.repo.name.replace('abir2afridi/', '')}</span>
                      </div>
                      {ev.payload?.commits?.[0]?.message && (
                        <div className="text-slate-600 truncate mt-0.5 text-[10px]">
                          {`> ${ev.payload.commits[0].message}`}
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-700 flex-shrink-0">{fmtDate(ev.created_at)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA: NETWORK_SYNC_READY */}
        <div className="relative -mx-6 md:-mx-12 lg:-mx-20 overflow-hidden border-y border-[#0066FF]/20 backdrop-blur-xl bg-white/[0.02]">
          <div className="px-6 md:px-12 lg:px-20 py-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="font-['JetBrains_Mono'] text-[10px] text-[#0066FF] tracking-[0.3em] uppercase">Network_Sync_Ready</div>
              <h2 className="font-['Syne'] font-black uppercase text-3xl md:text-5xl tracking-[-0.03em] leading-tight">
                Let's Build<br /><span className="text-slate-600">Something</span> Epic
              </h2>
              <p className="font-['JetBrains_Mono'] text-xs text-slate-500 max-w-md">
                Open for collaborations, freelance projects, and innovative ideas. 
                Ready to push pixels and deploy dreams.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-[#0066FF] animate-pulse">
                <Zap size={48} />
              </div>
              <a href="https://github.com/abir2afridi" target="_blank" rel="noopener noreferrer"
                className="group relative px-8 py-4 bg-[#0066FF] text-white font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-[0.2em] overflow-hidden transition-all hover:bg-[#0052CC]">
                <span className="relative z-10 flex items-center gap-2">
                  Transmit <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DeveloperPage;
