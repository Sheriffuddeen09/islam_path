import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../Api/axios";

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
                    <div className="flex-1 p-4 border-b relative">
                        <input placeholder='Search' 
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className='border w-full px-4 py-2 rounded-lg focus:border-gray-300 
                        outline-none text-black border-gray-400' />
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
                         onClick={() => setSearchOpen(false)}
                         class="size-6 absolute right-8 rotate-180 top-6 text-black cursor-pointer">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    </div>
                    <div>
                        {
                            results.map(r => (
                            <div key={r.id} className="p-3 text-black border-b">
                                <p>{r.name}</p>
                            </div>
                            ))
                        }
                    </div>
                    </div>
                ) 
            }
        </>
    )
}