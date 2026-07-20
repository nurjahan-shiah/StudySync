"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { LogoIcon } from "./components/Logo";

// ─── Scroll-reveal wrapper ──────────────────────────────────────────────────
function Reveal({
  children, delay = 0, style,
}: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="ss-reveal" style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

// ─── Stripe divider ─────────────────────────────────────────────────────────
function StripeDivider({ center = true }: { center?: boolean }) {
  return (
    <div style={{
      width: 80, height: 5, borderRadius: 3, margin: center ? "0 auto 16px" : "0 0 16px",
      background: "linear-gradient(90deg, var(--ss-blue), var(--ss-green), var(--ss-yellow), var(--ss-red))",
    }} />
  );
}

// ─── Eyebrow label ──────────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      textAlign: "center", fontSize: "0.8rem", fontWeight: 700, letterSpacing: 2.5,
      textTransform: "uppercase", color: "var(--ss-red)", marginBottom: 12,
    }}>
      {children}
    </p>
  );
}

// ─── Feature card ───────────────────────────────────────────────────────────
function FeatureCard({
  icon, iconBg, title, desc, delay = 0,
}: { icon: string; iconBg: string; title: string; desc: string; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div className="ss-card" style={{ height: "100%" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.4rem", marginBottom: 20,
        }}>
          {icon}
        </div>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>{title}</h3>
        <p style={{ color: "var(--text2)", fontSize: "0.92rem", lineHeight: 1.65 }}>{desc}</p>
      </div>
    </Reveal>
  );
}

// ─── Step card (How it works) ───────────────────────────────────────────────
function StepCard({
  n, title, desc, color, delay = 0,
}: { n: string; title: string; desc: string; color: string; delay?: number }) {
  return (
    <Reveal delay={delay} style={{ flex: "1 1 220px", minWidth: 220 }}>
      <div style={{ textAlign: "center", padding: "0 12px" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%", margin: "0 auto 18px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.3rem", fontWeight: 800, color: "#fff",
          background: color, boxShadow: `0 8px 24px ${color}55`,
        }}>
          {n}
        </div>
        <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>{title}</h4>
        <p style={{ color: "var(--text2)", fontSize: "0.88rem", lineHeight: 1.6, maxWidth: 240, margin: "0 auto" }}>{desc}</p>
      </div>
    </Reveal>
  );
}

// ─── Testimonial card ───────────────────────────────────────────────────────
function TestimonialCard({
  quote, name, meta, color, delay = 0,
}: { quote: string; name: string; meta: string; color: string; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div className="ss-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ color, fontSize: "1.6rem", lineHeight: 1, marginBottom: 14, fontWeight: 800 }}>&ldquo;</div>
        <p style={{ color: "var(--text)", fontSize: "0.95rem", lineHeight: 1.7, flex: 1, marginBottom: 20 }}>
          {quote}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%", background: color,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
          }}>
            {name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text)" }}>{name}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text2)" }}>{meta}</div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

// ─── Mini mock dashboard preview (pure CSS, echoes the real UI) ────────────
function ProductPreview() {
  return (
    <div style={{
      position: "relative",
      width: "100%",
      maxWidth: 860,
      margin: "0 auto",
      borderRadius: 18,
      border: "1px solid var(--border)",
      background: "var(--card-bg)",
      boxShadow: "var(--shadow)",
      overflow: "hidden",
    }}>
      {/* window chrome */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg3)",
      }}>
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "var(--ss-red)" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "var(--ss-yellow)" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "var(--ss-green)" }} />
        <span style={{
          marginLeft: 12, fontSize: "0.72rem", color: "var(--text2)",
          background: "var(--card-bg)", padding: "3px 10px", borderRadius: 6,
          border: "1px solid var(--border)",
        }}>
          studysync.app/dashboard
        </span>
      </div>

      {/* body */}
      <div style={{ display: "flex", minHeight: 320 }}>
        {/* fake sidebar */}
        <div style={{
          width: 150, borderRight: "1px solid var(--border)", padding: "18px 14px",
          display: "flex", flexDirection: "column", gap: 10, background: "var(--bg2)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <LogoIcon size={22} />
          </div>
          {["Dashboard", "Groups", "Courses", "Sessions", "Resources"].map((item, i) => (
            <div key={item} style={{
              fontSize: "0.72rem", padding: "7px 10px", borderRadius: 7,
              color: i === 0 ? "#fff" : "var(--text2)",
              background: i === 0 ? "var(--ss-red)" : "transparent",
              fontWeight: i === 0 ? 600 : 500,
            }}>
              {item}
            </div>
          ))}
        </div>

        {/* fake content */}
        <div style={{ flex: 1, padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)" }}>Your workspace</div>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--ss-blue)" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
            {[
              { label: "My groups", val: "4", c: "var(--ss-blue)" },
              { label: "Sessions", val: "7", c: "var(--ss-green)" },
              { label: "Matches", val: "12", c: "var(--ss-yellow)" },
              { label: "Streak", val: "9d", c: "var(--ss-red)" },
            ].map(s => (
              <div key={s.label} style={{
                background: "var(--bg3)", borderRadius: 10, padding: "10px 12px",
                border: "1px solid var(--border)",
              }}>
                <div style={{ fontSize: "0.62rem", color: "var(--text2)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: s.c }}>{s.val}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12 }}>
            <div style={{ background: "var(--bg3)", borderRadius: 10, padding: 14, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Upcoming sessions</div>
              {["EECS 3101 — Graph Algos", "EECS 4314 — Capstone sync"].map(s => (
                <div key={s} style={{
                  fontSize: "0.68rem", color: "var(--text2)", padding: "7px 0",
                  borderTop: "1px solid var(--border)",
                }}>
                  {s}
                </div>
              ))}
            </div>
            <div style={{ background: "var(--bg3)", borderRadius: 10, padding: 14, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Recommended</div>
              <div style={{
                fontSize: "0.68rem", padding: "6px 10px", borderRadius: 6, display: "inline-block",
                background: "rgba(0,184,148,.14)", color: "var(--ss-green)", fontWeight: 600,
              }}>
                97% match
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rotating hero word ─────────────────────────────────────────────────────
function RotatingWord() {
  const words = ["together.", "smarter.", "on time.", "as a team."];
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % words.length), 2200);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <span style={{ color: "var(--ss-red)", display: "inline-block", position: "relative" }}>
      {words[i]}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const features = [
    { icon: "📚", iconBg: "rgba(9,132,227,.12)",  title: "Course Hub",         desc: "Organize all your courses, syllabi, deadlines, and materials in one clean dashboard." },
    { icon: "👥", iconBg: "rgba(0,184,148,.12)",  title: "Study Groups",       desc: "Create or join study groups, share notes, and coordinate sessions effortlessly." },
    { icon: "🗂️", iconBg: "rgba(253,203,110,.12)", title: "Smart Resources",   desc: "Upload, tag, and discover course materials. AI surfaces what's relevant when you need it." },
    { icon: "📅", iconBg: "rgba(214,48,49,.12)",  title: "Session Planner",    desc: "Schedule group study sessions and get smart reminders so nothing falls through." },
    { icon: "🤖", iconBg: "rgba(9,132,227,.12)",  title: "AI Recommendations", desc: "Personalized resource and group recommendations based on your courses and habits." },
    { icon: "🔒", iconBg: "rgba(0,184,148,.12)",  title: "Secure & Private",   desc: "Your data stays yours. We never sell your information or show you ads." },
  ];

  const steps = [
    { n: "1", title: "Add your courses",   desc: "Drop in your class list and StudySync builds your workspace instantly.", color: "var(--ss-blue)" },
    { n: "2", title: "Find your people",   desc: "Get matched into study groups with classmates who study like you do.", color: "var(--ss-green)" },
    { n: "3", title: "Plan your sessions", desc: "Schedule sessions, split tasks, and keep everyone accountable.", color: "var(--ss-yellow)" },
    { n: "4", title: "Sync & succeed",     desc: "Smart recommendations keep you on track right up to exam day.", color: "var(--ss-red)" },
  ];

  const testimonials = [
    { quote: "I went from cramming alone to actually having a group that shows up. My GPA noticed the difference.", name: "Amara O.", meta: "Computer Science, Y3", color: "var(--ss-blue)" },
    { quote: "The session planner is the only reason our capstone group ever agreed on a meeting time.", name: "Daniel K.", meta: "Software Engineering, Y4", color: "var(--ss-green)" },
    { quote: "The recommendations are scarily good — it found me a resource I didn't know I needed for finals.", name: "Priya S.", meta: "Data Science, Y2", color: "var(--ss-red)" },
  ];

  const stats = [
    { num: "k+", label: "Active students" },
    { num: "5+", label: "Study groups" },
    { num: "98%", label: "Satisfaction rate" },
    { num: "2+", label: "Universities" },
  ];

  return (
    <>
      {/* Top stripe bar */}
      <div className="ss-stripe-bar" />

      {/* ── NAV ── */}
      <Navbar
        rightSlot={
          <>
            <Link href="/login" className="ss-btn-ghost">Log in</Link>
            <Link href="/signup" className="ss-btn-primary">Get Started</Link>
          </>
        }
      />

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 5% 60px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Glow blobs */}
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(214,48,49,.16) 0%, transparent 70%)",
          filter: "blur(80px)", top: "8%", right: "-10%", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", width: 420, height: 420, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(9,132,227,.14) 0%, transparent 70%)",
          filter: "blur(80px)", bottom: "5%", left: "-8%", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,184,148,.12) 0%, transparent 70%)",
          filter: "blur(80px)", top: "38%", left: "42%", pointerEvents: "none",
        }} />

        <Reveal>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--bg3)", border: "1px solid var(--border)",
            borderRadius: 999, padding: "7px 16px", marginBottom: 28,
            fontSize: "0.8rem", color: "var(--text2)", fontWeight: 600,
          }}>
            <span className="ss-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--ss-green)" }} />
            Built by students, for students
          </div>
        </Reveal>

        <h1 style={{
          fontSize: "clamp(2.4rem, 6vw, 4.4rem)", fontWeight: 800,
          lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 22, color: "var(--text)",
        }}>
          Study smarter.<br />
          Sync <RotatingWord />
        </h1>

        <p style={{
          fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "var(--text2)",
          maxWidth: 580, lineHeight: 1.7, marginBottom: 40,
        }}>
          StudySync brings your classes, study groups, and resources into one seamless workspace —
          built for the way students actually learn.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
          <Link href="/signup" className="ss-btn-primary ss-btn-lg">Start for free</Link>
          <a
            href="#features"
            className="ss-btn-ghost ss-btn-lg"
            onClick={e => {
              e.preventDefault();
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            See how it works
          </a>
        </div>

        <Reveal delay={150} style={{ width: "100%" }}>
          <ProductPreview />
        </Reveal>
      </section>

      {/* ── STATS BAND ── */}
      <div style={{
        background: "var(--bg3)",
        borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
        padding: "48px 5%", display: "flex", justifyContent: "center",
        flexWrap: "wrap",
      }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            flex: 1, minWidth: 180, textAlign: "center", padding: "16px 24px",
            borderRight: i < stats.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <span style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--ss-red)", letterSpacing: "-1px", display: "block" }}>
              {s.num}
            </span>
            <div style={{ fontSize: "0.85rem", color: "var(--text2)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "100px 5% 90px" }}>
        <Eyebrow>Features</Eyebrow>
        <StripeDivider />
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 14, color: "var(--text)" }}>
          Everything you need to excel
        </h2>
        <p style={{ textAlign: "center", color: "var(--text2)", maxWidth: 480, margin: "0 auto 56px", lineHeight: 1.7 }}>
          Tools designed for real students — not enterprise teams in suits.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "90px 5%", background: "var(--bg2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <Eyebrow>How it works</Eyebrow>
        <StripeDivider />
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 56, color: "var(--text)" }}>
          From syllabus to study group in minutes
        </h2>

        <div style={{
          display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "center",
          maxWidth: 1100, margin: "0 auto", position: "relative",
        }}>
          {steps.map((s, i) => (
            <StepCard key={s.title} {...s} delay={i * 100} />
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "100px 5%" }}>
        <Eyebrow>Loved by students</Eyebrow>
        <StripeDivider />
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 56, color: "var(--text)" }}>
          Don&apos;t just take our word for it
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} {...t} delay={i * 100} />
          ))}
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <div style={{
        padding: "100px 5%", display: "flex", flexDirection: "column",
        alignItems: "center", textAlign: "center", position: "relative", overflow: "hidden",
        background: "var(--bg2)", borderTop: "1px solid var(--border)",
      }}>
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(214,48,49,.12) 0%, transparent 70%)",
          filter: "blur(90px)", top: "-20%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none",
        }} />
        <Reveal>
          <LogoIcon size={52} />
        </Reveal>
        <Reveal delay={60}>
          <StripeDivider />
        </Reveal>
        <Reveal delay={100}>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 16, color: "var(--text)" }}>
            Ready to sync your success?
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p style={{ color: "var(--text2)", maxWidth: 440, marginBottom: 36, lineHeight: 1.7 }}>
            Join thousands of students already using StudySync to study smarter and stress less.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <Link href="/signup" className="ss-btn-primary ss-btn-lg">
            Create your free account
          </Link>
        </Reveal>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: "36px 5%", textAlign: "center",
        borderTop: "1px solid var(--border)", color: "var(--text2)", fontSize: "0.85rem",
      }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          study<span style={{ color: "var(--ss-red)" }}>Sync</span>
        </div>
        <p>© 2026 StudySync · Group 4 · York University</p>
      </footer>
    </>
  );
}