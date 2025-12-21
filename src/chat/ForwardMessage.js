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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-5 rounded sm:w-96 w-72">
        <h2 className="font-bold mb-3">Forward Messages</h2>

        {/* Preview selected messages */}
        <div className="max-h-60 overflow-y-auto mb-4 border p-2 rounded">
          {messages.map(msg => (
            <div key={msg.id} className="p-2 border-b last:border-b-0">
              {msg.forwarded_from && <span className="text-xs text-gray-400 mr-1">Forwarded</span>}
              {msg.type === "text" ? msg.message : `📎 ${msg.type}`}
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
              className={`block w-full text-left p-2 mb-1 rounded hover:bg-gray-700 ${
                selectedUsers.includes(user.id) ? "bg-gray-700" : ""
              }`}
            >
              {user.first_name} {user.last_name} ({user.role})
            </button>
          ))}
        </div>

        <div className="flex justify-between gap-2">
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Forward ({selectedUsers.length})
          </button>
          <button
            onClick={onClose}
            className="text-red-400 px-3 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
