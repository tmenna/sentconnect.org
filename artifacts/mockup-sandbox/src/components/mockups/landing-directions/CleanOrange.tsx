import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Camera, Heart, MessageCircle, Share2, MoreHorizontal, ArrowUpRight, Rss, Bell, Check, Users, Shield, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

// Primary color from requirements
const BRAND_ORANGE = "#FF4405";

const FADE_IN_UP = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

const STAGGER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

// --- Mock Data ---

const HIGHLIGHT_SLIDES = [
  { id: 1, text: "We treated over 100 patients and prayed with many families. The need is great, but we are so thankful for the opportunity to serve.", author: "David Kim", location: "Nairobi, Kenya" },
  { id: 2, text: "For two weeks in January, we gathered 18 young leaders from five different villages. These leaders wake before dawn to study.", author: "Grace Adeyemi", location: "Jos, Nigeria" },
  { id: 3, text: "Praise God for an amazing youth outreach! The kids loved the new gear and the response was overwhelming.", author: "Maria Gonzalez", location: "Kigali, Rwanda" }
];

// --- Components ---

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-50/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF4405] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" fill="white" fillOpacity="0.2"/>
              <path d="M12 2V22M2 12H22M4.92893 4.92893L19.0711 19.0711M4.92893 19.0711L19.0711 4.92893" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-neutral-900">SentConnect</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">How it works</a>
          <a href="#pricing" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden sm:block text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Log in</button>
          <button className="h-10 px-5 bg-[#FF4405] text-white text-sm font-medium rounded-full shadow-lg shadow-orange-500/20 hover:bg-[#E63D04] hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-200">
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-50 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-8 items-center">
          
          {/* Left copy */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={STAGGER}
            className="max-w-2xl"
          >
            <motion.div variants={FADE_IN_UP} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-[#FF4405] text-sm font-medium mb-8 border border-orange-100/50">
              <span className="w-2 h-2 rounded-full bg-[#FF4405]" />
              Built for sending churches
            </motion.div>
            
            <motion.h1 variants={FADE_IN_UP} className="text-5xl md:text-6xl lg:text-[4rem] font-bold text-neutral-900 leading-[1.05] tracking-tight mb-6">
              Helping churches stay connected with the missionaries they send and support.
            </motion.h1>
            
            <motion.p variants={FADE_IN_UP} className="text-lg md:text-xl text-neutral-500 leading-relaxed mb-10 max-w-xl">
              Replace scattered email newsletters and noisy WhatsApp groups with a private, beautiful space dedicated entirely to field updates, prayer requests, and genuine connection.
            </motion.p>
            
            <motion.div variants={FADE_IN_UP} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button className="w-full sm:w-auto h-14 px-8 bg-[#FF4405] text-white text-base font-semibold rounded-full shadow-xl shadow-orange-500/25 hover:bg-[#E63D04] hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
                Sign Up for your church <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto h-14 px-8 bg-white text-neutral-700 text-base font-semibold rounded-full border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2">
                Try Demo
              </button>
            </motion.div>
            
            <motion.p variants={FADE_IN_UP} className="mt-6 text-sm text-neutral-400 font-medium">
              No credit card required • Setup in 2 minutes
            </motion.p>
          </motion.div>

          {/* Right illustration / interactive element */}
          <motion.div 
            initial={{ opacity: 0, x: 20, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:-mr-12"
          >
            {/* Main App Window Mockup */}
            <div className="relative rounded-2xl bg-white border border-neutral-200 shadow-2xl shadow-neutral-900/10 overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform duration-500 origin-bottom-right">
              {/* Browser header */}
              <div className="h-12 bg-neutral-50 border-b border-neutral-100 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto bg-white rounded-md border border-neutral-200 text-[10px] text-neutral-400 font-medium px-4 py-1 flex items-center gap-2">
                  <Shield className="w-3 h-3" /> calvary.sentconnect.org
                </div>
              </div>
              
              {/* App Content Fake */}
              <div className="p-6 bg-neutral-50/50">
                {/* Fake Post */}
                <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      JO
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 text-sm">James Okafor</p>
                      <p className="text-xs text-neutral-500">Chiang Mai, Thailand • 2h ago</p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed mb-4">
                    Met with local pastors today to plan the upcoming leadership training seminar. They are so hungry for resources and fellowship. Please pray for wisdom as we finalize the curriculum.
                  </p>
                  <div className="aspect-video rounded-lg overflow-hidden bg-neutral-100 mb-4 border border-neutral-100">
                    <img src="/attached_assets/generated_images/thailand-training.jpg" alt="Training" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-6 pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5 text-orange-500">
                      <Heart className="w-5 h-5 fill-current" />
                      <span className="text-sm font-medium">24</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Notification */}
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.6, type: "spring" }}
              className="absolute -bottom-6 -left-12 bg-white rounded-xl shadow-xl shadow-neutral-900/10 border border-neutral-100 p-4 flex items-center gap-4 z-20 w-72"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#FF4405]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">New update posted</p>
                <p className="text-xs text-neutral-500">Email notification sent to 240 members</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="py-12 border-y border-neutral-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-8">Trusted by sending churches worldwide</p>
        <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 opacity-40 grayscale">
          {/* Mock Logos - using typography to keep it clean */}
          <span className="font-serif font-bold text-2xl text-neutral-900">Grace Fellowship</span>
          <span className="font-sans font-black tracking-tight text-2xl text-neutral-900">CITY<span className="font-light">CHURCH</span></span>
          <span className="font-sans font-semibold text-xl text-neutral-900 flex items-center gap-2"><span className="w-6 h-6 border-2 border-current rounded-full" /> Redeemer</span>
          <span className="font-serif italic text-2xl text-neutral-900">Trinity</span>
          <span className="font-sans font-bold text-xl tracking-widest text-neutral-900">HOPE</span>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section id="features" className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
            Everything your church needs to stay connected.
          </h2>
          <p className="text-lg text-neutral-500">
            A beautiful, focused platform designed specifically for the unique needs of global missions communication.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group rounded-3xl bg-neutral-50 p-8 border border-neutral-100 hover:bg-white hover:shadow-xl hover:shadow-neutral-900/5 hover:border-orange-100 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#FF4405] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Rich Field Updates</h3>
            <p className="text-neutral-500 leading-relaxed">
              Missionaries can share full stories with up to 6 high-res photos or short videos per post. No more compressing images for email.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group rounded-3xl bg-neutral-50 p-8 border border-neutral-100 hover:bg-white hover:shadow-xl hover:shadow-neutral-900/5 hover:border-orange-100 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#FF4405] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Genuine Engagement</h3>
            <p className="text-neutral-500 leading-relaxed">
              Church members can like, love, and comment on updates. Missionaries see exactly who is praying for them in real-time.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group rounded-3xl bg-neutral-50 p-8 border border-neutral-100 hover:bg-white hover:shadow-xl hover:shadow-neutral-900/5 hover:border-orange-100 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#FF4405] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Private & Secure</h3>
            <p className="text-neutral-500 leading-relaxed">
              A private web address just for your church (e.g. grace.sentconnect.org). Safe for sensitive regions, with fine-grained access control.
            </p>
          </div>
        </div>

        {/* Feature Highlights with Images */}
        <div className="mt-32 space-y-32">
          
          {/* Image Left, Text Right */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-orange-500/10 translate-x-4 translate-y-4 rounded-2xl -z-10 transition-transform group-hover:translate-x-6 group-hover:translate-y-6" />
              <div className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-lg">
                <img src="/attached_assets/generated_images/brazil-clinic.jpg" alt="Medical clinic outreach in Brazil" className="w-full h-auto object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 ring-1 ring-inset ring-neutral-900/10 rounded-2xl pointer-events-none" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-[#FF4405] text-sm font-medium mb-6">
                <Bell className="w-4 h-4" /> Smart Notifications
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 tracking-tight">Never miss a critical prayer request again.</h3>
              <p className="text-lg text-neutral-500 leading-relaxed mb-8">
                Not everyone checks a portal every day. When a missionary posts an update, SentConnect automatically formats a beautiful email digest and sends it to your church list.
              </p>
              <ul className="space-y-4">
                {[
                  "Automatic formatting optimized for mobile",
                  "Daily or weekly digest options",
                  "Direct links back to the full post to leave comments"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-[#FF4405] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Text Left, Image Right */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-[#FF4405] text-sm font-medium mb-6">
                <ArrowUpRight className="w-4 h-4" /> Sunday Ready
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 tracking-tight">From field update to Sunday slides in one click.</h3>
              <p className="text-lg text-neutral-500 leading-relaxed mb-8">
                Stop copying and pasting text into PowerPoint. Missions pastors can tag important updates as "Highlights" and export them instantly as beautifully formatted, 16:9 presentation slides.
              </p>
              <ul className="space-y-4">
                {[
                  "High-resolution image export",
                  "Auto-scales text for readable presentations",
                  "Maintains your church's custom branding"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-[#FF4405] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 relative group">
              <div className="absolute inset-0 bg-neutral-900/5 -translate-x-4 translate-y-4 rounded-2xl -z-10 transition-transform group-hover:-translate-x-6 group-hover:translate-y-6" />
              
              {/* Slides Mockup Presentation */}
              <div className="relative bg-neutral-900 rounded-2xl p-2 shadow-2xl border border-neutral-800">
                <div className="aspect-[16/9] bg-white rounded-xl overflow-hidden relative">
                  <img src="/attached_assets/generated_images/kenya-bible-study.jpg" alt="Bible study background" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 to-neutral-900/40" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-center">
                    <div className="w-12 h-1 bg-[#FF4405] mb-6" />
                    <p className="text-2xl font-serif text-white mb-6 max-w-lg leading-snug">
                      "God is moving powerfully in the Kibera community. We had 34 new believers join our discipleship group this week."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white font-bold text-sm">
                        JO
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">James Okafor</p>
                        <p className="text-xs text-white/70">Nairobi, Kenya</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function TestimonialSection() {
  return (
    <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <div className="text-[#FF4405] mb-8 flex justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 11L8.5 17H5.5L7 11H5V7H10V11ZM19 11L17.5 17H14.5L16 11H14V7H19V11Z" />
          </svg>
        </div>
        <h2 className="text-3xl md:text-5xl font-serif leading-tight mb-10 text-neutral-100">
          "Before SentConnect, our missionaries felt isolated. We sent money, but we didn't send community. Now, our church members interact directly with field updates daily. It has completely transformed how we do missions."
        </h2>
        <div>
          <p className="font-bold text-lg">Pastor Sarah Jenkins</p>
          <p className="text-neutral-400">Missions Director, Grace Fellowship</p>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-orange-50 rounded-[3rem] p-12 md:p-20 text-center border border-orange-100 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-[#FF4405] rounded-full blur-3xl opacity-10" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 tracking-tight">Ready to connect your church?</h2>
            <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto">
              Set up your private church address in minutes. Invite your missionaries. Bring your congregation along for the journey.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button className="h-14 px-8 w-full sm:w-auto bg-[#FF4405] text-white text-lg font-semibold rounded-full shadow-xl shadow-orange-500/25 hover:bg-[#E63D04] hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300">
                Sign Up Now
              </button>
              <button className="h-14 px-8 w-full sm:w-auto bg-white text-neutral-700 text-lg font-semibold rounded-full border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-100 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2 pr-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded bg-[#FF4405] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" fill="white" fillOpacity="0.2"/>
                  <path d="M12 2V22M2 12H22M4.92893 4.92893L19.0711 19.0711M4.92893 19.0711L19.0711 4.92893" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight text-neutral-900">SentConnect</span>
            </div>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              A dedicated platform helping sending churches and global workers maintain authentic, secure connection.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4 text-sm">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-neutral-500 hover:text-[#FF4405] transition-colors">Features</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-[#FF4405] transition-colors">Pricing</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-[#FF4405] transition-colors">Security</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4 text-sm">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-neutral-500 hover:text-[#FF4405] transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-[#FF4405] transition-colors">Missions Blog</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-[#FF4405] transition-colors">Best Practices</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4 text-sm">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-neutral-500 hover:text-[#FF4405] transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-[#FF4405] transition-colors">Contact</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-[#FF4405] transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-400">© 2024 SentConnect. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm text-neutral-400">
            <a href="#" className="hover:text-neutral-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function CleanOrange() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-orange-100 selection:text-orange-900">
      <NavBar />
      <main>
        <HeroSection />
        <TrustSection />
        <FeaturesSection />
        <TestimonialSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
