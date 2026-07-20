import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import api from "../../Api/axios";
import { useAuth } from "../../layout/AuthProvider";

export default function TeacherReviews({  reviewPending }) {

    const {user} = useAuth()
    const [loading, setLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [teacher, setTeacher] = useState(null);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

   
    console.log('user id', user)

    const teacherId = user?.id


    const fetchReviews = async () => {

        try {

            setLoading(true);

            const res = await api.get(`/api/teacher/reviews/${teacherId}`, {
                teacher_id: teacherId,
            });

            setTeacher(res.data.teacher);
            setReviews(res.data.reviews || []);
            setAverageRating(res.data.average_rating);
            setReviewCount(res.data.review_count);

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

        }

    };

     useEffect(() => {

        fetchReviews();

    }, [teacherId]);

    if (loading) {

        return (

            <div
            className="
            grid
            grid-cols-1
            gap-2 lg:ml-72"
        >

            {[...Array(4)].map((_,i)=>(

                <div
                    key={i}
                    className="
                    bg-white
                    rounded-2xl
                    border
                    p-5
                    animate-pulse"
                >

                    <div className="flex flex-col flex-1 gap-1">

                            <div className="h-6 w-full rounded bg-gray-300"/>

                            <div className="h-4 w-1/2 rounded bg-gray-200"/>

                            <div className="h-4 w-2/3 rounded bg-gray-200"/>

                            <div className="h-4 w-full mt-1 rounded bg-gray-200"/>

                            <div className="h-4 w-4/5 mt-1 rounded bg-gray-200"/>

                  </div>

                </div>

            ))}

        </div>

        );

    }

    return (

        <div className="max-w-5xl mx-auto lg:ml-72 text-black">

            <div className="bg-white rounded-2xl shadow-lg p-8">

                <h1 className="text-3xl font-bold">

                    Student Reviews ({reviewPending})

                </h1>

                <p className="mt-2">

                    {teacher?.name}

                </p>

                <div className="flex items-center gap-3 mt-5">

                    <div className="flex text-yellow-500 text-2xl">

                        {"★".repeat(Math.round(averageRating))}
                        <span className="text-gray-300">

                            {"★".repeat(5 - Math.round(averageRating))}

                        </span>

                    </div>

                    <span className="font-bold text-xl">

                        {averageRating}

                    </span>

                    <span className="">

                        ({reviewCount} Reviews)

                    </span>

                </div>

            </div>

            <div className="space-y-5 mt-8">

                {reviews.length === 0 ? (

                    <div className="bg-white rounded-2xl shadow p-12 text-center">

                        <div className="text-6xl">

                            ⭐

                        </div>

                        <h2 className="font-bold text-2xl mt-5">

                            No Reviews Yet

                        </h2>

                        <p className="mt-2">

                            Students haven't reviewed you yet.

                        </p>

                    </div>

                ) : (

                    reviews.map(review => (

                        <div
                            key={review.id}
                            className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition"
                        >

                            <div className="flex items-start">

                                <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center">

                                    {review.avatar}

                                </div>

                                <div className="ml-4 flex-1">

                                    <div className="flex justify-between">

                                        <div>

                                            <h3 className="font-bold text-lg">

                                                {review.first_name} {review.last_name}

                                            </h3>

                                            <div className="flex text-yellow-500 mt-1">

                                                {[1,2,3,4,5].map(star => (

                                                    <Star
                                                        key={star}
                                                        size={18}
                                                        fill={
                                                            star <= review.rating
                                                                ? "#FACC15"
                                                                : "transparent"
                                                        }
                                                    />

                                                ))}

                                            </div>

                                        </div>

                                        <span className="text-sm text-gray-500">

                                            {review.created_at}

                                        </span>

                                    </div>

                                    <p className="mt-5 text-gray-700 leading-7">

                                        {review.review}

                                    </p>

                                </div>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div>

    );

}