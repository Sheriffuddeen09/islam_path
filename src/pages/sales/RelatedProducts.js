import { Link } from "react-router-dom";

export default function RelatedProducts({ products }) {

  return (

    <div className="mt-16">

      <h2 className="text-2xl font-bold mb-6">
        Related Products
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {products.map((p)=>{

          const img = p.images?.[0]
          const url = img
          ? `http://localhost:8000/storage/${img.image_path}`
          : "/placeholder.png"

          return (

            <Link
              to={`/product/${p.id}`}
              key={p.id}
              className="border p-3 rounded hover:shadow"
            >

              <img
                src={url}
                className="h-40 w-full object-cover mb-2"
              />

              <h3 className="font-medium">
                {p.title}
              </h3>

              <p className="text-gray-500">
                ${p.price}
              </p>

            </Link>
          )
        })}

      </div>

    </div>
  )
}