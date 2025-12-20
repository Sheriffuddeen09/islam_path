import { useState } from "react";
import api from "../Api/axios";
import { Check, CheckCheck } from "lucide-react";

export default function EditModal({ messages, currentUserId, onMessageUpdate }) {
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");

  const startEdit = (message) => {
    setEditingMessageId(message.id);
    setEditText(message.message);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const saveEdit = async (message) => {
    try {
      const res = await api.put(`/api/messages/${message.id}`, { message: editText });
      onMessageUpdate(res.data.message); // update parent state
      cancelEdit();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to edit message.");
    }
  };

  const canEdit = (message) => {
    // Only text, own message, and not seen yet
    return (
      message.sender_id === currentUserId &&
      message.type === "text" &&
      !message.seen_at
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {messages.map((msg) => {
        const isEditing = editingMessageId === msg.id;
        const isMine = msg.sender_id === currentUserId;

        return (
          <div
            key={msg.id}
            className={`flex gap-2 p-2 rounded ${
              isMine ? "bg-blue-50 self-end" : "bg-gray-100 self-start"
            }`}
          >
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="border p-1 rounded flex-1"
                  />
                  <button
                    onClick={() => saveEdit(msg)}
                    className="bg-blue-500 text-white px-2 rounded"
                  >
                    Save
                  </button>
                  <button onClick={cancelEdit} className="bg-gray-300 px-2 rounded">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span>{msg.message}</span>
                  {msg.edited && <span className="text-xs text-gray-400">(edited)</span>}
                </div>
              )}
            </div>

            {/* Edit button */}
            {!isEditing && canEdit(msg) && (
              <button
                onClick={() => startEdit(msg)}
                className="text-xs text-blue-500 hover:underline"
              >
                Edit
              </button>
            )}

            {/* Seen icon */}
            {isMine && msg.seen_at && (
              <CheckCheck className="w-4 h-4 text-blue-500" />
            )}
          </div>
        );
      })}
    </div>
  );
}
