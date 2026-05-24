import { useState, useRef } from "react";
import CommunityInput from "./CommunityInput";
import api from "../../Api/axios";

export default function InputComponent({activeCommunity,
  setMessages,
  authUser, replyingToCommunity, setReplyingToCommunity}){

    
  const [files, setFiles={setFiles}] = useState([]);
  const [captionCommunity, setCaptionCommunity] = useState("");
  const [textCommunity, setTextCommunity] = useState("");
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
  

  const bottomRef = useRef(null);
  const fileInputRefCommunity = useRef(null);


  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

 const role =
  activeCommunity?.my_role;

  const status =
    activeCommunity?.membership_status;
  // ✅ OWNER OR ADMIN
  const isAdmin =
    role === "admin" ||
    role === "owner";

  // ✅ COMMUNITY SETTING
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
    (
      status === "approved" &&
      !onlyAdminSend
    );

  // ✅ FINAL BLOCK
  const blockAllInput =

    isPending ||
    isRejected ||
    isRemoved ||
    !canSendMessage;

    console.log({
    role,
    status,
    isAdmin,
    onlyAdminSend,
    canSendMessage,
    blockAllInput,
  });

const stopRecordingCommunity = async () => {

  const reply = replyingToCommunity;

  // ✅ CLEAR UI IMMEDIATELY
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

    // =====================================
    // TEMP MESSAGE
    // =====================================

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

    // =====================================
    // ADD TEMP MESSAGE
    // =====================================

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

      // =====================================
      // FORM DATA
      // =====================================

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

      // ✅ OPTIONAL TEXT
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

      // =====================================
      // API
      // =====================================

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

      // =====================================
      // REPLACE TEMP MESSAGE
      // =====================================

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

  const [message, setMessage] =
    useState("");

    const sendTextCommunity = async () => {

  if (!textCommunity.trim()) return;

  const reply = replyingToCommunity;

  // ✅ CLEAR REPLY UI
  setReplyingToCommunity(null);

  const tempId = Date.now();

  // ✅ TEMP MESSAGE
  const tempMessage = {

    id: tempId,

    message: textCommunity,

    type: "text",

    sender_id: authUser.id,

    status: "sending",

    created_at: new Date().toISOString(),

    replied_to: reply || null,

    sender: authUser,

  };

  // ✅ SHOW IMMEDIATELY
  setMessages(prev => [

    ...prev,
    tempMessage

  ]);

  const originalText = textCommunity;

  // ✅ CLEAR INPUT
  setTextCommunity("");

  // ✅ SCROLL BOTTOM
  requestAnimationFrame(() => {

    bottomRef.current?.scrollIntoView({

      behavior: "smooth",

      block: "end",

    });

  });

  try {

    const { data } =
      await api.post(

      "/api/community/messages/send",

      {

        community_id:
          activeCommunity.id,

        message:
          originalText,

        type: "text",

        replied_to:
          reply
            ? reply.id
            : null,

      }

    );

    // ✅ BACKEND RETURNS ARRAY
    const realMessage =
      data.messages?.[0];

    // ✅ REPLACE TEMP MESSAGE
    setMessages(prev =>

      prev.map(m =>

        m.id === tempId

          ? {

              ...realMessage,

              status: "sent",

              replied_to:
                realMessage?.replied_message
                || reply,

            }

          : m
      )
    );

  } catch (err) {

    console.log(err);

    // ✅ FAILED
    setMessages(prev =>

      prev.map(m =>

        m.id === tempId

          ? {
              ...m,
              status: "failed"
            }

          : m
      )
    );
  }
};


  const sendFileCommunity = async () => {

  if (!files.length) return;

  const reply = replyingToCommunity;

  setReplyingToCommunity(null);

  const tempId = Date.now();

  const getType = (file) => {

    if (file.type.startsWith("image/"))
      return "image";

    if (file.type.startsWith("video/"))
      return "video";

    if (file.type.startsWith("audio/"))
      return "audio";

    return "file";
  };

  const firstType = getType(files[0]);

  const allSameType = files.every(
    (f) => getType(f) === firstType
  );

  if (!allSameType) {

    showToast(
      "You cannot mix images, videos, and documents"
    );

    return;
  }

  const filesWithMeta = await Promise.all(

    files.map(async (file, i) => {

      const type = getType(file);

      let duration = null;

      if (type === "audio") {

        duration =
          await getAudioDuration(file);
      }

      const preview =
        croppedImagesCommunity[i]
          ? URL.createObjectURL(
              croppedImagesCommunity[i]
            )
          : previewUrlsCommunity[i];

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

    message: captionCommunity,

    replied_to: reply || null,

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

  const form = new FormData();

  // ✅ COMMUNITY ID
  form.append(
    "community_id",
    activeCommunity.id
  );

  files.forEach((file, i) => {

    const isImage =
      file.type.startsWith("image/");

    if (isImage && croppedImagesCommunity[i]) {

      form.append(
        "files[]",
        croppedImagesCommunity[i]
      );

    } else {

      form.append(
        "files[]",
        file
      );
    }

    form.append(
      "types[]",
      getType(file)
    );
  });

  form.append(
    "message",
    captionCommunity || ""
  );

  if (reply?.id) {

    form.append(
      "replied_to",
      reply.id
    );
  }

  try {

    const res = await api.post(

      "/api/community/messages",

      form,

      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    const serverMessages =
      res.data.messages || [];

    const normalized =
      serverMessages.map((msg) => ({

        ...msg,

        files: msg.file
          ? [
              {
                file_url:
                  msg.file.startsWith("http")
                    ? msg.file
                    : `http://127.0.0.1:8000/storage/${msg.file}`,

                file_name:
                  msg.file_name,

                type: msg.type,
              },
            ]
          : [],

        replied_to: reply
          ? {
              id: reply.id,

              message:
                reply.message,

              type: reply.type,

              sender:
                reply.sender,
            }
          : msg.replied_to || null,

        status: "sent",
      }));

    setMessages((prev) => {

      const filtered =
        prev.filter(
          (m) => m.id !== tempId
        );

      return [
        ...filtered,
        ...normalized,
      ];
    });

    requestAnimationFrame(() => {

      bottomRef.current?.scrollIntoView({

        behavior: "smooth",

        block: "end",
      });
    });

  } catch (err) {

    console.log(err);

    const message =
      err?.response?.data?.message ||
      "Something went wrong";

    showToast(message);

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

  setShowPreviewCommunity(false);

  setFiles={setFiles}([]);

  setPreviewUrlsCommunity([]);

  setCaptionCommunity("");

  setCroppedImagesCommunity({});

  setCropAppliedMapCommunity(false);

  setCropCommunity({
    x: 0,
    y: 0,
  });

  setSelectedCommunity([]);

  setTrimMapCommunity({});

  setDurationMapCommunity({});

  setTrimAppliedMapCommunity({});

  if (fileInputRefCommunity.current) {

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

        />
    </div>
)
}