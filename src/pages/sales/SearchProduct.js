import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../Api/axios";

export default function SearchProduct() {

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
  products: [],
  categories: [],
    });
  const [recentSearches, setRecentSearches] = useState(() => {
  const saved = localStorage.getItem("recentSearches");
  return saved ? JSON.parse(saved) : [];
});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (searchOpen) {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, [searchOpen]);

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
  
  
  useEffect(() => {
  if (!query.trim()) {
    setResults({ products: [], categories: [] });
    return;
  }

  const delay = setTimeout(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/search?q=${query}`);

      setResults({
        products: res.data.products || [],
        categories: res.data.categories || [],
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, 500);

  return () => clearTimeout(delay);
}, [query]);


  const loadRecentSearches = () => {
  const saved = localStorage.getItem("recentSearches");
  if (saved) {
    setRecentSearches(JSON.parse(saved));
  }
};

  useEffect(() => {
  if (searchOpen) {
    loadRecentSearches();
  }
}, [searchOpen]);

const handleCategoryClick = (cat) => {
  // switch category globally (important)
  window.dispatchEvent(
    new CustomEvent("selectCategory", { detail: cat })
  );

  setSearchOpen(false);
  setQuery("");
};

  const handleRecentSearch = (user) => {
  let updated = [user, ...recentSearches.filter(r => r.id !== user.id)];
  updated = updated.slice(0, 10); // limit to 10

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

  const openSearchModal = () => {
  const saved = localStorage.getItem("recentSearches");
  if (saved) {
    setRecentSearches(JSON.parse(saved));
  }
  setQuery(""); // reset input
  setSearchOpen(true);
};

  return (
    <>
      <div>
        <input
            type="text"
            placeholder="Search products..."
            className="border p-2 rounded-lg w-full mb-4"
             onClick={openSearchModal}
        />
      </div>

      {searchOpen && (
        <div className="fixed right-0 top-0 bg-white h-full backdrop-blur-sm z-[9999] w-full flex flex-col"
          onClick={() => setSearchOpen(false)}
        >
        <div className="relative bg-white h-full shadow-lg p-4 overflow-y-auto z-[10000] 
        animate-slideIn w-full h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
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
            <div className="flex-1 overflow-y-auto">
              {!query && recentSearches.length > 0 && (
                <div className="p-4">

                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-black">
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
              
              {query && (
  <>
    {loading && (
      <p className="text-center text-gray-500 mt-6">Searching...</p>
    )}

    {!loading &&
      results.products.length === 0 &&
      results.categories.length === 0 && (
        <p className="text-center text-gray-500 mt-6">
          No results found
        </p>
      )}

    {/* ✅ CATEGORY RESULTS */}
    {results.categories.length > 0 && (
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-2">Categories</p>

        {results.categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleCategoryClick(cat)}
            className="p-3 hover:bg-gray-100 cursor-pointer rounded-lg"
          >
            <p className="font-semibold text-black">{cat.name}</p>
            <p className="text-xs text-gray-500">
              {cat.type === "parent" ? "Category" : "Sub Category"}
            </p>
          </div>
        ))}
      </div>
    )}

    {/* ✅ PRODUCT RESULTS */}
    {results.products.length > 0 && (
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-2">Products</p>

        {results.products.map((p) => (
          <Link
            to={`/product/${p.id}`}
            key={p.id}
            onClick={() => setSearchOpen(false)}
            className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg"
          >
            <img
              src={p.image}
              className="w-12 h-12 object-cover rounded"
            />
            <p className="font-medium text-black">{p.title}</p>
          </Link>
        ))}
      </div>
    )}
  </>
)}

            </div>
          </div>
        </div>
      )}
    </>
  );
}