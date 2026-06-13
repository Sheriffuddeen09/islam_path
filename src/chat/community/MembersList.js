import { useState } from "react";
import { Link } from "react-router-dom";

export default function MembersList({ activeCommunity, currentUser }) {
  const [showMoreModal, setShowMoreModal] = useState(false);

  const members = activeCommunity.members || [];

  const visibleMembers = members.slice(0, 2);
  const hiddenMembers = members.slice(2);

  const colors = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500"
  ];

  const getColor = (name = "") => {
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  }; 


  return (
    <div className="mt-2 mx-auto flex flex-col justify-center flex-1 items-center">

     <div className="inline-flex items-center flex-wrap gap-2">

  {visibleMembers.map((user, index) => {
    const isYou = user.id === currentUser.id;
    const isLastVisible =
      index === visibleMembers.length - 1;

    return (
      <div
        key={user.id}
        className="inline-flex items-start gap-2"
      >

        {/* Avatar */}
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${getColor(
            user.first_name
          )}`}
        >
          {getInitial(user.first_name)}
        </div>

        {/* Name + Role */}
        <div className="flex flex-col">

          {/* Name and +N */}
          <div className="inline-flex items-center gap-2">

            <span className="font-medium text-sm">
              {isYou ? "You" : user.first_name}
            </span>

            {/* Show +N beside last visible member */}
            {isLastVisible &&
              hiddenMembers.length > 0 && (
                <button
                  onClick={() =>
                    setShowMoreModal(true)
                  }
                  className="
                    text-sm
                    text-blue-400
                    hover:underline
                  "
                >
                  +{hiddenMembers.length}
                </button>
              )}

          </div>

          {/* Role */}
          <span className="text-xs -translate-y-1 text-gray-400">
            {user.pivot?.role}
          </span>

        </div>

      </div>
    );
  })}

</div>
      {/* MODAL */}
      {showMoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-5">

            <h2 className="text-lg font-semibold mb-4">
              All Members
            </h2>

            <div className="max-h-80 overflow-y-auto">

              {members.map((user) => {
                const isYou = user.id === currentUser.id;

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-3 border-b border-gray-700"
                  >
                    <div>
                      <p>
                        {isYou
                          ? "You"
                          : `${user.first_name} ${user.last_name}`}
                      </p>

                      <p className="text-xs text-gray-400">
                        {user.pivot?.role}
                      </p>
                    </div>

                    {/* PROFILE LINK */}
                    <Link
                      to={`/profile/${user.id}`}
                      onClick={() => setShowMoreModal(false)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      View Profile
                    </Link>
                  </div>
                );
              })}

            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowMoreModal(false)}
              className="mt-4 w-full py-2 rounded-lg bg-gray-200 dark:bg-gray-800"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}