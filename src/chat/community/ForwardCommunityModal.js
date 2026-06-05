import { useMemo, useState } from "react";
import api from "../../Api/axios";
import { CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export function ForwardCommunityModal({
  messages = [],
  users = [],
  groups = [],
  onClose,
  setSelectedMessage,
  loadingUsers = false,
  loadingGroups = false,
  setShowForwardModal,
  forwardMessages, setForwardSuccess
}) {
  const [search, setSearch] = useState("");
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [sending, setSending] = useState(false);
  const isLoading = loadingUsers || loadingGroups;

  

  const allTargets = useMemo(() => {
    const map = new Map();
    users.forEach((item) => {
      if (!item) return;
      if (
        item.type === "group" ||
        item.group_id ||
        item.group ||
        item.chat_group
      ) {
        return;
      }
      const user =
        item.other_user ||
        item.teacher ||
        item.student ||
        item.user ||
        item;
      const userId = user?.id || item.id;
      if (!userId) return;
      const fullName =
        `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
  
      const key = `user-${userId}`;
  
      if (!map.has(key)) {
        map.set(key, {
          id: userId,
          __type: "user",
          name: fullName || user.name || `User ${userId}`,
        });
      }
    });
    groups.forEach((group) => {
      if (!group?.id) return;
      const key = `group-${group.id}`;
      if (!map.has(key)) {
        map.set(key, {
          id: group.id,
          __type: "group",
          name:
            group.name ||
            group.group_name ||
            "Unnamed Group",
        });
      }
    });
  
    return Array.from(map.values());
  }, [users, groups]);

  const filteredTargets = useMemo(() => {
      return allTargets.filter((item) =>
        
        (item.name || "")
          .toLowerCase()
          .includes(search.toLowerCase())
          
      );
    }, [allTargets, search]);
  
    const toggleTarget = (item) => {

    const key = `${item.__type}-${item.id}`;

    setSelectedTargets(prev =>
      prev.includes(key)
        ? prev.filter(t => t !== key)
        : [...prev, key]
    );
  };

  
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

  
  const getPreview = (msg) => {
  if (!msg) return "";

  // Approved message
  if (msg.approvals?.length > 0) {
    const latestApproval =
      msg.approvals[msg.approvals.length - 1];

    return (
      latestApproval?.admin_response ||
      msg.message ||
      ""
    );
  }

  // Normal text
  if (msg.type === "text") {
    return msg.message || "";
  }

  // Media with caption
  if (
    ["image", "video", "audio", "file"].includes(msg.type)
  ) {
    return msg.message
      ? `📎 ${msg.message}`
      : `📎 ${msg.type}`;
  }

  return `${msg.type} message`;
};

  const forwardCommunityMessages = async (
  receiverTargets
) => {
  try {
    setSending(true);

    const payload = {
      message_ids: forwardMessages.map(
        (m) => m.id
      ),

      targets: receiverTargets.map((t) => {
        if (typeof t === "object") {
          return {
            id: Number(t.id),
            type:
              t.type ||
              t.__type ||
              "group",
          };
        }

        const [type, id] =
          String(t).split("-");

        return {
          id: Number(id),
          type,
        };
      }),
    };

    const res = await api.post(
      "/api/community/messages/forward",
      payload
    );

    setForwardSuccess({
      chatId: res.data.chat_id,
      messageId: res.data.message_id,
      targetCount: res.data.forwarded_count,
    });
    setShowForwardModal(false);

    setSelectedMessage([]);

    toast.success(
      "Messages forwarded successfully"
    );
  } catch (err) {
    console.error(
      err.response?.data || err
    );

    toast.error(
      "Failed to forward messages"
    );
  } finally {
    setSending(false);
  }
};

 const handleSend = async () => {
  if (!selectedTargets.length) return;

  await forwardCommunityMessages(selectedTargets);
};

  const SkeletonItem = () => (
    <div className="animate-pulse flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-300" />
        <div>
          <div className="h-3 w-24 bg-gray-300 rounded mb-2" />
          <div className="h-2 w-16 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="w-4 h-4 bg-gray-300 rounded-full" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center">
      <div className="w-[95%] max-w-md bg-white rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold">
            Forward ({messages.length})
          </h2>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="max-h-40 overflow-y-auto bg-gray-100 p-2 rounded mb-3 space-y-2">
      {messages.map((m) => {

        const approvalText =
          m.approvals?.length > 0
            ? m.approvals[
                m.approvals.length - 1
              ]?.admin_response
            : null;

      const previewText =
        approvalText ||
        m.message ||
        "";

      const fileUrl =
        m.file
          ? `http://localhost:8000/storage/${m.file}`
          : null;

          return (
            <div
              key={m.id}
              className="
                border
                rounded-lg
                bg-white
                p-2
              "
            >
              {/* IMAGE */}
              {m.type === "image" &&
                fileUrl && (
                  <img
                    src={fileUrl}
                    alt=""
                    className="
                      w-20
                      h-20
                      object-cover
                      rounded
                      mb-2
                    "
                  />
                )}

              {/* VIDEO */}
              {m.type === "video" &&
                fileUrl && (
                  <video
                    className="
                      w-20
                      h-20
                      object-cover
                      rounded
                      mb-2
                    "
                  >
                    <source
                      src={fileUrl}
                    />
                  </video>
                )}

              {/* TEXT / APPROVAL */}
              {previewText ? (
                <p className="text-sm text-gray-800 break-words">
                  {previewText}
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  {m.type}
                </p>
              )}

            </div>
          );
        })}
      </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users or groups..."
          className="w-full border p-2 rounded mb-2"
        />
        <div className="max-h-52 overflow-y-auto space-y-2">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          {!isLoading &&
            filteredTargets.map((item) => {
              console.log("RENDERING ITEM:", item);
              const key = `${item.__type}-${item.id}`;
              const isSelected = selectedTargets.includes(key);
              return (
                <div
                  key={key}
                  onClick={() => {
                    console.log("DIV CLICKED");
                    toggleTarget(item);
                  }}
                  className={`flex justify-between items-center p-3 rounded cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-9
                        h-9
                        rounded-full
                        flex
                        items-center
                        justify-center
                        font-bold
                        text-white
                        ${getColor(item.name)}
                      `}
                    >
                      {getInitial(item.name)}
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs opacity-70 capitalize">
                        {item.__type}
                      </p>
                    </div>
                  </div>
                  {isSelected && <CheckCircle size={18} />}
                </div>
              );
            })}
          {!isLoading && filteredTargets.length === 0 && (
            <p className="text-center text-gray-500">
              No users or groups found
            </p>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={!selectedTargets.length || sending}
          className="w-full mt-3 bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
        >
          {sending ? "Forwarding" : `Forward (${selectedTargets.length})`}
        </button>
      </div>
    </div>
  );
}