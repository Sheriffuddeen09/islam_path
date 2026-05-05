import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MemberSearch({
  members = [],
  getColor,
  getInitial,
  showMemberSearchModal,
  setShowMemberSearchModal,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); // ✅ NEW

  // ✅ FILTER MEMBERS
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;

    return members.filter((member) => {
      const name =
        `${member.first_name || ""} ${member.last_name || ""}`.toLowerCase();

      return name.includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, members]);

  return (
    <>
      {/* 🔍 BUTTON */}
      <button
        onClick={() => setShowMemberSearchModal(true)}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <Search size={20} />
      </button>

      {/* ✅ MODAL */}
      {showMemberSearchModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-md h-[500px] rounded-xl shadow-lg flex flex-col">

            {/* HEADER */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-lg">Search Members</h2>
              <button onClick={() => setShowMemberSearchModal(false)}>✕</button>
            </div>

            {/* INPUT */}
            <div className="p-3 border-b">
              <input
                type="text"
                placeholder="Search member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* RESULTS */}
            <div className="flex-1 overflow-y-auto">

              {filteredMembers.length === 0 ? (
                <p className="text-center text-gray-400 p-5">
                  No members found
                </p>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 p-3 hover:bg-gray-100 transition"
                  >

                    {/* LEFT SIDE */}
                    <div className="flex items-center gap-3">

                      {/* AVATAR */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getColor(
                          member.first_name
                        )}`}
                      >
                        {getInitial(member.first_name)}
                      </div>

                      {/* NAME */}
                      <div>
                        <p className="font-medium">
                          {member.first_name} {member.last_name}
                        </p>
                      </div>

                    </div>

                    {/* ✅ VIEW PROFILE BUTTON */}
                    <button
                      onClick={() => {
                        setShowMemberSearchModal(false);
                        navigate(`/profile/${member.id}`); // 🔥 GO TO PROFILE
                      }}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      View
                    </button>

                  </div>
                ))
              )}

            </div>

          </div>
        </div>
      )}
    </>
  );
}