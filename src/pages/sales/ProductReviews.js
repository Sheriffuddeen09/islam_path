import { useState } from "react";
import { FaStar } from "react-icons/fa";

export default function ProductReviews({ reviews }) {

  const [page,setPage] = useState(1)

  const perPage = 3

  const avg =
    reviews.reduce((acc,r)=>acc+r.rating,0) / reviews.length || 0

  const paginated = reviews.slice(
    (page-1)*perPage,
    page*perPage
  )

  return (

    <div className="mt-10">

      <h2 className="text-xl font-bold mb-3">Reviews</h2>

      {/* AVERAGE */}
      <div className="flex items-center gap-2 mb-6">

        <div className="flex">
          {[1,2,3,4,5].map((s)=>(
            <FaStar
              key={s}
              className={
                avg >= s ? "text-yellow-400":"text-gray-300"
              }
            />
          ))}
        </div>

        <span className="text-gray-600">
          ({avg.toFixed(1)} / 5)
        </span>

      </div>


      {/* REVIEW LIST */}
      {paginated.map((r)=>(
        <div key={r.id} className="border p-3 rounded mb-3">

          <div className="flex gap-1">
            {[...Array(r.rating)].map((_,i)=>(
              <FaStar key={i} className="text-yellow-400"/>
            ))}
          </div>

          <p className="text-gray-600 mt-2">
            {r.comment}
          </p>

        </div>
      ))}

      {/* PAGINATION */}
      <div className="flex gap-2 mt-4">

        {Array.from({
          length: Math.ceil(reviews.length/perPage)
        }).map((_,i)=>(
          <button
            key={i}
            onClick={()=>setPage(i+1)}
            className="border px-3 py-1 rounded"
          >
            {i+1}
          </button>
        ))}

      </div>

    </div>
  )
}