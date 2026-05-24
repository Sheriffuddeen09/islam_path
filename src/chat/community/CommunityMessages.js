import { useState } from "react";
import api from "../../Api/axios";
import InputComponent from "./InputComponent";
import MessagesArea from "./MessageArea";

export default function CommunityMessages({

  activeCommunity,
  messages,
  setMessages,
  onBack,
  onOpenSettings,
  authUser

}) {

    const [replyingToCommunity, setReplyingToCommunity] = useState(null);
  
    const updateStatus = (id, status) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, status }
          : m
      )
    );
  };

  const replaceMessage = (id, newMsg) => {

    setMessages(prev =>
      prev.map(m =>
        m.id === id
          ? {
              ...m,
              ...newMsg,
              status: "sent",
            }
          : m
      )
    );
  };

    const resendCommunityText = async (msg) => {

        updateStatus(msg.id, "sending");

        try {

          const { data } = await api.post(
            "/api/community/messages/send",
            {
              community_id: activeCommunity.id,
              message: msg.message,
              type: "text",
              replied_to: msg.replied_to?.id || null,
            }
          );

          const message =
            data.messages?.[0];

          replaceMessage(msg.id, {
            ...message,
            sender:
              message.sender || authUser,
          });

        } catch (err) {

          console.log(err);

          updateStatus(msg.id, "failed");
        }
      };

        
      const resendCommunityFile = async (
        msg
      ) => {

        if (!msg.originalFiles) {

          console.warn(
            "❌ No original files"
          );

          return;
        }

        updateStatus(msg.id, "sending");

        const form = new FormData();

        form.append(
          "community_id",
          activeCommunity.id
        );

        const getType = (file) => {

          if (
            file.type.startsWith(
              "image/"
            )
          ) {
            return "image";
          }

          if (
            file.type.startsWith(
              "video/"
            )
          ) {
            return "video";
          }

          if (
            file.type.startsWith(
              "audio/"
            )
          ) {
            return "audio";
          }

          return "file";
        };

        msg.originalFiles.forEach(
          (file) => {

            form.append(
              "files[]",
              file
            );

            form.append(
              "types[]",
              getType(file)
            );
          }
        );

        if (msg.message) {

          form.append(
            "message",
            msg.message
          );
        }

        if (msg.replied_to?.id) {

          form.append(
            "replied_to",
            msg.replied_to.id
          );
        }

        try {

          const res = await api.post(
            "/api/community/messages/send",
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

          let grouped;

          if (
            serverMessages[0]?.files
          ) {

            grouped = {
              ...serverMessages[0],
              status: "sent",
            };

          } else {

            grouped = {
              ...serverMessages[0],

              files:
                serverMessages.map(
                  (m) => ({
                    file_url:
                      m.file_url,

                    file_name:
                      m.file_name,

                    type: m.type,

                    duration:
                      m.duration,
                  })
                ),

              status: "sent",
            };
          }

          replaceMessage(
            msg.id,
            grouped
          );

        } catch (err) {

          console.log(err);

          updateStatus(msg.id, "failed");
        }
      };  
  
      const resendCommunityVoice = async (msg) => {

  if (!msg.localBlob) {

    console.warn(
      "❌ No local blob"
    );

    return;
  }

  updateStatus(msg.id, "sending");

  const form = new FormData();

  form.append(
    "community_id",
    activeCommunity.id
  );

  form.append(
    "voice",
    msg.localBlob,
    "voice.webm"
  );

  if (msg.replied_to?.id) {

    form.append(
      "replied_to",
      msg.replied_to.id
    );
  }

  try {

    const res = await api.post(
      "/api/community/messages/voice",
      form,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    replaceMessage(msg.id, {
      ...res.data.message,
      sender:
        res.data.message.sender ||
        authUser,
    });

  } catch (err) {

    console.log(err);

    updateStatus(msg.id, "failed");
  }
};

    const retryCommunityMessage =
    async (msg) => {

    console.log(
      "Retrying:",
      msg
    );

    if (msg.type === "text") {

      return resendCommunityText(
        msg
      );
    }

    if (msg.type === "voice") {

      return resendCommunityVoice(
        msg
      );
    }

    if (
      [
        "image",
        "video",
        "audio",
        "file",
        "document",
      ].includes(msg.type)
    ) {

      return resendCommunityFile(
        msg
      );
    }
  };

  

   const getImage = (image) => {

    if (!image) return null;

    if (
      image.startsWith("http")
    ) {
      return image;
    }

    // ✅ storage image
    return `http://localhost:8000/storage/${image}`;
  };


  if (!activeCommunity) {

    return (

      <div className="flex-1 flex items-center justify-center bg-[#0b141a] text-gray-500 text-xl">

        Select Community

      </div>
    );
  }

  return (

    <div className="flex-1 flex flex-col bg-[var(--bg-color)] text-[var(--text-color)]">

      {/* HEADER */}
      <div className="h-16 border-b border-gray-700 flex items-center px-5">

        <div className="flex items-center gap-3">

          <button className="lg:hidden"
          onClick={onBack}
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
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </button>

           {activeCommunity.community_image ? (

                      <img

                        src={getImage(
                          activeCommunity.community_image
                        )}

                        alt={
                          activeCommunity.community_name
                        }

                        className="

                          w-14
                          h-14
                          rounded-full
                          object-cover

                        "

                        onError={(e) => {

                          e.target.style.display =
                            "none";

                          if (
                            e.target.nextSibling
                          ) {
                            e.target.nextSibling.style.display =
                              "flex";
                          }
                        }}

                      />

                    ) : null}
          <div>

            <h2 className="font-semibold">

              {
                activeCommunity.community_name
              }

            </h2>

           
          </div>

           <button
          onClick={onOpenSettings}
          className="text-sm"
        >

          ⚙️

        </button>

        </div>

      </div>

          <MessagesArea 
          messages={messages}
          authUser={authUser}
          retryCommunityMessage={retryCommunityMessage}
          setReplyingTo={setReplyingToCommunity}
          activeCommunity={activeCommunity}
          />            
         
        <InputComponent
          activeCommunity={
            activeCommunity
          }
          setMessages={setMessages}
          authUser={authUser}
          setReplyingToCommunity={setReplyingToCommunity}
          replyingToCommunity={replyingToCommunity}
        />

      </div>
  );
}