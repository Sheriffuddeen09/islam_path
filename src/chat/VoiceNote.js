import { useState, useRef } from "react";
import api from "../Api/axios";
import toast, { Toaster } from "react-hot-toast";


export default function VoiceNote({ chatId, onNewMessage }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  /* ================= START ================= */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioChunksRef.current = [];
      setAudioUrl(null);
      setDuration(0);

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        if (!audioChunksRef.current.length) return;

        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      toast.error("Mic permission denied", err);
    }
  };

  /* ================= STOP ================= */
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());

    setRecording(false);
    clearInterval(timerRef.current);
  };

  /* ================= CANCEL ================= */
  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }

    mediaRecorderRef.current = null;
    audioChunksRef.current = [];

    setRecording(false);
    setAudioUrl(null);
    setDuration(0);
    clearInterval(timerRef.current);
  };

  /* ================= SEND ================= */
 const sendVoice = async () => {
  if (!audioChunksRef.current.length) return; // no audio to send

  // Stop recording if still active
  if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
  }

  const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("voice", blob, `voice-${Date.now()}.webm`);

  setLoading(true)
  try {
    const res = await api.post("/api/messages/voice", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Add message to UI
    if (onNewMessage && res.data.message) {
    onNewMessage(res.data.message);
  }

    // Clear recording state safely
    cancelRecording();
  } catch (err) {
    toast.error("Voice upload failed", err);
  }
  finally{
    setLoading(false)
  }
};


  const time = `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}`;

  /* ================= UI ================= */
  return (
    <div className="relative">
      {/* MIC BUTTON */}
      {!recording && !audioUrl && (
        <button onClick={startRecording}>
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"  className="sm:w-4 sm:h-4 w-4 h-4 text-black hover:text-gray-600 cursor-pointer">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
        </button>
      )}

      {/* RECORDING STATE */}
      {recording && (
        <div className="fixed bottom-24 -translate-x-1/2 bg-white shadow px-3 py-2 rounded flex gap-2 items-center cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"  className=" w-8 h-8 p-1 rounded-2xl text-white bg-red-500 cursor-pointer" onClick={stopRecording}>
          <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
        </svg>

          <span className="text-black">{time}</span>
        </div>
      )}

      {/* PREVIEW STATE */}
      {audioUrl && (
  <div className="fixed bottom-24 -translate-x-1/2 bg-white shadow px-3 py-2 rounded flex gap-2 items-center">
    <button onClick={cancelRecording}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-black cursor-pointer">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
    <button onClick={sendVoice} className="text-white px-3 py-1 rounded">
      {
      loading ? (
      <svg
      className="animate-spin h-5 w-5 text-white mx-auto"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25 text-black"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  ) : 
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-black cursor-pointer">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>
      }
    </button>
    <span className="text-black">{time}</span>
  </div>
)}

    </div>
  );
}
