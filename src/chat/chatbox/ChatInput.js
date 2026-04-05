import React, { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import api from "../../Api/axios";
import VoiceWave from "./VoiceWave";

export default function ChatInput({ chatId, authUser, setMessages, setIsTyping, bottomRef }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const holdTimeout = useRef(null);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(0);

  const timerRef = useRef(null)

  const pausedRef = useRef(false);

  const startTimer = () => {
  clearInterval(timerRef.current);

  timerRef.current = setInterval(() => {
    if (pausedRef.current) return; // ✅ THIS STOPS THE BUG
    setDuration((d) => d + 1);
  }, 1000);
};

 const pauseRecording = () => {
  const recorder = mediaRecorderRef.current;

  if (!recorder || recorder.state !== "recording") return;

  recorder.pause();

  pausedRef.current = true; // ✅ BLOCK TIMER

  clearInterval(timerRef.current);
  timerRef.current = null;

  setPaused(true);
};


const resumeRecording = () => {
  const recorder = mediaRecorderRef.current;

  if (!recorder || recorder.state !== "paused") return;

  recorder.resume();

  pausedRef.current = false; // ✅ allow timer again

  startTimer(); // ✅ clean restart

  setPaused(false);
};

  const sendFile = async () => {
  if (!file) return;

  const tempId = Date.now();

  let type = "file";
  if (file.type.startsWith("image/")) type = "image";
  else if (file.type.startsWith("video/")) type = "video";
  else if (file.type.startsWith("audio/")) type = "voice";

  const tempMessage = {
    id: tempId,
    type,
    sender_id: authUser.id,
    status: "sending",
    local: previewUrl,
    file_name: file.name,
  };

  setMessages(prev => [...prev, tempMessage]);

  setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("file", file);
  form.append("type", type);

  try {
    const res = await api.post("/api/messages", form);

    setMessages(prev =>
      prev.map(m =>
        m.id === tempId ? { ...res.data, status: "sent" } : m
      )
    );

  } catch {
    setMessages(prev =>
      prev.map(m =>
        m.id === tempId ? { ...m, status: "failed" } : m
      )
    );
  }

  // ✅ FULL CLEANUP (IMPORTANT)
  setShowPreview(false);
  setFile(null);
  setPreviewUrl(null);

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};

  useEffect(() => {
  if (!text) return;

  const timeout = setTimeout(() => {
    api.post("/api/messages/typing", {
      chat_id: chatId
    });
  }, 300);

  return () => clearTimeout(timeout);
}, [text]);

    useEffect(() => {
    window.Echo.private(`chat.${chatId}`)
        .listen("UserTyping", () => {
        setIsTyping(true);

        setTimeout(() => setIsTyping(false), 2000);
        });
    }, []);


  // ================= EMOJI
  const onEmojiClick = (emojiData) => {
    setText(prev => prev + emojiData.emoji);
  };

  // ================= TEXT SEND
  const sendText = async () => {
    if (!text.trim()) return;

    const tempId = Date.now();

    const tempMessage = {
      id: tempId,
      message: text,
      type: "text",
      sender_id: authUser.id,
      status: "sending",
    };

    setMessages(prev => [...prev, tempMessage]);
    setText("");

    try {
      const { data } = await api.post("/api/messages", {
        chat_id: chatId,
        message: tempMessage.message,
        type: "text",
      });

      setMessages(prev =>
        prev.map(m => (m.id === tempId ? { ...data, status: "sent" } : m))
      );

      setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);

    } catch {
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? { ...m, status: "failed" } : m))
      );
    }
  };

  // ================= FILE PICK
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setShowPreview(true);
  };



  // ================= HOLD VOICE
  const handleHoldStart = () => {
  holdTimeout.current = setTimeout(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    setDuration(0);
    pausedRef.current = false; // ✅ reset pause state

    recorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    recorder.start();
    setRecording(true);

    startTimer(); // ✅ use helper

  }, 200);
};

  const handleHoldEnd = () => {
    clearTimeout(holdTimeout.current);

    if (!recording) return;

    stopRecording();
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }

    mediaRecorderRef.current = null;
    audioChunksRef.current = [];

    setRecording(false)
    setDuration(0);
    clearInterval(timerRef.current);
  };

  // ================= VOICE SEND
  const stopRecording = async () => {
    const recorder = mediaRecorderRef.current;

  if (!recorder) return;

  // ✅ CLEAR TIMER ALWAYS
  clearInterval(timerRef.current);

  setPaused(false);
  setRecording(false);

  recorder.stop();
  recorder.stream.getTracks().forEach(t => t.stop());

    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

    const tempId = Date.now();

    const tempMessage = {
      id: tempId,
      type: "voice",
      sender_id: authUser.id,
      status: "sending",
      local: URL.createObjectURL(blob),
    };

    setMessages(prev => [...prev, tempMessage]);

    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("voice", blob);

    try {
      const res = await api.post("/api/messages/voice", form);

      setMessages(prev =>
        prev.map(m =>
          m.id === tempId ? { ...res.data.message, status: "sent" } : m
        )
      );

      setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);

    } catch {
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? { ...m, status: "failed" } : m))
      );
    }
  };

  const formatTime = (sec) => {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
};
  
  
  return (
    <>
    {!recording && (
    <div className="px w-full bg-white gap-3 flex items-center flex-row">
       
      <div className="inline-flex items-center gap-3">
          <button className="bg-gray-300 rounded-full p-2 hover:bg-gray-400"
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"  
            className="size-5 text-black  cursor-pointer">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>

          </button>
        <label className="cursor-pointer">
          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <div className="bg-gray-300 rounded-full p-2 hover:bg-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
            stroke-width="1.5" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
          </svg>

          </div>
      </label>
    
      </div>
        

   
      <div className="relative w-full ">
       <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 border bg-white shadow text-black relative w-full px-4 rounded-full py-3 relative"
          />
        <button className="absolute top-3 right-3 hover:text-gray-900" onClick={() => setShowEmoji(prev => !prev)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
          class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
          </svg>

        </button>
      </div>
  
      {!recording && text && (
          <button onClick={sendText} className="text-blue-800 hover:text-blue-900 px-3 py-1 rounded">
            
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>

          </button>
        )}
    </div>
    )}
        {showEmoji && (
        <div className="absolute bottom-16">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )} 

      {recording && (
          <div className="flex justify-center mx-auto items-center gap-6 sm:gap-8  bg-gray-100 px-3 py-3 rounded-full">
         <button onClick={cancelRecording}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button> 
          <span className="text-sm font-mono font-bold text-black">
            {formatTime(duration)}
          </span>
            <VoiceWave active={!paused} />

            

            {/* PAUSE / RESUME */}
            {!paused ? (
              <button onClick={pauseRecording}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
              </svg>

              </button>
            ) : (
              <button onClick={resumeRecording}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>

              </button>
            )}

            {/* SEND */}
            <button
              onClick={stopRecording}
              className="text-blue-600 font-bold"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>

            </button>

          </div>
        )}

      {showPreview && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="sm:w-96 w-80 rounded relative">

            {file?.type.startsWith("image/") && (
              <img src={previewUrl} className="w-full" />
            )}

            {file?.type.startsWith("video/") && (
              <video src={previewUrl} controls />
            )}

            {file?.type.startsWith("audio/") && (
              <audio src={previewUrl} controls />
            )}

            {!file?.type.startsWith("image/") &&
              !file?.type.startsWith("video/") &&
              !file?.type.startsWith("audio/") && (
                <p>{file.name}</p>
              )}

            <button onClick={() => setShowPreview(false)} className="absolute -right-10 -top-10 ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                stroke-width="1.5" stroke="currentColor" class="size-6 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>

              </button>

            <div className="flex justify-end mt-3">
              
              <button onClick={() => {sendFile(); setShowPreview(false)}} className="bg-blue-600 text-white p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>

              </button>
            </div>
          </div>

        </div>
      )}

    </>
)
}