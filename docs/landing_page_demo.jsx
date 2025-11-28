import React, { useState, useEffect } from 'react';
import { 
  Shield, Map, Brain, User, HardHat, Building2, 
  ChevronRight, LogIn, X, Activity, Settings, 
  Zap, CornerDownRight, BarChart3, Clock, Scale, 
  Layers, Lock, AlertTriangle, MessageSquare,
  Users, Phone, ArrowUpRight // Added missing icons
} from 'lucide-react';

const GeoRiseLanding = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Handle scroll effects for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Utility function for simulating routing
  const simulateRoute = (path) => {
    console.log(`--- Simulating Navigation ---`);
    console.log(`Redirecting to: ${path}`);
    if (loginModalOpen) setLoginModalOpen(false);
    // In a real app, this would be: window.location.href = path;
    alert(`Action: Redirecting to ${path}`); 
  };

  const menuItems = [
    { name: "How It Works", href: "#workflow" },
    { name: "Value", href: "#value" },
    { name: "Features", href: "#features" },
    { name: "Technology", href: "#technology" },
  ];

  const roleLogins = [
    { role: "Citizen Login", path: "/login/citizen", icon: User },
    { role: "Agency Staff Login", path: "/login/agency", icon: HardHat },
    { role: "System Admin Login", path: "/login/admin", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden" id="top">
      {/* --- Global Styles & Fonts --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        
        body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .bg-cyber-grid {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
        }
        .text-glow { text-shadow: 0 0 20px rgba(34, 211, 238, 0.5); }
      `}</style>

      {/* --- Login Modal --- */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLoginModalOpen(false)}>
          <div className="bg-[#161B22] border border-blue-900/50 rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-50" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-slate-400 hover:text-white" onClick={() => setLoginModalOpen(false)}>
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-2">Login to GEORISE</h3>
            <p className="text-slate-400 mb-6">Select your system role to continue to the correct portal.</p>
            
            <div className="space-y-4">
              {roleLogins.map((role, idx) => (
                <button 
                  key={idx} 
                  className="w-full flex items-center justify-between p-4 bg-[#0A0F1A] border border-slate-700 hover:border-blue-500/50 hover:bg-[#0D1117] rounded-lg transition-all text-left"
                  onClick={() => simulateRoute(role.path)}
                >
                  <span className="flex items-center gap-3">
                    <role.icon className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">{role.role}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              ))}
            </div>

            <p className="text-slate-500 text-xs mt-6 text-center">
              New Citizen? <a href="#" onClick={() => simulateRoute('/signup/citizen')} className="text-cyan-400 hover:underline">Create a new account.</a>
            </p>
          </div>
        </div>
      )}

      {/* --- SECTION 1: Navigation & Hero --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-[#0A0F1A]/90 backdrop-blur-md border-blue-900/30 py-3' : 'bg-transparent border-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="#top" className="flex items-center gap-2 group cursor-pointer">
            <Shield className="w-8 h-8 text-blue-500 fill-blue-500/10 group-hover:text-cyan-400 transition-colors" />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white">GEORISE</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-mono">Geospatial Intelligence</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-400">
            {menuItems.map(item => (
              <a key={item.name} href={item.href} className="hover:text-white transition-colors">
                {item.name}
              </a>
            ))}
            
            <button 
              onClick={() => simulateRoute('/agency/request-access')}
              className="px-4 py-2 bg-transparent hover:bg-white/5 border border-cyan-400/30 text-cyan-400 font-medium rounded-sm transition-colors ml-4"
            >
              Request Agency Access
            </button>

            <button 
              onClick={() => setLoginModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-blue-400/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <LogIn />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#0D1117] border-b border-blue-900/30 p-6 flex flex-col gap-4 shadow-2xl">
            {menuItems.map(item => (
              <a key={item.name} href={item.href} className="text-slate-300 py-2 border-b border-slate-800" onClick={() => setMobileMenuOpen(false)}>
                {item.name}
              </a>
            ))}
            <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-sm mt-4" onClick={() => { setLoginModalOpen(true); setMobileMenuOpen(false); }}>
              Login to Portal
            </button>
            <button className="w-full py-3 bg-transparent border border-cyan-500 text-cyan-400 font-bold rounded-sm" onClick={() => simulateRoute('/agency/request-access')}>
              Request Agency Access
            </button>
          </div>
        )}
      </nav>

      {/* --- SECTION 1: HERO SECTION (Above the Fold) --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-cyber-grid bg-cover">
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
            Real-Time Emergency Intelligence for Ethiopian Cities — <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 text-glow">Powered by AI & GIS.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
            GEORISE helps citizens report incidents instantly, and enables emergency agencies to see, decide, and respond faster — all on one intelligent map.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* CTA 1: Citizen */}
            <button 
              onClick={() => simulateRoute('/login/citizen')}
              className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide rounded-sm transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(248,113,113,0.4)] border border-red-400/20"
            >
              <AlertTriangle className="w-4 h-4" />
              Report emergencies instantly and stay informed.
            </button>
            {/* CTA 2: Agency */}
            <button 
              onClick={() => simulateRoute('/login/agency')}
              className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/5 border border-blue-600 text-blue-300 font-bold text-sm tracking-wide rounded-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              <CornerDownRight className="w-4 h-4" />
              Open Agency Portal (Police, Fire, Medical)
            </button>
          </div>

          {/* Micro-Trust Copy & Credibility Points */}
          <p className="text-slate-500 text-xs mt-6 flex justify-center items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-500" />
            Your report is secure. GEORISE does not share personal data with any third parties.
          </p>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-8 text-sm text-slate-400">
            <span className="flex items-center gap-2"><Brain className="w-4 h-4 text-blue-400" /> AI-Powered Classification</span>
            <span className="flex items-center gap-2"><Map className="w-4 h-4 text-cyan-400" /> GIS Spatial Intelligence</span>
            {/* Corrected: Users was undefined, now imported and used */}
            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-purple-400" /> Multi-Agency Response</span>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: HOW GEORISE WORKS (The Process) --- */}
      <section id="workflow" className="py-24 bg-[#0D1117] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-mono text-cyan-400 tracking-wider uppercase mb-2">The Simple, Predictable Process</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white">How GEORISE Turns Chaos into Coordinated Action</h3>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
             {/* Connecting Line (Desktop) */}
             <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-transparent via-slate-700 to-transparent z-0"></div>

             {[
               { step: "01", title: "Report", desc: "Citizens report incidents using their phone — location is auto-detected.", icon: Phone }, // Phone is now imported
               { step: "02", title: "Analyze", desc: "GEORISE instantly classifies, scores severity, and maps it with geospatial intelligence.", icon: Brain },
               { step: "03", title: "Assign", desc: "Verified incidents are automatically routed to the correct emergency unit.", icon: ArrowUpRight }, // ArrowUpRight is now imported
               { step: "04", title: "Respond", desc: "Agencies coordinate in real-time on a unified dashboard, speeding up dispatch.", icon: HardHat },
             ].map((item, idx) => (
               <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-[#161B22] border border-slate-700 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] group hover:border-blue-500 transition-colors">
                     <item.icon className="w-8 h-8 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="text-4xl font-black text-slate-800 absolute top-0 -right-4 -z-10 select-none opacity-50">{item.step}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 3: CORE VALUE PROPOSITION (Hormozi Framework) --- */}
      <section id="value" className="py-24 bg-[#0A0F1A]">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-sm font-mono text-red-400 tracking-wider uppercase mb-2">Our Value Proposition</h2>
               <h3 className="text-3xl md:text-4xl font-bold text-white">GEORISE: Maximizing Impact, Minimizing Friction</h3>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
               <ValueCard 
                  icon={Shield} 
                  title="Dream Outcome" 
                  color="text-blue-400"
                  desc="Safer, smarter Ethiopian cities with dramatically faster emergency coordination."
               />
               <ValueCard 
                  icon={Scale} 
                  title="Likelihood of Success" 
                  color="text-cyan-400"
                  desc="Proven through AI classification, GIS precision, and validated multi-agency routing."
               />
               <ValueCard 
                  icon={Clock} 
                  title="Time Delay (Reduced)" 
                  color="text-yellow-400"
                  desc="Incident processing is done in seconds, routing the verified report to dispatchers instantly."
               />
               <ValueCard 
                  icon={MessageSquare} 
                  title="Effort & Sacrifice (Reduced)" 
                  color="text-purple-400"
                  desc="Minimal citizen effort for reporting. Zero technical setup or training burden for agencies."
               />
            </div>

            <p className="max-w-4xl mx-auto text-center text-xl font-semibold text-slate-300 mt-16 p-4 border-y border-slate-700">
               GEORISE turns scattered incident reports into a single, intelligent emergency picture — increasing clarity, coordination, and response speed.
            </p>
         </div>
      </section>

      {/* --- SECTION 4: FEATURES (Grouped by Audience Type) --- */}
      <section id="features" className="py-24 bg-[#0D1117] border-y border-slate-800">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-sm font-mono text-blue-400 tracking-wider uppercase mb-2">Role-Based Capabilities</h2>
               <h3 className="text-3xl md:text-4xl font-bold text-white">Features Built for Every GEORISE User</h3>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
               {/* Column A: Citizens */}
               <FeatureColumn title="For Citizens" icon={User} color="text-cyan-400" features={[
                  { name: "Instant Emergency Reporting", benefit: "Feel safe & heard: Fast AI classification + auto-location.", icon: Phone },
                  { name: "Real-Time Alerts", benefit: "Reduce anxiety: Proximity-based hazard notifications.", icon: Zap },
                  { name: "Submission History", benefit: "Full transparency: Track status changes of your reports.", icon: Activity },
               ]} />

               {/* Column B: Emergency Agencies */}
               <FeatureColumn title="For Emergency Agencies" icon={HardHat} color="text-red-400" features={[
                  { name: "Unified Incident Dashboard", benefit: "Sense of mastery: View all verified incidents on a live GIS map.", icon: Map },
                  { name: "Severity-Based Prioritization", benefit: "Reduces overwhelm: AI ranks urgency and recommends resources.", icon: Scale },
                  { name: "Multi-Agency Coordination Tools", benefit: "Harmony: Shared incident log and status updates across departments.", icon: Building2 },
               ]} />

               {/* Column C: Government / Municipalities */}
               <FeatureColumn title="For Municipalities" icon={BarChart3} color="text-blue-400" features={[
                  { name: "Analytics & Hotspot Insights", benefit: "Confidence: GIS heatmaps, trends, and performance statistics.", icon: BarChart3 },
                  { name: "Infrastructure Risk Monitoring", benefit: "Prevention: Spatial buffer analysis and hazard zone identification.", icon: Layers },
                  { name: "Policy Configuration Access", benefit: "Control: Manage default map settings, categories, and system rules.", icon: Settings },
               ]} />
            </div>
         </div>
      </section>

      {/* --- SECTION 5: GEORISE AI + GIS TECHNOLOGY (Simplified Messaging) --- */}
      <section id="technology" className="py-24 bg-[#0A0F1A]">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-sm font-mono text-cyan-400 tracking-wider uppercase mb-2">The Intelligence Behind GEORISE</h2>
               <h3 className="text-3xl md:text-4xl font-bold text-white">Advanced AI and Geospatial Systems Working Together</h3>
               <p className="max-w-3xl mx-auto text-slate-400 mt-4">We combine Artificial Intelligence with Geospatial Information Systems to analyze incidents, understand city patterns, and guide emergency response.</p>
            </div>
            
            <div className="grid md:grid-cols-5 gap-6">
               <TechCard title="AI Text Classification" desc="Reads incident reports to instantly identify the type of emergency (Fire, Crime, Medical)." icon={Brain} />
               <TechCard title="Severity Scoring Model" desc="Predicts risk level based on keywords, past patterns, and real-time context." icon={Activity} />
               <TechCard title="GIS Spatial Intelligence" desc="Maps incidents, hotspots, hazards, and agency jurisdictions on a live 3D surface." icon={Map} />
               <TechCard title="Clustering & Heatmaps" desc="Visualizes patterns—allowing analysts to see where crime or accident risks are highest." icon={Layers} />
               <TechCard title="Multi-Agency Routing" desc="Suggests which specific agency should respond based on location, type, and jurisdiction." icon={CornerDownRight} />
            </div>
         </div>
      </section>

      {/* --- SECTION 6: TRUST-BUILDING --- */}
      <section className="py-24 bg-[#0D1117] border-y border-slate-800">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12">
               <div>
                  <h3 className="text-3xl font-bold text-white mb-6">Why GEORISE Solves Urban Safety Challenges</h3>
                  <p className="text-slate-400 text-lg mb-8">Current emergency coordination suffers from scattered reporting and a lack of unified data. GEORISE was built to address these specific pain points in the Ethiopian context.</p>

                  <div className="space-y-4">
                     <TrustPoint icon={User} title="Verified Reporting" desc="All citizen reporters are registered, which filters noise and reduces false reports." color="text-cyan-400" />
                     <TrustPoint icon={Lock} title="Transparent Data Handling" desc="We maintain strict ethical and privacy standards; personal data is not shared with third parties." color="text-blue-400" />
                     <TrustPoint icon={Building2} title="Agency Collaboration" desc="GIS clarity allows multiple departments (Police, Fire) to operate from a single, shared source of truth." color="text-red-400" />
                  </div>
               </div>

               <div className="p-8 bg-[#161B22] rounded-xl border border-slate-700">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                     <AlertTriangle className='w-5 h-5 text-yellow-500'/>
                     Current Problems We Address
                  </h4>
                  <ul className="space-y-3 text-slate-400">
                     <li className="flex items-start gap-3"><ChevronRight className='w-5 h-5 text-red-500 mt-1'/> Slow, manual emergency coordination.</li>
                     <li className="flex items-start gap-3"><ChevronRight className='w-5 h-5 text-red-500 mt-1'/> Scattered, non-geospatial reporting methods.</li>
                     <li className="flex items-start gap-3"><ChevronRight className='w-5 h-5 text-red-500 mt-1'/> Low trust and unclear status updates for citizens.</li>
                     <li className="flex items-start gap-3"><ChevronRight className='w-5 h-5 text-red-500 mt-1'/> Lack of unified data picture for traffic and disaster units.</li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* --- SECTION 7: CALL-TO-ACTION SECTIONS (Funnels) --- */}
      <section className="py-24 relative overflow-hidden bg-[#0A0F1A]">
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Elevate Urban Safety?</h2>
          <p className="text-xl text-slate-400 mb-10">Select your path to access the GEORISE platform.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <div className="p-6 bg-[#0D1117] border border-blue-600/50 rounded-lg shadow-xl hover:shadow-blue-900/50 transition-shadow">
               <h4 className="text-2xl font-bold text-white mb-3">Citizen Access</h4>
               <p className="text-slate-400 mb-6">Start Reporting — It’s Fast & Secure.</p>
               <button 
                  onClick={() => simulateRoute('/login/citizen')}
                  className="w-full px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-sm shadow-[0_0_20px_rgba(248,113,113,0.3)] transition-all"
               >
                  Get Started as a Citizen
               </button>
            </div>
            
            <div className="p-6 bg-[#0D1117] border border-cyan-600/50 rounded-lg shadow-xl hover:shadow-cyan-900/50 transition-shadow">
               <h4 className="text-2xl font-bold text-white mb-3">Agency Partnership</h4>
               <p className="text-slate-400 mb-6">Request Agency Access — Join GEORISE.</p>
               <button 
                  onClick={() => simulateRoute('/agency/request-access')}
                  className="w-full px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-sm shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
               >
                  Request Partnership
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 8: FOOTER --- */}
      <footer id="footer" className="bg-[#050910] border-t border-slate-800 py-12 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-slate-200 font-bold mb-4">
               <Shield className="w-5 h-5 text-blue-500" />
               GEORISE
            </div>
            <p>Real-Time Geospatial Incident Intelligence.</p>
            <p className='text-xs font-mono mt-4'>GEORISE v1.0 — Academic Prototype</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Portals</h4>
            <ul className="space-y-2">
               <li><a href="#" onClick={() => simulateRoute('/login/citizen')} className="hover:text-blue-400">Citizen Login</a></li>
               <li><a href="#" onClick={() => simulateRoute('/login/agency')} className="hover:text-blue-400">Agency Portal</a></li>
               <li><a href="#" onClick={() => simulateRoute('/login/admin')} className="hover:text-blue-400">System Admin</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact & Access</h4>
            <ul className="space-y-2">
               <li><a href="#" onClick={() => simulateRoute('/agency/request-access')} className="hover:text-blue-400">Request Agency Access</a></li>
               <li><a href="#" className="hover:text-blue-400">support@georise.et</a></li>
               <li><a href="#" className="hover:text-blue-400">About / Team</a></li>
            </ul>
          </div>
          <div>
             <h4 className="text-white font-bold mb-4">Policy & Trust</h4>
             <p className='text-xs mb-2'>This platform demonstrates RBAC and incident management in a high-security context. Misuse will result in account suspension.</p>
             <p className='text-xs'>Data Privacy is paramount. We adhere to the highest ethical reporting standards.</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-900 text-center text-xs font-mono">
           © 2025 GEORISE SYSTEMS. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

// Helper component for Section 3
const ValueCard = ({ icon: Icon, title, desc, color }) => (
  <div className="p-6 bg-[#161B22] border border-slate-700 rounded-lg shadow-xl hover:border-blue-500 transition-colors">
    <Icon className={`w-8 h-8 mb-3 ${color}`} />
    <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
    <p className="text-slate-400 text-sm">{desc}</p>
  </div>
);

// Helper component for Section 4
const FeatureColumn = ({ title, icon: Icon, color, features }) => (
    <div className="p-6 bg-[#161B22] border border-slate-700 rounded-xl shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Icon className={`w-6 h-6 ${color}`} />
            {title}
        </h3>
        <ul className="space-y-5">
            {features.map((f, i) => (
                <li key={i} className="flex items-start gap-4">
                    <f.icon className={`w-5 h-5 flex-shrink-0 mt-1 ${color}`} />
                    <div>
                        <span className="font-semibold text-white block">{f.name}</span>
                        <span className="text-slate-400 text-sm">{f.benefit}</span>
                    </div>
                </li>
            ))}
        </ul>
    </div>
);

// Helper component for Section 5
const TechCard = ({ title, desc, icon: Icon }) => (
    <div className="p-4 bg-[#0D1117] border border-blue-900/50 rounded-lg text-center hover:bg-[#111520] transition-colors">
        <Icon className="w-6 h-6 mx-auto text-blue-400 mb-2" />
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </div>
);

// Helper component for Section 6
const TrustPoint = ({ icon: Icon, title, desc, color }) => (
    <div className="flex items-start gap-4 p-4 border border-slate-800 rounded-lg bg-[#0D1117]">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-1 ${color}`} />
        <div>
            <p className="font-semibold text-white">{title}</p>
            <p className="text-sm text-slate-400">{desc}</p>
        </div>
    </div>
);

export default GeoRiseLanding;