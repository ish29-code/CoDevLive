// src/pages/Interview.jsx
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { socket } from "../utils/socket";
import VideoCall from "../components/VideoCall";
import Editor from "@monaco-editor/react";
import {
    Play,
    Pause,
    Clock,
    Lightbulb,
    ListChecks,
    History,
    FileText,
    BarChart3,
    Settings,
    ChevronRight,
} from "lucide-react";

/* =====================================================
   INTERVIEW PAGE — FULL FEATURE MODE
   ===================================================== */

export default function Interview() {
    const { theme } = useTheme();
    const roomId = "interview-123";

    /* ================= CORE STATES ================= */
    const [code, setCode] = useState("// Write your solution here");
    const [output, setOutput] = useState("");
    const [language, setLanguage] = useState("javascript");

    /* ================= TIMER ================= */
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(true);

    /* ================= FEATURES ================= */
    const [hintsUsed, setHintsUsed] = useState(0);
    const [notes, setNotes] = useState("");
    const [events, setEvents] = useState([]);
    const [showEval, setShowEval] = useState(false);

    /* ================= CHECKLIST ================= */
    const [checklist, setChecklist] = useState({
        clarification: false,
        bruteForce: false,
        optimization: false,
        finalCode: false,
        complexity: false,
    });

    const joinedRef = useRef(false);

    /* ================= SOCKET ================= */
    useEffect(() => {
        if (!joinedRef.current) {
            socket.emit("join-room", roomId);
            joinedRef.current = true;
        }

        socket.on("code-update", (newCode) => setCode(newCode));
        return () => socket.off("code-update");
    }, []);

    /* ================= TIMER ================= */
    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(interval);
    }, [running]);

    const formatTime = () =>
        `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
            seconds % 60
        ).padStart(2, "0")}`;

    /* ================= EVENTS ================= */
    const logEvent = (label) => {
        setEvents((e) => [...e, { time: formatTime(), label }]);
    };

    /* ================= CODE ================= */
    const handleCodeChange = (value) => {
        setCode(value);
        socket.emit("code-change", { roomId, code: value });
    };

    const runCode = () => {
        try {
            const result = eval(code);
            setOutput(String(result ?? "Executed"));
            logEvent("Code executed");
        } catch (err) {
            setOutput(err.message);
        }
    };

    /* ================= UI ================= */
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            <div className="h-screen grid grid-cols-12 gap-4 p-4">

                {/* ================= LEFT TOOLBAR ================= */}
                <aside className="col-span-2 settings-card bg-[var(--card)] p-4 space-y-5 overflow-y-auto border">
                    <h2 className="font-bold text-[var(--accent)] text-lg flex items-center gap-2">
                        <Settings size={18} className="icon-muted" />
                        Interview Tools
                    </h2>

                    {/* TIMER */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                            <Clock size={16} className="icon-muted" />
                            {formatTime()}
                        </span>
                        <button
                            className="btn-outline px-2 py-1"
                            onClick={() => setRunning(!running)}
                        >
                            {running ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                    </div>

                    {/* CHECKLIST */}
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2">
                            <ListChecks size={16} className="icon-muted" />
                            Interview Flow
                        </h3>

                        {Object.entries(checklist).map(([k, v]) => (
                            <label
                                key={k}
                                className="flex items-center gap-2 text-sm cursor-pointer opacity-80"
                            >
                                <input
                                    type="checkbox"
                                    checked={v}
                                    onChange={() => {
                                        setChecklist({ ...checklist, [k]: !v });
                                        logEvent(`Completed ${k}`);
                                    }}
                                />
                                {k}
                            </label>
                        ))}
                    </div>

                    {/* HINTS */}
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-1">
                            <Lightbulb size={16} className="icon-muted" />
                            Hints
                        </h3>
                        <button
                            className="btn-outline text-xs"
                            onClick={() => {
                                setHintsUsed((h) => h + 1);
                                logEvent("Hint used");
                            }}
                        >
                            Use Hint ({hintsUsed})
                        </button>
                        <p className="text-xs opacity-70 mt-1">
                            Consider prefix sum + hashmap.
                        </p>
                    </div>

                    {/* NOTES */}
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-1">
                            <FileText size={16} className="icon-muted" />
                            Notes
                        </h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border rounded p-2 text-sm bg-transparent"
                            placeholder="Write thoughts / feedback..."
                        />
                    </div>
                </aside>

                {/* ================= CENTER EDITOR ================= */}
                <main className="col-span-7 settings-card bg-[var(--card)] p-3 flex flex-col border">
                    {/* TOP BAR */}
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-bold text-lg text-[var(--accent)]">
                            Code Editor
                        </h2>

                        <div className="flex gap-2 items-center">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="border rounded px-2 text-sm bg-transparent"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                                <option value="python">Python</option>
                            </select>

                            <button onClick={runCode} className="btn-outline text-sm">
                                <Play size={14} /> Run
                            </button>
                        </div>
                    </div>

                    {/* EDITOR */}
                    <div className="flex-1 rounded overflow-hidden border">
                        <Editor
                            height="100%"
                            language={language}
                            value={code}
                            theme={theme === "dark" ? "vs-dark" : "light"}
                            onChange={handleCodeChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 15,
                                fontLigatures: true,
                                smoothScrolling: true,
                                cursorSmoothCaretAnimation: "on",
                                wordWrap: "on",
                                padding: { top: 16, bottom: 16 },
                            }}
                        />
                    </div>

                    {/* OUTPUT */}
                    <div className="mt-3 p-3 rounded bg-black text-green-400 text-sm min-h-[120px]">
                        {output || "Program output will appear here"}
                    </div>
                </main>

                {/* ================= RIGHT PANEL ================= */}
                <aside className="col-span-3 flex flex-col gap-4">

                    {/* VIDEO */}
                    <div className="settings-card bg-[var(--card)] p-3 border">
                        <VideoCall roomId={roomId} />
                    </div>

                    {/* PROBLEM */}
                    <div className="settings-card bg-[var(--card)] p-4 border">
                        <h3 className="font-bold mb-1 flex items-center gap-2">
                            Problem
                            <ChevronRight size={16} className="icon-muted" />
                        </h3>
                        <p className="text-sm opacity-80">
                            Find the longest subarray with sum K.
                        </p>
                        <p className="text-xs opacity-60 mt-1">
                            Constraints, examples, edge cases included.
                        </p>
                    </div>

                    {/* HISTORY */}
                    <div className="settings-card bg-[var(--card)] p-4 flex-1 overflow-y-auto border">
                        <h3 className="font-bold flex items-center gap-2 mb-2">
                            <History size={16} className="icon-muted" />
                            Timeline
                        </h3>
                        <ul className="text-xs space-y-1 opacity-80">
                            {events.map((e, i) => (
                                <li key={i}>
                                    ⏱ {e.time} — {e.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={() => setShowEval(true)}
                        className="btn-primary w-full"
                    >
                        End Interview
                    </button>
                </aside>
            </div>

            {/* ================= EVALUATION MODAL ================= */}
            {showEval && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[var(--card)] p-6 rounded-xl w-full max-w-md border">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <BarChart3 size={20} className="icon-muted" />
                            Evaluation
                        </h2>

                        {["Problem Solving", "Communication", "Code Quality", "Optimization"].map(
                            (item) => (
                                <div key={item} className="flex justify-between mb-3">
                                    <span>{item}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="5"
                                        className="w-16 border rounded p-1"
                                    />
                                </div>
                            )
                        )}

                        <textarea
                            placeholder="Final feedback"
                            className="w-full border rounded p-2 mt-2"
                        />

                        <button
                            onClick={() => setShowEval(false)}
                            className="btn-primary w-full mt-4"
                        >
                            Save & Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
