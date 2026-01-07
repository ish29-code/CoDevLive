import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { leaderboard } from "../data/leaderboard";


import {
    ChevronDown,
    ChevronRight,
    CheckCircle,
    Circle,
    Trophy,
    BarChart2,
    Search,
} from "lucide-react";
import { dsaPatterns } from "@/data/dsaPattern";
import CircularProgress from "@/components/ui/circularProgress";

export default function DSATracker() {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState({});
    const [search, setSearch] = useState("");

    /* ================= OVERALL PROGRESS ================= */
    const overall = useMemo(() => {
        let solved = 0;
        let total = 0;

        dsaPatterns.forEach((p) => {
            solved += p.solved;
            total += p.total;
        });

        return Math.round((solved / total) * 100);
    }, []);

    return (
        <div className="min-h-screen page-bg p-6 text-[var(--foreground)]">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">DSA Practice Sheet</h1>
                    <p className="opacity-70 text-sm">
                        Structured, pattern-wise preparation
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <BarChart2 />
                    <CircularProgress percent={overall} />
                </div>
            </div>

            {/* SEARCH */}
            <div className="flex items-center gap-2 bg-[var(--card)] px-3 py-2 rounded mb-6">
                <Search size={14} />
                <input
                    placeholder="Search problems..."
                    className="bg-transparent outline-none text-sm w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-12 gap-6">

                {/* LEFT — PATTERNS */}
                <div className="col-span-8 space-y-4">
                    {dsaPatterns.map((section) => {
                        const percent = Math.round(
                            (section.solved / section.total) * 100
                        );

                        return (
                            <div key={section.pattern} className="card-ui p-4">

                                {/* PATTERN HEADER */}
                                <div
                                    className="flex justify-between items-center cursor-pointer"
                                    onClick={() =>
                                        setExpanded((e) => ({
                                            ...e,
                                            [section.pattern]: !e[section.pattern],
                                        }))
                                    }
                                >
                                    <div className="flex items-center gap-2 font-semibold">
                                        {expanded[section.pattern]
                                            ? <ChevronDown size={16} />
                                            : <ChevronRight size={16} />}
                                        {section.pattern}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-xs opacity-70">
                                            {section.solved}/{section.total}
                                        </span>
                                        <CircularProgress percent={percent} size={48} />
                                    </div>
                                </div>

                                {/* BAR */}
                                <div className="mt-3 h-2 bg-[var(--border)] rounded">
                                    <div
                                        className="h-2 bg-[var(--accent)] rounded"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>

                                {/* PROBLEMS */}
                                {expanded[section.pattern] && (
                                    <div className="mt-4 space-y-3">
                                        {section.problems
                                            .filter((p) =>
                                                p.title.toLowerCase().includes(search.toLowerCase())
                                            )
                                            .map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="flex justify-between items-center p-3 rounded hover:bg-[var(--background)] transition"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {p.solved
                                                            ? <CheckCircle size={16} className="text-green-500" />
                                                            : <Circle size={16} className="opacity-40" />}
                                                        <span>{p.title}</span>
                                                    </div>

                                                    <button
                                                        onClick={() => navigate(`/practice-room/${p.id}`)}
                                                        className="text-[var(--accent)] text-sm"
                                                    >
                                                        {p.solved ? "Revise" : "Solve"}
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* RIGHT — LEADERBOARD */}
                <div className="col-span-4 card-ui p-4 h-fit">
                    <div className="flex items-center gap-2 font-semibold mb-4">
                        <Trophy size={16} /> Leaderboard
                    </div>

                    {leaderboard.map((u, i) => (
                        <div
                            key={u.name}
                            className="flex justify-between items-center mb-3"
                        >
                            <span className="opacity-80">
                                #{i + 1} {u.name}
                            </span>
                            <span className="font-semibold">{u.solved}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
