import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../Api/axios";
import { Link } from "react-router-dom";

export default function SearchUser () {

    const [ searchOpen, setSearchOpen] = useState(false)
    const [ query, setQuery ] = useState("")
    const [ results, setResults ] = useState([])


    useEffect(() => {

    if (!query.trim()) {
        setResults([])
        return
    }

    const delay = setTimeout(async () => {

        try {
            const res = await api.get(`/api/search-users?q=${query}`)
            setResults(res.data.users || [])
        }
        catch(err){
            console.error(err)
        }

    }, 500)

    return () => clearTimeout(delay)

}, [query])


    return (
        <>
        <div>
           <div className='relative lg:block hidden'>
                <input onClick={() => setSearchOpen(true)} placeholder='Search' className='border px-7 cursor-pointer focus:border-gray-300 outline-none text-black border-gray-400  h-9 w-60 rounded-lg' />
                <Search onClick={() => setSearchOpen(true)} className=" cursor-pointer absolute left-1 top-2 w-5 h-5 text-gray-400" />
              </div>
              <div className='hidden md:block lg:hidden'> 
                  <Search onClick={() => setSearchOpen(true)} className=" cursor-pointer  w-10 h-10 text-gray-400" />
              </div> 

              <Search onClick={() => setSearchOpen(true)} className=" cursor-pointer  w-8 h-8 text-gray-400 block sm:hidden" />

        </div>
            {
  searchOpen && (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">

      {/* HEADER */}
      <div className="p-4 border-b relative shadow-sm">
        <input
          placeholder="Search users..."
          type="text"
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
          className="w-6 h-6 absolute right-6 top-6 text-gray-600 cursor-pointer hover:text-black transition"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
      </div>

      {/* RESULTS */}
      <div className="flex-1 overflow-y-auto">

        {results.length === 0 && query && (
          <p className="text-center text-gray-500 mt-6">
            No users found
          </p>
        )}

        {results.map((r) => (
          <Link
            to={`/profile/${r.id}`}
            key={r.id}
            onClick={() => setSearchOpen(false)}
            className="flex items-center gap-4 p-4 border-b 
            hover:bg-gray-50 transition duration-200 group"
          >

            {/* PROFILE IMAGE */}
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
              {r.image ? (
                <img
                  src={r.image}
                  alt={r.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-bold">
                  {r.name.charAt(0)}
                </div>
              )}
            </div>

            {/* USER INFO */}
            <div className="flex flex-col">
              <span className="font-semibold text-black group-hover:text-blue-600 transition">
                {r.name}
              </span>

              <span className={`text-xs mt-1 px-2 py-1 rounded-full w-fit
                ${r.role === "admin"
                  ? "bg-red-100 text-red-600"
                  : r.role === "moderator"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-gray-100 text-gray-600"
                }`}
              >
                {r.role}
              </span>
            </div>

          </Link>
        ))}

      </div>
    </div>
  )
}
        </>
    )
}