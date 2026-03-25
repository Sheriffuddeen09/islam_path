import { Link } from "react-router-dom";

export default function RelatedProducts({ products }) {
  // If no products, return null (hide component)
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-2xl px-2 font-bold mb-4 text-black">
        Related Products
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => {
          const img = p.images?.[0];
          const url = img
            ? `http://localhost:8000/storage/${img.image_path}`
            : "/placeholder.png";

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

              <h3 className="font-medium text-gray-800">{p.title}</h3>
              <p className="text-gray-500">${p.price}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}