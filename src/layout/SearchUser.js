import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Api/axios";

export default function SearchUser() {

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================================
     LOAD RECENT SEARCHES
  ================================= */
  useEffect(() => {
    if (searchOpen) {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, [searchOpen]);

  /* ================================
     ESC KEY CLOSE
  ================================= */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => window.removeEventListener("keydown", handleEsc);
  }, [searchOpen]);

  /* ================================
     SEARCH API (DEBOUNCE)
  ================================= */
  useEffect(() => {

    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/search-users?q=${query}`);
        setResults(res.data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delay);

  }, [query]);

  /* ================================
     SAVE RECENT SEARCH
  ================================= */
  const handleRecentSearch = (user) => {

    let updated = [
      user,
      ...recentSearches.filter(r => r.id !== user.id)
    ];

    updated = updated.slice(0, 5);

    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const removeRecent = (id) => {
    const updated = recentSearches.filter(r => r.id !== id);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  /* ================================
     COMPONENT UI
  ================================= */
  return (
    <>
      {/* SEARCH BUTTON */}
      <div>
        <div className="relative lg:block hidden">
          <input
            onClick={() => setSearchOpen(true)}
            placeholder="Search"
            readOnly
            className="border px-7 cursor-pointer focus:border-gray-300 outline-none text-black border-gray-400 h-9 w-60 rounded-lg"
          />
          <Search
            onClick={() => setSearchOpen(true)}
            className="cursor-pointer absolute left-1 top-2 w-5 h-5 text-gray-400"
          />
        </div>

        <Search
          onClick={() => setSearchOpen(true)}
          className="cursor-pointer w-8 h-8 text-gray-400 block sm:hidden"
        />
      </div>

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex flex-col"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="bg-white w-full h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="p-4 border-b relative shadow-sm">
              <input
                placeholder="Search users..."
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border w-full px-4 py-3 rounded-xl 
                focus:ring-2 focus:ring-blue-500
                outline-none text-black border-gray-300"
              />

              <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          onClick={() => setSearchOpen(false)}
          className="w-6 h-6 absolute right-8 rotate-180 top-7 text-gray-600 cursor-pointer hover:text-black transition"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto">

              {/* ======================
                  RECENT SEARCHES
              ======================= */}
              {!query && recentSearches.length > 0 && (
                <div className="p-4">

                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">
                      Recent Searches
                    </h3>

                    <button
                      onClick={clearAllRecent}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>

                  {recentSearches.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 
                      hover:bg-gray-50 rounded-lg transition"
                    >
                      <Link
                        to={`/profile/${r.id}`}
                        onClick={() => {
                          handleRecentSearch(r);
                          setSearchOpen(false);
                        }}
                        className="flex items-center gap-3 flex-1"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          {r.image ? (
                            <img
                              src={r.image}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                              {r.name?.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-black">{r.name}</p>
                          <p className="text-xs text-gray-500">{r.role}</p>
                        </div>
                      </Link>

                      <button
                        onClick={() => removeRecent(r.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ======================
                  SEARCH RESULTS
              ======================= */}
              {query && (
                <>
                  {loading && (
                    <p className="text-center text-gray-500 mt-6">
                      Searching...
                    </p>
                  )}

                  {!loading && results.length === 0 && (
                    <p className="text-center text-gray-500 mt-6">
                      No users found
                    </p>
                  )}

                  {!loading && results.map((r) => (
                    <Link
                      to={`/profile/${r.id}`}
                      key={r.id}
                      onClick={() => {
                        handleRecentSearch(r);
                        setSearchOpen(false);
                      }}
                      className="flex items-center gap-4 p-4 border-b 
                      hover:bg-gray-50 transition duration-200 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                        {r.image ? (
                          <img
                            src={r.image}
                            alt={r.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-bold">
                            {r.name?.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-black group-hover:text-blue-600">
                          {r.name}
                        </p>
                        <p className="text-xs text-gray-500">{r.role}</p>
                      </div>
                    </Link>
                  ))}
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}