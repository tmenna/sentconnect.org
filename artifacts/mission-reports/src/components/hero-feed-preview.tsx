import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon, Smile, Send, MapPin } from "lucide-react";

type Post = {
  id: string;
  author: {
    name: string;
    initials: string;
    avatarColor: string;
  };
  location: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
};

const INITIAL_POSTS: Post[] = [
  {
    id: "0",
    author: { name: "Grace Adeyemi", initials: "GA", avatarColor: "#F43F5E" },
    location: "Jos, Nigeria",
    time: "1h ago",
    content:
      "For two weeks in January, we gathered 18 young leaders from five different villages. These leaders wake before dawn to study. They argued passionately over Scripture. One young woman, Adaeze, is leading a fellowship of 34 women in her village.",
    likes: 19,
    comments: 4,
    isLiked: false,
  },
  {
    id: "1",
    author: { name: "Maria Gonzalez", initials: "MG", avatarColor: "#10B981" },
    location: "Kigali, Rwanda",
    time: "2h ago",
    content:
      "Praise God for an amazing youth outreach! The kids loved the new soccer gear. We shared a simple message about hope and community, and the response was overwhelming. Thank you for making this possible.",
    image: "url(/images/youth-program.png) center/cover no-repeat",
    likes: 12,
    comments: 3,
    isLiked: false,
  },
  {
    id: "2",
    author: { name: "James Okafor", initials: "JO", avatarColor: "#3B82F6" },
    location: "Chiang Mai, Thailand",
    time: "5h ago",
    content:
      "Met with local pastors today to plan the upcoming leadership training seminar. They are so hungry for resources and fellowship. Please pray for wisdom as we finalize the curriculum.",
    likes: 24,
    comments: 5,
    isLiked: true,
  },
  {
    id: "3",
    author: { name: "David Kim", initials: "DK", avatarColor: "#8B5CF6" },
    location: "Nairobi, Kenya",
    time: "1d ago",
    content:
      "Our first day of the rural medical clinic was exhausting but incredibly rewarding. We treated over 100 patients and prayed with many families. The need is great, but we are so thankful for the opportunity to serve.",
    image: "url(/images/medical-outreach.png) center/cover no-repeat",
    likes: 31,
    comments: 8,
    isLiked: false,
  },
];

export function HeroFeedPreview() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [composerText, setComposerText] = useState("");
  const [composerStep, setComposerStep] = useState<"idle" | "typing" | "attaching" | "publishing">("idle");
  const feedRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    let isActive = true;
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const waitWhilePaused = async () => {
      while (isActive && pausedRef.current) {
        await sleep(500);
      }
    };

    // Skip the animation loop entirely for users who prefer reduced motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Pause when offscreen or tab hidden
    let observer: IntersectionObserver | undefined;
    let visible = true;
    const updatePaused = () => {
      pausedRef.current = !visible || document.visibilityState === "hidden";
    };
    if (typeof IntersectionObserver !== "undefined" && rootRef.current) {
      observer = new IntersectionObserver(entries => {
        visible = entries[0]?.isIntersecting ?? true;
        updatePaused();
      });
      observer.observe(rootRef.current);
    }
    const onVisibility = () => updatePaused();
    document.addEventListener("visibilitychange", onVisibility);

    const runSimulation = async () => {
      while (isActive) {
        await sleep(3000);
        await waitWhilePaused();
        if (!isActive) return;

        // Randomly like a post
        if (Math.random() > 0.5) {
          setPosts(prev => {
            const newPosts = [...prev];
            const targetIdx = Math.floor(Math.random() * (newPosts.length > 3 ? 3 : newPosts.length));
            if (!newPosts[targetIdx].isLiked) {
              newPosts[targetIdx] = {
                ...newPosts[targetIdx],
                likes: newPosts[targetIdx].likes + 1,
                isLiked: true,
              };
            }
            return newPosts;
          });
        }

        // Auto scroll down slightly
        if (feedRef.current) {
          feedRef.current.scrollBy({ top: 100, behavior: "smooth" });
        }

        await sleep(4000);
        if (!isActive) return;

        // Start composing a new post
        setComposerStep("typing");
        const textToType =
          "We safely arrived this week and are partnering with a local Church and community leaders to launch a clean water project outside Addis Ababa. The new well will provide safe drinking water for hundreds of people. Please keep the project and our team in your prayers.";
        for (let i = 0; i <= textToType.length; i += 3) {
          if (!isActive) return;
          setComposerText(textToType.substring(0, i));
          await sleep(20 + Math.random() * 30);
        }
        setComposerText(textToType);

        await sleep(1000);
        setComposerStep("attaching");

        await sleep(1500);
        setComposerStep("publishing");

        await sleep(800);
        if (!isActive) return;

        const newPost: Post = {
          id: Date.now().toString(),
          author: { name: "Sarah Jenkins", initials: "SJ", avatarColor: "#F59E0B" },
          location: "Addis Ababa, Ethiopia",
          time: "Just now",
          content: textToType,
          image: "url(/images/addis-well.png) center/cover no-repeat",
          likes: 0,
          comments: 0,
          isLiked: false,
        };

        setPosts(prev => [newPost, ...prev].slice(0, 8));
        setComposerText("");
        setComposerStep("idle");

        if (feedRef.current) {
          feedRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }

        await sleep(5000);
      }
    };

    runSimulation();
    return () => {
      isActive = false;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const handleLike = (id: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            isLiked: !p.isLiked,
          };
        }
        return p;
      }),
    );
  };

  return (
    <div ref={rootRef} className="lp-phone-frame" style={{ width: 390, height: 780, background: "#F8FAFC", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 24px 64px rgba(15,23,42,0.18), 0 2px 8px rgba(15,23,42,0.06)", borderRadius: 40, position: "relative", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#1085FD", color: "#fff", padding: "40px 20px 16px", display: "flex", flexDirection: "column", zIndex: 10, flexShrink: 0, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.8 }}>SentConnect</div>
          <div style={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 500 }}>calvary.sentconnect.org</div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Missions Feed</div>
      </div>

      {/* Feed Area */}
      <div ref={feedRef} className="lp-feed-scroll" style={{ flex: 1, overflowY: "auto", paddingBottom: 80, position: "relative" }}>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Composer */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 2px rgba(15,23,42,0.05)", border: "1px solid #F1F5F9", position: "relative" }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, flexShrink: 0, fontSize: 14 }}>SJ</div>
              <div style={{ flex: 1 }}>
                <div style={{ minHeight: 40, color: "#475569", fontSize: 15, width: "100%", paddingTop: 8, lineHeight: 1.5 }}>
                  {composerText || <span style={{ color: "#94A3B8" }}>Share an update...</span>}
                  {composerStep === "typing" && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      style={{ display: "inline-block", width: 2, height: 16, background: "#1085FD", marginLeft: 4, transform: "translateY(3px)" }}
                    />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {(composerStep === "attaching" || composerStep === "publishing") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 120 }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginBottom: 12, borderRadius: 12, overflow: "hidden" }}
                >
                  <div style={{ width: "100%", height: "100%", background: "url(/images/addis-well.png) center/cover no-repeat" }} />
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #F1F5F9" }}>
              <div style={{ display: "flex", gap: 8, color: "#94A3B8" }}>
                <span style={{ padding: 6 }}><ImageIcon size={18} /></span>
                <span style={{ padding: 6 }}><Smile size={18} /></span>
              </div>
              <span
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 999, fontWeight: 600, fontSize: 14, background: composerText.length > 0 ? "#1085FD" : "#F1F5F9", color: composerText.length > 0 ? "#fff" : "#94A3B8", transition: "background .2s, color .2s" }}
              >
                {composerStep === "publishing" ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }}
                  />
                ) : (
                  <>Post <Send size={14} /></>
                )}
              </span>
            </div>
          </div>

          {/* Posts */}
          <AnimatePresence initial={false}>
            {posts.map(post => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 2px rgba(15,23,42,0.05)", border: "1px solid #F1F5F9" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: post.author.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, flexShrink: 0, fontSize: 14 }}>
                      {post.author.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 15 }}>{post.author.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748B", marginTop: 2 }}>
                        <MapPin size={10} />
                        {post.location} • {post.time}
                      </div>
                    </div>
                  </div>
                  <span style={{ color: "#94A3B8" }}><MoreHorizontal size={20} /></span>
                </div>

                <p style={{ color: "#334155", fontSize: 15, lineHeight: 1.6, margin: "0 0 12px" }}>{post.content}</p>

                {post.image && (
                  <div style={{ width: "100%", height: 192, borderRadius: 12, marginBottom: 12, border: "1px solid #F1F5F9", background: post.image }} />
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #F1F5F9", color: "#64748B" }}>
                  <button
                    onClick={() => handleLike(post.id)}
                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, background: "none", border: "none", cursor: "pointer", color: post.isLiked ? "#EC4899" : "#64748B", padding: 0 }}
                  >
                    <motion.div animate={post.isLiked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }} style={{ display: "flex" }}>
                      <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />
                    </motion.div>
                    {post.likes}
                  </button>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500 }}>
                    <MessageCircle size={18} />
                    {post.comments}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Share2 size={18} />
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 76, background: "#fff", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "flex-start", justifyContent: "space-around", paddingTop: 12, paddingBottom: 20, boxShadow: "0 -10px 20px rgba(0,0,0,0.02)", zIndex: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "#1085FD" }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(16,133,253,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, border: "2px solid #1085FD" }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 600 }}>Feed</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "#94A3B8" }}>
          <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </div>
          <span style={{ fontSize: 10, fontWeight: 500 }}>Explore</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "#94A3B8" }}>
          <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
            <div style={{ position: "absolute", top: 2, right: 2, width: 8, height: 8, background: "#EC4899", borderRadius: "50%", border: "1px solid #fff" }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 500 }}>Alerts</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "#94A3B8" }}>
          <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid currentColor", overflow: "hidden" }}>
              <div style={{ width: "100%", height: "100%", background: "#E2E8F0" }} />
            </div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 500 }}>Profile</span>
        </div>
      </div>

      {/* Home Indicator */}
      <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 128, height: 4, background: "rgba(30,41,59,0.2)", borderRadius: 999, zIndex: 20 }} />
    </div>
  );
}
