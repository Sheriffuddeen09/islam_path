import React, { useState } from "react";
import toast from "react-hot-toast";

export default function DeleteMessageModal({
  open,
  onClose,
  message,
  setMessages,
}) {
  const [loading, setLoading] =
    useState(false);

  if (!open || !message) return null;

  const handleDelete = async () => {
    const toastId =
      toast.loading(
        "Deleting message..."
      );

    setLoading(true);

    try {
      const token =
        localStorage.getItem("token");

      const formData =
        new FormData();

      formData.append(
        "action",
        "delete"
      );

      formData.append(
        "community_id",
        message.community_id
      );

      formData.append(
        "message_id",
        message.id
      );

      const response =
        await fetch(
          "http://localhost:8000/api/community/message",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Delete failed"
        );
      }

      setMessages(prev =>
        prev.map(m =>
          m.id === message.id
            ? {
                ...m,
                deleted_at:
                  data.deleted_at ||
                  new Date().toISOString(),
              }
            : m
        )
      );

      toast.success(
        "Message deleted",
        {
          id: toastId,
        }
      );

      onClose();
    } catch (error) {
      console.error(error);

      toast.error(
        error.message ||
          "Failed to delete message",
        {
          id: toastId,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/70
        flex
        items-center
        justify-center
        z-[99999]
      "
      onClick={onClose}
    >
      <div
        className="
          w-[92%]
          max-w-md
          bg-[#111]
          border
          border-white/10
          rounded-3xl
          p-6
          text-white
        "
        onClick={e =>
          e.stopPropagation()
        }
      >
        <h2
          className="
            text-lg
            font-semibold
            mb-2
          "
        >
          Delete Message
        </h2>

        <p
          className="
            text-sm
            text-gray-400
            mb-6
          "
        >
          This message will be
          deleted for everyone.
        </p>

        <div
          className="
            flex
            justify-end
            gap-3
          "
        >
          <button
            disabled={loading}
            onClick={onClose}
            className="
              px-4
              py-2
              rounded-xl
              bg-[#222]
              hover:bg-[#2a2a2a]
              transition
            "
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleDelete}
            className="
              px-4
              py-2
              rounded-xl
              bg-red-600
              hover:bg-red-700
              transition
              min-w-[120px]
            "
          >
            {loading
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}