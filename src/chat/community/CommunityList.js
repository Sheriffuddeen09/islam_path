// CommunitySidebar.jsx

export default function CommunityList({

  communities,
  activeCommunity,
  setActiveCommunity,
  onClose,
  loading,

}) {

  const colors = [

    "bg-orange-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",

  ];

  const getColor = (name = "") => {

    if (!name) return colors[0];

    const index =
      name.charCodeAt(0) %
      colors.length;

    return colors[index];
  };

  const getInitial = (name = "") => {

    if (!name) return "?";

    return name
      .charAt(0)
      .toUpperCase();
  };

  const getLastMessage = (community) => {

    if (!community.last_message)
      return "No messages yet";

    if (
      community.last_message.message
    ) {
      return community.last_message.message;
    }

    switch (
      community.last_message.type
    ) {

      case "image":
        return "📷 Photo";

      case "video":
        return "🎥 Video";

      case "voice":
        return "🎤 Voice message";

      case "audio":
        return "🎵 Audio";

      case "file":
        return "📄 File";

      default:
        return "Start Conservation";
    }
  };

  const formatTime = (date) => {

  if (!date) return "";

  const now = new Date();

  const messageDate =
    new Date(date);

  const isToday =
    now.toDateString() ===
    messageDate.toDateString();

  const yesterday =
    new Date();

  yesterday.setDate(
    now.getDate() - 1
  );

  const isYesterday =
    yesterday.toDateString() ===
    messageDate.toDateString();

  // ✅ TODAY → 7:00 AM
  if (isToday) {

    return messageDate
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(" ", "");
  }

  // ✅ YESTERDAY
  if (isYesterday) {

    return "Yesterday";
  }

  // ✅ SAME WEEK → Monday
  const diffTime =
    now - messageDate;

  const diffDays =
    diffTime /
    (1000 * 60 * 60 * 24);

  if (diffDays < 7) {

    return messageDate
      .toLocaleDateString([], {
        weekday: "long",
      });
  }

  // ✅ OLD → 12/05/2026
  return messageDate
    .toLocaleDateString([], {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
};

 
  const getImage = (image) => {

    if (!image) return null;

    // ✅ already full url
    if (
      image.startsWith("http")
    ) {
      return image;
    }

    // ✅ storage image
    return `http://localhost:8000/storage/${image}`;
  };

  return (

    <div className="w-full md:w-[340px] border-r border-gray-700 bg-[var(--bg-color)] text-[var(--text-color)] flex flex-col">

      {/* HEADER */}
      <div className="h-16 px-4 border-b border-gray-700 flex items-center justify-between">

        <button
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </button>

        <h2 className="font-bold text-xl">

          Channel

        </h2>

      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (

          <div className="p-3">

            {Array.from({
              length: 8
            }).map((_, i) => (

              <div
                key={i}
                className="flex items-center gap-3 p-3 animate-pulse"
              >

                <div className="w-14 h-14 rounded-full bg-[#202c33]" />

                <div className="flex-1">

                  <div className="h-4 w-32 rounded bg-[#202c33] mb-2" />

                  <div className="h-3 w-48 rounded bg-[#202c33]" />

                </div>

              </div>
            ))}

          </div>

        ) : communities.length === 0 ? (

          <div className="flex items-center justify-center h-full text-gray-400 p-6 text-center">

            No communities found

          </div>

        ) : (

          communities.map(
            community => {

              const isActive =
                activeCommunity?.id ===
                community.id;

              return (

                <button
                  key={community.id}

                  onClick={() =>
                    setActiveCommunity(
                      community
                    )
                  }

                  className={`

                    w-full
                    p-4
                    flex
                    gap-3
                    transition-all
                    duration-200

                    ${
                      isActive
                        ? `
                          border-l-4
                          border-blue-500
                          hover:border-r-4
                        `
                        : `
                          border-transparent
                          border-r-4
                          hover:border-blue-400
                        `
                    }

                  `}
                >

                  {/* ===================================
                      IMAGE / FALLBACK
                  =================================== */}

                  <div className="relative flex-shrink-0">

                    {community.community_image ? (

                      <img

                        src={getImage(
                          community.community_image
                        )}

                        alt={
                          community.community_name
                        }

                        className="

                          w-14
                          h-14
                          rounded-full
                          object-cover

                        "

                        onError={(e) => {

                          e.target.style.display =
                            "none";

                          if (
                            e.target.nextSibling
                          ) {
                            e.target.nextSibling.style.display =
                              "flex";
                          }
                        }}

                      />

                    ) : null}

                    {/* FALLBACK */}
                    <div

                      className={`

                        w-14
                        h-14
                        rounded-full
                        items-center
                        justify-center
                        text-white
                        font-bold
                        text-lg

                        ${getColor(
                          community.community_name
                        )}

                        ${
                          community.community_image
                            ? "hidden"
                            : "flex"
                        }

                      `}
                    >

                      {getInitial(
                        community.community_name
                      )}

                    </div>

                  </div>

                  <div className="flex-1 min-w-0 text-left">

                    {/* TOP */}
                    <div className="flex items-center justify-between gap-2">

                      <h2 className="font-semibold truncate">

                        {
                          community.community_name
                        }

                      </h2>

                      <span className="text-xs text-gray-500 whitespace-nowrap">

                        {formatTime(
                          community.last_message?.created_at
                        )}

                      </span>

                    </div>

                    {/* LAST MESSAGE */}
                    <p className="text-sm text-gray-400 line-clamp-1 mt-1">

                      {getLastMessage(
                        community
                      )}

                    </p>

                    {/* BOTTOM */}
                    <div className="flex items-center justify-between mt-2">
                      {community.unread_count >
                        0 && (

                        <div className="min-w-[20px] h-5 px-1 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">

                          {
                            community.unread_count
                          }

                        </div>

                      )}

                    </div>

                  </div>

                </button>
              );
            }
          )
        )}

      </div>

    </div>
  );
}