import { useEffect, useRef } from "react";
import VoiceWave from "../chatbox/VoiceWave";
import EmojiPicker from "emoji-picker-react";
import MediaCommunityPreviewModal from "./MediaCommunityPreviewModal";
import AttachmentMenuCommunity from "./AttachmentMenuCommunity";
import api from "../../Api/axios";


export default function CommunityInput({

        activeCommunity, authUser,sendFileCommunity, files, fileInputRefCommunity,
        stopRecordingCommunity, sendTextCommunity, showEmojiCommunity,setShowEmojiCommunity,
        holdTimeoutCommunity,duration, setDuration, showMenuCommunity, setShowMenuCommunity,
        setShowConfirmCommunity, fileTypeCommunity, setFileTypeCommunity,
        setSelectedTypeCommunity, dragTypeCommunity, setDragTypeCommunity,
        pausedRefCommunity, textareaRefCommunity, paused, setPaused, showPreviewCommunity,
        setShowPreviewCommunity, selectedCommunity,setSelectedCommunity, cropAppliedMapCommunity,
        setCropAppliedMapCommunity, cropCommunity, setCropCommunity, trimMapCommunity,setTrimMapCommunity,
        durationMapCommunity, setDurationMapCommunity, trimAppliedMapCommunity, setTrimAppliedMapCommunity,
        recordingCommunity, setRecordingCommunity, setFiles, previewUrlsCommunity, status,
        setPreviewUrlsCommunity, captionCommunity, setCaptionCommunity, replyingToCommunity, blockAllInput,
        textCommunity, setTextCommunity, unreadCount, showScrollButton, setShowScrollButton, communityMessages,
        setLastReadMessageId, myId, setCommunities, latestMessage, messagesCommunityEndRef,
        setReplyingToCommunity, timerRefCommunity, loadingMessages,
        audioChunksRefCommunity, mediaRecorderRefCommunity, croppedImagesCommunity, setCroppedImagesCommunity,
        showSendOptions, setShowSendOptions}) {


        


    const handleFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files);

  const urls = selectedFiles.map((file) =>
    URL.createObjectURL(file)
  );

  setFiles(selectedFiles);
  setSelectedCommunity(selectedFiles.map(() => true));
  setPreviewUrlsCommunity(urls);

  const firstType = selectedFiles[0]?.type;

  if (!firstType) return;

  if (
    firstType.startsWith("image/") ||
    firstType.startsWith("video/")
  ) {
    setShowPreviewCommunity(true);
  } else {
    setShowConfirmCommunity(true);
  }
};


const getPreviewText = (msg) => {
  if (!msg) return "";

  if (msg.type === "text") return msg.message;

  const files = msg.files || [];

  if (files.length === 0) return msg.type;

  if (files.length === 1) {
    return `📎 ${files[0].file_name || "file"}`;
  }

  return `📎 ${files.length} files`;
};


 useEffect(() => {
    if (replyingToCommunity && textareaRefCommunity.current) {
      textareaRefCommunity.current.focus();
    }
  }, [replyingToCommunity]);

  const startTimer = () => {
  clearInterval(timerRefCommunity.current);

  timerRefCommunity.current = setInterval(() => {
    if (pausedRefCommunity.current) return; // ✅ THIS STOPS THE BUG
    setDuration((d) => d + 1);
  }, 1000);
};

 const pauseRecording = () => {
  const recorder = mediaRecorderRefCommunity.current;

  if (!recorder || recorder.state !== "recordingCommunity") return;

  recorder.pause();

  pausedRefCommunity.current = true; // ✅ BLOCK TIMER

  clearInterval(timerRefCommunity.current);
  timerRefCommunity.current = null;

  setPaused(true);
};


const resumeRecording = () => {
  const recorder = mediaRecorderRefCommunity.current;

  if (!recorder || recorder.state !== "paused") return;

  recorder.resume();

  pausedRefCommunity.current = false; // ✅ allow timer again

  startTimer(); // ✅ clean restart

  setPaused(false);
};



  // ================= EMOJI
  const onEmojiClick = (emojiData) => {
    setTextCommunity(prev => prev + emojiData.emoji);
  };

  const handleHoldStart = () => {
  holdTimeoutCommunity.current = setTimeout(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRefCommunity.current = recorder;
    audioChunksRefCommunity.current = [];
    setDuration(0);
    pausedRefCommunity.current = false; // ✅ reset pause state
    recorder.ondataavailable = (e) => {
      audioChunksRefCommunity.current.push(e.data);
    };
    recorder.start();
    setRecordingCommunity(true);
    startTimer(); // ✅ use helper
  }, 200);
};

  const handleHoldEnd = () => {
    clearTimeout(holdTimeoutCommunity.current);
    if (!recordingCommunity) return;
    stopRecordingCommunity();
  };

  const cancelRecording = () => {
    if (mediaRecorderRefCommunity.current) {
      mediaRecorderRefCommunity.current.stream.getTracks().forEach(t => t.stop());
    }

    mediaRecorderRefCommunity.current = null;
    audioChunksRefCommunity.current = [];

    setRecordingCommunity(false)
    setDuration(0);
    clearInterval(timerRefCommunity.current);
  };

  const formatTime = (sec) => {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
};




const handlePick = (type) => {
  if (!fileInputRefCommunity.current) return;

  let accept = "";

  setSelectedTypeCommunity(type); // 👈 SAVE TYPE

  if (type === "image") accept = "image/*";
  else if (type === "video") accept = "video/*";
  else if (type === "audio") accept = "audio/*";
  else if (type === "document")
    accept = ".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.zip,.rar";

  setFileTypeCommunity(accept);

  setTimeout(() => {
    fileInputRefCommunity.current.accept = accept;
    fileInputRefCommunity.current.click();
  }, 0);
};


  return (
      <div className="relative">

      
          {
          showScrollButton && !loadingMessages && (

            <div
              onClick={async () => {

                messagesCommunityEndRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "end",
                });

                setShowScrollButton(false);

                const latestMessage =
                  communityMessages[
                    communityMessages.length - 1
                  ];

                if (latestMessage) {

                  setLastReadMessageId(
                    latestMessage.id
                  );
                }

                setCommunities(prev =>
                  prev.map(c =>
                    c.id === activeCommunity?.id
                      ? {
                          ...c,
                          unread_count: 0,
                        }
                      : c
                  )
                );

                try {

                  await api.post(
                    `/api/communities/${activeCommunity.id}/mark-read`
                  );

                } catch (err) {

                  console.error(
                    "Failed to mark read",
                    err
                  );
                }

              }}
              className={`
              absolute rounded-full inline-flex
              rounded-full p-1
              items-center
              z-50 bg-blue-800
              cursor-pointer
              text-white
            ${blockAllInput ? 'bottom-6 right-2 ' : "bottom-20 -translate-y- right-3 "}`}
            >

              {
                unreadCount > 0 &&
                latestMessage?.sender_id !== myId && (

                  <span className="text-[10px] font-semibold">

                    {unreadCount}

                  </span>
                )
              }

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
                />
              </svg>

            </div>
          )
        }
  
    {!blockAllInput && !loadingMessages && (
      <>
  
     {replyingToCommunity && (
    <div className="bg-black/90 py-2 px-4 rounded mb-2 z-50 flex justify-between border-l-4 border-blue-600 items-center">
      
      <div className="text-xs overflow-hidden">
        <p className="text-white text-sm mb-1 font-semibold">
          Replying to{" "}
          {replyingToCommunity.sender_id === authUser.id
            ? "You"
            : replyingToCommunity?.sender?.first_name || "User"}
        </p>
  
        <p className="truncate opacity-80 text-white">
          {getPreviewText(replyingToCommunity)}
        </p>
      </div>
  
      <button
        onClick={() => setReplyingToCommunity(null)}
        className="text-white text-xs ml-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class=" text-white text-black text-xs px-2 py-2 font-bold rounded-full transition 
              size-10 cursor-pointer">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              
      </button>
    </div>
  )}
      {!recordingCommunity && (
      <div className="px w-full bg-[var(--bg-color)]  sm:gap-3 gap-1 flex items-center flex-row sm:p-2">
         
         <input
          ref={fileInputRefCommunity}
          type="file"
          hidden
          multiple
          accept={fileTypeCommunity}
          onChange={handleFileChange}
        />
        <div className="inline-flex items-center sm:gap-3 gap-1">
          
          <button
              onClick={() => setShowMenuCommunity((prev) => !prev)}
              className="bg-gray-300 rounded-full text-black p-2 hover:bg-gray-400 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
              stroke-width="1.5" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
            </svg>
            </button>
        </div>
          
  
     
        <div className="relative w-full mt-1">
         <textarea
                ref={textareaRefCommunity}
                value={textCommunity}
                rows={1}
                onChange={(e) => setTextCommunity(e.target.value)}
                className="flex-1 border no-scrollbar bg-[var(--bg-color)] border-gray-400 text-[var(--text-color)] shadow relative w-full px-4 rounded-full py-3 relative"
            />
          {!textCommunity && 
          <button className="absolute top-3 right-3" onClick={() => setShowEmojiCommunity(prev => !prev)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
            class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
            </svg>
  
          </button>
          }
        </div>
    
        <div className="relative">
        {!recordingCommunity &&
          textCommunity && (

          <button
            onClick={() =>
              setShowSendOptions(
                (prev) => !prev
              )
            }
            className="
              text-white
              bg-green-500
              px-2
              py-2
              rounded-full
            "
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>

          </button>
        )}

        {/* FLOAT UP */}
        {showSendOptions && (

          <div
            className="
              absolute
              bottom-16
              right-0
              flex
              flex-col
              gap-2
              z-50
            "
          >

            {/* RESPOND */}
            <button
              onClick={() =>

                sendTextCommunity({
                  response_mode: true,
                })

              }
              className="
                flex
                items-center
                gap-2
                bg-[#202c33]
                text-white
                px-4
                py-3
                rounded-full
                shadow-lg
                whitespace-nowrap font-bold text-sm
              "
            >

              <span>
               Enable Respond
              </span>

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
              

            </button>

            {/* NO RESPOND */}
            <button
              onClick={() =>

                sendTextCommunity({
                  response_mode: false,
                })

              }
              className="
                flex
                items-center
                gap-2
                bg-[#202c33]
                text-white
                px-4
                py-3
                rounded-full
                shadow-lg
                whitespace-nowrap font-bold text-sm
              "
            >

              <span>
                No Respond
              </span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>

              

            </button>

          </div>
        )}

      </div>
      </div>
      )}
          {showEmojiCommunity && (
          <div className="absolute bottom-16">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )} 
  
       
      </>
    )}
  
       
        
   <AttachmentMenuCommunity
    show={showMenuCommunity}
    onClose={() => setShowMenuCommunity(false)}
    onPick={handlePick}
  />
  
  
  <MediaCommunityPreviewModal
    show={showPreviewCommunity}
    files={files}
    previewUrls={previewUrlsCommunity}
    caption={captionCommunity}
    setCaption={setCaptionCommunity}
    croppedImages={croppedImagesCommunity}
    setCroppedImages={setCroppedImagesCommunity}
    setCropAppliedMap={setCropAppliedMapCommunity}
    crop={cropCommunity}
    setCrop={setCropCommunity}
    cropAppliedMap={cropAppliedMapCommunity}
    selected={selectedCommunity}
    onClose={() => setShowPreviewCommunity(false)}
    onSend={({ selectedFiles }) => {
      sendFileCommunity(selectedFiles); // 👈 pass only selectedCommunity
      setShowPreviewCommunity(false);
    }}
    setDurationMap={setDurationMapCommunity}
    durationMap={durationMapCommunity}
    trimMap={trimMapCommunity}
    setTrimMap={setTrimMapCommunity}
    dragType={dragTypeCommunity}
    setDragType={setDragTypeCommunity}
    trimAppliedMap={trimAppliedMapCommunity}
    setTrimAppliedMap={setTrimAppliedMapCommunity}
    showSendOptions={showSendOptions} setShowSendOptions={setShowSendOptions}
  />
  
      </div> 
  )
  }