import { useState } from "react";
import api from "../../Api/axios";

export function PinnedMessagesBar({ messages, onSelect, setMessages }) {
  const pinned = messages.filter(m => m.is_pinned);

  const lastPinned = pinned[pinned.length - 1];

  const [showModal, setShowModal] = useState(false);

  const handlePin = async (msg) => {
    try {
      if (msg.is_pinned) {
        await api.delete("/api/messages/pin", {
          data: { message_id: msg.id },
        });
      } else {
        await api.put("/api/messages/pin", {
          message_id: msg.id,
        });
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? { ...m, is_pinned: !m.is_pinned }
            : m
        )
      );

    } catch (err) {
      console.error("Pin error:", err);
    }
  };

  if (!pinned.length) return null;

  return (
    <>
      {/* ✅ ONLY LAST PIN */}
      <div
        onClick={() => setShowModal(true)}
        className="sticky top-0 z-20 bg-yellow-50 border-b-2 border-blue-800 px-3 py-2 cursor-pointer"
      >
        <div className="flex justify-between items-center text-xs font-semibold">
          <div className="truncate flex gap-2">
            <span>📌</span>

            <span className="truncate">
              {lastPinned.type === "text"
                ? lastPinned.message
                : lastPinned.file_name || `${lastPinned.type} message`}
            </span>

            {pinned.length > 1 && (
              <span className="text-blue-600">
                +{pinned.length - 1}
              </span>
            )}
          </div>
           <button
            onClick={(e) => {
              e.stopPropagation();
              handlePin(lastPinned); // ✅ FIX
            }}
            className="text-red-500 text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-800"
          >
            Unpin
          </button>
        </div>
      </div>

      {/* ✅ MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-h-[70vh] overflow-y-auto rounded-lg p-4">

            <div className="flex justify-between mb-3">
              <h2 className="font-bold">Pinned Messages</h2>
              <button onClick={() => setShowModal(false)}>✖</button>
            </div>

            {pinned.map((msg) => (
              <div
                key={msg.id}
                className="flex justify-between items-center bg-gray-100 p-2 mb-2 rounded cursor-pointer"
                onClick={() => {
                  onSelect?.(msg);
                  setShowModal(false);
                }}
              >
                <span className="text-sm truncate">
                  {msg.type === "text"
                    ? msg.message
                    : msg.file_name || `${msg.type} message`}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePin(msg);
                  }}
                  className="text-red-500 text-xs"
                >
                  Unpin
                </button>
              </div>
            ))}

          </div>
        </div>
      )}
    </>
  );
}