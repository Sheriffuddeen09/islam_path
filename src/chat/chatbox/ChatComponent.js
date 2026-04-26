import { useState, useEffect, useRef } from "react";
import api from "../../Api/axios";
import ActiveUsers from "./ActiveUsers";
import ChatList from "./ChatList";
import MessageBox from "./MessageBox";

export default function ChatComponent ({replyingTo, setReplyingTo, chats, setChats, activeChat, setActiveChat,
    setChatFilter, chatFilter, loadingChats, loadingMessages, unreadTotal, authUser, isTyping, setIsTyping,
    chatId,setShowProfile, showProfile, setShowList, showList, bottomRef, handleScroll,containerRef, openChat,
    setMessages, messages, newMessageCount
}) {

    const [recording, setRecording] = useState(false);
    const [text, setText] = useState("");

    const [files, setFiles] = useState([]);
    const fileInputRef = useRef();
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [paused, setPaused] = useState(false);
    const [caption, setCaption] = useState("");
    
    const [selected, setSelected] = useState([]);
    const [croppedImages, setCroppedImages] = useState({});
    const [cropAppliedMap, setCropAppliedMap] = useState({});
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [zoomMap, setZoomMap] = useState({});
    const [trimMap, setTrimMap] = useState({});
    const [durationMap, setDurationMap] = useState({});
    const [trimAppliedMap, setTrimAppliedMap] = useState({});
    const [toast, setToast] = useState(false)
    const [previewUrls, setPreviewUrls] = useState([]);
    const [showPreview, setShowPreview] = useState(false);

    const timerRef = useRef(null)
    
      
    const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

    const sendText = async () => {
  if (!text.trim()) return;

  const reply = replyingTo; // ✅ keep reference

  setReplyingTo(null); // ✅ CLEAR UI IMMEDIATELY

  const tempId = Date.now();

  const tempMessage = {
    id: tempId,
    message: text,
    type: "text",
    sender_id: authUser.id,
    status: "sending",
    created_at: new Date().toISOString(),
    replied_to: reply || null, // ✅ still preserved
  };

  setMessages(prev => [...prev, tempMessage]);
  setText("");

  requestAnimationFrame(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  });

  try {
    const { data } = await api.post("/api/messages", {
      chat_id: chatId,
      message: text,
      type: "text",
      replied_to: reply ? reply.id : null,
    });

    setMessages(prev =>
      prev.map(m =>
        m.id === tempId
          ? {
              ...m,
              ...data,
              replied_to: data.replied_message || reply,
              status: "sent",
            }
          : m
      )
    );

  } catch (err) {
    setMessages(prev =>
      prev.map(m =>
        m.id === tempId ? { ...m, status: "failed" } : m
      )
    );
  }
};
      
    const stopRecording = async () => {
  const reply = replyingTo; // ✅ SAVE FIRST
  setReplyingTo(null);      // ✅ CLEAR UI IMMEDIATELY

  const recorder = mediaRecorderRef.current;
  if (!recorder) return;

  clearInterval(timerRef.current);
  setPaused(false);
  setRecording(false);

  recorder.stop();

  recorder.onstop = async () => {
    const blob = new Blob(audioChunksRef.current, {
      type: "audio/webm",
    });

    if (!blob || blob.size === 0) {
      console.error("Empty audio blob");
      return;
    }

    const tempId = Date.now();
    const localUrl = URL.createObjectURL(blob);

    const tempMessage = {
      id: tempId,
      type: "voice",
      sender_id: authUser.id,
      sender: authUser,
      status: "sending",
      local: localUrl,

      // ✅ KEEP REPLY IN UI
      replied_to: reply || null,

      files: [
        {
          file_url: localUrl,
          type: "voice",
        },
      ],

      localBlob: blob,
      created_at: new Date().toISOString(),
    };

    // 1. ADD MESSAGE
    setMessages((prev) => [...prev, tempMessage]);

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    });

    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("voice", blob, "voice.webm");

    // ✅ USE SAVED REPLY (NOT state)
    if (reply?.id && !isNaN(reply.id)) {
        form.append("replied_to", reply.id);
      }

    try {
      const res = await api.post("/api/messages/voice", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // 3. REPLACE TEMP MESSAGE
      setMessages((prev) =>
  prev.map((m) =>
    m.id === tempId
      ? {
          ...res.data.message,

          // ✅ ALWAYS KEEP FRONTEND REPLY FIRST
          replied_to: reply
            ? {
                ...reply,
                sender: reply.sender || reply.sender_data || reply.sender
              }
            : res.data.message.replied_message || null,

          files: res.data.message.files || [
            {
              file_url:
                res.data.message.file_url ||
                res.data.message.file,
              type: res.data.message.type,
            },
          ],

          local: null,
          sender: res.data.message.sender || authUser,
          status: "sent",
        }
      : m
  )
);
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      });

    } catch (err) {
      console.log(err?.response?.data);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, status: "failed" } : m
        )
      );
    }
  };

  recorder.stream.getTracks().forEach((t) => t.stop());
};


    
    const getAudioDuration = (file) => {
      return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const audio = new Audio(url);
    
        audio.onloadedmetadata = () => {
          const duration = audio.duration || 0;
          URL.revokeObjectURL(url);
          resolve(duration);
        };
    
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(0);
        };
      });
    };
    
    

    const sendFile = async () => {
  if (!files.length) return;

  const reply = replyingTo; // ✅ SAVE FIRST
  setReplyingTo(null);      // ✅ CLEAR UI IMMEDIATELY

  const tempId = Date.now();

  const getType = (file) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    return "file";
  };

  const firstType = getType(files[0]);
  const allSameType = files.every((f) => getType(f) === firstType);

  if (!allSameType) {
    showToast("You cannot mix images, videos, and documents");
    return;
  }

  const filesWithMeta = await Promise.all(
    files.map(async (file, i) => {
      const type = getType(file);

      let duration = null;

      if (type === "audio") {
        duration = await getAudioDuration(file);
      }

      const preview =
        croppedImages[i]
          ? URL.createObjectURL(croppedImages[i])
          : previewUrls[i];

      return {
        file: preview,
        file_url: preview,
        file_name: file.name,
        type,
        duration,
      };
    })
  );

  const tempMessage = {
    id: tempId,
    type: firstType,
    sender_id: authUser.id,
    sender: authUser,
    status: "sending",
    files: filesWithMeta,
    originalFiles: files,
    message: caption,

    // ✅ show reply instantly in UI
    replied_to: reply || null,

    created_at: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, tempMessage]);

  requestAnimationFrame(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  });

  const form = new FormData();
  form.append("chat_id", chatId);

  files.forEach((file, i) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (isImage && croppedImages[i]) {
      form.append("files[]", croppedImages[i]);
    } else {
      form.append("files[]", file);
    }

    if (isVideo) {
      const trim = trimMap[i] || { start: 0, end: 0 };
      form.append("trim_start[]", trim.start);
      form.append("trim_end[]", trim.end);
    } else {
      form.append("trim_start[]", 0);
      form.append("trim_end[]", 0);
    }

    form.append("types[]", getType(file));
  });

  if (caption.trim()) {
    form.append("message", caption);
  }

  // ✅ USE SAFE REPLY
  if (reply?.id && !isNaN(reply.id)) {
    form.append("replied_to", reply.id);
  }

  try {
    const res = await api.post("/api/messages", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const serverMessages = res.data.messages;

    let server = serverMessages[0];

    let grouped;

    if (serverMessages.length === 1 && serverMessages[0].files) {
      grouped = {
        ...serverMessages[0],
        status: "sent",
      };
    } else {
      grouped = {
        ...serverMessages[0],
        group_id: serverMessages[0].group_id,
        files: serverMessages.map((m) => ({
          file: m.file_url,
          file_url: m.file_url,
          file_name: m.file_name,
          type: m.type,
          duration: m.duration,
        })),
        status: "sent",
      };
    }

    setMessages((prev) => {
  const filtered = prev.filter((m) => m.id !== tempId);

  const server = serverMessages[0];

  const fixedMessage = {
    ...server,
    files: serverMessages.map((m) => ({
      file: m.file_url,
      file_url: m.file_url,
      file_name: m.file_name,
      type: m.type,
      duration: m.duration,
    })),

    status: "sent",

    replied_to: reply
      ? {
          id: reply.id,
          message: reply.message,
          type: reply.type,
          sender: reply.sender, // 👈 keeps correct name
        }
      : server.replied_message || server.replied_to || null,
  };

  return [...filtered, fixedMessage];
});

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });

  } catch (err) {
    console.error(err);

    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong";

    showToast(message);

    setMessages((prev) =>
      prev.map((m) =>
        m.id === tempId ? { ...m, status: "failed" } : m
      )
    );
  }

  // reset UI
  setShowPreview(false);
  setFiles([]);
  setPreviewUrls([]);
  setCaption("");
  setCroppedImages({});
  setCropAppliedMap(false);
  setCrop({ x: 0, y: 0 });
  setZoomMap({});
  setCroppedAreaPixels(null);
  setSelected([]);
  setTrimMap({});
  setDurationMap({});
  setTrimAppliedMap({});

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
    
    

    return (
    <div className="h-screen flex bg-gray-900 ">
      <div className={`
        border-r bg-white pt-3
        w-full lg:w-80
        ${showList ? "block" : "hidden lg:block"}
      `}>
        <ChatList
          chats={chats}
          openChat={openChat}
          chatFilter={chatFilter}
          setChatFilter={setChatFilter}
          unreadTotal={unreadTotal}
          activeChat={activeChat}
          setChats={setChats}
          loadingChats={loadingChats}
        />
      </div>
      <div className={`
        flex-1 flex flex-col
        ${showList ? "hidden lg:flex" : "flex"}
      `}>
        <MessageBox
          activeChat={activeChat}
          messages={messages}
          setMessages={setMessages}
          authUser={authUser}
          loadingMessages={loadingMessages}
          isTyping={isTyping}
          setIsTyping={setIsTyping}
          onHeaderClick={() => setShowProfile(true)}
          onBack={() => setShowList(true)}
          chatId={chatId}
          bottomRef={bottomRef}
          setToast={setToast}
          setActiveChat={setActiveChat}
          chats={chats}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          containerRef={containerRef}
          handleScroll={handleScroll} newMessageCount={newMessageCount}
          paused={paused} trimMap={trimMap} trimAppliedMap={trimAppliedMap} stopRecording={stopRecording} 
          sendText={sendText} sendFile={sendFile} zoomMap={zoomMap} setTrimAppliedMap={setTrimAppliedMap} 
          setTrimMap={setTrimMap} recording={recording} setDurationMap={setDurationMap} setShowPreview={setShowPreview}
          durationMap={durationMap} setZoomMap={setZoomMap} selected={selected} cropAppliedMap={cropAppliedMap} 
          croppedAreaPixels={croppedAreaPixels} setCrop={setCrop} crop={crop} setCropAppliedMap={setCropAppliedMap}
          setCroppedImages={setCroppedImages} croppedImages={croppedImages} setCroppedAreaPixels={setCroppedAreaPixels}
          setCaption={setCaption} caption={caption} previewUrls={previewUrls} files={files} showPreview={showPreview}
          text={text} setText={setText} fileInputRef={fileInputRef} toast={toast} setPreviewUrls={setPreviewUrls} 
          setSelected={setSelected} setFiles={setFiles} timerRef={timerRef} setRecording={setRecording} 
          audioChunksRef={audioChunksRef} mediaRecorderRef={mediaRecorderRef} setPaused={setPaused} 
        />
      </div>
      <div className="hidden lg:block lg:w-80 border-l bg-white">
        <ActiveUsers
          chats={chats}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          setChats={setChats}
          openChat={openChat}
          loadingChats={loadingChats}
          setMessages={setMessages}
          onBack={() => setShowProfile(false)}
        />
      </div>
      {showProfile && activeChat && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <ActiveUsers
          chats={chats}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          setChats={setChats}
          openChat={openChat}
          loadingChats={loadingChats}
          setMessages={setMessages}
          onBack={() => setShowProfile(false)}
        />
        </div>
      )}
    </div>
  );
}