import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Monitor } from "lucide-react";
import { socket } from "../../utils/socket";

const ICE = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export default function VideoCall({ roomId }) {
    const localRef = useRef();
    const streamRef = useRef();
    const pcsRef = useRef({}); // 🔥 multiple peer connections

    const [remoteStreams, setRemoteStreams] = useState([]);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);

    // ---------- INIT ----------
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (!mounted) return;

            streamRef.current = stream;
            localRef.current.srcObject = stream;

            socket.emit("join-room", roomId);

            // Receive existing users
            socket.on("all-users", async (users) => {
                for (const userId of users) {
                    const pc = createPeer(userId);
                    pcsRef.current[userId] = pc;

                    stream.getTracks().forEach(track => pc.addTrack(track, stream));

                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit("webrtc-offer", { to: userId, offer });
                }
            });

            // When new user joins later
            socket.on("user-joined", async (userId) => {
                const pc = createPeer(userId);
                pcsRef.current[userId] = pc;
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
            });

            // Receive offer
            socket.on("webrtc-offer", async ({ from, offer }) => {
                const pc = createPeer(from);
                pcsRef.current[from] = pc;

                stream.getTracks().forEach(track => pc.addTrack(track, stream));

                await pc.setRemoteDescription(offer);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("webrtc-answer", { to: from, answer });
            });

            // Receive answer
            socket.on("webrtc-answer", async ({ from, answer }) => {
                await pcsRef.current[from].setRemoteDescription(answer);
            });

            // ICE
            socket.on("ice-candidate", ({ from, candidate }) => {
                pcsRef.current[from]?.addIceCandidate(candidate);
            });

            // User left
            socket.on("user-left", (userId) => {
                pcsRef.current[userId]?.close();
                delete pcsRef.current[userId];
                setRemoteStreams(prev => prev.filter(r => r.id !== userId));
            });
        };

        init();

        return () => {
            mounted = false;
            socket.off("all-users");
            socket.off("user-joined");
            socket.off("webrtc-offer");
            socket.off("webrtc-answer");
            socket.off("ice-candidate");
            socket.off("user-left");
            Object.values(pcsRef.current).forEach(pc => pc.close());
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, [roomId]);

    // ---------- CREATE PEER ----------
    function createPeer(userId) {
        const pc = new RTCPeerConnection(ICE);

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("ice-candidate", { to: userId, candidate: e.candidate });
            }
        };

        pc.ontrack = (e) => {
            setRemoteStreams(prev => {
                const exists = prev.find(p => p.id === userId);
                if (exists) return prev;
                return [...prev, { id: userId, stream: e.streams[0] }];
            });
        };

        return pc;
    }

    // ---------- CONTROLS ----------
    const toggleMic = () => {
        streamRef.current.getAudioTracks().forEach(t => t.enabled = !micOn);
        setMicOn(!micOn);
    };

    const toggleCam = () => {
        streamRef.current.getVideoTracks().forEach(t => t.enabled = !camOn);
        setCamOn(!camOn);
    };

    // ---------- UI ----------
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap justify-center gap-2">
                {/* Local */}
                <video ref={localRef} autoPlay muted playsInline className="w-28 rounded" />

                {/* Remotes */}
                {remoteStreams.map(r => (
                    <video
                        key={r.id}
                        autoPlay
                        playsInline
                        className="w-28 rounded"
                        ref={el => { if (el) el.srcObject = r.stream; }}
                    />
                ))}
            </div>

            <div className="flex justify-center gap-3 mt-2">
                <button onClick={toggleMic} className="btn-outline p-2">
                    {micOn ? <Mic size={16} /> : <MicOff size={16} />}
                </button>

                <button onClick={toggleCam} className="btn-outline p-2">
                    {camOn ? <Video size={16} /> : <VideoOff size={16} />}
                </button>

                <button className="btn-outline p-2">
                    <Monitor size={16} />
                </button>
            </div>
        </div>
    );
}
