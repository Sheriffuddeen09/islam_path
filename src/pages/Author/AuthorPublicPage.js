import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api";
import { BookOpen, Eye, UserRound } from "lucide-react";

export default function AuthorPublicPage() {
    const { username } = useParams();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const loadAuthor = async () => {
            try {
                const response = await api.get(`/authors/${username}`);
                setData(response.data);
            } catch (error) {
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        loadAuthor();
    }, [username]);

    if (loading) {
        return (
            <div className="p-10 text-center">
                Loading author...
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold">
                    Author not found
                </h2>
            </div>
        );
    }

    const { profile, articles, stats } = data;

    const coverUrl = profile.cover_image
        ? `http://localhost:8000/storage/${profile.cover_image}`
        : null;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">

                <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="h-64 bg-gray-200">
                        {coverUrl && (
                            <img
                                src={coverUrl}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3">
                            <UserRound
                                className="text-green-600"
                                size={30}
                            />

                            <div>
                                <h1 className="text-2xl font-bold">
                                    {profile.display_name}
                                </h1>

                                <p className="text-gray-500 text-sm">
                                    @{profile.username}
                                </p>
                            </div>
                        </div>

                        {profile.specialization && (
                            <p className="text-green-700 font-semibold mt-4">
                                {profile.specialization}
                            </p>
                        )}

                        {profile.bio && (
                            <p className="text-gray-600 mt-4 whitespace-pre-line">
                                {profile.bio}
                            </p>
                        )}

                        {profile.website && (
                            <a
                                href={profile.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-green-600 inline-block mt-3"
                            >
                                Visit Website
                            </a>
                        )}

                        <div className="flex gap-8 mt-6 border-t pt-5">
                            <div>
                                <strong>{stats.articles}</strong>
                                <p className="text-xs text-gray-500">
                                    Published Articles
                                </p>
                            </div>

                            <div>
                                <strong>{stats.views}</strong>
                                <p className="text-xs text-gray-500">
                                    Article Views
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <h2 className="text-xl font-bold mb-5">
                        Articles by {profile.display_name}
                    </h2>

                    {!articles.data?.length ? (
                        <p className="text-gray-500">
                            No published articles yet.
                        </p>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-5">
                            {articles.data.map((article) => (
                                <Link
                                    key={article.id}
                                    to={`/authors/${profile.username}/articles/${article.slug}`}
                                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                                >
                                    {article.cover_image && (
                                        <img
                                            src={`http://localhost:8000/storage/${article.cover_image}`}
                                            alt=""
                                            className="w-full h-48 object-cover"
                                        />
                                    )}

                                    <div className="p-5">
                                        {article.category && (
                                            <span className="text-xs text-green-600 font-semibold">
                                                {article.category}
                                            </span>
                                        )}

                                        <h3 className="font-bold text-lg mt-2">
                                            {article.title}
                                        </h3>

                                        <p className="text-gray-500 text-sm mt-2">
                                            {article.excerpt}
                                        </p>

                                        <div className="flex gap-2 items-center text-gray-400 text-xs mt-4">
                                            <BookOpen size={14} />
                                            Read Article

                                            <Eye size={14} className="ml-3" />
                                            {article.views} views
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}