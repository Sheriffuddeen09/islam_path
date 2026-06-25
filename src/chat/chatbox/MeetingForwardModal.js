import { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function MeetingForwardModal({
  meeting,
  users = [],
  groups = [],
  onSend,
  onClose,
}) {

  

  const [selectedTargets, setSelectedTargets] = useState([]);

  const [search, setSearch] = useState("");

  const [copied, setCopied] = useState(false);

 const [sending, setSending] = useState(false);

 const allTargets = useMemo(() => {

    const result = [];

    users.forEach(chat => {

    const user =
        chat.other_user ||
        chat.other ||
        chat.user ||
        null;

    if (!user) return;

    result.push({
        id: chat.id, // CHAT ID
        user_id: user.id,
        __type: "user",
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
    });

    });

       

    groups.forEach(group => {

      result.push({
        id: group.id,
        __type: "group",
        name:
          group.name ||
          group.group_name ||
          "Unnamed Group",
      });

    });

    return result;

  }, [users, groups]);

  const filteredTargets =
    allTargets.filter(item =>
      item.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const toggleTarget = (
    item
  ) => {

    const key =
      `${item.__type}-${item.id}`;

    setSelectedTargets(prev =>
      prev.includes(key)
        ? prev.filter(
            x => x !== key
          )
        : [...prev, key]
    );
  };

  const handleCopyLink =
  async () => {
    try {

      const meetingLink =
        `${window.location.origin}/meeting/${meeting.room_id}`;

      await navigator.clipboard.writeText(
        meetingLink
      );

      setCopied(true);

      toast.success(
        "Meeting link copied"
      );

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (err) {

      toast.error(
        "Failed to copy link"
      );

    }
  };

    

  const handleForward = async () => {

  try {

    setSending(true);

    await onSend(
      meeting,
      selectedTargets
    );

    onClose();

    toast.success("Meeting sent");

  } catch (err) {

  console.error(
    "MEETING ERROR:",
    err
  );

  console.error(
    "RESPONSE:",
    err?.response?.data
  );

  toast.error(
    err?.response?.data?.message ||
    err?.message ||
    "Failed to send meeting"
  );

} finally {

    setSending(false);

  }
};

    if (!meeting) {
        return null;
        }

  

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center">

      <div className="bg-white text-black w-full max-w-md rounded-xl p-4">

        <div className="flex justify-between items-center mb-4">

          <h2 className="font-bold text-lg">
            Forward Meeting
          </h2>

          <button
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        {/* Meeting Preview */}

        <div className="
  border
  rounded-lg
  p-3
  mb-4
  bg-gray-50
">

  <div className="
    flex
    items-center
    gap-2
  ">

    {meeting?.call_type ===
    "video" ? (
      <span>📹</span>
    ) : (
      <span>📞</span>
    )}

    <span className="font-semibold">

      {meeting?.call_type ===
      "video"
        ? "Video Meeting"
        : "Audio Meeting"}

    </span>

  </div>

  <div className="
    text-xs
    text-gray-500
    mt-2
  ">

    Expires:

    {" "}

    {new Date(
      meeting?.expires_at
    ).toLocaleString()}

  </div>

  <div className="
    mt-3
    border
    rounded-lg
    p-2
    bg-white
  ">

    <div className="
      text-xs
      text-gray-500
      mb-1
    ">
      Meeting Link
    </div>

    <div className="
      flex
      items-center
      gap-2
    ">

      <input
        readOnly
        value={`${window.location.origin}/meeting/${meeting?.room_id}`}
        className="
          flex-1
          border
          rounded
          px-2
          py-1
          text-xs
          bg-gray-50
        "
      />

      <button
        onClick={
          handleCopyLink
        }
        className={`
          px-3
          py-1
          rounded
          text-white
          text-xs
          ${
            copied
              ? "bg-green-600"
              : "bg-blue-600"
          }
        `}
      >

        {copied
          ? "Copied!"
          : "Copy"}

      </button>

    </div>

  </div>

</div>

        <input
          type="text"
          placeholder="Search users or groups..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full border rounded p-2 mb-3"
        />

        <div className="max-h-60 overflow-y-auto scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin space-y-2">

          {filteredTargets.map(
            item => {

              const key =
                `${item.__type}-${item.id}`;

              const selected =
                selectedTargets.includes(
                  key
                );

              return (
                <div
                  key={key}
                  onClick={() =>
                    toggleTarget(
                      item
                    )
                  }
                  className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer ${
                    selected
                      ? "bg-green-100 border-green-500"
                      : ""
                  }`}
                >

                  <div>

                    <div className="font-medium">
                      {item.name}
                    </div>

                    <div className="text-xs text-gray-500">

                      {item.__type ===
                      "group"
                        ? "Group"
                        : "User"}

                    </div>

                  </div>

                  <input
                    type="checkbox"
                    checked={
                      selected
                    }
                    readOnly
                  />

                </div>
              );
            }
          )}

        </div>

        <button
        onClick={handleForward}
        disabled={
            selectedTargets.length === 0 ||
            sending
        }
        className="
            w-full
            mt-4
            bg-green-600
            text-white
            py-3
            rounded
            disabled:opacity-50
            disabled:cursor-not-allowed
        "
        >
        {sending ? (
            <div className="
            flex
            items-center
            justify-center
            gap-2
            ">
            <span className="
                animate-spin
                h-4
                w-4
                border-2
                border-white
                border-t-transparent
                rounded-full inline-flex items-center gap-2
            " />
                Forwarding Link
            </div>
        ) : (
            <>
            Forward Meeting Link
            {selectedTargets.length > 0 &&
                ` (${selectedTargets.length})`}
            </>
        )}
        </button>

      </div>

    </div>
  );
}