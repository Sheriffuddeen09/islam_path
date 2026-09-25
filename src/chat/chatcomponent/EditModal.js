import { useState } from "react";
import api from "../../Api/axios";
import toast, { Toaster } from "react-hot-toast";

import { encryptMessage } from "../../utils/encryption";

import {
  X,
  Check,
  Pencil,
  Loader2,
} from "lucide-react";

export default function EditModal({
  message,
  onMessageUpdate,
  onClose,
  chatId,
}) {
  const [editText, setEditText] = useState(message?.message || "");
  const [loading, setLoading] = useState(false);

  const saveEdit = async () => {
    if (!editText.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const chatKey = localStorage.getItem(`chat_key_${chatId}`);

      if (!chatKey) {
        toast.error("Encryption key missing");
        return;
      }

      const encrypted = await encryptMessage(editText, chatKey);

      const res = await api.put(`/api/messages/${message.id}`, {
        message: encrypted.encrypted,
        iv: encrypted.iv,
      });

      const updatedMessage = {
        ...res.data.message,
        message: editText,
      };

      onMessageUpdate(updatedMessage);

      toast.success("Message updated");

      onClose();
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to update message"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="
          fixed inset-0 z-[9999]
          flex items-center justify-center
          p-4
          bg-black/60
          backdrop-blur-sm
        "
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            relative
            w-full
            max-w-md
            overflow-hidden
            rounded-2xl
            border border-white/10
            bg-[var(--bg-color)]
            text-[var(--text-color)]
            shadow-[0_25px_80px_rgba(0,0,0,0.45)]
            animate-[fadeIn_.2s_ease-out]
          "
        >
          {/* Header */}
          <div
            className="
              flex items-center justify-between
              px-5 py-4
              border-b border-white/10
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex items-center justify-center
                  w-10 h-10
                  rounded-xl
                  bg-blue-500/10
                  text-blue-500
                "
              >
                <Pencil size={19} />
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-semibold">
                  Edit message
                </h2>

                <p className="text-xs opacity-50 mt-0.5">
                  Make changes to your message
                </p>
              </div>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                flex items-center justify-center
                w-9 h-9
                rounded-full
                opacity-60
                hover:opacity-100
                hover:bg-white/10
                transition
                disabled:opacity-30
              "
            >
              <X size={19} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            <label className="block text-xs font-medium opacity-60 mb-2">
              Your message
            </label>

            <div
              className="
                relative
                rounded-xl
                border border-white/10
                bg-black/5
                focus-within:border-blue-500/60
                focus-within:ring-2
                focus-within:ring-blue-500/10
                transition
              "
            >
              <textarea
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape" && !loading) {
                    onClose();
                  }

                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !loading
                  ) {
                    e.preventDefault();
                    saveEdit();
                  }
                }}
                disabled={loading}
                rows={5}
                placeholder="Write your message..."
                className="
                  w-full
                  resize-none
                  bg-transparent
                  px-4 py-3
                  text-sm
                  outline-none
                  placeholder:opacity-40
                  scrollbar-thin
                  scrollbar-thumb-white/20
                  scrollbar-track-transparent
                  disabled:opacity-50
                "
              />

              {/* Character count */}
              <div className="flex justify-end px-4 pb-2">
                <span className="text-[10px] opacity-40">
                  {editText.length} characters
                </span>
              </div>
            </div>

            {/* Hint */}
            <p className="mt-2 text-[11px] opacity-40">
              Press Enter to save · Shift + Enter for a new line
            </p>
          </div>

          {/* Footer */}
          <div
            className="
              flex items-center justify-end
              gap-2
              px-5 py-4
              border-t border-white/10
              bg-black/5
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                px-4
                h-10
                rounded-xl
                text-sm
                font-medium
                opacity-70
                hover:opacity-100
                hover:bg-white/10
                transition
                disabled:opacity-30
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveEdit}
              disabled={loading || !editText.trim()}
              className="
                flex items-center justify-center
                gap-2
                min-w-[105px]
                h-10
                px-4
                rounded-xl
                bg-blue-500
                hover:bg-blue-600
                active:scale-[0.98]
                text-white
                text-sm
                font-medium
                shadow-lg
                shadow-blue-500/20
                transition-all
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={17} />
                  <span>Save changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </>
  );
}