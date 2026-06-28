import { useEffect, useRef, useState } from "react";

export default function CallModal({
  activeChat,
  callMode,
  setCallMode,
  incomingCall, setIncomingCall, meetingData, isCaller
}) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showAllParticipants, setShowAllParticipants] = useState(false);

  const [isMuted, setIsMuted] = useState(false);

  const [isSharingScreen, setIsSharingScreen] =
  useState(false);

  const shareScreen = () => {
    if (!apiRef.current) return;

    apiRef.current.executeCommand(
      "toggleShareScreen"
    );

    setIsSharingScreen(prev => !prev);
  };

  const switchToVideo = () => {
    if (!apiRef.current) return;

    apiRef.current.executeCommand(
      "toggleVideo"
    );

    setCallMode("video");
  };

  const switchToAudio = () => {
  if (!apiRef.current) return;

  apiRef.current.executeCommand(
    "toggleVideo"
  );

  setCallMode("audio");
};

  const switchCamera = () => {
  if (!apiRef.current) return;

    apiRef.current.executeCommand(
      "toggleCamera"
    );
  };
  
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

  useEffect(() => {
    if (!incomingCall) return;

    const timer = setTimeout(() => {
      setIncomingCall(null);
      setCallMode(null);
    }, 30000); // 30s

    return () => clearTimeout(timer);
  }, [incomingCall]);


  useEffect(() => {
    if (!ready || !callMode || !activeChat) return;

    setConnecting(true);

    apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
    roomName: meetingData?.room_id || `chat_${activeChat.id}`,
    parentNode: containerRef.current,
    width: "100%",
    height: "100%",
    configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: callMode === "audio",
        prejoinPageEnabled: false,
    },
    interfaceConfigOverwrite: {
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
    },
    });

    // Local user joined
    apiRef.current.addEventListener("videoConferenceJoined", (e) => {
        setConnecting(false);

        setParticipants([
            {
                id: e.id,
                name: e.displayName || "You",
            },
        ]);
    });

    // Remote participant joined
    apiRef.current.addEventListener("participantJoined", (e) => {
        setParticipants(prev => {
            if (prev.find(p => p.id === e.id)) return prev;

            return [
                ...prev,
                {
                    id: e.id,
                    name: e.displayName || "Guest",
                },
            ];
        });
    });

    // Remote participant left
    apiRef.current.addEventListener("participantLeft", (e) => {
        setParticipants(prev =>
            prev.filter(p => p.id !== e.id)
        );
    });

    apiRef.current.addEventListener("readyToClose", () => {
        setParticipants([]);
        setCallMode(null);
        setIncomingCall(null);
    });

    apiRef.current.addEventListener("videoConferenceJoined", () => {
      setConnecting(false);
    });



    return () => {
      apiRef.current?.dispose();
    };
  }, [ready, callMode, activeChat]);



  const joinCall = () => {
    if (!incomingCall) return;

    setCallMode(incomingCall.type);
    setIncomingCall(null);
  };

  const rejectCall = () => {
    setIncomingCall(null);
    setCallMode(null);
  };

  const handleClose = () => {
    apiRef.current?.dispose();
    setCallMode(null);
    setIncomingCall(null);
  };

  const toggleSpeaker = async () => {
  const iframe =
    containerRef.current?.querySelector("audio");

  if (
    iframe &&
    typeof iframe.setSinkId === "function"
  ) {
    try {
      await iframe.setSinkId("default");
      setSpeakerOn(true);
    } catch (err) {
      console.error(err);
    }
  }
};

  const toggleMute = () => {
  if (!apiRef.current) return;

  apiRef.current.executeCommand("toggleAudio");

  setIsMuted(prev => !prev);
};

  if (!callMode && !incomingCall) return null;

  const callerName =
  incomingCall?.callerName ||
  activeChat?.other_user?.first_name || activeChat?.group_name ||
  "Unknown";

  const avatar =
    callerName?.charAt(0)?.toUpperCase();

  return (
  <div className="fixed inset-0 z-50 bg-black flex flex-col">

    {/* ================= CALLING ================= */}
    {isCaller === true && (
      <div
        className="
          fixed
          top-4
          left-1/2
          -translate-x-1/2
          z-50
          bg-black/80
          text-white
          p-4
          rounded-xl
          flex
          items-center
          gap-3
        "
      >
        <div className="flex flex-col items-center ">
        <div className="inline-flex items-center gap-2">
        <div
          className="
            w-10
            h-10
            bg-green-600
            rounded-full
            flex
            items-center
            justify-center
            font-bold
          "
        >
          {avatar}
        </div>
        <p>{callerName}</p>
        </div>
        <div className="font-bold">
          Calling ...
        </div>
        </div>
      </div>
    )}

    {/* ================= INCOMING CALL ================= */}
    {incomingCall && !isCaller && (
      <div
        className="
          fixed
          top-4
          left-1/2
          -translate-x-1/2
          z-50
          bg-black
          text-white
          p-4
          rounded-xl
          shadow-2xl
          flex
          items-center
          gap-4
        "
      >
        <div
          className="
            w-10
            h-10
            bg-green-600
            rounded-full
            flex
            items-center
            justify-center
            font-bold
          "
        >
          {avatar}
        </div>

        <div>
          <p className="font-semibold text-white">
            {callerName}
          </p>

          <p className="text-xs text-gray-300">
            Incoming call
          </p>
        </div>

        <button
          onClick={joinCall}
          className="
            bg-green-600
            px-3
            py-1
            rounded
          "
        >
          Join
        </button>

        <button
          onClick={rejectCall}
          className="
            bg-red-600
            px-3
            py-1
            rounded
          "
        >
          Reject
        </button>
      </div>
    )}

    {/* ================= TOP BAR ================= */}
    <div className="absolute top-0 left-0 right-0 z-40 p-4">

      {/* Camera Switch */}
      {callMode === "video" && (
        <div className="relative group inline-block">
        <button
         
          onClick={switchCamera}
          className="
            absolute
            right-4
            top-4
            bg-gray-800
            text-white
            p-3
            rounded-full
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
</svg>

        </button>

        <div
    className="
      absolute
      bottom-full
      left-1/2
      -translate-x-1/2
      mb-2
      px-3
      py-1.5
      text-xs
      font-semibold
      text-white
      bg-gray-900
      rounded-lg
      shadow-lg
      opacity-0
      group-hover:opacity-100
      transition-opacity
      whitespace-nowrap
      pointer-events-none
      z-50
    "
  >
    Camera
  </div>
        </div>
      )}

      {/* User Name */}
      <div className="flex justify-center">
        <div
          className="
            bg-black/60
            text-white
            px-4
            py-2
            rounded-full
          "
        >
          {/* {callerName} */}
        </div>
      </div>

    </div>

    {/* ================= CONNECTING ================= */}
    {connecting && (
      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          text-white
          z-30
        "
      >
        Connecting...
      </div>
    )}

    {/* ================= AUDIO AVATAR ================= */}
    {callMode === "audio" && (
      <div
        className="
          absolute
          inset-0
          flex
          flex-col
          items-center
          justify-center
          z-10
          pointer-events-none
        "
      >
        <div
          className="
            w-32
            h-32
            rounded-full
            bg-green-600
            flex
            items-center
            justify-center
            text-white
            text-5xl
            font-bold
          "
        >
          {avatar}
        </div>

        <div
          className="
            mt-4
            text-white
            text-xl
            font-semibold
          "
        >
          {callerName}
        </div>
      </div>
    )}

    {/* ================= JITSI VIDEO gray ================= */}
    <div
      ref={containerRef}
      className={`
        flex-1 
       
      `}
    />

    {/* ================= CONTROLS ================= */}
    <div
      className="
        flex
        justify-center
        gap-4
        p-4
        bg-black/60
        z-50
      "
    >

      {/* MUTE */}
      <button
        
          onClick={toggleMute}
          className={`p-3 rounded-full transition z-50 ${
            isMuted ? "bg-red-500 text-white" : "bg-gray-700 text-white"
          }`}
        >
          {isMuted ? (
                  <div className="relative group inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M18 12.75V12a6 6 0 0 0-9.33-5M6 6l12 12M12 15.75v3.75m-3.75 0h7.5" />
            </svg>

             <div
              className="
                absolute
                bottom-full
                left-1/2
                -translate-x-1/2
                mb-2
                px-3
                py-1.5
                text-xs
                font-semibold
                text-white
                bg-gray-900
                rounded-lg
                shadow-lg
                opacity-0
                group-hover:opacity-100
                transition-opacity
                whitespace-nowrap
                pointer-events-none
                z-50
              "
            >
              Mute
            </div>
            </div>
          ) : (
                  <div className="relative group inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
            <div
              className="
                absolute
                bottom-full
                left-1/2
                -translate-x-1/2
                mb-2
                px-3
                py-1.5
                text-xs
                font-semibold
                text-white
                bg-gray-900
                rounded-lg
                shadow-lg
                opacity-0
                group-hover:opacity-100
                transition-opacity
                whitespace-nowrap
                pointer-events-none
                z-50
              "
            >
              Unmute
            </div>
            </div>
          )}
        </button>

       
      
        
      {/* SPEAKER */}
      <div className="relative group inline-block">
      <button
          title="Speaker"
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
        <div
              className="
                absolute
                bottom-full
                left-1/2
                -translate-x-1/2
                mb-2
                px-3
                py-1.5
                text-xs
                font-semibold
                text-white
                bg-gray-900
                rounded-lg
                shadow-lg
                opacity-0
                group-hover:opacity-100
                transition-opacity
                whitespace-nowrap
                pointer-events-none
                z-50
              "
            >
              Speaker
            </div>
        </div>

      {/* SHARE SCREEN */}
      {callMode === "video" && (
        <div className="relative group inline-block">
        <button
          title="Share Screen"
          onClick={shareScreen}
          className={`p-3 rounded-full ${
          isSharingScreen
            ? "bg-green-600"
            : "bg-gray-700"
        } text-white`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>

        </button>
        <div
              className="
                absolute
                bottom-full
                left-1/2
                -translate-x-1/2
                mb-2
                px-3
                py-1.5
                text-xs
                font-semibold
                text-white
                bg-gray-900
                rounded-lg
                shadow-lg
                opacity-0
                group-hover:opacity-100
                transition-opacity
                whitespace-nowrap
                pointer-events-none
                z-50
              "
            >
              Share Screen
            </div>
        </div>
      )}

      {/* AUDIO -> VIDEO */}
      {callMode === "audio" && (
        <div className="relative group inline-block">
        <button
          title="Switch to Video"
          onClick={switchToVideo}
          className="
            p-3
            rounded-full
            bg-green-600
            text-white
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>

        </button>
        <div
              className="
                absolute
                bottom-full
                left-1/2
                -translate-x-1/2
                mb-2
                px-3
                py-1.5
                text-xs
                font-semibold
                text-white
                bg-gray-900
                rounded-lg
                shadow-lg
                opacity-0
                group-hover:opacity-100
                transition-opacity
                whitespace-nowrap
                pointer-events-none
                z-50
              "
            >
              Switch to Video
            </div>
        </div>
      )}

      {/* VIDEO -> AUDIO */}
      {callMode === "video" && (
        <div className="relative group inline-block">
        <button
          title="Switch to Audio"
          onClick={switchToAudio}
          className="
            p-3
            rounded-full
            bg-blue-600
            text-white
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409" />
          </svg>

        </button>
        <div
              className="
                absolute
                bottom-full
                left-1/2
                -translate-x-1/2
                mb-2
                px-3
                py-1.5
                text-xs
                font-semibold
                text-white
                bg-gray-900
                rounded-lg
                shadow-lg
                opacity-0
                group-hover:opacity-100
                transition-opacity
                whitespace-nowrap
                pointer-events-none
                z-50
              "
            >
              Switch to Audio
            </div>
        </div>
      )}

      {/* END CALL */}
      <div className="relative group inline-block">
      <button
        title="Cancel"
        onClick={handleClose}
        className="
          bg-red-500
          text-white
          p-3
          rounded-full
        "
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>

      </button>
      <div
              className="
                absolute
                bottom-full
                left-1/2
                -translate-x-1/2
                mb-2
                px-3
                py-1.5
                text-xs
                font-semibold
                text-white
                bg-gray-900
                rounded-lg
                shadow-lg
                opacity-0
                group-hover:opacity-100
                transition-opacity
                whitespace-nowrap
                pointer-events-none
                z-50
              "
            >
              Cancel
            </div>
      </div>
      </div>

  
  </div>
);
}