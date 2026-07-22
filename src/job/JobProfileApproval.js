import { useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import { Eye, Check, X } from "lucide-react";
import JobProfileDetailsModal from "./JobProfileDetailsModal";

export default function JobProfileApproval() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);

    const fetchProfiles = async () => {
        try {
            const res = await api.get("/api/admin/job-profiles");

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

    const approveProfile = async (id) => {
        try {
            await api.post(`/api/admin/job-profiles/${id}/approve`);

            toast.success("Profile approved.");

            fetchProfiles();

        } catch (error) {
            toast.error("Unable to approve profile.");
        }
    };

    const declineProfile = async (id) => {
        const reason = prompt("Enter decline reason");

        if (!reason) return;

        try {
            await api.post(
                `/api/admin/job-profiles/${id}/decline`,
                {
                    reason,
                }
            );

            toast.success("Profile declined.");

            fetchProfiles();

        } catch (error) {
            toast.error("Unable to decline profile.");
        }
    };

    const badgeColor = (status) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-700";

            case "declined":
                return "bg-red-100 text-red-700";

            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    return (
        <div className="p-6">

            <h1 className="text-3xl font-bold mb-8">
                Job Profile Approval
            </h1>

            {loading && (
                <p>Loading profiles...</p>
            )}

            <div className="grid lg:grid-cols-2 gap-6">

                {profiles.map((profile) => (

                    <div
                        key={profile.id}
                        className="bg-white rounded-2xl shadow-md p-6 border"
                    >
                        <div className="flex justify-between">

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
                                className={`px-4 py-1 rounded-full text-sm font-semibold ${badgeColor(
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

                        <div className="flex gap-3 mt-6">

                            <button
                                onClick={() =>
                                    setSelectedProfile(profile)
                                }
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white"
                            >
                                <Eye size={18} />
                                View
                            </button>

                            {profile.status !== "approved" && (
                                <button
                                    onClick={() =>
                                        approveProfile(profile.id)
                                    }
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white"
                                >
                                    <Check size={18} />
                                    Approve
                                </button>
                            )}

                            {profile.status !== "declined" && (
                                <button
                                    onClick={() =>
                                        declineProfile(profile.id)
                                    }
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white"
                                >
                                    <X size={18} />
                                    Decline
                                </button>
                            )}

                        </div>

                    </div>

                ))}

            </div>

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