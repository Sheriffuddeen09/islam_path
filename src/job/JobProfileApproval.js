import { useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import {
    Eye,
    Check,
    X,
    Loader2,
} from "lucide-react";
import JobProfileDetailsModal from "./JobProfileDetailsModal";

export default function JobProfileApproval() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [approveLoading, setApproveLoading] =
    useState(null);

    const [declineLoading, setDeclineLoading] =
        useState(null);

    const fetchProfiles = async () => {
        try {
            const res = await api.get("/api/admin/job-pending");

            setProfiles(res.data);
        } catch (error) {
            toast.error("Unable to fetch profiles.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);


    const removeProfile = (id) => {
    setProfiles((prev) =>
        prev.filter(
            (profile) =>
                Number(profile.id) !== Number(id)
        )
    );
};

    const approveProfile = async (id) => {
    setApproveLoading(id);

    try {
        await api.post(
            `/api/admin/job-profiles/${id}/approve`
        );

        removeProfile(id);

        toast.success("Profile approved.");
    } catch (error) {
        toast.error(
            "Unable to approve profile."
        );
    } finally {
        setApproveLoading(null);
    }
};

  const declineProfile = async (id) => {
    setDeclineLoading(id);

    try {
        await api.post(
            `/api/admin/job-profiles/${id}/decline`
        );

        removeProfile(id);

        toast.success("Profile declined.");
    } catch (error) {
        toast.error(
            "Unable to decline profile."
        );
    } finally {
        setDeclineLoading(null);
    }
};


    const badgeColor = (status) => {
        switch (status) {
            case "approved":
                return "text-green-700";

            case "declined":
                return "text-red-700";

            default:
                return "text-yellow-700";
        }
    };



    return (
        <div className="sm:p-6 p-3">

            <h1 className="text-xl font-bold mb-2 mt-16">
                Job Profile Approval
            </h1>

            {!loading && profiles.length === 0 && (
                <div className="bg-white rounded-2xl shadow-md p-10 text-center">
                    <h2 className="sm:text-2xl text-xl font-bold text-gray-700">
                        No Pending Profiles
                    </h2>

                    <p className="text-gray-500 mt-2 text-sm">
                        There are currently no job profiles
                        awaiting approval.
                    </p>
                </div>
            )}

            {loading ? (
                <div className="grid lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, index) => (
                <div
                    key={index}
                    className="bg-white rounded-2xl shadow-md p-6 border animate-pulse"
                >
                    {/* Header */}
                    <div className="flex justify-between">
                        <div className="space-y-2">
                            <div className="h-6 w-48 bg-gray-200 rounded"></div>
                            <div className="h-4 w-56 bg-gray-200 rounded"></div>
                        </div>

                        <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                    </div>

                    {/* Body */}
                    <div className="mt-4 space-y-3">
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mt-6">
                        <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
                        <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
                        <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            ))}
        </div>
    ) : (

            <div className="grid lg:grid-cols-2 gap-6">

                {profiles.map((profile) => (

                    <div
                        key={profile.id}
                        className="bg-white rounded-2xl shadow-md p-6 border"
                    >
                        <div className="flex justify-between flex-wrap">

                            <div>

                                <h2 className="text-xl font-bold">

                                    {profile.type === "creator"
                                        ? profile.company_name
                                        : profile.full_name}

                                </h2>

                                <p className="text-gray-500">

                                    {profile.user?.email}

                                </p>

                            </div>

                            <span
                                className={`px-2 pt-2 rounded-xl text-sm font-semibold ${badgeColor(
                                    profile.status
                                )}`}
                            >
                                {profile.status}
                            </span>

                        </div>

                        <div className="mt-4 space-y-2">

                            <p>

                                <strong>Type:</strong>{" "}
                                {profile.type}

                            </p>

                            <p>

                                <strong>Location:</strong>{" "}

                                {profile.company_location ||
                                    profile.location}

                            </p>

                        </div>

                        <div className="flex gap-2 mt-6">

                            <button
                                onClick={() =>
                                    setSelectedProfile(profile)
                                }
                                className="flex items-center text-sm gap-2 px-2 py-2 rounded-lg bg-blue-600 text-white"
                            >
                                <Eye size={18} />
                                View
                            </button>

                            {profile.status !== "approved" && (
                                <button
                                disabled={
                                    approveLoading === profile.id ||
                                    declineLoading === profile.id
                                }
                                onClick={() =>
                                    approveProfile(profile.id)
                                }
                                className="flex items-center text-sm gap-2 px-2 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
                            >
                                {approveLoading === profile.id ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                        Approving
                                    </>
                                ) : (
                                    <>
                                        <Check size={18} />
                                        Approve
                                    </>
                                )}
                            </button>
                            )}

                            {profile.status !== "declined" && (
                                <button
                                disabled={
                                    declineLoading === profile.id ||
                                    approveLoading === profile.id
                                }
                                onClick={() =>
                                    declineProfile(profile.id)
                                }
                                className="flex items-center gap-2 px-2 text-sm py-2 rounded-lg bg-red-600 text-white disabled:opacity-50"
                            >
                                {declineLoading === profile.id ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                        Declining
                                    </>
                                ) : (
                                    <>
                                        <X size={18} />
                                        Decline
                                    </>
                                )}
                            </button>
                            )}

                        </div>

                    </div>

                ))}

            </div>
    )}
            

            {selectedProfile && (

                <JobProfileDetailsModal
                    profile={selectedProfile}
                    onClose={() =>
                        setSelectedProfile(null)
                    }
                />

            )}

        </div>
    );
}