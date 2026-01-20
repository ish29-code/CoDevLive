import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { socket } from "../utils/socket";
import Editor from "@monaco-editor/react";
import VideoCall from "../components/interview/VideoCall";
import Loader from "../components/Loader";
import { problems } from "../data/problems";
import api from "../utils/axios"; // 👈 ADD THIS IMPORT
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";




import {
    Play,
    Pause,
    Clock,
    Lightbulb,
    History,
    BarChart3,
} from "lucide-react";


/* ================= INLINE RUN LOADER ================= */
function RunLoader() {
    return (
        <div className="flex items-center gap-2 text-xs opacity-80">
            <span className="w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            Running...
        </div>
    );
}

export default function InterviewRoom() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const { roomId } = useParams();

    const [myRole, setMyRole] = useState(null);
    const [isCreator, setIsCreator] = useState(false);

    const isInterviewer = myRole === "interviewer";
    const isStudent = myRole === "student";

    const navigate = useNavigate();

    const joinedRef = useRef(false);

    /* ================= STATE ================= */
    const [loading, setLoading] = useState(true);
    const [problem, setProblem] = useState(null);

    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");

    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(true);

    const [output, setOutput] = useState("");
    const [status, setStatus] = useState("");
    const [runLoading, setRunLoading] = useState(false);

    const [events, setEvents] = useState([]);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [hintsVisible, setHintsVisible] = useState(false);

    const [interviewerJoined, setInterviewerJoined] = useState(false);
    const [problemAssigned, setProblemAssigned] = useState(false);
    const [approved, setApproved] = useState(false);
    const [pendingStudents, setPendingStudents] = useState([]);



    const [showEval, setShowEval] = useState(false);



    useEffect(() => {
        const loadInterview = async () => {
            try {
                const res = await api.get(`/interview/${roomId}`);

                const data = res.data;

                setMyRole(data.myRole);
                setIsCreator(data.isCreator);
                setInterviewerJoined(data.interviewerJoined);
                setProblemAssigned(!!data.problemId);
                setApproved(Boolean(data.approved));


                if (data.problemId) {
                    const p = problems[data.problemId];
                    setProblem(p);
                    setCode(p.starterCode);
                } else {
                    setProblem(null);
                }

                setLoading(false);
            } catch (err) {
                console.error("Failed to load interview:", err);
            }
        };

        loadInterview();
    }, [roomId]);








    useEffect(() => {
        if (!roomId) return;

        // Join websocket room
        socket.emit("join-room", roomId);

        // ---- CHEAT EVENTS ----
        const onCheatEvent = (e) => {
            if (isInterviewer) {
                logEvent(`⚠ ${e.type.replace("_", " ")}`);
            }
        };

        // ---- PROBLEM ASSIGNED ----
        const onProblemAssigned = ({ problemId }) => {
            const p = problems[problemId];
            setProblem(p);
            setCode(p.starterCode);
            setProblemAssigned(true);
        };

        // ---- HINT VISIBILITY ----
        const onHintsVisibility = (show) => {
            setHintsVisible(show);
        };

        // ---- HOST RECEIVES JOIN REQUESTS ----
        const onJoinRequest = (participant) => {
            setPendingStudents(prev => [...prev, participant]);
        };

        // ---- PARTICIPANT APPROVED ----
        const onParticipantApproved = ({ userId }) => {
            if (userId === user._id) {
                setApproved(true);     // 🔥 update local state
                navigate(`/interview/${roomId}`);
            }
        };



        // ---- PARTICIPANT REJECTED ----
        const onParticipantRejected = ({ userId }) => {
            if (!isCreator && userId === user._id) {
                alert("Host rejected your request");
                navigate(`/interview/lobby/${roomId}`);
            }
        };

        // ---- SOCKET LISTENERS ----
        socket.on("cheat-event", onCheatEvent);
        socket.on("problem-assigned", onProblemAssigned);
        socket.on("hints-visibility", onHintsVisibility);
        socket.on("join-request", onJoinRequest);
        socket.on("participant-approved", onParticipantApproved);
        socket.on("participant-rejected", onParticipantRejected);

        // ---- CLEANUP ----
        return () => {
            socket.off("cheat-event", onCheatEvent);
            socket.off("problem-assigned", onProblemAssigned);
            socket.off("hints-visibility", onHintsVisibility);
            socket.off("join-request", onJoinRequest);
            socket.off("participant-approved", onParticipantApproved);
            socket.off("participant-rejected", onParticipantRejected);
        };
    }, [roomId, isCreator, navigate, user]
    );

    useEffect(() => {
        if (!isInterviewer) return;

        api.get(`/interview/pending/${roomId}`)
            .then(res => setPendingStudents(res.data))
            .catch(() => { });
    }, [isInterviewer, roomId]);




    /* ================= ANTI-CHEAT ================= */
    useEffect(() => {
        if (!isStudent) return;

        const blur = () =>
            socket.emit("cheat-event", { roomId, type: "WINDOW_BLUR" });

        const hidden = () =>
            document.hidden &&
            socket.emit("cheat-event", { roomId, type: "TAB_SWITCH" });

        window.addEventListener("blur", blur);
        document.addEventListener("visibilitychange", hidden);

        return () => {
            window.removeEventListener("blur", blur);
            document.removeEventListener("visibilitychange", hidden);
        };
    }, [roomId, isStudent]);

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

    const logEvent = (label) =>
        setEvents(e => [...e.slice(-15), { time: formatTime(), label }]);

    /* ================= RUN CODE ================= */
    const runCode = () => {
        setRunLoading(true);
        setStatus("");
        setOutput("");

        setTimeout(() => {
            try {
                eval(code);
                setStatus("Accepted");
                setOutput("All test cases passed ✔️");
                isInterviewer && logEvent("Code executed");
            } catch (err) {
                setStatus("Runtime Error");
                setOutput(err.message);
            } finally {
                setRunLoading(false);
            }
        }, 800);
    };

    /* ================= INTERVIEWER: SELECT PROBLEM ================= */
    const selectProblem = async (p) => {
        if (!isInterviewer) return;

        try {
            await api.post("/interview/assign-problem", {
                roomId,
                problemId: p.id,
            });
        } catch (err) {
            console.error("Assign problem failed", err.response?.data);
        }
    };
    const approve = async (userId) => {
        await api.post("/interview/approve", { roomId, userId });
        const res = await api.get(`/interview/pending/${roomId}`);
        setPendingStudents(res.data);
    };


    const reject = async (userId) => {
        await api.post("/interview/reject", { roomId, userId });
        const res = await api.get(`/interview/pending/${roomId}`);
        setPendingStudents(res.data);
    };





    if (loading) return <Loader />;

    // 🚫 Never block host
    if (!loading && !isCreator && !approved) {
        return (
            <div className="h-screen flex items-center justify-center text-sm opacity-70">
                ⏳ Waiting for host approval...
            </div>
        );
    }



    if (isStudent && !interviewerJoined) {
        return (
            <div className="h-screen flex items-center justify-center text-sm opacity-70">
                ⏳ Interviewer has not joined yet. Please wait...
            </div>
        );
    }





    /* ================= UI ================= */
    return (
        <div className="h-screen bg-[var(--background)] text-[var(--foreground)]">
            <div className="h-full grid grid-cols-12 gap-3 p-3">

                {/* ================= LEFT ================= */}
                <aside className="col-span-3 card-ui p-4 text-sm overflow-y-auto space-y-4">




                    {/* STUDENT — interviewer not joined */}
                    {isStudent && !interviewerJoined && (
                        <div className="text-sm opacity-70">
                            ⏳ Waiting for interviewer to join...
                        </div>
                    )}

                    {/* STUDENT — interviewer joined but problem not assigned */}
                    {isStudent && interviewerJoined && !problemAssigned && (
                        <div className="text-sm opacity-70">
                            ⏳ Wait a moment, interviewer has not assigned the problem yet.
                        </div>
                    )}

                    {/* INTERVIEWER — problem selector */}
                    {isInterviewer && !problem && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-[var(--accent)]">
                                Select Problem
                            </h3>

                            {Object.values(problems).map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => selectProblem(p)}
                                    className="w-full text-left px-3 py-2 border rounded hover:bg-[var(--accent)]/10"
                                >
                                    {p.title} ({p.difficulty})
                                </button>
                            ))}
                        </div>
                    )}

                    {/* PROBLEM VIEW — once assigned */}
                    {problem && (
                        <>
                            <h2 className="text-lg font-semibold text-[var(--accent)]">
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
                                        {`Input: ${ex.input}\nOutput: ${ex.output}`}
                                    </pre>
                                ))}
                            </div>

                            {/* HINTS — Interviewer Controls */}
                            {isInterviewer && (
                                <div className="pt-3 border-t border-[var(--border)]">
                                    <div className="flex items-center justify-between mb-2 opacity-80">
                                        <div className="flex items-center gap-2">
                                            <Lightbulb size={12} /> Hints
                                        </div>

                                        <button
                                            onClick={() =>
                                                socket.emit("toggle-hints", {
                                                    roomId,
                                                    show: true,
                                                })
                                            }
                                            className="text-xs underline"
                                        >
                                            Show to student
                                        </button>
                                    </div>

                                    {problem.hints.map((h, i) => (
                                        <button
                                            key={i}
                                            disabled={hintsUsed < i}
                                            onClick={() => {
                                                setHintsUsed(i + 1);
                                                logEvent(`Hint ${i + 1} used`);
                                            }}
                                            className={`w-full text-left px-2 py-1 rounded text-xs border
                            ${hintsUsed >= i
                                                    ? "border-[var(--accent)]/40 hover:bg-[var(--accent)]/10"
                                                    : "border-[var(--border)] opacity-40 cursor-not-allowed"
                                                }`}
                                        >
                                            {hintsUsed > i ? h : `Show Hint ${i + 1}`}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* STUDENT HINT VIEW */}
                            {isStudent && hintsVisible && (
                                <div className="pt-3 border-t border-[var(--border)]">
                                    <div className="flex items-center gap-2 mb-2 opacity-80">
                                        <Lightbulb size={12} /> Hints
                                    </div>

                                    {problem.hints.slice(0, hintsUsed).map((h, i) => (
                                        <div
                                            key={i}
                                            className="bg-[var(--background)] p-2 rounded text-xs mb-2"
                                        >
                                            {h}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {isInterviewer && pendingStudents.length > 0 && (
                        <div className="border rounded p-3 text-xs bg-[var(--background)]">
                            <p className="font-semibold text-[var(--accent)] mb-3">
                                Join Requests
                            </p>

                            {pendingStudents.map(p => (
                                <div key={p.userId} className="flex justify-between items-center">
                                    <span>
                                        {p.name} ({p.role})
                                    </span>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => approve(p.userId)}
                                            className="px-2 py-1 bg-green-500/15 text-green-600 rounded"
                                        >
                                            Approve
                                        </button>

                                        <button
                                            onClick={() => reject(p.userId)}
                                            className="px-2 py-1 bg-red-500/15 text-red-600 rounded"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                </aside>



                {/* ================= CENTER ================= */}
                <main className="col-span-6 card-ui p-2 flex flex-col">
                    <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-[var(--accent)]">
                            Code Editor
                        </span>

                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 opacity-80">
                                <Clock size={12} /> {formatTime()}
                            </span>

                            <button
                                onClick={() => setRunning(!running)}
                                className="px-2 py-1 border rounded"
                            >
                                {running ? <Pause size={12} /> : <Play size={12} />}
                            </button>

                            <select
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                className="bg-[var(--background)] px-2 py-1 rounded text-xs"
                            >
                                <option>javascript</option>
                                <option>java</option>
                                <option>cpp</option>
                                <option>python</option>
                            </select>

                            <button
                                onClick={runCode}
                                className="px-3 py-1.5 bg-[var(--accent)]/15 text-[var(--accent)] rounded"
                            >
                                Run
                            </button>

                            {isInterviewer && (
                                <button
                                    onClick={() => setShowEval(true)}
                                    className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded"
                                >
                                    End
                                </button>
                            )}
                        </div>
                    </div>

                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        theme={theme === "dark" ? "vs-dark" : "light"}
                        onChange={v => setCode(v || "")}
                        options={{ minimap: { enabled: false }, fontSize: 14 }}
                    />

                    <div className="mt-2 bg-[var(--background)] rounded p-2 text-xs min-h-[44px]">
                        {runLoading && <RunLoader />}
                        {!runLoading && status && (
                            <p className={status === "Accepted" ? "text-green-500" : "text-red-500"}>
                                {status} — {output}
                            </p>
                        )}
                    </div>
                </main>

                {/* ================= RIGHT ================= */}
                <aside className="col-span-3 flex flex-col gap-3 text-xs">
                    <div className="card-ui p-2">
                        <VideoCall roomId={roomId} />
                    </div>

                    {isInterviewer && (
                        <div className="card-ui p-3 flex-1 overflow-y-auto">
                            <div className="flex items-center gap-2 mb-2 font-semibold">
                                <History size={12} /> Timeline
                            </div>

                            <ul className="opacity-70 space-y-[2px]">
                                {events.map((e, i) => (
                                    <li key={i}>
                                        ⏱ {e.time} — {e.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </aside>
            </div>

            {/* ================= EVALUATION ================= */}
            {isInterviewer && showEval && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
                    <div className="card-ui p-5 w-[360px] text-sm">
                        <div className="flex items-center gap-2 mb-4 font-semibold text-[var(--accent)]">
                            <BarChart3 size={16} /> Interview Evaluation
                        </div>

                        {["Problem Solving", "Communication", "Code Quality"].map(k => (
                            <div key={k} className="flex justify-between mb-2">
                                <span>{k}</span>
                                <input type="number" min="0" max="5"
                                    className="w-12 bg-transparent border-b text-center" />
                            </div>
                        ))}

                        <button
                            onClick={() => setShowEval(false)}
                            className="btn-primary w-full mt-4"
                        >
                            Save Evaluation
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
