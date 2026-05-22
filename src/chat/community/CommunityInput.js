import {
  Send
} from "lucide-react";

import {
  useState
} from "react";
import api from "../../Api/axios";


export default function CommunityInput({

  activeCommunity,
  setMessages,

}) {

  const [message, setMessage] =
    useState("");

  const sendMessage =
  async () => {

    if (!message.trim()) return;

    try {

      const res =
        await api.post(
          "/api/community/send",
          {

            chat_id:
              activeCommunity.id,

            message,

            type: "text",
          }
        );

      setMessages(prev => [

        ...prev,

        ...res.data.messages

      ]);

      setMessage("");

    } catch (err) {

      console.log(err);
    }
  };

  return (

    <div className="p-4 border-t border-gray-700 bg-[#202c33] flex gap-3">

      <input
        value={message}
        onChange={e =>
          setMessage(
            e.target.value
          )
        }
        placeholder="Message community..."
        className="flex-1 h-12 rounded-full bg-[#2a3942] px-5 text-white outline-none"
      />

      <button
        onClick={sendMessage}
        className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white"
      >

        <Send size={22} />

      </button>

    </div>
  );
}