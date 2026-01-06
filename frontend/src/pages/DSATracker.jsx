import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import {
    ChevronDown,
    ChevronRight,
    CheckCircle,
    Circle,
    Search,
    Sun,
    Moon,
} from "lucide-react";

/* ================= DSA DATA (BACKEND READY) ================= */
const dsaPatterns = [
    {
        pattern: "Arrays",
        problems: [
            { id: 1, title: "Two Sum", difficulty: "Easy", solved: true },
            { id: 2, title: "Best Time to Buy & Sell Stock", difficulty: "Easy", solved: false },
            { id: 3, title: "Longest Subarray Sum K", difficulty: "Medium", solved: false },
        ],
    },
    {
        pattern: "Sliding Window",
        problems: [
            { id: 4, title: "Max Sum Subarray of Size K", difficulty: "Easy", solved: true },
            { id: 5, title: "Longest Substring Without Repeating", difficulty: "Medium", solved: false },
        ],
    },
    {
        pattern: "Binary Search",
        problems: [
            { id: 6, title: "Binary Search", difficulty: "Easy", solved: true },
            { id: 7, title: "Search in Rotated Sorted Array", difficulty: "Medium", solved: false },
            { id: 8, title: "Koko Eating Bananas", difficulty: "Hard", solved: false },
        ],
    },
];

/* ================= HELPERS ================= */
const difficultyColor = {
    Easy: "text-green-500",
    Medium: "text-yellow-500",
    Hard: "text-red-500",
};

export default function DsaTracker() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const [expanded, setExpanded] = useState({});
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    /* ================= PROGRESS ================= */
    const stats = useMemo(() => {
        let total = 0;
        let solved = 0;

        dsaPatterns.forEach((p) =>
            p.problems.forEach((q) => {
                total++;
                if (q.solved) solved++;
            })
        );

        return { total, solved, percent: Math.round((solved / total) * 100) };
    }, []);

    /* ================= FILTER ================= */
    const filteredPatterns = useMemo(() => {
        return dsaPatterns.map((pattern) => ({
            ...pattern,
            problems: pattern.problems.filter((p) => {
                const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
                const matchDiff = filter === "All" || p.difficulty === filter;
                return matchSearch && matchDiff;
            }),
        }));
    }, [search, filter]);

    return (
        <div className="min-h-screen page-bg p-6 text-[var(--foreground)]">

            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">DSA Practice Sheet</h1>
                    <p className="opacity-70 text-sm">
                        Pattern-wise structured problem solving
                    </p>
                </div>

            </div>

            {/* ================= OVERALL PROGRESS ================= */}
            <div className="card-ui p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span>
                        Progress: {stats.solved}/{stats.total} solved
                    </span>
                    <span className="font-semibold">{stats.percent}%</span>
                </div>
                <div className="w-full h-2 bg-[var(--border)] rounded">
                    <div
                        className="h-2 bg-[var(--accent)] rounded transition-all"
                        style={{ width: `${stats.percent}%` }}
                    />
                </div>
            </div>

            {/* ================= CONTROLS ================= */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex items-center gap-2 bg-[var(--card)] px-3 py-2 rounded">
                    <Search size={14} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search question..."
                        className="bg-transparent outline-none text-sm"
                    />
                </div>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-[var(--card)] px-3 py-2 rounded text-sm"
                >
                    <option>All</option>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                </select>
            </div>

            {/* ================= PATTERNS ================= */}
            <div className="space-y-4">
                {filteredPatterns.map((section) => {
                    const solvedCount = section.problems.filter((p) => p.solved).length;
                    const percent =
                        section.problems.length === 0
                            ? 0
                            : Math.round((solvedCount / section.problems.length) * 100);

                    return (
                        <div key={section.pattern} className="card-ui p-4">

                            {/* PATTERN HEADER */}
                            <div
                                onClick={() =>
                                    setExpanded((e) => ({
                                        ...e,
                                        [section.pattern]: !e[section.pattern],
                                    }))
                                }
                                className="flex justify-between items-center cursor-pointer"
                            >
                                <div className="flex items-center gap-2 font-semibold">
                                    {expanded[section.pattern]
                                        ? <ChevronDown size={16} />
                                        : <ChevronRight size={16} />}
                                    {section.pattern}
                                </div>
                                <span className="text-xs opacity-70">
                                    {solvedCount}/{section.problems.length}
                                </span>
                            </div>

                            {/* PROGRESS BAR */}
                            <div className="mt-2 h-1 bg-[var(--border)] rounded">
                                <div
                                    className="h-1 bg-[var(--accent)] rounded"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>

                            {/* PROBLEMS */}
                            {expanded[section.pattern] && (
                                <div className="mt-4 space-y-3">
                                    {section.problems.map((q) => (
                                        <div
                                            key={q.id}
                                            className="flex justify-between items-center p-3 rounded hover:bg-[var(--background)] transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                {q.solved
                                                    ? <CheckCircle size={16} className="text-green-500" />
                                                    : <Circle size={16} className="opacity-40" />}
                                                <span>{q.title}</span>
                                                <span
                                                    className={`text-xs font-semibold ${difficultyColor[q.difficulty]}`}
                                                >
                                                    {q.difficulty}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => navigate(`/practice/${q.id}`)}
                                                className="text-[var(--accent)] text-sm"
                                            >
                                                {q.solved ? "Revise" : "Solve"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
