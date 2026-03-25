import { useEffect,useState } from "react";
import api from "../../Api/axios";
import { Link } from "react-router-dom";

export default function RecentlyViewed({products, setProducts}){



  useEffect(()=>{

    const fetchRecent = async()=>{

      const ids =
        JSON.parse(localStorage.getItem("recent_products")) || [];

      if(ids.length===0) return;

      const res = await api.post("/api/products/by-ids",{ids})

      setProducts(res.data)

    }

    fetchRecent()

  },[])

  if(products.length===0) return null

  return(

    <div className="mt-8">

      <h2 className="text-2xl font-bold mb-4 px-2 text-black">
        Recently Viewed
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {products.map((p)=>{

          const img = p.images?.[0]

          const url = img
          ? `http://localhost:8000/storage/${img.image_path}`
          : "/placeholder.png"

          return(

            <Link
              to={`/product/${p.id}`}
              key={p.id}
              className="border p-3 rounded hover:shadow"
            >

              <img
                src={url}
                className="h-40 w-full object-cover"
              />

              <h3 className="mt-2 font-medium text-black">
                {p.title}
              </h3>

            </Link>

          )

        })}

      </div>

    </div>
  )
}