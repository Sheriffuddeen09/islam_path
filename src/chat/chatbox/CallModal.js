import { useEffect, useRef, useState } from "react";

export default function CallModal({ activeChat, callMode, setCallMode }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [connecting, setConnecting] = useState(true);

  const [isMuted, setIsMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);

  // ================= LOAD JITSI =================
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      setReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;

    script.onload = () => setReady(true);

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ================= INIT CALL =================
  useEffect(() => {
    if (!ready || !callMode || !activeChat) return;

    setConnecting(true);

    apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
      roomName: `ChatApp-${activeChat.id}`,
      parentNode: containerRef.current,
      width: "100%",
      height: "100%",

      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: callMode === "audio",
      },

      interfaceConfigOverwrite: {
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      },
    });

    // ✅ connected
    apiRef.current.addEventListener("videoConferenceJoined", () => {
      setConnecting(false);
    });

    // ✅ call ended
    apiRef.current.addEventListener("readyToClose", () => {
      setCallMode(null);
    });

    return () => {
      apiRef.current?.dispose();
    };
  }, [ready, callMode, activeChat]);

  // ================= CONTROLS =================

  // 🎤 MUTE
  const toggleMute = () => {
    if (!apiRef.current) return;

    apiRef.current.executeCommand("toggleAudio");
    setIsMuted(prev => !prev);
  };

  // 🔊 SPEAKER (UI ONLY)
  const toggleSpeaker = () => {
    setSpeakerOn(prev => !prev);
  };

  // ❌ CLOSE CALL
  const handleClose = () => {
    apiRef.current?.dispose();
    setCallMode(null);
  };

  // ================= UI =================
  if (!callMode) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">

      {/* HEADER */}
      <div className="flex items-center justify-between p-4 text-white bg-black/60 backdrop-blur">
        <div>
          <h3 className="font-semibold">
            {activeChat?.other_user?.first_name}
          </h3>

          <p className="text-xs text-gray-300">
            {connecting
              ? "Connecting..."
              : callMode === "audio"
              ? "Audio Call"
              : "Video Call"}
          </p>
        </div>

        <button
          onClick={handleClose}
          className="bg-red-500 px-3 py-1 rounded-full z-50 cursor-pointer"
        >
          End
        </button>
      </div>

      {/* LOADING */}
      {connecting && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
          Connecting call...
        </div>
      )}

      {/* VIDEO AREA */}
      <div ref={containerRef} className="flex-1" />

      {/* FOOTER CONTROLS */}
      <div className="flex justify-center gap-6 p-4 bg-black/60">

        {/* 🎤 MIC */}
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full transition z-50 ${
            isMuted ? "bg-red-500 text-white" : "bg-gray-700 text-white"
          }`}
        >
          {isMuted ? (
            // muted icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M18 12.75V12a6 6 0 0 0-9.33-5M6 6l12 12M12 15.75v3.75m-3.75 0h7.5" />
            </svg>
          ) : (
            // normal mic
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          )}
        </button>

        {/* 🔊 SPEAKER */}
        <button
          onClick={toggleSpeaker}
          className={`p-3 rounded-full transition z-50 ${
            speakerOn
              ? "bg-white text-black"
              : "bg-gray-700 text-white"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
          </svg>
        </button>


        {/* ❌ END End */}
        <button
          onClick={handleClose}
          className="bg-red-500 text-white p-4 rounded-full z-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

      </div>
    </div>
  );
}