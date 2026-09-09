import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  FileText,
  HeartHandshake,
  Home,
  Image,
  LayoutDashboard,
  LineChart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Users,
} from "lucide-react";

type IconType = typeof Home;

const navItems: { label: string; icon: IconType; active?: boolean }[] = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Missions Feed", icon: HeartHandshake },
  { label: "Missionaries", icon: Users },
  { label: "Weekly Digest", icon: FileText },
];

const updates = [
  {
    initials: "AR",
    name: "Amara & Daniel Reed",
    location: "Nairobi, Kenya",
    time: "2 hours ago",
    tint: "bg-[#dcebf1] text-[#155e75]",
    title: "A small library, a very big welcome",
    body: "The first shelves are up at Kijiji Hope School. We spent the afternoon reading with the students and hearing what they want to discover next.",
    stat: "18 reactions",
    image: "bg-[linear-gradient(135deg,#9fc6c2_0%,#e5d9bd_52%,#e7b27e_100%)]",
  },
  {
    initials: "JM",
    name: "Jonah Miller",
    location: "Cochabamba, Bolivia",
    time: "Yesterday",
    tint: "bg-[#f3e7d7] text-[#955f28]",
    title: "A week of new conversations",
    body: "Thank you for praying for the neighborhood visits. We met three families this week and have begun planning a shared community meal for April.",
    stat: "11 reactions",
    image: "bg-[linear-gradient(135deg,#c4d5bf_0%,#dbe4e0_48%,#c9a17e_100%)]",
  },
];

function NavItem({
  label,
  icon: Icon,
  active,
}: {
  label: string;
  icon: IconType;
  active?: boolean;
}) {
  return (
    <div
      className={`group flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-colors ${
        active
          ? "bg-[#e5f2f8] text-[#075985]"
          : "text-[#5f7180] hover:bg-[#f0f5f8] hover:text-[#183b53]"
      }`}
    >
      <Icon className={`h-[17px] w-[17px] ${active ? "text-[#0879ae]" : "text-[#7c8d99]"}`} strokeWidth={1.8} />
      <span>{label}</span>
      {label === "Missions Feed" && (
        <span className="ml-auto rounded-full bg-[#dbeef7] px-1.5 py-0.5 text-[10px] font-semibold text-[#0b6b98]">
          4
        </span>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  icon: IconType;
  accent: string;
}) {
  return (
    <div className="rounded-[14px] border border-[#dce6eb] bg-[#fffefd] px-4 py-3.5 shadow-[0_2px_8px_rgba(24,59,83,0.025)]">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8293a0]">{label}</span>
        <span className={`rounded-[8px] p-1.5 ${accent}`}>
          <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[25px] font-semibold tracking-[-0.04em] text-[#183b53]">{value}</span>
        <span className="text-[11px] font-medium text-[#5ca183]">{detail}</span>
      </div>
    </div>
  );
}

function UpdateCard({
  initials,
  name,
  location,
  time,
  tint,
  title,
  body,
  stat,
  image,
}: (typeof updates)[number]) {
  return (
    <article className="overflow-hidden rounded-[14px] border border-[#dce6eb] bg-[#fffefd] shadow-[0_2px_8px_rgba(24,59,83,0.025)] transition-shadow hover:shadow-[0_7px_22px_rgba(24,59,83,0.08)]">
      <div className={`relative h-[70px] overflow-hidden ${image}`}>
        <div className="absolute -right-3 -top-8 h-28 w-28 rounded-full border-[14px] border-white/20" />
        <div className="absolute bottom-[-34px] left-5 h-20 w-20 rounded-full border-[12px] border-white/30" />
        <span className="absolute right-3 top-3 rounded-full bg-white/70 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#4c6977] backdrop-blur-sm">
          Field update
        </span>
      </div>
      <div className="px-4 pb-3.5">
        <div className="relative -mt-4 flex items-end justify-between">
          <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] border-2 border-white text-[11px] font-bold ${tint}`}>
            {initials}
          </div>
          <span className="pb-1 text-[10px] text-[#8a9aa4]">{time}</span>
        </div>
        <div className="mt-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#3f5968]">{name}</span>
            <span className="text-[#b2c0c7]">·</span>
            <span className="flex items-center gap-1 text-[10px] text-[#8a9aa4]">
              <MapPin className="h-3 w-3" strokeWidth={1.7} />
              {location}
            </span>
          </div>
          <h3 className="mt-2 text-[14px] font-semibold leading-[1.25] tracking-[-0.015em] text-[#183b53]">{title}</h3>
          <p className="mt-1.5 text-[11px] leading-[1.55] text-[#667d89]">{body}</p>
        </div>
        <div className="mt-3 flex items-center gap-4 border-t border-[#edf1f3] pt-2.5 text-[10px] font-medium text-[#7f919d]">
          <span className="flex items-center gap-1.5 text-[#5a8294]">
            <HeartHandshake className="h-3.5 w-3.5" strokeWidth={1.7} />
            {stat}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.7} />
            Reply
          </span>
          <MoreHorizontal className="ml-auto h-4 w-4" strokeWidth={1.7} />
        </div>
      </div>
    </article>
  );
}

export function SentConnectDashboard() {
  return (
    <div className="min-h-[720px] w-full overflow-hidden bg-[#eef4f7] font-sans text-[#183b53]">
      <header className="flex h-[62px] items-center justify-between bg-[#086fa5] px-7 text-white shadow-[0_2px_12px_rgba(5,74,112,0.15)]">
        <div className="flex items-center gap-6">
          <div className="flex h-[42px] w-[118px] items-center justify-center overflow-hidden">
            <img
              src="/__mockup/images/sentconnect-logo-white.png"
              alt="SentConnect"
              className="h-[92px] w-[92px] object-contain"
            />
          </div>
          <div className="h-6 w-px bg-white/20" />
          <span className="text-[12px] font-medium tracking-[0.02em] text-white/85">Missions Feed</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex h-8 w-[220px] items-center rounded-[8px] bg-white/10 px-3 text-white/60">
            <Search className="mr-2 h-3.5 w-3.5" strokeWidth={2} />
            <span className="text-[11px]">Search updates or people</span>
            <span className="absolute right-2.5 rounded border border-white/15 px-1.5 py-0.5 text-[9px] text-white/50">⌘ K</span>
          </div>
          <button className="relative rounded-[8px] p-2 text-white/80 transition-colors hover:bg-white/10" aria-label="Notifications">
            <Bell className="h-[17px] w-[17px]" strokeWidth={1.8} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#f7c76b]" />
          </button>
          <div className="flex items-center gap-2 border-l border-white/20 pl-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d7eef5] text-[10px] font-bold text-[#0d668e]">RC</div>
            <div className="hidden text-left xl:block">
              <div className="text-[11px] font-semibold">Redeemer Church</div>
              <div className="text-[9px] text-white/65">Administrator</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-white/65" strokeWidth={1.8} />
          </div>
        </div>
      </header>

      <div className="flex h-[658px]">
        <aside className="flex w-[214px] shrink-0 flex-col border-r border-[#dce7ec] bg-[#f8fbfc] px-3.5 py-5">
          <div className="mb-5 px-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8ca0ab]">Workspace</div>
            <div className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-[#21455c]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#50a580]" />
              Redeemer Church
              <ChevronDown className="ml-auto h-3.5 w-3.5 text-[#9aabb5]" strokeWidth={1.8} />
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </nav>
          <div className="my-5 h-px bg-[#e1eaee]" />
          <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9aabb5]">Manage</div>
          <nav className="mt-2 space-y-1">
            <NavItem label="User Management" icon={Users} />
            <NavItem label="View Reports" icon={LineChart} />
            <NavItem label="Settings" icon={Settings2} />
          </nav>
          <div className="mt-auto rounded-[11px] border border-[#d7e8ee] bg-[#edf7fa] p-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#23677f]">
              <BookOpen className="h-3.5 w-3.5" strokeWidth={1.8} />
              Need a hand?
            </div>
            <p className="mt-1.5 text-[10px] leading-[1.45] text-[#6c8b98]">Read the quick guide to get more from your workspace.</p>
            <button className="mt-2 text-[10px] font-semibold text-[#1377a1] hover:text-[#075985]">Open guide →</button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden">
          <div className="mx-auto max-w-[1120px] px-7 py-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-medium text-[#8a9da8]">
                  <span>Tuesday, March 12, 2024</span>
                  <span className="text-[#c4ced3]">/</span>
                  <span className="text-[#4d8296]">Good morning, Rachel</span>
                </div>
                <h1 className="mt-1.5 text-[24px] font-semibold tracking-[-0.04em] text-[#183b53]">Stay close to the work.</h1>
                <p className="mt-1 text-[12px] text-[#708692]">Here’s what’s happening across your mission community.</p>
              </div>
              <button className="flex items-center gap-2 rounded-[8px] bg-[#0876a9] px-3.5 py-2 text-[11px] font-semibold text-white shadow-[0_4px_10px_rgba(8,118,169,0.18)] transition-transform hover:-translate-y-0.5">
                <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                Share an update
              </button>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-3">
              <Metric label="Active missionaries" value="12" detail="+2 this month" icon={Users} accent="bg-[#e3f2f7] text-[#0d789f]" />
              <Metric label="Updates this week" value="28" detail="+6 from last" icon={MessageCircle} accent="bg-[#eaf4ed] text-[#4d9873]" />
              <Metric label="People connected" value="184" detail="+14 this week" icon={HeartHandshake} accent="bg-[#f8eedf] text-[#b47b3a]" />
              <Metric label="Digest engagement" value="72%" detail="+8.4%" icon={LineChart} accent="bg-[#eeeaf5] text-[#7b68a4]" />
            </div>

            <div className="mt-5 grid grid-cols-[minmax(0,1.6fr)_minmax(260px,0.9fr)] gap-4">
              <section>
                <div className="mb-2.5 flex items-center justify-between">
                  <div>
                    <h2 className="text-[14px] font-semibold text-[#21455c]">Recent mission updates</h2>
                    <p className="mt-0.5 text-[10px] text-[#8a9da8]">Stories from the people you’re walking with</p>
                  </div>
                  <button className="flex items-center gap-1 text-[10px] font-semibold text-[#16779f] hover:text-[#075985]">
                    View all updates
                    <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {updates.map((update) => (
                    <UpdateCard key={update.name} {...update} />
                  ))}
                </div>
              </section>

              <aside className="rounded-[14px] border border-[#dce6eb] bg-[#fffefd] p-4 shadow-[0_2px_8px_rgba(24,59,83,0.025)]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8b9ba4]">
                      <CalendarDays className="h-3.5 w-3.5 text-[#348aaa]" strokeWidth={1.8} />
                      Weekly digest
                    </div>
                    <h2 className="mt-2 text-[17px] font-semibold tracking-[-0.025em] text-[#21455c]">A week worth sharing</h2>
                  </div>
                  <span className="rounded-full bg-[#edf7ef] px-2 py-1 text-[9px] font-semibold text-[#57916e]">Ready Friday</span>
                </div>
                <p className="mt-2 text-[11px] leading-[1.55] text-[#718793]">
                  Your community digest brings together the moments, needs, and prayers from this week.
                </p>
                <div className="my-4 h-px bg-[#edf1f3]" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#e6f1f4] text-[#2f8094]"><Image className="h-3.5 w-3.5" strokeWidth={1.8} /></div>
                    <div className="flex-1">
                      <div className="text-[11px] font-semibold text-[#426174]">8 new photos</div>
                      <div className="mt-0.5 text-[9px] text-[#8a9da8]">From 4 mission partners</div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#a2b1b8]" strokeWidth={1.8} />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#f7eee3] text-[#b67b3e]"><HeartHandshake className="h-3.5 w-3.5" strokeWidth={1.8} /></div>
                    <div className="flex-1">
                      <div className="text-[11px] font-semibold text-[#426174]">3 prayer requests</div>
                      <div className="mt-0.5 text-[9px] text-[#8a9da8]">Ready for your community</div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#a2b1b8]" strokeWidth={1.8} />
                  </div>
                </div>
                <div className="mt-5 rounded-[10px] bg-[#f4f8f9] px-3 py-2.5">
                  <div className="flex items-center justify-between text-[9px] font-semibold text-[#527181]">
                    <span>Next send</span>
                    <span className="text-[#237a9c]">Fri, Mar 15 · 8:00 AM</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#deeaee]">
                    <div className="h-full w-[72%] rounded-full bg-[#58a1ad]" />
                  </div>
                </div>
                <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#cbdfe7] py-2 text-[10px] font-semibold text-[#277994] transition-colors hover:border-[#8dbdcb] hover:bg-[#f4fafb]">
                  <FileText className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Preview digest
                </button>
              </aside>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-[11px] border border-[#d9e8ec] bg-[#f7fbfb] px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#f7fbfb] bg-[#dcebf1] text-[7px] font-bold text-[#1d718b]">AR</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#f7fbfb] bg-[#f2dfca] text-[7px] font-bold text-[#9b6939]">JM</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#f7fbfb] bg-[#d8e5d6] text-[7px] font-bold text-[#557c5b]">SL</span>
                </div>
                <span className="text-[10px] text-[#6c8591]"><strong className="font-semibold text-[#466474]">3 missionaries</strong> have shared since your last visit.</span>
              </div>
              <button className="text-[10px] font-semibold text-[#247b9b] hover:text-[#075985]">Catch up now →</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
