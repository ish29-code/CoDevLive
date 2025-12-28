// src/components/VideoCall.jsx
import { useEffect, useRef } from "react";
import { socket } from "../utils/socket";

export default function VideoCall({ roomId }) {
    const localRef = useRef();
    const remoteRef = useRef();
    const pc = useRef(new RTCPeerConnection());

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localRef.current.srcObject = stream;
                stream.getTracks().forEach((track) =>
                    pc.current.addTrack(track, stream)
                );
            });

        pc.current.ontrack = (e) => {
            remoteRef.current.srcObject = e.streams[0];
        };

        pc.current.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("ice-candidate", {
                    roomId,
                    candidate: e.candidate,
                });
            }
        };

        socket.on("webrtc-offer", async (offer) => {
            await pc.current.setRemoteDescription(offer);
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            socket.emit("webrtc-answer", { roomId, answer });
        });

        socket.on("webrtc-answer", (answer) => {
            pc.current.setRemoteDescription(answer);
        });

        socket.on("ice-candidate", (candidate) => {
            pc.current.addIceCandidate(candidate);
        });

        return () => {
            socket.off("webrtc-offer");
            socket.off("webrtc-answer");
            socket.off("ice-candidate");
        };
    }, []);

    return (
        <div className="flex gap-3 justify-center">
            <video ref={localRef} autoPlay muted className="w-32 rounded-lg" />
            <video ref={remoteRef} autoPlay className="w-32 rounded-lg" />
        </div>
    );
}
