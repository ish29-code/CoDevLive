// PracticeRoom.jsx
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import Editor from "@monaco-editor/react";
import Loader from "../components/Loader";
import {
    Play,
    Pause,
    Clock,
    Lightbulb,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { problems } from "../data/problems";

/* ================= SMALL INLINE LOADER ================= */
function RunLoader() {
    return (
        <div className="flex items-center gap-2 text-xs opacity-80">
            <span className="animate-spin w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
            Running...
        </div>
    );
}

export default function PracticeRoom() {
    const { theme } = useTheme();
    const { id } = useParams();

    /* ================= PROBLEM ================= */
    const problem = problems[id];

    const hints = problem?.hints || [];

    /* ================= STATE ================= */
    const [code, setCode] = useState(problem?.starterCode || "");
    const [output, setOutput] = useState("");
    const [status, setStatus] = useState(""); // Accepted | Error
    const [language, setLanguage] = useState("javascript");

    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(true);

    const [hintsUsed, setHintsUsed] = useState(0);
    const [runLoading, setRunLoading] = useState(false);

    /* ================= TIMER ================= */
    useEffect(() => {
        if (!running) return;
        const t = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(t);
    }, [running]);

    const formatTime = () =>
        `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
            seconds % 60
        ).padStart(2, "0")}`;

    /* ================= RUN CODE ================= */
    const runCode = () => {
        setRunLoading(true);
        setOutput("");
        setStatus("");

        setTimeout(() => {
            try {
                // ⚠️ TEMP: frontend simulation
                // Later: send code → backend judge
                eval(code);
                setStatus("Accepted");
                setOutput("All test cases passed ✔️");
            } catch (err) {
                setStatus("Error");
                setOutput(err.message);
            } finally {
                setRunLoading(false);
            }
        }, 1000);
    };

    if (!problem) {
        return (
            <div className="h-screen flex items-center justify-center text-red-500">
                Problem not found
            </div>
        );
    }

    /* ================= UI ================= */
    return (
        <div className="h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
            <div className="h-full grid grid-cols-12 gap-3 p-3">

                {/* ================= LEFT — PROBLEM ================= */}
                <aside className="col-span-3 bg-[var(--card)] rounded-xl p-4 text-sm space-y-4 overflow-y-auto">
                    <h2 className="font-semibold text-[var(--accent)] text-lg">
                        {problem.title}
                    </h2>

                    <p className="opacity-80 whitespace-pre-line">
                        {problem.description}
                    </p>

                    <div>
                        <h4 className="font-semibold mb-1">Examples</h4>
                        {problem.examples.map((ex, i) => (
                            <pre
                                key={i}
                                className="bg-[var(--background)] p-2 rounded text-xs mt-2"
                            >
                                {`Input: ${ex.input}
Output: ${ex.output}`}
                            </pre>
                        ))}
                    </div>

                    {/* 💡 HINTS */}
                    <div className="pt-3 border-t border-[var(--border)]">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <Lightbulb size={12} /> Hints
                        </div>

                        <div className="space-y-2">
                            {hints.map((hint, index) => (
                                <button
                                    key={index}
                                    disabled={hintsUsed < index}
                                    onClick={() => setHintsUsed(index + 1)}
                                    className={`w-full text-left px-2 py-1 rounded text-xs border
                    ${hintsUsed >= index
                                            ? "border-[var(--accent)]/40 hover:bg-[var(--accent)]/10"
                                            : "border-[var(--border)] opacity-40 cursor-not-allowed"
                                        }`}
                                >
                                    {hintsUsed > index ? hint : `Show Hint ${index + 1}`}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ================= CENTER — EDITOR ================= */}
                <main className="col-span-6 bg-[var(--card)] rounded-xl p-2 flex flex-col">
                    <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-[var(--accent)]">Code Editor</span>

                        <div className="flex gap-2 items-center">

                            {/* TIMER */}
                            <span className="flex items-center gap-1 opacity-80">
                                <Clock size={12} />
                                {formatTime()}
                            </span>

                            {/* PAUSE */}
                            <button
                                onClick={() => setRunning(!running)}
                                className="px-2 py-1 rounded border border-[var(--border)]"
                            >
                                {running ? <Pause size={12} /> : <Play size={12} />}
                            </button>

                            {/* LANGUAGE */}
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-[var(--background)] px-2 py-1 rounded text-xs"
                            >
                                <option>javascript</option>
                                <option>java</option>
                                <option>cpp</option>
                                <option>python</option>
                            </select>

                            {/* RUN */}
                            <button
                                onClick={runCode}
                                className="px-3 py-1.5 rounded bg-[var(--accent)]/15 text-[var(--accent)]"
                            >
                                Run
                            </button>
                        </div>
                    </div>

                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        theme={theme === "dark" ? "vs-dark" : "light"}
                        onChange={(v) => setCode(v || "")}
                        options={{ minimap: { enabled: false }, fontSize: 14 }}
                    />
                </main>

                {/* ================= RIGHT — JUDGE ================= */}
                <aside className="col-span-3 bg-[var(--card)] rounded-xl p-4 text-sm flex flex-col gap-3">

                    {runLoading && <RunLoader />}

                    {!runLoading && status === "Accepted" && (
                        <p className="text-green-500 font-semibold">
                            ✅ Accepted
                        </p>
                    )}

                    {!runLoading && status === "Error" && (
                        <p className="text-red-500 font-semibold">
                            ❌ Runtime Error
                        </p>
                    )}

                    <pre className="text-xs whitespace-pre-wrap opacity-80 flex-1">
                        {output || "Run your code to see output"}
                    </pre>
                </aside>

            </div>
        </div>
    );
}
