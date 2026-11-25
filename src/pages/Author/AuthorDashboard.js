import React, { useEffect, useState } from "react";
import api from "../../api";
import toast from "react-hot-toast";
import {
    FileText,
    Eye,
    Edit,
    Trash2,
    Plus,
    Save,
    Loader2,
} from "lucide-react";

const emptyArticle = {
    title: "",
    excerpt: "",
    content: "",
    category: "",
    status: "draft",
};

export default function AuthorDashboard() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({});
    const [articles, setArticles] = useState([]);

    const [showArticleForm, setShowArticleForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [articleForm, setArticleForm] = useState(emptyArticle);
    const [articleCover, setArticleCover] = useState(null);

    const [profileForm, setProfileForm] = useState({
        username: "",
        display_name: "",
        bio: "",
        website: "",
        specialization: "",
    });

    const [profileCover, setProfileCover] = useState(null);

    const loadDashboard = async () => {
        try {
            const response = await api.get("/author/dashboard");

            setProfile(response.data.profile);
            setStats(response.data.stats);
            setArticles(response.data.articles?.data || []);

            setProfileForm({
                username: response.data.profile.username || "",
                display_name: response.data.profile.display_name || "",
                bio: response.data.profile.bio || "",
                website: response.data.profile.website || "",
                specialization:
                    response.data.profile.specialization || "",
            });
        } catch (error) {
            if (error.response?.status === 409) {
                toast.error(
                    "Complete your author profile before opening the dashboard."
                );
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Unable to load author dashboard."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const updateProfile = async (e) => {
        e.preventDefault();

        const data = new FormData();

        Object.entries(profileForm).forEach(([key, value]) => {
            data.append(key, value || "");
        });

        if (profileCover) {
            data.append("cover_image", profileCover);
        }

        // Laravel accepts POST with _method=PUT for multipart forms.
        data.append("_method", "PUT");

        try {
            setSaving(true);

            const response = await api.post(
                "/author/profile",
                data
            );

            setProfile(response.data.profile);
            setProfileCover(null);

            toast.success(response.data.message);
        } catch (error) {
            const errors = error.response?.data?.errors;

            if (errors) {
                Object.values(errors).flat().forEach(toast.error);
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Unable to update profile."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const openNewArticle = () => {
        setEditingId(null);
        setArticleForm(emptyArticle);
        setArticleCover(null);
        setShowArticleForm(true);
    };

    const openEditArticle = (article) => {
        setEditingId(article.id);

        setArticleForm({
            title: article.title || "",
            excerpt: article.excerpt || "",
            content: article.content || "",
            category: article.category || "",
            status: article.status || "draft",
        });

        setArticleCover(null);
        setShowArticleForm(true);
    };

    const saveArticle = async (e) => {
        e.preventDefault();

        const data = new FormData();

        Object.entries(articleForm).forEach(([key, value]) => {
            data.append(key, value || "");
        });

        if (articleCover) {
            data.append("cover_image", articleCover);
        }

        if (editingId) {
            data.append("_method", "PUT");
        }

        try {
            setSaving(true);

            const url = editingId
                ? `/author/articles/${editingId}`
                : "/author/articles";

            const response = await api.post(url, data);

            toast.success(response.data.message);

            setShowArticleForm(false);
            setEditingId(null);
            setArticleForm(emptyArticle);
            setArticleCover(null);

            await loadDashboard();
        } catch (error) {
            const errors = error.response?.data?.errors;

            if (errors) {
                Object.values(errors).flat().forEach(toast.error);
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Unable to save article."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const deleteArticle = async (id) => {
        if (!window.confirm("Delete this article permanently?")) {
            return;
        }

        try {
            await api.delete(`/author/articles/${id}`);

            toast.success("Article deleted successfully.");

            await loadDashboard();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to delete article."
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" />
                Loading author dashboard...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-8 text-center">
                <h2 className="font-bold text-xl">
                    Author profile not available
                </h2>
                <p className="text-gray-500 mt-2">
                    Complete your author setup first.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">

                <div className="flex flex-wrap justify-between items-center gap-4 mb-7">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Author Dashboard
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Manage your author profile and articles.
                        </p>
                    </div>

                    <button
                        onClick={openNewArticle}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg"
                    >
                        <Plus size={18} />
                        Create Article
                    </button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        {
                            label: "Total Articles",
                            value: stats.articles || 0,
                            icon: FileText,
                        },
                        {
                            label: "Published",
                            value: stats.published || 0,
                            icon: Save,
                        },
                        {
                            label: "Drafts",
                            value: stats.drafts || 0,
                            icon: Edit,
                        },
                        {
                            label: "Total Views",
                            value: stats.views || 0,
                            icon: Eye,
                        },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="bg-white rounded-xl shadow-sm p-5"
                        >
                            <item.icon className="text-green-600 mb-3" />
                            <p className="text-gray-500 text-sm">
                                {item.label}
                            </p>
                            <h2 className="text-2xl font-bold">
                                {item.value}
                            </h2>
                        </div>
                    ))}
                </div>

                {/* Profile editor */}
                <div className="bg-white rounded-xl shadow-sm p-5 mb-8">
                    <h2 className="text-lg font-bold mb-5">
                        Edit Author Profile
                    </h2>

                    <form
                        onSubmit={updateProfile}
                        className="grid md:grid-cols-2 gap-4"
                    >
                        {[
                            ["username", "Username"],
                            ["display_name", "Display Name"],
                            ["specialization", "Specialization"],
                            ["website", "Website"],
                        ].map(([name, label]) => (
                            <div key={name}>
                                <label className="block text-sm font-semibold mb-2">
                                    {label}
                                </label>

                                <input
                                    name={name}
                                    value={profileForm[name]}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            [name]: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg p-3"
                                    required={
                                        name === "username" ||
                                        name === "display_name"
                                    }
                                />
                            </div>
                        ))}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-2">
                                Biography
                            </label>

                            <textarea
                                rows={4}
                                value={profileForm.bio}
                                onChange={(e) =>
                                    setProfileForm({
                                        ...profileForm,
                                        bio: e.target.value,
                                    })
                                }
                                className="w-full border rounded-lg p-3"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-2">
                                Change Cover Image
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setProfileCover(e.target.files?.[0] || null)
                                }
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button
                                disabled={saving}
                                className="bg-green-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Update Profile"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Article list */}
                <div className="bg-white rounded-xl shadow-sm p-5">
                    <h2 className="text-lg font-bold mb-5">
                        My Articles
                    </h2>

                    {articles.length === 0 ? (
                        <p className="text-gray-500 py-8 text-center">
                            You haven't created any articles yet.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {articles.map((article) => (
                                <div
                                    key={article.id}
                                    className="border rounded-xl p-4 flex flex-wrap justify-between gap-4"
                                >
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold">
                                            {article.title}
                                        </h3>

                                        <p className="text-gray-500 text-sm mt-1">
                                            {article.excerpt}
                                        </p>

                                        <div className="flex flex-wrap gap-3 text-xs mt-3">
                                            <span className="capitalize">
                                                {article.status}
                                            </span>

                                            <span>
                                                {article.views} views
                                            </span>

                                            {article.category && (
                                                <span>
                                                    {article.category}
                                                </span>
                                            )}
                                        </div>

                                        {article.status === "published" && (
                                            <a
                                                href={`/authors/${profile.username}/articles/${article.slug}`}
                                                className="text-green-600 text-sm mt-2 inline-block"
                                            >
                                                View article
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                openEditArticle(article)
                                            }
                                            className="p-2 rounded-lg bg-blue-50 text-blue-600"
                                            title="Edit article"
                                        >
                                            <Edit size={18} />
                                        </button>

                                        <button
                                            onClick={() =>
                                                deleteArticle(article.id)
                                            }
                                            className="p-2 rounded-lg bg-red-50 text-red-600"
                                            title="Delete article"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Article form */}
            {showArticleForm && (
                <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 my-auto">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold">
                                {editingId ? "Edit Article" : "Create Article"}
                            </h2>

                            <button
                                onClick={() => setShowArticleForm(false)}
                                className="text-gray-500 text-2xl"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={saveArticle} className="space-y-4">
                            <input
                                value={articleForm.title}
                                onChange={(e) =>
                                    setArticleForm({
                                        ...articleForm,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="Article title"
                                className="w-full border rounded-lg p-3"
                                required
                            />

                            <input
                                value={articleForm.category}
                                onChange={(e) =>
                                    setArticleForm({
                                        ...articleForm,
                                        category: e.target.value,
                                    })
                                }
                                placeholder="Category"
                                className="w-full border rounded-lg p-3"
                            />

                            <textarea
                                value={articleForm.excerpt}
                                onChange={(e) =>
                                    setArticleForm({
                                        ...articleForm,
                                        excerpt: e.target.value,
                                    })
                                }
                                placeholder="Short article description"
                                rows={2}
                                className="w-full border rounded-lg p-3"
                            />

                            <textarea
                                value={articleForm.content}
                                onChange={(e) =>
                                    setArticleForm({
                                        ...articleForm,
                                        content: e.target.value,
                                    })
                                }
                                placeholder="Write your article..."
                                rows={12}
                                className="w-full border rounded-lg p-3"
                                required
                            />

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Article Cover
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setArticleCover(
                                            e.target.files?.[0] || null
                                        )
                                    }
                                />
                            </div>

                            <select
                                value={articleForm.status}
                                onChange={(e) =>
                                    setArticleForm({
                                        ...articleForm,
                                        status: e.target.value,
                                    })
                                }
                                className="w-full border rounded-lg p-3"
                            >
                                <option value="draft">Save as Draft</option>
                                <option value="published">Publish</option>
                            </select>

                            <button
                                disabled={saving}
                                className="w-full bg-green-600 text-white rounded-lg p-3 disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : articleForm.status === "published"
                                        ? "Publish Article"
                                        : "Save Draft"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}