import {
  Check,
  Clapperboard,
  ImageIcon
  ,
  Play,
  Send,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import api from "../../Api/axios";
import toast from "react-hot-toast";

export function ForwardModal({
  messages = [],
  users = [],
  groups = [],
  onSend,
  onClose,
  loading,
  loadingChats = false,
  loadingGroups = false,
  handleSendMeeting,
  onReelAdded,
}) {
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [search, setSearch] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Reel states
  |--------------------------------------------------------------------------
  */

  const [showReelReview, setShowReelReview] =
    useState(false);

  const [reelLoading, setReelLoading] =
    useState(false);

  const [activeMediaId, setActiveMediaId] =
    useState(null);

  const [reelDescriptions, setReelDescriptions] =
    useState({});

  const isLoading =
    loadingChats || loadingGroups;

  /*
  |--------------------------------------------------------------------------
  | ALL TARGETS
  |--------------------------------------------------------------------------
  */

  const allTargets = useMemo(() => {
    const map = new Map();

    users.forEach((item) => {
      if (!item) return;

      /*
       * Ignore group objects accidentally returned inside users.
       */
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
        item.other ||
        item.teacher ||
        item.student ||
        item.user ||
        item;

      const userId =
        user?.id || item.id;

      if (!userId) return;

      const fullName = [
        user?.first_name,
        user?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      const name =
        fullName ||
        user?.name ||
        item?.name ||
        user?.username ||
        `User ${userId}`;

      const key =
        `user-${userId}`;

      if (!map.has(key)) {
        map.set(key, {
          id: Number(userId),
          __type: "user",
          type: "user",
          name,
          image:
            user?.profile_image ||
            user?.profile_picture ||
            user?.avatar ||
            item?.profile_image ||
            item?.profile_picture ||
            item?.avatar ||
            null,
          user_id: Number(userId),
        });
      }
    });

    /*
     * GROUPS
     */
    groups.forEach((group) => {
      if (!group?.id) return;

      const key =
        `group-${group.id}`;

      if (!map.has(key)) {
        map.set(key, {
          id: Number(group.id),
          __type: "group",
          type: "group",
          name:
            group.name ||
            group.group_name ||
            group.chat_name ||
            "Unnamed Group",
          image:
            group.image ||
            group.group_image ||
            group.avatar ||
            null,
        });
      }
    });

    return Array.from(
      map.values()
    );
  }, [users, groups]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const filteredTargets = useMemo(() => {
    const value =
      search
        .toLowerCase()
        .trim();

    if (!value) {
      return allTargets;
    }

    return allTargets.filter((item) =>
      (item.name || "")
        .toLowerCase()
        .includes(value)
    );
  }, [
    allTargets,
    search,
  ]);

  /*
  |--------------------------------------------------------------------------
  | SELECT TARGET
  |--------------------------------------------------------------------------
  */

  const toggleTarget = (item) => {
    const key =
      `${item.__type}-${item.id}`;

    setSelectedTargets((prev) =>
      prev.includes(key)
        ? prev.filter(
            (target) =>
              target !== key
          )
        : [
            ...prev,
            key,
          ]
    );
  };

  /*
  |--------------------------------------------------------------------------
  | AVATAR COLORS
  |--------------------------------------------------------------------------
  */

  const colors = [
    "bg-red-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-purple-400",
    "bg-pink-400",
    "bg-yellow-400",
    "bg-orange-400",
    "bg-indigo-400",
    "bg-teal-400",
    "bg-cyan-400",
    "bg-emerald-400",
    "bg-lime-400",
    "bg-amber-400",
    "bg-rose-400",
    "bg-fuchsia-400",
    "bg-violet-400",
    "bg-sky-400",
    "bg-slate-400",
    "bg-gray-400",
    "bg-zinc-400",
    "bg-stone-400",
    "bg-neutral-400",
    "bg-red-500",
    "bg-blue-500",
  ];

  const getColor = (name = "") => {
    if (!name) {
      return "bg-gray-400";
    }

    const index =
      name.charCodeAt(0) %
      colors.length;

    return colors[index];
  };

  const getInitial = (name) => {
    if (!name) return "?";

    return name
      .charAt(0)
      .toUpperCase();
  };

  /*
  |--------------------------------------------------------------------------
  | FILE URL
  |--------------------------------------------------------------------------
  */

  const getUrl = (file) => {
    if (!file) return null;

    if (
      file.file_url?.startsWith("blob:")
    ) {
      return file.file_url;
    }

    if (
      file.file?.startsWith("blob:")
    ) {
      return file.file;
    }

    if (
      file.file_url?.startsWith("http")
    ) {
      return file.file_url;
    }

    if (file.file_url) {
      return `http://localhost:8000/storage/${file.file_url}`;
    }

    if (file.file) {
      return `http://localhost:8000/storage/${file.file}`;
    }

    return null;
  };

  /*
  |--------------------------------------------------------------------------
  | FILE NAME
  |--------------------------------------------------------------------------
  */

  const getFileName = (file) => {
    if (!file) return "File";

    if (file.file_name) {
      return file.file_name;
    }

    if (file.file_url) {
      const parts =
        file.file_url.split("/");

      return parts[
        parts.length - 1
      ];
    }

    return "File";
  };

  /*
  |--------------------------------------------------------------------------
  | MESSAGE PREVIEW
  |--------------------------------------------------------------------------
  */

  const renderPreview = (msg) => {
    if (!msg) return null;

    /*
     * TEXT
     */
    if (msg.type === "text") {
      return (
        <p className="text-sm truncate">
          {msg.message}
        </p>
      );
    }

    /*
     * DIRECT IMAGE MESSAGE
     */
    if (
      msg.type === "image" &&
      msg.file
    ) {
      const url =
        getUrl({
          file: msg.file,
          file_url: msg.file_url,
        });

      return (
        <img
          src={url}
          alt=""
          className="w-16 h-16 object-cover rounded-lg"
        />
      );
    }

    /*
     * DIRECT VIDEO MESSAGE
     */
    if (
      msg.type === "video" &&
      msg.file
    ) {
      return (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black flex items-center justify-center">
          <video
            src={getUrl({
              file: msg.file,
              file_url: msg.file_url,
            })}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Play
              className="w-6 h-6 text-white fill-white"
            />
          </div>
        </div>
      );
    }

    /*
     * FILES
     */
    if (
      Array.isArray(msg.files) &&
      msg.files.length > 0
    ) {
      return (
        <div className="flex gap-2 overflow-x-auto">
          {msg.files
            .slice(0, 3)
            .map((file, i) => {
              const url =
                getUrl(file);

              const name =
                getFileName(file);

              return (
                <div
                  key={i}
                  className="rounded-lg overflow-hidden bg-gray-200 relative flex items-center justify-center"
                >
                  {file.type?.startsWith(
                    "image"
                  ) && (
                    <img
                      src={url}
                      alt=""
                      className="w-16 h-16 object-cover"
                    />
                  )}

                  {file.type?.startsWith(
                    "video"
                  ) && (
                    <div className="relative w-16 h-16 bg-black flex items-center justify-center">
                      <video
                        src={url}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />

                      <Play
                        className="absolute w-6 h-6 text-white fill-white"
                      />
                    </div>
                  )}

                  {file.type === "audio" && (
                    <div className="text-sm whitespace-nowrap font-bold text-gray-700">
                      🎵 {name}
                    </div>
                  )}

                  {file.type === "file" && (
                    <div className="text-sm whitespace-nowrap font-bold text-gray-700">
                      📎 {name}
                    </div>
                  )}

                  {file.type === "voice" && (
                    <div className="text-sm whitespace-nowrap font-bold text-gray-700">
                      🎤 Voice Message
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      );
    }

    return null;
  };

  /*
  |--------------------------------------------------------------------------
  | MEDIA MESSAGES FOR REEL
  |--------------------------------------------------------------------------
  */

  const reelMediaMessages =
    useMemo(() => {
      return messages.filter(
        (message) =>
          message?.type === "image" ||
          message?.type === "video"
      );
    }, [messages]);

  /*
  |--------------------------------------------------------------------------
  | OPEN REEL REVIEW
  |--------------------------------------------------------------------------
  */

  const handleOpenReelReview = () => {
    if (!messages.length) {
      toast.error(
        "No message selected"
      );
      return;
    }

    /*
     * Start with the first image/video
     * as the active media.
     */
    if (
      reelMediaMessages.length > 0
    ) {
      setActiveMediaId(
        reelMediaMessages[0].id
      );
    } else {
      setActiveMediaId(null);
    }

    /*
     * Load the original message text
     * as the initial description.
     */
    const initialDescriptions = {};

    reelMediaMessages.forEach(
      (message) => {
        initialDescriptions[
          message.id
        ] =
          message.message || "";
      }
    );

    setReelDescriptions(
      initialDescriptions
    );

    setShowReelReview(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE REEL REVIEW
  |--------------------------------------------------------------------------
  */

  const handleCloseReelReview = () => {
    if (reelLoading) return;

    setShowReelReview(false);
    setActiveMediaId(null);
    setReelDescriptions({});
  };

  /*
  |--------------------------------------------------------------------------
  | CHANGE REEL DESCRIPTION
  |--------------------------------------------------------------------------
  */

  const handleDescriptionChange = (
    messageId,
    value
  ) => {
    setReelDescriptions(
      (prev) => ({
        ...prev,
        [messageId]: value,
      })
    );
  };

  /*
  |--------------------------------------------------------------------------
  | GET ACTIVE MEDIA
  |--------------------------------------------------------------------------
  */

  const activeMedia =
    reelMediaMessages.find(
      (message) =>
        Number(message.id) ===
        Number(activeMediaId)
    ) || null;

  /*
  |--------------------------------------------------------------------------
  | GET MEDIA URL
  |--------------------------------------------------------------------------
  */

  const getMessageMediaUrl = (
    message
  ) => {
    if (!message) return null;

    /*
     * Direct message file
     */
    if (message.file) {
      return getUrl({
        file: message.file,
        file_url:
          message.file_url,
      });
    }

    /*
     * File relation
     */
    if (
      Array.isArray(message.files) &&
      message.files.length
    ) {
      const mediaFile =
        message.files.find(
          (file) =>
            file.type?.startsWith(
              "image"
            ) ||
            file.type?.startsWith(
              "video"
            )
        );

      if (mediaFile) {
        return getUrl(
          mediaFile
        );
      }
    }

    return null;
  };

  /*
  |--------------------------------------------------------------------------
  | SEND REEL
  |--------------------------------------------------------------------------
  */

  const handleAddToReel = async () => {
    if (!messages.length) {
      toast.error(
        "No message selected"
      );
      return;
    }

    if (reelLoading) return;

    const messageIds =
      messages
        .map(
          (message) =>
            message?.id
        )
        .filter(Boolean);

    if (!messageIds.length) {
      toast.error(
        "Unable to find the selected message"
      );
      return;
    }

    /*
     * Build descriptions using
     * message ID as the key.
     */
    const mediaDescriptions = {};

    reelMediaMessages.forEach(
      (message) => {
        mediaDescriptions[
          message.id
        ] =
          reelDescriptions[
            message.id
          ] || "";
      }
    );

    try {
      setReelLoading(true);

      const response =
        await api.post(
          "/api/reels/from-messages",
          {
            message_ids:
              messageIds,

            media_descriptions:
              mediaDescriptions,
          }
        );

      const newReel =
        response.data?.reel ||
        response.data?.post ||
        response.data?.data;

      if (!newReel) {
        throw new Error(
          "Reel was created but no reel data was returned."
        );
      }

      /*
       * Tell parent about new Reel.
       */
      if (onReelAdded) {
        onReelAdded(
          newReel
        );
      }

      toast.success(
        "Added to your Reel status"
      );

      /*
       * Close review.
       */
      setShowReelReview(false);
      setActiveMediaId(null);
      setReelDescriptions({});

      /*
       * Close forwarding modal.
       */
      onClose();

    } catch (error) {
      console.error(
        "ADD TO REEL ERROR:",
        error.response?.data ||
          error
      );

      const message =
        error.response?.data?.message ||
        "Failed to add message to your Reel status";

      toast.error(message);

    } finally {
      setReelLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | NORMAL FORWARD
  |--------------------------------------------------------------------------
  */

  const handleSend = async () => {
    if (
      !Array.isArray(
        selectedTargets
      )
    ) {
      console.error(
        "selectedTargets is NOT array:",
        selectedTargets
      );

      return;
    }

    if (
      selectedTargets.length === 0
    ) {
      toast.error(
        "Please select at least one user or group."
      );

      return;
    }

    /*
     * onSend expects the selected
     * target keys.
     */
    await onSend([
      ...selectedTargets,
    ]);
  };

  const handleMeetingSend = async () => {
    if (
      !Array.isArray(
        selectedTargets
      ) ||
      selectedTargets.length === 0
    ) {
      toast.error(
        "Please select at least one user or group."
      );

      return;
    }

    /*
     * Convert:
     *
     * user-2
     * group-5
     *
     * back into:
     *
     * {
     *   id: 2,
     *   type: "user"
     * }
     *
     * {
     *   id: 5,
     *   type: "group"
     * }
     */
    const selectedTargetObjects =
      allTargets.filter(
        (item) =>
          selectedTargets.includes(
            `${item.__type}-${item.id}`
          )
      );

    if (
      selectedTargetObjects.length ===
      0
    ) {
      toast.error(
        "Unable to find the selected chat or group."
      );

      return;
    }

    /*
     * IMPORTANT:
     * Pass the array.
     *
     * This fixes:
     *
     * Cannot read properties of undefined
     * (reading 'map')
     */
    if (
      typeof handleSendMeeting ===
      "function"
    ) {
      await handleSendMeeting(
        selectedTargetObjects
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | NO MESSAGE
  |--------------------------------------------------------------------------
  */

  if (!messages.length) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
        <div className="bg-white p-5 rounded-xl w-80 text-center shadow-xl">
          <p className="text-gray-500">
            No message selected
          </p>

          <button
            onClick={onClose}
            className="mt-4 text-red-500"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {/* ============================================================= */}
      {/* FORWARD MODAL                                                 */}
      {/* ============================================================= */}

      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[999] px-3">
        <div className="w-[95%] max-w-md bg-white p-4 rounded-2xl shadow-2xl">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">
              Forward ({messages.length})
            </h2>

            <button
              onClick={onClose}
              className="text-red-500 text-xl hover:bg-red-50 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* ========================================================= */}
          {/* ADD TO REEL BUTTON                                        */}
          {/* ========================================================= */}

          <button
            type="button"
            onClick={
              handleOpenReelReview
            }
            disabled={reelLoading}
            className="
              w-full
              mb-4
              rounded-2xl
              p-4
              text-left
              transition-all
              duration-200
              border
              shadow-sm
              bg-gradient-to-r
              from-green-50
              via-blue-50
              to-indigo-50
              border-green-200
              hover:border-green-400
              hover:shadow-md
              active:scale-[0.99]
            "
          >
            <div className="flex items-center gap-3">

              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  shadow-sm
                  bg-gradient-to-br
                  from-green-500
                  to-blue-600
                "
              >
                <Clapperboard
                  className="w-6 h-6 text-white"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900">
                  Add to your Reel status
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  Review this message before adding it to your Reel
                </div>
              </div>
            </div>
          </button>

          {/* ========================================================= */}
          {/* MESSAGE PREVIEW                                           */}
          {/* ========================================================= */}

          <div className="max-h-40 overflow-y-auto scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin mb-3 space-y-2 border p-2 rounded-xl">
            {messages.map(
              (msg) => (
                <div
                  key={msg.id}
                  className="p-2 bg-gray-100 rounded-lg"
                >
                  {renderPreview(
                    msg
                  )}
                </div>
              )
            )}
          </div>

          {/* ========================================================= */}
          {/* SEARCH                                                     */}
          {/* ========================================================= */}

          <input
            type="text"
            placeholder="Search user or group..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="
              w-full
              border
              border-gray-200
              p-2.5
              rounded-xl
              mb-2
              outline-none
              focus:ring-2
              focus:ring-blue-400
            "
          />

          {/* ========================================================= */}
          {/* TARGETS                                                    */}
          {/* ========================================================= */}

          <div className="max-h-52 overflow-y-auto scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin space-y-2">

            {/* LOADING */}
            {isLoading && (
              <>
                {[...Array(6)].map(
                  (_, i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center justify-between p-3 rounded-xl border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300" />

                        <div>
                          <div className="h-3 w-28 bg-gray-300 rounded mb-2" />
                          <div className="h-2 w-16 bg-gray-200 rounded" />
                        </div>
                      </div>

                      <div className="w-5 h-5 rounded-full bg-gray-300" />
                    </div>
                  )
                )}
              </>
            )}

            {/* TARGETS */}
            {!isLoading &&
              filteredTargets.map(
                (item) => {
                  const key =
                    `${item.__type}-${item.id}`;

                  const isSelected =
                    selectedTargets.includes(
                      key
                    );

                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() =>
                        toggleTarget(
                          item
                        )
                      }
                      className={`
                        w-full
                        text-left
                        p-3
                        rounded-xl
                        flex
                        justify-between
                        items-center
                        transition-all
                        duration-200
                        border
                        ${
                          isSelected
                            ? "bg-green-50 border-green-500 shadow-sm"
                            : "bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">

                        {/* AVATAR */}
                        <div
                          className={`
                            w-10
                            h-10
                            rounded-full
                            flex
                            items-center
                            justify-center
                            font-bold
                            text-white
                            shadow-sm
                            ${getColor(
                              item.name
                            )}
                          `}
                        >
                          {getInitial(
                            item.name
                          )}
                        </div>

                        {/* NAME */}
                        <div>
                          <div
                            className={`
                              font-medium
                              ${
                                isSelected
                                  ? "text-green-700"
                                  : "text-gray-900"
                              }
                            `}
                          >
                            {item.name}
                          </div>

                          <div
                            className={`
                              text-xs
                              capitalize
                              ${
                                isSelected
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }
                            `}
                          >
                            {item.__type}
                          </div>
                        </div>
                      </div>

                      {/* CHECK */}
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-gray-300 bg-white" />
                      )}
                    </button>
                  );
                }
              )}

            {/* EMPTY */}
            {!isLoading &&
              filteredTargets.length ===
                0 && (
                <div className="text-center text-gray-500 py-6">
                  No users or groups found
                </div>
              )}
          </div>

          {/* ========================================================= */}
          {/* NORMAL FORWARD BUTTON                                     */}
          {/* ========================================================= */}

          <button
           onClick={handleSend}
            disabled={
              loading ||
              reelLoading ||
              selectedTargets.length === 0
            }
            className={`
              px-4
              py-3
              mt-4
              rounded-xl
              text-white
              w-full
              transition
              ${
                loading ||
                reelLoading ||
                selectedTargets.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            {loading ? (
              <p className="inline-flex gap-2 items-center">
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>

                Forwarding
              </p>
            ) : (
              `Forward (${selectedTargets.length})`
            )}
          </button>
        

                      {showReelReview && (
      
                          <div
                              className="
                                  absolute
                                  inset-0
                                  z-[20]
                                  bg-white
                                  rounded-2xl
                                  flex
                                  flex-col
                                  justify-center 
                                  mx-auto
                                  max-w-xl
                                  text-black

                              "
                          >
      
                              {/* =================================================
                                  REVIEW HEADER
                              ================================================== */}
      
                              <div
                                  className="
                                      flex
                                      items-center
                                      justify-between
                                      px-4
                                      py-3
                                      border-b
                                      text-black
                                      border-gray-200
                                      shrink-0
                                  "
                              >
      
                                  <div>
      
                                      <h3
                                          className="
                                              font-bold
                                              text-base
                                          "
                                      >
                                          Review your Reel
                                      </h3>
      
                                      <p
                                          className="
                                              text-xs
                                              text-gray-500
                                              mt-0.5
                                          "
                                      >
                                          Add descriptions before sharing
                                      </p>
      
                                  </div>
      
      
                                  <button
                                      type="button"
                                      onClick={
                                          handleCloseReelReview
                                      }
                                      disabled={
                                          reelLoading
                                      }
                                      className="
                                          w-9
                                          h-9
                                          rounded-full
                                          flex
                                          items-center
                                          justify-center
                                          hover:bg-gray-100
                                      "
                                  >
      
                                      <X size={19} />
      
                                  </button>
      
                              </div>
      
      
                              {/* =================================================
                                  REEL PREVIEW AREA
                              ================================================== */}
      
                              <div
                                  className="
                                      flex-1
                                      min-h-0
                                      overflow-y-auto
                                      scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                                      px-4
                                      py-4
                                  "
                              >
                                  {reelMediaMessages.length >
                                      0 && (
      
                                      <div
                                          className="
                                              mt-4
                                              flex
                                              gap-2
                                              overflow-x-auto
                                              pb-1
                                              scrollbar-thin
                                          "
                                      >
      
                                          {reelMediaMessages.map(
                                              (message) => {
      
                                                  const isActive =
                                                      Number(
                                                          activeMediaId
                                                      ) ===
                                                      Number(
                                                          message.id
                                                      );
      
                                                  const url =
                                                      getMessageMediaUrl(
                                                          message
                                                      );
      
      
                                                  return (
      
                                                      <button
                                                          type="button"
                                                          key={message.id}
                                                          onClick={() =>
                                                              setActiveMediaId(
                                                                  message.id
                                                              )
                                                          }
                                                          className={`
                                                              relative
                                                              w-16
                                                              h-16
                                                              rounded-xl
                                                              overflow-hidden
                                                              shrink-0
                                                              border-2
                                                              transition
                                                              ${
                                                                  isActive
                                                                      ? "border-pink-500 ring-2 ring-pink-100"
                                                                      : "border-gray-200"
                                                              }
                                                          `}
                                                      >
      
                                                          {message.type ===
                                                          "image" ? (
      
                                                              <img
                                                                  src={url}
                                                                  alt=""
                                                                  className="
                                                                      w-full
                                                                      h-full
                                                                      object-cover
                                                                  "
                                                              />
      
                                                          ) : (
      
                                                              <div
                                                                  className="
                                                                      w-full
                                                                      h-full
                                                                      bg-black
                                                                      relative
                                                                  "
                                                              >
      
                                                                  <video
                                                                      src={url}
                                                                      className="
                                                                          w-full
                                                                          h-full
                                                                          object-cover
                                                                      "
                                                                  />
      
                                                                  <div
                                                                      className="
                                                                          absolute
                                                                          inset-0
                                                                          flex
                                                                          items-center
                                                                          justify-center
                                                                          bg-black/20
                                                                      "
                                                                  >
      
                                                                      <Play
                                                                          size={17}
                                                                          className="text-white"
                                                                          fill="white"
                                                                      />
      
                                                                  </div>
      
                                                              </div>
      
                                                          )}
      
      
                                                          {/* NUMBER */}
      
                                                          <span
                                                              className="
                                                                  absolute
                                                                  bottom-1
                                                                  right-1
                                                                  min-w-5
                                                                  h-5
                                                                  px-1
                                                                  rounded-full
                                                                  bg-black/70
                                                                  text-white
                                                                  text-[9px]
                                                                  font-bold
                                                                  flex
                                                                  items-center
                                                                  justify-center
                                                              "
                                                          >
      
                                                              {reelMediaMessages.findIndex(
                                                                  (item) =>
                                                                      item.id ===
                                                                      message.id
                                                              ) + 1}
      
                                                          </span>
      
                                                      </button>
      
                                                  );
                                              }
                                          )}
      
                                      </div>
      
                                  )}
      
                                  {activeMedia && (
      
                                      <div
                                          className="
                                              w-full
                                              aspect-[9/14]
                                              max-h-[430px]
                                              rounded-2xl
                                              overflow-hidden
                                              bg-black
                                              relative
                                              flex
                                              items-center
                                              justify-center
                                          "
                                      >
      
                                          {activeMedia.type ===
                                              "image" ? (
      
                                              <img
                                                  src={getMessageMediaUrl(
                                                      activeMedia
                                                  )}
                                                  alt=""
                                                  className="
                                                      w-full
                                                      h-full
                                                      object-contain
                                                  "
                                              />
      
                                          ) : (
      
                                              <video
                                                  src={getMessageMediaUrl(
                                                      activeMedia
                                                  )}
                                                  controls
                                                  className="
                                                      w-full
                                                      h-full
                                                      object-contain
                                                  "
                                              />
      
                                          )}
      
      
                                          {/* MEDIA TYPE */}
      
                                          <div
                                              className="
                                                  absolute
                                                  top-3
                                                  left-3
                                                  px-2
                                                  py-1
                                                  rounded-full
                                                  bg-black/60
                                                  text-white
                                                  text-[10px]
                                                  uppercase
                                                  font-bold
                                                  flex
                                                  items-center
                                                  gap-1
                                              "
                                          >
      
                                              {activeMedia.type ===
                                              "image" ? (
      
                                                  <ImageIcon
                                                      size={12}
                                                  />
      
                                              ) : (
      
                                                  <Play
                                                      size={12}
                                                      fill="white"
                                                  />
      
                                              )}
      
                                              {activeMedia.type}
      
                                          </div>
      
                                      </div>
      
                                  )}
      
      
                                  {/* ==========================================
                                      MEDIA SELECTOR
                                  =========================================== */}
      
      
      
                                  {/* ==========================================
                                      ACTIVE MEDIA INFO
                                  =========================================== */}
      
                                  {activeMedia && (
      
                                      <div
                                          className="
                                              mt-3
                                              text-xs
                                              text-gray-500
                                              flex
                                              items-center
                                              justify-between
                                          "
                                      >
      
                                          <span>
                                              Editing description
                                          </span>
      
                                          <span>
                                              {
                                                  reelMediaMessages.findIndex(
                                                      (item) =>
                                                          item.id ===
                                                          activeMedia.id
                                                  ) + 1
                                              }{" "}
                                              /{" "}
                                              {
                                                  reelMediaMessages.length
                                              }
                                          </span>
      
                                      </div>
      
                                  )}
      
      
                                  {/* ==========================================
                                      TEXT-ONLY MESSAGES
                                  =========================================== */}
      
                                  {reelMediaMessages.length === 0 && (
      
                                      <div
                                          className="
                                              rounded-2xl
                                              bg-gray-50
                                              border
                                              border-gray-200
                                              p-4
                                          "
                                      >
      
                                          <div
                                              className="
                                                  w-12
                                                  h-12
                                                  rounded-full
                                                  bg-gradient-to-br
                                                  from-purple-500
                                                  to-pink-500
                                                  text-white
                                                  flex
                                                  items-center
                                                  justify-center
                                                  font-bold
                                                  mx-auto
                                                  mb-3
                                              "
                                          >
                                              T
                                          </div>
      
                                          <p
                                              className="
                                                  text-center
                                                  text-sm
                                                  text-gray-700
                                                  whitespace-pre-wrap
                                                  break-words
                                              "
                                          >
      
                                              {messages
                                                  ?.map(
                                                      (message) =>
                                                          message.message
                                                  )
                                                  .filter(Boolean)
                                                  .join("\n\n")
                                              }
      
                                          </p>
      
                                      </div>
      
                                  )}
      
                              </div>
      
      
                              {/* =================================================
                                  DESCRIPTION COMPOSER
                              ================================================== */}
      
                              <div
                                  className="
                                      border-t
                                      border-gray-200
                                      px-3
                                      py-3
                                      shrink-0
                                      bg-white
                                  "
                              >
      
                                  {activeMedia && (
      
                                      <div
                                          className="
                                              flex
                                              items-end
                                              gap-2
                                          "
                                      >
      
                                          {/* ================================
                                              INPUT
                                          ================================= */}
      
                                          <div
                                              className="
                                                  flex-1
                                                  min-w-0
                                                  border
                                                  border-gray-300
                                                  rounded-2xl
                                                  bg-gray-50
                                                  px-3
                                                  py-2
                                                  focus-within:border-pink-500
                                                  focus-within:ring-2
                                                  focus-within:ring-pink-100
                                                  transition
                                              "
                                          >
      
                                              <textarea
                                                  value={
                                                      reelDescriptions[
                                                          activeMedia.id
                                                      ] || ""
                                                  }
                                                  onChange={(e) =>
                                                      handleDescriptionChange(
                                                          activeMedia.id,
                                                          e.target.value
                                                      )
                                                  }
                                                  placeholder={
                                                      activeMedia.type ===
                                                      "image"
                                                          ? "Add a description for this image..."
                                                          : "Add a description for this video..."
                                                  }
                                                  maxLength={700}
                                                  rows={2}
                                                  className="
                                                      w-full
                                                      bg-transparent
                                                      outline-none
                                                      resize-none
                                                      text-sm
                                                      text-gray-800
                                                      placeholder:text-gray-400
                                                  "
                                              />
      
      
                                              <div
                                                  className="
                                                      text-[10px]
                                                      text-gray-400
                                                      text-right
                                                  "
                                              >
      
                                                  {
                                                      (
                                                          reelDescriptions[
                                                              activeMedia.id
                                                          ] || ""
                                                      ).length
                                                  }
                                                  /700
      
                                              </div>
      
                                          </div>
      
      
                                          {/* ================================
                                              SEND BUTTON
                                          ================================= */}
      
                                          <button
                                              type="button"
                                              onClick={
                                                  handleAddToReel
                                              }
                                              disabled={
                                                  reelLoading
                                              }
                                              className="
                                                  w-11
                                                  h-11
                                                  rounded-full
                                                  shrink-0
                                                  bg-gradient-to-r
                                                  from-purple-600
                                                  via-pink-500
                                                  to-orange-400
                                                  text-white
                                                  flex
                                                  items-center
                                                  justify-center
                                                  shadow-md
                                                  hover:scale-105
                                                  active:scale-95
                                                  transition
                                                  disabled:opacity-60
                                                  disabled:hover:scale-100
                                              "
                                          >
      
                                              {reelLoading ? (
      
                                                  <div
                                                      className="
                                                          w-5
                                                          h-5
                                                          border-2
                                                          border-white
                                                          border-t-transparent
                                                          rounded-full
                                                          animate-spin
                                                      "
                                                  />
      
                                              ) : (
      
                                                  <Send
                                                      size={18}
                                                      fill="white"
                                                  />
      
                                              )}
      
                                          </button>
      
                                      </div>
      
                                  )}
      
      
                                  {/* ==========================================
                                      TEXT ONLY SEND BUTTON
                                  =========================================== */}
      
                                  {!activeMedia && (
      
                                      <div
                                          className="
                                              flex
                                              justify-end
                                          "
                                      >
      
                                          <button
                                              type="button"
                                              onClick={
                                                  handleAddToReel
                                              }
                                              disabled={
                                                  reelLoading
                                              }
                                              className="
                                                  w-11
                                                  h-11
                                                  rounded-full
                                                  bg-gradient-to-r
                                                  from-purple-600
                                                  via-pink-500
                                                  to-orange-400
                                                  text-white
                                                  flex
                                                  items-center
                                                  justify-center
                                                  shadow-md
                                                  hover:scale-105
                                                  active:scale-95
                                                  transition
                                                  disabled:opacity-60
                                              "
                                          >
      
                                              {reelLoading ? (
      
                                                  <div
                                                      className="
                                                          w-5
                                                          h-5
                                                          border-2
                                                          border-white
                                                          border-t-transparent
                                                          rounded-full
                                                          animate-spin
                                                      "
                                                  />
      
                                              ) : (
      
                                                  <Send
                                                      size={18}
                                                      fill="white"
                                                  />
      
                                              )}
      
                                          </button>
      
                                      </div>
      
                                  )}
      
                              </div>
      
                          </div>
      
                      )}
      </div>
      </div>
    </>
  );
}