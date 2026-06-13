import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../../Api/axios";

import { toast } from "react-hot-toast";

import {
  Loader2,
  X,
} from "lucide-react";

export default function AddCommunityMemberModal({
  communityId,
  onClose,
  setActiveCommunity
}) {

  const [chatUsers, setChatUsers] =
    useState([]);

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [loadingId, setLoadingId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const colors = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  const getColor = (
    name = ""
  ) => {

    const index =
      name.charCodeAt(0) %
      colors.length;

    return colors[index];

  };

  const getInitial = (
    name
  ) => {

    if (!name) return "?";

    return name
      .charAt(0)
      .toUpperCase();

  };

  useEffect(() => {

    if (!communityId) return;

    const fetchUsers =
      async () => {

        try {

          setLoadingUsers(
            true
          );

          const {
            data,
          } = await api.get(

            `/api/communities/${communityId}/available-members`

          );

          setChatUsers(
            data.users || []
          );

        } catch (err) {

          console.error(err);

          toast.error(

            "Failed to load users"

          );

        } finally {

          setLoadingUsers(
            false
          );

        }

      };

    fetchUsers();

  }, [communityId]);

  const filteredUsers =
    useMemo(() => {

      let list = [
        ...chatUsers,
      ];

      if (search) {

        list = list.filter(
          (user) => {

            const name = `${

              user.first_name

            } ${

              user.last_name

            }`
              .toLowerCase();

            return name.includes(

              search.toLowerCase()

            );

          }
        );

      }

      return list;

    }, [
      chatUsers,
      search,
    ]);

  const addMember =
    async (userId) => {

      try {

        setLoadingId(
          userId
        );

        const { data } = await api.post(
          `/api/communities/${communityId}/add-member`,
          {
            user_id: userId,
          }
        );

        toast.success(data.message);

        setChatUsers((prev) =>
          prev.filter((u) => u.id !== userId)
        );

        setActiveCommunity((prev) => {

          if (!prev) return prev;

          return {
            ...prev,

            members: [

              ...(prev.members || []),

              {
                ...data.member,

                pivot: {
                  role: "member",
                  membership_status:
                    "approved",
                },
              },

            ],

          };

        });
      } catch (err) {

        console.error(err);

        toast.error(

          "Failed to add member"

        );

      } finally {

        setLoadingId(
          null
        );

      }

    };

  return (

    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50">

      <div className="bg-white w-80 rounded-lg shadow-lg flex flex-col max-h-[500px]">

        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b">

          <h3 className="font-bold text-lg">

            Add Members

          </h3>

          <button
            onClick={
              onClose
            }
            className="p-1 rounded hover:bg-gray-100"
          >

            <X
              size={22}
            />

          </button>

        </div>

        {/* SEARCH */}
        <div className="p-4 border-b">

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(
              e
            ) =>

              setSearch(
                e.target
                  .value
              )

            }
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        {/* USERS */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">

          {loadingUsers ? (

            Array.from({
              length: 5,
            }).map(
              (
                _,
                index
              ) => (

                <div
                  key={
                    index
                  }
                  className="flex items-center justify-between py-2 animate-pulse"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-gray-200" />

                    <div className="h-4 w-28 bg-gray-200 rounded" />

                  </div>

                  <div className="h-8 w-16 rounded bg-gray-200" />

                </div>
              )
            )

          ) : filteredUsers.length ===
            0 ? (

            <div className="flex items-center justify-center py-10 text-sm text-gray-400">

              No users found

            </div>

          ) : (

            filteredUsers.map(
              (
                user
              ) => (

                <div
                  key={
                    user.id
                  }
                  className="flex items-center justify-between py-2 border-b"
                >

                  <div className="flex items-center gap-3">

                    {user.profile_photo ? (

                      <img
                        src={
                          user.profile_photo
                        }
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />

                    ) : (

                      <div
                        className={`

                          w-10
                          h-10
                          rounded-full
                          flex
                          items-center
                          justify-center
                          text-white
                          font-bold

                          ${getColor(
                            user.first_name
                          )}

                        `}
                      >

                        {getInitial(
                          user.first_name
                        )}

                      </div>

                    )}

                    <span className="text-sm font-medium">

                      {
                        user.first_name
                      }{" "}

                      {
                        user.last_name
                      }

                    </span>

                  </div>

                  <button
                    onClick={() =>

                      addMember(
                        user.id
                      )

                    }
                    disabled={
                      loadingId ===
                      user.id
                    }
                    className={`

                      px-4
                      py-1.5
                      rounded-lg
                      text-sm
                      font-medium

                      ${
                        loadingId ===
                        user.id

                          ? `
                            bg-gray-300
                            text-gray-600
                          `

                          : `
                            bg-blue-600
                            text-white
                            hover:bg-blue-700
                          `
                      }

                    `}
                  >

                    {loadingId ===
                    user.id ? (

                      <span className="flex items-center gap-1">

                        <Loader2 className="w-4 h-4 animate-spin" />

                        Adding

                      </span>

                    ) : (

                      "Add"

                    )}

                  </button>

                </div>
              )
            )

          )}

        </div>

      </div>

    </div>

  );

}