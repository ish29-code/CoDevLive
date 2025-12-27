// src/pages/About.jsx
import React from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Code,
  Brain,
  Target,
  Briefcase,
  Trophy,
  Layers,
  Rocket,
} from "lucide-react";
import { company } from "../assets/assets";


const Section = ({ title, subtitle, children }) => (
  <section className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-[var(--accent)]">{title}</h2>
      <p className="text-sm opacity-70 max-w-3xl">{subtitle}</p>
    </div>

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  </section>
);

const Card = ({ icon: Icon, title, points }) => (
  <div
    className="
      settings-card
      border rounded-2xl p-6
      bg-[var(--card)] text-[var(--card-foreground)]
      transition-all duration-300
    "
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)]">
        <Icon size={22} />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>

    <ul className="space-y-2 text-sm opacity-80 list-disc list-inside">
      {points.map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>
  </div>
);

export default function About() {
  const { theme } = useTheme();

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-[var(--gradient-start)]
        to-[var(--gradient-end)]
        text-[var(--foreground)]
      "
    >
      <div className="container-center py-16 space-y-20">

        {/* ================= HERO ================= */}
        <section className="space-y-6 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold">
            About <span className="text-[var(--accent)]">CoDevLive</span>
          </h1>

          <p className="text-lg opacity-80 leading-relaxed">
            CoDevLive is a next-generation collaborative coding and interview
            preparation platform designed for students, developers, and
            professionals preparing for product-based companies.
          </p>

          <p className="text-sm opacity-70">
            Built with a strong focus on DSA mastery, real-time collaboration,
            system thinking, and interview readiness.
          </p>
        </section>

        {/* ================= DSA ROADMAP ================= */}
        <Section
          title="DSA Roadmap"
          subtitle="A structured, interview-oriented data structures & algorithms journey."
        >
          <Card
            icon={Layers}
            title="Foundations"
            points={[
              "Time & Space Complexity",
              "Arrays, Strings, Hashing",
              "Recursion & Backtracking",
              "Mathematical problem solving",
            ]}
          />

          <Card
            icon={Brain}
            title="Core Data Structures"
            points={[
              "Stacks & Queues",
              "Linked Lists",
              "Trees & Binary Search Trees",
              "Heaps & Priority Queues",
            ]}
          />

          <Card
            icon={Code}
            title="Advanced Topics"
            points={[
              "Graphs (BFS / DFS / Shortest Paths)",
              "Dynamic Programming",
              "Greedy Algorithms",
              "Bit Manipulation",
            ]}
          />
        </Section>

        {/* ================= INTERVIEW PREPARATION ================= */}
        <Section
          title="Interview Preparation"
          subtitle="How to think, explain, and perform in real interviews."
        >
          <Card
            icon={Target}
            title="Problem Solving Strategy"
            points={[
              "Understand problem constraints clearly",
              "Start with brute force",
              "Optimize step by step",
              "Explain trade-offs confidently",
            ]}
          />

          <Card
            icon={Brain}
            title="Communication Skills"
            points={[
              "Think out loud",
              "Use examples before coding",
              "Handle interviewer hints gracefully",
              "Write clean, readable code",
            ]}
          />

          <Card
            icon={Rocket}
            title="Mock Interviews"
            points={[
              "Timed problem solving",
              "Real interview scenarios",
              "Live coding rounds",
              "Feedback-driven improvement",
            ]}
          />
        </Section>

        {/* ================= COMPANIES ================= */}
        <Section
          title="Target Companies"
          subtitle="Preparation aligned with top product-based companies."
        >
          <Card
            icon={Briefcase}
            title="Product Companies"
            points={[
              "Google, Amazon, Microsoft",
              "Meta, Apple, Netflix",
              "Uber, Atlassian, Adobe",
            ]}
          />

          <Card
            icon={Trophy}
            title="Startup Ecosystem"
            points={[
              "Problem-solving heavy interviews",
              "System design focus",
              "Rapid growth mindset",
            ]}
          />

          <Card
            icon={Layers}
            title="What They Expect"
            points={[
              "Strong DSA fundamentals",
              "Clean code",
              "Scalability thinking",
              "Confidence & clarity",
            ]}
          />
        </Section>

        {/* ================= MINDSET ================= */}
        <section className="space-y-6 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[var(--accent)]">
            Right Mindset
          </h2>

          <p className="opacity-80 leading-relaxed">
            Success in interviews is not about memorizing solutions. It’s about
            building intuition, thinking systematically, and learning from
            failures. CoDevLive encourages consistency, discipline, and deep
            understanding over shortcuts.
          </p>

          <p className="text-sm opacity-70">
            “Strong fundamentals + right mindset = unstoppable growth.”
          </p>
        </section>

        {/* ================= SYSTEM DESIGN ================= */}
        <Section
          title="System Design Preparation"
          subtitle="Learn how large-scale systems are designed in real companies."
        >
          <Card
            icon={Layers}
            title="Core Concepts"
            points={[
              "Load balancing & caching",
              "Database sharding & replication",
              "CAP theorem",
              "Scalability & reliability",
            ]}
          />

          <Card
            icon={Brain}
            title="Design Practice"
            points={[
              "Design URL shortener",
              "Design chat application",
              "Design payment systems",
              "Design notification services",
            ]}
          />

          <Card
            icon={Rocket}
            title="Interview Approach"
            points={[
              "Clarify requirements",
              "Define APIs & data models",
              "Handle scale & failures",
              "Justify trade-offs",
            ]}
          />
        </Section>

        {/* ================= INTERVIEW ROUNDS ================= */}
        <Section
          title="Interview Rounds Breakdown"
          subtitle="What actually happens in product-based company interviews."
        >
          <Card
            icon={Code}
            title="DSA Rounds"
            points={[
              "Coding + logic",
              "Edge case handling",
              "Optimal complexity",
              "Clean implementation",
            ]}
          />

          <Card
            icon={Target}
            title="Machine Coding"
            points={[
              "Low-level design",
              "Code structure & readability",
              "Real-world features",
              "Time-bound implementation",
            ]}
          />

          <Card
            icon={Briefcase}
            title="HR & Behavioral"
            points={[
              "Project discussion",
              "Problem-solving mindset",
              "Communication clarity",
              "Culture fit",
            ]}
          />
        </Section>

        {/* ================= PREPARATION STRATEGY ================= */}
        <Section
          title="Preparation Strategy"
          subtitle="How to prepare smartly without burnout."
        >
          <Card
            icon={Brain}
            title="Daily Plan"
            points={[
              "2–4 DSA problems",
              "Revision of past solutions",
              "Short notes & patterns",
            ]}
          />

          <Card
            icon={Target}
            title="Weekly Plan"
            points={[
              "Mock interviews",
              "Topic-wise revision",
              "System design basics",
            ]}
          />

          <Card
            icon={Rocket}
            title="Monthly Plan"
            points={[
              "Full-length mocks",
              "Project polishing",
              "Resume optimization",
            ]}
          />
        </Section>

        {/* ================= COMMON MISTAKES ================= */}
        <Section
          title="Common Mistakes to Avoid"
          subtitle="Learn from others’ failures instead of repeating them."
        >
          <Card
            icon={Brain}
            title="DSA Mistakes"
            points={[
              "Skipping fundamentals",
              "Ignoring time complexity",
              "Copy-pasting solutions",
            ]}
          />

          <Card
            icon={Code}
            title="Interview Mistakes"
            points={[
              "Silent coding",
              "Overcomplicating solutions",
              "Not asking clarifying questions",
            ]}
          />

          <Card
            icon={Target}
            title="Mindset Mistakes"
            points={[
              "Fear of failure",
              "Inconsistency",
              "Comparing with others",
            ]}
          />
        </Section>

        {/* ================= WHY CODEVLIVE ================= */}
        <Section
          title="Why CoDevLive?"
          subtitle="What makes this platform different from others."
        >
          <Card
            icon={Rocket}
            title="Real-Time Collaboration"
            points={[
              "Live code sharing",
              "Pair programming",
              "Interview simulation",
            ]}
          />

          <Card
            icon={Brain}
            title="Learning First"
            points={[
              "Concept-driven learning",
              "Structured roadmaps",
              "Feedback-oriented approach",
            ]}
          />

          <Card
            icon={Trophy}
            title="Career Focused"
            points={[
              "Resume-ready projects",
              "Interview readiness",
              "Industry alignment",
            ]}
          />
        </Section>

        {/* ================= CAREER OUTCOMES ================= */}
        <section className="space-y-6 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[var(--accent)]">
            Career Outcomes
          </h2>

          <p className="opacity-80 leading-relaxed">
            With consistent effort and the right guidance, learners using
            CoDevLive aim for strong placements, higher confidence, and long-term
            growth in the tech industry.
          </p>

          <p className="text-sm opacity-70">
            From internships to top-tier product companies — the journey starts here.
          </p>
        </section>

        {/* ================= COMPANY LOGOS ================= */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-[var(--accent)]">
            Companies You Prepare For
          </h2>

          <div
            className="
      grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6
      gap-6 items-center justify-center
    "
          >
            {Object.entries(company).map(([name, logo]) => (
              <div
                key={name}
                className="
          settings-card
          flex flex-col items-center justify-center
          p-4 rounded-xl
          bg-[var(--card)]
          border
        "
              >
                <img
                  src={logo}
                  alt={name}
                  className="h-10 object-contain"
                />
                <span className="text-xs mt-2 opacity-70 capitalize">
                  {name}
                </span>
              </div>
            ))}
          </div>

          <p className="text-center text-sm opacity-70">
            Logos are used for learning & preparation reference purposes only.
          </p>
        </section>



      </div>
    </div>
  );
}
