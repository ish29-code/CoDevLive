import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import {
    Timer,
    Code,
    CheckCircle,
    Brain,
    MessageSquare,
    Play,
    Pause,
    RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ================= MODES ================= */
const MODES = ["solo", "mock", "interviewer", "replay", "ai"];

export default function Interview() {
    const { theme } = useTheme();

    /* ================= GLOBAL STATE ================= */
    const [mode, setMode] = useState("solo");
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState("");
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);

    /* ================= INTERVIEW FLOW ================= */
    const [flow, setFlow] = useState({
        clarify: false,
        brute: false,
        optimize: false,
        final: false,
        complexity: false,
    });

    /* ================= EVALUATION ================= */
    const [evaluation, setEvaluation] = useState({
        problemSolving: 0,
        communication: 0,
        codeQuality: 0,
        optimization: 0,
        notes: "",
    });

    /* ================= TIMER ================= */
    useEffect(() => {
        if (!running) return;
        const id = setInterval(() => setTime((t) => t + 1), 1000);
        return () => clearInterval(id);
    }, [running]);

    const formatTime = () =>
        `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`;

    /* ================= HANDLERS ================= */
    const toggleFlow = (key) =>
        setFlow((prev) => ({ ...prev, [key]: !prev[key] }));

    /* ================= UI ================= */
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
            <div className="container-center py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ================= LEFT: PROBLEM ================= */}
                <section className="lg:col-span-3 settings-card p-5 rounded-xl bg-[var(--card)]">
                    <h2 className="font-semibold text-lg mb-3">Problem</h2>
                    <p className="text-sm opacity-80">
                        Given an array, find the longest subarray with sum = K.
                    </p>

                    <div className="mt-4 text-xs opacity-70">
                        Difficulty: <span className="font-semibold">Medium</span>
                    </div>
                </section>

                {/* ================= CENTER: EDITOR ================= */}
                <section className="lg:col-span-6 settings-card p-5 rounded-xl bg-[var(--card)] space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <Code size={18} />
                            <span className="font-semibold">Code Editor</span>
                        </div>

                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="border rounded px-2 py-1 bg-transparent"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="python">Python</option>
                        </select>
                    </div>

                    {/* Editor */}
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        readOnly={mode === "replay"}
                        placeholder="// Start coding here..."
                        className="
              w-full h-[400px]
              border rounded-lg p-3
              bg-transparent font-mono text-sm
            "
                    />
                </section>

                {/* ================= RIGHT: TOOLS ================= */}
                <section className="lg:col-span-3 space-y-6">

                    {/* MODE */}
                    <div className="settings-card p-4 rounded-xl bg-[var(--card)]">
                        <h3 className="font-semibold mb-2">Mode</h3>
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            className="w-full border rounded p-2 bg-transparent"
                        >
                            {MODES.map((m) => (
                                <option key={m} value={m}>
                                    {m.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* TIMER */}
                    <div className="settings-card p-4 rounded-xl bg-[var(--card)]">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Timer size={18} />
                                <span className="font-semibold">{formatTime()}</span>
                            </div>

                            <div className="flex gap-2">
                                <Button size="icon" onClick={() => setRunning(!running)}>
                                    {running ? <Pause size={16} /> : <Play size={16} />}
                                </Button>
                                <Button size="icon" onClick={() => setTime(0)}>
                                    <RotateCcw size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* INTERVIEW FLOW */}
                    <div className="settings-card p-4 rounded-xl bg-[var(--card)]">
                        <h3 className="font-semibold mb-3">Interview Flow</h3>
                        {Object.keys(flow).map((k) => (
                            <div
                                key={k}
                                onClick={() => toggleFlow(k)}
                                className="flex items-center gap-2 cursor-pointer text-sm"
                            >
                                <CheckCircle
                                    size={16}
                                    className={flow[k] ? "text-green-500" : "opacity-30"}
                                />
                                {k.toUpperCase()}
                            </div>
                        ))}
                    </div>

                    {/* EVALUATION */}
                    <div className="settings-card p-4 rounded-xl bg-[var(--card)]">
                        <h3 className="font-semibold mb-2">Evaluation</h3>

                        {["problemSolving", "communication", "codeQuality", "optimization"].map(
                            (key) => (
                                <div key={key} className="text-sm">
                                    {key}:{" "}
                                    <input
                                        type="number"
                                        min={0}
                                        max={5}
                                        value={evaluation[key]}
                                        onChange={(e) =>
                                            setEvaluation({
                                                ...evaluation,
                                                [key]: e.target.value,
                                            })
                                        }
                                        className="w-12 ml-2 border rounded px-1 bg-transparent"
                                    />
                                </div>
                            )
                        )}

                        <textarea
                            placeholder="Notes..."
                            value={evaluation.notes}
                            onChange={(e) =>
                                setEvaluation({ ...evaluation, notes: e.target.value })
                            }
                            className="mt-2 w-full border rounded p-2 text-sm bg-transparent"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
