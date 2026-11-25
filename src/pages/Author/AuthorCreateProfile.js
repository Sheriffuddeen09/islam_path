import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../api";
import toast from "react-hot-toast";
import { UserRound, ImagePlus, Loader2 } from "lucide-react";

export default function AuthorCreateProfile() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [valid, setValid] = useState(false);

    const [form, setForm] = useState({
        username: "",
        display_name: "",
        bio: "",
        website: "",
        specialization: "",
    });

    const [coverImage, setCoverImage] = useState(null);
    const [coverPreview, setCoverPreview] = useState("");

    useEffect(() => {
        let active = true;

        const verifyLink = async () => {
            try {
                const response = await api.get(
                    `/author/setup/${token}`
                );

                if (!active) return;

                setValid(response.data.valid);

                const profile = response.data.profile;

                setForm({
                    username: profile?.username || "",
                    display_name:
                        profile?.display_name ||
                        response.data.name ||
                        "",
                    bio: profile?.bio || "",
                    website: profile?.website || "",
                    specialization: profile?.specialization || "",
                });

                if (profile?.cover_image) {
                    setCoverPreview(
                        `http://localhost:8000/storage/${profile.cover_image}`
                    );
                }
            } catch (error) {
                if (!active) return;

                setValid(false);

                if (error.response?.status === 401) {
                    toast.error(
                        "Please sign in with the account that generated this link."
                    );
                } else {
                    toast.error(
                        error.response?.data?.message ||
                        "Invalid or expired author setup link."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        verifyLink();

        return () => {
            active = false;
        };
    }, [token]);

    const handleChange = (e) => {
        setForm((previous) => ({
            ...previous,
            [e.target.name]: e.target.value,
        }));
    };

    const handleCoverChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Cover image must not exceed 5MB.");
            return;
        }

        setCoverImage(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.username.trim() || !form.display_name.trim()) {
            toast.error("Username and display name are required.");
            return;
        }

        const data = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            data.append(key, value || "");
        });

        if (coverImage) {
            data.append("cover_image", coverImage);
        }

        setSaving(true);

        try {
            const response = await api.post(
                `/author/setup/${token}`,
                data
            );

            toast.success(response.data.message);

            navigate(`/authors/${response.data.profile.username}`);
        } catch (error) {
            const errors = error.response?.data?.errors;

            if (errors) {
                Object.values(errors).flat().forEach((message) => {
                    toast.error(message);
                });
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Unable to create author profile."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" />
                Verifying author setup link...
            </div>
        );
    }

    if (!valid) {
        return (
            <div className="min-h-screen flex items-center justify-center p-5 bg-gray-50">
                <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
                    <UserRound size={45} className="mx-auto text-gray-400" />

                    <h2 className="text-xl font-bold mt-4">
                        Author setup link unavailable
                    </h2>

                    <p className="text-gray-500 mt-2">
                        This link may have expired, already been used,
                        or you may be signed in with a different account.
                    </p>

                    <Link
                        to="/login"
                        className="inline-block mt-5 bg-green-600 text-white px-5 py-2 rounded-lg"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6 md:p-8">

                <h1 className="text-2xl font-bold text-gray-800">
                    Create Your Author Profile
                </h1>

                <p className="text-gray-500 mt-2 mb-7">
                    Introduce yourself to readers and create your
                    own author page.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="block font-semibold text-sm mb-2">
                            Author Cover Image
                        </label>

                        <label className="block cursor-pointer">
                            <div className="h-44 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50">
                                {coverPreview ? (
                                    <img
                                        src={coverPreview}
                                        alt="Author cover"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <ImagePlus className="mx-auto mb-2" />
                                        Choose cover image
                                    </div>
                                )}
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Username
                        </label>

                        <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="e.g. islamicwriter"
                            className="w-full border rounded-lg p-3"
                            required
                        />

                        <p className="text-xs text-gray-400 mt-1">
                            Your public address will use this username.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Display Name
                        </label>

                        <input
                            name="display_name"
                            value={form.display_name}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Specialization
                        </label>

                        <input
                            name="specialization"
                            value={form.specialization}
                            onChange={handleChange}
                            placeholder="e.g. Islamic Studies"
                            className="w-full border rounded-lg p-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Biography
                        </label>

                        <textarea
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Tell readers about yourself..."
                            className="w-full border rounded-lg p-3 resize-y"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Website
                        </label>

                        <input
                            type="url"
                            name="website"
                            value={form.website}
                            onChange={handleChange}
                            placeholder="https://example.com"
                            className="w-full border rounded-lg p-3"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg p-3 disabled:opacity-50"
                    >
                        {saving
                            ? "Creating Profile..."
                            : "Create Author Profile"}
                    </button>

                </form>
            </div>
        </div>
    );
}