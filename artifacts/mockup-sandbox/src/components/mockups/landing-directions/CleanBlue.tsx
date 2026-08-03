import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowRight, Heart, MessageCircle, Image as ImageIcon, 
  Mail, Presentation, Globe, CheckCircle2, Quote, Menu, X, Play,
  ChevronRight, Users, Shield, Zap
} from 'lucide-react';

// Intersection Observer Hook for fade-in animations
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-8');
          entry.target.classList.add('opacity-100', 'translate-y-0');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}

const Reveal = ({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const ref = useScrollReveal();
  return (
    <div 
      ref={ref} 
      className={`opacity-0 translate-y-8 transition-all duration-1000 ease-out ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export function CleanBlue() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#1085FD] selection:text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .bg-brand { background-color: #1085FD; }
        .text-brand { color: #1085FD; }
        .border-brand { border-color: #1085FD; }
        .ring-brand { --tw-ring-color: #1085FD; }
        .hover-bg-brand:hover { background-color: #0e76df; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white">
              <Globe size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">SentConnect</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <a href="#workflow" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">How it works</a>
            <a href="#testimonials" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Stories</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2">
              Try Demo
            </button>
            <button className="text-sm font-semibold bg-brand text-white px-5 py-2.5 rounded-full hover-bg-brand transition-all hover:shadow-lg hover:shadow-[#1085FD]/20 active:scale-95">
              Sign Up
            </button>
          </div>

          <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-lg absolute w-full">
            <a href="#features" className="text-lg font-medium text-slate-700" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#workflow" className="text-lg font-medium text-slate-700" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#testimonials" className="text-lg font-medium text-slate-700" onClick={() => setMobileMenuOpen(false)}>Stories</a>
            <div className="h-px bg-slate-100 my-2" />
            <button className="text-lg font-medium text-slate-700 text-left" onClick={() => setMobileMenuOpen(false)}>Try Demo</button>
            <button className="text-lg font-semibold bg-brand text-white px-5 py-3 rounded-xl text-center" onClick={() => setMobileMenuOpen(false)}>Sign Up</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 md:pt-48 md:pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1085FD]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-sm font-semibold mb-8 border border-brand/20">
              <span className="flex h-2 w-2 rounded-full bg-brand"></span>
              A private network for your church
            </div>
          </Reveal>
          
          <Reveal delay={100}>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-8">
              Helping churches stay connected with the missionaries they <span className="text-brand">send and support.</span>
            </h1>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="text-xl md:text-2xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              A focused platform for field updates, prayer requests, and photos, directly bridging the gap between the field and your congregation.
            </p>
          </Reveal>
          
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto text-lg font-semibold bg-brand text-white px-8 py-4 rounded-full hover-bg-brand transition-all hover:shadow-xl hover:shadow-[#1085FD]/30 active:scale-95 flex items-center justify-center gap-2 group">
                Sign Up
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto text-lg font-medium text-slate-700 bg-white border-2 border-slate-200 px-8 py-4 rounded-full hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Play size={20} className="fill-slate-700" />
                Try Demo
              </button>
            </div>
          </Reveal>
        </div>

        {/* Hero App Mockup */}
        <Reveal delay={500} className="max-w-5xl mx-auto mt-20 relative z-10">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar Mock */}
            <div className="w-64 bg-slate-50 border-r border-slate-200 hidden md:flex flex-col p-6">
              <div className="font-bold text-slate-900 mb-8 px-2">Grace Community</div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 bg-brand/10 text-brand rounded-lg font-medium text-sm">
                  <Globe size={18} /> Field Updates
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm transition-colors">
                  <Users size={18} /> Directory
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm transition-colors">
                  <Mail size={18} /> Prayer Letters
                </div>
              </div>
            </div>
            {/* Main Feed Mock */}
            <div className="flex-1 bg-slate-100 p-4 md:p-8 overflow-hidden h-[500px]">
              <div className="max-w-xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">David & Sarah Jenkins</div>
                      <div className="text-xs text-slate-500">Tokyo, Japan • 2 hours ago</div>
                    </div>
                  </div>
                </div>
                <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                  We had an incredible turnout at the community center this weekend. Thank you for your continued prayers. We see God moving in amazing ways here in Tokyo!
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="h-32 bg-slate-200 rounded-lg relative overflow-hidden group">
                     <div className="absolute inset-0 bg-slate-800/10 group-hover:bg-transparent transition-colors" />
                     <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center" />
                  </div>
                  <div className="h-32 bg-slate-200 rounded-lg relative overflow-hidden group">
                     <div className="absolute inset-0 bg-slate-800/10 group-hover:bg-transparent transition-colors" />
                     <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center" />
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-3 flex items-center gap-6">
                  <div className="flex items-center gap-1.5 text-slate-500 hover:text-brand transition-colors cursor-pointer">
                    <Heart size={18} /> <span className="text-sm font-medium">24</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 hover:text-brand transition-colors cursor-pointer">
                    <MessageCircle size={18} /> <span className="text-sm font-medium">5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-slate-100 bg-slate-50 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Designed exclusively for</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale">
            <div className="text-xl font-bold font-serif text-slate-800">Grace Fellowship</div>
            <div className="text-xl font-bold font-serif text-slate-800">Redeemer Church</div>
            <div className="text-xl font-bold font-serif text-slate-800">Sojourn Network</div>
            <div className="text-xl font-bold font-serif text-slate-800">City Church</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Everything you need to support your field workers</h2>
              <p className="text-lg text-slate-500">Built specifically for the unique relationship between churches and missionaries. No algorithms, no ads, just genuine connection.</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="text-white" size={24} strokeWidth={2} />,
                title: "Live Field Updates",
                desc: "A dedicated chronological feed for updates straight from the field. Skip the noise of traditional social media."
              },
              {
                icon: <ImageIcon className="text-white" size={24} strokeWidth={2} />,
                title: "Rich Media Galleries",
                desc: "Missionaries can share up to 6 photos or short videos per post, giving your church a window into their daily lives."
              },
              {
                icon: <Heart className="text-white" size={24} strokeWidth={2} />,
                title: "Meaningful Engagement",
                desc: "Congregation members can like, love, and comment on updates, showing direct support and encouragement."
              },
              {
                icon: <Mail className="text-white" size={24} strokeWidth={2} />,
                title: "Email Notifications",
                desc: "Ensure no update is missed. Members can opt-in to receive weekly summaries or instant alerts for new prayer requests."
              },
              {
                icon: <Shield className="text-white" size={24} strokeWidth={2} />,
                title: "Private Church Domain",
                desc: "Your network lives at yourchurch.sentconnect.org. A secure, invite-only space for your community."
              },
              {
                icon: <Presentation className="text-white" size={24} strokeWidth={2} />,
                title: "Sunday Slides Export",
                desc: "Turn field highlights into presentation-ready slides in one click for Sunday morning services."
              }
            ].map((feature, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="group p-8 rounded-2xl border border-slate-100 bg-white hover:border-brand/30 hover:shadow-xl hover:shadow-[#1085FD]/5 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-xl bg-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-[#1085FD]/20">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Deep Dive - Presentations */}
      <section className="py-24 md:py-32 px-6 bg-slate-50 border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 lg:pr-12">
            <Reveal>
              <div className="text-brand font-semibold tracking-wider text-sm uppercase mb-4">Made for Sunday Mornings</div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">From the mission field to the sanctuary screen.</h2>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                Stop downloading photos and copy-pasting prayer requests on Saturday night. SentConnect lets your missions team export weekly highlights directly into presentation-ready slides.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  "One-click export to standard presentation formats",
                  "Automatically formats photos and text for visibility",
                  "Include specific prayer requests to guide congregational prayer"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand shrink-0 mt-1" size={20} />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              
              <button className="text-brand font-semibold flex items-center gap-2 group">
                See how it works 
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Reveal>
          </div>
          
          <div className="flex-1 w-full relative">
            <Reveal delay={200}>
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="p-2 bg-slate-200">
                  <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center p-8 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center blur-sm" />
                    <div className="relative z-10 w-full max-w-lg">
                      <h3 className="text-white text-3xl font-bold mb-2">The Jenkins Family</h3>
                      <p className="text-slate-300 text-lg mb-6">Serving in Tokyo, Japan</p>
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl">
                        <div className="text-white font-semibold mb-2">Prayer Request</div>
                        <p className="text-white/90 text-sm leading-relaxed">
                          Please pray for the new community center programs starting this month, that many would feel welcomed and loved.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section id="testimonials" className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <Quote className="text-brand/20 w-20 h-20 mx-auto mb-8 rotate-180" />
            <h2 className="text-2xl md:text-4xl font-medium text-slate-900 mb-10 leading-relaxed">
              "SentConnect changed how our church supports our sent ones. Before, updates got lost in emails. Now, our congregation engages daily, and our missionaries feel truly backed by their church family."
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-tr from-slate-600 to-slate-400" />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900">Pastor Mark Davis</div>
                <div className="text-slate-500 text-sm">Lead Pastor, Grace Fellowship</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Reveal>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to connect your church?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Set up your private church network in minutes. Start bridging the gap between your congregation and the mission field today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto text-lg font-bold text-brand bg-white px-8 py-4 rounded-full hover:bg-slate-50 transition-all hover:shadow-xl active:scale-95 flex items-center justify-center gap-2">
                Create Your Network
              </button>
              <button className="w-full sm:w-auto text-lg font-medium text-white border-2 border-white/30 px-8 py-4 rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                Talk to Sales
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white">
                  <Globe size={18} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">SentConnect</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Building technology to support the local church and global missions.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Features</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Pricing</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Security</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Updates</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Help Center</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Missions Guide</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Contact Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} SentConnect. All rights reserved.</p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors" />
              <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
