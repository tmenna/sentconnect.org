import React from "react";
import { motion } from "framer-motion";
import { 
  Heart, 
  Image as ImageIcon, 
  Send, 
  Users, 
  ArrowRight, 
  Download, 
  Globe, 
  MessageCircle, 
  Mail, 
  Camera, 
  Share 
} from "lucide-react";

// Add a style tag for our custom fonts and variables
const FontStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

    .font-serif {
      font-family: 'Lora', serif;
    }
    .font-sans {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    
    .bg-warm-cream { background-color: #FDFBF7; }
    .bg-warm-sand { background-color: #F4EFE6; }
    .text-warm-dark { color: #2C2926; }
    .text-warm-muted { color: #5C564D; }
    .border-warm { border-color: #E8E2D9; }
    
    .text-brand { color: #1085FD; }
    .bg-brand { background-color: #1085FD; }
    .bg-brand-hover { background-color: #0d73df; }
    .ring-brand { --tw-ring-color: #1085FD; }
    
    .glass-panel {
      background: rgba(253, 251, 247, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(232, 226, 217, 0.5);
    }
  `}} />
);

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export function WarmBlue() {
  return (
    <div className="min-h-screen bg-warm-cream font-sans text-warm-dark overflow-hidden selection:bg-brand selection:text-white">
      <FontStyles />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-warm transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white">
              <Globe size={18} strokeWidth={2.5} />
            </div>
            <span className="font-serif font-semibold text-xl tracking-tight">SentConnect</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-warm-muted">
            <a href="#features" className="hover:text-warm-dark transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-warm-dark transition-colors">How it Works</a>
            <a href="#stories" className="hover:text-warm-dark transition-colors">Stories</a>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-warm-dark hidden sm:block hover:text-brand transition-colors">
              Log in
            </button>
            <button className="text-sm font-medium bg-brand text-white px-5 py-2.5 rounded-full hover:bg-brand-hover transition-colors shadow-sm">
              Try Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative">
        {/* Soft background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-brand/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-xl">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warm-sand text-brand text-sm font-medium mb-8 border border-warm">
                <Heart size={14} className="fill-brand/20" />
                <span>For churches & missionaries</span>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.1}>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.1] text-warm-dark mb-6 tracking-tight">
                Helping churches stay connected with the missionaries they send.
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <p className="text-lg md:text-xl text-warm-muted leading-relaxed mb-10">
                A private, dedicated space for field updates, photos, and prayer requests. Away from the noise of social media, designed for the family of faith.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.3} className="flex flex-col sm:flex-row items-center gap-4">
              <button className="w-full sm:w-auto px-8 py-4 bg-brand text-white rounded-full font-medium text-lg hover:bg-brand-hover hover:-translate-y-0.5 transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2">
                Start your church network
                <ArrowRight size={18} />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-warm-dark border border-warm rounded-full font-medium text-lg hover:bg-warm-sand transition-all">
                Try Demo
              </button>
            </FadeIn>
          </div>
          
          {/* Hero Mockup UI */}
          <div className="relative">
            <FadeIn delay={0.4}>
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-warm p-6 max-w-md mx-auto rotate-1 hover:rotate-0 transition-transform duration-500">
                {/* Mock App Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-warm">
                  <div>
                    <h3 className="font-serif font-medium text-lg">Grace Community Church</h3>
                    <p className="text-xs text-warm-muted">yourchurch.sentconnect.org</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-warm-sand flex items-center justify-center text-brand font-serif font-bold">
                    GC
                  </div>
                </div>
                
                {/* Mock Post */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=F4EFE6" alt="Avatar" className="w-12 h-12 rounded-full border border-warm bg-warm-sand" />
                    <div>
                      <p className="font-medium text-warm-dark">The Miller Family</p>
                      <p className="text-xs text-warm-muted">Serving in Osaka, Japan • 2 hours ago</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-warm-dark leading-relaxed">
                    We finally moved into our new apartment! It has been a long journey but we feel so welcomed by our neighbors. Please pray for our language studies this week as we prepare for our first community gathering.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                    <div className="aspect-square bg-warm-sand rounded-tl-xl flex items-center justify-center text-warm-muted">
                      <ImageIcon size={24} className="opacity-50" />
                    </div>
                    <div className="aspect-square bg-warm-sand rounded-tr-xl flex items-center justify-center text-warm-muted">
                      <ImageIcon size={24} className="opacity-50" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 pt-2 text-sm text-warm-muted">
                    <div className="flex items-center gap-1.5 hover:text-brand cursor-pointer transition-colors">
                      <Heart size={16} /> <span>24</span>
                    </div>
                    <div className="flex items-center gap-1.5 hover:text-brand cursor-pointer transition-colors">
                      <MessageCircle size={16} /> <span>5</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
            
            {/* Floating Elements */}
            <motion.div 
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute -bottom-6 -left-12 bg-white rounded-2xl shadow-xl border border-warm p-4 flex items-center gap-4 z-20"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand">
                <Heart size={20} className="fill-brand text-brand" />
              </div>
              <div>
                <p className="text-xs text-warm-muted">New reaction</p>
                <p className="text-sm font-medium">Pastor Dave loved your update</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="how-it-works" className="py-24 bg-warm-sand relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl md:text-4xl text-warm-dark mb-6">
              Letters home, modernized.
            </h2>
            <p className="text-lg text-warm-muted leading-relaxed max-w-2xl mx-auto mb-12">
              Email newsletters get lost in spam folders. Social media algorithms bury updates. SentConnect creates a quiet, focused space where your congregation can meaningfully engage with the people you support.
            </p>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { icon: Users, title: "Private Community", desc: "A dedicated portal just for your church. No algorithms, no ads, no distractions." },
              { icon: Mail, title: "Email Notifications", desc: "Members get gentle digests of new updates without having to check the app constantly." },
              { icon: Heart, title: "Meaningful Support", desc: "Let missionaries know they are prayed for with one-tap loves and personal comments." }
            ].map((feature, i) => (
              <FadeIn key={i} delay={0.1 * (i + 1)}>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-warm h-full">
                  <div className="w-12 h-12 rounded-2xl bg-warm-cream border border-warm flex items-center justify-center text-brand mb-6">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="font-serif font-medium text-xl mb-3">{feature.title}</h3>
                  <p className="text-warm-muted text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <span className="text-brand font-medium text-sm tracking-wide uppercase">Built for Ministry</span>
            <h2 className="font-serif text-4xl text-warm-dark mt-4 mb-4">Everything you need to stay close</h2>
            <p className="text-warm-muted text-lg max-w-xl mx-auto">Tools designed specifically for the rhythm of church life and global missions.</p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Feature 1: Rich Media */}
          <FadeIn delay={0.1} className="md:col-span-2">
            <div className="bg-white rounded-[2rem] border border-warm overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row items-center">
              <div className="p-12 md:w-1/2">
                <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-6">
                  <Camera size={24} />
                </div>
                <h3 className="font-serif text-2xl font-medium mb-4">Share the full picture</h3>
                <p className="text-warm-muted leading-relaxed">
                  Words are powerful, but seeing the faces of the people being served changes everything. Missionaries can upload up to 6 high-quality photos or short video clips per update.
                </p>
              </div>
              <div className="bg-warm-sand w-full md:w-1/2 h-full min-h-[300px] p-8 flex items-center justify-center relative overflow-hidden">
                <div className="grid grid-cols-2 gap-3 w-full max-w-xs rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-[4/5] bg-white rounded-xl shadow-sm border border-warm p-1">
                    <div className="w-full h-full bg-[#E5E0D8] rounded-lg animate-pulse" />
                  </div>
                  <div className="aspect-[4/5] bg-white rounded-xl shadow-sm border border-warm p-1 mt-8">
                    <div className="w-full h-full bg-[#E5E0D8] rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Feature 2: Presentation Ready */}
          <FadeIn delay={0.2}>
            <div className="bg-white rounded-[2rem] border border-warm p-10 h-full shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-6">
                <Download size={24} />
              </div>
              <h3 className="font-serif text-2xl font-medium mb-4">Sunday Morning Ready</h3>
              <p className="text-warm-muted leading-relaxed mb-8">
                Missions moment this Sunday? Export any update and its photos directly into a beautiful, presentation-ready slide format with one click.
              </p>
              <div className="bg-warm-sand rounded-xl p-4 flex items-center justify-between border border-warm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded shadow-sm flex items-center justify-center text-warm-dark">
                    <ImageIcon size={18} />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Miller_Update.pptx</p>
                    <p className="text-warm-muted text-xs">Generated just now</p>
                  </div>
                </div>
                <button className="text-brand hover:bg-brand/5 p-2 rounded-full transition-colors">
                  <Download size={20} />
                </button>
              </div>
            </div>
          </FadeIn>

          {/* Feature 3: Custom Domain */}
          <FadeIn delay={0.3}>
            <div className="bg-warm-sand rounded-[2rem] border border-warm p-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-white text-warm-dark flex items-center justify-center mb-6 shadow-sm">
                  <Globe size={24} />
                </div>
                <h3 className="font-serif text-2xl font-medium mb-4">Your Church's Home</h3>
                <p className="text-warm-muted leading-relaxed mb-8">
                  Get a dedicated, private space for your congregation. Invite members via a simple link, and keep your missionary updates secure and internal.
                </p>
              </div>
              <div className="bg-white rounded-full py-3 px-5 border border-warm flex items-center justify-between shadow-sm">
                <span className="text-sm font-medium text-warm-dark truncate">gracechurch.sentconnect.org</span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Secure</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Quote/Testimonial Section */}
      <section className="py-24 bg-brand text-white text-center px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <FadeIn>
            <Heart size={40} className="mx-auto mb-8 text-white/80 fill-white/20" />
            <blockquote className="font-serif text-2xl md:text-4xl leading-relaxed font-medium mb-8">
              "We used to send PDF newsletters that maybe 10% of our supporters read. Now, we post a short update and photo on SentConnect, and within hours we have members of our sending church commenting that they are praying for us."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                <span className="font-serif font-bold">SM</span>
              </div>
              <div className="text-left">
                <p className="font-medium">Sarah & Mark T.</p>
                <p className="text-white/80 text-sm">Serving in Southeast Asia</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <FadeIn>
          <div className="max-w-4xl mx-auto bg-white rounded-[3rem] border border-warm p-12 md:p-20 text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-warm-sand rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
            
            <h2 className="font-serif text-4xl md:text-5xl text-warm-dark mb-6 relative z-10">
              Bring your church and your missionaries closer.
            </h2>
            <p className="text-xl text-warm-muted mb-10 max-w-2xl mx-auto relative z-10">
              Create your private church network in minutes. First 30 days are completely free.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
              <button className="w-full sm:w-auto px-8 py-4 bg-brand text-white rounded-full font-medium text-lg hover:bg-brand-hover hover:-translate-y-0.5 transition-all shadow-md hover:shadow-xl">
                Sign Up for SentConnect
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-warm-cream text-warm-dark border border-warm rounded-full font-medium text-lg hover:bg-warm-sand transition-all">
                Book a Demo
              </button>
            </div>
            
            <p className="mt-8 text-sm text-warm-muted relative z-10">
              No credit card required for setup. Simple, transparent pricing for churches of all sizes.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-warm pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-white">
              <Globe size={12} strokeWidth={2.5} />
            </div>
            <span className="font-serif font-semibold text-lg text-warm-dark">SentConnect</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-warm-muted">
            <a href="#" className="hover:text-warm-dark transition-colors">Privacy</a>
            <a href="#" className="hover:text-warm-dark transition-colors">Terms</a>
            <a href="#" className="hover:text-warm-dark transition-colors">Contact</a>
          </div>
          
          <p className="text-sm text-warm-muted">
            © {new Date().getFullYear()} SentConnect. Made with care for the Church.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default WarmBlue;
