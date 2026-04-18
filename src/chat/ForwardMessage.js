import { useState } from "react";

export function ForwardModal({ messages, users, onSend, onClose }) {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleUser = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selectedUsers.length === 0) return;
    onSend(selectedUsers); // pass array of IDs to parent
    onClose()
  };

  const getForwardPreview = (msg) => {
  if (!msg) return "";

  if (msg.type === "text") return msg.message;

  if (["image", "video", "audio", "file"].includes(msg.type)) {
    const files = msg.files || [];

    if (files.length === 0) return msg.type;

    if (files.length === 1) {
      return `📎 ${files[0].file_name}`;
    }

    return `📎 ${files[0].file_name} & ${files[1].file_name}`;
  }

  if (msg.type === "voice") return "🎤 Voice message";

  return msg.type;
};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white  p-5 rounded sm:w-96 w-72">
        <h2 className="font-bold mb-3">Forward Messages</h2>

        {/* Preview selected messages */}
        <div className="overflow-y-auto mb-4 border p-2 rounded space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className="p-2 bg-gray-100 rounded text-sm">
            
            {msg.forwarded_from && (
              <span className="text-xs text-gray-400 mr-1">
                Forwarded
              </span>
            )}

            <p className="truncate">
              {getForwardPreview(msg)}
            </p>

          </div>
        ))}
      </div>  

        {/* Select recipients */}
        <h3 className="font-semibold mb-2">Select Recipient(s):</h3>
        <div className="max-h-48 overflow-y-auto mb-3">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => toggleUser(user.id)}
              className={`block w-full text-left p-2 mb-1 rounded hover:text-white hover:bg-gray-700 ${
                selectedUsers.includes(user.id) ? "bg-gray-700 text-white" : ""
              }`}
            >
              {user.other_user
                ? `${user.other_user.first_name} ${user.other_user.last_name} ( ${user.other_user.role} )`
                : user.teacher
                  ? `${user.teacher.first_name} ${user.teacher.last_name } ( ${user.teacher.role} )`
                  : user.student
                    ? `${user.student.first_name} ${user.student.last_name} ( ${user.student.role} )`
                    : "Unknown User"}
            </button>
          ))}
        </div>

        <div className="flex justify-between gap-2">
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Forward {selectedUsers.length}
          </button>
          <button
            onClick={onClose}
            className="text-red-400 px-3 py-1 rounded text-sm font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
