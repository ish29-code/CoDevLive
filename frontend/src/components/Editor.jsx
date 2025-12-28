// src/components/CodeEditor.jsx
import { useEffect } from "react";
import Editor from "@monaco-editor/react";
import { socket } from "../utils/socket";

export default function CodeEditor({ roomId, code, setCode }) {
    useEffect(() => {
        socket.on("code-update", (newCode) => {
            setCode(newCode);
        });

        return () => socket.off("code-update");
    }, []);

    const handleChange = (value) => {
        setCode(value);
        socket.emit("code-change", { roomId, code: value });
    };

    return (
        <Editor
            height="420px"
            language="javascript"
            value={code}
            onChange={handleChange}
            theme="vs-dark"
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
            }}
        />
    );
}
