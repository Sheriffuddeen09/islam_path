import {
  useEffect,
  useState
} from "react";
import {
  CheckCircle,
  Circle,
  Loader2
} from "lucide-react";

import api from "../../Api/axios";

export default function CreateCommunityModal({

  chats = [],
  onClose,
  loadingUsers,

}) {

  const [step, setStep] =
    useState(1);
  const [search, setSearch] =
    useState("");
  const [selectedUsers,
    setSelectedUsers] =
    useState([]);

  const [communityName,
    setCommunityName] =
    useState("");

  const [communityImage,
    setCommunityImage] =
    useState(null);

  const [preview, setPreview] =
    useState(null);

  const [description,
    setDescription] =
    useState("");

  const [onlyAdminCanSend,
    setOnlyAdminCanSend] =
    useState(true);

  const [createLoading,
    setCreateLoading] =
    useState(false);

  useEffect(() => {

    if (!communityImage) return;

    const url =
      URL.createObjectURL(
        communityImage
      );

    setPreview(url);

    return () =>
      URL.revokeObjectURL(url);

  }, [communityImage]);


  const toggleUser = (user) => {

    setSelectedUsers(prev => {

      const exists =
        prev.find(
          u => u.id === user.id
        );

      if (exists) {

        return prev.filter(
          u => u.id !== user.id
        );
      }

      return [...prev, user];
    });
  };

  const removeUser = (id) => {

    setSelectedUsers(prev =>
      prev.filter(
        u => u.id !== id
      )
    );
  };

  const filteredUsers =
  chats.filter(chat => {

    const user =
      chat.user ||
      chat.receiver ||
      chat.other_user;

    if (!user) return false;

    return `${user.first_name} ${user.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase());

  });


  const colors = [

    "bg-orange-500",

    "bg-blue-500",

    "bg-green-500",

    "bg-purple-500",

    "bg-pink-500",
  ];

  const getColor = (name = "") => {

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


  const createCommunity =
  async () => {

    if (
      !communityName.trim()
    ) return;

    const formData =
      new FormData();

    formData.append(
      "community_name",
      communityName
    );

    formData.append(
      "community_description",
      description
    );

    formData.append(
      "only_admin_can_message",
      onlyAdminCanSend
        ? 1
        : 0
    );

    selectedUsers.forEach(
      user => {

      formData.append(
        "users[]",
        user.id
      );

    });

    if (
      communityImage instanceof File
    ) {

      formData.append(
        "community_image",
        communityImage
      );
    }

    setCreateLoading(true);

    try {

      await api.post(
                "/api/communities/create",
                formData,
                {
                    headers: {
                    "Content-Type": "multipart/form-data",
                    },
                }
        );

      onClose();

    } catch (err) {

      console.log(
        err.response?.data ||
        err.message
      );

    } finally {

      setCreateLoading(false);
    }
  };


  const groupedSelected =
    selectedUsers.reduce(
      (acc, user) => {

      const letter =
        user.first_name
          .charAt(0)
          .toUpperCase();

      if (!acc[letter]) {

        acc[letter] = [];
      }

      acc[letter].push(user);

      return acc;

    }, {}
  );

  return (

    <div className="fixed inset-0 z-[99999] p-3 bg-[var(--bg-color)]/40 backdrop-blur-md text-white overflow-auto">

      {step === 1 && (

        <div className=" relative p-4 w-full max-w-md flex h-full shadow-md rounded-lg overflow-auto-y flex-col mx-auto bg-[var(--bg-color)]
         text-[var(--text-color)]">

          <div className="flex items-center gap-3 mb-4">

            <button
              onClick={onClose}
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            </button>

            <h2 className="font-bold text-lg">

              New Community

            </h2>

          </div>

          {/* SEARCH */}
          <input
            value={search}
            onChange={e =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search people..."
            className="w-full h-12 rounded-full bg-[var(--bg-color)] 
            border-gray-500 border
            text-[var(--text-color)] px-4 outline-none"
          />

          {/* SELECTED */}
          <div className="flex gap-3 overflow-x-auto my-4">

            {selectedUsers.map(
              user => (

              <div
                key={user.id}
                className="relative text-center"
              >

                <div
                  className={`w-12 h-12 rounded-full flex items-center  text-white justify-center font-bold ${getColor(
                    user.first_name
                  )}`}
                >

                  {getInitial(
                    user.first_name
                  )}

                </div>

                <button
                  onClick={() =>
                    removeUser(
                      user.id
                    )
                  }
                  className="absolute top-1 text-white text-center flex items-center right-1 bg-gray-700 mx-auto rounded-full p-0.5 text-xs"
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                </button>

                <p className="text-xs mt-1">

                  {user.first_name}

                </p>

              </div>
            ))}

          </div>

          {/* USERS */}
          <div>

            {loadingUsers ? (

                Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="animate-pulse h-16 bg-[#202C33] rounded-xl mb-3"
                />
                ))

            ) : filteredUsers.length === 0 ? (

                /* 🚫 NO DATA STATE */
                <div className="flex flex-col items-center justify-center py-10 text-center">

                <div className="w-28 h-28 rounded-full border-4 border-green-200 flex items-center justify-center mb-6">

            <div className="w-20 h-20 rounded-full border-2 border-gray-400 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                  className="w-10 h-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 0 0 3.742-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.75m12 0a5.971 5.971 0 0 0-.94-3.197M6 18.75a5.971 5.971 0 0 1 .94-3.197m0 0A5.995 5.995 0 0 1 12 13.5a5.995 5.995 0 0 1 5.06 2.053M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                  />
                </svg>

            </div>
            </div>
                <div className="text-xl font-semibold mb-3">
                    No chat users
                </div>

                <p className="text-sm mb-10">
                    Start a chat first to create a community
                </p>

                 <button
                    onClick={onClose}
                    className="text-green-500 font-semibold text-sm hover:underline"
                >
                    View all chats
                </button>

                </div>

            ) : (


              filteredUsers.map(chat => {

                const user =
                    chat.user ||
                    chat.receiver ||
                    chat.other_user;

                const selected =
                  selectedUsers.find(
                    u =>
                      u.id ===
                      user.id
                  );

                return (

                  <div
                    key={chat.id}
                    onClick={() =>
                      toggleUser(
                        user
                      )
                    }
                    className="flex items-center justify-between p-3 border-b border-gray-700 cursor-pointer"
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold ${getColor(
                          user.first_name
                        )}`}
                      >

                        {getInitial(
                          user.first_name
                        )}

                      </div>

                      <p>

                        {
                          user.first_name
                        }{" "}
                        {
                          user.last_name
                        }

                      </p>

                    </div>

                    {selected ? (

                      <CheckCircle
                        width={20}
                      />

                    ) : (

                      <Circle
                        width={20}
                      />
                    )}

                  </div>
                );
              })
            )}

          </div>

          {/* NEXT */}
         
          {selectedUsers.length >
            0 && (

            <button
              onClick={() =>
                setStep(2)
              }
              className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center text-white text-xl"
            >

              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
</svg>


            </button>
          )}

        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (

         <div className=" relative p-4 w-full max-w-md flex h-full shadow-sm rounded-lg overflow-auto-y flex-col mx-auto bg-[var(--bg-color)]
         text-[var(--text-color)]">


          {/* HEADER */}
          <div className="flex items-center gap-3 mb-5">

            <button
              onClick={() =>
                setStep(1)
              }
            >

              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
</svg>


            </button>

            <h2 className="font-bold text-lg">

              Community Info

            </h2>

          </div>

          {/* IMAGE */}
          <div className="flex items-center gap-4 mb-5">

            <label className="cursor-pointer">

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={e =>
                  setCommunityImage(
                    e.target.files[0]
                  )
                }
              />

              {preview ? (

                <img
                  src={preview}
                  className="w-16 h-16 rounded-full object-cover"
                />

              ) : (

                <div className="w-16 h-16 rounded-full bg-[#202C33] text-white flex items-center justify-center">

                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>


                </div>
              )}

            </label>

            <input
              value={communityName}
              onChange={e =>
                setCommunityName(
                  e.target.value
                )
              }
              placeholder="Community name"
              className="flex-1 h-12 rounded-xl bg-[var(--bg-color)] text-[var(--text-color)] 
              border border-gray-500
              px-4 outline-none"
            />

          </div>

          {/* DESCRIPTION */}
          <textarea
            value={description}
            onChange={e =>
              setDescription(
                e.target.value
              )
            }
            placeholder="Community description"
            className="w-full h-28 rounded-xl bg-[var(--bg-color)] text-[var(--text-color)] 
            border border-gray-500
            p-4 outline-none resize-none"
          />

          {/* PERMISSION */}
          <div className="flex justify-between text-[var(--text-color)] items-center mt-5">

            <span>

              Only admins can message

            </span>

            <div
              onClick={() =>
                setOnlyAdminCanSend(
                  !onlyAdminCanSend
                )
              }
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                onlyAdminCanSend
                  ? "bg-[#25D366] border-[#25D366]"
                  : "border-gray-400"
              }`}
            >

              {onlyAdminCanSend &&
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                }

            </div>

          </div>

          {/* MEMBERS */}
          <div className="mt-6">

            <p className="text-[var(--text-color)] mb-4">

              Members: {
                selectedUsers.length
              }

            </p>

            {Object.keys(
              groupedSelected
            ).map(letter => (

              <div
                key={letter}
                className="mb-5"
              >

                <p className="text-[var(--text-color)] font-bold mb-2">

                  {letter}

                </p>

                {groupedSelected[
                  letter
                ].map(user => (

                  <div
                    key={user.id}
                    className="flex items-center justify-between py-2"
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold ${getColor(
                          user.first_name
                        )}`}
                      >

                        {getInitial(
                          user.first_name
                        )}

                      </div>

                      <span className="text-[var(--text-color)]">

                        {
                          user.first_name
                        }

                      </span>

                    </div>

                    <button
                      onClick={() =>
                        removeUser(
                          user.id
                        )
                      }
                      className="text-red-400"
                    >

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>


                    </button>

                  </div>
                ))}

              </div>
            ))}

          </div>

          {/* CREATE */}
          <button
            onClick={
              createCommunity
            }
            className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center"
          >

            {createLoading ? (

              <Loader2 className="animate-spin text-white" />

            ) : (

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>

            )}

          </button>

        </div>
      )}

    </div>
  );
}