import { useState, useRef } from "react";
import CommunityInput from "./CommunityInput";
import api from "../../Api/axios";
import toast from "react-hot-toast";

export default function InputComponent({activeCommunity,
  setMessages, textCommunity, setTextCommunity,
  authUser, replyingToCommunity, setReplyingToCommunity, communityMessageAction, bottomRef,
 unreadCount, showScrollButton, setShowScrollButton, communityMessages, loadingMessages,
 setLastReadMessageId, myId, setCommunities, latestMessage, messagesCommunityEndRef, communityMessagesCache}){

    
  const [files, setFiles ] = useState([]);
  const [captionCommunity, setCaptionCommunity] = useState("");
  const [previewUrlsCommunity, setPreviewUrlsCommunity] = useState([]);
  const [croppedImagesCommunity, setCroppedImagesCommunity] = useState({});
  const [showPreviewCommunity, setShowPreviewCommunity] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState([]);
  const [cropAppliedMapCommunity, setCropAppliedMapCommunity] = useState({});
  const [cropCommunity, setCropCommunity] = useState({ x: 0, y: 0 });
  const [trimMapCommunity, setTrimMapCommunity] = useState({});
  const [durationMapCommunity, setDurationMapCommunity] = useState({});
  const [trimAppliedMapCommunity, setTrimAppliedMapCommunity] = useState({}); 

  const [recordingCommunity, setRecordingCommunity] = useState(false);
  const mediaRecorderRefCommunity = useRef(null);
  const audioChunksRefCommunity = useRef([]);
  const [paused, setPaused] = useState(false);

  const timerRefCommunity = useRef(null)

  const [showEmojiCommunity, setShowEmojiCommunity] = useState(false);
  const holdTimeoutCommunity = useRef(null);
  const [duration, setDuration] = useState(0);
  const [showMenuCommunity, setShowMenuCommunity] = useState(false);
  const [showConfirmCommunity, setShowConfirmCommunity] = useState(false);
  const [fileTypeCommunity, setFileTypeCommunity] = useState(null);
  const [selectedTypeCommunity, setSelectedTypeCommunity] = useState(null);
  const [dragTypeCommunity, setDragTypeCommunity] = useState(null); // "left" | "right" | "move"

  const pausedRefCommunity = useRef(false);
  const textareaRefCommunity = useRef(null);
  

  const fileInputRefCommunity = useRef(null);


  const status =
    activeCommunity?.membership_status;

    const isAdmin =
  activeCommunity?.creator_id === authUser.id ||
  activeCommunity?.owner_id === authUser.id;


  const onlyAdminSend =
    Boolean(
      activeCommunity?.only_admin_can_message
    );


  const isPending =
    status === "pending";

  const isRejected =
    status === "rejected";

  // ✅ ONLY NORMAL MEMBERS CAN BE REMOVED
  const isRemoved =
    !isAdmin && !status;

  // ✅ SEND LOGIC
  const canSendMessage =
  isAdmin ||
  (status === "approved" && !onlyAdminSend);

  // ✅ FINAL BLOCK
  const blockAllInput =
  isPending === true ||
  isRejected === true ||
  isRemoved === true ||
  (status && !canSendMessage);

    
const stopRecordingCommunity = async () => {

  const reply = replyingToCommunity;
  setReplyingToCommunity(null);

  const recorder =
    mediaRecorderRefCommunity={}.current;

  if (!recorder) return;

  clearInterval(timerRefCommunity.current);

  setPaused(false);

  setRecordingCommunity(false);

  recorder.stop();

  recorder.onstop = async () => {

    const blob = new Blob(
      audioChunksRefCommunity.current,
      {
        type: "audio/webm",
      }
    );

    if (!blob || blob.size === 0) {

      console.error(
        "Empty audio blob"
      );

      return;
    }

    const tempId = Date.now();

    const localUrl =
      URL.createObjectURL(blob);
    const tempMessage = {

      id: tempId,

      type: "voice",

      sender_id: authUser.id,

      sender: authUser,

      status: "sending",

      local: localUrl,

      replied_to:
        reply || null,

      files: [
        {
          file_url: localUrl,
          type: "voice",
        },
      ],

      localBlob: blob,

      created_at:
        new Date().toISOString(),
    };
    setMessages((prev) => {

    const updated = [
        ...prev,
        tempMessage,
    ];

    communityMessagesCache.current[
        activeCommunity.id
    ] = updated;

    return updated;

});

    requestAnimationFrame(() => {

      bottomRef.current?.scrollIntoView({
        behavior: "auto",
        block: "end",
      });

    });

    try {
      const form =
        new FormData();

      form.append(
        "community_id",
        activeCommunity.id
      );

      form.append(
        "voice",
        blob,
        "voice.webm"
      );
      if (
        textCommunity &&
        textCommunity.trim() !== ""
      ) {

        form.append(
          "message",
          textCommunity
        );
      }

      // ✅ REPLY
      if (
        reply?.id &&
        !isNaN(reply.id)
      ) {

        form.append(
          "replied_to",
          reply.id
        );
      }
      const res =
        await api.post(
          "/api/community/voice",
          form,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
     setMessages((prev) => {

    const updated = prev.map((m) =>
        m.id === tempId
            ? {
                ...res.data.message,
                replied_to: reply
                    ? {
                        ...reply,
                        sender:
                            reply.sender ||
                            reply.sender_data,
                    }
                    : res.data.message.replied_to || null,

                files:
                    res.data.message.files || [
                        {
                            file_url:
                                res.data.message.file_url ||
                                `http://127.0.0.1:8000/storage/${res.data.message.file}`,
                            type:
                                res.data.message.type,
                        },
                    ],

                local: null,

                sender:
                    res.data.message.sender ||
                    authUser,

                status: "sent",
            }
            : m
    );

    communityMessagesCache.current[
        activeCommunity.id
    ] = updated;

    return updated;

});

  requestAnimationFrame(() => {

        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });

      });

      // ✅ CLEAR TEXT
      setTextCommunity("");

    } catch (err) {

      console.log(
        err?.response?.data
      );

      setMessages((prev) => {

    const updated = prev.map((m) =>
        m.id === tempId
            ? {
                ...m,
                status: "failed",
            }
            : m
    );

    communityMessagesCache.current[
        activeCommunity.id
    ] = updated;

    return updated;

});
    }
  };

  recorder.stream
    .getTracks()
    .forEach((t) => t.stop());
};

  
const [showSendOptions, setShowSendOptions] =
  useState(false);

const sendTextCommunity = async ({
  response_mode = false,
} = {}) => {

  if (!textCommunity.trim()) return;

  const reply = replyingToCommunity;

  setReplyingToCommunity(null);

  const tempId = Date.now();

  const tempMessage = {
    id: tempId,
    message: textCommunity,
    type: "text",
    sender_id: authUser.id,
    sender: authUser,
    status: "sending",
    created_at: new Date().toISOString(),
    replied_to: reply || null,
    response_mode,
  };

  setMessages((prev) => {

    const updated = [
        ...prev,
        tempMessage,
    ];

    communityMessagesCache.current[
        activeCommunity.id
    ] = updated;

    return updated;

});

  const originalText = textCommunity;

  setTextCommunity("");


  requestAnimationFrame(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  });

  setShowSendOptions(false);

  requestAnimationFrame(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  });

  try {

    const { data } = await api.post(
      "/api/community/messages/send",
      {
        action: "send",

        community_id:
          activeCommunity.id,

        message: originalText,

        type: "text",

        replied_to:
          reply ? reply.id : null,

        response_mode,
      }
    );

    // ✅ FIX
    const realMessage = data.message;

    setMessages((prev) => {

    const updated = prev.map((m) =>
        m.id === tempId
            ? {
                  ...realMessage,
                  status: "sent",
                  replied_to:
                      realMessage?.replied_message ||
                      reply ||
                      null,
              }
            : m
    );

    communityMessagesCache.current[
        activeCommunity.id
    ] = updated;

    return updated;

});

  } catch (err) {

    console.log(err);

    setMessages((prev) => {

    const updated = prev.map((m) =>
        m.id === tempId
            ? {
                  ...m,
                  status: "failed",
              }
            : m
    );

    communityMessagesCache.current[
        activeCommunity.id
    ] = updated;

    return updated;

});

  }
};
const updateCommunityMessages = (updater) => {
  setMessages((prev) => {
    const updated = updater(prev);

    if (activeCommunity?.id) {
      communityMessagesCache.current[activeCommunity.id] = updated;
    }

    return updated;
  });
};

const normalizeCommunityMessage = (message) => {
  if (!message) return null;

  const normalized = {
    ...message,
    status: "sent",
  };

  // Server returns `file`
  if (message.file) {
    normalized.files = [
      {
        file_url: message.file.startsWith("http")
          ? message.file
          : `http://127.0.0.1:8000/storage/${message.file}`,
        type: message.type,
        file_name: message.file_name,
      },
    ];
  }

  // If server already returned files, preserve them
  if (
    !message.file &&
    Array.isArray(message.files)
  ) {
    normalized.files = message.files;
  }

  return normalized;
};

const sendFileCommunity = async (
  selectedFiles = [],
  response_mode = false
) => {
  if (!selectedFiles.length) return;

  if (selectedFiles.length > 1) {
    toast.error(
      "You can only send one image, video or file at a time."
    );
    return;
  }

  if (!activeCommunity?.id || !authUser?.id) {
    toast.error("Community is not available.");
    return;
  }

  const originalFile = selectedFiles[0];

  const reply = replyingToCommunity;

  setReplyingToCommunity(null);

  // --------------------------------------------------
  // TEMP ID
  // --------------------------------------------------

  const tempId =
    `temp-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;

  // --------------------------------------------------
  // FILE TYPE
  // --------------------------------------------------

  const getType = (file) => {
    if (file?.type?.startsWith("image/")) {
      return "image";
    }

    if (file?.type?.startsWith("video/")) {
      return "video";
    }

    if (file?.type?.startsWith("audio/")) {
      return "audio";
    }

    return "file";
  };

  const type = getType(originalFile);

  // --------------------------------------------------
  // FINAL FILE
  // --------------------------------------------------

  let finalFile = originalFile;

  if (
    type === "image" &&
    croppedImagesCommunity?.[0]
  ) {
    finalFile = croppedImagesCommunity[0];
  }

  // --------------------------------------------------
  // LOCAL PREVIEW
  // --------------------------------------------------

  const preview = URL.createObjectURL(finalFile);

  // --------------------------------------------------
  // OPTIMISTIC MESSAGE
  // --------------------------------------------------

  const tempMessage = {
    id: tempId,
    temp_id: tempId,

    type,

    sender_id: authUser.id,
    sender: authUser,

    status: "sending",

    message: captionCommunity || "",

    response_mode,

    created_at: new Date().toISOString(),

    replied_to: reply || null,

    files: [
      {
        file_url: preview,
        file_name: finalFile.name,
        type,
      },
    ],
  };

  // --------------------------------------------------
  // ADD ONLY ONE OPTIMISTIC MESSAGE
  // --------------------------------------------------

  updateCommunityMessages((prev) => {
    if (
      prev.some(
        (m) => String(m.temp_id) === String(tempId)
      )
    ) {
      return prev;
    }

    return [...prev, tempMessage];
  });

  requestAnimationFrame(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  });

  try {
    // ------------------------------------------------
    // SEND
    // ------------------------------------------------

    const data = await communityMessageAction({
      action: "send",

      file: finalFile,

      type,

      message: captionCommunity,

      replied_to: reply?.id || null,

      response_mode,

      temp_id: tempId,
    });

    const realMessage = data?.message;

    if (!realMessage?.id) {
      throw new Error(
        "The server did not return the sent message."
      );
    }

    // ------------------------------------------------
    // NORMALIZE
    // ------------------------------------------------

    const normalized =
      normalizeCommunityMessage(realMessage);

    // Preserve temp_id if backend did not return it
    normalized.temp_id =
      realMessage.temp_id || tempId;

    normalized.status = "sent";

    // ------------------------------------------------
    // REPLACE TEMP
    // ------------------------------------------------

    updateCommunityMessages((prev) => {
      const withoutDuplicates = prev.filter((m) => {
        const isTemp =
          String(m.id) === String(tempId) ||
          String(m.temp_id) === String(tempId);

        const isReal =
          String(m.id) === String(realMessage.id);

        return !isTemp && !isReal;
      });

      return [
        ...withoutDuplicates,
        normalized,
      ];
    });

    URL.revokeObjectURL(preview);

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });

  } catch (err) {
    // ------------------------------------------------
    // FAILED
    // ------------------------------------------------

    updateCommunityMessages((prev) =>
      prev.map((m) =>
        String(m.id) === String(tempId)
          ? {
              ...m,
              status: "failed",
            }
          : m
      )
    );

    toast.error(
      err?.response?.data?.message ||
      err?.message ||
      "Failed to send"
    );
  }

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  setShowPreviewCommunity(false);

  setFiles([]);

  setPreviewUrlsCommunity([]);

  setCaptionCommunity("");

  setCroppedImagesCommunity({});

  setCropAppliedMapCommunity({});

  setCropCommunity({
    x: 0,
    y: 0,
  });

  setSelectedCommunity([]);

  setTrimMapCommunity({});

  setDurationMapCommunity({});

  setTrimAppliedMapCommunity({});

  if (fileInputRefCommunity.current) {
    fileInputRefCommunity.current.value = "";
  }
};

return (
    <div>
        <CommunityInput
        activeCommunity={activeCommunity} loadingMessages={loadingMessages}
        setMessages={setMessages}
        authUser={authUser}
        sendFileCommunity={sendFileCommunity}
        stopRecordingCommunity={stopRecordingCommunity}
        sendTextCommunity={sendTextCommunity}
        showEmojiCommunity={showEmojiCommunity} setShowEmojiCommunity={setShowEmojiCommunity}
        holdTimeoutCommunity={holdTimeoutCommunity}
        duration={duration} setDuration={setDuration}
        showMenuCommunity={showMenuCommunity} setShowMenuCommunity={setShowMenuCommunity}
        showConfirmCommunity={showConfirmCommunity} setShowConfirmCommunity={setShowConfirmCommunity}
        fileTypeCommunity={fileTypeCommunity} setFileTypeCommunity={setFileTypeCommunity}
        selectedTypeCommunity={selectedTypeCommunity} setSelectedTypeCommunity={setSelectedTypeCommunity}
        dragTypeCommunity={dragTypeCommunity} setDragTypeCommunity={setDragTypeCommunity} 
        pausedRefCommunity={pausedRefCommunity}
        textareaRefCommunity={textareaRefCommunity} 
        paused={paused} setPaused={setPaused}
        showPreviewCommunity={showPreviewCommunity} setShowPreviewCommunity={setShowPreviewCommunity}
        selectedCommunity={selectedCommunity} setSelectedCommunity={setSelectedCommunity}
        cropAppliedMapCommunity={cropAppliedMapCommunity} setCropAppliedMapCommunity={setCropAppliedMapCommunity}
        cropCommunity={cropCommunity} setCropCommunity={setCropCommunity}
        trimMapCommunity={trimMapCommunity} setTrimMapCommunity={setTrimMapCommunity}
        durationMapCommunity={durationMapCommunity} setDurationMapCommunity={setDurationMapCommunity}
        trimAppliedMapCommunity={trimAppliedMapCommunity} setTrimAppliedMapCommunity={setTrimAppliedMapCommunity}
        recordingCommunity={recordingCommunity} setRecordingCommunity={setRecordingCommunity}
        setFiles={setFiles} files={files} previewUrlsCommunity={previewUrlsCommunity}
        setPreviewUrlsCommunity={setPreviewUrlsCommunity} captionCommunity={captionCommunity} 
        setCaptionCommunity={setCaptionCommunity} fileInputRefCommunity={fileInputRefCommunity}
        replyingToCommunity={replyingToCommunity}  blockAllInput={blockAllInput} status={status}
        textCommunity={textCommunity} setTextCommunity={setTextCommunity} onlyAdminSend={onlyAdminSend} 
        isAdmin={isAdmin} setReplyingToCommunity={setReplyingToCommunity} timerRefCommunity={timerRefCommunity}
        audioChunksRefCommunity={audioChunksRefCommunity} mediaRecorderRefCommunity={mediaRecorderRefCommunity}
        croppedImagesCommunity={croppedImagesCommunity} setCroppedImagesCommunity={setCroppedImagesCommunity}
        showSendOptions={showSendOptions} setShowSendOptions={setShowSendOptions}
        unreadCount={unreadCount} showScrollButton={showScrollButton} setShowScrollButton={setShowScrollButton}
        communityMessages={communityMessages} setLastReadMessageId={setLastReadMessageId} myId={myId} 
        setCommunities={setCommunities} latestMessage={latestMessage} messagesCommunityEndRef={messagesCommunityEndRef}
        />
    </div>
)
}