import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, Check, Heart, MessageCircle, MapPin, Share2, Upload } from 'lucide-react';

// Using Geist font for a modern tech feel mixed with trust
export function BoldBlue() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#1085FD]/20 selection:text-[#1085FD]" style={{ fontFamily: '"Geist", sans-serif' }}>
      
      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#1085FD] flex items-center justify-center text-white font-bold text-lg leading-none shadow-md shadow-[#1085FD]/30">S</div>
            <span className={`font-bold text-xl tracking-tight ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>SentConnect</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-[#1085FD] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#1085FD] transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-[#1085FD] transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Log in</a>
            <button className="bg-[#1085FD] hover:bg-[#0e74e0] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md shadow-[#1085FD]/20 hover:shadow-lg hover:shadow-[#1085FD]/40 hover:-translate-y-0.5">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-[#1085FD]/10 to-transparent -z-10" />
        <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-[#1085FD]/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-1/4 w-1/3 h-1/3 bg-blue-400/5 blur-[100px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 text-[#1085FD] text-sm font-semibold mb-6 border border-blue-200/50 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1085FD] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1085FD]"></span>
              </span>
              Now available for all churches
            </div>
            
            <h1 className="text-5xl lg:text-[4.5rem] leading-[1.05] font-extrabold text-slate-900 tracking-tight mb-8">
              Stay connected with the <span className="text-[#1085FD]">missionaries</span> you send.
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
              A private, distraction-free feed for your church's missions team. Receive field updates, photos, and prayer requests directly from the people you support.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-[#1085FD] hover:bg-[#0e74e0] text-white px-8 py-4 rounded-full text-base font-semibold transition-all shadow-lg shadow-[#1085FD]/25 hover:shadow-xl hover:shadow-[#1085FD]/40 hover:-translate-y-1 flex items-center justify-center gap-2 group">
                Sign Up Your Church
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-full text-base font-semibold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-slate-700" />
                Try Demo
              </button>
            </div>
            
            <div className="mt-8 flex items-center gap-4 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" style={{ background: 'url(/attached_assets/generated_images/bible-study-group.jpg) center/cover' }} />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300" style={{ background: 'url(/attached_assets/generated_images/well-drilling-team.jpg) center/cover' }} />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-400" style={{ background: 'url(/attached_assets/generated_images/market-outreach.jpg) center/cover' }} />
              </div>
              Trusted by 500+ missions teams
            </div>
          </motion.div>

          {/* Hero Visual - Floating UI */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            {/* Phone Mockup Frame */}
            <div className="relative w-[320px] h-[650px] bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden z-10 rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 z-20 rounded-b-3xl w-40 mx-auto" />
              
              {/* App UI Inside Phone */}
              <div className="w-full h-full bg-slate-50 overflow-hidden flex flex-col">
                <div className="bg-[#1085FD] text-white pt-12 pb-4 px-4 flex flex-col z-10 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-[10px] font-bold tracking-wider uppercase opacity-80">SentConnect</div>
                    <div className="bg-white/20 text-[9px] px-2 py-0.5 rounded-full font-medium">grace.sentconnect.org</div>
                  </div>
                  <div className="text-lg font-bold">Missions Feed</div>
                </div>
                
                <div className="flex-1 p-3 space-y-3 bg-slate-50 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 z-10 pointer-events-none" />
                  
                  {/* Post 1 */}
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                    <div className="flex gap-2 items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs shrink-0">SJ</div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm leading-tight">Sarah Jenkins</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <MapPin size={8} /> Rural Kenya • 2h ago
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-700 text-xs leading-relaxed mb-2">
                      The youth outreach program launched today! Over 50 kids showed up for soccer and a short message.
                    </div>
                    <div className="w-full h-32 rounded-lg bg-slate-200 mb-2 overflow-hidden">
                       <img src="/attached_assets/generated_images/hero-missionary-phone.jpg" className="w-full h-full object-cover" alt="Missionary outreach" />
                    </div>
                    <div className="flex items-center gap-4 text-slate-400 text-xs">
                      <span className="flex items-center gap-1 text-pink-500"><Heart size={14} className="fill-current" /> 24</span>
                      <span className="flex items-center gap-1"><MessageCircle size={14} /> 5</span>
                    </div>
                  </div>

                  {/* Post 2 */}
                   <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                    <div className="flex gap-2 items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">MG</div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm leading-tight">Mark & Gina</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <MapPin size={8} /> Chiang Mai • 5h ago
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-700 text-xs leading-relaxed">
                      Praise report: The leadership training manuals finally cleared customs!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-20 -left-12 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 z-20 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
                <Heart size={20} className="fill-current" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">New Supporter</div>
                <div className="text-xs text-slate-500">Pastor Dave loved a post</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-32 -right-16 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 z-20 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1085FD]">
                <MessageCircle size={20} className="fill-current" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Prayer Team</div>
                <div className="text-xs text-slate-500">"Praying for this now!"</div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-10 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Connecting missionaries from</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Abstract logo shapes indicating churches/organizations */}
             <div className="flex items-center gap-2 font-bold text-xl"><div className="w-6 h-6 bg-slate-800 rounded-sm" /> Grace Fellowship</div>
             <div className="flex items-center gap-2 font-bold text-xl"><div className="w-6 h-6 rounded-full border-4 border-slate-800" /> Christ Church</div>
             <div className="flex items-center gap-2 font-bold text-xl"><div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-slate-800" /> Trinity</div>
             <div className="flex items-center gap-2 font-bold text-xl"><div className="w-6 h-6 border-2 border-slate-800 rotate-45" /> Anthem</div>
          </div>
        </div>
      </section>

      {/* Main Feature / Problem-Solution */}
      <section id="features" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Social media is noisy. <br/>Newsletters get lost.</h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Missionaries need a secure, immediate way to share what God is doing, and churches need a simple way to stay engaged without fighting algorithms.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 text-[#1085FD] rounded-2xl flex items-center justify-center mb-6">
                <MapPin size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Private Church Feed</h3>
              <p className="text-slate-600 leading-relaxed">
                Your own dedicated URL (<span className="text-[#1085FD] font-medium">yourchurch.sentconnect.org</span>) accessible only to approved church members.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 text-[#1085FD] rounded-2xl flex items-center justify-center mb-6">
                <Upload size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Rich Field Updates</h3>
              <p className="text-slate-600 leading-relaxed">
                Missionaries can post short text updates, up to 6 photos, or short videos directly from their phones, even on slow connections.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 text-[#1085FD] rounded-2xl flex items-center justify-center mb-6">
                <Heart size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Meaningful Engagement</h3>
              <p className="text-slate-600 leading-relaxed">
                Church members can like, love, and comment on updates, sending immediate encouragement back to the field.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive - Sunday Slides */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-[#1085FD]/5 rounded-[3rem] transform -rotate-3 scale-105" />
              <img 
                src="/attached_assets/generated_images/blue-texture-bg.jpg" 
                alt="Presentation background" 
                className="relative rounded-3xl shadow-2xl w-full object-cover h-[400px]"
              />
              <div className="absolute inset-0 flex items-center justify-center z-10 p-8">
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
                  <div className="text-[#1085FD] font-bold text-sm mb-2 uppercase tracking-wide">Missionary Highlight</div>
                  <div className="text-2xl font-bold text-slate-900 mb-4 font-serif">"The new well is finally complete!"</div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500" />
                    <div>
                      <div className="font-bold text-slate-900">The Jenkins Family</div>
                      <div className="text-sm text-slate-500">Ethiopia</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-slate-900 text-white p-4 rounded-xl shadow-xl font-medium flex items-center gap-3 z-20">
                <Check className="text-emerald-400" />
                Exported to PowerPoint
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold mb-6">
                Sunday Mornings
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Ready for Sunday service.</h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8">
                No more copy-pasting from emails or digging through Facebook groups on Saturday night. Export the week's top updates directly into presentation-ready slides.
              </p>
              
              <ul className="space-y-4">
                {['One-click PowerPoint/Keynote export', 'High-res photos preserved automatically', 'Formatted for legibility on large screens'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 text-[#1085FD] flex items-center justify-center shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Impact */}
      <section className="py-24 bg-[#1085FD] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: 'url(/attached_assets/generated_images/blue-texture-bg.jpg) center/cover' }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Heart className="w-12 h-12 text-blue-300 mx-auto mb-8 opacity-80" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-8 font-serif">
            "Before SentConnect, our church felt disconnected from our sent ones. Now, our congregation prays specifically and immediately for needs on the field. It has transformed our missions culture."
          </h2>
          <div className="font-semibold text-lg tracking-wide">— David R., Missions Pastor</div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Bring your sent ones closer.</h2>
          <p className="text-xl text-slate-600 font-medium mb-10 max-w-2xl mx-auto">
            Set up your church's private network in minutes. Invite your missionaries. Start connecting.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button className="bg-[#1085FD] hover:bg-[#0e74e0] text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg shadow-[#1085FD]/25 hover:shadow-xl hover:shadow-[#1085FD]/40 hover:-translate-y-1">
                Start 14-Day Free Trial
              </button>
              <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-sm hover:shadow">
                Book a Demo
              </button>
          </div>
          <p className="mt-6 text-sm text-slate-500 font-medium">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4 text-white">
              <div className="w-6 h-6 rounded bg-[#1085FD] flex items-center justify-center font-bold text-sm leading-none">S</div>
              <span className="font-bold text-lg tracking-tight">SentConnect</span>
            </div>
            <p className="text-sm max-w-xs mb-6">
              Helping churches stay connected with the missionaries they send and support.
            </p>
            <div className="text-xs">© {new Date().getFullYear()} SentConnect Inc. All rights reserved.</div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
           <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}