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

export default function Interview() {
    const { theme } = useTheme();
    const roomId = "interview-123";

    /* ================= STATE ================= */
    const [code, setCode] = useState("// Write your solution here");
    const [output, setOutput] = useState("");
    const [language, setLanguage] = useState("javascript");

    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(true);

    const [hintsUsed, setHintsUsed] = useState(0);
    const [notes, setNotes] = useState("");
    const [events, setEvents] = useState([]);
    const [showEval, setShowEval] = useState(false);

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
        const i = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(i);
    }, [running]);

    const formatTime = () =>
        `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
            seconds % 60
        ).padStart(2, "0")}`;

    const logEvent = (label) =>
        setEvents((e) => [...e, { time: formatTime(), label }]);

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

    return (
        <div className="h-screen bg-[var(--background)] text-[var(--foreground)]">
            <div className="h-full grid grid-cols-12 gap-3 p-3">

                {/* ================= LEFT ================= */}
                <aside className="col-span-2 bg-[var(--card)] p-3 space-y-4 text-sm overflow-hidden">
                    <h2 className="font-semibold flex items-center gap-2 text-[var(--accent)]">
                        <Settings size={16} /> Tools
                    </h2>

                    {/* Timer */}
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                            <Clock size={14} /> {formatTime()}
                        </span>
                        <button onClick={() => setRunning(!running)}>
                            {running ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                    </div>

                    {/* Checklist */}
                    <div>
                        <h3 className="font-medium flex items-center gap-2 mb-1">
                            <ListChecks size={14} /> Flow
                        </h3>
                        {Object.entries(checklist).map(([k, v]) => (
                            <label key={k} className="flex gap-2 items-center opacity-80">
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

                    {/* Hints */}
                    <div>
                        <h3 className="font-medium flex items-center gap-2 mb-1">
                            <Lightbulb size={14} /> Hint
                        </h3>
                        <button
                            className="text-xs underline"
                            onClick={() => {
                                setHintsUsed((h) => h + 1);
                                logEvent("Hint used");
                            }}
                        >
                            Use hint ({hintsUsed})
                        </button>
                        <p className="text-xs opacity-60 mt-1">
                            Prefix sum + hashmap
                        </p>
                    </div>

                    {/* Notes */}
                    <div>
                        <h3 className="font-medium flex items-center gap-2 mb-1">
                            <FileText size={14} /> Notes
                        </h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-transparent text-xs resize-none"
                            rows={4}
                        />
                    </div>
                </aside>

                {/* ================= CENTER ================= */}
                <main className="col-span-7 flex flex-col bg-[var(--card)] p-2">
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span className="font-semibold text-[var(--accent)]">Code</span>

                        <div className="flex gap-2 items-center">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-transparent text-xs"
                            >
                                <option>javascript</option>
                                <option>java</option>
                                <option>cpp</option>
                                <option>python</option>
                            </select>

                            <button onClick={runCode} className="text-xs flex items-center gap-1">
                                <Play size={12} /> Run
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            language={language}
                            value={code}
                            theme={theme === "dark" ? "vs-dark" : "light"}
                            onChange={handleCodeChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: "on",
                                padding: { top: 12, bottom: 12 },
                            }}
                        />
                    </div>

                    <div className="mt-1 text-xs text-green-500 min-h-[50px]">
                        {output || "Output"}
                    </div>
                </main>

                {/* ================= RIGHT ================= */}
                <aside className="col-span-3 flex flex-col gap-3 text-sm">

                    {/* Video */}
                    <div className="bg-[var(--card)] p-2">
                        <VideoCall roomId={roomId} />
                    </div>

                    {/* Problem */}
                    <div className="bg-[var(--card)] p-3 space-y-1">
                        <h3 className="font-semibold flex items-center gap-1">
                            Problem <ChevronRight size={14} />
                        </h3>

                        <p className="text-xs opacity-80">
                            Longest Subarray with Sum K
                        </p>

                        <div className="flex gap-2 text-xs mt-1">
                            <span className="px-2 py-[2px] rounded bg-green-500/20 text-green-500">
                                Easy
                            </span>
                            <span className="px-2 py-[2px] rounded bg-blue-500/20 text-blue-500">
                                Amazon
                            </span>
                            <span className="px-2 py-[2px] rounded bg-purple-500/20 text-purple-500">
                                Google
                            </span>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-[var(--card)] p-3 flex-1 overflow-hidden">
                        <h3 className="font-semibold flex items-center gap-2 mb-1">
                            <History size={14} /> Timeline
                        </h3>
                        <ul className="text-xs space-y-[2px] opacity-70">
                            {events.map((e, i) => (
                                <li key={i}>⏱ {e.time} — {e.label}</li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={() => setShowEval(true)}
                        className="btn-primary w-full text-sm py-2"
                    >
                        End Interview
                    </button>
                </aside>
            </div>

            {/* ================= EVAL ================= */}
            {showEval && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
                    <div className="bg-[var(--card)] p-5 rounded-xl w-[360px] text-sm">
                        <h2 className="font-semibold flex items-center gap-2 mb-3">
                            <BarChart3 size={16} /> Evaluation
                        </h2>

                        {["Problem Solving", "Communication", "Code Quality", "Optimization"].map(
                            (item) => (
                                <div key={item} className="flex justify-between mb-2">
                                    <span>{item}</span>
                                    <input type="number" min="0" max="5" className="w-12 bg-transparent" />
                                </div>
                            )
                        )}

                        <button
                            onClick={() => setShowEval(false)}
                            className="btn-primary w-full mt-3"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
