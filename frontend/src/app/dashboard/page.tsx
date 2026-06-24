"use client";

import { useState } from "react";
import styles from "./dashboard.module.css";

const currentUser = { name: "Nurjahan", initials: "NS" };

const myGroups = [
  { id: "1", name: "EECS 4314 study group", course: "EECS 4314", members: 8, role: "leader" },
  { id: "2", name: "Algorithms crew", course: "EECS 3101", members: 5, role: "member" },
  { id: "3", name: "Database systems", course: "EECS 4411", members: 6, role: "member" },
  { id: "4", name: "Networks study hall", course: "EECS 3213", members: 4, role: "member" },
];

const myCourses = [
  { id: "1", code: "EECS 4314", name: "Advanced Software Engineering", term: "Summer 2026" },
  { id: "2", code: "EECS 3101", name: "Design and Analysis of Algorithms", term: "Summer 2026" },
  { id: "3", code: "EECS 4411", name: "Database Management Systems", term: "Summer 2026" },
  { id: "4", code: "EECS 3213", name: "Computer Networks", term: "Summer 2026" },
  { id: "5", code: "EECS 3221", name: "Operating System Fundamentals", term: "Summer 2026" },
];

const sessions = [
  { id: "1", title: "EECS 4314 design review", date: "Jun 14", day: "Sat", time: "3:00–5:00 PM", location: "Lassonde 1006", past: false },
  { id: "2", title: "Algorithms practice", date: "Jun 16", day: "Mon", time: "5:00–7:00 PM", location: "Online (Zoom)", past: false },
  { id: "3", title: "DB exam prep", date: "Jun 19", day: "Thu", time: "2:00–4:00 PM", location: "Scott Library", past: false },
  { id: "4", title: "Networks midterm review", date: "Jun 10", day: "Tue", time: "4:00–6:00 PM", location: "Lassonde 2002", past: true },
];

const resources = [
  { id: "1", name: "Microservices_architecture.pdf", group: "EECS 4314", date: "Jun 10", type: "pdf" },
  { id: "2", name: "Week 5 lecture notes.docx", group: "Algorithms", date: "Jun 9", type: "notes" },
  { id: "3", name: "SQL_cheatsheet.pdf", group: "Database systems", date: "Jun 8", type: "pdf" },
  { id: "4", name: "TCP handshake summary.txt", group: "Networks", date: "Jun 7", type: "notes" },
];

const notifications = [
  { id: "1", message: "New session scheduled: EECS 4314 design review on Jun 14", time: "2 hours ago", read: false },
  { id: "2", message: "Ali uploaded a new resource to Database systems", time: "5 hours ago", read: false },
  { id: "3", message: "Announcement in Algorithms crew: exam next week", time: "Yesterday", read: false },
  { id: "4", message: "Fahad joined your group EECS 4314 study group", time: "2 days ago", read: true },
  { id: "5", message: "Session cancelled: Networks midterm review", time: "3 days ago", read: true },
];

const recommendations = [
  { id: "1", name: "Software design patterns", course: "EECS 4314", members: 7, score: 95 },
  { id: "2", name: "Graph algorithms study", course: "EECS 3101", members: 5, score: 80 },
  { id: "3", name: "Query optimization group", course: "EECS 4411", members: 4, score: 70 },
  { id: "4", name: "OS internals crew", course: "EECS 3221", members: 6, score: 60 },
];

const navItems = [
  { id: "dashboard",       label: "Dashboard",    icon: "🏠" },
  { id: "groups",          label: "My groups",    icon: "👥" },
  { id: "courses",         label: "Courses",      icon: "🎓" },
  { id: "sessions",        label: "Sessions",     icon: "📅" },
  { id: "resources",       label: "Resources",    icon: "📁" },
  { id: "notifications",   label: "Notifications",icon: "🔔" },
  { id: "recommendations", label: "Recommended",  icon: "✨" },
];

const sessionColors = ["blue", "green", "amber"];

type Section = "dashboard" | "groups" | "courses" | "sessions" | "resources" | "notifications" | "recommendations";
type ResourceFilter = "all" | "pdf" | "notes";

export default function DashboardPage() {
  const [active, setActive] = useState<Section>("dashboard");
  const [resFilter, setResFilter] = useState<ResourceFilter>("all");
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={styles.shell}>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>S</span>
          <span className={styles.logoText}>StudySync</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${active === item.id ? styles.navActive : ""}`}
              onClick={() => setActive(item.id as Section)}
            >
              <span>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {item.id === "notifications" && unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={styles.userRow}>
          <div className={styles.avatar}>{currentUser.initials}</div>
          <div>
            <p className={styles.userName}>{currentUser.name}</p>
            <p className={styles.userRole}>Student</p>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>

        {/* Dashboard */}
        {active === "dashboard" && (
          <div>
            <h1 className={styles.pageTitle}>Good morning, {currentUser.name}</h1>
            <div className={styles.statsGrid}>
              {[
                { label: "My groups", value: myGroups.length },
                { label: "Courses enrolled", value: myCourses.length },
                { label: "Upcoming sessions", value: sessions.filter(s => !s.past).length },
                { label: "Resources shared", value: resources.length },
              ].map((s) => (
                <div key={s.label} className={styles.statCard}>
                  <p className={styles.statLabel}>{s.label}</p>
                  <p className={styles.statValue}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className={styles.twoCol}>
              <div className={styles.card}>
                <p className={styles.cardTitle}>My groups</p>
                {myGroups.slice(0, 3).map((g) => (
                  <div key={g.id} className={styles.row}>
                    <div>
                      <p className={styles.rowTitle}>{g.name}</p>
                      <p className={styles.rowSub}>{g.members} members</p>
                    </div>
                    <span className={g.role === "leader" ? styles.pillBlue : styles.pillGreen}>
                      {g.role === "leader" ? "Leader" : "Member"}
                    </span>
                  </div>
                ))}
              </div>
              <div className={styles.card}>
                <p className={styles.cardTitle}>Upcoming sessions</p>
                {sessions.filter(s => !s.past).slice(0, 3).map((s, i) => (
                  <div key={s.id} className={styles.sessionRow}>
                    <div className={`${styles.dateBadge} ${styles[`dateBadge${sessionColors[i][0].toUpperCase()}${sessionColors[i].slice(1)}` as keyof typeof styles]}`}>
                      <span>{s.date}</span>
                      <span className={styles.dateBadgeDay}>{s.day}</span>
                    </div>
                    <div>
                      <p className={styles.rowTitle}>{s.title}</p>
                      <p className={styles.rowSub}>{s.time} · {s.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Groups */}
        {active === "groups" && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>My groups</h1>
              <button className={styles.btnPrimary}>+ New group</button>
            </div>
            <div className={styles.twoCol}>
              {myGroups.map((g) => (
                <div key={g.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <p className={styles.rowTitle}>{g.name}</p>
                    <span className={g.role === "leader" ? styles.pillBlue : styles.pillGreen}>
                      {g.role === "leader" ? "Leader" : "Member"}
                    </span>
                  </div>
                  <div className={styles.tagRow}>
                    <span className={styles.pillPurple}>{g.course}</span>
                  </div>
                  <p className={styles.rowSub}>👥 {g.members} members</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses */}
        {active === "courses" && (
          <div>
            <h1 className={styles.pageTitle}>My courses</h1>
            <div className={styles.card}>
              {myCourses.map((c) => (
                <div key={c.id} className={styles.row}>
                  <div className={styles.courseIcon}>🎓</div>
                  <div className={styles.rowFlex}>
                    <p className={styles.rowTitle}>{c.code} — {c.name}</p>
                    <p className={styles.rowSub}>Lassonde · {c.term}</p>
                  </div>
                  <span className={styles.pillGreen}>Enrolled</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sessions */}
        {active === "sessions" && (
          <div>
            <h1 className={styles.pageTitle}>Sessions</h1>
            <div className={styles.card}>
              {sessions.map((s, i) => (
                <div key={s.id} className={styles.sessionRow}>
                  <div className={s.past
                    ? styles.dateBadgeGray
                    : `${styles.dateBadge} ${styles[`dateBadge${sessionColors[Math.min(i,2)][0].toUpperCase()}${sessionColors[Math.min(i,2)].slice(1)}` as keyof typeof styles]}`}>
                    <span>{s.date}</span>
                    <span className={styles.dateBadgeDay}>{s.day}</span>
                  </div>
                  <div className={styles.rowFlex}>
                    <p className={s.past ? styles.rowTitleMuted : styles.rowTitle}>{s.title}</p>
                    <p className={styles.rowSub}>{s.time} · {s.location}</p>
                  </div>
                  <span className={s.past ? styles.pillGray : styles.pillBlue}>
                    {s.past ? "Past" : "Upcoming"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {active === "resources" && (
          <div>
            <h1 className={styles.pageTitle}>Resources</h1>
            <div className={styles.card}>
              <div className={styles.tabs}>
                {(["all", "pdf", "notes"] as ResourceFilter[]).map((f) => (
                  <button
                    key={f}
                    className={`${styles.tab} ${resFilter === f ? styles.tabActive : ""}`}
                    onClick={() => setResFilter(f)}
                  >
                    {f === "all" ? "All" : f === "pdf" ? "PDFs" : "Notes"}
                  </button>
                ))}
              </div>
              {resources
                .filter((r) => resFilter === "all" || r.type === resFilter)
                .map((r) => (
                  <div key={r.id} className={styles.row}>
                    <div className={r.type === "pdf" ? styles.fileIconRed : styles.fileIconBlue}>
                      {r.type === "pdf" ? "📄" : "📝"}
                    </div>
                    <div className={styles.rowFlex}>
                      <p className={styles.rowTitle}>{r.name}</p>
                      <p className={styles.rowSub}>{r.group} · uploaded {r.date}</p>
                    </div>
                    <button className={styles.btnIcon}>↓</button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        {active === "notifications" && (
          <div>
            <h1 className={styles.pageTitle}>Notifications</h1>
            <div className={styles.card}>
              {notifications.map((n) => (
                <div key={n.id} className={styles.notifRow}>
                  <div className={n.read ? styles.dotRead : styles.dotUnread} />
                  <div>
                    <p className={n.read ? styles.notifTextRead : styles.notifText}>{n.message}</p>
                    <p className={styles.rowSub}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {active === "recommendations" && (
          <div>
            <h1 className={styles.pageTitle}>Recommended groups</h1>
            <p className={styles.pageSub}>Based on your course overlap with other students</p>
            <div className={styles.card}>
              {recommendations.map((r) => (
                <div key={r.id} className={styles.recRow}>
                  <div className={styles.rowFlex}>
                    <p className={styles.rowTitle}>{r.name}</p>
                    <p className={styles.rowSub}>{r.course} · {r.members} members</p>
                  </div>
                  <div className={styles.recRight}>
                    <div className={styles.scoreWrap}>
                      <p className={styles.scoreLabel}>{r.score}%</p>
                      <div className={styles.scoreBar}>
                        <div className={styles.scoreFill} style={{ width: `${r.score}%` }} />
                      </div>
                    </div>
                    <button className={styles.btnIcon}>Join</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}