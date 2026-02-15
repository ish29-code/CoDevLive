import { useEffect, useRef, useState, memo } from "react";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Monitor,
    MonitorOff,
    Maximize2,
    Minimize2
} from "lucide-react";

import { socket } from "../../utils/socket";
import { useTheme } from "../../context/ThemeContext";

const ICE = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

//////////////////////////////////////////////////////////
// ✅ MEMO VIDEO TILE — prevents re-render flicker
//////////////////////////////////////////////////////////

const VideoTile = memo(({ stream, muted }) => {

    const ref = useRef();

    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video
            ref={ref}
            autoPlay
            muted={muted}
            playsInline
            className="w-full aspect-video object-cover rounded-lg bg-black"
        />
    );
});

//////////////////////////////////////////////////////////

export default function VideoCall({ roomId }) {

    const { theme } = useTheme();

    const streamRef = useRef(null);
    const pcsRef = useRef({});
    const screenTrackRef = useRef(null);

    const [remoteStreams, setRemoteStreams] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [presenting, setPresenting] = useState(false);

    //////////////////////////////////////////////////////////
    // INIT
    //////////////////////////////////////////////////////////

    useEffect(() => {

        let mounted = true;

        const init = async () => {

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            if (!mounted) return;

            streamRef.current = stream;

            socket.emit("join-room", roomId);

            socket.on("all-users", users => users.forEach(createConnection));
            socket.on("user-joined", createConnection);

            socket.on("webrtc-offer", async ({ from, offer }) => {

                const pc = createPeer(from);
                pcsRef.current[from] = pc;

                stream.getTracks().forEach(track =>
                    pc.addTrack(track, stream)
                );

                await pc.setRemoteDescription(offer);

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.emit("webrtc-answer", { to: from, answer });
            });

            socket.on("webrtc-answer", ({ from, answer }) => {
                pcsRef.current[from]?.setRemoteDescription(answer);
            });

            socket.on("ice-candidate", ({ from, candidate }) => {
                pcsRef.current[from]?.addIceCandidate(candidate);
            });

            socket.on("user-left", id => {

                pcsRef.current[id]?.close();
                delete pcsRef.current[id];

                setRemoteStreams(prev =>
                    prev.filter(r => r.id !== id)
                );
            });
        };

        init();

        return () => {
            mounted = false;
            socket.removeAllListeners();

            Object.values(pcsRef.current).forEach(pc => pc.close());
            streamRef.current?.getTracks().forEach(t => t.stop());
        };

    }, [roomId]);

    //////////////////////////////////////////////////////////
    // CONNECTION
    //////////////////////////////////////////////////////////

    function createConnection(userId) {

        if (pcsRef.current[userId]) return;

        const pc = createPeer(userId);
        pcsRef.current[userId] = pc;

        streamRef.current.getTracks().forEach(track =>
            pc.addTrack(track, streamRef.current)
        );

        pc.createOffer()
            .then(o => pc.setLocalDescription(o))
            .then(() => {
                socket.emit("webrtc-offer", {
                    to: userId,
                    offer: pc.localDescription
                });
            });
    }

    function createPeer(userId) {

        const pc = new RTCPeerConnection(ICE);

        pc.onicecandidate = e => {
            if (e.candidate) {
                socket.emit("ice-candidate", {
                    to: userId,
                    candidate: e.candidate
                });
            }
        };

        pc.ontrack = e => {
            setRemoteStreams(prev => {

                if (prev.some(p => p.id === userId))
                    return prev;

                return [...prev, {
                    id: userId,
                    stream: e.streams[0]
                }];
            });
        };

        return pc;
    }

    //////////////////////////////////////////////////////////
    // CONTROLS
    //////////////////////////////////////////////////////////

    const toggleMic = () => {
        streamRef.current?.getAudioTracks()
            .forEach(t => t.enabled = !micOn);

        setMicOn(!micOn);
    };

    const toggleCam = () => {
        streamRef.current?.getVideoTracks()
            .forEach(t => t.enabled = !camOn);

        setCamOn(!camOn);
    };

    //////////////////////////////////////////////////////////
    // ⭐ PRESENT (SCREEN SHARE)
    //////////////////////////////////////////////////////////

    const togglePresent = async () => {

        // STOP PRESENTING
        if (presenting) {

            const camTrack =
                streamRef.current.getVideoTracks()[0];

            Object.values(pcsRef.current).forEach(pc => {
                const sender = pc.getSenders()
                    .find(s => s.track.kind === "video");

                sender.replaceTrack(camTrack);
            });

            screenTrackRef.current?.stop();
            setPresenting(false);
            return;
        }

        // START PRESENTING
        const screen =
            await navigator.mediaDevices.getDisplayMedia({
                video: true
            });

        const track = screen.getVideoTracks()[0];
        screenTrackRef.current = track;

        Object.values(pcsRef.current).forEach(pc => {
            const sender = pc.getSenders()
                .find(s => s.track.kind === "video");

            sender.replaceTrack(track);
        });

        track.onended = togglePresent;

        setPresenting(true);
    };

    //////////////////////////////////////////////////////////
    // GRID
    //////////////////////////////////////////////////////////

    const participants = [
        { id: "local", stream: streamRef.current, muted: true },
        ...remoteStreams
    ];

    const columns =
        Math.ceil(Math.sqrt(participants.length));

    const bg =
        theme === "dark" ? "bg-black" : "bg-white";

    //////////////////////////////////////////////////////////
    // GRID COMPONENT (NOT recreated)
    //////////////////////////////////////////////////////////

    const grid = (
        <div
            className="grid gap-2 p-3 flex-1"
            style={{
                gridTemplateColumns:
                    `repeat(${columns}, 1fr)`
            }}
        >
            {participants.map(p => (
                <VideoTile
                    key={p.id}
                    stream={p.stream}
                    muted={p.muted}
                />
            ))}
        </div>
    );

    //////////////////////////////////////////////////////////
    // UI
    //////////////////////////////////////////////////////////

    return (
        <>
            {/* NORMAL */}
            <div className={`rounded-xl border overflow-hidden ${bg}`}>
                {grid}

                <Controls
                    {...{
                        micOn,
                        camOn,
                        presenting,
                        toggleMic,
                        toggleCam,
                        togglePresent,
                        expand: () => setExpanded(true)
                    }}
                />
            </div>

            {/* EXPANDED */}
            {expanded && (

                <div className="fixed inset-0 z-[1000] flex items-center justify-center">

                    {/* BLUR */}
                    <div
                        className="absolute inset-0 backdrop-blur-xl bg-black/40"
                        onClick={() => setExpanded(false)}
                    />

                    <div className={`relative w-[70%] h-[80%] rounded-2xl shadow-2xl flex flex-col ${bg}`}>
                        {grid}

                        <Controls
                            {...{
                                micOn,
                                camOn,
                                presenting,
                                toggleMic,
                                toggleCam,
                                togglePresent,
                                expand: () => setExpanded(false),
                                expanded: true
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

//////////////////////////////////////////////////////////
// CONTROLS (memo-level performance)
//////////////////////////////////////////////////////////

const Controls = memo(({
    micOn,
    camOn,
    presenting,
    toggleMic,
    toggleCam,
    togglePresent,
    expand,
    expanded
}) => (

    <div className="flex justify-center gap-4 py-4 border-t">

        <button onClick={toggleMic} className="btn-outline p-2">
            {micOn ? <Mic /> : <MicOff />}
        </button>

        <button onClick={toggleCam} className="btn-outline p-2">
            {camOn ? <Video /> : <VideoOff />}
        </button>

        <button onClick={togglePresent} className="btn-outline p-2">
            {presenting ? <MonitorOff /> : <Monitor />}
        </button>

        <button onClick={expand} className="btn-outline p-2">
            {expanded ? <Minimize2 /> : <Maximize2 />}
        </button>

    </div>
));
