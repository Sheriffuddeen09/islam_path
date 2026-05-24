import { useEffect } from "react";
import VoiceWave from "../chatbox/VoiceWave";
import EmojiPicker from "emoji-picker-react";
import MediaCommunityPreviewModal from "./MediaCommunityPreviewModal";
import ConfirmSendCommunityModal from "./ConfirmSendCommunityModal";
import AttachmentMenuCommunity from "./AttachmentMenuCommunity";


export default function CommunityInput({

   activeCommunity, authUser,sendFileCommunity, files, fileInputRefCommunity,
        stopRecordingCommunity, sendTextCommunity, showEmojiCommunity,setShowEmojiCommunity,
        holdTimeoutCommunity,duration, setDuration, showMenuCommunity, setShowMenuCommunity,
        showConfirmCommunity, setShowConfirmCommunity, fileTypeCommunity, setFileTypeCommunity,
        setSelectedTypeCommunity, dragTypeCommunity, setDragTypeCommunity,
        pausedRefCommunity, textareaRefCommunity, paused, setPaused, showPreviewCommunity,
        setShowPreviewCommunity, selectedCommunity,setSelectedCommunity, cropAppliedMapCommunity,
        setCropAppliedMapCommunity, cropCommunity, setCropCommunity, trimMapCommunity,setTrimMapCommunity,
        durationMapCommunity, setDurationMapCommunity, trimAppliedMapCommunity, setTrimAppliedMapCommunity,
        recordingCommunity, setRecordingCommunity, setFiles, previewUrlsCommunity, status,
        setPreviewUrlsCommunity, captionCommunity, setCaptionCommunity, replyingToCommunity, blockAllInput,
       textCommunity, setTextCommunity, onlyAdminSend, isAdmin, setReplyingToCommunity, timerRefCommunity,
       audioChunksRefCommunity, mediaRecorderRefCommunity, croppedImagesCommunity, setCroppedImagesCommunity}) {



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
      <>
  
    {!isAdmin && onlyAdminSend && status === "approved" && (
      <div className="text-center text-gray-500 text-sm py-2">
        Only admins can send messages in this group
      </div>
    )}
  
    {!blockAllInput && (
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
          <button className="absolute top-3 right-3" onClick={() => setShowEmojiCommunity(prev => !prev)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
            class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
            </svg>
  
          </button>
        </div>
    
        {!recordingCommunity && textCommunity && (
            <button onClick={sendTextCommunity} className="text-white bg-green-500  px-2 py-2 rounded-full">
              
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
  
            </button>
          )}
      </div>
      )}
          {showEmojiCommunity && (
          <div className="absolute bottom-16">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )} 
  
        {recordingCommunity && (
            <div className="flex justify-center mx-auto items-center my-2 gap-6 sm:gap-8 shadow-md  border px-3 py-3 rounded-full">
           <button onClick={cancelRecording}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5  text-[var(--text-color)]">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button> 
            <span className="text-sm font-mono font-bold text-[var(--text-color)]">
              {formatTime(duration)}
            </span>
              <VoiceWave active={!paused} />
  
              
  
              {/* PAUSE / RESUME */}
              {!paused ? (
                <button onClick={pauseRecording}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-[var(--text-color)]">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                </svg>
  
                </button>
              ) : (
                <button onClick={resumeRecording}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-[var(--text-color)]">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
  
                </button>
              )}
  
              {/* SEND */}
              <button
                onClick={stopRecordingCommunity}
                className="text-[var(--text-color)] font-bold"
              >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
  
              </button>
  
            </div>
           )}
      </>
    )}
  
       
        
   <AttachmentMenuCommunity
    show={showMenuCommunity}
    onClose={() => setShowMenuCommunity(false)}
    onPick={handlePick}
  />
  
  <ConfirmSendCommunityModal
    show={showConfirmCommunity}
    files={files}
    username={activeCommunity.other_user?.first_name || "User"}
    onCancel={() => setShowConfirmCommunity(false)}
    onConfirm={() => {
      sendFileCommunity();
      setShowConfirmCommunity(false);
    }}
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
  />
  
      </> 
  )
  }