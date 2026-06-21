import { useState, useRef } from "react";
import CommunityInput from "./CommunityInput";
import api from "../../Api/axios";

export default function InputComponent({activeCommunity,
  setMessages, textCommunity, setTextCommunity,
  authUser, replyingToCommunity, setReplyingToCommunity, communityMessageAction, bottomRef,
 unreadCount, showScrollButton, setShowScrollButton, communityMessages,
 setLastReadMessageId, myId, setCommunities, latestMessage, messagesCommunityEndRef,}){

    
  const [files, setFiles={setFiles}] = useState([]);
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
  const [toast, setToast] = useState(false)

  const [recordingCommunity, setRecordingCommunity] = useState(false);
  const mediaRecorderRefCommunity={} = useRef(null);
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
    setMessages((prev) => [
      ...prev,
      tempMessage,
    ]);

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
      setMessages((prev) =>

        prev.map((m) =>

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
                  : res.data.message
                      .replied_to || null,

                files:
                  res.data.message
                    .files || [
                    {
                      file_url:
                        res.data
                          .message
                          .file_url ||

                        `http://127.0.0.1:8000/storage/${res.data.message.file}`,

                      type:
                        res.data
                          .message
                          .type,
                    },
                  ],

                local: null,

                sender:
                  res.data.message
                    .sender ||
                  authUser,

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

      // ✅ CLEAR TEXT
      setTextCommunity("");

    } catch (err) {

      console.log(
        err?.response?.data
      );

      setMessages((prev) =>

        prev.map((m) =>

          m.id === tempId
            ? {
                ...m,
                status: "failed",
              }
            : m
        )
      );
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

  setMessages((prev) => [
    ...prev,
    tempMessage,
  ]);

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

    setMessages((prev) =>
      prev.map((m) =>
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
      )
    );

  } catch (err) {

    console.log(err);

    setMessages((prev) =>
      prev.map((m) =>
        m.id === tempId
          ? {
              ...m,
              status: "failed",
            }
          : m
      )
    );
  }
};

const sendFileCommunity = async (
  response_mode = false
) => {
  
 if (!files.length) return;

  // 🚫 Prevent more than 2 files
  if (files.length > 2) {
    toast.error(
      "You can only send a maximum of 2 files at a time."
    );
    return;
  }
  const reply =
    replyingToCommunity;
  setReplyingToCommunity(null);
  const tempId = Date.now();
  const originalFile = files[0];
  const getType = (file) => {
    if (
      file.type.startsWith("image/")
    ) {
      return "image";
    }
    if (
      file.type.startsWith("video/")
    ) {
      return "video";
    }
    if (
      file.type.startsWith("audio/")
    ) {
      return "audio";
    }
    return "file";
  };
  const type =
    getType(originalFile);
  let finalFile = originalFile;
  if (
    type === "image" &&
    croppedImagesCommunity[0]
  ) {
    finalFile =
      croppedImagesCommunity[0];
  }
  const preview =
    URL.createObjectURL(finalFile);
  const tempMessage = {
    id: tempId,
    type,
    sender_id: authUser.id,
    sender: authUser,
    status: "sending",
    message: captionCommunity,
    response_mode,
    created_at:
      new Date().toISOString(),
    replied_to:
      reply || null,
    files: [
      {
        file_url: preview,
        file_name:
          finalFile.name,
        type,
      },
    ],
  };

  requestAnimationFrame(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  });
  
  try {
    const data =
      await communityMessageAction({
        action: "send",
        file: finalFile,
        type,
        message:
          captionCommunity,
        replied_to:
          reply?.id || null,
        response_mode,
        tempMessage,
      });
    const realMessage =
      data.message;
    const normalized = {
      ...realMessage,
      status: "sent",
      files: realMessage.file
        ? [
            {
              file_url:
                realMessage.file.startsWith(
                  "http"
                )
                  ? realMessage.file
                  : `http://127.0.0.1:8000/storage/${realMessage.file}`,
              type:
                realMessage.type,
            },
          ]
        : [],
    };
    setMessages(prev =>
      prev.map(m =>
        m.id === tempId
          ? normalized
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
    setMessages(prev =>
      prev.map(m =>
        m.id === tempId
          ? {
              ...m,
              status: "failed",
            }
          : m
      )
    );
    toast.error(
      err?.response?.data
        ?.message ||
      "Failed to send"
    );
  }
  setShowPreviewCommunity(false);
  setFiles([]);
  setPreviewUrlsCommunity([]);
  setCaptionCommunity("");
  setCroppedImagesCommunity({});
  setCropAppliedMapCommunity(
    false
  );
  setCropCommunity({
    x: 0,
    y: 0,
  });
  setSelectedCommunity([]);
  setTrimMapCommunity({});
  setDurationMapCommunity({});
  setTrimAppliedMapCommunity(
    {}
  );
  if (
    fileInputRefCommunity.current
  ) {
    fileInputRefCommunity.current.value =
      "";
  }
};




return (
    <div>
        <CommunityInput
        activeCommunity={activeCommunity}
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