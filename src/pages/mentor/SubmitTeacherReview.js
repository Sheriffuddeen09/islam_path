import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../Api/axios";

export default function SubmitTeacherReview({
  teacher,
  onClose,
  onSuccess, review, setReview, rating, setRating
}) {
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    if (!rating) {
      toast.error("Please select a star rating.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/teacher/review", {
        teacher_id: teacher.teacher_id,
        rating,
        review,
      });

      toast.success("Review submitted successfully.");

      onSuccess?.();
      onClose?.();

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Unable to submit review."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 text-black ">

      <h2 className="text-2xl font-bold text-center">
        Rate Your Teacher
      </h2>

      <p className="text-center text-gray-500 mt-1">
        Your feedback helps other students.
      </p>

      <div className="flex items-center justify-center gap-4 mt-8">

        <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
          {teacher.first_name.charAt(0)}
        </div>

        <div>
          <h3 className="font-bold text-lg">
            {teacher.first_name} {teacher.last_name}
          </h3>

          <p className="text-gray-500 text-sm">
            {teacher.coursetitle_name}
          </p>
        </div>

      </div>

      <div className="flex justify-center gap-2 mt-8">

        {[1,2,3,4,5].map((star)=>(
          <Star
            key={star}
            size={38}
            className={`cursor-pointer transition-all duration-200 ${
              star <= (hover || rating)
                ? "fill-yellow-400 text-yellow-400 scale-110"
                : "text-gray-300"
            }`}
            onMouseEnter={()=>setHover(star)}
            onMouseLeave={()=>setHover(0)}
            onClick={()=>setRating(star)}
          />
        ))}

      </div>

      <div className="text-center mt-2 font-semibold text-gray-600">

        {rating === 1 && "Poor"}

        {rating === 2 && "Fair"}

        {rating === 3 && "Good"}

        {rating === 4 && "Very Good"}

        {rating === 5 && "Excellent"}

      </div>

      <textarea
        value={review}
        onChange={(e)=>setReview(e.target.value)}
        rows={5}
        maxLength={1000}
        placeholder="Tell other students about your learning experience..."
        className="w-full border rounded-xl text-sm text-black p-4 mt-6 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
      />

      <div className="text-right text-xs text-gray-400 mt-1">
        {review.length}/1000
      </div>

      <div className="flex gap-3 mt-8">

        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl border font-semibold hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          disabled={loading}
          onClick={submitReview}
          className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
        >
          {loading ? 
          <p className='inline-flex gap-1 items-center'> 
            <Loader2 className="animate-spin text-white" /> 
            Submitting</p> : "Submit Review"}
        </button>

      </div>

    </div>
  );
}