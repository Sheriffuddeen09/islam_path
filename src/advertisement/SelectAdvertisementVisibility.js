import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
LoaderCircle, Badge, CheckCircle, X,
Lock, } from "lucide-react";
import toast from "react-hot-toast";
import api from "../Api/axios";
export default function SelectAdvertisementVisibility() {
const { id } = useParams();
const [loading, setLoading] = useState(true);
const [unlockLoading, setUnlockLoading] = useState(false);
const [openModal, setOpenModal] =
useState(false);
const [advertisement, setAdvertisement] = useState({});
const [selectedAudience, setSelectedAudience] = useState("");
const [requiredBadges, setRequiredBadges] = useState(0);
const [successModal, setSuccessModal] = useState(false);
const [selectedAudienceLabel, setSelectedAudienceLabel] = useState("");
const [selectionLocked, setSelectionLocked] = useState(false);
const [badges, setBadges] = useState({
  total: 0,
});
const [adsWatched, setAdsWatched] = useState(0);

useEffect(() => {
fetchAdvertisement();
}, []);
const fetchAdvertisement = async () => {
try {
setLoading(true);
const response = await api.get(
`/api/advertisement/${id}` );
setAdvertisement(
response.data.advertisement
);
} catch (error) {
toast.error(
"Unable to fetch advertisement."
);
} finally {
setLoading(false);
}
};

useEffect(() => {
  api.get("/api/user/badges")
    .then(res => {
      setBadges(res.data);
    })
    .catch(() => {
      setBadges({ total: 0});
    });
}, []);

const isLocked =
    selectionLocked ||
    advertisement.visibility_unlocked;

const handleWatchAd = async () => {
  if (adsWatched >= 6) return;

  try {
    const res = await api.post("/api/student/watch-ad");

    // backend should return new total
    setBadges({ total: res.data.total });
    setAdsWatched(prev => prev + 1);
  } catch (e) {
    console.error(e);
  }
};



const handleSelection = (
    audience,
    badges,
    audienceLabel
) => {

    // Prevent another selection
    if (selectionLocked) {
        return;
    }

    setSelectedAudience(audience);

    setRequiredBadges(badges);

    setSelectedAudienceLabel(
        audienceLabel
    );

    // Lock all choices
    setSelectionLocked(true);

    // Open confirmation modal
    setOpenModal(true);
};



const unlockVisibility = async () => {

    try {

        setUnlockLoading(true);

        const response = await api.post(
            `/api/advertisement/unlock-visibility/${id}`,
            {
                audience: selectedAudience
            }
        );

        toast.success(
            response.data.message
        );

        setOpenModal(false);

        await fetchAdvertisement();

        setSuccessModal(true);

    } catch (error) {

        // Unlock failed, allow user
        // to select again
        setSelectionLocked(false);

        toast.error(
            error?.response?.data?.message ||
            "Unable to unlock."
        );

    } finally {

        setUnlockLoading(false);

    }
};

const Skeleton = () => {
return (
<div className="animate-pulse space-y-5">
<div className="h-80 rounded-xl bg-gray-200"></div>
<div className="h-8 rounded bg-gray-200"></div>
<div className="h-32 rounded bg-gray-200"></div>
</div>
);
};
if (loading) {
return (
<div className="max-w-7xl mx-auto px-5 sm:pt-24 pt-16 ">
<Skeleton />
</div>
);
}
return (
<>
<div className="max-w-7xl mx-auto sm:px-5 sm:pb-10 px-2 pb-8 pt-24">
<div className="bg-[var(--bg-color)] text-[var(--text-color)] shadow-xl rounded-3xl overflow-hidden">
<h1 className='sm:text-3xl text-xl font-bold mb-6'> Unlock Levels Visibility for {advertisement.type} </h1>
{/* IMAGE */}
{advertisement.media_type ===
"image" && (
<img
src={`http://localhost:8000/storage/${advertisement.media}`}
alt="" className="w-full h-96 object-cover" />
)}
{/* VIDEO */}
{advertisement.media_type ===
"video" && (
<video
controls
className="w-full h-96 object-cover" >
<source
src={`http://localhost:8000/storage/${advertisement.media}`}
/>
</video>
)}
<div className="p-6 space-y-5">
<h1 className="sm:text-4xl text-2xl font-bold">
{
advertisement.title
}
</h1>
<div className="flex gap-3">
<span className="sm:px-4 px-2 py-2 rounded-full bg-blue-500">
{
advertisement.type
}
</span>
<span className="sm:px-4 px-2 py-2 rounded-full bg-green-500">
{
advertisement.status
}
</span>
</div>
<p className="leading-8">
{
advertisement.description
}
</p>
{/* VISIBILITY */}
{!advertisement.visibility_unlocked && (

    <div className="border border-blue-500 rounded-3xl sm:p-6 p-3">

        <h2 className="font-bold text-2xl mb-5">
            Select Visibility
        </h2>

        <p className="mb-6 ">
            Select how many users you want your
            advertisement to reach.
        </p>

        <div className="grid lg:grid-cols-2 gap-4">

            {/* 1/4 */}

            <button
            disabled={isLocked}
            onClick={() =>
                handleSelection(
                    "25",
                    50,
                    "1/4 of users"
                )
            }
            className={`rounded-2xl border p-6 text-left transition
                ${
                    isLocked
                        ? "opacity-50 cursor-not-allowed border-gray-300"
                        : "border-blue-500 hover:border-blue-800"
                }
            `}
        >

                <h2 className="font-bold text-xl">
                    1/4 Users
                </h2>

                <p className="mt-2 font-semibold">
                    50 Badges
                </p>

                <p className="mt-2 text-sm ">
                    Visibility to users for
                    1 month
                </p>

            </button>


            {/* 1/2 */}

            <button
                disabled={isLocked}
                onClick={() =>
                    handleSelection(
                        "50",
                        100,
                        "1/2 of users"
                    )
                }
                className={`rounded-2xl border p-6 text-left transition
                    ${
                        isLocked
                            ? "opacity-50 cursor-not-allowed border-gray-300"
                            : "border-blue-500 hover:border-blue-800"
                    }
                `}
            >

                <h2 className="font-bold text-xl">
                    1/2 Users
                </h2>

                <p className="mt-2 font-semibold">
                    100 Badges
                </p>

                <p className="mt-2 text-sm ">
                    Visibility to users for
                    2 months
                </p>

            </button>


            {/* 3/4 */}

            <button
                disabled={isLocked}
                onClick={() =>
                    handleSelection(
                        "75",
                        200,
                        "3/4 of users"
                    )
                }
                className={`rounded-2xl border p-6 text-left transition
                    ${
                        isLocked
                            ? "opacity-50 cursor-not-allowed border-gray-300"
                            : "border-blue-500 hover:border-blue-800"
                    }
                `}
            >

                <h2 className="font-bold text-xl">
                    3/4 Users
                </h2>

                <p className="mt-2 font-semibold">
                    200 Badges
                </p>

                <p className="mt-2 text-sm ">
                    Visibility to users for
                    3 months
                </p>

            </button>


            {/* ALL */}

           <button
                disabled={isLocked}
                onClick={() =>
                    handleSelection(
                        "100",
                        300,
                        "all users"
                    )
                }
                className={`rounded-2xl border p-6 text-left transition
                    ${
                        isLocked
                            ? "opacity-50 cursor-not-allowed border-gray-300"
                            : "border-blue-500 hover:border-blue-800"
                    }
                `}
            >
                <h2 className="font-bold text-xl">
                    All Users
                </h2>

                <p className="mt-2 font-semibold">
                    300 Badges
                </p>

                <p className="mt-2 text-sm ">
                    Visibility to all users for
                    4 months
                </p>

            </button>

        </div>

    </div>

)}
</div>
</div>
</div>
{/* MODAL */}
{openModal && (
<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5">
<div className="bg-[var(--bg-color)] text-[var(--text-color)] mx-auto rounded-3xl max-w-lg w-full p-6">
<div className="flex items-center justify-between">
<h1 className="font-bold text-2xl">
Unlock Visibility
</h1>
<button
onClick={() =>
setOpenModal(
false
)
}
>
<X />
</button>
</div>
<div className="mt-6 space-y-4">
<div className="flex items-center gap-3">
<Badge />
<h2 className="font-bold text-xl">
{
requiredBadges
}{" "}
Badges
</h2>
</div>
<p>
You are about to
spend{" "}
<b>
{
requiredBadges
}
</b>{" "}
badges to unlock
advertisement
visibility. </p>
<p className="text-center">
This action cannot
be undone. </p>
<button
        disabled={adsWatched >= 6}
        onClick={handleWatchAd}
        className={`w-44 text-xs py-1 mb-12 border-b-2 mt-10 flex justify-center text-center  rounded-lg  text-white ${
          adsWatched >= 6 ? "bg-gray-300" : "bg-blue-600 text-white"
        }`}
      >
        Watch Ad (+5 badges) ({adsWatched}/6)
      </button>
      <div className="flex flex-col mb-10 gap-2">
        <Lock className="lock  p-1 w-8 h-8 mx-auto border-2 border-black rounded-full"/>
      <p className="font-bold text-lg text-center">Badges Required <b>{requiredBadges}</b> 🏅</p>
      </div>

      

<div className="flex gap-3 pt-4">
<button
    onClick={() => {
        setOpenModal(false);
        setSelectionLocked(false);
    }}
    disabled={unlockLoading}
    className="w-full border rounded-xl p-4 font-bold"
>
    Cancel
</button>
<button
disabled={
unlockLoading
}
onClick={
unlockVisibility
}
className="w-full rounded-xl bg-blue-600 text-white p-4 font-bold" >
{unlockLoading ? (
<div className="flex items-center justify-center gap-2">
<LoaderCircle className="animate-spin" />
Unlocking
</div>
) : (
"Unlock with Badges" )}
</button>
</div>

    {badges.total < 20 && (
        <p className="text-sm text-red-500 text-center mt-2 text-xs font-semibold ">
          Your badge is low. Watch ads or pass exam to earn badges.
        </p>
      )}
      <p className="font-bold text-sm text-center">Balance: <b>{badges.total}</b> 🏅</p>
</div>
</div>
</div>
)}

{successModal && (

    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-5">

        <div className="bg-[var(--bg-color)] text-[var(--text-color)] rounded-3xl max-w-lg w-full p-7 shadow-2xl text-center">

            {/* SUCCESS ICON */}

            <div className="flex justify-center mb-5">

                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">

                    <CheckCircle
                        size={48}
                        className="text-green-600"
                    />

                </div>

            </div>


            {/* TITLE */}

            <h1 className="text-2xl sm:text-3xl font-bold">

                Thank You!

            </h1>


            {/* MESSAGE */}

            <p className="mt-4 leading-7 opacity-80">

                Your selection has been
                successfully selected.

            </p>


            <p className="mt-3 leading-7">

                Your advertisement will be
                visible to{" "}

                <strong>
                    {selectedAudienceLabel}
                </strong>{" "}

                within the selected range.

            </p>


            {/* ADVERTISEMENT */}

            <div className="mt-6 rounded-2xl border p-4">

                <p className="text-sm opacity-60">
                    Advertisement
                </p>

                <p className="font-bold mt-1">
                    {advertisement.title}
                </p>

            </div>


            {/* BUTTONS */}

            <div className="flex flex-col sm:flex-row gap-3 mt-7">

                {/* CLOSE */}

                <button
                    onClick={() =>
                        setSuccessModal(false)
                    }
                    className="w-full border rounded-xl p-4 font-bold hover:bg-gray-700 transition"
                >
                    Close
                </button>


                {/* HOME */}

                <button
                    onClick={() =>
                        window.location.href = "/"
                    }
                    className="w-full rounded-xl bg-blue-600 text-white p-4 font-bold hover:bg-blue-700 transition"
                >
                    Go to Home
                </button>

            </div>

        </div>

    </div>

)}


</>
);
}