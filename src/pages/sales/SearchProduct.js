import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../Api/axios";

export default function SearchProduct({ onCategorySelect = () => {}, searchOpen, setSearchOpen, query, setQuery }) {
  
  const [results, setResults] = useState({ products: [], categories: [] });
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  // Load recent searches when opening modal
  useEffect(() => {
    if (searchOpen) {
      const saved = localStorage.getItem("recentSearches");
      if (saved) setRecentSearches(JSON.parse(saved));
    }
  }, [searchOpen]);

  // Close modal on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    if (searchOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [searchOpen]);

  // Search API call
  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], categories: [] });
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/product-search?q=${query}`);
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

  // Handle recent searches
  const handleRecentSearch = (item) => {
    const updated = [item, ...recentSearches.filter(r => r.id !== item.id)].slice(0, 10);
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

  

  // Handle category click
  const handleCategoryClick = (cat) => {
    if (onCategorySelect) onCategorySelect(cat);
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Search Input */}
      

      {/* Modal */}
        <div
        className="relative mb-4 w-full h-full overflow mx-auto"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="relative bg-white w-full flex-1 h-full shadow-lg rounded-lg p-4 animate-slideIn  flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="relative">
            <input
                type="text"
                autoFocus
                placeholder="Search products or categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black text-xl"
            >
                <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          onClick={() => setSearchOpen(false)}
          className="w-6 h-6 rotate-180 text-gray-600 cursor-pointer hover:text-black transition"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
            </button>
            </div>

            {/* Recent Searches */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!query && recentSearches.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-black">Recent Searches</p>
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
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition"
                  >
                    <Link
                      to={`/product/${r.id}`}
                      onClick={() => handleRecentSearch(r)}
                      className="flex items-center gap-3 flex-1"
                    >
                      <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden">
                        {r.image ? (
                          <img src={r.image} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                            {r.title?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <p className="text-black font-medium">{r.title}</p>
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

            {/* Search Results */}
            {query && (
              <div>
                {loading && <p className="text-center text-gray-500 mt-4">Searching...</p>}

                {!loading &&
                  results.products.length === 0 &&
                  results.categories.length === 0 && (
                    <p className="text-center text-gray-500 mt-4">No results found</p>
                  )}

                {/* Categories */}
                {results.categories.length > 0 && (
                  <div className="mb-4">
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

                {/* Products */}
                {results.products.length > 0 && (
                  <div>
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
              </div>
            )}
          </div>
          </div>
        </div>
    

      {/* Slide-in animation */}
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slideIn { animation: slideIn 0.25s ease-out; }
        `}
      </style>
    </>
  );
}