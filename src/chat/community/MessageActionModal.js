import React, {
  useEffect,
  useState,
} from "react";

export default function MessageActionModal({

  open,

  type,

  message,

  onClose,

  onConfirm,
}) {

  const [editText, setEditText] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {

    if (
      open &&
      type === "edit" &&
      message
    ) {

      setEditText(
        message.message
      );
    }

  }, [
    open,
    type,
    message,
  ]);

  const handleClose = () => {

    if (loading) return;
    onClose();
  };

  const handleConfirm = async () => {

    if (loading) return;

    try {

      setLoading(true);

      await onConfirm(
        message,
        editText
      );

      onClose();

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  };

  if (!open || !message) {
    return null;
  }

  const titles = {

    edit:
      "Edit Message",

    delete:
      "Delete Message",

    clear:
      "Clear Message",
  };

  const descriptions = {

    edit:
      "Update this message content",

    delete:
      "Are you sure you want to delete this message?",

    clear:
      "This will clear the message content but keep the message shell.",
  };

  return (

    <div
      onClick={handleClose}
      className="
        fixed
        inset-0
        z-[99999]

        bg-black/50
        backdrop-blur-sm

        flex
        items-center
        justify-center

        p-4
      "
    >

      {/* MODAL */}

      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="
          w-full
          max-w-md

          bg-[var(--bg-color)]
          text-[var(--text-color)]

          rounded-3xl

          shadow-2xl

          border
          border-white/10

          overflow-hidden

          animate-in
          fade-in
          zoom-in-95
          duration-200
        "
      >

        {/* HEADER */}

        <div
          className="
            px-5
            py-4

            border-b
            border-white/10

            flex
            items-center
            justify-between
          "
        >

          <div>

            <h2
              className="
                text-lg
                font-bold
              "
            >
              {titles[type]}
            </h2>

            <p
              className="
                text-xs
                opacity-70
                mt-1
                font-semibold
                text-[var(--text-color)]
              "
            >
              {
                descriptions[
                  type
                ]
              }
            </p>

          </div>

          <button
            onClick={
              handleClose
            }
            disabled={loading}
            className="
              p-2
              rounded-full

              hover:bg-white/10

              transition

              disabled:opacity-50
            "
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>

          </button>

        </div>

        {/* BODY */}

        <div className="p-5">

          {/* EDIT */}

          {type === "edit" && (

            <textarea

              value={editText}

              onChange={(e) =>
                setEditText(
                  e.target.value
                )
              }

              autoFocus

              rows={5}

              disabled={loading}

              className="
                w-full

                rounded-2xl

                bg-black/20

                border
                border-white/10

                outline-none

                resize-none

                p-4

                text-sm

                focus:border-green-500

                disabled:opacity-50
              "
            />

          )}

          {/* DELETE */}

          {type === "delete" && (

            <div
              className="
                text-sm
                opacity-80
              "
            >
              This action cannot be
              undone.
            </div>

          )}

          {/* CLEAR */}

          {type === "clear" && (

            <div
              className="
                text-sm
                opacity-80
              "
            >
              Message text and files
              will be removed.
            </div>

          )}

        </div>

        {/* FOOTER */}

        <div
          className="
            px-5
            py-4

            border-t
            border-white/10

            flex
            justify-end
            gap-3
          "
        >

          {/* CANCEL */}

          <button
            onClick={
              handleClose
            }
            disabled={loading}
            className="
              px-5
              py-2.5

              rounded-2xl

              bg-white/10

              hover:bg-white/20

              transition

              text-sm
              font-medium

              disabled:opacity-50
            "
          >
            Cancel
          </button>

          {/* CONFIRM */}

          <button
            onClick={
              handleConfirm
            }
            disabled={
              loading ||

              (
                type === "edit" &&
                !editText.trim()
              )
            }
            className={`
              min-w-[110px]

              px-5
              py-2.5

              rounded-2xl

              text-sm
              font-semibold

              transition

              flex
              items-center
              justify-center
              gap-2

              disabled:opacity-50

              ${
                type ===
                "delete"

                  ? `
                    bg-red-600
                    hover:bg-red-700
                    text-white
                  `

                  : `
                    bg-green-600
                    hover:bg-green-700
                    text-white
                  `
              }
            `}
          >

            {loading ? (
              <>

                {/* SPINNER */}

                <svg
                  className="
                    animate-spin
                    h-4
                    w-4
                  "
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >

                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />

                </svg>

                Processing...

              </>
            ) : (
              <>
                {type === "edit"
                  ? "Save"

                  : type ===
                    "delete"

                  ? "Delete"

                  : "Clear"}
              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
}