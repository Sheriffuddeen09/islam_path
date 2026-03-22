import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../Api/axios";
import { FaStar } from "react-icons/fa";
import ProductGallery from "./ProductGallery"
import ProductVariants from "./ProductVariants"
import ProductReviews from "./ProductReviews"
import RelatedProducts from "./RelatedProducts"
import ProductSkeleton from "./ProductSkeleton"
import { useCart } from "./cart/CartContext";
import { Star } from "lucide-react";


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


const galleryImages = product
  ? [
      product.front_image,
      product.back_image,
      product.side_image,
      ...(product.images?.map((img) => img.image_path) || []),
    ]
      .filter(Boolean)
      .map((path, index) => ({
        id: index,
        image_path: path,
      }))
  : [];


  if (!product) return <ProductSkeleton />;


  return (
    <div className="max-w-7xl mx-auto sm:p-6 p-2">

      {/* TOP SECTION */}
      <div className="grid mt-14 sm:mt-16 md:grid-cols-3 gap-8">

        {/* LEFT SIDE */}
        <div className="md:col-span-2">

          {/* Main Image */}

          <ProductGallery images={galleryImages} product={product} />

          <div className="sm:hidden flex mt-6 px-2 flex-col gap-3">

              {/* TITLE */}
              <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
                {product.title}
              </h1>

              {/* RATING */}
              <div className="flex items-center gap-2">

                {/* 5 Stars */}
                <div className="flex text-orange-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>

                {/* REVIEW COUNT */}
                <span className="text-gray-600 whitespace-nowrap text-sm">
                  ({product.review_total} reviews)
                </span>

              </div>

              {/* PRICE */}
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-black">
                  {product.currency} {product.price}
                </span>
              </div>

              {/* EXTRA UI (optional but looks better) */}
              <div className="border-t-2 py-3 whitespace-nowrap px-2 text-sm text-gray-600">
                <p>✔ Track Product</p>
                <p>✔ Secure checkout</p>
                <p>✔ 30-day return policy</p>
              </div>

              <button
                onClick={()=>addToCart(product)}
                className="mt-6 w-full bg-black text-white py-3 rounded hover:bg-orange-600"
              >
                Add To Cart
              </button>
          </div>

          {/* PRODUCT TITLE */}

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
      <div className="border p-6 rounded-lg h-full sm:h-[530px] bg-gray-900 text-white flex flex-col justify-between shadow-lg">
      
      {/* PRODUCT DETAILS */}
      <div>
        <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">
          Product Details
        </h2>

        <div className="space-y-4 text-sm">
          <p>
            <span className="font-semibold">Location:</span> {product.location || "-"}
          </p>
          <p>
            <span className="font-semibold">Brand:</span> {product.brand || "-"}
          </p>
          <p>
            <span className="font-semibold">Availability:</span>{" "}
            <span className={product.stock > 0 ? "text-green-400" : "text-red-500"}>
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </p>
          <p>
            <span className="font-semibold">Stock:</span> {product.stock}
          </p>
          <p>
            <span className="font-semibold">Delivery Time:</span> {product.delivery_time || "-"}
          </p>
          <p>
            <span className="font-semibold">Company Type:</span> {product.company_type || "-"}
          </p>
          <p>
            <span className="font-semibold">Delivery Method:</span> {product.delivery_method || "-"}
          </p>
        </div>
      </div>

      {/* ADD TO CART BUTTON */}
      <button
        onClick={() => addToCart(product)}
        className="mt-6 w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all"
      >
        Add To Wishlist
      </button>

    </div>

      </div>
    </div>
  );
}