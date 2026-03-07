import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../Api/axios";
import { FaStar } from "react-icons/fa";
import ProductGallery from "./ProductGallery"
import ProductVariants from "./ProductVariants"
import ProductReviews from "./ProductReviews"
import RelatedProducts from "./RelatedProducts"
import ProductSkeleton from "./ProductSkeleton"


export default function SingleProduct() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");


  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data);

      if (res.data.images?.length > 0) {
        setMainImage(
          `http://localhost:8000/storage/${res.data.images[0].image_path}`
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/api/products/${id}/reviews`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const submitReview = async () => {
    try {
      await api.post(`/api/products/${id}/reviews`, {
        rating,
        comment,
      });

      setRating(0);
      setComment("");
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(()=>{

  if(product){

    let viewed =
      JSON.parse(localStorage.getItem("recent_products")) || [];

    viewed = viewed.filter(p => p !== product.id);

    viewed.unshift(product.id);

    viewed = viewed.slice(0,6);

    localStorage.setItem(
      "recent_products",
      JSON.stringify(viewed)
    );

  }

},[product])


  if (!product) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* TOP SECTION */}
      <div className="grid md:grid-cols-3 gap-8">

        {/* LEFT SIDE */}
        <div className="md:col-span-2">

          {/* Main Image */}
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-[400px] object-cover rounded-lg"
          />

          {/* Thumbnails */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {product.images?.map((img) => {
              const imageUrl = `http://localhost:8000/storage/${img.image_path}`;

              return (
                <img
                  key={img.id}
                  src={imageUrl}
                  alt=""
                  onClick={() => setMainImage(imageUrl)}
                  className={`w-24 h-24 object-cover rounded cursor-pointer border-2 ${
                    mainImage === imageUrl
                      ? "border-orange-500"
                      : "border-gray-200"
                  }`}
                />
              );
            })}
          </div>

          {/* PRODUCT TITLE */}
          <h1 className="text-2xl font-bold mt-6">{product.title}</h1>

          <p className="text-gray-600 mt-2">{product.description}</p>

          {/* SPECIFICATIONS */}
          <h2 className="text-xl font-semibold mt-8 mb-3">Specifications</h2>

          <table className="w-full border">
            <tbody>

              <tr className="border">
                <td className="p-2 font-medium">Brand</td>
                <td className="p-2">{product.brand}</td>
              </tr>

              <tr className="border">
                <td className="p-2 font-medium">Category</td>
                <td className="p-2">{product.category?.name}</td>
              </tr>

              <tr className="border">
                <td className="p-2 font-medium">Price</td>
                <td className="p-2">${product.price}</td>
              </tr>

              <tr className="border">
                <td className="p-2 font-medium">Stock</td>
                <td className="p-2">{product.stock}</td>
              </tr>

            </tbody>
          </table>

          {/* REVIEWS */}
          <h2 className="text-xl font-semibold mt-10 mb-4">Reviews</h2>

          {/* Review Input */}
          <div className="border p-4 rounded-lg mb-6">

            {/* Star Rating */}
            <div className="flex gap-2 mb-3">
              {[1,2,3,4,5].map((star)=>(
                <FaStar
                  key={star}
                  onClick={()=>setRating(star)}
                  className={`cursor-pointer ${
                    rating >= star ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            <textarea
              className="border p-2 w-full rounded mb-3"
              placeholder="Write your review..."
              value={comment}
              onChange={(e)=>setComment(e.target.value)}
            />

            <button
              onClick={submitReview}
              className="bg-orange-500 text-white px-4 py-2 rounded"
            >
              Submit Review
            </button>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((rev)=>(
              <div key={rev.id} className="border p-3 rounded">

                <div className="flex items-center gap-2">
                  {[...Array(rev.rating)].map((_,i)=>(
                    <FaStar key={i} className="text-yellow-400"/>
                  ))}
                </div>

                <p className="text-gray-600 mt-2">{rev.comment}</p>

              </div>
            ))}
          </div>

        </div>


        {/* RIGHT SIDEBAR */}
        <div className="border p-5 rounded-lg h-fit bg-gray-50">

          <h2 className="text-lg font-semibold mb-4">
            Product Details
          </h2>

          <div className="space-y-3 text-sm">

            <p><b>Location:</b> {product.location}</p>

            <p><b>Brand:</b> {product.brand}</p>

            <p>
              <b>Availability:</b>{" "}
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </p>

            <p><b>Stock:</b> {product.stock}</p>

            <p><b>Delivery Time:</b> {product.delivery_time}</p>

            <p><b>Company Type:</b> {product.company_type}</p>

            <p><b>Delivery Method:</b> {product.delivery_method}</p>

          </div>

          {/* Add To Cart */}
          <button
            onClick={()=>addToCart(product)}
            className="mt-6 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
          >
            Add To Cart
          </button>

        </div>

      </div>
    </div>
  );
}