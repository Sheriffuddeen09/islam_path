import { useState, useEffect, useRef } from "react";
import api from "../../Api/axios";
import ActiveUsers from "./ActiveUsers";
import ChatList from "./ChatList";
import MessageBox from "./MessageBox";
import {
  encryptMessage, decryptMessage
} from "../../utils/encryption";
import { MessageCircle, MessageCircleCodeIcon, User } from "lucide-react";

export default function ChatComponent ({replyingTo, setReplyingTo, chats, setChats, activeChat, setActiveChat,
    setChatFilter, chatFilter, loadingChats, loadingMessages, unreadTotal, authUser, isTyping, setIsTyping,
    chatId, setMobileView, bottomRef, openChat, isLargeScreen, mobileView,
    setMessages, messages, messageRefs, unreadCount, setUnreadCount, lastReadMessageId, setLastReadMessageId,
    messagesCacheRef, isNavigatingRef, setShowSettings, showSettings, uiMode, isMinimized,
    setIsMinimized,  setUiMode, loadingExploring, exploreCommunities, setExploreCommunities, loading, communities, setCommunities,
    openCommunity, setMobileViewCommunity, mobileViewCommunity, lastOpenedCommunity, activeCommunity,
    setActiveCommunity, loadingMessagesCommunity, setLoadingMessagesCommunity, communityMessages, setCommunityMessages,
    messageCommunityRefs, messagesCommunityEndRef, firstUnreadMessageId, unreadDividerRef, communityContainerRef
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

    const [showChannel, setShowChannel] = useState(false);
    

    const [showAvatarPreview, setShowAvatarPreview] = useState(false);
    const isGroup = activeChat?.type === "group";
    const displayName = isGroup
      ? activeChat?.group_name || activeChat?.name || "Unnamed Group"
      : `${activeChat?.other_user?.first_name || ""} ${activeChat?.other_user?.last_name || ""}`;
  
    const avatarName = isGroup
      ? displayName
      : activeChat?.other_user?.first_name;
    
    const colors = [
        "bg-orange-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-purple-500",
        "bg-pink-500"
      ];
    
      const getColor = (name = "") => {
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
      };
    
      const getInitial = (name) => {
        if (!name) return "?";
        return name.charAt(0).toUpperCase();
      }; 

    
  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  const handleSeeAll = () => {
    setUiMode("full");
  };

  const onCloseAll = () => {
    setUiMode("popup");
  };

  const goBack = () => {
  return new Promise((resolve) => {
    if (mobileView === "settings") {
      setMobileView("messages");
    } else {
      setMobileView("chatlist");
    }

    setTimeout(resolve, 250);
  });
};

  
 
      
    const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

    const sendText = async () => {
  if (!text.trim()) return;

  const reply = replyingTo;

  setReplyingTo(null); 

  const tempId = Date.now();

  const tempMessage = {
    id: tempId,
    message: text,
    type: "text",
    sender_id: authUser.id,
    sender: authUser,
    status: "sending",
    created_at: new Date().toISOString(),
    replied_to: reply || null, // ✅ still preserved
  };

  setMessages(prev => [...prev, tempMessage]);

   const originalText = text;

  setText("");

  requestAnimationFrame(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  });

  try {

    // ================= CHAT KEY =================

    const chatKey = localStorage.getItem(
      `chat_key_${chatId}`
    );

    // ================= ENCRYPT =================

    const { encrypted, iv } = await encryptMessage(originalText, chatKey);

    const { data } = await api.post("/api/messages", {
      chat_id: chatId,
      message: encrypted,
      iv: iv,
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

    try {

      // ================= CHAT KEY =================

      const chatKey =
        localStorage.getItem(
          `chat_key_${chatId}`
        );

      // ================= ENCRYPT REPLY =================

      let encryptedReply = null;

      if (reply?.message) {

        encryptedReply =
          await encryptMessage(
            reply.message,
            chatKey
          );
      }


    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("voice", blob, "voice.webm");

    // ✅ USE SAVED REPLY (NOT state)
    if (reply?.id && !isNaN(reply.id)) {
        form.append("replied_to", reply.id);
      }

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


    
    
const originalCaption = caption;    

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

  // ✅ CLEAR UI IMMEDIATELY
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

    if (originalCaption && originalCaption.trim() !== "") {
      const chatKey = localStorage.getItem(`chat_key_${chatId}`);

      if (!chatKey) {
        showToast("Encryption key missing");
        return;
      }

      const encrypted = await encryptMessage(
        originalCaption,
        chatKey
      );

      form.append("message", encrypted.encrypted);
      form.append("iv", encrypted.iv);
    } else {
      form.append("message", "");
      form.append("iv", "");
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

    const chatKey = localStorage.getItem(`chat_key_${chatId}`);

const normalized = await Promise.all(
  serverMessages.map(async (msg) => {

    let decryptedMessage = msg.message;

    // ✅ decrypt immediately
    if (msg.message && msg.iv) {

      try {

        decryptedMessage = await decryptMessage(
          msg.message,
          msg.iv,
          chatKey
        );

      } catch (err) {

        console.log(
          "Immediate decrypt failed",
          err
        );
      }
    }

    return {
      ...msg,

      message: decryptedMessage,

      files: msg.files?.length
        ? msg.files
        : msg.file_url
        ? [
            {
              file_url: msg.file_url,
              file_name: msg.file_name,
              type: msg.type,
              duration: msg.duration,
            },
          ]
        : [],

      is_forwarded: Boolean(msg.is_forwarded),

      replied_to: reply
        ? {
            id: reply.id,
            message: reply.message,
            type: reply.type,
            sender: reply.sender,
          }
        : msg.replied_to || msg.replyTo || null,

      status: "sent",
    };
  })
);

// ✅ NOW update state
setMessages((prev) => {

  const filtered = prev.filter(
    (m) => m.id !== tempId
  );

  return [...filtered, ...normalized];
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
      <>
      

    {/* 🟦 LEFT CHAT LIST 
   
    
    
    */}
    {uiMode === "popup" && !activeChat && (
      <div className="
        fixed z-50 shadow-xl
        right-0 lg:right-10 lg:top-16
        w-full h-full
        lg:w-[340px] lg:h-[400px] lg:rounded-xl
      ">
      <ChatList 
          communityContainerRef={communityContainerRef}
          setExploreCommunities={setExploreCommunities}
          exploreCommunities={exploreCommunities} loading={loading}
          chatCommunitys={chats} loadingExploring={loadingExploring}
          setMobileViewCommunity={setMobileViewCommunity} mobileViewCommunity={mobileViewCommunity}
          lastOpenedCommunity={lastOpenedCommunity} 
          openCommunity={openCommunity} messagesCacheRef={messagesCacheRef}
          chats={chats} authUserId={authUser.id}
          openChat={openChat}
          chatFilter={chatFilter}
          setChatFilter={setChatFilter}
          unreadTotal={unreadTotal}
          activeChat={activeChat}
          setChats={setChats}
          loadingChats={loadingChats}
          messages={messages}
          setUnreadCount={setUnreadCount}
          setActiveChat={setActiveChat}
          setLastReadMessageId={setLastReadMessageId}
          communities={communities}
          setCommunities={setCommunities}
          activeCommunity={activeCommunity}
          setActiveCommunity={setActiveCommunity}
          loadingMessagesCommunity={loadingMessagesCommunity}
          setMessages={setMessages}
          showChannel={showChannel} setShowChannel={setShowChannel}
          setLoadingMessagesCommunity={setLoadingMessagesCommunity} 
          communityMessages={communityMessages} setCommunityMessages={setCommunityMessages}
          messageCommunityRefs={messageCommunityRefs} messagesCommunityEndRef={messagesCommunityEndRef} firstUnreadMessageId={firstUnreadMessageId}
          onSeeAll={handleSeeAll}
          onMinimize={toggleMinimize}
          onToggleSettings={toggleSettings}
          isMinimized={isMinimized}
          setIsMinimized={setIsMinimized}
          setUiMode={setUiMode}
          setShowSettings={setShowSettings} onCloseAll={onCloseAll} uiMode={uiMode}
       />
    </div>
    )}
     {uiMode !== "full" && activeChat && (
      <div
        className={`
          fixed z-50 flex flex-col

          bottom-0 right-0
          w-full h-full rounded-none
          
          lg:bottom-10 lg:right-10 border
          lg:w-[375px] lg:rounded-2xl
          ${isMinimized ? "lg:h-[80px]" : "lg:h-[500px]"}
        `}
      >
      <MessageBox
          showSettings={showSettings}
          onToggleSettings={toggleSettings}
          showChannel={showChannel} 
          openCommunity={openCommunity}
          unreadDividerRef={unreadDividerRef}
          setChats={setChats}
          openChat={openChat}
          messageRefs={messageRefs}
          setLastReadMessageId={setLastReadMessageId}
          activeChat={activeChat}
          messages={messages}
          setMessages={setMessages}
          authUser={authUser}
          loadingMessages={loadingMessages}
          isTyping={isTyping}
          setIsTyping={setIsTyping}
          onBack={goBack}
          chatId={chatId}
          bottomRef={bottomRef}
          setToast={setToast}
          setActiveChat={setActiveChat}
          chats={chats}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
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
          unreadCount={unreadCount} setUnreadCount={setUnreadCount} isLargeScreen={isLargeScreen}
          loadingChats={loadingChats} lastReadMessageId={lastReadMessageId}
          communities={communities} setActiveCommunity={setActiveCommunity}
          setShowChannel={setShowChannel} setCommunityMessages={setCommunityMessages}
          isNavigatingRef={isNavigatingRef} setMobileView={setMobileView} mobileView={mobileView}
          setUiMode={setUiMode} isMinimized={isMinimized}
          setIsMinimized={setIsMinimized} uiMode={uiMode}
        />
       
    </div>


  )}
{uiMode !== "full" && activeChat && showSettings && (
  <div
    className="
      fixed inset-0 z-50   /* ✅ FULL SCREEN on mobile */
      bg-white

      lg:inset-auto        /* reset for desktop */
      lg:right-96 lg:bottom-16
      lg:w-[340px] lg:h-[440px]
      lg:rounded-xl shadow-xl
    "
  >
    <ActiveUsers
      avatarName={avatarName} isGroup={isGroup} displayName={displayName} 
      getColor={getColor} getInitial={getInitial} 
      setShowAvatarPreview={setShowAvatarPreview} 
      chats={chats}
      activeChat={activeChat}
      setActiveChat={setActiveChat}
      setChats={setChats}
      openChat={openChat}
      loadingChats={loadingChats}
      setMessages={setMessages}
      onHeaderClick={() => setShowSettings(false)}
      uiMode={uiMode}
    />
  </div>
)}

  {uiMode === "full" && (
  <div className="flex h-screen w-full overflow-hidden z-50 fixed inset-0 flex flex-row bg-[var(--bg-color)]
  text-[var(--text-color)]">

    <div className="w-[320px] border-r hidden sm:flex flex-col h-full">
     <ChatList 
        communityContainerRef={communityContainerRef}
          setExploreCommunities={setExploreCommunities}
          exploreCommunities={exploreCommunities} loading={loading}
          chatCommunitys={chats} setMobileViewCommunity={setMobileViewCommunity} mobileViewCommunity={mobileViewCommunity}
          lastOpenedCommunity={lastOpenedCommunity} 
          openCommunity={openCommunity} messagesCacheRef={messagesCacheRef}
          chats={chats} authUserId={authUser.id}
          openChat={openChat}
          chatFilter={chatFilter}
          setChatFilter={setChatFilter}
          unreadTotal={unreadTotal}
          activeChat={activeChat}
          setChats={setChats}
          loadingChats={loadingChats}
          messages={messages}
          setUnreadCount={setUnreadCount}
          setActiveChat={setActiveChat}
          setLastReadMessageId={setLastReadMessageId}
          communities={communities}
          setCommunities={setCommunities}
          activeCommunity={activeCommunity}
          setActiveCommunity={setActiveCommunity}
          loadingMessagesCommunity={loadingMessagesCommunity}
          setMessages={setMessages}
          showChannel={showChannel} setShowChannel={setShowChannel}
          setLoadingMessagesCommunity={setLoadingMessagesCommunity} 
          communityMessages={communityMessages} setCommunityMessages={setCommunityMessages}
          messageCommunityRefs={messageCommunityRefs} messagesCommunityEndRef={messagesCommunityEndRef} firstUnreadMessageId={firstUnreadMessageId}
          onSeeAll={handleSeeAll}
          onMinimize={toggleMinimize}
          onToggleSettings={toggleSettings}
          isMinimized={isMinimized}
          setIsMinimized={setIsMinimized}
          setUiMode={setUiMode}
          setShowSettings={setShowSettings}
          uiMode={uiMode} onCloseAll={onCloseAll}
       />
    </div>

    {/* 🟩 MIDDLE: MESSAGE BOX */}
    <div className="flex-1 flex flex-col min-w-0">

      {activeChat ? (
        <MessageBox
            showSettings={showSettings}

          onToggleSettings={toggleSettings}
          showChannel={showChannel} 
          openCommunity={openCommunity}
          unreadDividerRef={unreadDividerRef}
          setChats={setChats}
          openChat={openChat}
          messageRefs={messageRefs}
          setLastReadMessageId={setLastReadMessageId}
          activeChat={activeChat}
          messages={messages}
          setMessages={setMessages}
          authUser={authUser}
          loadingMessages={loadingMessages}
          isTyping={isTyping}
          setIsTyping={setIsTyping}
          onBack={goBack}
          chatId={chatId}
          bottomRef={bottomRef}
          setToast={setToast}
          setActiveChat={setActiveChat}
          chats={chats}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
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
          unreadCount={unreadCount} setUnreadCount={setUnreadCount} isLargeScreen={isLargeScreen}
          loadingChats={loadingChats} lastReadMessageId={lastReadMessageId}
          communities={communities} setActiveCommunity={setActiveCommunity}
          setShowChannel={setShowChannel} setCommunityMessages={setCommunityMessages}
          isNavigatingRef={isNavigatingRef} setMobileView={setMobileView} mobileView={mobileView}
          setIsMinimized={setIsMinimized} isMinimized={isMinimized} uiMode={uiMode}
        />
      ) : (
       <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-sm flex items-center justify-center flex-col">

          <div className="w-28 h-28 rounded-full border-4 border-green-200 flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full border-2 border-gray-400 flex items-center justify-center">
            <MessageCircleCodeIcon size={38} />
          </div>
          </div>

          <h2 className="text-lg font-semibold text-green-500 ">
            No Chat Selected
          </h2>

          <p  className="text-lg font-semibold mb-3">
            Choose a Conversation from the left to Start Chatting.
          </p>
        </div>
      </div>
            )}

    </div>

<div className="w-[350px] border-l hidden lg:flex flex-col">

  {activeChat ? (
    <ActiveUsers
      avatarName={avatarName} isGroup={isGroup} displayName={displayName} 
      getColor={getColor} getInitial={getInitial} 
      setShowAvatarPreview={setShowAvatarPreview} 
      chats={chats}
      activeChat={activeChat}
      setActiveChat={setActiveChat}
      setChats={setChats}
      openChat={openChat}
      loadingChats={loadingChats}
      setMessages={setMessages}
      onHeaderClick={() => setShowSettings(false)}
      uiMode={uiMode}
    />
  ) : (

<div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-sm flex items-center justify-center flex-col">

          <div className="w-28 h-28 rounded-full border-4 border-green-200 flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full border-2 border-gray-400 flex items-center justify-center">
            <User size={38} />
          </div>
          </div>

          <h2 className="text-lg font-semibold text-green-500 ">
            No Profile Selected
          </h2>

          <p  className="text-lg font-semibold mb-3">
            Select a Chat to View User Profile and settings.
          </p>
        </div>
      </div>
  )}

</div>

  </div>
)}

      
{showAvatarPreview && (
  <div
    className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center"
    onClick={() => setShowAvatarPreview(false)}
  >
    <div
      className="relative"
      onClick={(e) => e.stopPropagation()}
    >
      {isGroup && activeChat?.image_url ? (
        <img
          src={activeChat.image_url}
          alt={displayName}
          className="w-72 h-72 sm:w-96 sm:h-96 object-cover rounded-2xl shadow-2xl"
        />
      ) : (
        <div
          className={`w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center 
            text-white text-[180px] font-bold rounded-full ${getColor(
            avatarName
          )}`}
        >
          {getInitial(avatarName)}
        </div>
      )}
    </div>
  </div>
)}
  </>

  );
}