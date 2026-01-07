import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { problems } from "../data/problems";
import Loader from "../components/Loader";

export default function PracticeRoom() {
    const { id } = useParams();
    const navigate = useNavigate();

    const problemId = Number(id);

    /* ================= LOADING STATES ================= */
    const [pageLoading, setPageLoading] = useState(true);
    const [runLoading, setRunLoading] = useState(false);

    /* ================= FETCH PROBLEM ================= */
    const problem = useMemo(
        () => problems.find((p) => p.id === problemId),
        [problemId]
    );

    // ✅ simulate fetch delay (like backend call)
    useEffect(() => {
        const t = setTimeout(() => setPageLoading(false), 600);
        return () => clearTimeout(t);
    }, []);

    /* ================= INVALID ID ================= */
    if (!pageLoading && !problem) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[var(--background)]">
                <h2 className="text-xl font-semibold mb-2">
                    Problem not found ❌
                </h2>
                <button
                    onClick={() => navigate("/dsa")}
                    className="btn-primary"
                >
                    Back to DSA Sheet
                </button>
            </div>
        );
    }

    /* ================= PAGE LOADER ================= */
    if (pageLoading) return <Loader />;

    /* ================= STATE ================= */
    const [code, setCode] = useState(problem.starterCode);
    const [output, setOutput] = useState("");
    const [status, setStatus] = useState("");

    /* ================= RUN CODE ================= */
    const runCode = () => {
        setRunLoading(true);
        setStatus("");
        setOutput("");

        // 🔥 simulate judge execution
        setTimeout(() => {
            setRunLoading(false);
            setStatus("Accepted ✅");
            setOutput("All test cases passed ✔️");
        }, 1200);
    };

    return (
        <div className="h-screen grid grid-cols-12 gap-3 p-3 bg-[var(--background)] text-[var(--foreground)]">

            {/* LEFT — PROBLEM */}
            <aside className="col-span-4 card-ui p-4 overflow-auto">
                <h2 className="text-xl font-bold">{problem.title}</h2>

                <p className="text-sm opacity-80 mt-2">
                    {problem.description}
                </p>

                {/* EXAMPLES */}
                <h4 className="mt-4 font-semibold">Examples</h4>
                {problem.examples.map((ex, i) => (
                    <pre
                        key={i}
                        className="bg-[var(--background)] p-2 rounded text-xs mt-2"
                    >
                        {`Input: ${ex.input}
Output: ${ex.output}`}
                    </pre>
                ))}

                {/* HINTS */}
                <h4 className="mt-4 font-semibold">Hints</h4>
                <ul className="list-disc ml-5 text-sm opacity-80">
                    {problem.hints.map((h, i) => (
                        <li key={i}>{h}</li>
                    ))}
                </ul>
            </aside>

            {/* CENTER — EDITOR */}
            <main className="col-span-5 card-ui p-2 editor-glow">
                <Editor
                    height="100%"
                    language={problem.language || "javascript"}
                    value={code}
                    onChange={(v) => setCode(v)}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        automaticLayout: true,
                    }}
                />
            </main>

            {/* RIGHT — OUTPUT */}
            <aside className="col-span-3 card-ui p-3 flex flex-col">

                <button
                    className="btn-primary w-full mb-3"
                    onClick={runCode}
                    disabled={runLoading}
                >
                    {runLoading ? "Running..." : "Run Code"}
                </button>

                {/* RUN LOADER */}
                {runLoading && (
                    <div className="flex justify-center my-4">
                        <Loader small />
                    </div>
                )}

                {/* RESULT */}
                {!runLoading && status && (
                    <div className="text-green-500 font-semibold mb-2">
                        {status}
                    </div>
                )}

                <pre className="text-xs whitespace-pre-wrap flex-1">
                    {output || "Output will appear here"}
                </pre>
            </aside>
        </div>
    );
}
